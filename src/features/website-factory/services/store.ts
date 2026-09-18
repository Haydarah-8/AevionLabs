import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { withPersistence } from "./persistence";
import * as files from "./json-store";
import { getSiteUrl } from "@/lib/site";
import { RESERVED_SLUGS } from "@/lib/cms/constants";
import { SEEDED_TEMPLATES } from "../templates/seeds";
import {
  DEFAULT_THEME,
  emptyPuck,
  isPuckData,
  type Business,
  type BusinessMedia,
  type BusinessReview,
  type BusinessService,
  type BusinessTeam,
  type PuckData,
  type ProjectBundle,
  type ProjectStatus,
  type SeoConfig,
  type SiteConfig,
  type ThemeTokens,
  type WebsiteDeployment,
  type WebsiteDomain,
  type WebsitePage,
  type WebsiteProject,
  type WebsiteTemplate,
  type WebsiteVersion,
} from "../types";
import type { BusinessInput } from "./schemas";

export { type BusinessInput };

/** Upsert file seeds into Supabase so generate never hits a missing FK. */
async function ensureSeededTemplatesInDb() {
  const admin = getSupabaseAdmin();
  for (const seed of SEEDED_TEMPLATES) {
    const { data: existing } = await admin
      .from("website_templates")
      .select("id")
      .eq("slug", seed.slug)
      .maybeSingle();
    if (existing?.id) continue;
    const { error } = await admin.from("website_templates").insert({
      id: seed.id,
      slug: seed.slug,
      name: seed.name,
      industry: seed.industry,
      description: seed.description,
      thumbnail_url: seed.thumbnailUrl,
      version: seed.version,
      definition_key: seed.definitionKey,
      pages_count: seed.pagesCount,
      configuration: seed.configuration,
      active: true,
    });
    if (error && !/duplicate|unique/i.test(error.message)) {
      console.warn("[website-factory] seed template", seed.slug, error.message);
    }
  }
}

function asRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: Record<string, string> = {};
  for (const [key, item] of Object.entries(value)) {
    if (typeof item === "string") out[key] = item;
  }
  return out;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item) => typeof item === "string")
    : [];
}

function throwDb(error: { message: string; code?: string }): never {
  if (error.code === "PGRST205" || /schema cache/i.test(error.message)) {
    throw new Error(
      "Website Factory tables are missing on this Supabase project. Run supabase/migrations/20260918_website_factory.sql in the SQL Editor.",
    );
  }
  throw new Error(error.message);
}

function asCta(value: unknown) {
  const rec =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  return {
    label: typeof rec.label === "string" ? rec.label : "",
    href: typeof rec.href === "string" ? rec.href : "",
  };
}

export function asTheme(value: unknown): ThemeTokens {
  const rec =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  return {
    ...DEFAULT_THEME,
    ...Object.fromEntries(
      Object.entries(rec).filter(([, item]) => typeof item === "string"),
    ),
  } as ThemeTokens;
}

function asPuck(value: unknown): PuckData {
  return isPuckData(value) ? value : emptyPuck();
}

export function asPuckOrNull(value: unknown): PuckData | null {
  return isPuckData(value) ? value : null;
}

export function slugify(input: string) {
  const slug = input
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return slug || "site";
}

export function publicPreviewPath(slug: string) {
  return `/p/${slug}`;
}

export function publicLivePath(slug: string) {
  return `/s/${slug}`;
}

export function publicPreviewUrl(slug: string) {
  return `${getSiteUrl()}${publicPreviewPath(slug)}`;
}

export function publicLiveUrl(slug: string) {
  return `${getSiteUrl()}${publicLivePath(slug)}`;
}

