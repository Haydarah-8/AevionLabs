import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { Business, PuckData, SeoConfig, ThemeTokens } from "../types";
import { asPuckOrNull, asTheme, getProjectBySlug } from "./store";
import { isMissingTable } from "./persistence";

export type PublicMode = "preview" | "live" | "draft";

export type PublicFactoryPage = {
  slug: string;
  title: string;
  data: PuckData | null;
};

export type PublicFactorySite = {
  slug: string;
  name: string;
  status: string;
  theme: ThemeTokens;
  seo: SeoConfig;
  faviconUrl: string;
  business: Pick<
    Business,
    | "name"
    | "tagline"
    | "description"
    | "logoUrl"
    | "phone"
    | "email"
    | "address"
    | "postcode"
    | "openingHours"
    | "social"
    | "industry"
  >;
  pages: PublicFactoryPage[];
};

function asSeo(value: unknown): SeoConfig {
  const seo = (value ?? {}) as Record<string, unknown>;
  return {
    title: typeof seo.title === "string" ? seo.title : "",
    description: typeof seo.description === "string" ? seo.description : "",
    ogImage: typeof seo.ogImage === "string" ? seo.ogImage : "",
    robots: typeof seo.robots === "string" ? seo.robots : "index,follow",
  };
}

function asStringRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: Record<string, string> = {};
  for (const [key, item] of Object.entries(value)) {
    if (typeof item === "string") out[key] = item;
  }
  return out;
}

export async function getPublicFactorySite(
  slug: string,
  mode: PublicMode,
): Promise<PublicFactorySite | null> {
  const fromFiles = async () => {
    const bundle = await getProjectBySlug(slug);
    if (!bundle) return null;
    const dataColumn =
      mode === "draft"
        ? "draftData"
        : mode === "preview"
          ? "previewData"
          : "publishedData";
    return {
      slug: bundle.project.slug,
      name: bundle.project.name,
      status: bundle.project.status,
      theme: bundle.project.theme,
      seo: bundle.project.seoConfig,
      faviconUrl: bundle.business.faviconUrl,
      business: {
        name: bundle.business.name,
        tagline: bundle.business.tagline,
        description: bundle.business.description,
        logoUrl: bundle.business.logoUrl,
        phone: bundle.business.phone,
        email: bundle.business.email,
        address: bundle.business.address,
        postcode: bundle.business.postcode,
        openingHours: bundle.business.openingHours,
        social: bundle.business.social,
        industry: bundle.business.industry,
      },
      pages: bundle.pages.map((page) => ({
        slug: page.slug,
        title: page.title,
        data: page[dataColumn],
      })),
    } satisfies PublicFactorySite;
  };

  try {
    const db = getSupabaseAdmin();
    const { data: project, error } = await db
      .from("website_projects")
      .select("id, slug, name, status, theme, seo_config, business_id")
      .eq("slug", slug)
      .maybeSingle();
    if (error) {
      if (isMissingTable(error)) return fromFiles();
      throw new Error(error.message);
    }
    if (!project) return fromFiles();

    const dataColumn =
      mode === "draft"
        ? "draft_data"
        : mode === "preview"
          ? "preview_data"
          : "published_data";

    const { data: pages, error: pagesError } = await db
      .from("website_pages")
      .select(`slug, title, ${dataColumn}`)
      .eq("project_id", project.id)
      .order("nav_order");
    if (pagesError) throw new Error(pagesError.message);

    const { data: business, error: businessError } = await db
      .from("businesses")
      .select(
        "name, tagline, description, logo_url, favicon_url, phone, email, address, postcode, opening_hours, social, industry",
      )
      .eq("id", project.business_id)
      .maybeSingle();
    if (businessError) throw new Error(businessError.message);
    if (!business) return fromFiles();

    return {
      slug: String(project.slug),
      name: String(project.name ?? ""),
      status: String(project.status ?? ""),
      theme: asTheme(project.theme),
      seo: asSeo(project.seo_config),
      faviconUrl: String(business.favicon_url ?? ""),
      business: {
        name: String(business.name ?? ""),
        tagline: String(business.tagline ?? ""),
        description: String(business.description ?? ""),
        logoUrl: String(business.logo_url ?? ""),
        phone: String(business.phone ?? ""),
        email: String(business.email ?? ""),
        address: String(business.address ?? ""),
        postcode: String(business.postcode ?? ""),
        openingHours: asStringRecord(business.opening_hours),
        social: asStringRecord(business.social),
        industry: String(business.industry ?? ""),
      },
      pages: (pages ?? []).map((row) => {
        const record = row as Record<string, unknown>;
        return {
          slug: String(record.slug ?? ""),
          title: String(record.title ?? ""),
          data: asPuckOrNull(record[dataColumn]),
        };
      }),
    };
  } catch (err) {
    if (isMissingTable(err)) return fromFiles();
    throw err;
  }
}

export async function listPublishedFactoryPaths() {
  try {
    const db = getSupabaseAdmin();
  const { data: projects, error } = await db
    .from("website_projects")
    .select("id, slug, updated_at")
    .eq("status", "published");
  if (error) throw new Error(error.message);
  if (!projects?.length) return [] as Array<{ path: string; lastmod: string }>;

  const ids = projects.map((row) => String(row.id));
  const { data: pages, error: pagesError } = await db
    .from("website_pages")
    .select("project_id, slug")
    .in("project_id", ids)
    .not("published_data", "is", null);
  if (pagesError) throw new Error(pagesError.message);

  const byProject = new Map(projects.map((row) => [String(row.id), row]));
  const out: Array<{ path: string; lastmod: string }> = [];
  for (const page of pages ?? []) {
    const project = byProject.get(String(page.project_id));
    if (!project) continue;
    const lastmod = String(project.updated_at ?? new Date().toISOString());
    const pageSlug = String(page.slug ?? "home");
    out.push({
      path:
        pageSlug === "home"
          ? `/s/${project.slug}`
          : `/s/${project.slug}/${pageSlug}`,
      lastmod,
    });
  }
  return out;
  } catch (err) {
    if (!isMissingTable(err)) throw err;
    const { listProjects } = await import("./store");
    const projects = await listProjects();
    return projects
      .filter((project) => project.status === "published")
      .map((project) => ({
        path: `/s/${project.slug}`,
        lastmod: project.updatedAt,
      }));
  }
}
