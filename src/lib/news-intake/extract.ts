import {
  ExtractFailure,
  kindForStatus,
  type FailureKind,
} from "@/lib/news-intake/failure";
import { firecrawlPage } from "@/lib/news-intake/firecrawl";
import {
  isPaywalledUrl,
  isUnresolvedGoogleNewsUrl,
} from "@/lib/news-intake/paywalls";
import { findVideoInHtml, stripHtml } from "@/lib/news-intake/rss";
import type { Readability as ReadabilityType } from "@mozilla/readability";

const FETCH_MS = 20_000;
const MIN_ARTICLE_CHARS = 220;
const MIN_VIDEO_CHARS = 80;
const MAX_PARSE_BYTES = 2_000_000;
const MAX_RAW_BYTES = 8_000_000;
/**
 * We say who we are.
 *
 * This used to claim to be Chrome 131 on Windows, on the reasoning that a real
 * browser string gets through more doors. It does the opposite. A Chrome
 * user-agent arriving from a datacentre address, without the TLS fingerprint
 * and connection behaviour that a real Chrome would bring, reads to a bot
 * filter as a liar, and liars get the hardest refusal.
 *
 * Measured on 30 stored failures, same URLs, same everything else:
 *
 *   Chrome UA, with or without Referer ........  8 of 30 readable
 *   Chrome UA plus the full sec-ch-ua header set  8 of 30 readable
 *   Honest self-identifying bot UA ............ 23 of 30 readable
 *
 * The client hints made no difference at all, which is the tell: it was never
 * about looking complete, it was about the claim itself. Against 40 pages that
 * already read fine the honest string lost none of them.
 *
 * So: identify honestly, link to the site, and let publishers who want to
 * refuse us do it deliberately rather than because we tripped a liar-detector.
 */
const USER_AGENT =
  "Mozilla/5.0 (compatible; EWGBot/1.0; +https://elijahwgroup.com)";

const WALL_PATH =
  /\/(subscribe|subscription|login|signin|sign-in|checkout|paywall)\b/i;
const WALL_TEXT =
  /subscribe to (continue|read|unlock)|sign in to (read|continue)|this article is for subscribers|create an account to continue reading/i;

export const EXTRACT_FAIL_REASON = "Could not extract a full public article";
export const EXTRACT_PAYWALL_REASON =
  "This publisher is paywalled, so the full article is not scraped.";
export const EXTRACT_BLOCKED_REASON =
  "The publisher blocked the request. Open the original instead.";

export type ExtractedArticle = {
  title: string;
  byline?: string;
  paragraphs: string[];
  blocks: ExtractedContentBlock[];
  excerpt: string;
  imageUrl?: string;
  videoUrl?: string;
  canonicalUrl: string;
};

export type ExtractedContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "figure"; src: string; alt: string; caption: string }
  | { type: "video"; src: string; caption?: string }
  | { type: "quote"; text: string; attribution?: string }
  | { type: "list"; style: "ul" | "ol"; items: string[] };

/**
 * Every exit from this module goes through here, carrying the kind of failure
 * alongside the message so the enricher can tell a timeout worth retrying from
 * a 404 that never will be. The default stays `unreadable`: a failure we have
 * not thought about is not one to keep re-fetching.
 */
function fail(
  reason = EXTRACT_FAIL_REASON,
  kind: FailureKind = "unreadable",
  status?: number,
): never {
  throw new ExtractFailure(reason, kind, status);
}

export function stripBoilerplate(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");
}

export function ampHtmlHref(html: string): string | undefined {
  const tag = html.match(/<link\b[^>]*rel=["']amphtml["'][^>]*>/i)?.[0];
  const href = tag?.match(/\bhref=["']([^"']+)["']/i)?.[1]?.trim();
  if (!href) return undefined;
  if (href.startsWith("//")) return `https:${href}`;
  if (href.startsWith("http")) return href.split("#")[0];
  return undefined;
}

export function articleBodyFromJsonLd(html: string): string | undefined {
  const bodies: string[] = [];
  const blocks = html.matchAll(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );
  for (const match of blocks) {
    try {
      collectArticleBodies(JSON.parse(match[1]), bodies);
    } catch {
      /* ignore malformed JSON-LD */
    }
  }
  const text = bodies.join("\n\n").trim();
  return text || undefined;
}

function collectArticleBodies(node: unknown, out: string[]) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const item of node) collectArticleBodies(item, out);
    return;
  }
  const rec = node as Record<string, unknown>;
  if (typeof rec.articleBody === "string" && rec.articleBody.trim()) {
    out.push(rec.articleBody.trim());
  }
  if (rec["@graph"]) collectArticleBodies(rec["@graph"], out);
}

