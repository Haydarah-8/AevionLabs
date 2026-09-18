import type { BusinessInput } from "../services/schemas";
import { generateWebsite } from "../services/generate";
import {
  getProjectBundle,
  updateProject,
  upsertBusiness,
} from "../services/store";
import type { IntelligenceResult } from "./types";
import { downloadAndOrganiseAssets } from "./assets";

export type ApplyImportOptions = {
  projectId: string;
  result: IntelligenceResult;
  rebuildPages?: boolean;
  applyBrandColors?: boolean;
  fields?: {
    identity?: boolean;
    contact?: boolean;
    services?: boolean;
    reviews?: boolean;
    media?: boolean;
    social?: boolean;
  };
};

function included<T extends { include: boolean }>(items: T[]) {
  return items.filter((item) => item.include);
}

function normalizeHex(value: string) {
  const raw = value.trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(raw)) return raw;
  if (/^#[0-9a-f]{3}$/.test(raw)) {
    return `#${raw[1]}${raw[1]}${raw[2]}${raw[2]}${raw[3]}${raw[3]}`;
  }
  return "";
}

export function intelligenceToBusinessPatch(
  result: IntelligenceResult,
  current: BusinessInput,
  fields: ApplyImportOptions["fields"] = {},
): BusinessInput {
  const use = {
    identity: fields.identity !== false,
    contact: fields.contact !== false,
    services: fields.services !== false,
    reviews: fields.reviews !== false,
    media: fields.media !== false,
    social: fields.social !== false,
  };

  const services = use.services
    ? included(result.services).map((item) => ({
        name: item.name,
        description: item.description,
        imageUrl: item.imageUrl,
      }))
    : current.services;

  const reviews = use.reviews
    ? included(result.reviews).map((item) => ({
        customerName: item.customerName,
        quote: item.quote,
        rating: item.rating,
        source: item.source,
      }))
    : current.reviews;

  const media = use.media
    ? included(result.images)
        .filter(
          (item) =>
            item.kind === "gallery" ||
            item.kind === "service" ||
            item.kind === "team",
        )
        .map((item) => ({
          kind: item.kind,
          url: item.url,
          alt: item.alt || item.kind,
        }))
    : current.media;

  return {
    ...current,
    name: use.identity && result.name ? result.name : current.name,
    tagline: use.identity && result.tagline ? result.tagline : current.tagline,
    description:
      use.identity && result.description ? result.description : current.description,
    logoUrl: use.media && result.logoUrl ? result.logoUrl : current.logoUrl,
    faviconUrl:
      use.media && result.faviconUrl ? result.faviconUrl : current.faviconUrl,
    heroUrl: use.media && result.heroUrl ? result.heroUrl : current.heroUrl,
    phone: use.contact && result.phone ? result.phone : current.phone,
    email: use.contact && result.email ? result.email : current.email,
    website: use.contact ? result.sourceUrl || current.website : current.website,
    address: use.contact && result.address ? result.address : current.address,
    postcode: use.contact && result.postcode ? result.postcode : current.postcode,
    social: use.social ? { ...current.social, ...result.social } : current.social,
    services: services.length ? services : current.services,
    reviews: reviews.length ? reviews : current.reviews,
    media: media.length ? media : current.media,
  };
}

