import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequest } from "@/lib/admin-auth";
import {
  createPost,
  findPostBySourceUrl,
  listPostSummaries,
} from "@/lib/blog/store";
import { newsItemToDraft } from "@/lib/news-intake/draft";
import {
  EXTRACT_FAIL_REASON,
  EXTRACT_PAYWALL_REASON,
} from "@/lib/news-intake/extract";
import { isPaywalledUrl } from "@/lib/news-intake/paywalls";
import { extractNewsItems, resolveNewsItems } from "@/lib/news-intake/pipeline";
import { titleKey } from "@/lib/news-intake/rss";

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
    const existing = await listPostSummaries({ includeDrafts: true });
    const titles = new Set(existing.map((post) => titleKey(post.title)));
    const created: Array<{ id: string; title: string; slug: string }> = [];
    const skipped: Array<{ url: string; reason: string }> = [];
    const seen = new Set<string>();
    const pending: Array<(typeof items)[number]> = [];

    for (const url of parsed.data.urls) {
      if (seen.has(url)) {
        skipped.push({ url, reason: "Duplicate in this batch" });
        continue;
      }
      seen.add(url);
      if (isPaywalledUrl(url)) {
        skipped.push({ url, reason: EXTRACT_PAYWALL_REASON });
        continue;
      }
      const item = items.find((entry) => entry.sourceUrl === url);
      if (!item) {
        skipped.push({ url, reason: "Story is no longer in the live feed" });
        continue;
      }
      if (await findPostBySourceUrl(item.sourceUrl)) {
        skipped.push({ url, reason: "Already imported" });
        continue;
      }
      const key = titleKey(item.title);
      if (key && titles.has(key)) {
        skipped.push({
          url,
          reason: "A post with this headline already exists",
        });
        continue;
      }
      pending.push(item);
    }

    const extracted = await extractNewsItems(pending);
    for (const { item, article, reason } of extracted) {
      if (!article) {
        skipped.push({
          url: item.sourceUrl,
          reason: reason || EXTRACT_FAIL_REASON,
        });
        continue;
      }
      const post = await createPost(newsItemToDraft(item, article));
      titles.add(titleKey(post.title));
      created.push({ id: post.id, title: post.title, slug: post.slug });
    }

    return NextResponse.json({ created, skipped });
  } catch (err) {
    console.error("[admin/events] draft:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to create draft articles",
      },
      { status: 500 },
    );
  }
}
