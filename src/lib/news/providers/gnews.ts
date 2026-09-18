import { normalizeArticle } from "@/lib/news/normalizer";
import { fetchJson, withBackoff } from "@/lib/news/providers/http";
import type { NewsProvider } from "@/lib/news/providers/types";
import type { NormalizedArticle } from "@/lib/news/types";

type GNewsResponse = {
  articles?: Array<{
    title?: string;
    description?: string;
    content?: string;
    url?: string;
    image?: string;
    publishedAt?: string;
    source?: { name?: string; url?: string };
  }>;
};

function key() {
  return process.env.GNEWS_API_KEY?.trim() || "";
}

function url(path: string, extra: Record<string, string>) {
  const params = new URLSearchParams({
    lang: "en",
    max: "20",
    apikey: key(),
    ...extra,
  });
  return `https://gnews.io/api/v4/${path}?${params.toString()}`;
}

function mapArticles(data: GNewsResponse): NormalizedArticle[] {
  return (data.articles ?? [])
    .map((article) =>
      normalizeArticle("gnews", {
        externalId: article.url,
        title: article.title,
        description: article.description,
        content: article.content,
        sourceName: article.source?.name,
        sourceUrl: article.url,
        imageUrl: article.image,
        publishedAt: article.publishedAt,
      }),
    )
    .filter((article): article is NormalizedArticle => Boolean(article));
}

export const gnewsProvider: NewsProvider = {
  id: "gnews",
  minIntervalMs: 15 * 60 * 1000,
  configured: () => Boolean(key()),
  async fetchLatest() {
    const { data } = await withBackoff(() =>
      fetchJson<GNewsResponse>(url("top-headlines", {})),
    );
    return mapArticles(data);
  },
  async search(query: string) {
    const { data } = await withBackoff(() =>
      fetchJson<GNewsResponse>(url("search", { q: query })),
    );
    return mapArticles(data);
  },
  async fetchByCategory(category: string) {
    const { data } = await withBackoff(() =>
      fetchJson<GNewsResponse>(
        url("top-headlines", { topic: category.toLowerCase() }),
      ),
    );
    return mapArticles(data);
  },
  async healthCheck() {
    if (!key()) return { ok: false, message: "GNEWS_API_KEY missing" };
    try {
      await fetchJson<GNewsResponse>(url("top-headlines", {}));
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        message: err instanceof Error ? err.message : "GNews unavailable",
      };
    }
  },
};
