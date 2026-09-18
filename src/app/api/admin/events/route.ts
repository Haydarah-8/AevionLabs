import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { listImportedSourceUrls, listPostSummaries } from "@/lib/blog/store";
import { fetchNewsFeed, fetchSocialFeed } from "@/lib/news-intake/fetch";
import { passesAdminNewsFilter, titleKey } from "@/lib/news-intake/rss";
import {
  NEWS_TOPICS,
  type NewsItem,
  type NewsTopicId,
} from "@/lib/news-intake/types";
import { SOCIAL_PLATFORMS } from "@/lib/news/social";
import { dismissFeedUrl, listDismissedUrls } from "@/lib/news/store-admin";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const topic = (request.nextUrl.searchParams.get("topic") ||
    "all") as NewsTopicId;
  const [feed, socialFeed] = await Promise.all([
    fetchNewsFeed(topic),
    fetchSocialFeed(),
  ]);
  const [importedUrlsList, existing, dismissed] = await Promise.all([
    listImportedSourceUrls(),
    listPostSummaries({ includeDrafts: true }),
    listDismissedUrls(),
  ]);
  const importedUrls = new Set(importedUrlsList);
  const importedTitles = new Set(existing.map((post) => titleKey(post.title)));

  function decorate(items: NewsItem[]) {
    return items
      .filter((item) => !dismissed.has(item.sourceUrl))
      .map((item) => ({
        ...item,
        imported:
          importedUrls.has(item.sourceUrl) ||
          importedTitles.has(titleKey(item.title)),
      }));
  }

  const items = decorate(
    feed.items.filter((item) =>
      passesAdminNewsFilter(
        item.title,
        item.snippet,
        item.sourceUrl,
        topic,
        "",
        item.provider,
      ),
    ),
  );

  const social = Object.fromEntries(
    SOCIAL_PLATFORMS.map(({ id }) => [id, decorate(socialFeed.items[id])]),
  );

  return NextResponse.json({
    items,
    social,
    fetchedAt: feed.fetchedAt,
    sources: feed.sources,
    errors: [...feed.errors, ...socialFeed.errors],
    topics: NEWS_TOPICS,
  });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as {
    action?: string;
    url?: string;
  } | null;
  if (body?.action !== "dismiss" || !body.url?.startsWith("http")) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  try {
    const { clearNewsFeedCache } = await import("@/lib/news-intake/fetch");
    await dismissFeedUrl(body.url);
    clearNewsFeedCache();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to remove" },
      { status: 500 },
    );
  }
}
