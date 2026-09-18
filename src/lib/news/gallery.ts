import { leanForOutlet, type Lean } from "@/lib/news/lean";
import { safeVideoPlayback, SOCIAL_MEDIA_HOSTS } from "@/lib/news/media";
import type { NewsroomItem } from "@/lib/news/newsroom";
import { outletKey } from "@/lib/news/outlet";
import { socialPlatformFromUrl, type SocialPlatform } from "@/lib/news/social";

/**
 * The picture desk.
 *
 * What the wire looks like, rather than what it says. Everything here is
 * about deciding which of the corpus's media is worth putting on a wall, and
 * two decisions do most of the work: which images may be shown at all, and
 * which of them are the same picture twice.
 */

function host(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return null;
    return parsed.hostname.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Platforms whose media is not carried.
 *
 * The desk shows outlets, not platforms. This is the single place that
 * decision lives.
 *
 * It costs a great deal of video: of 204 video tiles, 165 were YouTube and 31
 * TikTok, leaving roughly thirty that an outlet published itself. Mainstream
 * RSS almost never carries a playable file — twenty outlet feeds were probed
 * and not one attached an mp4 — so what remains is mostly the outlet's own
 * video *pages*, which `isOutletVideoPage` recognises.
 *
 * The list itself now lives in lib/news/media, because the editor has to make
 * the same call when it decides which video may be carried into a draft, and
 * two copies of this policy would drift apart.
 */
const EXCLUDED_MEDIA_HOSTS = SOCIAL_MEDIA_HOSTS;

/**
 * An article that is itself a piece of video, published by the outlet.
 *
 * Recognised from the URL because that is the only signal the feed gives: an
 * outlet files its video into its own /video/ section, and the item otherwise
 * looks like any other article. These cannot be embedded — the page is not a
 * file — so the tile carries the still and opens at the source.
 */
export function isOutletVideoPage(url?: string | null): boolean {
  if (!url) return false;
  const name = host(url);
  if (!name || EXCLUDED_MEDIA_HOSTS.has(name)) return false;
  try {
    return /\/(video|videos|watch|live-tv|av)\//i.test(new URL(url).pathname);
  } catch {
    return false;
  }
}

/**
 * Whether an image may be shown in the admin grid.
 *
 * Deliberately *not* `imageAllowed` from the intake pipeline. That is a
 * next/image remote-patterns allowlist, and next/image throws at runtime for a
 * host outside it — correct for the public site, and far too narrow here: only
 * 79 of 607 images in the corpus pass it, so the grid would look broken while
 * the data was fine. This grid renders plain <img>, which needs no allowlist,
 * so the check is only what safety actually requires.
 *
 * Reachability is a separate matter and cannot be decided here: plenty of
 * these hosts refuse hotlinks. The grid drops a tile when the browser fails to
 * load it.
 */
export function galleryImageAllowed(url?: string | null): url is string {
  if (!url) return false;
  const name = host(url);
  if (!name) return false;
  if (EXCLUDED_MEDIA_HOSTS.has(name)) return false;
  // A data or tracking pixel is not a picture.
  return !/^data:|\/(1x1|pixel|spacer)\.(gif|png)$/i.test(url);
}

/** Whether a video may be played in the admin grid. */
export function galleryVideoAllowed(url?: string | null): boolean {
  if (!url) return false;
  const name = host(url);
  if (!name || EXCLUDED_MEDIA_HOSTS.has(name)) return false;
  return Boolean(safeVideoPlayback(url));
}

export type GalleryKind = "image" | "video";

export type GalleryTile = {
  key: string;
  kind: GalleryKind;
  /** The still to paint. Present for video too, when the feed gave one. */
  imageUrl?: string;
  /** Direct playback source, when the outlet gave a real file. */
  videoUrl?: string;
  /** True when the article is a video page rather than a playable file. */
  videoPage?: boolean;
  title: string;
  source: string;
  outlet: string;
  lean: Lean;
  stateControlled: boolean;
  publishedAt: string;
  sourceUrl: string;
  category: string;
  /** How many other articles carried this same picture. */
  reused: number;
  /** Which platform it came from, when it is a social post. */
  platform?: SocialPlatform;
  /** True when a draft already exists for it. */
  imported: boolean;
};

/**
 * Strips the parts of an image URL that vary without changing the picture.
 *
 * Syndicated copy reuses one photograph across a dozen outlets, each with its
 * own resize and cache-busting query. Comparing raw URLs would show the same
 * image twelve times and call it twelve pictures.
 */
export function imageIdentity(url: string): string {
  try {
    const parsed = new URL(url);
    for (const key of [...parsed.searchParams.keys()]) {
      if (/^(w|h|width|height|q|quality|s|size|resize|crop|fit|auto|format|v|ver|cb|rect|strip)$/i.test(key)) {
        parsed.searchParams.delete(key);
      }
    }
    parsed.hash = "";
    // Common CDN size segments: /800x450/, /w_640/, /resize/1200/
    const path = parsed.pathname
      .replace(/\/\d{2,4}x\d{2,4}\//g, "/")
      .replace(/\/(w|h)_\d{2,4}\//g, "/")
      .replace(/\/resize\/\d{2,4}\//g, "/");
    return `${parsed.hostname}${path}?${parsed.searchParams.toString()}`.toLowerCase();
  } catch {
    return url.trim().toLowerCase();
  }
}

/**
 * The tiles worth showing, newest first.
 *
 * One tile per distinct picture: when several outlets ran the same photograph
 * the newest keeps the tile and the rest are counted on it, so the wall shows
 * what the day looked like rather than how many times the wire repeated
 * itself.
 */
export function buildGallery(
  items: NewsroomItem[],
  options: { limit?: number } = {},
): GalleryTile[] {
  const byImage = new Map<string, GalleryTile>();
  const out: GalleryTile[] = [];

  const sorted = [...items].sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  );

  for (const item of sorted) {
    // A tile counts as video when the outlet gave a playable file, or when the
    // article is one of the outlet's own video pages.
    const playable =
      galleryVideoAllowed(item.videoUrl) || isOutletVideoPage(item.sourceUrl);
    const still = galleryImageAllowed(item.imageUrl) ? item.imageUrl : undefined;
    if (!playable && !still) continue;

    const rating = leanForOutlet(item);
    const tile: GalleryTile = {
      key: item.key,
      kind: playable ? "video" : "image",
      imageUrl: still,
      videoUrl: galleryVideoAllowed(item.videoUrl) ? item.videoUrl : undefined,
      videoPage: playable && !galleryVideoAllowed(item.videoUrl),
      title: item.title,
      source: item.source,
      outlet: outletKey(item),
      lean: rating.lean,
      stateControlled: rating.stateControlled,
      publishedAt: item.publishedAt,
      sourceUrl: item.sourceUrl,
      category: item.category,
      reused: 0,
      platform: item.platform ?? socialPlatformFromUrl(item.sourceUrl),
      imported: item.imported,
    };

    /**
     * The same footage, syndicated, is one tile.
     *
     * Video used to be exempt from de-duplication on the grounds that two
     * outlets may carry the same still over different footage — true, but it
     * says nothing about two outlets carrying the same *file*. One JWPlayer
     * clip was filling five tiles on the wall. An identical source url is the
     * same video, so it collapses exactly like a photograph does.
     */
    if (playable && tile.videoUrl) {
      const existing = byImage.get(`video:${tile.videoUrl}`);
      if (existing) {
        existing.reused += 1;
        continue;
      }
      byImage.set(`video:${tile.videoUrl}`, tile);
      out.push(tile);
      continue;
    }

    // A video *page* has no file to compare, and a tile with no still has
    // nothing to match on either; both keep their own tile.
    if (!still || playable) {
      out.push(tile);
      continue;
    }

    const identity = imageIdentity(still);
    const existing = byImage.get(identity);
    if (existing) {
      existing.reused += 1;
      continue;
    }
    byImage.set(identity, tile);
    out.push(tile);
  }

  return options.limit ? out.slice(0, options.limit) : out;
}

/** Counts for the header strip. */
export function galleryTotals(tiles: GalleryTile[]) {
  return {
    tiles: tiles.length,
    images: tiles.filter((tile) => tile.kind === "image").length,
    videos: tiles.filter((tile) => tile.kind === "video").length,
    outlets: new Set(tiles.map((tile) => tile.outlet)).size,
    reused: tiles.reduce((sum, tile) => sum + tile.reused, 0),
    undrafted: tiles.filter((tile) => !tile.imported).length,
  };
}

/** Which platforms are present, with counts, for the filter row. */
export function galleryPlatforms(
  tiles: GalleryTile[],
): Array<{ platform: SocialPlatform | "wire"; count: number }> {
  const counts = new Map<SocialPlatform | "wire", number>();
  for (const tile of tiles) {
    const key = tile.platform ?? "wire";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([platform, count]) => ({ platform, count }))
    .sort((a, b) => b.count - a.count);
}
