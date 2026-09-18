import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { listImportedSourceUrls, listPostSummaries } from "@/lib/blog/store";
import { fetchNewsFeed } from "@/lib/news-intake/fetch";
import { passesAdminNewsFilter, titleKey } from "@/lib/news-intake/rss";
import {
  NEWS_TOPICS,
  type NewsItem,
  type NewsTopicId,
} from "@/lib/news-intake/types";
import { leanForOutlet, type Lean } from "@/lib/news/lean";
import {
  clusterNewsroomItems,
  mergeNewsroomItems,
  newsroomKey,
  newsroomMedia,
  type NewsroomItem,
} from "@/lib/news/newsroom";
import { outletKey } from "@/lib/news/outlet";
import { socialPlatformFromUrl } from "@/lib/news/social";
import {
  isAggregatorFeed,
  shouldExcludeFromAdminFeed,
} from "@/lib/news/sources/registry";
import { listAdminRecentArticles } from "@/lib/news/store";
import { listDismissedUrls, listNewsSources } from "@/lib/news/store-admin";
import { buildTopics } from "@/lib/news/topics";
import {
  buildDomains,
  classifyTopics,
  volumeSeries,
  type ClassifiedTopic,
  type DomainSummary,
} from "@/lib/news/taxonomy";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const STORED_LIMIT = 600;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Building the desk means fetching ~70 live feeds, which takes seconds. This
 * is now the only page in the section, so the same payload is reused briefly
 * rather than rebuilt on every view switch or refresh. "Scrape now" writes to
 * the database and then reloads, so it is never served a stale answer.
 */
const PAYLOAD_TTL_MS = 60 * 1000;
const PAYLOAD_CACHE = new Map<string, { at: number; payload: DeskPayload }>();

export type SourceStatus =
  | "healthy"
  | "stale"
  | "failing"
  | "pending"
  | "disabled";

export type SourceHealth = {
  id: string;
  name: string;
  status: SourceStatus;
  lastSuccessAt: string | null;
  failureCount: number;
  articles: number;
  lean: Lean;
  enabled: boolean;
};

export type DeskPayload = {
  generatedAt: string;
  topic: NewsTopicId;
  items: NewsroomItem[];
  /** Specific, emergent subjects. */
  topics: ClassifiedTopic[];
  /** The fixed subject areas those topics roll up into. */
  domains: DomainSummary[];
  /** Corpus-wide publication volume, for the timeline chart. */
  volume: Array<{ at: number; count: number }>;
  sources: SourceHealth[];
  sourceNames: string[];
  categories: string[];
  corpusLean: Record<Lean, number>;
  totals: {
    topics: number;
    domains: number;
    stories: number;
    articles: number;
    outlets: number;
    fresh: number;
    contested: number;
    last24h: number;
  };
  lastScrapedAt: string | null;
  errors: string[];
};

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

function emptyLean(): Record<Lean, number> {
  return {
    "far-left": 0,
    left: 0,
    "centre-left": 0,
    centre: 0,
    "centre-right": 0,
    right: 0,
    "far-right": 0,
    unrated: 0,
  };
}

