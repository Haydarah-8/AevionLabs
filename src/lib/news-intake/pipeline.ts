import {
  EXTRACT_FAIL_REASON,
  EXTRACT_PAYWALL_REASON,
  extractArticleCached,
  type ExtractedArticle,
} from "@/lib/news-intake/extract";
import { fetchNewsFeed, getCachedItem } from "@/lib/news-intake/fetch";
import { isPaywalledUrl } from "@/lib/news-intake/paywalls";
import type { NewsItem } from "@/lib/news-intake/types";
import { newsItemsFromArticles } from "@/lib/news/ingestion/registry";

export async function resolveNewsItems(
  urls: string[],
  topic: string,
): Promise<NewsItem[]> {
  const found: NewsItem[] = [];
  const missing: string[] = [];
  for (const url of urls) {
    const cached = getCachedItem(url);
    if (cached) found.push(cached);
    else missing.push(url);
  }
  if (!missing.length) return found;

  const fromStore = await newsItemsFromArticles(missing);
  const stored = new Map(fromStore.map((item) => [item.sourceUrl, item]));
  const stillMissing: string[] = [];
  for (const url of missing) {
    const item = stored.get(url) ?? getCachedItem(url);
    if (item) found.push(item);
    else stillMissing.push(url);
  }
  if (!stillMissing.length) return found;

  const feed = await fetchNewsFeed(topic);
  const byUrl = new Map(feed.items.map((item) => [item.sourceUrl, item]));
  for (const url of stillMissing) {
    const item = byUrl.get(url) ?? getCachedItem(url);
    if (item) found.push(item);
  }
  return found;
}

export async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const index = next++;
      out[index] = await fn(items[index]);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker()),
  );
  return out;
}

export type ExtractBatchResult = {
  item: NewsItem;
  article: ExtractedArticle | null;
  reason?: string;
};

export async function extractNewsItems(
  items: NewsItem[],
): Promise<ExtractBatchResult[]> {
  return mapLimit(items, 4, async (item) => {
    if (isPaywalledUrl(item.sourceUrl)) {
      return { item, article: null, reason: EXTRACT_PAYWALL_REASON };
    }
    try {
      return { item, article: await extractArticleCached(item.sourceUrl) };
    } catch (err) {
      return {
        item,
        article: null,
        reason:
          err instanceof Error && err.message
            ? err.message
            : EXTRACT_FAIL_REASON,
      };
    }
  });
}
