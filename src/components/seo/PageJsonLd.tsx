import { getSiteUrl, SITE_NAME } from "@/lib/site";

export type BreadcrumbCrumb = { name: string; path: string };

function pageUrl(path: string): string {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

/**
 * WebPage + BreadcrumbList for Google rich results and clearer indexing per URL.
 */
export function PageJsonLd({
  path,
  pageName,
  description,
  breadcrumbs,
}: {
  path: string;
  pageName: string;
  description: string;
  breadcrumbs: BreadcrumbCrumb[];
}) {
  const url = pageUrl(path);

  const webPage = {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: `${SITE_NAME} | ${pageName}`,
    description,
    inLanguage: "en-GB",
    isPartOf: {
      "@type": "WebSite",
      "@id": `${getSiteUrl()}#website`,
      name: SITE_NAME,
      url: getSiteUrl(),
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: getSiteUrl(),
    },
  };

  const breadcrumbList = {
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: b.name,
      item: pageUrl(b.path),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [webPage, breadcrumbList],
        }),
      }}
    />
  );
}
