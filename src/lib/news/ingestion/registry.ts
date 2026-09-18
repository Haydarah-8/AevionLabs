import { rememberNewsItems, clearNewsFeedCache } from "@/lib/news-intake/fetch";
import {
  enrichMissingVideos,
  fetchText,
  parseRss,
  passesAdminNewsFilter,
} from "@/lib/news-intake/rss";
import { isScrapeSource, scrapeSourceItems } from "@/lib/news-intake/scrape";
import type { NewsItem } from "@/lib/news-intake/types";
import { circuitOpen, withBackoff } from "@/lib/news/ingestion/retry";
import { canonicalUrl, hostnameFromUrl } from "@/lib/news/normalizer/sanitize";
import { scoreArticle } from "@/lib/news/scoring";
import { socialPlatformFromUrl } from "@/lib/news/social";
import {
  isAggregatorFeed,
  shouldExcludeFromAdminFeed,
  type NewsSourceRow,
} from "@/lib/news/sources/registry";
import { clusterArticle } from "@/lib/news/stories/cluster";
import { listRecentForDedup } from "@/lib/news/store";
import { listNewsSources, logCrawlJob } from "@/lib/news/store-admin";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

/** One story stored for the first time by a run. */
export type NewArrival = {
  url: string;
  title: string;
  source: string;
  publishedAt: string;
  category: string;
};

export type RegistryIngestResult = {
  received: number;
  accepted: number;
  /** Stored for the first time by this run. */
  created: number;
  /** Already in the database; the feed listed them again. */
  updated: number;
  /**
   * The new arrivals themselves, newest first and capped.
   *
   * The desk shows these apart from everything else, so a scrape answers
   * "what actually came in" rather than "how many rows were touched".
   */
  newItems: NewArrival[];
  scrapedAt: string;
  /** Feeds crawled this run, and how many were eligible. */
  crawled: number;
  enabled: number;
};

type Discovered = {
  source: NewsSourceRow;
  title: string;
  url: string;
  snippet: string;
  publishedAt: string;
  imageUrl?: string;
  videoUrl?: string;
};

type FeedOutcome = {
  source: NewsSourceRow;
  items: Discovered[];
  ok: boolean;
  skipped: boolean;
};

const ARTICLE_FIELDS =
  "title, source_name, source_url, canonical_url, description, excerpt, image_url, video_url, published_at, category";

async function feedItems(source: NewsSourceRow): Promise<FeedOutcome> {
  if (!source.enabled || isAggregatorFeed(source)) {
    return { source, items: [], ok: false, skipped: true };
  }
  if (circuitOpen(source.failure_count, source.last_failure_at)) {
    return { source, items: [], ok: false, skipped: true };
  }
  try {
    const parsed = isScrapeSource(source)
      ? await withBackoff(
          () => scrapeSourceItems(source, "all"),
          source.retry_count ?? 2,
        )
      : parseRss(
          await withBackoff(
            () => fetchText(source.rss_url as string),
            source.retry_count ?? 2,
          ),
          {
            source: source.name,
            provider: source.id,
            topic: "all",
          },
        );
    const items = parsed
      .filter(
        (item) =>
          !shouldExcludeFromAdminFeed(item.sourceUrl) &&
          passesAdminNewsFilter(
            item.title,
            item.snippet,
            item.sourceUrl,
            "all",
            "",
            source.id,
          ),
      )
      .map((item) => ({
        source,
        title: item.title,
        url: canonicalUrl(item.sourceUrl) || item.sourceUrl,
        snippet: item.snippet,
        publishedAt: item.publishedAt,
        imageUrl: item.imageUrl,
        videoUrl: item.videoUrl,
      }));
    return { source, items, ok: true, skipped: false };
  } catch {
    return { source, items: [], ok: false, skipped: false };
  }
}

