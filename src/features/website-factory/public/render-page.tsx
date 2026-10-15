import type { Metadata } from "next";
import { notFound, permanentRedirect, redirect } from "next/navigation";
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
import {
  isNotFoundPageSlug,
  matchRedirect,
  NOT_FOUND_PAGE_SLUG,
  pathFromFactorySegments,
  readPageSeo,
  resolveRedirectTarget,
} from "@/features/website-factory/pages/settings";
import { getSiteUrl } from "@/lib/site";
import { isPuckData } from "@/features/website-factory/types";

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
  let page = site.pages.find((item) => item.slug === pageSlug);
  let resolvedSlug = pageSlug;
  if (!page?.data) {
    const fallback = site.pages.find((item) =>
      isNotFoundPageSlug(item.slug),
    );
    if (fallback?.data) {
      page = fallback;
      resolvedSlug = NOT_FOUND_PAGE_SLUG;
    }
  }
  const puck = page?.data && isPuckData(page.data) ? page.data : null;
  const seo = readPageSeo(puck, page?.title || "");
  const title = seo.title
    ? seo.title.includes(site.business.name)
      ? seo.title
      : `${seo.title} · ${site.business.name}`
    : site.seo.title || site.business.name;
  const description =
    seo.description || site.seo.description || site.business.tagline;
  const pathFn =
    mode === "live" ? factoryLivePath : mode === "preview" ? factoryPreviewPath : factoryDraftPath;
  const url = `${getSiteUrl()}${pathFn(slug, resolvedSlug)}`;
  const index =
    mode === "live" &&
    site.seo.robots.includes("index") &&
    !seo.noIndex &&
    !isNotFoundPageSlug(resolvedSlug);
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
    alternates: { canonical: mode === "live" && index ? url : undefined },
  };
}

export async function renderFactoryPage(
  slug: string,
  path: string[] | undefined,
  mode: PublicMode,
) {
  const site = await getPublicFactorySite(slug, mode);
  if (!site) notFound();

  const requestPath = pathFromFactorySegments(path);
  const hit = matchRedirect(site.siteConfig, requestPath);
  if (hit) {
    const target = resolveRedirectTarget(slug, hit.to, mode);
    if (hit.permanent) permanentRedirect(target);
    redirect(target);
  }

  const pageSlug = pageSlugFromPath(path);
  const page = site.pages.find((item) => item.slug === pageSlug);
  if (page?.data) {
    return <FactoryDocument site={site} pageSlug={pageSlug} mode={mode} />;
  }

  const notFoundPage = site.pages.find((item) =>
    isNotFoundPageSlug(item.slug),
  );
  if (notFoundPage?.data) {
    return (
      <FactoryDocument
        site={site}
        pageSlug={NOT_FOUND_PAGE_SLUG}
        mode={mode}
      />
    );
  }

  notFound();
}
