import type { CSSProperties } from "react";
import { SiteRender } from "../puck/SiteRender";
import { themeStyle } from "../puck/theme";
import { prefixPuckData } from "../puck/paths";
import type { PublicFactorySite } from "../services/public";
import {
  factoryDraftPath,
  factoryLivePath,
  factoryPreviewPath,
} from "../urls";

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
  const data = prefixPuckData(page.data, base);
  return (
    <div className="factory-site" style={themeStyle(site.theme) as CSSProperties}>
      {mode === "live" ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd(site)).replace(/</g, "\\u003c"),
          }}
        />
      ) : null}
      <SiteRender data={data} />
    </div>
  );
}