export async function applyIntelligenceImport(options: ApplyImportOptions) {
  const bundle = await getProjectBundle(options.projectId);
  if (!bundle) throw new Error("Project not found");

  let result = options.result;
  if (options.fields?.media !== false) {
    try {
      result = await downloadAndOrganiseAssets(options.projectId, result);
    } catch (err) {
      console.warn("[website-factory] asset download skipped", err);
    }
  }

  const patch = intelligenceToBusinessPatch(
    result,
    {
      name: bundle.business.name,
      slug: bundle.business.slug,
      tagline: bundle.business.tagline,
      description: bundle.business.description,
      industry: bundle.business.industry,
      logoUrl: bundle.business.logoUrl,
      faviconUrl: bundle.business.faviconUrl,
      heroUrl: bundle.business.heroUrl,
      phone: bundle.business.phone,
      email: bundle.business.email,
      website: bundle.business.website,
      address: bundle.business.address,
      postcode: bundle.business.postcode,
      openingHours: bundle.business.openingHours,
      social: bundle.business.social,
      yearsInBusiness: bundle.business.yearsInBusiness,
      certifications: bundle.business.certifications,
      awards: bundle.business.awards,
      primaryCta: bundle.business.primaryCta,
      secondaryCta: bundle.business.secondaryCta,
      usps: bundle.business.usps,
      trustIndicators: bundle.business.trustIndicators,
      prospectLabel: bundle.business.prospectLabel,
      services: bundle.business.services.map((item) => ({
        name: item.name,
        description: item.description,
        imageUrl: item.imageUrl,
      })),
      team: bundle.business.team.map((item) => ({
        name: item.name,
        role: item.role,
        photoUrl: item.photoUrl,
        bio: item.bio,
      })),
      reviews: bundle.business.reviews.map((item) => ({
        customerName: item.customerName,
        quote: item.quote,
        rating: item.rating,
        source: item.source,
      })),
      media: bundle.business.media.map((item) => ({
        kind: item.kind,
        url: item.url,
        alt: item.alt,
      })),
    },
    options.fields,
  );

  await upsertBusiness(patch, bundle.business.id);

  if (options.applyBrandColors !== false && result.brandColors?.length) {
    const colors = result.brandColors
      .map(normalizeHex)
      .filter(Boolean);
    if (colors[0]) {
      await updateProject(options.projectId, {
        theme: {
          ...bundle.project.theme,
          primary: colors[0],
          accent: colors[1] || colors[0],
          secondary: colors[2] || bundle.project.theme.secondary,
        },
      });
    }
  }

  if (options.rebuildPages !== false) {
    return generateWebsite(options.projectId, "rebuild");
  }
  return getProjectBundle(options.projectId);
}

export async function findReplaceBusinessCopy(
  projectId: string,
  find: string,
  replaceWith: string,
  rebuildPages = true,
) {
  const needle = find.trim();
  if (!needle) throw new Error("Enter text to find");
  const bundle = await getProjectBundle(projectId);
  if (!bundle) throw new Error("Project not found");

  const swap = (value: string) => value.split(needle).join(replaceWith);

  const business = bundle.business;
  await upsertBusiness(
    {
      name: swap(business.name),
      slug: business.slug,
      tagline: swap(business.tagline),
      description: swap(business.description),
      industry: business.industry,
      logoUrl: business.logoUrl,
      faviconUrl: business.faviconUrl,
      heroUrl: business.heroUrl,
      phone: business.phone,
      email: business.email,
      website: business.website,
      address: swap(business.address),
      postcode: business.postcode,
      openingHours: business.openingHours,
      social: business.social,
      yearsInBusiness: business.yearsInBusiness,
      certifications: business.certifications.map(swap),
      awards: business.awards.map(swap),
      primaryCta: {
        label: swap(business.primaryCta.label),
        href: business.primaryCta.href,
      },
      secondaryCta: {
        label: swap(business.secondaryCta.label),
        href: business.secondaryCta.href,
      },
      usps: business.usps.map(swap),
      trustIndicators: business.trustIndicators.map(swap),
      prospectLabel: swap(business.prospectLabel),
      services: business.services.map((item) => ({
        name: swap(item.name),
        description: swap(item.description),
        imageUrl: item.imageUrl,
      })),
      team: business.team.map((item) => ({
        name: swap(item.name),
        role: swap(item.role),
        photoUrl: item.photoUrl,
        bio: swap(item.bio),
      })),
      reviews: business.reviews.map((item) => ({
        customerName: swap(item.customerName),
        quote: swap(item.quote),
        rating: item.rating,
        source: item.source,
      })),
      media: business.media.map((item) => ({
        kind: item.kind,
        url: item.url,
        alt: swap(item.alt),
      })),
    },
    business.id,
  );

  if (rebuildPages) return generateWebsite(projectId, "rebuild");
  return getProjectBundle(projectId);
}
