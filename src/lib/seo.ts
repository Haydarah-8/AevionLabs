import type { Metadata } from "next";
import { DEFAULT_DESCRIPTION, getSiteUrl, SITE_NAME } from "@/lib/site";

function normalizePath(path: string): string {
  if (!path || path === "/") return "";
  return path.startsWith("/") ? path : `/${path}`;
}

/** Converts `DD.MM.YYYY` (site display) to `YYYY-MM-DD` for ISO / Open Graph. */
export function parseDisplayDateToIso(display: string): string | undefined {
  const m = display.trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!m) return undefined;
  const [, dd, mm, yyyy] = m;
  return `${yyyy}-${mm}-${dd}`;
}

export type BuildMetadataInput = {
  /** Page title segment (becomes `Aevion Labs · {title}` via root template). */
  title: string;
  description?: string;
  path: string;
  keywords?: string[];
  /** Absolute URL or path starting with / for OG/Twitter images */
  ogImage?: string;
  noIndex?: boolean;
  /** Use `article` for news posts (Open Graph + Google). */
  ogType?: "website" | "article";
  /** ISO 8601 date-time for articles, e.g. `2026-03-20` or full `2026-03-20T12:00:00.000Z` */
  publishedTime?: string;
  modifiedTime?: string;
};

/**
 * Per-route metadata: canonical URL, hreflang, Open Graph, Twitter, robots.
 * Canonical URLs always use `getSiteUrl()` (set `NEXT_PUBLIC_SITE_URL` in production).
 */
export function buildMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  keywords,
  ogImage,
  noIndex,
  ogType = "website",
  publishedTime,
  modifiedTime,
}: BuildMetadataInput): Metadata {
  const siteOrigin = getSiteUrl();
  const suffix = normalizePath(path);
  const url = suffix ? `${siteOrigin}${suffix}` : siteOrigin;

  const imageUrl =
    ogImage && (ogImage.startsWith("http") || ogImage.startsWith("//"))
      ? ogImage
      : ogImage
        ? `${siteOrigin}${normalizePath(ogImage)}`
        : `${siteOrigin}/icon.svg`;

  const fullTitle = `${SITE_NAME} | ${title}`;

  const core: Metadata = {
    title,
    description,
    keywords: keywords?.length ? keywords : undefined,
    authors: [{ name: SITE_NAME, url: siteOrigin }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: "business",
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    alternates: {
      canonical: url,
      /** Single locale → one hreflang entry (same URL twice confuses crawlers). */
      languages: { "en-GB": url },
    },
  };

  if (noIndex) {
    return core;
  }

  const publishedIso =
    publishedTime && !publishedTime.includes("T")
      ? `${publishedTime}T12:00:00.000Z`
      : publishedTime;
  const modifiedIso =
    modifiedTime && !modifiedTime.includes("T")
      ? `${modifiedTime}T12:00:00.000Z`
      : (modifiedTime ?? publishedIso);

  const openGraphArticle =
    ogType === "article" && publishedIso
      ? {
          publishedTime: publishedIso,
          modifiedTime: modifiedIso,
          authors: [SITE_NAME],
          section: "Insights",
        }
      : {};

  return {
    ...core,
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_GB",
      type: ogType === "article" ? "article" : "website",
      images: [{ url: imageUrl, alt: title }],
      ...openGraphArticle,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [imageUrl],
    },
  };
}
