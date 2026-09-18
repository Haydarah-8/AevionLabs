import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequest } from "@/lib/admin-auth";
import { imageAllowed } from "@/lib/news-intake/draft";
import { isOutletVideoPage } from "@/lib/news/gallery";
import {
  EXTRACT_FAIL_REASON,
  EXTRACT_PAYWALL_REASON,
} from "@/lib/news-intake/extract";
import { isPaywalledUrl } from "@/lib/news-intake/paywalls";
import { extractNewsItems, resolveNewsItems } from "@/lib/news-intake/pipeline";
import {
  getStoredArticleText,
  saveArticleText,
} from "@/lib/news/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({
  urls: z.array(z.string().startsWith("http")).min(1).max(25),
  topic: z.string().optional(),
});

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Select at least one story." },
      { status: 400 },
    );
  }

  try {
    const items = await resolveNewsItems(
      parsed.data.urls,
      parsed.data.topic || "all",
    );
    const ready: Array<{
      sourceUrl: string;
      title: string;
      excerpt: string;
      paragraphs: string[];
      imageUrl?: string;
      videoUrl?: string;
      source: string;
      publishedAt: string;
      canonicalUrl: string;
      byline?: string;
    }> = [];
    const failed: Array<{
      url: string;
      reason: string;
      title?: string;
      source?: string;
    }> = [];
    const seen = new Set<string>();
    const pending: Array<(typeof items)[number]> = [];

    // Anything already extracted once is served from the database, so the
    // publisher is never fetched twice for the same article.
    const stored = await getStoredArticleText(parsed.data.urls).catch(
      () => new Map<string, never>(),
    );

    for (const url of parsed.data.urls) {
      if (seen.has(url)) {
        failed.push({ url, reason: "Duplicate in this batch" });
        continue;
      }
      seen.add(url);

      const cached = stored.get(url);
      /**
       * A video page whose stored copy has no video is not fully cached.
       *
       * Text was cached before the playable source was ever resolved, so
       * trusting the cache here would serve a video article with no video for
       * ever. Re-reading the page fills the gap once and saves it, so the next
       * open is cached and complete.
       */
      const cacheIsComplete =
        cached && (cached.videoUrl || !isOutletVideoPage(url));
      if (cached && cacheIsComplete) {
        ready.push({
          sourceUrl: url,
          title: cached.title,
          excerpt: cached.excerpt ?? "",
          paragraphs: cached.content.split(/\n{2,}/).filter(Boolean),
          imageUrl: imageAllowed(cached.imageUrl ?? undefined)
            ? (cached.imageUrl ?? undefined)
            : undefined,
          source: cached.source,
          publishedAt: cached.publishedAt,
          canonicalUrl: cached.canonicalUrl ?? url,
          byline: cached.author ?? undefined,
          // Prefer the source resolved when the page was read; the feed's own
          // video_url is usually empty for an outlet video page.
          videoUrl:
            cached.videoUrl ??
            items.find((entry) => entry.sourceUrl === url)?.videoUrl,
        });
        continue;
      }

      if (isPaywalledUrl(url)) {
        failed.push({ url, reason: EXTRACT_PAYWALL_REASON });
        continue;
      }
      const item = items.find((entry) => entry.sourceUrl === url);
      if (!item) {
        failed.push({ url, reason: "Story is no longer in the live feed" });
        continue;
      }
      pending.push(item);
    }

    const extracted = await extractNewsItems(pending);
    for (const { item, article, reason } of extracted) {
      if (!article) {
        failed.push({
          url: item.sourceUrl,
          reason: reason || EXTRACT_FAIL_REASON,
          title: item.title,
          source: item.source,
        });
        continue;
      }
      ready.push({
        sourceUrl: item.sourceUrl,
        title: article.title.trim() || item.title,
        excerpt: article.excerpt,
        paragraphs: article.paragraphs,
        imageUrl: imageAllowed(article.imageUrl)
          ? article.imageUrl
          : imageAllowed(item.imageUrl)
            ? item.imageUrl
            : undefined,
        videoUrl: article.videoUrl || item.videoUrl,
        source: item.source,
        publishedAt: item.publishedAt,
        canonicalUrl: article.canonicalUrl,
        byline: article.byline,
      });
    }

    // Write the new text back so the next read is free.
    const fresh = ready.filter((entry) => !stored.has(entry.sourceUrl));
    if (fresh.length) {
      void saveArticleText(
        fresh.map((entry) => ({
          sourceUrl: entry.sourceUrl,
          paragraphs: entry.paragraphs,
          excerpt: entry.excerpt,
          imageUrl: entry.imageUrl,
          author: entry.byline,
          videoUrl: entry.videoUrl,
        })),
      ).catch(() => undefined);
    }

    return NextResponse.json({
      ready,
      failed,
      fromStore: ready.length - fresh.length,
    });
  } catch (err) {
    console.error("[admin/events] preview:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to preview articles",
      },
      { status: 500 },
    );
  }
}
