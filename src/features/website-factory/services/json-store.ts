import { promises as fs } from "fs";
import path from "path";
import { SEEDED_TEMPLATES } from "../templates/seeds";
import {
  DEFAULT_THEME,
  emptyPuck,
  type Business,
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
import type { BusinessInput as BusinessFields } from "./schemas";
import { getSiteUrl } from "@/lib/site";

export { SEEDED_TEMPLATES };

const FILE = path.join(process.cwd(), "data", "website-factory.json");

type Db = {
  businesses: Business[];
  templates: WebsiteTemplate[];
  projects: WebsiteProject[];
  pages: WebsitePage[];
  versions: WebsiteVersion[];
  deployments: WebsiteDeployment[];
  domains: WebsiteDomain[];
};

function now() {
  return new Date().toISOString();
}

function nid() {
  return crypto.randomUUID();
}

function slugify(input: string) {
  const slug = input
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return slug || "site";
}

function unique(existing: string[], base: string) {
  const slug = slugify(base);
  if (!existing.includes(slug)) return slug;
  for (let i = 2; i < 50; i += 1) {
    const candidate = `${slug}-${i}`;
    if (!existing.includes(candidate)) return candidate;
  }
  return `${slug}-${Date.now().toString(36)}`;
}

async function load(): Promise<Db> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as Db;
    if (!parsed.templates?.length) parsed.templates = SEEDED_TEMPLATES;
    const known = new Set(parsed.templates.map((item) => item.id));
    for (const seed of SEEDED_TEMPLATES) {
      if (!known.has(seed.id)) parsed.templates.push(seed);
    }
    return parsed;
  } catch {
    const initial: Db = {
      businesses: [],
      templates: SEEDED_TEMPLATES,
      projects: [],
      pages: [],
      versions: [],
      deployments: [],
      domains: [],
    };
    await save(initial);
    return initial;
  }
}

async function save(db: Db) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(db, null, 2), "utf8");
}

async function mutate<T>(fn: (db: Db) => T | Promise<T>) {
  const db = await load();
  const result = await fn(db);
  await save(db);
  return result;
}

export async function listTemplates() {
  const db = await load();
  return db.templates.filter((item) => item.active);
}

export async function getTemplate(id: string) {
  const db = await load();
  return (
    db.templates.find((item) => item.id === id || item.definitionKey === id || item.slug === id) ??
    null
  );
}

export async function duplicateTemplate(id: string) {
  return mutate((db) => {
    const template = db.templates.find((item) => item.id === id);
    if (!template) throw new Error("Template not found");
    const copy: WebsiteTemplate = {
      ...template,
      id: nid(),
      slug: unique(
        db.templates.map((item) => item.slug),
        `${template.slug}-copy`,
      ),
      name: `${template.name} copy`,
      duplicatedFrom: template.id,
      version: 1,
    };
    db.templates.push(copy);
    return copy;
  });
}

export async function listBusinesses() {
  return (await load()).businesses;
}

export async function getBusiness(id: string) {
  return (await load()).businesses.find((item) => item.id === id) ?? null;
}

