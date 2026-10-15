import type { Business, SiteConfig } from "@/features/website-factory/types";
import type {
  CmsCollection,
  CmsEntry,
  CmsFieldDef,
} from "@/features/website-factory/cms/types";

function id(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function sanitizeCollectionSlug(input: string): string {
  return (
    input
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "collection"
  );
}

export function listCollections(
  siteConfig?: SiteConfig | null,
): CmsCollection[] {
  const list = siteConfig?.collections;
  if (!Array.isArray(list)) return [];
  return list.filter(
    (item): item is CmsCollection =>
      Boolean(item) &&
      typeof item === "object" &&
      typeof (item as CmsCollection).id === "string" &&
      typeof (item as CmsCollection).slug === "string" &&
      Array.isArray((item as CmsCollection).fields) &&
      Array.isArray((item as CmsCollection).entries),
  );
}

export function getCollection(
  siteConfig: SiteConfig | null | undefined,
  idOrSlug: string,
): CmsCollection | null {
  const needle = idOrSlug.trim();
  if (!needle) return null;
  return (
    listCollections(siteConfig).find(
      (c) => c.id === needle || c.slug === needle,
    ) || null
  );
}

export function upsertCollection(
  siteConfig: SiteConfig,
  collection: CmsCollection,
): SiteConfig {
  const existing = listCollections(siteConfig);
  const idx = existing.findIndex((c) => c.id === collection.id);
  const collections =
    idx >= 0
      ? existing.map((c, i) => (i === idx ? collection : c))
      : [...existing, collection];
  return { ...siteConfig, collections };
}

export function removeCollection(
  siteConfig: SiteConfig,
  collectionId: string,
): SiteConfig {
  return {
    ...siteConfig,
    collections: listCollections(siteConfig).filter(
      (c) => c.id !== collectionId,
    ),
  };
}

export function createEmptyCollection(
  partial?: Partial<CmsCollection>,
): CmsCollection {
  const name = partial?.name?.trim() || "New collection";
  const slug = sanitizeCollectionSlug(partial?.slug || name);
  return {
    id: partial?.id || id("col"),
    name,
    slug,
    source: partial?.source || "custom",
    fields: partial?.fields?.length
      ? partial.fields
      : [
          { key: "title", label: "Title", type: "text" },
          { key: "body", label: "Body", type: "textarea" },
          { key: "imageUrl", label: "Image", type: "image" },
        ],
    entries: partial?.entries || [],
  };
}

function entry(
  values: Record<string, string>,
  entryId?: string,
): CmsEntry {
  return { id: entryId || id("ent"), values };
}

const SERVICE_FIELDS: CmsFieldDef[] = [
  { key: "name", label: "Name", type: "text" },
  { key: "description", label: "Description", type: "textarea" },
  { key: "imageUrl", label: "Image", type: "image" },
];

const REVIEW_FIELDS: CmsFieldDef[] = [
  { key: "customerName", label: "Customer", type: "text" },
  { key: "quote", label: "Quote", type: "textarea" },
  { key: "rating", label: "Rating", type: "number" },
  { key: "source", label: "Source", type: "text" },
];

const TEAM_FIELDS: CmsFieldDef[] = [
  { key: "name", label: "Name", type: "text" },
  { key: "role", label: "Role", type: "text" },
  { key: "photoUrl", label: "Photo", type: "image" },
  { key: "bio", label: "Bio", type: "textarea" },
];

const MEDIA_FIELDS: CmsFieldDef[] = [
  { key: "url", label: "URL", type: "image" },
  { key: "alt", label: "Alt", type: "text" },
  { key: "kind", label: "Kind", type: "text" },
];

/** Build / refresh system collections from business facts. */
export function seedCollectionsFromBusiness(
  business: Business,
  existing?: CmsCollection[],
): CmsCollection[] {
  const prev = existing || [];
  const keepCustom = prev.filter((c) => c.source === "custom" || !c.source);

  const services: CmsCollection = {
    id: prev.find((c) => c.slug === "services")?.id || "col_services",
    name: "Services",
    slug: "services",
    source: "services",
    fields: SERVICE_FIELDS,
    entries: (business.services || []).map((s) =>
      entry(
        {
          name: s.name || "",
          description: s.description || "",
          imageUrl: s.imageUrl || "",
        },
        s.id,
      ),
    ),
  };

  const reviews: CmsCollection = {
    id: prev.find((c) => c.slug === "reviews")?.id || "col_reviews",
    name: "Reviews",
    slug: "reviews",
    source: "reviews",
    fields: REVIEW_FIELDS,
    entries: (business.reviews || []).map((r) =>
      entry(
        {
          customerName: r.customerName || "",
          quote: r.quote || "",
          rating: String(r.rating ?? ""),
          source: r.source || "",
        },
        r.id,
      ),
    ),
  };

  const team: CmsCollection = {
    id: prev.find((c) => c.slug === "team")?.id || "col_team",
    name: "Team",
    slug: "team",
    source: "team",
    fields: TEAM_FIELDS,
    entries: (business.team || []).map((t) =>
      entry(
        {
          name: t.name || "",
          role: t.role || "",
          photoUrl: t.photoUrl || "",
          bio: t.bio || "",
        },
        t.id,
      ),
    ),
  };

  const media: CmsCollection = {
    id: prev.find((c) => c.slug === "media")?.id || "col_media",
    name: "Media",
    slug: "media",
    source: "media",
    fields: MEDIA_FIELDS,
    entries: (business.media || []).map((m) =>
      entry(
        {
          url: m.url || "",
          alt: m.alt || "",
          kind: m.kind || "",
        },
        m.id,
      ),
    ),
  };

  return [...keepCustom, services, reviews, team, media];
}

export function withSeededCollections(
  siteConfig: SiteConfig,
  business: Business,
): SiteConfig {
  return {
    ...siteConfig,
    collections: seedCollectionsFromBusiness(
      business,
      listCollections(siteConfig),
    ),
  };
}