function mapBusinessRow(
  row: Record<string, unknown>,
): Omit<Business, "services" | "team" | "reviews" | "media"> {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    slug: String(row.slug ?? ""),
    tagline: String(row.tagline ?? ""),
    description: String(row.description ?? ""),
    industry: String(row.industry ?? ""),
    logoUrl: String(row.logo_url ?? ""),
    faviconUrl: String(row.favicon_url ?? ""),
    heroUrl: String(row.hero_url ?? ""),
    phone: String(row.phone ?? ""),
    email: String(row.email ?? ""),
    website: String(row.website ?? ""),
    address: String(row.address ?? ""),
    postcode: String(row.postcode ?? ""),
    openingHours: asRecord(row.opening_hours),
    social: asRecord(row.social),
    yearsInBusiness:
      typeof row.years_in_business === "number" ? row.years_in_business : null,
    certifications: asStringArray(row.certifications),
    awards: asStringArray(row.awards),
    primaryCta: asCta(row.primary_cta),
    secondaryCta: asCta(row.secondary_cta),
    usps: asStringArray(row.usps),
    trustIndicators: asStringArray(row.trust_indicators),
    prospectLabel: String(row.prospect_label ?? ""),
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

function mapTemplate(row: Record<string, unknown>): WebsiteTemplate {
  return {
    id: String(row.id),
    slug: String(row.slug ?? ""),
    name: String(row.name ?? ""),
    industry: String(row.industry ?? ""),
    description: String(row.description ?? ""),
    thumbnailUrl: String(row.thumbnail_url ?? ""),
    version: Number(row.version ?? 1),
    definitionKey: String(row.definition_key ?? ""),
    pagesCount: Number(row.pages_count ?? 0),
    configuration:
      row.configuration && typeof row.configuration === "object"
        ? (row.configuration as Record<string, unknown>)
        : {},
    duplicatedFrom: row.duplicated_from ? String(row.duplicated_from) : null,
    active: Boolean(row.active),
  };
}

function mapProject(row: Record<string, unknown>): WebsiteProject {
  const seo = (row.seo_config ?? {}) as Record<string, unknown>;
  const site = (row.site_config ?? {}) as Record<string, unknown>;
  return {
    id: String(row.id),
    businessId: String(row.business_id),
    templateId: String(row.template_id),
    name: String(row.name ?? ""),
    slug: String(row.slug ?? ""),
    status: String(row.status ?? "draft") as ProjectStatus,
    theme: asTheme(row.theme),
    siteConfig: {
      stickyHeader: Boolean(site.stickyHeader ?? true),
      announcement:
        typeof site.announcement === "string" ? site.announcement : "",
      navCta: asCta(site.navCta),
      footerNote: typeof site.footerNote === "string" ? site.footerNote : "",
    } satisfies SiteConfig,
    seoConfig: {
      title: typeof seo.title === "string" ? seo.title : "",
      description: typeof seo.description === "string" ? seo.description : "",
      ogImage: typeof seo.ogImage === "string" ? seo.ogImage : "",
      robots: typeof seo.robots === "string" ? seo.robots : "index,follow",
    } satisfies SeoConfig,
    subdomain: row.subdomain ? String(row.subdomain) : null,
    customDomain: row.custom_domain ? String(row.custom_domain) : null,
    deploymentStatus: String(row.deployment_status ?? "idle"),
    deploymentProvider: String(row.deployment_provider ?? "aevion"),
    deploymentUrl: String(row.deployment_url ?? ""),
    publishedVersionId: row.published_version_id
      ? String(row.published_version_id)
      : null,
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
    publishedAt: row.published_at ? String(row.published_at) : null,
  };
}

function mapPage(row: Record<string, unknown>): WebsitePage {
  return {
    id: String(row.id),
    projectId: String(row.project_id),
    slug: String(row.slug ?? ""),
    title: String(row.title ?? ""),
    navLabel: String(row.nav_label ?? ""),
    showInNav: Boolean(row.show_in_nav),
    navOrder: Number(row.nav_order ?? 0),
    draftData: asPuck(row.draft_data),
    previewData: asPuckOrNull(row.preview_data),
    publishedData: asPuckOrNull(row.published_data),
    updatedAt: String(row.updated_at ?? ""),
  };
}

async function uniqueSlug(
  table: "businesses" | "website_projects",
  base: string,
) {
  const db = getSupabaseAdmin();
  let slug = slugify(base);
  for (let i = 0; i < 20; i += 1) {
    const candidate = i === 0 ? slug : `${slug}-${i + 1}`;
    if (RESERVED_SLUGS.has(candidate)) continue;
    const { data } = await db
      .from(table)
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
  }
  return `${slug}-${Date.now().toString(36)}`;
}

export async function listTemplates() {
  return withPersistence(files.listTemplates, async () => {
    await ensureSeededTemplatesInDb();
    const { data, error } = await getSupabaseAdmin()
      .from("website_templates")
      .select("*")
      .eq("active", true)
      .order("name");
    if (error) throwDb(error);
    const rows = (data ?? []).map((row) => mapTemplate(row as Record<string, unknown>));
    return rows.length ? rows : files.listTemplates();
  });
}

export async function getTemplate(id: string) {
  return withPersistence(
    () => files.getTemplate(id),
    async () => {
      await ensureSeededTemplatesInDb();
      const admin = getSupabaseAdmin();
      const uuidLike =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          id,
        );
      const query = uuidLike
        ? admin
            .from("website_templates")
            .select("*")
            .or(`id.eq.${id},slug.eq.${id},definition_key.eq.${id}`)
        : admin
            .from("website_templates")
            .select("*")
            .or(`slug.eq.${id},definition_key.eq.${id}`);
      const { data, error } = await query.maybeSingle();
      if (error) throwDb(error);
      if (data) return mapTemplate(data as Record<string, unknown>);
      const seed = await files.getTemplate(id);
      if (!seed) return null;
      const { data: inserted, error: insertError } = await admin
        .from("website_templates")
        .upsert(
          {
            id: seed.id,
            slug: seed.slug,
            name: seed.name,
            industry: seed.industry,
            description: seed.description,
            thumbnail_url: seed.thumbnailUrl,
            version: seed.version,
            definition_key: seed.definitionKey,
            pages_count: seed.pagesCount,
            configuration: seed.configuration,
            active: true,
          },
          { onConflict: "slug" },
        )
        .select("*")
        .single();
      if (insertError) throwDb(insertError);
      return mapTemplate(inserted as Record<string, unknown>);
    },
  );
}