export async function upsertBusiness(input: BusinessFields, id?: string) {
  return mutate((db) => {
    const existing = id ? db.businesses.find((item) => item.id === id) : undefined;
    const businessId = existing?.id ?? nid();
    const slug = existing?.slug ?? unique(
      db.businesses.map((item) => item.slug),
      input.slug || input.name,
    );
    const business: Business = {
      id: businessId,
      name: input.name,
      slug,
      tagline: input.tagline,
      description: input.description,
      industry: input.industry,
      logoUrl: input.logoUrl,
      faviconUrl: input.faviconUrl,
      heroUrl: input.heroUrl,
      phone: input.phone,
      email: input.email,
      website: input.website,
      address: input.address,
      postcode: input.postcode,
      openingHours: input.openingHours,
      social: input.social,
      yearsInBusiness: input.yearsInBusiness,
      certifications: input.certifications,
      awards: input.awards,
      primaryCta: input.primaryCta,
      secondaryCta: input.secondaryCta,
      usps: input.usps,
      trustIndicators: input.trustIndicators,
      prospectLabel: input.prospectLabel,
      createdAt: existing?.createdAt ?? now(),
      updatedAt: now(),
      services: input.services.map((item, index) => ({
        id: existing?.services[index]?.id ?? nid(),
        businessId,
        name: item.name,
        description: item.description,
        imageUrl: item.imageUrl,
        sortOrder: index,
      })),
      team: input.team.map((item, index) => ({
        id: existing?.team[index]?.id ?? nid(),
        businessId,
        name: item.name,
        role: item.role,
        photoUrl: item.photoUrl,
        bio: item.bio,
        sortOrder: index,
      })),
      reviews: input.reviews.map((item, index) => ({
        id: existing?.reviews[index]?.id ?? nid(),
        businessId,
        customerName: item.customerName,
        quote: item.quote,
        rating: item.rating,
        source: item.source,
        sortOrder: index,
      })),
      media: input.media.map((item, index) => ({
        id: existing?.media[index]?.id ?? nid(),
        businessId,
        kind: item.kind,
        url: item.url,
        alt: item.alt,
        sortOrder: index,
      })),
    };
    db.businesses = db.businesses.filter((item) => item.id !== businessId);
    db.businesses.unshift(business);
    return business;
  });
}

export async function listProjects() {
  const db = await load();
  return db.projects
    .slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map((project) => {
      const business = db.businesses.find((item) => item.id === project.businessId);
      const template = db.templates.find((item) => item.id === project.templateId);
      return {
        ...project,
        businessName: business?.name ?? "",
        templateName: template?.name ?? "",
        previewUrl: `${getSiteUrl()}/p/${project.slug}`,
        liveUrl: `${getSiteUrl()}/s/${project.slug}`,
      };
    });
}

function bundleFrom(db: Db, project: WebsiteProject): ProjectBundle | null {
  const business = db.businesses.find((item) => item.id === project.businessId);
  const template = db.templates.find((item) => item.id === project.templateId);
  if (!business || !template) return null;
  return {
    project,
    business,
    template,
    pages: db.pages
      .filter((item) => item.projectId === project.id)
      .sort((a, b) => a.navOrder - b.navOrder),
    versions: db.versions
      .filter((item) => item.projectId === project.id)
      .sort((a, b) => b.versionNumber - a.versionNumber),
    deployments: db.deployments
      .filter((item) => item.projectId === project.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 20),
    domains: db.domains.filter((item) => item.projectId === project.id),
  };
}

export async function getProjectBundle(id: string) {
  const db = await load();
  const project = db.projects.find((item) => item.id === id);
  if (!project) return null;
  return bundleFrom(db, project);
}

export async function getProjectBySlug(slug: string) {
  const db = await load();
  const project = db.projects.find((item) => item.slug === slug);
  if (!project) return null;
  return bundleFrom(db, project);
}

