import { normalizeArticle } from "@/lib/news/normalizer";
import { fetchJson, withBackoff } from "@/lib/news/providers/http";
import type { NewsProvider } from "@/lib/news/providers/types";
import { GDELT_TECH_QUERY } from "@/lib/news/tech";
import type { NormalizedArticle } from "@/lib/news/types";

const DEFAULT_URL = "https://api.gdeltproject.org/api/v2/doc/doc";

type GdeltDoc = {
  articles?: Array<{
    url?: string;
    title?: string;
    seendate?: string;
    domain?: string;
    language?: string;
    sourcecountry?: string;
    socialimage?: string;
  }>;
};

function endpoint(query: string) {
  const base = process.env.GDELT_API_URL?.trim() || DEFAULT_URL;
  const params = new URLSearchParams({
    query,
    mode: "ArtList",
    maxrecords: "40",
    format: "json",
    sort: "DateDesc",
  });
  return `${base}?${params.toString()}`;
}

function mapArticles(data: GdeltDoc): NormalizedArticle[] {
  return (data.articles ?? [])
    .map((article) =>
      normalizeArticle("gdelt", {
        externalId: article.url,
        title: article.title,
        description: article.domain
          ? `Coverage via ${article.domain}`
          : undefined,
        sourceName: article.domain,
        sourceUrl: article.url,
        imageUrl: article.socialimage,
        publishedAt: article.seendate,
        country: article.sourcecountry,
        language: article.language?.slice(0, 2),
      }),
    )
    .filter((article): article is NormalizedArticle => Boolean(article));
}

export const gdeltProvider: NewsProvider = {
  id: "gdelt",
  minIntervalMs: 20 * 60 * 1000,
  configured: () => true,
  async fetchLatest() {
    const { data } = await withBackoff(() =>
      fetchJson<GdeltDoc>(endpoint(GDELT_TECH_QUERY)),
    );
    return mapArticles(data);
  },
  async search(query: string) {
    const { data } = await withBackoff(() =>
      fetchJson<GdeltDoc>(endpoint(`sourcelang:eng (${query})`)),
    );
    return mapArticles(data);
  },
  async fetchByCategory(category: string) {
    return this.search(category);
  },
  async healthCheck() {
    try {
      await fetchJson<GdeltDoc>(endpoint(GDELT_TECH_QUERY));
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        message: err instanceof Error ? err.message : "GDELT unavailable",
      };
    }
  },
};
