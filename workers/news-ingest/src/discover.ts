import { fetchText, parseRss } from "../../../src/lib/news-intake/rss";
import { shouldExcludeFromAdminFeed } from "../../../src/lib/news/sources/registry";
import type { NewsSourceRow } from "../../../src/lib/news/sources/registry";
import { canonicalUrl } from "../../../src/lib/news/normalizer/sanitize";
import { db } from "./supabase";
import { assertSafeFetchUrl } from "./ssrf";
import { circuitOpen, withBackoff } from "./throttle";

type Discovered = {
  source: NewsSourceRow;
  title: string;
  url: string;
  snippet: string;
  publishedAt: string;
  imageUrl?: string;
};

export async function loadSources(): Promise<NewsSourceRow[]> {
  const { data, error } = await db()
    .from("news_sources")
    .select("*")
    .eq("enabled", true)
    .order("priority", { ascending: false });
  if (error) throw error;
  return (data ?? []) as NewsSourceRow[];
}

async function fromRss(source: NewsSourceRow): Promise<Discovered[]> {
  if (!source.rss_url) return [];
  if (circuitOpen(source.failure_count, source.last_failure_at)) return [];
  const hub = process.env.RSSHUB_BASE_URL?.replace(/\/$/, "");
  const feedUrl =
    !source.rss_url && hub ? `${hub}/${source.domain}` : source.rss_url;
  if (!feedUrl) return [];
  try {
    assertSafeFetchUrl(feedUrl, [source]);
    const xml = await withBackoff(() => fetchText(feedUrl), source.retry_count);
    return parseRss(xml, {
      source: source.name,
      provider: source.id,
      topic: "all",
    })
      .filter((item) => !shouldExcludeFromAdminFeed(item.sourceUrl))
      .map((item) => ({
        source,
        title: item.title,
        url: canonicalUrl(item.sourceUrl) || item.sourceUrl,
        snippet: item.snippet,
        publishedAt: item.publishedAt,
        imageUrl: item.imageUrl,
      }));
  } catch {
    return [];
  }
}

async function fromGdelt(sources: NewsSourceRow[]): Promise<Discovered[]> {
  const params = new URLSearchParams({
    query: "sourcelang:eng (geopolitics OR defence OR energy)",
    mode: "ArtList",
    maxrecords: "25",
    format: "json",
    sort: "DateDesc",
  });
  const url = `${process.env.GDELT_API_URL?.trim() || "https://api.gdeltproject.org/api/v2/doc/doc"}?${params}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      articles?: Array<{
        title?: string;
        url?: string;
        seendate?: string;
        domain?: string;
      }>;
    };
    const fallback = sources[0];
    if (!fallback) return [];
    return (data.articles ?? [])
      .filter((article) => article.title && article.url?.startsWith("http"))
      .filter((article) => !shouldExcludeFromAdminFeed(String(article.url)))
      .map((article) => ({
        source: fallback,
        title: String(article.title),
        url: canonicalUrl(article.url) || String(article.url),
        snippet: `Coverage via ${article.domain || "GDELT"}`,
        publishedAt: new Date().toISOString(),
      }));
  } catch {
    return [];
  }
}

async function fromNewsData(sources: NewsSourceRow[]): Promise<Discovered[]> {
  const key = process.env.NEWSDATA_API_KEY?.trim();
  if (!key) return [];
  const params = new URLSearchParams({
    apikey: key,
    language: "en",
    q: "geopolitics OR defence OR energy",
  });
  try {
    const res = await fetch(`https://newsdata.io/api/1/latest?${params}`, {
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      results?: Array<{
        title?: string;
        link?: string;
        description?: string;
        pubDate?: string;
        source_name?: string;
        image_url?: string;
      }>;
    };
    return (data.results ?? [])
      .filter((article) => article.title && article.link)
      .filter((article) => !shouldExcludeFromAdminFeed(String(article.link)))
      .map((article) => ({
        source:
          sources.find((row) =>
            String(article.link).includes(row.domain.replace(/^www\./, "")),
          ) || sources[0],
        title: String(article.title),
        url: canonicalUrl(article.link) || String(article.link),
        snippet: article.description || "",
        publishedAt: article.pubDate || new Date().toISOString(),
        imageUrl: article.image_url,
      }))
      .filter((item) => Boolean(item.source));
  } catch {
    return [];
  }
}

export async function discoverAll(): Promise<Discovered[]> {
  const sources = await loadSources();
  const groups = await Promise.all(sources.map((source) => fromRss(source)));
  const extra = await Promise.all([fromGdelt(sources), fromNewsData(sources)]);
  const merged = new Map<string, Discovered>();
  for (const item of [...groups.flat(), ...extra.flat()]) {
    if (!item?.url || shouldExcludeFromAdminFeed(item.url)) continue;
    if (!merged.has(item.url)) merged.set(item.url, item);
  }
  return [...merged.values()];
}

export type { Discovered };