export async function duplicateTemplate(id: string) {
  return withPersistence(
    () => files.duplicateTemplate(id),
    async () => {
  const template = await getTemplate(id);
  if (!template) throw new Error("Template not found");
  const slug = await uniqueSlug(
    "website_projects",
    `${template.slug}-copy`,
  ).catch(() => `${template.slug}-copy`);
  const nextSlug = `${template.slug}-copy-${Date.now().toString(36).slice(-4)}`;
  const { data, error } = await getSupabaseAdmin()
    .from("website_templates")
    .insert({
      slug: nextSlug,
      name: `${template.name} copy`,
      industry: template.industry,
      description: template.description,
      thumbnail_url: template.thumbnailUrl,
      version: 1,
      definition_key: template.definitionKey,
      pages_count: template.pagesCount,
      configuration: template.configuration,
      duplicated_from: template.id,
      active: true,
    })
    .select("*")
    .single();
  if (error) throwDb(error);
  void slug;
  return mapTemplate(data as Record<string, unknown>);
    },
  );
}

async function loadBusinessParts(id: string) {
  const db = getSupabaseAdmin();
  const [services, team, reviews, media] = await Promise.all([
    db
      .from("business_services")
      .select("*")
      .eq("business_id", id)
      .order("sort_order"),
    db
      .from("business_team")
      .select("*")
      .eq("business_id", id)
      .order("sort_order"),
    db
      .from("business_reviews")
      .select("*")
      .eq("business_id", id)
      .order("sort_order"),
    db
      .from("business_media")
      .select("*")
      .eq("business_id", id)
      .order("sort_order"),
  ]);
  if (services.error) throwDb(services.error);
  if (team.error) throwDb(team.error);
  if (reviews.error) throwDb(reviews.error);
  if (media.error) throwDb(media.error);
  return {
    services: (services.data ?? []).map(
      (row): BusinessService => ({
        id: String(row.id),
        businessId: String(row.business_id),
        name: String(row.name ?? ""),
        description: String(row.description ?? ""),
        imageUrl: String(row.image_url ?? ""),
        sortOrder: Number(row.sort_order ?? 0),
      }),
    ),
    team: (team.data ?? []).map(
      (row): BusinessTeam => ({
        id: String(row.id),
        businessId: String(row.business_id),
        name: String(row.name ?? ""),
        role: String(row.role ?? ""),
        photoUrl: String(row.photo_url ?? ""),
        bio: String(row.bio ?? ""),
        sortOrder: Number(row.sort_order ?? 0),
      }),
    ),
    reviews: (reviews.data ?? []).map(
      (row): BusinessReview => ({
        id: String(row.id),
        businessId: String(row.business_id),
        customerName: String(row.customer_name ?? ""),
        quote: String(row.quote ?? ""),
        rating: Number(row.rating ?? 5),
        source: String(row.source ?? ""),
        sortOrder: Number(row.sort_order ?? 0),
      }),
    ),
    media: (media.data ?? []).map(
      (row): BusinessMedia => ({
        id: String(row.id),
        businessId: String(row.business_id),
        kind: String(row.kind ?? "gallery"),
        url: String(row.url ?? ""),
        alt: String(row.alt ?? ""),
        sortOrder: Number(row.sort_order ?? 0),
      }),
    ),
  };
}

