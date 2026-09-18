import { NEWS_TOPICS } from "@/lib/news-intake/types";
import { shouldExcludeFromFeed } from "@/lib/news-intake/paywalls";
import { fetchText, parseRss, titleKey } from "@/lib/news-intake/rss";
import { normalizeArticle } from "@/lib/news/normalizer";
import type { NewsProvider } from "@/lib/news/providers/types";
import { TECH_SEARCH_QUERY, isTechRelated } from "@/lib/news/tech";
import type { NormalizedArticle } from "@/lib/news/types";

const TECH_QUERY =
  NEWS_TOPICS.find((topic) => topic.id === "all")?.query || TECH_SEARCH_QUERY;

const FEEDS: Array<{
  url: string;
  source: string;
  provider: string;
}> = [
  {
    url: "https://hnrss.org/frontpage",
    source: "Hacker News",
    provider: "Hacker News",
  },
  {
    url: "https://www.theverge.com/rss/index.xml",
    source: "The Verge",
    provider: "The Verge",
  },
  {
    url: "https://feeds.arstechnica.com/arstechnica/index",
    source: "Ars Technica",
    provider: "Ars Technica",
  },
  {
    url: "https://feeds.bbci.co.uk/news/technology/rss.xml",
    source: "BBC Technology",
    provider: "BBC",
  },
  {
    url: "https://techcrunch.com/feed/",
    source: "TechCrunch",
    provider: "TechCrunch",
  },
  {
    url: "https://www.theregister.com/headlines.atom",
    source: "The Register",
    provider: "The Register",
  },
];

function googleNewsUrl(query: string) {
  const params = new URLSearchParams({
    q: query,
    hl: "en-GB",
    gl: "GB",
    ceid: "GB:en",
  });
  return `https://news.google.com/rss/search?${params.toString()}`;
}

async function fromRss(
  url: string,
  meta: { source: string; provider: string },
): Promise<NormalizedArticle[]> {
  const xml = await fetchText(url);
  return parseRss(xml, { ...meta, topic: "all" })
    .filter((item) => !shouldExcludeFromFeed(item.sourceUrl))
    .map((item) =>
      normalizeArticle("rss", {
        externalId: item.sourceUrl,
        title: item.title,
        description: item.snippet,
        sourceName: item.source,
        sourceUrl: item.sourceUrl,
        imageUrl: item.imageUrl,
        publishedAt: item.publishedAt,
        language: "en",
      }),
    )
    .filter((article): article is NormalizedArticle => Boolean(article));
}

async function collect(
  url: string,
  meta: { source: string; provider: string },
) {
  try {
    return await fromRss(url, meta);
  } catch {
    return [];
  }
}

function mergeArticles(groups: NormalizedArticle[][]): NormalizedArticle[] {
  const byUrl = new Map<string, NormalizedArticle>();
  const byTitle = new Map<string, string>();
  for (const group of groups) {
    for (const article of group) {
      const url = article.canonicalUrl || article.sourceUrl;
      if (byUrl.has(url)) continue;
      const key = titleKey(article.title);
      if (key && byTitle.has(key)) continue;
      byUrl.set(url, article);
      if (key) byTitle.set(key, url);
    }
  }
  return [...byUrl.values()].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );
}

async function fetchFeeds(extraQuery?: string): Promise<NormalizedArticle[]> {
  const query = extraQuery?.trim() || TECH_QUERY;
  const groups = await Promise.all([
    ...FEEDS.map((feed) =>
      collect(feed.url, { source: feed.source, provider: feed.provider }),
    ),
    collect(googleNewsUrl(query), {
      source: "Google News",
      provider: "Google News",
    }),
  ]);
  const articles = mergeArticles(groups)
    .filter((article) =>
      isTechRelated(
        article.title,
        article.description,
        article.sourceUrl,
        article.category,
      ),
    )
    .slice(0, 80);
  if (!articles.length && groups.every((group) => group.length === 0)) {
    throw new Error("RSS feeds unavailable");
  }
  return articles;
}

export const rssProvider: NewsProvider = {
  id: "rss",
  minIntervalMs: 50 * 60 * 1000,
  configured: () => true,
  fetchLatest() {
    return fetchFeeds();
  },
  search(query: string) {
    return fetchFeeds(query);
  },
  fetchByCategory(category: string) {
    return fetchFeeds(category);
  },
  async healthCheck() {
    try {
      const xml = await fetchText(FEEDS[0].url);
      return xml.includes("<item") || xml.includes("<entry")
        ? { ok: true }
        : { ok: false, message: "Hacker News RSS had no items" };
    } catch (err) {
      return {
        ok: false,
        message: err instanceof Error ? err.message : "RSS unavailable",
      };
    }
  },
};
