import {
  addPage,
  createProject,
  deletePage,
  duplicatePage,
  duplicateProject,
  getProjectBundle,
  getTemplate,
  listProjects,
  listTemplates,
  publishLive,
  publishPreview,
  replaceProjectPages,
  restoreVersion,
  updatePage,
  updateProject,
  upsertBusiness,
} from "../services/store";
import { generateWebsite, generateWebsiteFromWizard } from "../services/generate";
import { emitFactoryEvent } from "./events";
import type { BusinessInput } from "../services/schemas";
import { emptyPuck, type ThemeTokens } from "../types";
import { SEEDED_TEMPLATES } from "../templates/seeds";

export async function listWebsites() {
  return listProjects();
}

export async function getWebsite(id: string) {
  return getProjectBundle(id);
}

export async function updateWebsite(
  id: string,
  patch: Parameters<typeof updateProject>[1],
  actorId?: string | null,
) {
  const project = await updateProject(id, patch);
  await emitFactoryEvent({
    name: "website.updated",
    projectId: id,
    resourceType: "website",
    resourceId: id,
    actorId,
    actorType: actorId ? "admin" : "system",
  });
  return project;
}

export async function createWebsiteFromWizard(
  input: Parameters<typeof generateWebsiteFromWizard>[0],
  actorId?: string | null,
) {
  const bundle = await generateWebsiteFromWizard(input);
  await emitFactoryEvent({
    name: "website.created",
    projectId: bundle.project.id,
    resourceType: "website",
    resourceId: bundle.project.id,
    actorId,
    actorType: actorId ? "admin" : "system",
    meta: { slug: bundle.project.slug },
  });
  return bundle;
}

/** Create an untitled draft with one empty Home page and open Studio immediately. */
export async function createBlankWebsite(
  input: { name?: string; templateId?: string } = {},
  actorId?: string | null,
) {
  const templates = await listTemplates();
  const preferred =
    (input.templateId
      ? await getTemplate(input.templateId)
      : null) ||
    templates[0] ||
    (await getTemplate(SEEDED_TEMPLATES[0].id)) ||
    (await getTemplate(SEEDED_TEMPLATES[0].slug));
  if (!preferred) {
    throw new Error("No templates available to attach to a blank site");
  }

  const name = input.name?.trim() || "Untitled site";
  const business = await upsertBusiness({
    name,
    tagline: "",
    description: "",
    industry: "",
    logoUrl: "",
    faviconUrl: "",
    heroUrl: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    postcode: "",
    openingHours: {},
    social: {},
    yearsInBusiness: null,
    certifications: [],
    awards: [],
    primaryCta: { label: "Contact", href: "/contact" },
    secondaryCta: { label: "", href: "" },
    usps: [],
    trustIndicators: [],
    prospectLabel: "",
    services: [],
    team: [],
    reviews: [],
    media: [],
  });
  if (!business) throw new Error("Could not create business");

  const project = await createProject({
    businessId: business.id,
    templateId: preferred.id,
    name,
  });

  await replaceProjectPages(project.id, [
    {
      slug: "home",
      title: "Home",
      navLabel: "Home",
      showInNav: true,
      navOrder: 0,
      draftData: {
        ...emptyPuck(),
        root: { props: { title: "Home" } },
      },
    },
  ]);

  const bundle = await getProjectBundle(project.id);
  if (!bundle) throw new Error("Blank website create failed");

  await emitFactoryEvent({
    name: "website.created",
    projectId: project.id,
    resourceType: "website",
    resourceId: project.id,
    actorId,
    actorType: actorId ? "admin" : "system",
    meta: { slug: project.slug, blank: true },
  });

  return bundle;
}

export async function regenerateWebsite(
  id: string,
  mode: "preserve" | "rebuild" | "rewrite" = "rebuild",
  actorId?: string | null,
) {
  const bundle = await generateWebsite(id, mode);
  await emitFactoryEvent({
    name: "website.updated",
    projectId: id,
    resourceType: "website",
    resourceId: id,
    actorId,
    meta: { mode },
  });
  return bundle;
}

export async function publishWebsitePreview(id: string, actorId?: string | null) {
  const url = await publishPreview(id);
  await emitFactoryEvent({
    name: "website.published",
    projectId: id,
    resourceType: "website",
    resourceId: id,
    actorId,
    meta: { mode: "preview", url },
  });
  return { url };
}

export async function publishWebsiteLive(id: string, actorId?: string | null) {
  const result = await publishLive(id);
  await emitFactoryEvent({
    name: "website.published",
    projectId: id,
    resourceType: "website",
    resourceId: id,
    actorId,
    meta: { mode: "live", ...result },
  });
  return result;
}

export async function duplicateWebsite(id: string, actorId?: string | null) {
  const project = await duplicateProject(id);
  await emitFactoryEvent({
    name: "website.created",
    projectId: project.id,
    resourceType: "website",
    resourceId: project.id,
    actorId,
    meta: { duplicatedFrom: id },
  });
  return { project };
}

export async function restoreWebsiteVersion(
  id: string,
  versionId: string,
  actorId?: string | null,
) {
  const bundle = await restoreVersion(id, versionId);
  await emitFactoryEvent({
    name: "website.updated",
    projectId: id,
    resourceType: "version",
    resourceId: versionId,
    actorId,
    meta: { restored: true },
  });
  return bundle;
}

export async function updateWebsiteTheme(
  id: string,
  theme: ThemeTokens,
  actorId?: string | null,
) {
  return updateWebsite(id, { theme }, actorId);
}

export async function updateWebsiteBusiness(
  businessId: string,
  input: BusinessInput,
  actorId?: string | null,
) {
  const business = await upsertBusiness(input, businessId);
  if (!business) throw new Error("Business save failed");
  await emitFactoryEvent({
    name: "website.updated",
    resourceType: "business",
    resourceId: business.id,
    actorId,
  });
  return business;
}

export {
  addPage,
  deletePage,
  duplicatePage,
  updatePage,
  listTemplates,
  getProjectBundle,
};
