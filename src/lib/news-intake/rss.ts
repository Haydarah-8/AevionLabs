import { isPaywalledUrl } from "@/lib/news-intake/paywalls";
import { isTechRelated } from "@/lib/news/tech";
import {
  PRIMARY_NEWS_SOURCE_IDS,
  isTechSeedSource,
} from "@/lib/news/sources/registry";
import { socialPlatformFromUrl } from "@/lib/news/social";
import {
  NEWS_TOPICS,
  type NewsItem,
  type NewsTopicId,
} from "@/lib/news-intake/types";

const FETCH_MS = 9000;

export async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      Accept:
        "application/rss+xml, application/xml, text/xml, application/json, */*",
      "User-Agent": "ElijahWGroup-NewsIntake/1.0",
    },
    signal: AbortSignal.timeout(FETCH_MS),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

export async function fetchJson<T>(url: string): Promise<T> {
  const text = await fetchText(url);
  return JSON.parse(text) as T;
}

const NAMED_ENTITIES: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  quot: '"',
  apos: "'",
  lt: "<",
  gt: ">",
  ldquo: "“",
  rdquo: "”",
  lsquo: "‘",
  rsquo: "’",
  mdash: "—",
  ndash: "–",
  hellip: "…",
  eacute: "é",
  egrave: "è",
  uuml: "ü",
  ouml: "ö",
  auml: "ä",
  ccedil: "ç",
  pound: "£",
  euro: "€",
  deg: "°",
};

/**
 * Turns every HTML entity a feed might carry back into the character.
 *
 * The old pair of hand-written replacement chains only knew `&#39;`, so the
 * zero-padded `&#039;` that WordPress emits and the curly `&#8217;` that most
 * outlets use both survived untouched — 32 of 633 headlines on the desk read
 * "Iran&#039;s" rather than "Iran's". Numeric entities are decoded by their
 * code point instead of being enumerated, which is the only way to keep up
 * with what publishers actually send.
 *
 * Two passes, because feeds are routinely double-encoded: `&amp;#039;` needs
 * its `&amp;` resolved before the numeric entity underneath is even visible.
 */
export function decodeEntities(value: string): string {
  let out = value;
  for (let pass = 0; pass < 2; pass += 1) {
    if (!out.includes("&")) break;
    out = out
      .replace(/&#x([0-9a-f]+);/gi, (whole, hex: string) => {
        const code = Number.parseInt(hex, 16);
        return code > 0 && code <= 0x10ffff
          ? String.fromCodePoint(code)
          : whole;
      })
      .replace(/&#(\d+);/g, (whole, dec: string) => {
        const code = Number.parseInt(dec, 10);
        return code > 0 && code <= 0x10ffff
          ? String.fromCodePoint(code)
          : whole;
      })
      .replace(/&([a-z][a-z0-9]*);/gi, (whole, name: string) => {
        return NAMED_ENTITIES[name.toLowerCase()] ?? whole;
      });
  }
  return out;
}

export function stripHtml(value: string): string {
  return decodeEntities(
    value
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

export function decodeXml(value: string): string {
  return decodeEntities(
    value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1"),
  );
}

function tag(block: string, name: string): string {
  const match = block.match(
    new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"),
  );
  return match ? decodeXml(match[1].trim()) : "";
}

function attr(block: string, name: string, attribute: string): string {
  const match = block.match(
    new RegExp(`<${name}[^>]*\\s${attribute}=["']([^"']+)["'][^>]*\\/?>`, "i"),
  );
  return match ? decodeXml(match[1]) : "";
}

function firstHref(html: string): string {
  const match = html.match(/href=["'](https?:\/\/[^"']+)["']/i);
  return match ? match[1] : "";
}

function isoDate(value: string): string {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return new Date().toISOString();
  return new Date(parsed).toISOString();
}

export function titleKey(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .slice(0, 96);
}

export function isSponsoredItem(
  title: string,
  snippet = "",
  url = "",
  block = "",
): boolean {
  const heading = title.trim();
  const hay = `${title} ${snippet} ${block}`.toLowerCase();
  if (
    /^(advertisement|advertorial|sponsored|paid (post|content)|partner content)\b/i.test(
      heading,
    )
  ) {
    return true;
  }
  if (
    /\b(advertorial|sponsored content|paid partnership|partner content|cnn underscored)\b/i.test(
      hay,
    )
  ) {
    return true;
  }
  if (
    /<category[^>]*>\s*(advertisement|sponsored|advertorial|shopping)/i.test(
      block,
    )
  ) {
    return true;
  }
  if (
    /\b(shop now|buy now|\d+%\s*off|limited[- ]time offer|home equity|cash out of your home|cash you can use)\b/i.test(
      hay,
    )
  ) {
    return true;
  }
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./i, "").toLowerCase();
    const path = `${parsed.pathname}${parsed.search}`.toLowerCase();
    if (
      AD_HOSTS.some(
        (blocked) => host === blocked || host.endsWith(`.${blocked}`),
      )
    ) {
      return true;
    }
    if (
      /\/(advert|advertisement|sponsored|aclk|cnn-underscored)\b/.test(path) ||
      /utm_medium=(cpc|ppc|paid|display)/i.test(path)
    ) {
      return true;
    }
  } catch {
    return true;
  }
  return false;
}