export async function listBusinesses() {
  return withPersistence(files.listBusinesses, async () => {
    const { data, error } = await getSupabaseAdmin()
      .from("businesses")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) throwDb(error);
    const rows = data ?? [];
    const full = await Promise.all(
      rows.map(async (row) => {
        const base = mapBusinessRow(row as Record<string, unknown>);
        const parts = await loadBusinessParts(base.id);
        return { ...base, ...parts };
      }),
    );
    return full;
  });
}

export async function getBusiness(id: string): Promise<Business | null> {
  return withPersistence(
    () => files.getBusiness(id),
    async () => {
      const { data, error } = await getSupabaseAdmin()
        .from("businesses")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throwDb(error);
      if (!data) return null;
      const base = mapBusinessRow(data as Record<string, unknown>);
      const parts = await loadBusinessParts(base.id);
      return { ...base, ...parts };
    },
  );
}

async function replaceChildren(businessId: string, input: BusinessInput) {
  const db = getSupabaseAdmin();
  await Promise.all([
    db.from("business_services").delete().eq("business_id", businessId),
    db.from("business_team").delete().eq("business_id", businessId),
    db.from("business_reviews").delete().eq("business_id", businessId),
    db.from("business_media").delete().eq("business_id", businessId),
  ]);
  if (input.services.length) {
    const { error } = await db.from("business_services").insert(
      input.services.map((item, index) => ({
        business_id: businessId,
        name: item.name,
        description: item.description,
        image_url: item.imageUrl,
        sort_order: index,
      })),
    );
    if (error) throwDb(error);
  }
  if (input.team.length) {
    const { error } = await db.from("business_team").insert(
      input.team.map((item, index) => ({
        business_id: businessId,
        name: item.name,
        role: item.role,
        photo_url: item.photoUrl,
        bio: item.bio,
        sort_order: index,
      })),
    );
    if (error) throwDb(error);
  }
  if (input.reviews.length) {
    const { error } = await db.from("business_reviews").insert(
      input.reviews.map((item, index) => ({
        business_id: businessId,
        customer_name: item.customerName,
        quote: item.quote,
        rating: item.rating,
        source: item.source,
        sort_order: index,
      })),
    );
    if (error) throwDb(error);
  }
  if (input.media.length) {
    const { error } = await db.from("business_media").insert(
      input.media.map((item, index) => ({
        business_id: businessId,
        kind: item.kind,
        url: item.url,
        alt: item.alt,
        sort_order: index,
      })),
    );
    if (error) throwDb(error);
  }
}

export async function upsertBusiness(input: BusinessInput, id?: string) {
  return withPersistence(
    () => files.upsertBusiness(input, id),
    async () => {
      const db = getSupabaseAdmin();
      const slug = input.slug
        ? input.slug
        : id
          ? ((await getBusiness(id))?.slug ??
            (await uniqueSlug("businesses", input.name)))
          : await uniqueSlug("businesses", input.name);
      const payload = {
        name: input.name,
        slug,
        tagline: input.tagline,
        description: input.description,
        industry: input.industry,
        logo_url: input.logoUrl,
        favicon_url: input.faviconUrl,
        hero_url: input.heroUrl,
        phone: input.phone,
        email: input.email,
        website: input.website,
        address: input.address,
        postcode: input.postcode,
        opening_hours: input.openingHours,
        social: input.social,
        years_in_business: input.yearsInBusiness,
        certifications: input.certifications,
        awards: input.awards,
        primary_cta: input.primaryCta,
        secondary_cta: input.secondaryCta,
        usps: input.usps,
        trust_indicators: input.trustIndicators,
        prospect_label: input.prospectLabel,
        updated_at: new Date().toISOString(),
      };
      const query = id
        ? db.from("businesses").update(payload).eq("id", id).select("*").single()
        : db.from("businesses").insert(payload).select("*").single();
      const { data, error } = await query;
      if (error) throwDb(error);
      const businessId = String(data.id);
      await replaceChildren(businessId, input);
      return getBusiness(businessId);
    },
  );
}

