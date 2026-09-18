import { legacySectionsToBlocks } from "@/lib/blog/convert";
import type { ArticleSection, BlogPostInput } from "@/lib/blog/types";
import type {
  ExtractedArticle,
  ExtractedContentBlock,
} from "@/lib/news-intake/extract";
import { NEWS_TOPICS, type NewsItem } from "@/lib/news-intake/types";
import {
  articleImageAllowed,
  isSocialMediaHost,
  safeVideoPlayback,
} from "@/lib/news/media";

const MAX_BODY_CHARS = 10_000;

const ALLOWED_IMAGE_HOSTS = new Set([
  "bgsdc.com",
  "cdn.simpleicons.org",
  "static.wixstatic.com",
  "images.unsplash.com",
  "www.reuters.com",
  "reuters.com",
  "fingfx.thomsonreuters.com",
  "i.guim.co.uk",
  "media.guim.co.uk",
  "upload.wikimedia.org",
  "ichef.bbci.co.uk",
  "news.bbcimg.co.uk",
  "media.npr.org",
  "www.aljazeera.com",
  "www.aljazeera.net",
  "static.aljazeera.net",
  "dims.apnews.com",
  "www.ap.org",
  "cdn.cnn.com",
  "media.cnn.com",
  "e3.365dm.com",
  "www.abc.net.au",
  "live-production.wcms.abc-cdn.net.au",
  "i.ytimg.com",
  "img.youtube.com",
  "imgs.news.cn",
  "english.news.cn",
  "news.cn",
  "www.strategical.org.uk",
  "strategical.org.uk",
]);