const AD_HOSTS = [
  "doubleclick.net",
  "googleadservices.com",
  "googlesyndication.com",
  "googletagmanager.com",
  "taboola.com",
  "outbrain.com",
  "mgid.com",
  "revcontent.com",
  "amazon.com",
  "amazon.co.uk",
  "ebay.com",
  "ebay.co.uk",
  "etsy.com",
  "shopping.google.com",
  "facebook.com",
  "criteo.com",
];

function isAdMediaUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./i, "").toLowerCase();
    return AD_HOSTS.some(
      (blocked) => host === blocked || host.endsWith(`.${blocked}`),
    );
  } catch {
    return true;
  }
}

export function isTechNewsEvent(
  title: string,
  snippet = "",
  url = "",
  category = "",
): boolean {
  return isTechRelated(title, snippet, url, category);
}

/** @deprecated Use isTechNewsEvent. Kept so older tests still compile. */
export function isHardNewsEvent(
  title: string,
  snippet = "",
  url = "",
): boolean {
  return isTechNewsEvent(title, snippet, url);
}

export function matchesNewsTopic(
  title: string,
  snippet: string,
  topicId: NewsTopicId,
): boolean {
  if (topicId === "all") return true;
  const topic = NEWS_TOPICS.find((entry) => entry.id === topicId);
  if (!topic) return true;
  const hay = `${title} ${snippet}`.toLowerCase();
  const terms = topic.query
    .split(/\s+OR\s+/i)
    .map((term) => term.replace(/"/g, "").trim().toLowerCase())
    .filter(Boolean);
  return terms.some((term) => hay.includes(term));
}

export function passesAdminNewsFilter(
  title: string,
  snippet: string,
  url: string,
  topic: NewsTopicId = "all",
  block = "",
  provider = "",
): boolean {
  if (isSponsoredItem(title, snippet, url, block)) return false;
  if (
    socialPlatformFromUrl(url) ||
    provider.startsWith("youtube-") ||
    provider.startsWith("x-") ||
    provider.startsWith("tiktok-") ||
    provider.startsWith("instagram-")
  ) {
    return false;
  }
  const fromTechDesk =
    PRIMARY_NEWS_SOURCE_IDS.has(provider) || isTechSeedSource(provider);
  if (!fromTechDesk && !isTechNewsEvent(title, snippet, url)) return false;
  return topic === "all" || matchesNewsTopic(title, snippet, topic);
}

function absHttpUrl(value: string): string | undefined {
  const trimmed = value.trim().split("#")[0];
  const url = trimmed.startsWith("//") ? `https:${trimmed}` : trimmed;
  if (!url.startsWith("http")) return undefined;
  return url;
}

function isPlayableVideoUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "youtu.be" ||
      host === "youtube-nocookie.com"
    ) {
      return true;
    }
    if (host === "vimeo.com" || host === "player.vimeo.com") return true;
    if (host === "players.brightcove.net") return true;
    if (host === "tiktok.com" || host.endsWith(".tiktok.com")) return true;
    if (host === "instagram.com") return true;
    if (host === "x.com" || host === "twitter.com") return true;
    // HLS counts: outlet video is very often an m3u8 playlist and nothing
    // else. Whether the browser can play it is a separate question, answered
    // where it is rendered.
    return /\.(mp4|webm|m3u8)(\?|$)/i.test(parsed.pathname);
  } catch {
    return false;
  }
}

