export const PAGE_SIZE = 25;

export type SocialPlatform = "youtube" | "tiktok" | "instagram" | "x";

/** Platforms shown in admin UI and fetched live. */
export const SOCIAL_PLATFORMS: Array<{
  id: SocialPlatform;
  label: string;
}> = [];

export type SocialFeed = {
  id: string;
  name: string;
  platform: SocialPlatform;
  domain: string;
  rss_url: string;
  homepage_url: string;
};

/**
 * Empty on purpose: the desk shows outlets, not platforms.
 *
 * The YouTube channel feeds and TikTok bridges that were here worked — eleven
 * channels and three accounts, all verified — and between them supplied 196 of
 * the wall's 204 video tiles. They are gone because the desk carries outlets.
 *
 * What replaces them is thin, and honestly so: twenty outlet feeds were probed
 * and not one attached a playable file. Outlet video now comes from the small
 * number of articles that are themselves video pages, recognised in
 * gallery.ts.
 */
export const SOCIAL_FEEDS: SocialFeed[] = [];

export function socialPlatformFromUrl(
  url?: string | null,
): SocialPlatform | undefined {
  if (!url) return undefined;
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "youtu.be" ||
      host === "youtube-nocookie.com"
    ) {
      return "youtube";
    }
    if (host === "tiktok.com" || host.endsWith(".tiktok.com")) return "tiktok";
    if (host === "instagram.com" || host.endsWith(".instagram.com")) {
      return "instagram";
    }
    if (host === "x.com" || host === "twitter.com" || host === "mobile.twitter.com") {
      return "x";
    }
    return undefined;
  } catch {
    return undefined;
  }
}

/** An empty bucket per platform, so callers never index a missing key. */
export type SocialGroups<T> = Record<SocialPlatform, T[]>;

export function emptySocialGroups<T>(): SocialGroups<T> {
  return {
    youtube: [],
    tiktok: [],
    instagram: [],
    x: [],
  };
}

/**
 * Splits a mixed list into wire articles and per-platform social posts.
 *
 * Keyed on the URL's host rather than on the feed it arrived from: an outlet's
 * own RSS routinely links out to its YouTube channel, and that item is a video
 * whichever feed carried it.
 */
export function groupBySocialPlatform<T>(
  rows: T[],
  urlOf: (row: T) => string,
): { news: T[]; social: SocialGroups<T> } {
  const news: T[] = [];
  const social = emptySocialGroups<T>();
  for (const row of rows) {
    const platform = socialPlatformFromUrl(urlOf(row));
    if (platform) social[platform].push(row);
    else news.push(row);
  }
  return { news, social };
}

/** Whether a configured source row is one of the social/video feeds. */
export function isSocialSource(source: {
  id?: string;
  domain?: string;
  rss_url?: string | null;
}): boolean {
  const domain = (source.domain ?? "").replace(/^www\./i, "").toLowerCase();
  if (SOCIAL_FEEDS.some((feed) => feed.domain === domain)) return true;
  const url = source.rss_url ?? "";
  return (
    url.includes("youtube.com/feeds") ||
    url.includes("rss-bridge.org") ||
    url.includes("rsshub.app")
  );
}

/** One page of a list, 1-indexed. */
export function pageSlice<T>(items: T[], page: number, size = PAGE_SIZE): T[] {
  const start = Math.max(0, (page - 1) * size);
  return items.slice(start, start + size);
}

/** The first `count` items, for the incremental "show more" lists. */
export function visibleSlice<T>(items: T[], count: number): T[] {
  return items.slice(0, Math.max(0, count));
}

export function isSocialImageHost(host: string): boolean {
  const name = host.toLowerCase().replace(/^www\./, "");
  return (
    name === "i.ytimg.com" ||
    name === "img.youtube.com" ||
    name.endsWith(".tiktokcdn.com") ||
    name.endsWith(".cdninstagram.com") ||
    name.endsWith(".twimg.com")
  );
}