function storedToItem(row: StoredRow, imported: boolean): NewsroomItem {
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

function liveToItem(item: NewsItem, imported: boolean): NewsroomItem {
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

/**
 * One endpoint behind the whole desk. It replaces the four that used to sit
 * under Newsroom, Live News, Recent Events and Intelligence: the same corpus
 * feeds the wire list, the story clusters, the intake queue and the topic
 * breakdown, so those views can never disagree with each other.
 */
export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requested = request.nextUrl.searchParams.get("topic") || "all";
  const topic = (
    NEWS_TOPICS.some((entry) => entry.id === requested) ? requested : "all"
  ) as NewsTopicId;

  // "Refresh" in the UI sends fresh=1 to bypass the reuse window.
  const forceFresh = request.nextUrl.searchParams.get("fresh") === "1";

  /**
   * Reading back past the newest page.
   *
   * `offset` is a position in the desk's own ordering: 600 means "the page
   * after the first 600". The desk sends how many stories it already holds, so
   * the archive walks backwards a page at a time instead of the corpus
   * stopping dead at whatever the newest few hundred rows happen to be.
   * Archive reads skip the cache, which only ever holds the front page.
   */
  const offsetParam = Number(request.nextUrl.searchParams.get("offset") ?? "");
  const offset =
    Number.isFinite(offsetParam) && offsetParam > 0 ? Math.floor(offsetParam) : 0;
  const isArchive = offset > 0;

  const cached = PAYLOAD_CACHE.get(topic);
  if (!forceFresh && !isArchive && cached && Date.now() - cached.at < PAYLOAD_TTL_MS) {
    return NextResponse.json(cached.payload);
  }

  try {
    const [storedRows, sources, dismissed, feed, importedUrlList, posts] =
      await Promise.all([
        listAdminRecentArticles(STORED_LIMIT, { offset }).catch(
          () => [] as StoredRow[],
        ),
        listNewsSources().catch(() => []),
        listDismissedUrls().catch(() => new Set<string>()),
        /**
         * The live feed belongs to the front page only.
         *
         * An archive read asks for a page of history; folding today's RSS into
         * it returned the present under a past cursor, so a request for the
         * page after the first 600 came back carrying stories filed this
         * morning and paging backwards never actually moved.
         */
        isArchive
          ? Promise.resolve({
              items: [] as NewsItem[],
              fetchedAt: new Date().toISOString(),
              sources: [] as string[],
              errors: [] as string[],
            })
          : fetchNewsFeed(topic).catch(() => ({
              items: [] as NewsItem[],
              fetchedAt: new Date().toISOString(),
              sources: [] as string[],
              errors: ["Live feed unavailable"],
            })),
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
      .map((row) => storedToItem(row, isImported(row.source_url, row.title)));

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
      .map((item) => liveToItem(item, isImported(item.sourceUrl, item.title)));

    const items = mergeNewsroomItems([stored, live]);
    const clusters = clusterNewsroomItems(items);
    const outletUniverse = new Set(items.map((item) => outletKey(item))).size;
    const topics = classifyTopics(
      buildTopics(clusters, { minStories: 2, limit: 40 }),
      outletUniverse,
    );
    const domains = buildDomains(topics);
    const volume = volumeSeries(clusters, { buckets: 32, hours: 48 });

    const corpusLean = items.reduce((acc, item) => {
      acc[leanForOutlet(item).lean] += 1;
      return acc;
    }, emptyLean());

    const now = Date.now();
    const articlesBySource = new Map<string, number>();
    const leanBySource = new Map<string, Lean>();
    for (const item of items) {
      if (!item.sourceId) continue;
      articlesBySource.set(
        item.sourceId,
        (articlesBySource.get(item.sourceId) ?? 0) + 1,
      );
      if (!leanBySource.has(item.sourceId)) {
        leanBySource.set(item.sourceId, leanForOutlet(item).lean);
      }
    }

    const health: SourceHealth[] = sources
      .filter((source) => !isAggregatorFeed(source))
      .map((source) => {
        const failureCount = source.failure_count ?? 0;
        const lastSuccess = source.last_success_at
          ? Date.parse(source.last_success_at)
          : NaN;
        const age = Number.isNaN(lastSuccess) ? Infinity : now - lastSuccess;

        let status: SourceStatus = "healthy";
        if (!source.enabled) status = "disabled";
        else if (!source.last_success_at && failureCount === 0)
          status = "pending";
        else if (failureCount >= 3 || age > 3 * DAY_MS) status = "failing";
        else if (age > DAY_MS) status = "stale";

        return {
          id: source.id,
          name: source.name,
          status,
          lastSuccessAt: source.last_success_at ?? null,
          failureCount,
          articles: articlesBySource.get(source.id) ?? 0,
          lean:
            leanBySource.get(source.id) ??
            leanForOutlet({
              source: source.name,
              sourceUrl: `https://${source.domain}/`,
            }).lean,
          enabled: source.enabled,
        };
      })
      .sort((a, b) => {
        const rank: Record<SourceStatus, number> = {
          failing: 0,
          stale: 1,
          pending: 2,
          healthy: 3,
          disabled: 4,
        };
        return rank[a.status] - rank[b.status] || b.articles - a.articles;
      });

    const stamps = [
      ...sources.map((row) => row.last_success_at),
      ...(storedRows as StoredRow[]).map((row) => row.discovered_at),
      feed.fetchedAt,
    ].filter((value): value is string => Boolean(value));

    const payload: DeskPayload = {
      generatedAt: new Date().toISOString(),
      topic,
      items,
      topics,
      domains,
      volume,
      sources: health,
      sourceNames: [...new Set(items.map((item) => item.source))].sort(),
      categories: [
        ...new Set(items.map((item) => item.category).filter(Boolean)),
      ].sort(),
      corpusLean,
      totals: {
        topics: topics.length,
        domains: domains.length,
        stories: clusters.length,
        articles: items.length,
        outlets: outletUniverse,
        fresh: items.filter((item) => !item.imported).length,
        contested: topics.filter((entry) => entry.spread >= 3).length,
        last24h: items.filter(
          (item) => now - Date.parse(item.publishedAt) <= DAY_MS,
        ).length,
      },
      lastScrapedAt: stamps.length
        ? stamps.sort((a, b) => Date.parse(b) - Date.parse(a))[0]
        : null,
      errors: feed.errors,
    };

    // An archive page is one slice of history, not the desk's front page —
    // caching it under the topic would serve last Tuesday to the next reader.
    if (!isArchive) PAYLOAD_CACHE.set(topic, { at: Date.now(), payload });
    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load desk" },
      { status: 500 },
    );
  }
}
