import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FactoryDocument } from "@/features/website-factory/public/FactoryDocument";
import {
  getPublicFactorySite,
  type PublicMode,
} from "@/features/website-factory/services/public";
import {
  factoryDraftPath,
  factoryLivePath,
  factoryPreviewPath,
} from "@/features/website-factory/urls";
import { getSiteUrl } from "@/lib/site";

export function pageSlugFromPath(path?: string[]) {
  if (!path?.length) return "home";
  return path[0];
}

export async function factoryMetadata(
  slug: string,
  path: string[] | undefined,
  mode: PublicMode,
): Promise<Metadata> {
  const site = await getPublicFactorySite(slug, mode).catch(() => null);
  if (!site) return { title: "Website", robots: { index: false, follow: false } };
  const pageSlug = pageSlugFromPath(path);
  const page = site.pages.find((item) => item.slug === pageSlug);
  const title = page?.title
    ? `${page.title} · ${site.business.name}`
    : site.seo.title || site.business.name;
  const description = site.seo.description || site.business.tagline;
  const pathFn =
    mode === "live" ? factoryLivePath : mode === "preview" ? factoryPreviewPath : factoryDraftPath;
  const url = `${getSiteUrl()}${pathFn(slug, pageSlug)}`;
  const index = mode === "live" && site.seo.robots.includes("index");
  return {
    title: { absolute: title },
    description,
    robots: {
      index,
      follow: index,
    },
    icons: site.faviconUrl || site.business.logoUrl
      ? { icon: site.faviconUrl || site.business.logoUrl }
      : undefined,
    openGraph: {
      title,
      description,
      url,
      images: site.seo.ogImage ? [{ url: site.seo.ogImage }] : undefined,
    },
    alternates: { canonical: mode === "live" ? url : undefined },
  };
}

export async function renderFactoryPage(
  slug: string,
  path: string[] | undefined,
  mode: PublicMode,
) {
  const site = await getPublicFactorySite(slug, mode);
  if (!site) notFound();
  const pageSlug = pageSlugFromPath(path);
  const page = site.pages.find((item) => item.slug === pageSlug);
  if (!page?.data) notFound();
  return <FactoryDocument site={site} pageSlug={pageSlug} mode={mode} />;
}
