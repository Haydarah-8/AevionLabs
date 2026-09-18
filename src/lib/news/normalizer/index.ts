import { classifyCategory } from "@/lib/news/categories";
import {
  canonicalUrl,
  hostnameFromUrl,
  safeHttpUrl,
  stripHtml,
} from "@/lib/news/normalizer/sanitize";
import type { NewsProviderId, NormalizedArticle } from "@/lib/news/types";

export type RawArticle = {
  externalId?: string;
  title?: string;
  description?: string;
  content?: string;
  sourceName?: string;
  sourceUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  author?: string;
  publishedAt?: string;
  categoryHint?: string;
  country?: string;
  language?: string;
  tags?: string[];
  keywords?: string[];
};

function isoDate(value?: string): string {
  if (!value) return new Date().toISOString();
  const parsed = Date.parse(value);
  if (!Number.isNaN(parsed)) return new Date(parsed).toISOString();
  const compact = value.replace(/[-:TZ]/gi, "").slice(0, 14);
  if (/^\d{14}$/.test(compact)) {
    const iso = `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}T${compact.slice(8, 10)}:${compact.slice(10, 12)}:${compact.slice(12, 14)}Z`;
    const retry = Date.parse(iso);
    if (!Number.isNaN(retry)) return new Date(retry).toISOString();
  }
  return new Date().toISOString();
}

export function normalizeArticle(
  provider: NewsProviderId,
  raw: RawArticle,
): NormalizedArticle | null {
  const title = stripHtml(raw.title || "");
  const sourceUrl = safeHttpUrl(raw.sourceUrl);
  if (!title || !sourceUrl) return null;

  const description = stripHtml(raw.description || "").slice(0, 800);
  const content = stripHtml(raw.content || "").slice(0, 2000);
  const canonical = canonicalUrl(sourceUrl);
  const domain = hostnameFromUrl(sourceUrl);
  const imageUrl = safeHttpUrl(raw.imageUrl);
  const videoUrl = safeHttpUrl(raw.videoUrl);

  return {
    externalId: (raw.externalId || canonical || sourceUrl).slice(0, 500),
    provider,
    title: title.slice(0, 400),
    description,
    content,
    sourceName: stripHtml(raw.sourceName || domain || provider).slice(0, 120),
    sourceDomain: domain,
    sourceUrl,
    canonicalUrl: canonical,
    imageUrl,
    videoUrl,
    videoType: videoUrl ? "url" : undefined,
    author: raw.author ? stripHtml(raw.author).slice(0, 160) : undefined,
    publishedAt: isoDate(raw.publishedAt),
    category: classifyCategory(title, description, raw.categoryHint),
    country: raw.country?.slice(0, 8),
    language: (raw.language || "en").slice(0, 8).toLowerCase(),
    tags: (raw.tags || [])
      .map((tag) => stripHtml(tag))
      .filter(Boolean)
      .slice(0, 12),
    keywords: (raw.keywords || [])
      .map((tag) => stripHtml(tag))
      .filter(Boolean)
      .slice(0, 16),
  };
}