function looksLikeWall(url: string, html: string): boolean {
  try {
    if (WALL_PATH.test(new URL(url).pathname)) return true;
  } catch {
    return true;
  }
  const sample = html.slice(0, 80_000);
  const hits = sample.match(new RegExp(WALL_TEXT.source, "gi")) ?? [];
  return hits.length >= 3;
}

function metaContent(doc: Document, selectors: string[]): string | undefined {
  for (const selector of selectors) {
    const value = doc.querySelector(selector)?.getAttribute("content")?.trim();
    if (value?.startsWith("http")) return value.split("#")[0];
  }
  return undefined;
}

function escapeAttr(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function withBaseHref(html: string, url: string) {
  const base = `<base href="${escapeAttr(url)}">`;
  if (/<head[\s>]/i.test(html)) {
    return html.replace(/<head([^>]*)>/i, `<head$1>${base}`);
  }
  return `<!DOCTYPE html><html><head>${base}</head><body>${html}</body></html>`;
}

async function loadParser() {
  const [{ parseHTML }, { Readability }] = await Promise.all([
    import("linkedom"),
    import("@mozilla/readability"),
  ]);
  return { parseHTML, Readability };
}

function isJunkParagraph(text: string) {
  return /^(advertisement|subscribe|sign in|log in|cookie settings|share this|related stories)$/i.test(
    text,
  );
}

/**
 * Where publishers keep the article itself.
 *
 * Ordered from most specific to least: a page that marks its body with
 * `itemprop` is telling us exactly where it is, while `main` is a last resort
 * that will also sweep in navigation. The best candidate is chosen by how much
 * text it holds, not by which selector matched first, because a page can carry
 * an empty `<article>` wrapper around the real one.
 */
const ARTICLE_ROOT_SELECTORS = [
  "[itemprop='articleBody']",
  "article [data-component='text-block']",
  "[class*='article-body']",
  "[class*='articleBody']",
  "[class*='story-body']",
  "[class*='entry-content']",
  "[class*='post-content']",
  "main article",
  "article",
  "main",
];

/**
 * Furniture that sits inside the article element but is not the article.
 *
 * Removed before blocks are read, so a "read more" rail or a newsletter form
 * does not arrive as three paragraphs and a picture in the middle of the copy.
 */
const BOILERPLATE_SELECTOR = [
  "nav",
  "aside",
  "footer",
  "header",
  "form",
  "figure[class*='promo']",
  "[class*='related']",
  "[class*='recirc']",
  "[class*='newsletter']",
  "[class*='subscribe']",
  "[class*='advert']",
  "[class*='promo']",
  "[class*='share']",
  "[class*='social']",
  "[class*='breadcrumb']",
  "[class*='most-read']",
  "[class*='trending']",
  "[data-component='links-block']",
  "[role='complementary']",
  "[aria-hidden='true']",
].join(",");

/** An <img>'s real source, allowing for lazy loading and responsive sets. */
function imageSource(el: Element): string | null {
  const direct = el.getAttribute("src");
  // A lazy placeholder is a data URI or a 1px spacer; the real one is elsewhere.
  if (direct && !direct.startsWith("data:") && direct.trim().length > 5) {
    return direct;
  }
  const lazy =
    el.getAttribute("data-src") ||
    el.getAttribute("data-original") ||
    el.getAttribute("data-lazy-src");
  if (lazy) return lazy;

  // srcset is "url 320w, url 640w, …" — take the last, which is the largest.
  const set =
    el.getAttribute("srcset") ||
    el.getAttribute("data-srcset") ||
    el.closest("picture")?.querySelector("source")?.getAttribute("srcset");
  if (set) {
    const candidates = set
      .split(",")
      .map((part) => part.trim().split(/\s+/)[0])
      .filter(Boolean);
    if (candidates.length) return candidates[candidates.length - 1];
  }
  return direct || null;
}

function resolveMediaUrl(src: string | null | undefined, baseUrl: string) {
  if (!src?.trim()) return undefined;
  const value = src.trim();
  try {
    if (value.startsWith("http")) return value.split("#")[0];
    return new URL(value, baseUrl).href.split("#")[0];
  } catch {
    return undefined;
  }
}

function mediaUrlAllowed(url?: string): url is string {
  if (!url?.startsWith("http")) return false;
  try {
    const host = new URL(url).hostname.toLowerCase();
    return (
      host.endsWith(".bbci.co.uk") ||
      host.endsWith(".ytimg.com") ||
      host.endsWith(".twimg.com") ||
      host.endsWith(".cdninstagram.com") ||
      host.endsWith(".reuters.com") ||
      host.endsWith(".theguardian.com") ||
      host.endsWith(".cnn.com") ||
      host.endsWith(".apnews.com") ||
      host.includes("youtube.com") ||
      host.includes("youtu.be") ||
      host.includes("vimeo.com") ||
      (!host.includes("pixel") &&
        !host.includes("tracker") &&
        !/^(1x1|spacer|blank)\./.test(host))
    );
  } catch {
    return false;
  }
}

/**
 * The publisher's own article element, with its furniture removed.
 *
 * Readability is excellent at finding the *words* and hopeless at keeping the
 * rest: on a BBC report its output held 34 paragraphs and not one of the
 * article's 3 images, 3 figures, 2 subheadings or 8 list items. Everything the
 * outlet used to shape the piece was discarded before we ever saw it.
 *
 * So the structure is read from the page's own container instead, and
 * Readability is kept for what it is good at — the title, the byline, and a
 * fallback when no container can be identified.
 */
function findArticleRoot(document: Document): Element | null {
  let best: { el: Element; chars: number } | null = null;
  for (const selector of ARTICLE_ROOT_SELECTORS) {
    let candidates: Element[];
    try {
      candidates = [...document.querySelectorAll(selector)];
    } catch {
      continue;
    }
    for (const el of candidates) {
      const chars = (el.textContent || "").replace(/\s+/g, " ").trim().length;
      if (chars < MIN_ARTICLE_CHARS) continue;
      if (!best || chars > best.chars) best = { el, chars };
    }
    // A specific selector that matched enough text is trusted over a broader
    // one further down the list, which would drag in the whole page.
    if (best) break;
  }
  return best?.el ?? null;
}

/** Strips the furniture a publisher nests inside its own article element. */
function pruneBoilerplate(root: Element) {
  for (const el of root.querySelectorAll(BOILERPLATE_SELECTOR)) el.remove();
}

async function blocksFromContent(
  html: string,
  fallback: string,
  baseUrl: string,
): Promise<ExtractedContentBlock[]> {
  const { parseHTML } = await loadParser();
  const { document } = parseHTML(withBaseHref(`<body>${html}</body>`, baseUrl));
  const blocks: ExtractedContentBlock[] = [];
  const seenMedia = new Set<string>();

  const pushMedia = (block: ExtractedContentBlock) => {
    const key =
      block.type === "figure"
        ? block.src
        : block.type === "video"
          ? block.src
          : "";
    if (key && seenMedia.has(key)) return;
    if (key) seenMedia.add(key);
    blocks.push(block);
  };

  /**
   * Elements already represented by a block their ancestor produced.
   *
   * A blockquote holds paragraphs and a figure holds an image; matching both
   * the container and its children emitted the same words twice — the quote,
   * then the quote again as a plain paragraph.
   */
  const consumed = new Set<Element>();
  const consume = (el: Element) => {
    consumed.add(el);
    for (const child of el.querySelectorAll("*")) consumed.add(child);
  };

  const textOf = (el: Element) =>
    (el.textContent || "").replace(/\s+/g, " ").trim();

  for (const el of document.body.querySelectorAll(
    "h1,h2,h3,h4,p,figure,img,video,iframe,ul,ol,blockquote,pre",
  )) {
    if (consumed.has(el)) continue;
    const tag = el.tagName.toLowerCase();

    if (tag === "h1" || tag === "h2") {
      const text = textOf(el);
      if (text.length > 1) blocks.push({ type: "h2", text });
      consume(el);
      continue;
    }
    if (tag === "h3" || tag === "h4") {
      const text = textOf(el);
      if (text.length > 1) blocks.push({ type: "h3", text });
      consume(el);
      continue;
    }
    if (tag === "blockquote") {
      const text = textOf(el);
      // A pull-quote's attribution is usually its cite or footer line.
      const attribution =
        el.querySelector("cite,footer")?.textContent?.trim() || undefined;
      const body = attribution ? text.replace(attribution, "").trim() : text;
      if (body.length > 1) blocks.push({ type: "quote", text: body, attribution });
      consume(el);
      continue;
    }
    if (tag === "ul" || tag === "ol") {
      const items: string[] = [];
      for (const li of el.querySelectorAll(":scope > li")) {
        const text = textOf(li);
        if (text.length > 1) items.push(text);
      }
      // A single-item "list" is nearly always layout, not a list.
      if (items.length > 1) {
        blocks.push({ type: "list", style: tag === "ol" ? "ol" : "ul", items });
        consume(el);
      }
      continue;
    }
    if (tag === "p" || tag === "pre") {
      const text = textOf(el);
      if (text.length > 1 && !isJunkParagraph(text)) {
        blocks.push({ type: "paragraph", text });
      }
      consume(el);
      continue;
    }
    if (tag === "figure") {
      const img = el.querySelector("img");
      const src = resolveMediaUrl(img ? imageSource(img) : null, baseUrl);
      const caption =
        el.querySelector("figcaption")?.textContent?.replace(/\s+/g, " ").trim() ||
        img?.getAttribute("alt")?.trim() ||
        "";
      if (src && mediaUrlAllowed(src)) {
        pushMedia({ type: "figure", src, alt: caption, caption });
      }
      const media = el.querySelector("iframe,video");
      const videoSrc = resolveMediaUrl(
        media?.getAttribute("src") ||
          media?.querySelector("source")?.getAttribute("src"),
        baseUrl,
      );
      if (videoSrc && mediaUrlAllowed(videoSrc)) {
        pushMedia({ type: "video", src: videoSrc, caption });
      }
      consume(el);
      continue;
    }
    if (tag === "img") {
      const src = resolveMediaUrl(imageSource(el), baseUrl);
      if (src && mediaUrlAllowed(src)) {
        pushMedia({
          type: "figure",
          src,
          alt: el.getAttribute("alt")?.trim() || "",
          caption: el.getAttribute("title")?.trim() || "",
        });
      }
      consume(el);
      continue;
    }
    if (tag === "video" || tag === "iframe") {
      const src = resolveMediaUrl(
        el.getAttribute("src") ||
          el.querySelector("source")?.getAttribute("src"),
        baseUrl,
      );
      if (src && mediaUrlAllowed(src)) {
        pushMedia({
          type: "video",
          src,
          caption: el.getAttribute("title") || "",
        });
      }
      consume(el);
    }
  }

  if (blocks.length) return blocks;
  const paragraphs = await paragraphsFromContent(html, fallback);
  return paragraphs.map((text) => ({ type: "paragraph", text }));
}

async function paragraphsFromContent(
  html: string,
  fallback: string,
): Promise<string[]> {
  const { parseHTML } = await loadParser();
  const { document } = parseHTML(`<body>${html}</body>`);
  const nodes = [...document.querySelectorAll("p, h2, h3, li")];
  const texts = nodes
    .map((node) => (node.textContent || "").replace(/\s+/g, " ").trim())
    .filter((text) => text.length > 1 && !isJunkParagraph(text));
  if (texts.length) return texts;
  return paragraphsFromPlain(fallback);
}

function paragraphsFromPlain(text: string): string[] {
  const cleaned = stripHtml(text).replace(/\s+/g, " ").trim();
  if (!cleaned) return [];
  const blocks = text
    .split(/\n{2,}/)
    .map((part) => stripHtml(part).replace(/\s+/g, " ").trim())
    .filter((part) => part.length > 1 && !isJunkParagraph(part));
  if (blocks.length > 1) return blocks;
  if (cleaned.length <= 360) return [cleaned];
  const sentences = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [cleaned];
  const chunks: string[] = [];
  let buf = "";
  for (const sentence of sentences) {
    const next = `${buf} ${sentence.trim()}`.trim();
    if (next.length > 280 && buf) {
      chunks.push(buf);
      buf = sentence.trim();
    } else {
      buf = next;
    }
  }
  if (buf) chunks.push(buf);
  return chunks.filter((part) => part.length > 1);
}

function excerptFromParagraphs(paragraphs: string[]): string {
  const para =
    paragraphs.find((text) => text.length >= 80) ?? paragraphs[0] ?? "";
  return para.length > 220 ? `${para.slice(0, 217)}…` : para;
}

function requestHeaders(url: string): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-GB,en;q=0.9",
    "User-Agent": USER_AGENT,
  };
  try {
    headers.Referer = `${new URL(url).origin}/`;
  } catch {
    /* keep default headers */
  }
  return headers;
}

