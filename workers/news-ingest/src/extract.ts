import { load } from "cheerio";

export type ExtractedMeta = {
  title?: string;
  description?: string;
  author?: string;
  publishedAt?: string;
  imageUrl?: string;
  canonicalUrl?: string;
  excerpt?: string;
};

function meta($: ReturnType<typeof load>, keys: string[]) {
  for (const key of keys) {
    const value =
      $(`meta[property="${key}"]`).attr("content") ||
      $(`meta[name="${key}"]`).attr("content");
    if (value?.trim()) return value.trim();
  }
  return undefined;
}

export function extractJsonLd(html: string): ExtractedMeta {
  const $ = load(html);
  const out: ExtractedMeta = {
    title: $("title").first().text().trim() || undefined,
    description: meta($, ["og:description", "description"]),
    imageUrl: meta($, ["og:image", "twitter:image"]),
    canonicalUrl:
      $('link[rel="canonical"]').attr("href") || meta($, ["og:url"]),
    author: meta($, ["author", "article:author"]),
    publishedAt: meta($, ["article:published_time", "og:published_time"]),
  };
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const raw = $(el).text();
      const json = JSON.parse(raw) as Record<string, unknown> | unknown[];
      const nodes = Array.isArray(json) ? json : [json];
      for (const node of nodes) {
        const item = node as Record<string, unknown>;
        const graph = item["@graph"];
        const list = Array.isArray(graph) ? graph : [item];
        for (const entry of list as Array<Record<string, unknown>>) {
          const type = String(entry["@type"] || "");
          if (!/article|news/i.test(type) && !entry.headline) continue;
          out.title = String(entry.headline || out.title || "");
          out.description = String(entry.description || out.description || "");
          out.author =
            typeof entry.author === "string"
              ? entry.author
              : (entry.author as { name?: string } | undefined)?.name ||
                out.author;
          out.publishedAt = String(
            entry.datePublished || entry.dateCreated || out.publishedAt || "",
          );
          const image = entry.image as { url?: string } | string | undefined;
          out.imageUrl =
            typeof image === "string" ? image : image?.url || out.imageUrl;
        }
      }
    } catch {
      /* ignore bad json-ld */
    }
  });
  const paras = $("article p, main p")
    .map((_, el) => $(el).text().replace(/\s+/g, " ").trim())
    .get()
    .filter((text) => text.length > 40);
  if (paras[0]) out.excerpt = paras[0].slice(0, 400);
  return out;
}

export async function extractViaPython(
  html: string,
  url: string,
): Promise<ExtractedMeta | null> {
  const endpoint =
    process.env.NEWS_EXTRACT_URL?.trim() || "http://127.0.0.1:8788/extract";
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html, url }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as ExtractedMeta;
    return data;
  } catch {
    return null;
  }
}

export function mergeMeta(
  ...layers: Array<ExtractedMeta | null | undefined>
): ExtractedMeta {
  const out: ExtractedMeta = {};
  for (const layer of layers) {
    if (!layer) continue;
    out.title = out.title || layer.title;
    out.description = out.description || layer.description;
    out.author = out.author || layer.author;
    out.publishedAt = out.publishedAt || layer.publishedAt;
    out.imageUrl = out.imageUrl || layer.imageUrl;
    out.canonicalUrl = out.canonicalUrl || layer.canonicalUrl;
    out.excerpt = out.excerpt || layer.excerpt;
  }
  if (out.excerpt) out.excerpt = out.excerpt.slice(0, 400);
  return out;
}
