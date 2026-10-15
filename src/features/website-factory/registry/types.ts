/**
 * Canonical Aevion component registry types.
 * Puck remains the render engine; this registry is the Aevion source for
 * catalogs, AI, MCP, docs, and (later) config generation.
 */

export type AevionRegistryCategoryId =
  | "layout"
  | "basic"
  | "chrome"
  | "sections"
  | "forms"
  | "media"
  | "advanced"
  | "uncategorized";

export type AevionFieldKind =
  | "text"
  | "textarea"
  | "richtext"
  | "number"
  | "boolean"
  | "select"
  | "radio"
  | "array"
  | "object"
  | "slot"
  | "custom"
  | "unknown";

export type AevionRegistryField = {
  key: string;
  label: string;
  kind: AevionFieldKind;
};

export type AevionComponentPermissions = {
  drag: boolean;
  duplicate: boolean;
  delete: boolean;
  edit: boolean;
  insert: boolean;
};

export type AevionComponentDocumentation = {
  purpose: string;
  placement: string;
  variants: string[];
  constraints: string;
};

export type AevionComponentRecord = {
  /** Stable id — currently equals Puck component type. */
  id: string;
  type: string;
  name: string;
  /** Canonical Aevion category. */
  category: AevionRegistryCategoryId;
  /** Original Puck category key (chrome, structure, …). */
  puckCategory: string;
  description: string;
  icon?: string;
  fields: AevionRegistryField[];
  /** Puck slot field keys on this component (empty if leaf). */
  slots: string[];
  defaults: Record<string, unknown>;
  permissions: AevionComponentPermissions;
  documentation: AevionComponentDocumentation;
  version: number;
  engines: Array<"puck">;
  allowedChildren?: string[];
};

export type AevionRegistryCategory = {
  id: AevionRegistryCategoryId;
  title: string;
  puckKey: string;
  components: string[];
};