export async function listProjects() {
  return withPersistence(files.listProjects, async () => {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("website_projects")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) throwDb(error);
    const projects = (data ?? []).map((row) =>
      mapProject(row as Record<string, unknown>),
    );
    const [businesses, templates] = await Promise.all([
      db.from("businesses").select("id, name, slug"),
      db.from("website_templates").select("id, name, industry"),
    ]);
    const businessMap = new Map(
      (businesses.data ?? []).map((row) => [String(row.id), row]),
    );
    const templateMap = new Map(
      (templates.data ?? []).map((row) => [String(row.id), row]),
    );
    return projects.map((project) => ({
      ...project,
      businessName: String(businessMap.get(project.businessId)?.name ?? ""),
      templateName: String(templateMap.get(project.templateId)?.name ?? ""),
      previewUrl: publicPreviewUrl(project.slug),
      liveUrl: publicLiveUrl(project.slug),
    }));
  });
}

export async function getProjectBundle(
  id: string,
): Promise<ProjectBundle | null> {
  return withPersistence(
    () => files.getProjectBundle(id),
    async () => {
      const db = getSupabaseAdmin();
      const { data, error } = await db
    .from("website_projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throwDb(error);
  if (!data) return null;
  const project = mapProject(data as Record<string, unknown>);
  const [business, template, pages, versions, deployments, domains] =
    await Promise.all([
      getBusiness(project.businessId),
      getTemplate(project.templateId),
      db
        .from("website_pages")
        .select("*")
        .eq("project_id", id)
        .order("nav_order"),
      db
        .from("website_versions")
        .select("*")
        .eq("project_id", id)
        .order("version_number", { ascending: false }),
      db
        .from("website_deployments")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: false })
        .limit(20),
      db.from("website_domains").select("*").eq("project_id", id),
    ]);
  if (!business || !template)
    throw new Error("Project is missing business or template");
  if (pages.error) throwDb(pages.error);
  if (versions.error) throwDb(versions.error);
  if (deployments.error) throwDb(deployments.error);
  if (domains.error) throwDb(domains.error);
  return {
    project,
    business,
    template,
    pages: (pages.data ?? []).map((row) =>
      mapPage(row as Record<string, unknown>),
    ),
    versions: (versions.data ?? []).map(
      (row): WebsiteVersion => ({
        id: String(row.id),
        projectId: String(row.project_id),
        versionNumber: Number(row.version_number),
        authorId: row.author_id ? String(row.author_id) : null,
        snapshot: (row.snapshot ?? {}) as Record<string, unknown>,
        note: String(row.note ?? ""),
        createdAt: String(row.created_at ?? ""),
      }),
    ),
    deployments: (deployments.data ?? []).map(
      (row): WebsiteDeployment => ({
        id: String(row.id),
        projectId: String(row.project_id),
        versionId: row.version_id ? String(row.version_id) : null,
        provider: String(row.provider ?? ""),
        status: String(row.status ?? ""),
        url: String(row.url ?? ""),
        error: String(row.error ?? ""),
        createdAt: String(row.created_at ?? ""),
      }),
    ),
    domains: (domains.data ?? []).map(
      (row): WebsiteDomain => ({
        id: String(row.id),
        projectId: String(row.project_id),
        hostname: String(row.hostname ?? ""),
        kind: String(row.kind ?? "custom"),
        dnsRecords: Array.isArray(row.dns_records)
          ? (row.dns_records as WebsiteDomain["dnsRecords"])
          : [],
        status: String(row.status ?? "pending"),
        sslStatus: String(row.ssl_status ?? "pending"),
        verifiedAt: row.verified_at ? String(row.verified_at) : null,
        createdAt: String(row.created_at ?? ""),
      }),
    ),
  };
    },
  );
}

export async function getProjectBySlug(slug: string) {
  return withPersistence(
    () => files.getProjectBySlug(slug),
    async () => {
      const { data, error } = await getSupabaseAdmin()
        .from("website_projects")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throwDb(error);
      if (!data) return null;
      return getProjectBundle(String(data.id));
    },
  );
}

export async function createProject(input: {
  businessId: string;
  templateId: string;
  name?: string;
  slug?: string;
  theme?: ThemeTokens;
}) {
  return withPersistence(
    () => files.createProject(input),
    async () => {
      const [business, template] = await Promise.all([
        getBusiness(input.businessId),
        getTemplate(input.templateId),
      ]);
      if (!business) throw new Error("Business not found");
      if (!template) throw new Error("Template not found");
      const slug = input.slug
        ? await uniqueSlug("website_projects", input.slug)
        : await uniqueSlug("website_projects", business.slug);
      const { data, error } = await getSupabaseAdmin()
        .from("website_projects")
        .insert({
          business_id: business.id,
          template_id: template.id,
          name: input.name?.trim() || business.name,
          slug,
          status: "draft",
          theme: input.theme ?? DEFAULT_THEME,
          site_config: {
            stickyHeader: true,
            announcement: "",
            navCta: business.primaryCta,
            footerNote: "",
          },
          seo_config: {
            title: business.name,
            description: business.tagline || business.description.slice(0, 160),
            ogImage: business.heroUrl,
            robots: "index,follow",
          },
        })
        .select("*")
        .single();
      if (error) throwDb(error);
      return mapProject(data as Record<string, unknown>);
    },
  );
}