export async function createProject(input: {
  businessId: string;
  templateId: string;
  name?: string;
  slug?: string;
  theme?: ThemeTokens;
}) {
  return mutate((db) => {
    const business = db.businesses.find((item) => item.id === input.businessId);
    const template =
      db.templates.find(
        (item) =>
          item.id === input.templateId ||
          item.definitionKey === input.templateId ||
          item.slug === input.templateId,
      ) ?? db.templates[0];
    if (!business) throw new Error("Business not found");
    if (!template) throw new Error("Template not found");
    const project: WebsiteProject = {
      id: nid(),
      businessId: business.id,
      templateId: template.id,
      name: input.name?.trim() || business.name,
      slug: unique(
        db.projects.map((item) => item.slug),
        input.slug || business.slug,
      ),
      status: "draft",
      theme: input.theme ?? DEFAULT_THEME,
      siteConfig: {
        stickyHeader: true,
        announcement: "",
        navCta: business.primaryCta,
        footerNote: "",
      },
      seoConfig: {
        title: business.name,
        description: business.tagline || business.description.slice(0, 160),
        ogImage: business.heroUrl,
        robots: "index,follow",
      },
      subdomain: null,
      customDomain: null,
      deploymentStatus: "idle",
      deploymentProvider: "aevion",
      deploymentUrl: "",
      publishedVersionId: null,
      createdAt: now(),
      updatedAt: now(),
      publishedAt: null,
    };
    db.projects.unshift(project);
    return project;
  });
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
  await mutate((db) => {
    const project = db.projects.find((item) => item.id === id);
    if (!project) throw new Error("Project not found");
    if (patch.name) project.name = patch.name;
    if (patch.status) project.status = patch.status;
    if (patch.theme) project.theme = patch.theme;
    if (patch.siteConfig) project.siteConfig = patch.siteConfig;
    if (patch.seoConfig) project.seoConfig = patch.seoConfig;
    if (patch.deploymentStatus) project.deploymentStatus = patch.deploymentStatus;
    if (patch.deploymentProvider) project.deploymentProvider = patch.deploymentProvider;
    if (patch.deploymentUrl !== undefined) project.deploymentUrl = patch.deploymentUrl;
    if (patch.publishedVersionId !== undefined) {
      project.publishedVersionId = patch.publishedVersionId;
    }
    if (patch.publishedAt !== undefined) project.publishedAt = patch.publishedAt;
    if (patch.customDomain !== undefined) project.customDomain = patch.customDomain;
    project.updatedAt = now();
  });
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
  await mutate((db) => {
    db.pages = db.pages.filter((item) => item.projectId !== projectId);
    for (const page of pages) {
      db.pages.push({
        id: nid(),
        projectId,
        slug: page.slug,
        title: page.title,
        navLabel: page.navLabel,
        showInNav: page.showInNav,
        navOrder: page.navOrder,
        draftData: page.draftData,
        previewData: null,
        publishedData: null,
        updatedAt: now(),
      });
    }
  });
}

export async function savePageDraft(pageId: string, draftData: PuckData) {
  await mutate((db) => {
    const page = db.pages.find((item) => item.id === pageId);
    if (!page) throw new Error("Page not found");
    page.draftData = draftData;
    page.updatedAt = now();
    const project = db.projects.find((item) => item.id === page.projectId);
    if (project) project.updatedAt = now();
  });
}

function chromeFrom(page?: WebsitePage): PuckData {
  const types = new Set(["AnnouncementBar", "Navbar", "CTA", "Footer"]);
  const content = (page?.draftData.content ?? []).filter((node) => types.has(node.type));
  return { root: { props: { title: "" } }, content };
}

export async function addPage(
  projectId: string,
  input: { title: string; slug?: string; showInNav?: boolean },
) {
  return mutate((db) => {
    const project = db.projects.find((item) => item.id === projectId);
    if (!project) throw new Error("Project not found");
    const existing = db.pages.filter((item) => item.projectId === projectId);
    const slug = unique(
      existing.map((item) => item.slug),
      input.slug || input.title,
    );
    const page: WebsitePage = {
      id: nid(),
      projectId,
      slug,
      title: input.title.trim() || "Page",
      navLabel: input.title.trim() || "Page",
      showInNav: input.showInNav !== false,
      navOrder: existing.reduce((max, item) => Math.max(max, item.navOrder), -1) + 1,
      draftData: chromeFrom(existing[0]),
      previewData: null,
      publishedData: null,
      updatedAt: now(),
    };
    db.pages.push(page);
    project.updatedAt = now();
    return page;
  });
}

export async function updatePage(
  pageId: string,
  patch: Partial<{ title: string; slug: string; navLabel: string; showInNav: boolean; navOrder: number }>,
) {
  return mutate((db) => {
    const page = db.pages.find((item) => item.id === pageId);
    if (!page) throw new Error("Page not found");
    if (patch.title) {
      page.title = patch.title;
      page.navLabel = patch.navLabel || patch.title;
    }
    if (patch.navLabel) page.navLabel = patch.navLabel;
    if (patch.showInNav !== undefined) page.showInNav = patch.showInNav;
    if (patch.navOrder !== undefined) page.navOrder = patch.navOrder;
    if (patch.slug) {
      const siblings = db.pages.filter((item) => item.projectId === page.projectId && item.id !== page.id);
      page.slug = unique(siblings.map((item) => item.slug), patch.slug);
    }
    page.updatedAt = now();
    return page;
  });
}

