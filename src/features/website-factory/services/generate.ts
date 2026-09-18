import { generateFromBusiness } from "../mapping/generate";
import { rewriteBusinessCopy } from "../intelligence/rewrite";
import {
  ABC_ROOFING_INPUT,
  ABC_ROOFING_SLUG,
  ABC_ROOFING_TEMPLATE_SLUG,
  ABC_ROOFING_THEME,
} from "../demo/abc-roofing";
import {
  createProject,
  getProjectBundle,
  getProjectBySlug,
  getTemplate,
  listTemplates,
  replaceProjectPages,
  updateProject,
  upsertBusiness,
} from "./store";
import type { BusinessInput } from "./schemas";
import type { ThemeTokens } from "../types";

export type GenerateMode = "preserve" | "rebuild" | "rewrite";

export async function generateWebsite(
  projectId: string,
  mode: GenerateMode = "rebuild",
) {
  await updateProject(projectId, { status: "generating" });
  const bundle = await getProjectBundle(projectId);
  if (!bundle) throw new Error("Project not found");
  try {
    const business =
      mode === "rewrite"
        ? rewriteBusinessCopy(bundle.business)
        : bundle.business;
    const definitionKey =
      bundle.template.definitionKey ||
      (await getTemplate(bundle.project.templateId))?.definitionKey ||
      "roofing";
    const pages = generateFromBusiness(
      business,
      definitionKey,
      bundle.project.theme,
    );
    await replaceProjectPages(projectId, pages);
    await updateProject(projectId, {
      status: "ready",
      seoConfig: {
        title: bundle.business.name,
        description:
          bundle.business.tagline || bundle.business.description.slice(0, 160),
        ogImage: bundle.business.heroUrl,
        robots: "index,follow",
      },
      siteConfig: {
        ...bundle.project.siteConfig,
        navCta: bundle.business.primaryCta.label
          ? bundle.business.primaryCta
          : { label: "Contact", href: "/contact" },
      },
    });
    console.info("[website-factory] generated", {
      projectId,
      slug: bundle.project.slug,
      pages: pages.length,
      mode,
    });
    return getProjectBundle(projectId);
  } catch (err) {
    await updateProject(projectId, { status: "draft" });
    throw err;
  }
}

export async function generateWebsiteFromWizard(input: {
  business: BusinessInput;
  businessId?: string;
  templateId: string;
  theme?: ThemeTokens;
  name?: string;
  mode?: GenerateMode;
}) {
  await listTemplates();
  const resolved =
    (await getTemplate(input.templateId)) ||
    (await getTemplate(ABC_ROOFING_TEMPLATE_SLUG));
  if (!resolved) {
    throw new Error(
      "No templates available. Open Templates once to seed them, then retry.",
    );
  }
  const business = await upsertBusiness(input.business, input.businessId);
  if (!business) throw new Error("Could not save business");
  const project = await createProject({
    businessId: business.id,
    templateId: resolved.id,
    theme: input.theme,
    name: input.name || business.name,
  });
  const bundle = await generateWebsite(project.id, input.mode || "rebuild");
  if (!bundle) throw new Error("Generate failed");
  return bundle;
}

/** Ensure the ABC Roofing example site exists and is generated. */
export async function ensureAbcRoofingDemo() {
  const existing = await getProjectBySlug(ABC_ROOFING_SLUG);
  if (existing?.pages?.length) return existing;
  if (existing) {
    return (await generateWebsite(existing.project.id, "rebuild")) ?? existing;
  }
  return generateWebsiteFromWizard({
    business: ABC_ROOFING_INPUT,
    templateId: ABC_ROOFING_TEMPLATE_SLUG,
    theme: ABC_ROOFING_THEME,
    name: "ABC Roofing",
    mode: "rebuild",
  });
}
