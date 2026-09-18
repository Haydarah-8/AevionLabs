import { revalidatePath } from "next/cache";
import { newId, slugify } from "@/lib/blog/utils";
import { hasSupabaseAdmin, getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  DEFAULT_SETTINGS,
  RESERVED_SLUGS,
  SETTINGS_KEY,
  SYSTEM_SLUGS,
} from "@/lib/cms/constants";
import { seedPages, seedProjects } from "@/lib/cms/seed";
import { defaultData } from "@/lib/cms/section-defs";
import {
  HERO_BODY,
  HERO_CTA_HREF,
  HERO_CTA_LABEL,
  HERO_HEADLINE,
  HOME_CTA_HEADING,
  LEGACY_HERO_BODY,
  LEGACY_HERO_HEADLINE,
  PREV_HERO_BODY,
  PREV_HERO_HEADLINE,
} from "@/data/copy";
import type {
  CmsPage,
  CmsPageInput,
  CmsPageSummary,
  CmsProject,
  CmsProjectInput,
  CmsProjectRow,
  CmsSection,
  CmsSectionInput,
  CmsStatus,
  NavItem,
  SiteSettings,
} from "@/lib/cms/types";

const MISSING_DB =
  "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set: site content is stored in the database.";

function isMissingRelation(
  error: { code?: string; message?: string } | null | undefined,
) {
  if (!error) return false;
  return (
    error.code === "PGRST205" ||
    /schema cache|does not exist/i.test(error.message ?? "")
  );
}

let seedPromise: Promise<void> | null = null;

export function revalidateCms(path?: string) {
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/work");
  revalidatePath("/news");
  revalidatePath("/services");
  revalidatePath("/practice-areas");
  revalidatePath("/practice-areas/details");
  revalidatePath("/sitemap.xml");
  if (path && path !== "/") revalidatePath(path);
}

function requireAdmin() {
  if (!hasSupabaseAdmin()) throw new Error(MISSING_DB);
  return getSupabaseAdmin();
}

function asStatus(value: unknown): CmsStatus {
  return value === "published" ? "published" : "draft";
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item)).filter(Boolean);
}

function asRows(value: unknown): CmsProjectRow[] {
  if (!Array.isArray(value)) return [];
  return value.map((row) => {
    const record = (row ?? {}) as Record<string, unknown>;
    return {
      cpt: String(record.cpt ?? ""),
      text: String(record.text ?? ""),
      imgSrc: record.imgSrc ? String(record.imgSrc) : undefined,
      imgAlt: record.imgAlt ? String(record.imgAlt) : undefined,
    };
  });
}

function pageFromRow(
  row: Record<string, unknown>,
  sections: CmsSection[] = [],
): CmsPage {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title ?? ""),
    navLabel: String(row.nav_label ?? ""),
    showInNav: Boolean(row.show_in_nav),
    navOrder: Number(row.nav_order ?? 0),
    status: asStatus(row.status),
    isSystem: Boolean(row.is_system),
    path: String(row.path || `/${row.slug}`),
    seoTitle: String(row.seo_title ?? ""),
    seoDescription: String(row.seo_description ?? ""),
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
    sections,
  };
}

function summaryFromRow(row: Record<string, unknown>): CmsPageSummary {
  const { sections: _sections, ...rest } = pageFromRow(row);
  return rest;
}

function sectionFromRow(row: Record<string, unknown>): CmsSection {
  return {
    id: String(row.id),
    pageId: String(row.page_id),
    type: String(row.type),
    sortOrder: Number(row.sort_order ?? 0),
    visible: row.visible !== false,
    data:
      row.data && typeof row.data === "object" && !Array.isArray(row.data)
        ? (row.data as Record<string, unknown>)
        : {},
  };
}