async function fetchPage(
  url: string,
): Promise<{ html: string; finalUrl: string }> {
  let res: Response;
  try {
    res = await fetch(url, {
      headers: requestHeaders(url),
      redirect: "follow",
      signal: AbortSignal.timeout(FETCH_MS),
      cache: "no-store",
    });
  } catch (err) {
    const name = err instanceof Error ? err.name : "";
    if (name === "TimeoutError" || name === "AbortError") {
      fail("The publisher took too long to respond.", "transient");
    }
    fail("Could not reach the publisher.", "transient");
  }
  if (res.status === 401 || res.status === 403 || res.status === 451) {
    /**
     * The one place Firecrawl is allowed in: the publisher has refused us and
     * no amount of asking politely from this address will change that. It
     * returns undefined when unconfigured or out of allowance, and then we
     * record the block exactly as before.
     */
    const rescued = await firecrawlPage(url);
    if (rescued) return rescued;
    fail(EXTRACT_BLOCKED_REASON, "blocked", res.status);
  }
  if (!res.ok) {
    fail(
      `Publisher returned ${res.status}.`,
      kindForStatus(res.status),
      res.status,
    );
  }
  const contentType = res.headers.get("content-type") || "";
  if (contentType && !/html|xml/i.test(contentType)) {
    fail("The publisher did not return an article page.");
  }
  const html = await res.text();
  // An empty body from a 200 is a truncated response, not a considered "no".
  if (!html) fail("The publisher returned an empty page.", "transient");
  if (html.length > MAX_RAW_BYTES)
    fail("The publisher page is too large to parse.");
  return { html, finalUrl: res.url || url };
}