export async function updateProject(
  id: string,
  patch: Partial<{
    name: string;
    status: ProjectStatus;
    theme: ThemeTokens;
    siteConfig: SiteConfig;
    seoConfig: SeoConfig;
    deploymentStatus: string;
    deploymentProvider: string;
    deploymentUrl: string;
    publishedVersionId: string | null;
    publishedAt: string | null;
    customDomain: string | null;
  }>,
) {
  return withPersistence(
    () => files.updateProject(id, patch),
    async () => {
      const payload: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (patch.name) payload.name = patch.name;
      if (patch.status) payload.status = patch.status;
      if (patch.theme) payload.theme = patch.theme;
      if (patch.siteConfig) payload.site_config = patch.siteConfig;
      if (patch.seoConfig) payload.seo_config = patch.seoConfig;
      if (patch.deploymentStatus)
        payload.deployment_status = patch.deploymentStatus;
      if (patch.deploymentProvider)
        payload.deployment_provider = patch.deploymentProvider;
      if (patch.deploymentUrl !== undefined)
        payload.deployment_url = patch.deploymentUrl;
      if (patch.publishedVersionId !== undefined) {
        payload.published_version_id = patch.publishedVersionId;
      }
      if (patch.publishedAt !== undefined) payload.published_at = patch.publishedAt;
      if (patch.customDomain !== undefined)
        payload.custom_domain = patch.customDomain;
      const { error } = await getSupabaseAdmin()
        .from("website_projects")
        .update(payload)
        .eq("id", id);
      if (error) throwDb(error);
    },
  );
}

export async function replaceProjectPages(
  projectId: string,
  pages: Array<{
    slug: string;
    title: string;
    navLabel: string;
    showInNav: boolean;
    navOrder: number;
    draftData: PuckData;
  }>,
) {
  return withPersistence(
    () => files.replaceProjectPages(projectId, pages),
    async () => {
      const db = getSupabaseAdmin();
      const { error: delError } = await db
        .from("website_pages")
        .delete()
        .eq("project_id", projectId);
      if (delError) throwDb(delError);
      if (!pages.length) return;
      const { error } = await db.from("website_pages").insert(
        pages.map((page) => ({
          project_id: projectId,
          slug: page.slug,
          title: page.title,
          nav_label: page.navLabel,
          show_in_nav: page.showInNav,
          nav_order: page.navOrder,
          draft_data: page.draftData,
        })),
      );
      if (error) throwDb(error);
    },
  );
}

export async function savePageDraft(pageId: string, draftData: PuckData) {
  return withPersistence(
    () => files.savePageDraft(pageId, draftData),
    async () => {
      const { error } = await getSupabaseAdmin()
        .from("website_pages")
        .update({ draft_data: draftData, updated_at: new Date().toISOString() })
        .eq("id", pageId);
      if (error) throwDb(error);
    },
  );
}

export async function addPage(
  projectId: string,
  input: { title: string; slug?: string; showInNav?: boolean },
) {
  return withPersistence(
    () => files.addPage(projectId, input),
    async () => {
      const bundle = await getProjectBundle(projectId);
      if (!bundle) throw new Error("Project not found");
      const title = input.title.trim() || "Page";
      let slug = slugify(input.slug || title);
      const taken = new Set(bundle.pages.map((item) => item.slug));
      if (taken.has(slug) || RESERVED_SLUGS.has(slug)) {
        slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
      }
      const chromeTypes = new Set(["AnnouncementBar", "Navbar", "CTA", "Footer"]);
      const draftData = {
        root: { props: { title } },
        content: (bundle.pages[0]?.draftData.content ?? []).filter((node) =>
          chromeTypes.has(node.type),
        ),
      };
      const { data, error } = await getSupabaseAdmin()
        .from("website_pages")
        .insert({
          project_id: projectId,
          slug,
          title,
          nav_label: title,
          show_in_nav: input.showInNav !== false,
          nav_order: bundle.pages.reduce((max, item) => Math.max(max, item.navOrder), -1) + 1,
          draft_data: draftData,
        })
        .select("*")
        .single();
      if (error) throwDb(error);
      return {
        id: String(data.id),
        projectId,
        slug,
        title,
        navLabel: title,
        showInNav: input.showInNav !== false,
        navOrder: Number(data.nav_order ?? 0),
        draftData,
        previewData: null,
        publishedData: null,
        updatedAt: String(data.updated_at ?? new Date().toISOString()),
      };
    },
  );
}