function socialImageHost(host: string) {
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
 * Whether a story's video may be carried into a draft.
 *
 * Two questions, and both are answered elsewhere on purpose:
 *
 * `safeVideoPlayback` decides whether the site can actually play the thing —
 * an embed, an mp4/webm file, or an HLS manifest. This used to be a hand-kept
 * list of hosts plus a file-extension test, which got the answer backwards for
 * most of the library: of 693 stored videos only 103 carry a recognisable
 * extension, so every Brightcove player the extractor resolves was refused
 * while the platforms below were waved through.
 *
 * `isSocialMediaHost` then applies the desk's standing rule that we publish
 * outlets rather than platforms, so YouTube and TikTok are dropped even though
 * they would play perfectly well.
 */
function videoUrlAllowed(url?: string): url is string {
  if (!url?.startsWith("http")) return false;
  if (isSocialMediaHost(url)) return false;
  return Boolean(safeVideoPlayback(url));
}

function topicSub(item: NewsItem): string {
  return (
    NEWS_TOPICS.find((topic) => topic.id === item.topic)?.sub || "Insights"
  );
}

function formatLongDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso.slice(0, 10);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Whether next/image may be pointed at this url.
 *
 * Narrow on purpose: it mirrors `remotePatterns` in next.config, and
 * next/image throws at runtime for anything outside it. Keep the two in step.
 *
 * This is *not* the test for pictures going into an article body — those are
 * rendered as a plain `<img>` by both the editor and the published page, and
 * use `articleImageAllowed`, which asks about policy rather than about
 * next/image's configuration.
 */
export function imageAllowed(url?: string): url is string {
  if (!url?.startsWith("https://")) return false;
  try {
    const host = new URL(url).hostname;
    return (
      ALLOWED_IMAGE_HOSTS.has(host) ||
      host.endsWith(".bbci.co.uk") ||
      socialImageHost(host)
    );
  } catch {
    return false;
  }
}

/**
 * One key per piece of media, whatever spelling it arrived in.
 *
 * A Vimeo clip reaches the extractor twice — once as the `player.vimeo.com`
 * iframe src and once as the `vimeo.com` page link — and a draft built from a
 * Breaking Defense piece duly carried the same video twice, one above the
 * other. Keying the de-duplication on the raw string could not see that they
 * were the same thing, so the key is the resolved playback source where there
 * is one, and the url without its query where there is not.
 */
function mediaKey(url: string): string {
  const playback = safeVideoPlayback(url);
  const resolved = playback ? playback.src : url;
  try {
    const parsed = new URL(resolved);
    // The query is deliberately dropped here and only here: Vimeo's `h` token
    // belongs in the src we store, but two spellings of one clip — with the
    // token and without — are still one clip.
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return resolved;
  }
}

/**
 * Whether `candidate` is a better address for the same media than `current`.
 *
 * Only one thing counts: an access token. A page often links its video twice,
 * once as the player iframe carrying `?h=…` and once as a bare page url, and
 * which of the two the extractor meets first is an accident of markup. Taking
 * whichever came first left drafts holding the address that answers 403.
 */
function betterMediaSrc(current: string, candidate: string): boolean {
  const has = (url: string) => {
    try {
      return new URL(url).searchParams.has("h");
    } catch {
      return false;
    }
  };
  return !has(current) && has(candidate);
}

function capBlocks(blocks: ExtractedContentBlock[]): ExtractedContentBlock[] {
  const out: ExtractedContentBlock[] = [];
  let used = 0;
  for (const block of blocks) {
    if (used >= MAX_BODY_CHARS) break;
    if (block.type === "paragraph") {
      const text = block.text.slice(0, MAX_BODY_CHARS - used);
      if (!text.trim()) continue;
      out.push({ type: "paragraph", text });
      used += text.length;
      continue;
    }
    if (block.type === "h2" || block.type === "h3") {
      out.push(block);
      continue;
    }
    if (block.type === "figure" && articleImageAllowed(block.src)) {
      out.push(block);
      continue;
    }
    if (block.type === "video" && videoUrlAllowed(block.src)) {
      out.push(block);
      continue;
    }
    /**
     * Quotes and lists count against the body budget like any other copy.
     *
     * They were previously dropped here without being counted, so a piece
     * built around a pull-quote and a bulleted summary arrived in the editor
     * with both missing and no sign anything had gone.
     */
    if (block.type === "quote") {
      const text = block.text.slice(0, MAX_BODY_CHARS - used);
      if (!text.trim()) continue;
      out.push({ ...block, text });
      used += text.length;
      continue;
    }
    if (block.type === "list") {
      const items = block.items.filter(Boolean);
      if (!items.length) continue;
      out.push({ ...block, items });
      used += items.join(" ").length;
    }
  }
  return out;
}

/**
 * The right section for a video, decided by how it can actually be played.
 *
 * `safeVideoPlayback` already worked this out for the public site; the draft
 * builder was throwing that answer away and calling everything a `video`.
 * An embed keeps its resolved player url — the one the iframe needs — rather
 * than the page url the extractor happened to find it under.
 */
type MediaSection = Extract<ArticleSection, { type: "video" | "embed" }>;

function videoSection(src: string, caption?: string): MediaSection | null {
  const playback = safeVideoPlayback(src);
  if (!playback) return null;
  if (playback.type === "embed") {
    return { type: "embed", src: playback.src, caption };
  }
  return { type: "video", src: playback.src, caption };
}

function blockToSection(block: ExtractedContentBlock): ArticleSection | null {
  if (block.type === "paragraph") {
    return { type: "paragraph", text: block.text };
  }
  if (block.type === "h2") {
    return { type: "h2", text: block.text };
  }
  if (block.type === "h3") {
    return { type: "h3", text: block.text };
  }
  if (block.type === "figure" && articleImageAllowed(block.src)) {
    return {
      type: "figure",
      src: block.src,
      alt: block.alt,
      caption: block.caption,
    };
  }
  if (block.type === "video" && videoUrlAllowed(block.src)) {
    return videoSection(block.src, block.caption);
  }
  if (block.type === "quote") {
    return {
      type: "quote",
      text: block.text,
      attribution: block.attribution,
    };
  }
  if (block.type === "list") {
    return { type: "list", style: block.style, items: block.items };
  }
  return null;
}

function seoExcerpt(extracted: ExtractedArticle): string {
  const text = extracted.excerpt.trim();
  if (text) return text.length > 220 ? `${text.slice(0, 217)}…` : text;
  return extracted.paragraphs[0]?.slice(0, 220) || extracted.title;
}

export function newsItemToDraft(
  item: NewsItem,
  extracted: ExtractedArticle,
): BlogPostInput {
  const summary = seoExcerpt(extracted);
  const publishedAt = item.publishedAt.slice(0, 10);
  const title = extracted.title.trim() || item.title;
  const heroImage = articleImageAllowed(extracted.imageUrl)
    ? extracted.imageUrl
    : articleImageAllowed(item.imageUrl)
      ? item.imageUrl
      : undefined;
  const heroVideo = videoUrlAllowed(extracted.videoUrl)
    ? extracted.videoUrl
    : videoUrlAllowed(item.videoUrl)
      ? item.videoUrl
      : undefined;

  const sections: ArticleSection[] = [
    {
      type: "paragraph",
      text: `The briefing below follows reporting from ${item.source} (${formatLongDate(item.publishedAt)}). Aevion Labs does not own this journalism; we present it for teams tracking design, product, and the web.`,
    },
  ];

  const bodyBlocks = capBlocks(
    extracted.blocks?.length
      ? extracted.blocks
      : extracted.paragraphs.map((text) => ({
          type: "paragraph" as const,
          text,
        })),
  );
  const seenMedia = new Set<string>();

  /** Where each piece of media ended up, so a better address can replace it. */
  const mediaAt = new Map<string, number>();

  for (const block of bodyBlocks) {
    const section = blockToSection(block);
    if (!section) continue;
    if (
      section.type === "figure" ||
      section.type === "video" ||
      section.type === "embed"
    ) {
      const key = mediaKey(section.src);
      const at = mediaAt.get(key);
      if (at !== undefined) {
        const existing = sections[at] as { src: string };
        if (betterMediaSrc(existing.src, section.src)) {
          existing.src = section.src;
        }
        continue;
      }
      mediaAt.set(key, sections.length);
      seenMedia.add(key);
    }
    sections.push(section);
  }

  if (heroImage && !seenMedia.has(mediaKey(heroImage))) {
    sections.splice(1, 0, {
      type: "figure",
      src: heroImage,
      alt: title,
      caption: item.source,
    });
    seenMedia.add(mediaKey(heroImage));
  }

  const heroSection = heroVideo ? videoSection(heroVideo, item.source) : null;
  if (heroSection && !seenMedia.has(mediaKey(heroSection.src))) {
    sections.splice(Math.min(2, sections.length), 0, heroSection);
    seenMedia.add(mediaKey(heroSection.src));
  }

  sections.push({
    type: "link",
    href: extracted.canonicalUrl || item.sourceUrl,
    label: `Read the original reporting on ${item.source}`,
  });

  return {
    title,
    excerpt: summary,
    category: "Insights",
    sub: topicSub(item),
    publishedAt,
    status: "draft",
    featured: false,
    seoTitle: title,
    seoDescription: summary,
    author: "Aevion Labs",
    sourceUrl: item.sourceUrl,
    content: legacySectionsToBlocks(sections),
  };
}
