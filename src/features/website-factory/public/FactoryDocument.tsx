import type { CSSProperties } from "react";
import { SiteRender } from "../puck/SiteRender";
import { themeStyle } from "../puck/theme";
import { prefixPuckData } from "../puck/paths";
import type { PublicFactorySite } from "../services/public";
import { factoryDraftPath, factoryLivePath, factoryPreviewPath } from "../urls";
import { isGrapesDocument, isLegacyHtmlDocument, isPuckData } from "../types";

function jsonLd(site: PublicFactorySite) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: site.business.name,
    description: site.business.description || site.business.tagline,
    image: site.business.logoUrl || undefined,
    telephone: site.business.phone || undefined,
    email: site.business.email || undefined,
    url: factoryLivePath(site.slug),
    address: site.business.address
      ? {
          "@type": "PostalAddress",
          streetAddress: site.business.address,
          postalCode: site.business.postcode || undefined,
        }
      : undefined,
    openingHours: Object.entries(site.business.openingHours)
      .filter(([, value]) => value)
      .map(([day, value]) => `${day} ${value}`),
    sameAs: Object.values(site.business.social).filter(Boolean),
  };
}

function HtmlFrame({ html, title }: { html: string; title: string }) {
  return (
    <iframe
      title={title}
      srcDoc={html}
      className="factory-html-frame"
      style={{
        width: "100%",
        minHeight: "100vh",
        border: 0,
        display: "block",
        background: "#fff",
      }}
    />
  );
}

export function FactoryDocument({
  site,
  pageSlug,
  mode,
}: {
  site: PublicFactorySite;
  pageSlug: string;
  mode: "preview" | "live" | "draft";
}) {
  const page = site.pages.find((item) => item.slug === pageSlug);
  if (!page?.data) return null;
  const base =
    mode === "live"
      ? factoryLivePath(site.slug)
      : mode === "preview"
        ? factoryPreviewPath(site.slug)
        : factoryDraftPath(site.slug);

  if (isGrapesDocument(page.data)) {
    const { html, css } = page.data.native;
    const srcDoc = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>${css}</style></head><body>${html}</body></html>`;
    return (
      <div className="factory-site factory-site-grapes">
        {mode === "live" ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(jsonLd(site)).replace(/</g, "\\u003c"),
            }}
          />
        ) : null}
        <HtmlFrame html={srcDoc} title={page.title} />
      </div>
    );
  }

  const legacyHtml = isLegacyHtmlDocument(page.data) ? page.data.native : null;

  if (legacyHtml) {
    return (
      <div className="factory-site factory-site-html">
        {mode === "live" ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(jsonLd(site)).replace(/</g, "\\u003c"),
            }}
          />
        ) : null}
        <HtmlFrame html={legacyHtml} title={page.title} />
      </div>
    );
  }

  if (!isPuckData(page.data)) return null;
  const data = prefixPuckData(page.data, base);
  return (
    <div
      className="factory-site"
      style={themeStyle(site.theme) as CSSProperties}
    >
      {mode === "live" ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd(site)).replace(/</g, "\\u003c"),
          }}
        />
      ) : null}
      <SiteRender
        data={data}
        siteConfig={site.siteConfig}
        business={site.business}
      />
    </div>
  );
}
