import { normalizeArticle } from "@/lib/news/normalizer";
import { fetchJson, withBackoff } from "@/lib/news/providers/http";
import type { NewsProvider } from "@/lib/news/providers/types";
import type { NormalizedArticle } from "@/lib/news/types";

type NewsDataResponse = {
  results?: Array<{
    article_id?: string;
    title?: string;
    link?: string;
    description?: string;
    content?: string;
    pubDate?: string;
    source_id?: string;
    source_name?: string;
    image_url?: string;
    video_url?: string;
    creator?: string[] | string;
    country?: string[];
    category?: string[];
    keywords?: string[] | null;
  }>;
};

function key() {
  return process.env.NEWSDATA_API_KEY?.trim() || "";
}

function url(extra: Record<string, string>) {
  const params = new URLSearchParams({
    apikey: key(),
    language: "en",
    ...extra,
  });
  return `https://newsdata.io/api/1/latest?${params.toString()}`;
}

function mapArticles(data: NewsDataResponse): NormalizedArticle[] {
  return (data.results ?? [])
    .map((article) =>
      normalizeArticle("newsdata", {
        externalId: article.article_id || article.link,
        title: article.title,
        description: article.description,
        content: article.content,
        sourceName: article.source_name || article.source_id,
        sourceUrl: article.link,
        imageUrl: article.image_url,
        videoUrl: article.video_url,
        author: Array.isArray(article.creator)
          ? article.creator[0]
          : article.creator,
        publishedAt: article.pubDate,
        categoryHint: article.category?.[0],
        country: article.country?.[0],
        keywords: article.keywords || undefined,
      }),
    )
    .filter((article): article is NormalizedArticle => Boolean(article));
}

export const newsdataProvider: NewsProvider = {
  id: "newsdata",
  minIntervalMs: 15 * 60 * 1000,
  configured: () => Boolean(key()),
  async fetchLatest() {
    const { data } = await withBackoff(() =>
      fetchJson<NewsDataResponse>(url({})),
    );
    return mapArticles(data);
  },
  async search(query: string) {
    const { data } = await withBackoff(() =>
      fetchJson<NewsDataResponse>(url({ q: query })),
    );
    return mapArticles(data);
  },
  async fetchByCategory(category: string) {
    const { data } = await withBackoff(() =>
      fetchJson<NewsDataResponse>(url({ category: category.toLowerCase() })),
    );
    return mapArticles(data);
  },
  async healthCheck() {
    if (!key()) return { ok: false, message: "NEWSDATA_API_KEY missing" };
    try {
      await fetchJson<NewsDataResponse>(url({}));
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        message: err instanceof Error ? err.message : "NewsData unavailable",
      };
    }
  },
};