export async function deletePage(pageId: string) {
  return mutate((db) => {
    const page = db.pages.find((item) => item.id === pageId);
    if (!page) throw new Error("Page not found");
    const siblings = db.pages.filter((item) => item.projectId === page.projectId);
    if (siblings.length < 2) throw new Error("A website needs at least one page");
    db.pages = db.pages.filter((item) => item.id !== pageId);
    return { ok: true };
  });
}

export async function duplicatePage(pageId: string) {
  return mutate((db) => {
    const page = db.pages.find((item) => item.id === pageId);
    if (!page) throw new Error("Page not found");
    const siblings = db.pages.filter((item) => item.projectId === page.projectId);
    const copy: WebsitePage = {
      ...page,
      id: nid(),
      slug: unique(siblings.map((item) => item.slug), `${page.slug}-copy`),
      title: `${page.title} copy`,
      navLabel: `${page.navLabel} copy`,
      navOrder: siblings.reduce((max, item) => Math.max(max, item.navOrder), -1) + 1,
      draftData: JSON.parse(JSON.stringify(page.draftData)) as PuckData,
      previewData: null,
      publishedData: null,
      updatedAt: now(),
    };
    db.pages.push(copy);
    return copy;
  });
}

export async function reorderPages(projectId: string, pageIds: string[]) {
  await mutate((db) => {
    pageIds.forEach((id, index) => {
      const page = db.pages.find((item) => item.id === id && item.projectId === projectId);
      if (page) page.navOrder = index;
    });
  });
}

export async function publishPreview(projectId: string) {
  const bundle = await mutate((db) => {
    const project = db.projects.find((item) => item.id === projectId);
    if (!project) throw new Error("Project not found");
    for (const page of db.pages.filter((item) => item.projectId === projectId)) {
      page.previewData = page.draftData;
      page.updatedAt = now();
    }
    project.status = "preview";
    project.updatedAt = now();
    return bundleFrom(db, project);
  });
  if (!bundle) throw new Error("Project not found");
  return `${getSiteUrl()}/p/${bundle.project.slug}`;
}

export async function publishLive(projectId: string, authorId?: string | null) {
  return mutate((db) => {
    const project = db.projects.find((item) => item.id === projectId);
    if (!project) throw new Error("Project not found");
    const pages = db.pages.filter((item) => item.projectId === projectId);
    const nextNumber =
      Math.max(0, ...db.versions.filter((item) => item.projectId === projectId).map((item) => item.versionNumber)) +
      1;
    const version: WebsiteVersion = {
      id: nid(),
      projectId,
      versionNumber: nextNumber,
      authorId: authorId ?? null,
      snapshot: {
        theme: project.theme,
        siteConfig: project.siteConfig,
        seoConfig: project.seoConfig,
        pages: pages.map((page) => ({
          slug: page.slug,
          title: page.title,
          navLabel: page.navLabel,
          showInNav: page.showInNav,
          navOrder: page.navOrder,
          data: page.draftData,
        })),
      },
      note: `Version ${nextNumber}`,
      createdAt: now(),
    };
    db.versions.unshift(version);
    for (const page of pages) {
      page.publishedData = page.draftData;
      page.previewData = page.previewData ?? page.draftData;
      page.updatedAt = now();
    }
    const url = `${getSiteUrl()}/s/${project.slug}`;
    project.status = "published";
    project.publishedVersionId = version.id;
    project.publishedAt = now();
    project.deploymentStatus = "live";
    project.deploymentProvider = "aevion";
    project.deploymentUrl = url;
    project.updatedAt = now();
    db.deployments.unshift({
      id: nid(),
      projectId,
      versionId: version.id,
      provider: "aevion",
      status: "live",
      url,
      error: "",
      createdAt: now(),
    });
    return { url, versionNumber: nextNumber };
  });
}

