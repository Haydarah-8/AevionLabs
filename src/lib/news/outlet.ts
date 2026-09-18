import type { SocialPlatform } from "@/lib/news/social";

/** Suffixes outlets append to the same masthead across their feeds. */
const OUTLET_SUFFIXES =
  /\b(news|english|world|online|tv|network|agency|digital|uk|us|international)\b/g;

/** Public suffixes stripped before the masthead label is read off a host. */
const PUBLIC_SUFFIX =
  /^(com|co|org|net|gov|edu|uk|us|eu|int|info|io|tr|cn|ru|au|sg|hk|il|de|fr|be)$/;

export function normalizeOutletName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(OUTLET_SUFFIXES, " ")
    .replace(/\s+/g, "")
    .trim();
}

/** Masthead label of a URL's host: bbc.co.uk -> bbc, english.news.cn -> news. */
export function outletKeyFromUrl(url: string): string {
  try {
    const labels = new URL(url).hostname
      .toLowerCase()
      .replace(/^www\./, "")
      .split(".")
      .filter(Boolean);
    while (labels.length > 1 && PUBLIC_SUFFIX.test(labels[labels.length - 1])) {
      labels.pop();
    }
    return labels[labels.length - 1] ?? "";
  } catch {
    return "";
  }
}

/**
 * Identifies the organisation behind an article so "BBC News", "BBC
 * Technology" and a BBC YouTube clip count as one outlet rather than three.
 * A social post is attributed to its publisher, not to the platform domain.
 */
export function outletKey(item: {
  source: string;
  sourceUrl: string;
  platform?: SocialPlatform;
}): string {
  if (item.platform) {
    return normalizeOutletName(item.source) || item.source.toLowerCase();
  }
  return (
    outletKeyFromUrl(item.sourceUrl) ||
    normalizeOutletName(item.source) ||
    item.source.toLowerCase()
  );
}
