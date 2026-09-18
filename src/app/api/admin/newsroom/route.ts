import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequest } from "@/lib/admin-auth";
import { listImportedSourceUrls, listPostSummaries } from "@/lib/blog/store";
import { fetchNewsFeed, fetchSocialFeed } from "@/lib/news-intake/fetch";
import { passesAdminNewsFilter, titleKey } from "@/lib/news-intake/rss";
import {
  NEWS_TOPICS,
  type NewsItem,
  type NewsTopicId,
} from "@/lib/news-intake/types";
import { countUnenriched, enrichArticles } from "@/lib/news/enrich";
import { ingestRegistryRss } from "@/lib/news/ingestion/registry";
import {
  mergeNewsroomItems,
  newsroomKey,
  newsroomMedia,
  type NewsroomItem,
} from "@/lib/news/newsroom";
import { emptySocialGroups, socialPlatformFromUrl } from "@/lib/news/social";
import {
  isAggregatorFeed,
  shouldExcludeFromAdminFeed,
} from "@/lib/news/sources/registry";
import { listAdminRecentArticles, updateArticle } from "@/lib/news/store";
import {
  dismissFeedUrl,
  listDismissedUrls,
  listNewsSources,
  updateNewsSource,
} from "@/lib/news/store-admin";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** RSSHub is the slowest leg — never let it hold the whole page hostage. */
const SOCIAL_FETCH_MS = 8000;

/**
 * Page reads allowed inside one press of Scrape.
 *
 * Somebody is watching this one, so it is bounded to stay responsive; the
 * 30-minute cron does the same work unattended and clears whatever is left.
 */
const SCRAPE_ENRICH_BATCH = 120;

/**
 * What one press is allowed to spend, and why it is a round rather than a job.
 *
 * The route's ceiling is 60 seconds. A full pass — every feed, then the pages
 * behind whatever is new — measured 1m46s locally, so shipping it as a single
 * request would have produced a button that works on this machine and reports
 * "Scrape failed" on the deployed site, which is the worst of both.
 *
 * So a press is a bounded round and the button keeps pressing until there is
 * nothing left to do. `dueSources` rotates through the registry, so successive
 * rounds reach every feed rather than re-reading the same few.
 *
 * The sizes are measured, not guessed. Eight feeds and a 40s budget produced
 * rounds of 42s, 42s and 54s — inside the ceiling on this machine, and far too
 * close to it once a cold start and a slower hop to Supabase are added. Five
 * feeds and 26s leaves the margin that makes the difference between a button
 * that works and one that works here.
 */
const SCRAPE_FEEDS_PER_ROUND = 5;
const SCRAPE_BUDGET_MS = 26_000;
const SCRAPE_ENRICH_MIN_MS = 6_000;

const STORED_LIMIT = 150;

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T) {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => {
      setTimeout(() => resolve(fallback), ms);
    }),
  ]).catch(() => fallback);
}

type StoredRow = {
  id: string;
  title: string;
  source_name: string;
  source_id?: string | null;
  category: string;
  published_at: string;
  source_url: string;
  description?: string | null;
  excerpt?: string | null;
  image_url?: string | null;
  video_url?: string | null;
  discovered_at?: string | null;
  duplicate_group_id?: string | null;
};

function storedToNewsroom(row: StoredRow, imported: boolean): NewsroomItem {
  const imageUrl = row.image_url || undefined;
  const videoUrl = row.video_url || undefined;
  return {
    key: newsroomKey(row.source_url),
    id: row.id,
    title: row.title,
    snippet: row.excerpt || row.description || "",
    source: row.source_name,
    sourceId: row.source_id || "",
    sourceUrl: row.source_url,
    publishedAt: row.published_at,
    category: row.category || "",
    imageUrl,
    videoUrl,
    platform: socialPlatformFromUrl(row.source_url),
    media: newsroomMedia({ imageUrl, videoUrl }),
    origin: "stored",
    imported,
    storyId: row.duplicate_group_id || null,
  };
}