function projectFromRow(row: Record<string, unknown>): CmsProject {
  return {
    id: String(row.id),
    slug: String(row.slug),
    client: String(row.client ?? ""),
    overview: String(row.overview ?? ""),
    services: asStringArray(row.services),
    year: String(row.year ?? ""),
    heroSrc: String(row.hero_src ?? ""),
    heroAlt: String(row.hero_alt ?? ""),
    rows: asRows(row.rows),
    resultCpt: String(row.result_cpt ?? ""),
    resultText: String(row.result_text ?? ""),
    status: asStatus(row.status),
    featured: Boolean(row.featured),
    sortOrder: Number(row.sort_order ?? 0),
    seoTitle: String(row.seo_title ?? ""),
    seoDescription: String(row.seo_description ?? ""),
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

function settingsFromValue(value: unknown): SiteSettings {
  const record =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  return {
    siteName: String(record.siteName ?? DEFAULT_SETTINGS.siteName),
    tagline: String(record.tagline ?? DEFAULT_SETTINGS.tagline),
    description: String(record.description ?? DEFAULT_SETTINGS.description),
    contactEmail: String(record.contactEmail ?? DEFAULT_SETTINGS.contactEmail),
    generalEmail: String(record.generalEmail ?? DEFAULT_SETTINGS.generalEmail),
    contactEmailDisplay: String(
      record.contactEmailDisplay ?? DEFAULT_SETTINGS.contactEmailDisplay,
    ),
    location: String(record.location ?? DEFAULT_SETTINGS.location),
    prefooterHeading: String(
      record.prefooterHeading ?? DEFAULT_SETTINGS.prefooterHeading,
    ),
    prefooterCtaLabel: String(
      record.prefooterCtaLabel ?? DEFAULT_SETTINGS.prefooterCtaLabel,
    ),
    prefooterCtaHref: String(
      record.prefooterCtaHref ?? DEFAULT_SETTINGS.prefooterCtaHref,
    ),
    prefooterImage: String(
      record.prefooterImage ?? DEFAULT_SETTINGS.prefooterImage,
    ),
    footerCopyright: String(
      record.footerCopyright ?? DEFAULT_SETTINGS.footerCopyright,
    ),
    footerDecoration: String(
      record.footerDecoration ?? DEFAULT_SETTINGS.footerDecoration,
    ),
  };
}

function pathForSlug(slug: string, existingPath?: string) {
  if (slug === "home") return "/";
  if (slug === "services") return "/services";
  if (existingPath) return existingPath;
  return `/${slug}`;
}

function assertSlug(slug: string, { isSystem }: { isSystem: boolean }) {
  if (!slug) throw new Error("Slug is required");
  if (RESERVED_SLUGS.has(slug)) throw new Error("That URL is reserved");
  if (!isSystem && SYSTEM_SLUGS.has(slug)) {
    throw new Error("That URL already belongs to a built-in page");
  }
}

async function seedIfEmpty() {
  if (!hasSupabaseAdmin()) return;
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("cms_pages")
    .select("id", { count: "exact", head: true });
  if (error) {
    if (!isMissingRelation(error))
      console.error("[cms] seed count:", error.message);
    return;
  }
  if ((count ?? 0) > 0) return;

  const { pages, sections } = seedPages();
  const { error: pageError } = await supabase.from("cms_pages").insert(
    pages.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      nav_label: p.navLabel,
      show_in_nav: p.showInNav,
      nav_order: p.navOrder,
      status: p.status,
      is_system: p.isSystem,
      path: p.path,
      seo_title: p.seoTitle,
      seo_description: p.seoDescription,
    })),
  );
  if (pageError) {
    console.error("[cms] seed pages:", pageError.message);
    return;
  }

  const { error: sectionError } = await supabase.from("cms_sections").insert(
    sections.map((s) => ({
      id: s.id,
      page_id: s.pageId,
      type: s.type,
      sort_order: s.sortOrder,
      visible: s.visible,
      data: s.data,
    })),
  );
  if (sectionError) console.error("[cms] seed sections:", sectionError.message);

  const { count: projectCount } = await supabase
    .from("cms_projects")
    .select("id", { count: "exact", head: true });
  if (!(projectCount ?? 0)) {
    const { error: projectError } = await supabase.from("cms_projects").insert(
      seedProjects().map((p) => ({
        id: p.id,
        slug: p.slug,
        client: p.client,
        overview: p.overview,
        services: p.services,
        year: p.year,
        hero_src: p.heroSrc,
        hero_alt: p.heroAlt,
        rows: p.rows,
        result_cpt: p.resultCpt,
        result_text: p.resultText,
        status: p.status,
        featured: p.featured,
        sort_order: p.sortOrder,
        seo_title: p.seoTitle,
        seo_description: p.seoDescription,
      })),
    );
    if (projectError)
      console.error("[cms] seed projects:", projectError.message);
  }

  await supabase.from("cms_settings").upsert({
    key: SETTINGS_KEY,
    value: DEFAULT_SETTINGS,
    updated_at: new Date().toISOString(),
  });
}

