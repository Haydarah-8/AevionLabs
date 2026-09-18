import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequest } from "@/lib/admin-auth";
import { isNewsCategory } from "@/lib/news/categories";
import { ingestRegistryRss } from "@/lib/news/ingestion/registry";
import { ingestDueProviders, ingestProvider } from "@/lib/news/ingestion/run";
import { fetchSocialFeed } from "@/lib/news-intake/fetch";
import { passesAdminNewsFilter } from "@/lib/news-intake/rss";
import type { NewsItem } from "@/lib/news-intake/types";
import { PROVIDER_IDS } from "@/lib/news/providers";
import {
  SOCIAL_PLATFORMS,
  emptySocialGroups,
  groupBySocialPlatform,
} from "@/lib/news/social";
import { shouldExcludeFromAdminFeed } from "@/lib/news/sources/registry";
import {
  getNewsStats,
  listAdminRecentArticles,
  mergeDuplicateGroups,
  setProviderEnabled,
  updateArticle,
} from "@/lib/news/store";
import {
  dismissFeedUrl as hideFeedUrl,
  listDismissedUrls,
  listNewsSources,
  mergeNewsStories,
  updateNewsSource,
} from "@/lib/news/store-admin";
import type { NewsProviderId } from "@/lib/news/types";

const SOCIAL_FETCH_MS = 8000;

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  fallback: T,
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => {
      setTimeout(() => resolve(fallback), ms);
    }),
  ]);
}

export async function handleLiveGet(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const [stats, sources, adminRecent, dismissed, socialFeed] =
      await Promise.all([
        getNewsStats(),
        listNewsSources(),
        listAdminRecentArticles(100),
        listDismissedUrls(),
        withTimeout(fetchSocialFeed(), SOCIAL_FETCH_MS, {
          items: emptySocialGroups<NewsItem>(),
          errors: ["Social feed timed out"],
          fetchedAt: new Date().toISOString(),
        }).catch(() => ({
          items: emptySocialGroups<NewsItem>(),
          errors: [] as string[],
          fetchedAt: new Date().toISOString(),
        })),
      ]);
    const recent = adminRecent.filter(
      (row: {
        source_url: string;
        title: string;
        excerpt?: string | null;
        description?: string | null;
        source_id?: string | null;
      }) =>
        !dismissed.has(row.source_url) &&
        !shouldExcludeFromAdminFeed(row.source_url) &&
        passesAdminNewsFilter(
          row.title,
          row.excerpt || row.description || "",
          row.source_url,
          "all",
          "",
          row.source_id || "",
        ),
    );
    const { news, social: socialFromDb } = groupBySocialPlatform(
      recent,
      (row) => row.source_url,
    );
    type LiveSocialRow = {
      id: string;
      title: string;
      source_name: string;
      category: string;
      published_at: string;
      source_url: string;
      description?: string | null;
      excerpt?: string | null;
      image_url?: string | null;
      video_url?: string | null;
      discovered_at?: string | null;
    };
    const social = emptySocialGroups<LiveSocialRow>();
    for (const { id } of SOCIAL_PLATFORMS) {
      const seen = new Set<string>();
      const extra = socialFeed.items[id].map((item) => ({
        id: item.id,
        title: item.title,
        source_name: item.source,
        category: "World",
        published_at: item.publishedAt,
        source_url: item.sourceUrl,
        description: item.snippet,
        excerpt: item.snippet,
        image_url: item.imageUrl ?? null,
        video_url: item.videoUrl ?? null,
        discovered_at: socialFeed.fetchedAt,
      }));
      for (const row of [...socialFromDb[id], ...extra]) {
        if (
          seen.has(row.source_url) ||
          dismissed.has(row.source_url) ||
          shouldExcludeFromAdminFeed(row.source_url)
        ) {
          continue;
        }
        seen.add(row.source_url);
        social[id].push(row);
      }
    }
    const stamps = [
      ...sources.map((row) => row.last_success_at),
      ...news.map(
        (row: { discovered_at?: string | null }) => row.discovered_at,
      ),
      socialFeed.fetchedAt,
    ].filter((value): value is string => Boolean(value));
    const lastScrapedAt = stamps.length
      ? stamps.sort((a, b) => Date.parse(b) - Date.parse(a))[0]
      : null;
    return NextResponse.json({
      ...stats,
      recent: news,
      social,
      sources,
      lastScrapedAt,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load stats" },
      { status: 500 },
    );
  }
}

const patchSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("update"),
    id: z.string().uuid(),
    status: z.enum(["visible", "hidden"]).optional(),
    is_featured: z.boolean().optional(),
    is_breaking: z.boolean().optional(),
    category: z.string().optional(),
  }),
  z.object({
    action: z.literal("merge"),
    from: z.string().uuid(),
    into: z.string().uuid(),
  }),
  z.object({
    action: z.literal("storyMerge"),
    from: z.string().uuid(),
    into: z.string().uuid(),
  }),
  z.object({
    action: z.literal("provider"),
    id: z.string(),
    enabled: z.boolean(),
  }),
  z.object({
    action: z.literal("source"),
    id: z.string(),
    enabled: z.boolean().optional(),
    crawl_interval: z.number().optional(),
    trust_score: z.number().optional(),
  }),
  z.object({
    action: z.literal("retrySource"),
    id: z.string(),
  }),
  z.object({
    action: z.literal("ingest"),
    provider: z.string().optional(),
  }),
  z.object({
    action: z.literal("scrape"),
  }),
  z.object({
    action: z.literal("dismiss"),
    url: z.string().url(),
    id: z.string().uuid().optional(),
  }),
]);

export async function handleLivePost(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  try {
    const body = parsed.data;
    if (body.action === "update") {
      if (body.category && !isNewsCategory(body.category)) {
        return NextResponse.json(
          { error: "Unknown category" },
          { status: 400 },
        );
      }
      await updateArticle(body.id, {
        status: body.status,
        is_featured: body.is_featured,
        is_breaking: body.is_breaking,
        category: body.category,
      });
      return NextResponse.json({ ok: true });
    }
    if (body.action === "merge") {
      await mergeDuplicateGroups(body.from, body.into);
      return NextResponse.json({ ok: true });
    }
    if (body.action === "storyMerge") {
      await mergeNewsStories(body.from, body.into);
      return NextResponse.json({ ok: true });
    }
    if (body.action === "provider") {
      if (!PROVIDER_IDS.includes(body.id as NewsProviderId)) {
        return NextResponse.json(
          { error: "Unknown provider" },
          { status: 400 },
        );
      }
      await setProviderEnabled(body.id, body.enabled);
      return NextResponse.json({ ok: true });
    }
    if (body.action === "source") {
      await updateNewsSource(body.id, {
        enabled: body.enabled,
        crawl_interval: body.crawl_interval,
        trust_score: body.trust_score,
      });
      return NextResponse.json({ ok: true });
    }
    if (body.action === "retrySource") {
      await updateNewsSource(body.id, { enabled: true });
      return NextResponse.json({ ok: true, retry: true });
    }
    if (body.action === "scrape") {
      const registry = await ingestRegistryRss();
      return NextResponse.json({ ok: true, registry });
    }
    if (body.action === "dismiss") {
      await hideFeedUrl(body.url);
      if (body.id) {
        await updateArticle(body.id, { status: "hidden" });
      }
      return NextResponse.json({ ok: true });
    }
    if (body.provider) {
      if (!PROVIDER_IDS.includes(body.provider as NewsProviderId)) {
        return NextResponse.json(
          { error: "Unknown provider" },
          { status: 400 },
        );
      }
      return NextResponse.json({
        results: [await ingestProvider(body.provider as NewsProviderId)],
      });
    }
    return NextResponse.json({ results: await ingestDueProviders(true) });
  } catch (err) {
    console.error("[admin/live]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Action failed" },
      { status: 500 },
    );
  }
}