async function parsePublicArticle(
  html: string,
  finalUrl: string,
): Promise<ExtractedArticle | null> {
  const videoUrl = findVideoInHtml(html);
  const jsonBody = articleBodyFromJsonLd(html);
  const stripped = stripBoilerplate(html).slice(0, MAX_PARSE_BYTES);
  if (looksLikeWall(finalUrl, stripped)) return null;

  const { parseHTML, Readability } = await loadParser();
  const { document } = parseHTML(withBaseHref(stripped, finalUrl));
  const ogImage = metaContent(document as unknown as Document, [
    'meta[property="og:image"]',
    'meta[property="og:image:url"]',
    'meta[name="twitter:image"]',
    'meta[name="twitter:image:src"]',
  ]);

  let parsed: ReturnType<ReadabilityType["parse"]> = null;
  try {
    parsed = new Readability(document as unknown as Document).parse();
  } catch {
    parsed = null;
  }

  let paragraphs: string[] = [];
  let blocks: ExtractedContentBlock[] = [];
  const title = parsed?.title?.trim() || "";
  const byline = parsed?.byline?.trim() || undefined;
  const readable = parsed?.textContent?.replace(/\s+/g, " ").trim() || "";

  const textOfBlocks = (list: ExtractedContentBlock[]) =>
    list
      .filter(
        (block): block is { type: "paragraph"; text: string } =>
          block.type === "paragraph",
      )
      .map((block) => block.text);

  if (parsed?.content && readable && !WALL_TEXT.test(readable.slice(0, 800))) {
    blocks = await blocksFromContent(
      parsed.content,
      parsed.textContent || readable,
      finalUrl,
    );
    paragraphs = textOfBlocks(blocks);
  }

  /**
   * Prefer the publisher's own structure when it holds the same article.
   *
   * Readability's copy is taken as the reference for *how much article there
   * is*; the page's own container is taken for *what shape it has*. The
   * container is used when it carries at least 80% of that text — enough to be
   * the same piece rather than a stray sidebar — which is how the images,
   * subheadings and lists survive.
   */
  /**
   * Parsed again, deliberately.
   *
   * Readability edits the document it is handed — it strips as it scores — so
   * by the time it has returned, the tree this function holds no longer
   * contains the article's own markup. Looking for the container in that
   * document found the gutted copy and changed nothing at all. A second parse
   * of the same HTML gives an untouched tree to read the structure from.
   */
  const { document: pristine } = parseHTML(withBaseHref(stripped, finalUrl));
  const root = findArticleRoot(pristine as unknown as Document);
  if (root) {
    pruneBoilerplate(root);
    const rootBlocks = await blocksFromContent(
      root.innerHTML,
      root.textContent || "",
      finalUrl,
    );
    const rootText = textOfBlocks(rootBlocks).join(" ");
    const readableText = paragraphs.join(" ");
    const richer = rootBlocks.some((block) => block.type !== "paragraph");
    const longEnough =
      rootText.length >= Math.max(readableText.length * 0.8, MIN_ARTICLE_CHARS);
    if (longEnough && (richer || rootText.length > readableText.length)) {
      blocks = rootBlocks;
      paragraphs = textOfBlocks(rootBlocks);
    }
  }

  const joined = paragraphs.join(" ");
  const minChars = videoUrl ? MIN_VIDEO_CHARS : MIN_ARTICLE_CHARS;
  if (joined.length < minChars && jsonBody) {
    const fromLd = jsonBody.includes("<")
      ? await blocksFromContent(jsonBody, jsonBody, finalUrl)
      : (await paragraphsFromPlain(jsonBody)).map((text) => ({
          type: "paragraph" as const,
          text,
        }));
    const ldText = fromLd
      .filter((block) => block.type === "paragraph")
      .map((block) => block.text)
      .join(" ");
    if (ldText.length > joined.length) {
      blocks = fromLd;
      paragraphs = textOfBlocks(fromLd);
    }
  }

  if (!paragraphs.length && jsonBody) {
    blocks = jsonBody.includes("<")
      ? await blocksFromContent(jsonBody, jsonBody, finalUrl)
      : (await paragraphsFromPlain(jsonBody)).map((text) => ({
          type: "paragraph" as const,
          text,
        }));
    paragraphs = textOfBlocks(blocks);
  }

  const text = paragraphs.join(" ").replace(/\s+/g, " ").trim();
  if (!paragraphs.length || text.length < minChars) return null;
  if (WALL_TEXT.test(text.slice(0, 800))) return null;

  return {
    title,
    byline,
    paragraphs,
    blocks,
    excerpt: excerptFromParagraphs(paragraphs),
    imageUrl: ogImage,
    videoUrl,
    canonicalUrl: finalUrl.split("#")[0],
  };
}