async function syncPublicSurface() {
  if (!hasSupabaseAdmin()) return;
  const supabase = getSupabaseAdmin();

  const hideWork = await supabase
    .from("cms_pages")
    .update({ show_in_nav: false })
    .eq("slug", "work");
  if (hideWork.error && !isMissingRelation(hideWork.error)) {
    console.error("[cms] hide work nav:", hideWork.error.message);
  }

  const showBlogs = await supabase
    .from("cms_pages")
    .update({
      show_in_nav: true,
      nav_label: "INSIGHTS",
      nav_order: 3,
      title: "Insights",
      seo_title: "Insights",
    })
    .eq("slug", "news");
  if (showBlogs.error && !isMissingRelation(showBlogs.error)) {
    console.error("[cms] show blogs nav:", showBlogs.error.message);
  }

  const hero = await supabase
    .from("cms_sections")
    .select("id, data")
    .eq("id", "sec-home-hero")
    .maybeSingle();
  if (hero.error && !isMissingRelation(hero.error)) {
    console.error("[cms] read home hero:", hero.error.message);
    return;
  }
  const data = (hero.data?.data ?? {}) as Record<string, unknown>;
  const headline = String(data.headline ?? "");
  if (headline !== LEGACY_HERO_HEADLINE && headline !== PREV_HERO_HEADLINE) {
    return;
  }

  const body = String(data.body ?? "");
  const { error: heroError } = await supabase
    .from("cms_sections")
    .update({
      data: {
        ...data,
        headline: HERO_HEADLINE,
        body:
          body === LEGACY_HERO_BODY || body === PREV_HERO_BODY
            ? HERO_BODY
            : data.body,
        ctaLabel:
          String(data.ctaLabel ?? "") === "Meet the agency"
            ? HERO_CTA_LABEL
            : data.ctaLabel,
        ctaHref:
          String(data.ctaHref ?? "") === "/about"
            ? HERO_CTA_HREF
            : data.ctaHref,
      },
    })
    .eq("id", "sec-home-hero");
  if (heroError) console.error("[cms] update home hero:", heroError.message);

  const cta = await supabase
    .from("cms_sections")
    .select("id, data")
    .eq("id", "sec-home-cta")
    .maybeSingle();
  const ctaData = (cta.data?.data ?? {}) as Record<string, unknown>;
  if (
    String(ctaData.heading ?? "") ===
    "A focused agency. Selective about what we take on."
  ) {
    await supabase
      .from("cms_sections")
      .update({
        data: {
          ...ctaData,
          heading: HOME_CTA_HEADING,
          ctaLabel: HERO_CTA_LABEL,
          ctaHref: HERO_CTA_HREF,
        },
      })
      .eq("id", "sec-home-cta");
  }
}

export async function ensureCmsSeeded() {
  if (!seedPromise)
    seedPromise = seedIfEmpty()
      .then(() => syncPublicSurface())
      .catch((err) => {
        seedPromise = null;
        throw err;
      });
  return seedPromise;
}

async function sectionsForPage(pageId: string): Promise<CmsSection[]> {
  const supabase = requireAdmin();
  const { data, error } = await supabase
    .from("cms_sections")
    .select("*")
    .eq("page_id", pageId)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) =>
    sectionFromRow(row as Record<string, unknown>),
  );
}

export async function listPages(): Promise<CmsPageSummary[]> {
  await ensureCmsSeeded();
  const supabase = requireAdmin();
  const { data, error } = await supabase
    .from("cms_pages")
    .select("*")
    .order("nav_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) =>
    summaryFromRow(row as Record<string, unknown>),
  );
}

export async function getPageById(id: string): Promise<CmsPage | null> {
  await ensureCmsSeeded();
  const supabase = requireAdmin();
  const { data, error } = await supabase
    .from("cms_pages")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const page = pageFromRow(data as Record<string, unknown>);
  page.sections = await sectionsForPage(page.id);
  return page;
}