export async function restoreVersion(projectId: string, versionId: string) {
  await mutate((db) => {
    const project = db.projects.find((item) => item.id === projectId);
    const version = db.versions.find((item) => item.id === versionId && item.projectId === projectId);
    if (!project || !version) throw new Error("Version not found");
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
    if (snapshot.theme) project.theme = snapshot.theme;
    if (snapshot.siteConfig) project.siteConfig = snapshot.siteConfig;
    if (snapshot.seoConfig) project.seoConfig = snapshot.seoConfig;
    if (snapshot.pages?.length) {
      db.pages = db.pages.filter((item) => item.projectId !== projectId);
      for (const page of snapshot.pages) {
        db.pages.push({
          id: nid(),
          projectId,
          slug: page.slug,
          title: page.title,
          navLabel: page.navLabel,
          showInNav: page.showInNav,
          navOrder: page.navOrder,
          draftData: page.data ?? emptyPuck(),
          previewData: null,
          publishedData: null,
          updatedAt: now(),
        });
      }
    }
    if (project.status !== "published") project.status = "ready";
    project.updatedAt = now();
  });
}

export async function duplicateProject(projectId: string) {
  const source = await getProjectBundle(projectId);
  if (!source) throw new Error("Project not found");
  const copy = await createProject({
    businessId: source.business.id,
    templateId: source.template.id,
    name: `${source.project.name} copy`,
    slug: `${source.project.slug}-copy`,
    theme: source.project.theme,
  });
  await replaceProjectPages(
    copy.id,
    source.pages.map((page) => ({
      slug: page.slug,
      title: page.title,
      navLabel: page.navLabel,
      showInNav: page.showInNav,
      navOrder: page.navOrder,
      draftData: page.draftData,
    })),
  );
  await updateProject(copy.id, {
    siteConfig: source.project.siteConfig,
    seoConfig: source.project.seoConfig,
    status: "ready",
  });
  return copy;
}

export async function addDomain(projectId: string, hostname: string) {
  const host = hostname.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  if (!host || !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(host)) {
    throw new Error("Enter a valid domain");
  }
  return mutate((db) => {
    const apex = getSiteUrl().replace(/^https?:\/\//, "");
    const domain: WebsiteDomain = {
      id: nid(),
      projectId,
      hostname: host,
      kind: "custom",
      dnsRecords: [
        { type: "CNAME", name: host.startsWith("www.") ? host : `www.${host}`, value: apex },
        {
          type: "A",
          name: host.replace(/^www\./, ""),
          value: "Point the apex to your Vercel A record once configured",
        },
      ],
      status: "pending",
      sslStatus: "pending",
      verifiedAt: null,
      createdAt: now(),
    };
    db.domains.push(domain);
    const project = db.projects.find((item) => item.id === projectId);
    if (project) {
      project.customDomain = host;
      project.updatedAt = now();
    }
    return domain;
  });
}

export async function recordDeployment(input: {
  projectId: string;
  versionId?: string | null;
  provider: string;
  status: string;
  url?: string;
  error?: string;
}) {
  await mutate((db) => {
    db.deployments.unshift({
      id: nid(),
      projectId: input.projectId,
      versionId: input.versionId ?? null,
      provider: input.provider,
      status: input.status,
      url: input.url ?? "",
      error: input.error ?? "",
      createdAt: now(),
    });
  });
}

export async function verifyDomain(projectId: string, hostname?: string, verified?: boolean, detail?: string) {
  return mutate((db) => {
    const domain =
      db.domains.find((item) => item.projectId === projectId && (!hostname || item.hostname === hostname)) ??
      db.domains.find((item) => item.projectId === projectId);
    if (!domain) throw new Error("No domain to verify");
    domain.status = verified ? "verified" : "failed";
    domain.sslStatus = verified ? "pending" : "unknown";
    domain.verifiedAt = verified ? now() : null;
    return { domain, detail: detail ?? "" };
  });
}