export async function updatePage(
  pageId: string,
  patch: Partial<{ title: string; slug: string; navLabel: string; showInNav: boolean; navOrder: number }>,
) {
  return withPersistence(
    () => files.updatePage(pageId, patch),
    async () => {
      const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (patch.title) payload.title = patch.title;
      if (patch.navLabel) payload.nav_label = patch.navLabel;
      if (patch.slug) payload.slug = patch.slug;
      if (patch.showInNav !== undefined) payload.show_in_nav = patch.showInNav;
      if (patch.navOrder !== undefined) payload.nav_order = patch.navOrder;
      const { error } = await getSupabaseAdmin().from("website_pages").update(payload).eq("id", pageId);
      if (error) throwDb(error);
      return { id: pageId, ...patch };
    },
  );
}

export async function deletePage(pageId: string) {
  return withPersistence(
    () => files.deletePage(pageId),
    async () => {
      const { error } = await getSupabaseAdmin().from("website_pages").delete().eq("id", pageId);
      if (error) throwDb(error);
      return { ok: true };
    },
  );
}

export async function duplicatePage(pageId: string) {
  return withPersistence(
    () => files.duplicatePage(pageId),
    async () => files.duplicatePage(pageId),
  );
}

export async function reorderPages(projectId: string, pageIds: string[]) {
  return withPersistence(
    () => files.reorderPages(projectId, pageIds),
    async () => {
      const db = getSupabaseAdmin();
      for (const [index, id] of pageIds.entries()) {
        const { error } = await db.from("website_pages").update({ nav_order: index }).eq("id", id);
        if (error) throwDb(error);
      }
    },
  );
}