export async function getPublishedPageBySlug(
  slug: string,
): Promise<CmsPage | null> {
  try {
    await ensureCmsSeeded();
    if (!hasSupabaseAdmin()) return null;
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("cms_pages")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) {
      if (isMissingRelation(error)) return null;
      throw new Error(error.message);
    }
    if (!data) return null;
    const page = pageFromRow(data as Record<string, unknown>);
    const sections = await sectionsForPage(page.id);
    page.sections = sections.filter((section) => section.visible);
    return page;
  } catch (err) {
    if (!isMissingRelation(err as { message?: string })) {
      console.error("[cms] getPublishedPageBySlug:", err);
    }
    return null;
  }
}

export async function getPublishedPageByPath(
  path: string,
): Promise<CmsPage | null> {
  try {
    await ensureCmsSeeded();
    if (!hasSupabaseAdmin()) return null;
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("cms_pages")
      .select("*")
      .eq("path", path)
      .eq("status", "published")
      .maybeSingle();
    if (error) {
      if (isMissingRelation(error)) return null;
      throw new Error(error.message);
    }
    if (!data) return null;
    const page = pageFromRow(data as Record<string, unknown>);
    const sections = await sectionsForPage(page.id);
    page.sections = sections.filter((section) => section.visible);
    return page;
  } catch (err) {
    if (!isMissingRelation(err as { message?: string })) {
      console.error("[cms] getPublishedPageByPath:", err);
    }
    return null;
  }
}

export async function getNavItems(): Promise<NavItem[]> {
  try {
    await ensureCmsSeeded();
    if (!hasSupabaseAdmin()) return [];
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("cms_pages")
      .select("path, nav_label, title, nav_order")
      .eq("status", "published")
      .eq("show_in_nav", true)
      .order("nav_order", { ascending: true });
    if (error) {
      if (isMissingRelation(error)) return [];
      throw new Error(error.message);
    }
    const items = (data ?? [])
      .map((row) => ({
        href: String(row.path || "/")
          .replace("/practice-areas/details", "/services")
          .replace(/^\/practice-areas$/, "/services"),
        label: String(row.nav_label || row.title || "").trim(),
      }))
      .filter(
        (item) =>
          item.label &&
          item.href !== "/work" &&
          !item.href.startsWith("/work/"),
      );
    if (!items.some((item) => item.href === "/news")) {
      items.push({ href: "/news", label: "INSIGHTS" });
    }
    return items;
  } catch (err) {
    if (!isMissingRelation(err as { message?: string })) {
      console.error("[cms] getNavItems:", err);
    }
    return [];
  }
}

export async function listPublishedCustomPaths(): Promise<string[]> {
  try {
    await ensureCmsSeeded();
    if (!hasSupabaseAdmin()) return [];
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("cms_pages")
      .select("path, is_system, status")
      .eq("status", "published")
      .eq("is_system", false);
    if (error) {
      if (isMissingRelation(error)) return [];
      throw new Error(error.message);
    }
    return (data ?? []).map((row) => String(row.path)).filter(Boolean);
  } catch (err) {
    if (!isMissingRelation(err as { message?: string })) {
      console.error("[cms] listPublishedCustomPaths:", err);
    }
    return [];
  }
}

