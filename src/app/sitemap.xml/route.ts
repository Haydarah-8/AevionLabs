import { SITEMAP_STATIC_PATHS } from "@/lib/sitemap-paths";
import { getSiteUrl } from "@/lib/site";
import { listPublishedPosts } from "@/lib/blog/store";
import { listPublishedCustomPaths } from "@/lib/cms/store";
import { PLATFORM_TOPICS, SERVICE_TOPICS } from "@/data/topics";
import { listPublishedFactoryPaths } from "@/features/website-factory/services/public";

export const dynamic = "force-dynamic";

const URLSET_NS = "http://www.sitemaps.org/schemas/sitemap/0.9";

function xmlEscape(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlEntry(
  loc: string,
  lastmod: string,
  changefreq: string,
  priority: string,
): string {
  return [
    "<url>",
    `<loc>${xmlEscape(loc)}</loc>`,
    `<lastmod>${lastmod}</lastmod>`,
    `<changefreq>${changefreq}</changefreq>`,
    `<priority>${priority}</priority>`,
    "</url>",
  ].join("");
}

/** Sitemap index URL stays `/sitemap.xml` (see `robots.ts`). */
export async function GET() {
  const base = getSiteUrl();
  const lastmod = new Date().toISOString();

  const newsSlugs = (await listPublishedPosts())
    .map((post) => post.slug)
    .sort((a, b) => a.localeCompare(b));
  const customPaths = await listPublishedCustomPaths();
  const factoryPaths = await listPublishedFactoryPaths().catch(() => []);

  const urls: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<urlset xmlns="${URLSET_NS}">`,
    ...SITEMAP_STATIC_PATHS.map(({ path, changefreq, priority }) =>
      urlEntry(`${base}${path}`, lastmod, changefreq, priority),
    ),
    ...newsSlugs.map((slug) =>
      urlEntry(`${base}/news/${slug}`, lastmod, "weekly", "0.82"),
    ),
    ...PLATFORM_TOPICS.map((topic) =>
      urlEntry(`${base}/with/${topic.slug}`, lastmod, "monthly", "0.55"),
    ),
    ...SERVICE_TOPICS.map((topic) =>
      urlEntry(`${base}/services/${topic.slug}`, lastmod, "monthly", "0.7"),
    ),
    ...customPaths.map((path) =>
      urlEntry(`${base}${path}`, lastmod, "monthly", "0.6"),
    ),
    ...factoryPaths.map((item) =>
      urlEntry(`${base}${item.path}`, item.lastmod, "weekly", "0.7"),
    ),
    "</urlset>",
  ];

  return new Response(urls.join(""), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