function toNewsItem(
  row: {
    title: string;
    source_name: string | null;
    source_url: string;
    description: string | null;
    excerpt: string | null;
    image_url: string | null;
    video_url?: string | null;
    published_at: string;
  },
  sourceUrl: string,
): NewsItem {
  return {
    id: `live:${sourceUrl}`,
    title: row.title,
    source: row.source_name || "Source",
    sourceUrl,
    publishedAt: row.published_at,
    snippet: row.excerpt || row.description || "",
    imageUrl: row.image_url || undefined,
    videoUrl: row.video_url || undefined,
    topic: "all",
    provider: "rss",
  };
}

/**
 * How many feeds one run may crawl.
 *
 * A full sweep of every enabled feed takes about three minutes, almost all of
 * it in the per-article database round-trips rather than the fetching, and the
 * cron route is capped at 60 seconds — so the unbounded version could never
 * finish in production. Each run now takes the stalest feeds that are actually
 * due, and the schedule sweeps the rest on the following ticks.
 */
const FEEDS_PER_RUN = Number(process.env.NEWS_FEEDS_PER_RUN ?? 15);

/** Matches the external_id column; the url is truncated to it on write. */
const EXTERNAL_ID_MAX = 500;

/** Feeds whose crawl interval has elapsed, stalest first. */
export function dueSources<
  T extends {
    enabled: boolean;
    crawl_interval: number | null;
    last_crawled_at: string | null;
  },
>(sources: T[], limit: number, now = Date.now()): T[] {
  return sources
    .filter((source) => {
      if (!source.enabled) return false;
      if (!source.last_crawled_at) return true;
      const last = Date.parse(source.last_crawled_at);
      if (Number.isNaN(last)) return true;
      // crawl_interval is in minutes.
      const interval = (source.crawl_interval ?? 60) * 60 * 1000;
      return now - last >= interval;
    })
    .sort((a, b) => {
      // Never-crawled first, then oldest crawl first, so nothing starves.
      const left = a.last_crawled_at ? Date.parse(a.last_crawled_at) : 0;
      const right = b.last_crawled_at ? Date.parse(b.last_crawled_at) : 0;
      return left - right;
    })
    .slice(0, Math.max(1, limit));
}