function liveToNewsroom(item: NewsItem, imported: boolean): NewsroomItem {
  return {
    key: newsroomKey(item.sourceUrl),
    id: null,
    title: item.title,
    snippet: item.snippet || "",
    source: item.source,
    sourceId: item.provider,
    sourceUrl: item.sourceUrl,
    publishedAt: item.publishedAt,
    category: "",
    imageUrl: item.imageUrl,
    videoUrl: item.videoUrl,
    platform: socialPlatformFromUrl(item.sourceUrl),
    media: newsroomMedia(item),
    origin: "live",
    imported,
    storyId: null,
  };
}

export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requested = request.nextUrl.searchParams.get("topic") || "all";
  const topic = (
    NEWS_TOPICS.some((entry) => entry.id === requested) ? requested : "all"
  ) as NewsTopicId;

  try {
    const [
      storedRows,
      sources,
      dismissed,
      feed,
      socialFeed,
      importedUrlList,
      posts,
    ] = await Promise.all([
      listAdminRecentArticles(STORED_LIMIT).catch(() => [] as StoredRow[]),
      listNewsSources().catch(() => []),
      listDismissedUrls().catch(() => new Set<string>()),
      fetchNewsFeed(topic).catch(() => ({
        items: [] as NewsItem[],
        fetchedAt: new Date().toISOString(),
        sources: [] as string[],
        errors: ["Live feed unavailable"],
      })),
      withTimeout(fetchSocialFeed(), SOCIAL_FETCH_MS, {
        items: emptySocialGroups<NewsItem>(),
        errors: ["Social feed timed out"],
        fetchedAt: new Date().toISOString(),
      }),
      listImportedSourceUrls().catch(() => [] as string[]),
      listPostSummaries({ includeDrafts: true }).catch(
        () => [] as Array<{ title: string }>,
      ),
    ]);

    const importedUrls = new Set(importedUrlList.map(newsroomKey));
    const importedTitles = new Set(posts.map((post) => titleKey(post.title)));
    const isImported = (url: string, title: string) =>
      importedUrls.has(newsroomKey(url)) || importedTitles.has(titleKey(title));

    const dropped = (url: string) =>
      dismissed.has(url) || shouldExcludeFromAdminFeed(url);

    const stored = (storedRows as StoredRow[])
      .filter(
        (row) =>
          !dropped(row.source_url) &&
          passesAdminNewsFilter(
            row.title,
            row.excerpt || row.description || "",
            row.source_url,
            "all",
            "",
            row.source_id || "",
          ),
      )
      .map((row) => storedToNewsroom(row, isImported(row.source_url, row.title)));

    const live = feed.items
      .filter(
        (item) =>
          !dropped(item.sourceUrl) &&
          passesAdminNewsFilter(
            item.title,
            item.snippet,
            item.sourceUrl,
            topic,
            "",
            item.provider,
          ),
      )
      .map((item) => liveToNewsroom(item, isImported(item.sourceUrl, item.title)));

    const social = Object.values(socialFeed.items)
      .flat()
      .filter((item) => !dropped(item.sourceUrl))
      .map((item) => liveToNewsroom(item, isImported(item.sourceUrl, item.title)));

    const items = mergeNewsroomItems([stored, live, social]);

    const stamps = [
      ...sources.map((row) => row.last_success_at),
      ...(storedRows as StoredRow[]).map((row) => row.discovered_at),
      socialFeed.fetchedAt,
      feed.fetchedAt,
    ].filter((value): value is string => Boolean(value));

    return NextResponse.json({
      items,
      sources: sources
        .filter((row) => !isAggregatorFeed(row))
        .map((row) => ({
          id: row.id,
          name: row.name,
          domain: row.domain,
          enabled: row.enabled,
          last_success_at: row.last_success_at ?? null,
        })),
      categories: [
        ...new Set(items.map((item) => item.category).filter(Boolean)),
      ].sort(),
      sourceNames: [...new Set(items.map((item) => item.source))].sort(),
      topic,
      fetchedAt: feed.fetchedAt,
      lastScrapedAt: stamps.length
        ? stamps.sort((a, b) => Date.parse(b) - Date.parse(a))[0]
        : null,
      errors: [...feed.errors, ...socialFeed.errors],
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load newsroom" },
      { status: 500 },
    );
  }
}

const postSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("dismiss"),
    urls: z.array(z.string().url()).min(1).max(100),
    ids: z.array(z.string().uuid()).optional(),
  }),
  z.object({
    action: z.literal("source"),
    id: z.string().min(1),
    enabled: z.boolean(),
  }),
  /**
   * `feeds` bounds one round. The button presses this repeatedly rather than
   * once, because the function ceiling is 60s and reading every feed plus the
   * pages behind the new stories does not fit inside it.
   */
  z.object({
    action: z.literal("scrape"),
    feeds: z.number().int().min(1).max(60).optional(),
  }),
]);

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = postSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const body = parsed.data;

    if (body.action === "dismiss") {
      const { clearNewsFeedCache } = await import("@/lib/news-intake/fetch");
      await Promise.all(body.urls.map((url) => dismissFeedUrl(url)));
      await Promise.all(
        (body.ids ?? []).map((id) => updateArticle(id, { status: "hidden" })),
      );
      clearNewsFeedCache();
      return NextResponse.json({ ok: true, dismissed: body.urls.length });
    }

    if (body.action === "source") {
      await updateNewsSource(body.id, { enabled: body.enabled });
      return NextResponse.json({ ok: true });
    }

    const startedAt = Date.now();
    const { clearNewsFeedCache } = await import("@/lib/news-intake/fetch");
    const registry = await ingestRegistryRss({
      limit: body.feeds ?? SCRAPE_FEEDS_PER_ROUND,
    });
    clearNewsFeedCache();

    /**
     * Pressing Scrape reads pages too, not just feeds.
     *
     * A feed gives a headline and a link; the video and the article text only
     * exist on the page. Doing both here means one press produces stories that
     * are already playable and already readable, instead of stories that turn
     * into either only when somebody opens them.
     */
    // Whatever the feeds left of the round goes to reading pages, with a
    // floor: below a few seconds a page read is started and then abandoned,
    // which costs the fetch and stores nothing.
    const remainingMs = SCRAPE_BUDGET_MS - (Date.now() - startedAt);
    const enriched =
      remainingMs < SCRAPE_ENRICH_MIN_MS
        ? null
        : await enrichArticles({
      limit: SCRAPE_ENRICH_BATCH,
      budgetMs: remainingMs,
    }).catch((err) => {
      console.error("[admin/newsroom] enrich:", err);
      return null;
    });

    /**
     * How many pages are still waiting, asked directly rather than inferred.
     *
     * When the feeds use the whole round the enrich step is skipped, and its
     * absence used to read as `remaining: 0` — indistinguishable from a drained
     * queue. The button stops on that, so a busy round could end the run with
     * a backlog still sitting there. One cheap count removes the ambiguity.
     */
    const queued = await countUnenriched().catch(() => 0);

    return NextResponse.json({
      ok: true,
      registry,
      queued,
      enriched: enriched
        ? {
            attempted: enriched.attempted,
            videosFound: enriched.videosFound,
            textSaved: enriched.textSaved,
            unavailable: enriched.unavailable,
            // Pages that had failed before and read this time. Worth saying:
            // it is the difference between a queue and a graveyard.
            recovered: enriched.recovered,
            firecrawlUsed: enriched.firecrawlUsed,
            remaining: enriched.remaining,
          }
        : null,
    });
  } catch (err) {
    console.error("[admin/newsroom]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Action failed" },
      { status: 500 },
    );
  }
}
