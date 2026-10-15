import { buildAevionCategories, buildAevionRegistry } from "./build-registry";
import type {
  AevionComponentRecord,
  AevionRegistryCategory,
  AevionRegistryCategoryId,
} from "./types";

export type {
  AevionComponentDocumentation,
  AevionComponentPermissions,
  AevionComponentRecord,
  AevionFieldKind,
  AevionRegistryCategory,
  AevionRegistryCategoryId,
  AevionRegistryField,
} from "./types";

let cachedRecords: AevionComponentRecord[] | null = null;
let cachedCategories: AevionRegistryCategory[] | null = null;

function records(): AevionComponentRecord[] {
  if (!cachedRecords) cachedRecords = buildAevionRegistry();
  return cachedRecords;
}

function categories(): AevionRegistryCategory[] {
  if (!cachedCategories) cachedCategories = buildAevionCategories(records());
  return cachedCategories;
}

/** Invalidate cache (tests / hot reload). */
export function resetAevionRegistryCache() {
  cachedRecords = null;
  cachedCategories = null;
}

export function listAevionComponents(category?: AevionRegistryCategoryId) {
  const all = records();
  if (!category) return all;
  return all.filter((item) => item.category === category);
}

export function getAevionComponent(type: string) {
  const needle = type.trim();
  if (!needle) return null;
  return (
    records().find(
      (item) =>
        item.type === needle ||
        item.id === needle ||
        item.type.toLowerCase() === needle.toLowerCase(),
    ) ?? null
  );
}

export function listAevionCategories() {
  return categories();
}

export function listAevionComponentTypes() {
  return records().map((item) => item.type);
}

export function isRegisteredComponent(type: string) {
  return Boolean(getAevionComponent(type));
}

/** MCP / API schema projection. */
export function listComponentSchemas() {
  return records().map((item) => ({
    type: item.type,
    id: item.id,
    name: item.name,
    category: item.category,
    puckCategory: item.puckCategory,
    description: item.description,
    fields: item.fields,
    slots: item.slots,
    defaults: item.defaults,
    permissions: item.permissions,
    purpose: item.documentation.purpose,
    placement: item.documentation.placement,
    variants: item.documentation.variants,
    constraints: item.documentation.constraints,
    version: item.version,
    engines: item.engines,
  }));
}

/** Lightweight docs markdown for a single component. */
export function componentDocumentationMarkdown(type: string): string | null {
  const item = getAevionComponent(type);
  if (!item) return null;
  const fieldLines = item.fields
    .map((field) => `- \`${field.key}\` (${field.kind}) — ${field.label}`)
    .join("\n");
  return [
    `# ${item.name}`,
    "",
    `Type: \`${item.type}\``,
    `Category: ${item.category}`,
    "",
    "## Purpose",
    item.documentation.purpose,
    "",
    "## Placement",
    item.documentation.placement,
    "",
    "## Variants",
    item.documentation.variants.length
      ? item.documentation.variants.map((v) => `- ${v}`).join("\n")
      : "- (none documented)",
    "",
    "## Slots",
    item.slots.length
      ? item.slots.map((s) => `- \`${s}\``).join("\n")
      : "- (none)",
    "",
    "## Constraints",
    item.documentation.constraints || "(none)",
    "",
    "## Props",
    fieldLines || "- (no fields)",
    "",
  ].join("\n");
}

export function registryStats() {
  const all = records();
  const byCategory = Object.fromEntries(
    categories().map((cat) => [cat.id, cat.components.length]),
  );
  return {
    total: all.length,
    categories: byCategory,
    withFieldDocs: all.filter((item) => item.fields.length > 0).length,
  };
}
