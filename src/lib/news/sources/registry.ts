import { isPaywalledUrl, hostnameFromUrl } from "@/lib/news-intake/paywalls";
import { TECH_FEEDS } from "@/lib/news/sources/tech-feeds";

export type NewsSourceRow = {
  id: string;
  name: string;
  domain: string;
  country: string | null;
  language: string;
  category: string;
  rss_url: string | null;
  homepage_url: string | null;
  enabled: boolean;
  crawl_method: string;
  crawl_interval: number;
  last_crawled_at: string | null;
  last_success_at: string | null;
  last_failure_at: string | null;
  failure_count: number;
  priority: number;
  trust_score: number;
  max_requests_per_minute: number;
  concurrency: number;
  timeout_ms: number;
  retry_count: number;
  requires_browser: boolean;
};

/** Hosts never shown in admin Live News / Recent Events (public /live is unchanged). */
export const ADMIN_BLOCKED_HOSTS = [
  "theguardian.com",
  "theguardian.co.uk",
  "ft.com",
  "wsj.com",
  "nytimes.com",
  "economist.com",
  "bloomberg.com",
];

/** Primary sources — always surfaced first in admin feeds. */
export const PRIMARY_NEWS_SOURCE_IDS = new Set([
  "hacker-news",
  "the-verge",
  "ars-technica",
]);

export const SEED_SOURCES = TECH_FEEDS;

const DISCOVERY_HOSTS = new Set([
  "news.google.com",
  "news.google.co.uk",
  "api.gdeltproject.org",
]);

export function isAdminBlockedHost(host: string): boolean {
  const name = host.replace(/^www\./i, "").toLowerCase();
  if (!name) return true;
  return ADMIN_BLOCKED_HOSTS.some(
    (blocked) => name === blocked || name.endsWith(`.${blocked}`),
  );
}

export function isAggregatorFeed(source: {
  id?: string;
  domain: string;
  rss_url?: string | null;
}): boolean {
  const domain = source.domain.replace(/^www\./i, "").toLowerCase();
  if (domain.includes("news.google.com")) return true;
  if (source.id?.startsWith("google-")) return true;
  return Boolean(source.rss_url?.includes("news.google.com"));
}

const EXCLUDED_PLATFORM_HOSTS = [
  "youtube.com",
  "youtu.be",
  "m.youtube.com",
  "youtube-nocookie.com",
  "tiktok.com",
  "instagram.com",
];

export function shouldExcludeFromAdminFeed(url: string): boolean {
  const host = hostnameFromUrl(url);
  if (isAdminBlockedHost(host)) return true;
  if (isPaywalledUrl(url)) return true;
  if (
    EXCLUDED_PLATFORM_HOSTS.some(
      (blocked) => host === blocked || host.endsWith(`.${blocked}`),
    )
  ) {
    return true;
  }
  return host === "news.google.com" || host.endsWith(".news.google.com");
}

export function hostMatchesSource(host: string, domain: string): boolean {
  const h = host.replace(/^www\./i, "").toLowerCase();
  const d = domain.replace(/^www\./i, "").toLowerCase();
  return h === d || h.endsWith(`.${d}`) || d.endsWith(`.${h}`);
}

export function isAllowedAdminUrl(
  url: string,
  sources: Array<Pick<NewsSourceRow, "domain" | "enabled">>,
): boolean {
  const host = hostnameFromUrl(url);
  if (!host || isAdminBlockedHost(host) || isPaywalledUrl(url)) return false;
  if (DISCOVERY_HOSTS.has(host)) return true;
  return sources.some(
    (source) =>
      source.enabled !== false && hostMatchesSource(host, source.domain),
  );
}

export function sourceDomains(
  sources: Array<Pick<NewsSourceRow, "domain">>,
): Set<string> {
  return new Set(sources.map((source) => source.domain.replace(/^www\./i, "")));
}

export function isTechSeedSource(id: string): boolean {
  return SEED_SOURCES.some((source) => source.id === id);
}
