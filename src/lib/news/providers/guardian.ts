import { normalizeArticle } from "@/lib/news/normalizer";
import { fetchJson, withBackoff } from "@/lib/news/providers/http";
import type { NewsProvider } from "@/lib/news/providers/types";
import type { NormalizedArticle } from "@/lib/news/types";

type GuardianResponse = {
  response?: {
    results?: Array<{
      id?: string;
      webTitle?: string;
      webUrl?: string;
      webPublicationDate?: string;
      sectionName?: string;
      fields?: { trailText?: string; thumbnail?: string; byline?: string };
    }>;
  };
};

function key() {
  return process.env.GUARDIAN_API_KEY?.trim() || "";
}

function url(extra: Record<string, string>) {
  const params = new URLSearchParams({
    "api-key": key(),
    "page-size": "20",
    "order-by": "newest",
    "show-fields": "trailText,thumbnail,byline",
    ...extra,
  });
  return `https://content.guardianapis.com/search?${params.toString()}`;
}

function mapArticles(data: GuardianResponse): NormalizedArticle[] {
  return (data.response?.results ?? [])
    .map((article) =>
      normalizeArticle("guardian", {
        externalId: article.id || article.webUrl,
        title: article.webTitle,
        description: article.fields?.trailText,
        sourceName: "The Guardian",
        sourceUrl: article.webUrl,
        imageUrl: article.fields?.thumbnail,
        author: article.fields?.byline,
        publishedAt: article.webPublicationDate,
        categoryHint: article.sectionName,
        country: "GB",
      }),
    )
    .filter((article): article is NormalizedArticle => Boolean(article));
}

export const guardianProvider: NewsProvider = {
  id: "guardian",
  minIntervalMs: 10 * 60 * 1000,
  configured: () => Boolean(key()),
  async fetchLatest() {
    const { data } = await withBackoff(() =>
      fetchJson<GuardianResponse>(url({})),
    );
    return mapArticles(data);
  },
  async search(query: string) {
    const { data } = await withBackoff(() =>
      fetchJson<GuardianResponse>(url({ q: query })),
    );
    return mapArticles(data);
  },
  async fetchByCategory(category: string) {
    const { data } = await withBackoff(() =>
      fetchJson<GuardianResponse>(url({ section: category.toLowerCase() })),
    );
    return mapArticles(data);
  },
  async healthCheck() {
    if (!key()) return { ok: false, message: "GUARDIAN_API_KEY missing" };
    try {
      await fetchJson<GuardianResponse>(url({ "page-size": "1" }));
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        message: err instanceof Error ? err.message : "Guardian unavailable",
      };
    }
  },
};
