import { fetchText, stripHtml } from "@/lib/news-intake/rss";
import type { NewsItem, NewsTopicId } from "@/lib/news-intake/types";
import type { NewsSourceRow } from "@/lib/news/sources/registry";

const STRATEGICAL_ORIGIN = "https://www.strategical.org.uk";

type ScrapedLink = {
  url: string;
  title: string;
  publishedAt: string;
  snippet?: string;
  imageUrl?: string;
};

function decodeHtml(value: string): string {
  return value
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ");
}

function parseLooseDate(value: string): string {
  const trimmed = value.trim();
  // Xinhua stamps read "2026-08-14 19:11:15" — no branch below matches those.
  const iso = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/,
  );
  if (iso) {
    const parsed = Date.parse(
      `${iso[1]}-${iso[2]}-${iso[3]}T${iso[4] ?? "00"}:${iso[5] ?? "00"}:${
        iso[6] ?? "00"
      }Z`,
    );
    if (!Number.isNaN(parsed)) return new Date(parsed).toISOString();
  }
  const range = trimmed.match(
    /(\d{1,2})\s*-\s*(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/,
  );
  if (range) {
    const parsed = Date.parse(`${range[2]} ${range[3]} ${range[4]}`);
    if (!Number.isNaN(parsed)) return new Date(parsed).toISOString();
  }
  const single = trimmed.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (single) {
    const parsed = Date.parse(`${single[1]} ${single[2]} ${single[3]}`);
    if (!Number.isNaN(parsed)) return new Date(parsed).toISOString();
  }
  const urlDate = trimmed.match(/(20\d{6})/);
  if (urlDate) {
    const raw = urlDate[1];
    const parsed = Date.parse(
      `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`,
    );
    if (!Number.isNaN(parsed)) return new Date(parsed).toISOString();
  }
  return new Date().toISOString();
}

function dateFromXinhuaUrl(url: string): string {
  const match = url.match(/english\.news\.cn\/(20\d{6})\//i);
  if (!match) return new Date().toISOString();
  const raw = match[1];
  const parsed = Date.parse(
    `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}T12:00:00Z`,
  );
  return Number.isNaN(parsed)
    ? new Date().toISOString()
    : new Date(parsed).toISOString();
}

export function parseStrategicalBriefing(html: string): ScrapedLink[] {
  const items: ScrapedLink[] = [];
  const seen = new Set<string>();
  const blockRe =
    /<p class="text-sm text-gold-500[^"]*"[^>]*>([^<]+)<\/p>\s*<h3[^>]*>([\s\S]*?)<\/h3>\s*<a[^>]+href="\/strategical-briefing\/([^"]+)"/gi;
  let match: RegExpExecArray | null;
  while ((match = blockRe.exec(html))) {
    const slug = match[3].trim();
    const url = `${STRATEGICAL_ORIGIN}/strategical-briefing/${slug}`;
    if (seen.has(url)) continue;
    seen.add(url);
    items.push({
      url,
      title: decodeHtml(stripHtml(match[2])),
      publishedAt: parseLooseDate(match[1]),
    });
  }
  if (items.length) return items;

  const fallbackRe = /href="\/strategical-briefing\/([a-z0-9-]+)"/gi;
  while ((match = fallbackRe.exec(html))) {
    const slug = match[1];
    const url = `${STRATEGICAL_ORIGIN}/strategical-briefing/${slug}`;
    if (seen.has(url)) continue;
    seen.add(url);
    items.push({
      url,
      title: slugToTitle(slug),
      publishedAt: new Date().toISOString(),
    });
  }
  return items;
}

export function parseXinhuaHomepage(html: string): ScrapedLink[] {
  const byUrl = new Map<string, ScrapedLink>();
  const titledRe =
    /<a[^>]+href=['"](https:\/\/english\.news\.cn\/20[^'"]+\/c\.html)['"][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  while ((match = titledRe.exec(html))) {
    const url = match[1];
    const title = stripHtml(match[2]);
    if (!title || title.length < 8) continue;
    if (!byUrl.has(url)) {
      byUrl.set(url, {
        url,
        title,
        publishedAt: dateFromXinhuaUrl(url),
      });
    }
  }

  const urlRe = /https:\/\/english\.news\.cn\/20\d{6}\/[a-f0-9]+\/c\.html/gi;
  while ((match = urlRe.exec(html))) {
    const url = match[0];
    if (!byUrl.has(url)) {
      byUrl.set(url, {
        url,
        title: "Xinhua report",
        publishedAt: dateFromXinhuaUrl(url),
      });
    }
  }
  return [...byUrl.values()];
}

export function parseXinhuaArticle(
  html: string,
  url: string,
): Partial<ScrapedLink> {
  const ogTitle = html.match(/property="og:title"\s+content="([^"]+)"/i)?.[1];
  const metaTitle = html.match(/<title>\s*([^<]+?)\s*<\/title>/i)?.[1];
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
  const description =
    html.match(/name="description"\s+content="([^"]+)"/i)?.[1] ||
    html.match(/property="og:description"\s+content="([^"]+)"/i)?.[1];
  const time =
    html.match(/<p class="time">([^<]+)<\/p>/i)?.[1] ||
    html.match(/data-pbtime="([^"]+)"/i)?.[1] ||
    html.match(/name="publishdate"\s+content="([^"]+)"/i)?.[1];

  let title = stripHtml(ogTitle || h1 || metaTitle || "");
  title = title
    .replace(/-Xinhua\s*$/i, "")
    .replace(/\s*\|\s*Xinhua\s*$/i, "")
    .trim();
  const publishedAt = time ? parseLooseDate(time) : dateFromXinhuaUrl(url);
  const snippet = description ? stripHtml(description) : undefined;
  const imageMatch = html.match(/<figure[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"/i);
  let imageUrl = imageMatch?.[1];
  if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
    const base = url.replace(/\/[^/]+$/, "/");
    imageUrl = new URL(imageUrl, base).toString();
  }
  return { title: title || undefined, publishedAt, snippet, imageUrl };
}