export function findVideoInHtml(html: string): string | undefined {
  const sample = html.slice(0, 180_000);
  const youtube = sample.match(
    /(?:youtube(?:-nocookie)?\.com\/(?:embed\/|shorts\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i,
  );
  if (youtube?.[1]) return `https://www.youtube.com/watch?v=${youtube[1]}`;

  /**
   * Brightcove, which several broadcasters use and which renders entirely in
   * JavaScript.
   *
   * Al Jazeera's video pages carry no og:video, no JSON-LD and no file — only
   * an account id and a video id, from which the public player URL can be
   * rebuilt. Without this every one of their video pages resolves to nothing.
   */
  const brightcove =
    /players\.brightcove\.net\/(\d+)\/[^/]*\/index\.html\?videoId=(\d+)/i.exec(
      sample,
    ) ??
    /"accountId"\s*:\s*"?(\d{6,})"?[\s\S]{0,600}?"videoId"\s*:\s*"?(\d{6,})"?/i.exec(
      sample,
    ) ??
    /data-account=["'](\d{6,})["'][\s\S]{0,400}?data-video-id=["'](\d{6,})["']/i.exec(
      sample,
    );
  if (brightcove) {
    return `https://players.brightcove.net/${brightcove[1]}/default_default/index.html?videoId=${brightcove[2]}`;
  }

  const vimeo = sample.match(/player\.vimeo\.com\/video\/(\d+)/i);
  if (vimeo?.[1]) return `https://vimeo.com/${vimeo[1]}`;

  for (const match of sample.matchAll(/<iframe[^>]+src=["']([^"']+)["']/gi)) {
    const url = absHttpUrl(match[1]);
    if (url && !isAdMediaUrl(url) && isPlayableVideoUrl(url)) return url;
  }

  const ogVideo =
    /property=["']og:video(?::url|:secure_url)?["'][^>]*content=["']([^"']+)["']/i.exec(
      sample,
    )?.[1] ||
    /content=["']([^"']+)["'][^>]*property=["']og:video(?::url|:secure_url)?["']/i.exec(
      sample,
    )?.[1] ||
    /name=["']twitter:player(?::stream)?["'][^>]*content=["']([^"']+)["']/i.exec(
      sample,
    )?.[1];
  const ogUrl = ogVideo ? absHttpUrl(ogVideo) : undefined;
  if (ogUrl && !isAdMediaUrl(ogUrl) && isPlayableVideoUrl(ogUrl)) return ogUrl;

  const file = sample.match(
    /<(?:video|source)[^>]+src=["'](https?:\/\/[^"']+\.(?:mp4|webm|m3u8)[^"']*)["']/i,
  );
  if (file?.[1] && !isAdMediaUrl(file[1])) return file[1].split("#")[0];

  /**
   * JSON-LD, which is where several outlets put the only machine-readable
   * source they publish. NBC gives no og:video at all and only a contentUrl.
   *
   * Every match is collected rather than the first, because the same block
   * frequently carries an m3u8 and an mp4 for the same clip and only the mp4
   * plays in a plain <video>.
   */
  const contentUrls = [
    ...sample.matchAll(/"contentUrl"\s*:\s*"([^"]+)"/gi),
  ]
    .map((match) => match[1].replace(/\\\//g, "/"))
    .filter((url) => !isAdMediaUrl(url) && isPlayableVideoUrl(url));
  const progressive = contentUrls.find((url) => /\.(mp4|webm)(\?|$)/i.test(url));
  if (progressive) return progressive.split("#")[0];

  /**
   * No looser fallback than this.
   *
   * Scanning the page for any bare .mp4 was tried and removed: on an NBC video
   * page it matched an image-transform URL that merely contained the string,
   * and in doing so discarded the working HLS playlist found above. A guess
   * that displaces a real answer is worse than no guess.
   */
  if (contentUrls[0]) return contentUrls[0].split("#")[0];

  for (const match of sample.matchAll(
    /"(?:embedUrl|contentUrl)"\s*:\s*"(https?:\\\/\\\/[^"]+|https?:\/\/[^"]+)"/gi,
  )) {
    const url = absHttpUrl(match[1].replace(/\\\//g, "/"));
    if (url && !isAdMediaUrl(url) && isPlayableVideoUrl(url)) return url;
  }

  return undefined;
}

function collectMedia(block: string, description: string) {
  const found: Array<{ url: string; kind: "image" | "video" }> = [];
  const tags = block.matchAll(
    /<(?:media:content|media:thumbnail|enclosure)([^>]+)>/gi,
  );
  for (const match of tags) {
    const attrs = match[1];
    const url = /(?:url|href)=["']([^"']+)["']/i.exec(attrs)?.[1];
    if (!url?.startsWith("http") || isAdMediaUrl(url)) continue;
    const type = (
      /(?:type|medium)=["']([^"']+)["']/i.exec(attrs)?.[1] || ""
    ).toLowerCase();
    const video =
      type.includes("video") || /\.(mp4|m3u8|webm)(\?|$)/i.test(url);
    found.push({ url, kind: video ? "video" : "image" });
  }
  const htmlImg = /<img[^>]+src=["'](https?:\/\/[^"']+)["']/i.exec(description);
  if (htmlImg?.[1] && !isAdMediaUrl(htmlImg[1])) {
    found.push({ url: htmlImg[1], kind: "image" });
  }
  const htmlVideo = findVideoInHtml(`${block}\n${description}`);
  if (htmlVideo) found.push({ url: htmlVideo, kind: "video" });
  return {
    imageUrl: found.find((item) => item.kind === "image")?.url,
    videoUrl: found.find((item) => item.kind === "video")?.url,
  };
}

const META_FETCH_MS = 8000;

export async function enrichMedia(
  url: string,
): Promise<{ imageUrl?: string; videoUrl?: string }> {
  if (isPaywalledUrl(url) || socialPlatformFromUrl(url)) return {};
  try {
    const res = await fetch(url, {
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "ElijahWGroup-NewsIntake/1.0",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(META_FETCH_MS),
      cache: "no-store",
    });
    if (!res.ok) return {};
    const html = (await res.text()).slice(0, 180_000);
    const image =
      /property=["']og:image(?::url)?["'][^>]*content=["'](https?:\/\/[^"']+)["']/i.exec(
        html,
      )?.[1] ||
      /content=["'](https?:\/\/[^"']+)["'][^>]*property=["']og:image(?::url)?["']/i.exec(
        html,
      )?.[1] ||
      /name=["']twitter:image(?::src)?["'][^>]*content=["'](https?:\/\/[^"']+)["']/i.exec(
        html,
      )?.[1];
    const video = findVideoInHtml(html);
    return {
      imageUrl: image && !isAdMediaUrl(image) ? image.split("#")[0] : undefined,
      videoUrl: video,
    };
  } catch {
    return {};
  }
}

export async function enrichMissingVideos<
  T extends { imageUrl?: string; videoUrl?: string },
>(items: T[], urlOf: (item: T) => string, limit = 20): Promise<void> {
  const needs = items.filter((item) => !item.videoUrl).slice(0, limit);
  for (let i = 0; i < needs.length; i += 4) {
    await Promise.all(
      needs.slice(i, i + 4).map(async (item) => {
        const media = await enrichMedia(urlOf(item));
        if (media.imageUrl && !item.imageUrl) item.imageUrl = media.imageUrl;
        if (media.videoUrl) item.videoUrl = media.videoUrl;
      }),
    );
  }
}

export function parseRss(
  xml: string,
  meta: { source: string; provider: string; topic: NewsTopicId },
): NewsItem[] {
  const chunks = [
    ...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi),
    ...xml.matchAll(/<entry\b[\s\S]*?<\/entry>/gi),
  ];

  return chunks
    .map((match) => {
      const block = match[0];
      const rawTitle = stripHtml(tag(block, "title"));
      let link =
        tag(block, "link") ||
        attr(block, "link", "href") ||
        tag(block, "guid") ||
        firstHref(tag(block, "description") || tag(block, "summary"));
      const description =
        tag(block, "description") ||
        tag(block, "summary") ||
        tag(block, "content") ||
        tag(block, "content:encoded");
      if (link.includes("news.google.com")) {
        const publisher = firstHref(description);
        if (publisher) link = publisher;
      }
      const media = collectMedia(block, description);
      const published =
        tag(block, "pubDate") ||
        tag(block, "published") ||
        tag(block, "updated") ||
        tag(block, "dc:date");
      let source = meta.source;
      const dash = rawTitle.lastIndexOf(" - ");
      let title = rawTitle;
      if (dash > 20 && meta.provider === "Google News") {
        source = rawTitle.slice(dash + 3).trim() || source;
        title = rawTitle.slice(0, dash).trim();
      }
      if (!title || !link.startsWith("http")) return null;
      const snippet = stripHtml(description).slice(0, 600);
      const sourceUrl = link.split("#")[0];
      if (
        !passesAdminNewsFilter(
          title,
          snippet,
          sourceUrl,
          meta.topic,
          block,
          meta.provider,
        )
      ) {
        return null;
      }
      const item: NewsItem = {
        id: `${meta.provider}:${link}`,
        title,
        source,
        sourceUrl,
        publishedAt: isoDate(published),
        snippet,
        topic: meta.topic,
        provider: meta.provider,
      };
      if (media.imageUrl) item.imageUrl = media.imageUrl;
      if (media.videoUrl) item.videoUrl = media.videoUrl;
      const platform = socialPlatformFromUrl(sourceUrl);
      if (platform && !item.videoUrl) item.videoUrl = sourceUrl;
      return item;
    })
    .filter((item): item is NewsItem => item !== null);
}
