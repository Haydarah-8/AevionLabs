import { NEWS_CATEGORIES, type NewsCategory } from "@/lib/news/categories";

export function fallbackImage(category: string): string {
  const safe = NEWS_CATEGORIES.includes(category as NewsCategory)
    ? category.toLowerCase()
    : "world";
  return `/live/fallbacks/${safe}.svg`;
}

export type Summariser = {
  enabled: boolean;
  summarise(input: { title: string; description: string }): Promise<{
    short_summary?: string;
    key_points?: string[];
    ai_topic?: string;
    sentiment?: string;
    entities?: string[];
    ai_tags?: string[];
  } | null>;
};

export const disabledSummariser: Summariser = {
  enabled: false,
  async summarise() {
    return null;
  },
};

function youtubeHost(host: string) {
  return (
    host === "youtube.com" ||
    host === "m.youtube.com" ||
    host === "youtu.be" ||
    host === "youtube-nocookie.com"
  );
}

export function safeEmbedUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return undefined;
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    if (youtubeHost(host)) {
      const parts = parsed.pathname.split("/").filter(Boolean);
      const id =
        host === "youtu.be"
          ? parts[0]
          : parts[0] === "embed" || parts[0] === "shorts"
            ? parts[1]
            : parsed.searchParams.get("v");
      if (!id || !/^[a-zA-Z0-9_-]{11}$/.test(id)) return undefined;
      return `https://www.youtube.com/embed/${id}`;
    }
    // Brightcove's player page is already an embeddable iframe.
    if (host === "players.brightcove.net") {
      return parsed.href;
    }
    if (host !== "vimeo.com" && host !== "player.vimeo.com") {
      if (host === "tiktok.com" || host.endsWith(".tiktok.com")) {
        const id = parsed.pathname.match(/\/video\/(\d+)/)?.[1];
        if (!id) return undefined;
        return `https://www.tiktok.com/embed/v2/${id}`;
      }
      if (host === "instagram.com") {
        const parts = parsed.pathname.split("/").filter(Boolean);
        if (
          (parts[0] === "p" || parts[0] === "reel" || parts[0] === "tv") &&
          parts[1]
        ) {
          return `https://www.instagram.com/${parts[0]}/${parts[1]}/embed/`;
        }
        return undefined;
      }
      if (host === "x.com" || host === "twitter.com") {
        const id = parsed.pathname.match(/\/status\/(\d+)/)?.[1];
        if (!id) return undefined;
        return `https://platform.twitter.com/embed/Tweet.html?dnt=true&id=${id}`;
      }
      return undefined;
    }
    const match = parsed.pathname.match(/\/(?:video\/)?(\d+)/);
    if (!match) return undefined;
    /**
     * Keep Vimeo's `h` token.
     *
     * An unlisted video — which is how outlets normally publish theirs — is
     * only playable with the hash the publisher issued it: with `?h=…` the
     * player answers 200, without it 403, and the frame shows Vimeo's own
     * "we're having a little trouble" card. Rebuilding the url from the id
     * alone quietly threw that away. Vimeo puts the token in `h`, and the
     * path form `/video/<id>/<hash>` is the same thing said differently.
     */
    const hash =
      parsed.searchParams.get("h") ||
      parsed.pathname.match(/\/(?:video\/)?\d+\/([0-9a-f]{6,})/i)?.[1];
    const base = `https://player.vimeo.com/video/${match[1]}`;
    return hash ? `${base}?h=${encodeURIComponent(hash)}` : base;
  } catch {
    return undefined;
  }
}

/**
 * Platforms the desk does not carry media from.
 *
 * Outlets, not platforms — the standing rule for the Wall, and the same rule
 * the editor applies when a story's video is pulled into a draft. It lives
 * here so both read one list.
 */
export const SOCIAL_MEDIA_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "youtube-nocookie.com",
  "i.ytimg.com",
  "img.youtube.com",
  "tiktok.com",
  "www.tiktok.com",
  "vm.tiktok.com",
  "instagram.com",
  "www.instagram.com",
  "x.com",
  "twitter.com",
]);

/** True when the url points at one of those platforms. */
export function isSocialMediaHost(url?: string | null): boolean {
  if (!url) return false;
  try {
    return SOCIAL_MEDIA_HOSTS.has(new URL(url).hostname.toLowerCase());
  } catch {
    return false;
  }
}

/** A platform's image CDN, which the host list cannot enumerate. */
function socialImageHost(host: string): boolean {
  return (
    host.endsWith(".ytimg.com") ||
    host.endsWith(".twimg.com") ||
    host.endsWith(".cdninstagram.com") ||
    host.endsWith(".fbcdn.net") ||
    host.endsWith(".tiktokcdn.com") ||
    host.endsWith(".tiktokcdn-us.com") ||
    host.endsWith(".tiktok.com")
  );
}

/**
 * Whether a picture may be carried into an article body.
 *
 * The draft builder used to check images against a hand-kept list of about
 * thirty hostnames. That list mirrors next/image's `remotePatterns`, which is
 * a real constraint — next/image throws for a host outside it — but neither
 * the editor nor the published article uses next/image for body pictures. Both
 * render a plain `<img>`, so the allowlist was guarding nothing and costing
 * almost everything: of 1,000 stored images 714 failed it, including every
 * picture from The Diplomat, France 24, DW, Euronews and TASS. Drafts arrived
 * with no illustrations at all.
 *
 * What actually needs deciding is policy, not plumbing: outlets rather than
 * platforms, and a picture rather than a tracking pixel. That is all this does.
 * Whether a given host will serve the image to a hotlinking browser is not
 * knowable here, and is handled where it shows — a tile that fails to load is
 * dropped.
 */
export function articleImageAllowed(url?: string | null): url is string {
  if (!url?.startsWith("https://")) return false;
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (SOCIAL_MEDIA_HOSTS.has(host) || socialImageHost(host)) return false;
    return !/\/(1x1|pixel|spacer|blank)\.(gif|png)(\?|$)/i.test(url);
  } catch {
    return false;
  }
}

export type VideoPlayback =
  | { type: "embed"; src: string }
  | { type: "file"; src: string }
  /** An HLS playlist, which needs a player only some browsers have built in. */
  | { type: "hls"; src: string };

export function safeVideoPlayback(
  url?: string | null,
): VideoPlayback | undefined {
  const embed = safeEmbedUrl(url);
  if (embed) return { type: "embed", src: embed };
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return undefined;
    if (/\.(mp4|webm)(\?|$)/i.test(parsed.pathname)) {
      return { type: "file", src: parsed.href.split("#")[0] };
    }
    if (/\.m3u8(\?|$)/i.test(parsed.pathname)) {
      return { type: "hls", src: parsed.href.split("#")[0] };
    }
    return undefined;
  } catch {
    return undefined;
  }
}