export function parseStrategicalArticle(html: string): Partial<ScrapedLink> {
  const ogTitle = html.match(/property="og:title"\s+content="([^"]+)"/i)?.[1];
  const metaTitle = html.match(/<title[^>]*>([^<]+)/i)?.[1];
  const description = html.match(
    /property="og:description"\s+content="([^"]+)"/i,
  )?.[1];
  let title = stripHtml(ogTitle || metaTitle || "");
  title = title
    .replace(/\s*-\s*The Strategical Briefing\s*\|\s*Strategical\s*$/i, "")
    .trim();
  return {
    title: title || undefined,
    snippet: description ? stripHtml(description) : undefined,
    publishedAt: new Date().toISOString(),
  };
}

async function enrichXinhuaItems(items: ScrapedLink[], limit: number) {
  const targets = items
    .filter((item) => item.title === "Xinhua report")
    .slice(0, limit);
  await Promise.all(
    targets.map(async (item) => {
      try {
        const html = await fetchText(item.url);
        const parsed = parseXinhuaArticle(html, item.url);
        if (parsed.title) item.title = parsed.title;
        if (parsed.snippet) item.snippet = parsed.snippet;
        if (parsed.publishedAt) item.publishedAt = parsed.publishedAt;
        if (parsed.imageUrl) item.imageUrl = parsed.imageUrl;
      } catch {
        /* keep listing metadata */
      }
    }),
  );
}

export async function scrapeSourceItems(
  source: Pick<
    NewsSourceRow,
    "id" | "name" | "homepage_url" | "crawl_method" | "rss_url"
  >,
  topic: NewsTopicId = "all",
): Promise<NewsItem[]> {
  const pageUrl =
    source.homepage_url ||
    (source.id === "strategical-briefing"
      ? `${STRATEGICAL_ORIGIN}/strategical-briefing`
      : "https://english.news.cn/");
  const html = await fetchText(pageUrl);
  let links: ScrapedLink[] = [];

  if (source.id === "strategical-briefing") {
    links = parseStrategicalBriefing(html).slice(0, 30);
  } else if (source.id === "xinhua-english") {
    links = parseXinhuaHomepage(html).slice(0, 40);
    await enrichXinhuaItems(links, 12);
  } else if (source.crawl_method === "scrape") {
    if (pageUrl.includes("strategical.org.uk")) {
      links = parseStrategicalBriefing(html).slice(0, 30);
    } else if (pageUrl.includes("english.news.cn")) {
      links = parseXinhuaHomepage(html).slice(0, 40);
      await enrichXinhuaItems(links, 12);
    }
  }

  return links
    .filter((item) => item.title && item.url)
    .map((item, index) => ({
      id: `${source.id}:${index}:${item.url}`,
      title: item.title,
      source: source.name,
      sourceUrl: item.url,
      publishedAt: item.publishedAt,
      snippet: item.snippet || "",
      imageUrl: item.imageUrl,
      topic,
      provider: source.id,
    }));
}

export function isScrapeSource(
  source: Pick<NewsSourceRow, "crawl_method" | "rss_url">,
) {
  return source.crawl_method === "scrape" && !source.rss_url;
}

export function isXinhuaArticleUrl(url: string): boolean {
  return /^https:\/\/english\.news\.cn\/20\d{6}\/[a-f0-9]+\/c\.html$/i.test(
    url,
  );
}