export async function publishPreview(projectId: string) {
  return withPersistence(
    () => files.publishPreview(projectId),
    async () => {
  const bundle = await getProjectBundle(projectId);
  if (!bundle) throw new Error("Project not found");
  const db = getSupabaseAdmin();
  for (const page of bundle.pages) {
    const { error } = await db
      .from("website_pages")
      .update({
        preview_data: page.draftData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", page.id);
    if (error) throwDb(error);
  }
  await updateProject(projectId, { status: "preview" });
  console.info("[website-factory] preview published", {
    projectId,
    slug: bundle.project.slug,
  });
  return publicPreviewUrl(bundle.project.slug);
    },
  );
}

export async function publishLive(projectId: string, authorId?: string | null) {
  return withPersistence(
    () => files.publishLive(projectId, authorId),
    async () => {
  const bundle = await getProjectBundle(projectId);
  if (!bundle) throw new Error("Project not found");
  const db = getSupabaseAdmin();
  const nextNumber = (bundle.versions[0]?.versionNumber ?? 0) + 1;
  const snapshot = {
    theme: bundle.project.theme,
    siteConfig: bundle.project.siteConfig,
    seoConfig: bundle.project.seoConfig,
    pages: bundle.pages.map((page) => ({
      slug: page.slug,
      title: page.title,
      navLabel: page.navLabel,
      showInNav: page.showInNav,
      navOrder: page.navOrder,
      data: page.draftData,
    })),
  };
  const { data: version, error: versionError } = await db
    .from("website_versions")
    .insert({
      project_id: projectId,
      version_number: nextNumber,
      author_id: authorId ?? null,
      snapshot,
      note: `Version ${nextNumber}`,
    })
    .select("*")
    .single();
  if (versionError) throw new Error(versionError.message);
  for (const page of bundle.pages) {
    const { error } = await db
      .from("website_pages")
      .update({
        published_data: page.draftData,
        preview_data: page.previewData ?? page.draftData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", page.id);
    if (error) throwDb(error);
  }
  const liveUrl = publicLiveUrl(bundle.project.slug);
  await updateProject(projectId, {
    status: "published",
    publishedVersionId: String(version.id),
    publishedAt: new Date().toISOString(),
    deploymentStatus: "live",
    deploymentProvider: "aevion",
    deploymentUrl: liveUrl,
  });
  const { error: depError } = await db.from("website_deployments").insert({
    project_id: projectId,
    version_id: version.id,
    provider: "aevion",
    status: "live",
    url: liveUrl,
  });
  if (depError) throw new Error(depError.message);
  console.info("[website-factory] published", {
    projectId,
    slug: bundle.project.slug,
    version: nextNumber,
  });
  return { url: liveUrl, versionNumber: nextNumber };
    },
  );
}

export async function restoreVersion(projectId: string, versionId: string) {
  return withPersistence(
    () => files.restoreVersion(projectId, versionId),
    async () => {
  const bundle = await getProjectBundle(projectId);
  if (!bundle) throw new Error("Project not found");
  const version = bundle.versions.find((item) => item.id === versionId);
  if (!version) throw new Error("Version not found");
  const snapshot = version.snapshot as {
    theme?: ThemeTokens;
    siteConfig?: SiteConfig;
    seoConfig?: SeoConfig;
    pages?: Array<{
      slug: string;
      title: string;
      navLabel: string;
      showInNav: boolean;
      navOrder: number;
      data: PuckData;
    }>;
  };
  if (snapshot.theme || snapshot.siteConfig || snapshot.seoConfig) {
    await updateProject(projectId, {
      theme: snapshot.theme,
      siteConfig: snapshot.siteConfig,
      seoConfig: snapshot.seoConfig,
      status: bundle.project.status === "published" ? "published" : "ready",
    });
  }
  if (snapshot.pages?.length) {
    await replaceProjectPages(
      projectId,
      snapshot.pages.map((page) => ({
        slug: page.slug,
        title: page.title,
        navLabel: page.navLabel,
        showInNav: page.showInNav,
        navOrder: page.navOrder,
        draftData: page.data,
      })),
    );
  }
  console.info("[website-factory] restored version", {
    projectId,
    versionId,
    version: version.versionNumber,
  });
    },
  );
}

export async function duplicateProject(projectId: string) {
  const bundle = await getProjectBundle(projectId);
  if (!bundle) throw new Error("Project not found");
  const copy = await createProject({
    businessId: bundle.business.id,
    templateId: bundle.template.id,
    name: `${bundle.project.name} copy`,
    slug: `${bundle.project.slug}-copy`,
    theme: bundle.project.theme,
  });
  await replaceProjectPages(
    copy.id,
    bundle.pages.map((page) => ({
      slug: page.slug,
      title: page.title,
      navLabel: page.navLabel,
      showInNav: page.showInNav,
      navOrder: page.navOrder,
      draftData: page.draftData,
    })),
  );
  await updateProject(copy.id, {
    siteConfig: bundle.project.siteConfig,
    seoConfig: bundle.project.seoConfig,
    status: "ready",
  });
  return copy;
}

export async function addDomain(projectId: string, hostname: string) {
  return withPersistence(
    () => files.addDomain(projectId, hostname),
    async () => {
  const host = hostname
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "");
  if (!host || !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(host)) {
    throw new Error("Enter a valid domain");
  }
  const apex = getSiteUrl().replace(/^https?:\/\//, "");
  const records = [
    {
      type: "CNAME",
      name: host.startsWith("www.") ? host : `www.${host}`,
      value: apex,
    },
    {
      type: "A",
      name: host.replace(/^www\./, ""),
      value: "Point the apex to your Vercel A record once configured",
    },
  ];
  const { data, error } = await getSupabaseAdmin()
    .from("website_domains")
    .insert({
      project_id: projectId,
      hostname: host,
      kind: "custom",
      dns_records: records,
      status: "pending",
      ssl_status: "pending",
    })
    .select("*")
    .single();
  if (error) throwDb(error);
  await updateProject(projectId, { customDomain: host });
  return data;
    },
  );
}

export async function recordDeployment(input: {
  projectId: string;
  versionId?: string | null;
  provider: string;
  status: string;
  url?: string;
  error?: string;
}) {
  return withPersistence(
    () => files.recordDeployment(input),
    async () => {
      const { error } = await getSupabaseAdmin()
        .from("website_deployments")
        .insert({
          project_id: input.projectId,
          version_id: input.versionId ?? null,
          provider: input.provider,
          status: input.status,
          url: input.url ?? "",
          error: input.error ?? "",
        });
      if (error) throwDb(error);
    },
  );
}
