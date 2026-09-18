import { isScrapeSource, scrapeSourceItems } from "@/lib/news-intake/scrape";
import {
  isAggregatorFeed,
  PRIMARY_NEWS_SOURCE_IDS,
  SEED_SOURCES,
  shouldExcludeFromAdminFeed,
} from "@/lib/news/sources/registry";
import {
  enrichMissingVideos,
  fetchText,
  parseRss,
  passesAdminNewsFilter,
  titleKey,
} from "@/lib/news-intake/rss";
import {
  NEWS_TOPICS,
  type NewsFeedResult,
  type NewsItem,
  type NewsTopicId,
} from "@/lib/news-intake/types";
import {
  SOCIAL_FEEDS,
  isSocialSource,
  socialPlatformFromUrl,
  type SocialPlatform,
} from "@/lib/news/social";

const CACHE_MS = 10 * 60 * 1000;
const FEED_LIMIT = 200;
const cache = new Map<string, { expires: number; result: NewsFeedResult }>();
const socialCache = new Map<
  string,
  { expires: number; result: SocialFeedResult }
>();
const itemIndex = new Map<string, NewsItem>();

export type SocialFeedResult = {
  items: Record<SocialPlatform, NewsItem[]>;
  errors: string[];
  fetchedAt: string;
};

function topicById(id: string) {
  return NEWS_TOPICS.find((topic) => topic.id === id) ?? NEWS_TOPICS[0];
}

function remember(items: NewsItem[]) {
  for (const item of items) itemIndex.set(item.sourceUrl, item);
}

export function rememberNewsItems(items: NewsItem[]) {
  remember(items);
}

export function clearNewsFeedCache() {
  cache.clear();
  socialCache.clear();
}

export function getCachedItem(url: string): NewsItem | undefined {
  return itemIndex.get(url);
}

function mergeItems(
  groups: NewsItem[][],
  topic: NewsTopicId,
  priorities: Map<string, number>,
): NewsItem[] {
  const byUrl = new Map<string, NewsItem>();
  const byTitle = new Map<string, string>();
  for (const group of groups) {
    for (const item of group) {
      if (shouldExcludeFromAdminFeed(item.sourceUrl)) continue;
      if (
        !passesAdminNewsFilter(
          item.title,
          item.snippet,
          item.sourceUrl,
          topic,
          "",
          item.provider,
        )
      )
        continue;
      if (byUrl.has(item.sourceUrl)) continue;
      const key = titleKey(item.title);
      if (key && byTitle.has(key)) continue;
      byUrl.set(item.sourceUrl, item);
      if (key) byTitle.set(key, item.sourceUrl);
    }
  }
  return [...byUrl.values()].sort((a, b) => {
    const priorityDelta =
      (priorities.get(b.provider) ?? 0) - (priorities.get(a.provider) ?? 0);
    if (priorityDelta !== 0) return priorityDelta;
    if (
      PRIMARY_NEWS_SOURCE_IDS.has(a.provider) !==
      PRIMARY_NEWS_SOURCE_IDS.has(b.provider)
    ) {
      return PRIMARY_NEWS_SOURCE_IDS.has(b.provider) ? 1 : -1;
    }
    return b.publishedAt.localeCompare(a.publishedAt);
  });
}

async function collect(
  label: string,
  errors: string[],
  run: () => Promise<NewsItem[]>,
): Promise<NewsItem[]> {
  try {
    const items = await run();
    return items;
  } catch (err) {
    errors.push(
      `${label}: ${err instanceof Error ? err.message : "request failed"}`,
    );
    return [];
  }
}

async function fromRss(
  url: string,
  meta: { source: string; provider: string; topic: NewsTopicId },
): Promise<NewsItem[]> {
  return parseRss(await fetchText(url), meta);
}

async function registryRss() {
  try {
    const { listNewsSources } = await import("@/lib/news/store-admin");
    return (await listNewsSources()).filter(
      (row) =>
        row.enabled &&
        !isAggregatorFeed(row) &&
        !isSocialSource(row) &&
        (row.rss_url || isScrapeSource(row)),
    );
  } catch {
    return SEED_SOURCES.filter(
      (row) =>
        !isAggregatorFeed(row) &&
        !isSocialSource(row) &&
        (row.rss_url || isScrapeSource(row)),
    );
  }
}

export async function fetchNewsFeed(topicId: string): Promise<NewsFeedResult> {
  const topic = topicById(topicId);
  const cached = cache.get(topic.id);
  if (cached && cached.expires > Date.now()) return cached.result;

  const errors: string[] = [];
  const feeds = await registryRss();
  const priorities = new Map(feeds.map((row) => [row.id, row.priority ?? 0]));
  const sources = [...new Set(feeds.map((row) => row.name))];

  const groups = await Promise.all(
    feeds.map((row) =>
      collect(row.name, errors, () =>
        isScrapeSource(row)
          ? scrapeSourceItems(row, topic.id)
          : fromRss(String(row.rss_url), {
              source: row.name,
              provider: row.id,
              topic: topic.id,
            }),
      ),
    ),
  );

  const items = mergeItems(groups, topic.id, priorities).slice(0, FEED_LIMIT);
  await enrichMissingVideos(
    items.filter((item) => !socialPlatformFromUrl(item.sourceUrl)),
    (item) => item.sourceUrl,
    40,
  );
  remember(items);
  const result: NewsFeedResult = {
    items,
    fetchedAt: new Date().toISOString(),
    sources,
    errors,
  };
  cache.set(topic.id, { expires: Date.now() + CACHE_MS, result });
  return result;
}

export async function fetchSocialFeed(): Promise<SocialFeedResult> {
  const cached = socialCache.get("all");
  if (cached && cached.expires > Date.now()) return cached.result;

  const errors: string[] = [];
  const grouped = {
    youtube: [] as NewsItem[],
    tiktok: [] as NewsItem[],
    instagram: [] as NewsItem[],
    x: [] as NewsItem[],
  };

  const groups = await Promise.all(
    SOCIAL_FEEDS.map((feed) =>
      collect(feed.name, errors, async () => {
        const items = parseRss(await fetchText(feed.rss_url), {
          source: feed.name,
          provider: feed.id,
          topic: "all",
        });
        return items.map((item) => ({
          ...item,
          videoUrl: item.videoUrl || item.sourceUrl,
          provider: feed.id,
        }));
      }),
    ),
  );

  for (const [index, items] of groups.entries()) {
    const fallback = SOCIAL_FEEDS[index].platform;
    for (const item of items) {
      const platform = socialPlatformFromUrl(item.sourceUrl) || fallback;
      grouped[platform].push(item);
    }
  }

  for (const platform of Object.keys(grouped) as SocialPlatform[]) {
    grouped[platform].sort((a, b) =>
      b.publishedAt.localeCompare(a.publishedAt),
    );
  }

  remember(Object.values(grouped).flat());
  const result: SocialFeedResult = {
    items: grouped,
    errors,
    fetchedAt: new Date().toISOString(),
  };
  socialCache.set("all", { expires: Date.now() + CACHE_MS, result });
  return result;
}