export async function extractArticle(url: string): Promise<ExtractedArticle> {
  if (isUnresolvedGoogleNewsUrl(url)) {
    fail(
      "This Google News link was not resolved to the publisher.",
      "unreadable",
    );
  }
  if (isPaywalledUrl(url)) fail(EXTRACT_PAYWALL_REASON, "paywalled");

  const first = await fetchPage(url);
  const finalUrl = first.finalUrl;
  let pathname = "";
  try {
    pathname = new URL(finalUrl).pathname;
  } catch {
    fail(EXTRACT_FAIL_REASON);
  }
  if (isPaywalledUrl(finalUrl) || WALL_PATH.test(pathname)) {
    fail(EXTRACT_PAYWALL_REASON, "paywalled");
  }

  let article = await parsePublicArticle(first.html, finalUrl);
  const amp = ampHtmlHref(first.html);
  if (!article && amp && amp !== url && amp !== finalUrl) {
    try {
      const second = await fetchPage(amp);
      if (!isPaywalledUrl(second.finalUrl)) {
        article = await parsePublicArticle(second.html, second.finalUrl);
      }
    } catch {
      /* keep the original failure */
    }
  }
  if (!article) fail(EXTRACT_FAIL_REASON);

  rememberExtracted(url, article);
  if (article.canonicalUrl !== url) {
    rememberExtracted(article.canonicalUrl, article);
  }
  return article;
}

const EXTRACT_CACHE_MS = 15 * 60 * 1000;
const extractCache = new Map<
  string,
  { expires: number; article: ExtractedArticle }
>();

export function rememberExtracted(url: string, article: ExtractedArticle) {
  extractCache.set(url, {
    expires: Date.now() + EXTRACT_CACHE_MS,
    article,
  });
}

export function getCachedExtract(url: string): ExtractedArticle | undefined {
  const hit = extractCache.get(url);
  if (!hit || hit.expires < Date.now()) {
    extractCache.delete(url);
    return undefined;
  }
  return hit.article;
}

export function clearExtractCache() {
  extractCache.clear();
}

export async function extractArticleCached(
  url: string,
): Promise<ExtractedArticle> {
  const cached = getCachedExtract(url);
  if (cached) return cached;
  return extractArticle(url);
}