export async function ingestRegistryRss(
  options: {
    limit?: number;
    /**
     * How many article pages to open while ingesting, to fill in a video the
     * feed did not carry.
     *
     * Forty by default, which is right when a person is watching and wants the
     * result complete. It is wrong for the cron: reading forty pages inside
     * the feed job is the page-reading work that /api/cron/news/enrich exists
     * to do, done a second time and inside a different 60-second ceiling. That
     * is what made the first authorised cron call return 504.
     *
     * Set it to 0 there. Nothing is lost — the enrich run that follows reads
     * the same pages, with a budget, a retry and a record of what it found.
     */
    videoLookups?: number;
  } = {},
): Promise<RegistryIngestResult> {
  const started = Date.now();
  const scrapedAt = new Date().toISOString();
  clearNewsFeedCache();
  const all = await listNewsSources();
  const sources = dueSources(all, options.limit ?? FEEDS_PER_RUN);
  const outcomes = await Promise.all(
    sources.map((source) => feedItems(source)),
  );
  const merged = new Map<string, Discovered>();
  for (const outcome of outcomes) {
    for (const item of outcome.items) {
      if (!item.url || shouldExcludeFromAdminFeed(item.url)) continue;
      if (!merged.has(item.url)) merged.set(item.url, item);
    }
  }
  const items = [...merged.values()];
  const videoLookups = options.videoLookups ?? 40;
  if (videoLookups > 0) {
    await enrichMissingVideos(
      items.filter((item) => !socialPlatformFromUrl(item.url)),
      (item) => item.url,
      videoLookups,
    );
  }
  const admin = getSupabaseAdmin();

  /**
   * Which of these we had already stored, decided before anything is written.
   *
   * The write is an upsert, so afterwards a brand new story and one we have
   * carried for a week look identical. Asking first is the only way to tell
   * the desk what actually arrived this run — otherwise every scrape reports
   * a few hundred articles and none of them mean anything.
   */
  const knownExternalIds = new Set<string>();
  for (let i = 0; i < items.length; i += 100) {
    const chunk = items
      .slice(i, i + 100)
      .map((item) => item.url.slice(0, EXTERNAL_ID_MAX));
    if (!chunk.length) continue;
    const { data } = await admin
      .from("news_articles")
      .select("external_id")
      .in("external_id", chunk);
    for (const row of data ?? [])
      knownExternalIds.add(String(row.external_id));
  }

  const existing = await listRecentForDedup();
  const { data: storyRows } = await admin
    .from("news_stories")
    .select("*")
    .order("last_updated_at", { ascending: false })
    .limit(200);
  const stories = (storyRows ?? []).map((row) => ({
    id: row.id as string,
    headline: row.headline as string,
    summary: row.summary as string,
    category: row.category as string,
    source_count: Number(row.source_count),
    importance_score: Number(row.importance_score),
    breaking_score: Number(row.breaking_score),
    duplicate_group_id: (row.duplicate_group_id as string) || null,
  }));

  let accepted = 0;
  /** Stories that did not exist before this run, newest first. */
  const created: Array<{
    url: string;
    title: string;
    source: string;
    publishedAt: string;
    category: string;
  }> = [];
  let updated = 0;
  for (const item of items) {
    const clustered = clusterArticle({
      title: item.title,
      description: item.snippet,
      canonicalUrl: item.url,
      sourceUrl: item.url,
      externalId: item.url,
      provider: isScrapeSource(item.source) ? "scrape" : "rss",
      publishedAt: item.publishedAt,
      category: item.source.category,
      trustScore: item.source.trust_score,
      existing,
      stories,
    });
    if (clustered.created) {
      await admin.from("news_stories").insert({
        id: clustered.story.id,
        headline: clustered.story.headline,
        summary: clustered.story.summary,
        category: clustered.story.category,
        source_count: 1,
        importance_score: clustered.story.importance_score,
        breaking_score: clustered.story.breaking_score,
        duplicate_group_id: clustered.story.id,
      });
      stories.unshift(clustered.story);
    } else {
      await admin
        .from("news_stories")
        .update({
          source_count: clustered.story.source_count,
          breaking_score: clustered.story.breaking_score,
          last_updated_at: scrapedAt,
        })
        .eq("id", clustered.story.id);
      const index = stories.findIndex(
        (story) => story.id === clustered.story.id,
      );
      if (index >= 0) stories[index] = clustered.story;
      else stories.unshift(clustered.story);
    }
    const scores = scoreArticle({
      publishedAt: item.publishedAt,
      sourceDomain: item.source.domain,
      title: item.title,
      description: item.snippet,
      independentSources: clustered.story.source_count,
      recentInGroup: clustered.story.source_count,
    });
    const externalId = item.url.slice(0, EXTERNAL_ID_MAX);
    const isNew = !knownExternalIds.has(externalId);

    const payload: Record<string, unknown> = {
      external_id: externalId,
      provider: isScrapeSource(item.source) ? "scrape" : "rss",
      source_id: item.source.id,
      source_name: item.source.name,
      source_domain: hostnameFromUrl(item.url) || item.source.domain,
      source_url: item.url,
      canonical_url: item.url,
      title: item.title.slice(0, 400),
      description: item.snippet.slice(0, 800),
      published_at: item.publishedAt,
      discovered_at: scrapedAt,
      category: item.source.category,
      language: "en",
      duplicate_group_id:
        clustered.story.duplicate_group_id || clustered.story.id,
      story_id: clustered.story.id,
      status: "visible",
      is_breaking: scores.isBreaking,
      relevance_score: scores.relevance,
      freshness_score: scores.freshness,
      engagement_score: scores.engagement,
      updated_at: scrapedAt,
    };

    /**
     * Only a first sighting may write the fields the enricher owns.
     *
     * This is an upsert, so writing `content: ""` and `video_type: null`
     * unconditionally erased the extracted text and the video verdict of every
     * article each time its feed was polled — and because a null video_type is
     * exactly what puts a row back in the enrichment queue, the same pages
     * would be re-fetched for ever without the stored result ever surviving.
     */
    if (isNew) {
      payload.content = "";
      payload.excerpt = item.snippet.slice(0, 800);
      payload.image_url = item.imageUrl || null;
      payload.video_url = item.videoUrl || null;
      payload.video_type = item.videoUrl ? "url" : null;
    } else if (item.imageUrl) {
      // A late-arriving thumbnail is still worth taking; text and video are not
      // touched, since the stored ones came from reading the page itself.
      payload.image_url = item.imageUrl;
    }

    const { error } = await admin
      .from("news_articles")
      .upsert(payload, { onConflict: "provider,external_id" });
    if (!error) {
      accepted += 1;
      if (isNew) {
        knownExternalIds.add(externalId);
        created.push({
          url: item.url,
          title: item.title,
          source: item.source.name,
          publishedAt: item.publishedAt,
          category: item.source.category,
        });
      } else {
        updated += 1;
      }
      existing.unshift({
        id: "pending",
        title: item.title,
        canonical_url: item.url,
        source_url: item.url,
        external_id: item.url,
        provider: isScrapeSource(item.source) ? "scrape" : "rss",
        published_at: item.publishedAt,
        duplicate_group_id:
          clustered.story.duplicate_group_id || clustered.story.id,
      });
    }
  }

  for (const outcome of outcomes) {
    if (outcome.skipped) continue;
    await admin
      .from("news_sources")
      .update({
        last_crawled_at: scrapedAt,
        last_success_at: outcome.ok
          ? scrapedAt
          : outcome.source.last_success_at,
        last_failure_at: outcome.ok
          ? outcome.source.last_failure_at
          : scrapedAt,
        failure_count: outcome.ok ? 0 : outcome.source.failure_count + 1,
        updated_at: scrapedAt,
      })
      .eq("id", outcome.source.id);
  }

  await logCrawlJob({
    job: "ingestRegistryRss",
    status: "ok",
    items: accepted,
    duration_ms: Date.now() - started,
  });

  return {
    received: items.length,
    accepted,
    /** Stories stored for the first time by this run. */
    created: created.length,
    /** Stories we already had; the feed simply listed them again. */
    updated,
    /** The new arrivals themselves, so the desk can show them on their own. */
    newItems: created
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .slice(0, 60),
    scrapedAt,
    crawled: sources.length,
    enabled: all.filter((row) => row.enabled).length,
  };
}

export async function newsItemsFromArticles(
  urls: string[],
): Promise<NewsItem[]> {
  const unique = [...new Set(urls)].slice(0, 40);
  if (!unique.length) return [];
  const admin = getSupabaseAdmin();
  const { data: bySource } = await admin
    .from("news_articles")
    .select(ARTICLE_FIELDS)
    .in("source_url", unique)
    .limit(40);
  const rows = [...(bySource ?? [])];
  const found = new Set(rows.map((row) => row.source_url as string));
  const rest = unique.filter((url) => !found.has(url));
  if (rest.length) {
    const { data: byCanonical } = await admin
      .from("news_articles")
      .select(ARTICLE_FIELDS)
      .in("canonical_url", rest)
      .limit(40);
    rows.push(...(byCanonical ?? []));
  }
  const items: NewsItem[] = [];
  for (const url of unique) {
    const row = rows.find(
      (entry) => entry.source_url === url || entry.canonical_url === url,
    );
    if (!row) continue;
    items.push(toNewsItem(row, url));
  }
  rememberNewsItems(items);
  return items;
}