export async function createPage(input: CmsPageInput = {}): Promise<CmsPage> {
  await ensureCmsSeeded();
  const supabase = requireAdmin();
  const title = String(input.title || "New page").trim() || "New page";
  const slug = slugify(input.slug || title) || `page-${newId().slice(0, 8)}`;
  assertSlug(slug, { isSystem: false });
  const id = `page-${newId()}`;
  const path = pathForSlug(slug, input.path);
  const { data, error } = await supabase
    .from("cms_pages")
    .insert({
      id,
      slug,
      title,
      nav_label: String(input.navLabel || title).toUpperCase(),
      show_in_nav: Boolean(input.showInNav),
      nav_order: Number(input.navOrder ?? 50),
      status: asStatus(input.status),
      is_system: false,
      path,
      seo_title: input.seoTitle ?? "",
      seo_description: input.seoDescription ?? "",
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  const created = pageFromRow(data as Record<string, unknown>, []);
  await addSection(created.id, { type: "page_hero" });
  return (await getPageById(created.id)) ?? created;
}

export async function updatePage(
  id: string,
  input: CmsPageInput,
): Promise<CmsPage | null> {
  await ensureCmsSeeded();
  const existing = await getPageById(id);
  if (!existing) return null;
  const supabase = requireAdmin();
  const nextSlug = existing.isSystem
    ? existing.slug
    : slugify(input.slug ?? existing.slug) || existing.slug;
  if (!existing.isSystem) assertSlug(nextSlug, { isSystem: false });
  const patch: Record<string, unknown> = {
    title: input.title ?? existing.title,
    nav_label: input.navLabel ?? existing.navLabel,
    show_in_nav: input.showInNav ?? existing.showInNav,
    nav_order: input.navOrder ?? existing.navOrder,
    status: input.status ?? existing.status,
    seo_title: input.seoTitle ?? existing.seoTitle,
    seo_description: input.seoDescription ?? existing.seoDescription,
    slug: nextSlug,
    path: existing.isSystem ? existing.path : pathForSlug(nextSlug, input.path),
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("cms_pages").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  return getPageById(id);
}

export async function deletePage(id: string): Promise<boolean> {
  await ensureCmsSeeded();
  const existing = await getPageById(id);
  if (!existing) return false;
  if (existing.isSystem)
    throw new Error(
      "Built-in pages cannot be deleted. Hide them from the nav or unpublish instead.",
    );
  const supabase = requireAdmin();
  const { error } = await supabase.from("cms_pages").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return true;
}

export async function addSection(
  pageId: string,
  input: CmsSectionInput = {},
): Promise<CmsSection> {
  const page = await getPageById(pageId);
  if (!page) throw new Error("Page not found");
  const type = String(input.type || "rich_text");
  const supabase = requireAdmin();
  const sortOrder =
    input.sortOrder ??
    page.sections.reduce(
      (max, section) => Math.max(max, section.sortOrder),
      -1,
    ) + 1;
  const id = `sec-${newId()}`;
  const { data, error } = await supabase
    .from("cms_sections")
    .insert({
      id,
      page_id: pageId,
      type,
      sort_order: sortOrder,
      visible: input.visible !== false,
      data: input.data ?? defaultData(type),
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return sectionFromRow(data as Record<string, unknown>);
}

export async function updateSection(
  id: string,
  input: CmsSectionInput,
): Promise<CmsSection | null> {
  const supabase = requireAdmin();
  const { data: existing, error: lookupError } = await supabase
    .from("cms_sections")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (lookupError) throw new Error(lookupError.message);
  if (!existing) return null;
  const current = sectionFromRow(existing as Record<string, unknown>);
  const { data, error } = await supabase
    .from("cms_sections")
    .update({
      type: input.type ?? current.type,
      sort_order: input.sortOrder ?? current.sortOrder,
      visible: input.visible ?? current.visible,
      data: input.data ?? current.data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return sectionFromRow(data as Record<string, unknown>);
}

export async function deleteSection(id: string): Promise<boolean> {
  const supabase = requireAdmin();
  const { error } = await supabase.from("cms_sections").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return true;
}

export async function reorderSections(
  pageId: string,
  ids: string[],
): Promise<CmsSection[]> {
  const supabase = requireAdmin();
  await Promise.all(
    ids.map((id, index) =>
      supabase
        .from("cms_sections")
        .update({ sort_order: index, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("page_id", pageId),
    ),
  );
  return sectionsForPage(pageId);
}

export async function listProjects(
  includeDrafts = false,
): Promise<CmsProject[]> {
  await ensureCmsSeeded();
  const supabase = requireAdmin();
  let query = supabase.from("cms_projects").select("*").order("sort_order", {
    ascending: true,
  });
  if (!includeDrafts) query = query.eq("status", "published");
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) =>
    projectFromRow(row as Record<string, unknown>),
  );
}

export async function listPublishedProjects(): Promise<CmsProject[]> {
  try {
    await ensureCmsSeeded();
    if (!hasSupabaseAdmin()) return [];
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("cms_projects")
      .select("*")
      .eq("status", "published")
      .order("sort_order", { ascending: true });
    if (error) {
      if (isMissingRelation(error)) return [];
      throw new Error(error.message);
    }
    return (data ?? []).map((row) =>
      projectFromRow(row as Record<string, unknown>),
    );
  } catch (err) {
    if (!isMissingRelation(err as { message?: string })) {
      console.error("[cms] listPublishedProjects:", err);
    }
    return [];
  }
}

export async function getProjectById(id: string): Promise<CmsProject | null> {
  await ensureCmsSeeded();
  const supabase = requireAdmin();
  const { data, error } = await supabase
    .from("cms_projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return projectFromRow(data as Record<string, unknown>);
}

export async function getPublishedProjectBySlug(
  slug: string,
): Promise<CmsProject | null> {
  try {
    await ensureCmsSeeded();
    if (!hasSupabaseAdmin()) return null;
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("cms_projects")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) {
      if (isMissingRelation(error)) return null;
      throw new Error(error.message);
    }
    if (!data) return null;
    return projectFromRow(data as Record<string, unknown>);
  } catch (err) {
    if (!isMissingRelation(err as { message?: string })) {
      console.error("[cms] getPublishedProjectBySlug:", err);
    }
    return null;
  }
}

export async function createProject(
  input: CmsProjectInput = {},
): Promise<CmsProject> {
  await ensureCmsSeeded();
  const supabase = requireAdmin();
  const client =
    String(input.client || "Untitled project").trim() || "Untitled project";
  const slug =
    slugify(input.slug || client) || `project-${newId().slice(0, 8)}`;
  const id = `project-${newId()}`;
  const { data, error } = await supabase
    .from("cms_projects")
    .insert({
      id,
      slug,
      client,
      overview: input.overview ?? "",
      services: input.services ?? [],
      year: input.year ?? String(new Date().getFullYear()),
      hero_src: input.heroSrc ?? "",
      hero_alt: input.heroAlt ?? "",
      rows: input.rows ?? [],
      result_cpt: input.resultCpt ?? "Result",
      result_text: input.resultText ?? "",
      status: asStatus(input.status),
      featured: Boolean(input.featured),
      sort_order: Number(input.sortOrder ?? 50),
      seo_title: input.seoTitle ?? client,
      seo_description: input.seoDescription ?? "",
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return projectFromRow(data as Record<string, unknown>);
}

export async function updateProject(
  id: string,
  input: CmsProjectInput,
): Promise<CmsProject | null> {
  const existing = await getProjectById(id);
  if (!existing) return null;
  const supabase = requireAdmin();
  const slug = slugify(input.slug ?? existing.slug) || existing.slug;
  const { error } = await supabase
    .from("cms_projects")
    .update({
      slug,
      client: input.client ?? existing.client,
      overview: input.overview ?? existing.overview,
      services: input.services ?? existing.services,
      year: input.year ?? existing.year,
      hero_src: input.heroSrc ?? existing.heroSrc,
      hero_alt: input.heroAlt ?? existing.heroAlt,
      rows: input.rows ?? existing.rows,
      result_cpt: input.resultCpt ?? existing.resultCpt,
      result_text: input.resultText ?? existing.resultText,
      status: input.status ?? existing.status,
      featured: input.featured ?? existing.featured,
      sort_order: input.sortOrder ?? existing.sortOrder,
      seo_title: input.seoTitle ?? existing.seoTitle,
      seo_description: input.seoDescription ?? existing.seoDescription,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  return getProjectById(id);
}

export async function deleteProject(id: string): Promise<boolean> {
  const supabase = requireAdmin();
  const { error } = await supabase.from("cms_projects").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return true;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    await ensureCmsSeeded();
    if (!hasSupabaseAdmin()) return DEFAULT_SETTINGS;
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("cms_settings")
      .select("value")
      .eq("key", SETTINGS_KEY)
      .maybeSingle();
    if (error) {
      if (isMissingRelation(error)) return DEFAULT_SETTINGS;
      throw new Error(error.message);
    }
    return settingsFromValue(data?.value);
  } catch (err) {
    if (!isMissingRelation(err as { message?: string })) {
      console.error("[cms] getSiteSettings:", err);
    }
    return DEFAULT_SETTINGS;
  }
}

export async function updateSiteSettings(
  patch: Partial<SiteSettings>,
): Promise<SiteSettings> {
  await ensureCmsSeeded();
  const current = await getSiteSettings();
  const next = { ...current, ...patch };
  const supabase = requireAdmin();
  const { error } = await supabase.from("cms_settings").upsert({
    key: SETTINGS_KEY,
    value: next,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
  return next;
}
