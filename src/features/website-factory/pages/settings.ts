/**
 * Page settings, site redirects, and reserved 404 page (Phase 11).
 * Redirects live on project.siteConfig; page SEO on draft root.props.
 */

import type { PuckData, SiteConfig, SiteRedirect } from "../types";

export type { SiteRedirect };

/** Reserved page slug rendered when a path misses. Hidden from nav by default. */
export const NOT_FOUND_PAGE_SLUG = "404";

export type PageSeoSettings = {
  title: string;
  description: string;
  noIndex: boolean;
};

export function normalizeRedirectPath(input: string): string {
  let path = (input || "").trim();
  if (!path) return "/";
  if (!path.startsWith("/")) path = `/${path}`;
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return path;
}

/** Request path from factory `[[...path]]` segments (home → `/`). */
export function pathFromFactorySegments(path?: string[]): string {
  if (!path?.length) return "/";
  return normalizeRedirectPath(`/${path.join("/")}`);
}

export function listRedirects(siteConfig?: SiteConfig | null): SiteRedirect[] {
  const raw = siteConfig?.redirects;
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (item): item is SiteRedirect =>
        Boolean(item) &&
        typeof item === "object" &&
        typeof (item as SiteRedirect).id === "string" &&
        typeof (item as SiteRedirect).from === "string" &&
        typeof (item as SiteRedirect).to === "string",
    )
    .map((item) => ({
      id: item.id,
      from: normalizeRedirectPath(item.from),
      to:
        /^https?:\/\//i.test(item.to.trim())
          ? item.to.trim()
          : normalizeRedirectPath(item.to),
      permanent: Boolean(item.permanent),
    }));
}

export function createRedirect(partial?: Partial<SiteRedirect>): SiteRedirect {
  return {
    id: `redir_${Date.now().toString(36)}`,
    from: normalizeRedirectPath(partial?.from || "/old-path"),
    to: /^https?:\/\//i.test((partial?.to || "").trim())
      ? (partial?.to || "").trim()
      : normalizeRedirectPath(partial?.to || "/"),
    permanent: Boolean(partial?.permanent),
  };
}

export function upsertRedirect(
  siteConfig: SiteConfig,
  redirect: SiteRedirect,
): SiteConfig {
  const next = createRedirect(redirect);
  const list = listRedirects(siteConfig);
  const idx = list.findIndex((item) => item.id === next.id);
  const redirects =
    idx >= 0
      ? list.map((item, i) => (i === idx ? next : item))
      : [...list, next];
  return { ...siteConfig, redirects };
}

export function removeRedirect(
  siteConfig: SiteConfig,
  redirectId: string,
): SiteConfig {
  const redirects = listRedirects(siteConfig).filter(
    (item) => item.id !== redirectId,
  );
  if (!redirects.length) {
    const { redirects: _drop, ...rest } = siteConfig;
    void _drop;
    return rest;
  }
  return { ...siteConfig, redirects };
}

export function matchRedirect(
  siteConfig: SiteConfig | null | undefined,
  requestPath: string,
): SiteRedirect | null {
  const path = normalizeRedirectPath(requestPath);
  return (
    listRedirects(siteConfig).find((item) => item.from === path) ?? null
  );
}

/**
 * Resolve redirect target for factory routes.
 * Absolute http(s) URLs pass through; site paths are prefixed with /s|/p|/preview.
 */
export function resolveRedirectTarget(
  projectSlug: string,
  to: string,
  mode: "live" | "preview" | "draft",
): string {
  const trimmed = (to || "").trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const base =
    mode === "live"
      ? `/s/${projectSlug}`
      : mode === "preview"
        ? `/p/${projectSlug}`
        : `/preview/${projectSlug}`;
  const path = normalizeRedirectPath(trimmed);
  if (path === "/" || path === "/home") return base;
  return `${base}${path}`;
}

export function isNotFoundPageSlug(slug: string): boolean {
  return slug === NOT_FOUND_PAGE_SLUG;
}

export function readPageSeo(
  data: PuckData | null | undefined,
  fallbackTitle = "",
): PageSeoSettings {
  const props = (data?.root?.props || {}) as Record<string, unknown>;
  return {
    title:
      typeof props.title === "string" && props.title
        ? props.title
        : fallbackTitle,
    description:
      typeof props.description === "string" ? props.description : "",
    noIndex: Boolean(props.noIndex),
  };
}

export function patchPageSeo(
  data: PuckData,
  patch: Partial<PageSeoSettings>,
): PuckData {
  const current = readPageSeo(data);
  const next = { ...current, ...patch };
  const props: Record<string, unknown> = {
    ...(data.root?.props || {}),
  };
  if (next.title) props.title = next.title;
  else delete props.title;
  if (next.description) props.description = next.description;
  else delete props.description;
  if (next.noIndex) props.noIndex = true;
  else delete props.noIndex;
  return {
    ...data,
    root: {
      ...data.root,
      props,
    },
  };
}

/** Default 404 page sections for generate / "Add 404 page". */
export function notFoundPageDef() {
  return {
    slug: NOT_FOUND_PAGE_SLUG,
    title: "Page not found",
    navLabel: "404",
    showInNav: false,
    sections: [
      { type: "AnnouncementBar" as const },
      { type: "Navbar" as const },
      {
        type: "PageHero" as const,
        defaults: {
          heading: "Page not found",
          subheading: "That URL is not on this site.",
        },
      },
      {
        type: "CTA" as const,
        defaults: {
          heading: "Back to the homepage",
          description: "Or use the menu above.",
          label: "Home",
          href: "/",
        },
      },
      { type: "Footer" as const },
    ],
  };
}
