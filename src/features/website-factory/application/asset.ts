import type { BusinessMedia } from "../types";
import { getProjectBundle, listProjects } from "../services/store";
import { getWebsite, updateWebsiteBusiness } from "./website";
import { emitFactoryEvent } from "./events";

export async function listAssets(businessId: string): Promise<BusinessMedia[]> {
  const projectsList = await listProjects();
  for (const project of projectsList) {
    const bundle = await getProjectBundle(project.id);
    if (bundle?.business.id === businessId) {
      return bundle.business.media;
    }
  }
  return [];
}

export async function listProjectAssets(projectId: string): Promise<BusinessMedia[]> {
  const bundle = await getWebsite(projectId);
  return bundle?.business.media ?? [];
}

export async function assignAsset(input: {
  projectId: string;
  action: "hero" | "logo" | "favicon" | "gallery" | "service";
  url: string;
  alt?: string;
  actorId?: string | null;
}) {
  const bundle = await getWebsite(input.projectId);
  if (!bundle) throw Object.assign(new Error("Website not found"), { status: 404 });
  const business = bundle.business;
  const media = business.media.map((item) => ({
    kind: item.kind,
    url: item.url,
    alt: item.alt,
  }));

  const patch: Parameters<typeof updateWebsiteBusiness>[1] = {
    name: business.name,
    slug: business.slug,
    tagline: business.tagline,
    description: business.description,
    industry: business.industry,
    logoUrl: business.logoUrl,
    faviconUrl: business.faviconUrl,
    heroUrl: business.heroUrl,
    phone: business.phone,
    email: business.email,
    website: business.website,
    address: business.address,
    postcode: business.postcode,
    openingHours: business.openingHours,
    social: business.social,
    yearsInBusiness: business.yearsInBusiness,
    certifications: business.certifications,
    awards: business.awards,
    primaryCta: business.primaryCta,
    secondaryCta: business.secondaryCta,
    usps: business.usps,
    trustIndicators: business.trustIndicators,
    prospectLabel: business.prospectLabel,
    services: business.services.map((item) => ({
      name: item.name,
      description: item.description,
      imageUrl: item.imageUrl,
    })),
    team: business.team.map((item) => ({
      name: item.name,
      role: item.role,
      photoUrl: item.photoUrl,
      bio: item.bio,
    })),
    reviews: business.reviews.map((item) => ({
      customerName: item.customerName,
      quote: item.quote,
      rating: item.rating,
      source: item.source,
    })),
    media,
  };

  if (input.action === "hero") patch.heroUrl = input.url;
  if (input.action === "logo") patch.logoUrl = input.url;
  if (input.action === "favicon") patch.faviconUrl = input.url;
  if (input.action === "gallery" || input.action === "service") {
    if (!media.some((item) => item.url === input.url)) {
      patch.media = [
        ...media,
        {
          kind: input.action === "service" ? "service" : "gallery",
          url: input.url,
          alt: input.alt || input.action,
        },
      ];
    }
  }

  await updateWebsiteBusiness(business.id, patch, input.actorId);
  await emitFactoryEvent({
    name: "asset.uploaded",
    projectId: input.projectId,
    resourceType: "asset",
    resourceId: input.url,
    actorId: input.actorId,
    meta: { action: input.action },
  });
  return getWebsite(input.projectId);
}
