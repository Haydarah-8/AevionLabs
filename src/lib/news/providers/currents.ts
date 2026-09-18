import { normalizeArticle } from "@/lib/news/normalizer";
import { fetchJson, withBackoff } from "@/lib/news/providers/http";
import type { NewsProvider } from "@/lib/news/providers/types";
import type { NormalizedArticle } from "@/lib/news/types";

type CurrentsResponse = {
  news?: Array<{
    id?: string;
    title?: string;
    description?: string;
    url?: string;
    author?: string;
    image?: string;
    published?: string;
    category?: string[];
    language?: string;
  }>;
};

function key() {
  return process.env.CURRENTS_API_KEY?.trim() || "";
}

function url(extra: Record<string, string>) {
  const params = new URLSearchParams({
    language: "en",
    apiKey: key(),
    ...extra,
  });
  return `https://api.currentsapi.services/v1/latest-news?${params.toString()}`;
}

function mapArticles(data: CurrentsResponse): NormalizedArticle[] {
  return (data.news ?? [])
    .map((article) =>
      normalizeArticle("currents", {
        externalId: article.id || article.url,
        title: article.title,
        description: article.description,
        sourceName: article.author,
        sourceUrl: article.url,
        imageUrl: article.image,
        author: article.author,
        publishedAt: article.published,
        categoryHint: article.category?.[0],
        language: article.language,
      }),
    )
    .filter((article): article is NormalizedArticle => Boolean(article));
}

export const currentsProvider: NewsProvider = {
  id: "currents",
  minIntervalMs: 15 * 60 * 1000,
  configured: () => Boolean(key()),
  async fetchLatest() {
    const { data } = await withBackoff(() =>
      fetchJson<CurrentsResponse>(url({})),
    );
    return mapArticles(data);
  },
  async search(query: string) {
    const params = new URLSearchParams({
      language: "en",
      apiKey: key(),
      keywords: query,
    });
    const { data } = await withBackoff(() =>
      fetchJson<CurrentsResponse>(
        `https://api.currentsapi.services/v1/search?${params.toString()}`,
      ),
    );
    return mapArticles(data);
  },
  async fetchByCategory(category: string) {
    const { data } = await withBackoff(() =>
      fetchJson<CurrentsResponse>(url({ category: category.toLowerCase() })),
    );
    return mapArticles(data);
  },
  async healthCheck() {
    if (!key()) return { ok: false, message: "CURRENTS_API_KEY missing" };
    try {
      await fetchJson<CurrentsResponse>(url({}));
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        message: err instanceof Error ? err.message : "Currents unavailable",
      };
    }
  },
};
