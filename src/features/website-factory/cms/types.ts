/**
 * Factory SaaS CMS primitives — collections + field binds.
 * Stored on project.siteConfig.collections (jsonb). Not the agency CMS.
 */

export type CmsFieldType = "text" | "textarea" | "image" | "url" | "number";

export type CmsFieldDef = {
  key: string;
  label: string;
  type: CmsFieldType;
};

export type CmsEntry = {
  id: string;
  /** Field values keyed by CmsFieldDef.key */
  values: Record<string, string>;
};

export type CmsCollection = {
  id: string;
  name: string;
  slug: string;
  /** System collections sync from business data when source is set. */
  source?: "services" | "reviews" | "team" | "media" | "custom";
  fields: CmsFieldDef[];
  entries: CmsEntry[];
};

/** Prop key → bind path, e.g. { heading: "name" } or { text: "business.tagline" } */
export type FieldBinds = Record<string, string>;

export const CMS_PROP = {
  binds: "_binds",
  collectionId: "collectionId",
} as const;
