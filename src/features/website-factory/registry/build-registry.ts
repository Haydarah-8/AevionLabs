import { factoryConfig } from "@/features/website-factory/puck/config";
import { COMPONENT_META } from "@/features/website-factory/puck/meta";
import type {
  AevionComponentRecord,
  AevionFieldKind,
  AevionRegistryCategory,
  AevionRegistryCategoryId,
  AevionRegistryField,
} from "./types";

const PUCK_TO_CANONICAL: Record<string, AevionRegistryCategoryId> = {
  chrome: "chrome",
  structure: "layout",
  basic: "basic",
  sections: "sections",
  advanced: "advanced",
};

const CATEGORY_TITLES: Record<AevionRegistryCategoryId, string> = {
  layout: "Layout",
  basic: "Basic",
  chrome: "Navigation",
  sections: "Sections",
  forms: "Forms",
  media: "Media",
  advanced: "Advanced",
  uncategorized: "Uncategorized",
};

const DEFAULT_PERMISSIONS = {
  drag: true,
  duplicate: true,
  delete: true,
  edit: true,
  insert: true,
} as const;

function asFieldKind(value: unknown): AevionFieldKind {
  if (typeof value !== "string") return "unknown";
  const known: AevionFieldKind[] = [
    "text",
    "textarea",
    "richtext",
    "number",
    "boolean",
    "select",
    "radio",
    "array",
    "object",
    "slot",
    "custom",
  ];
  return (known as string[]).includes(value)
    ? (value as AevionFieldKind)
    : "unknown";
}

function extractFields(fields: unknown): AevionRegistryField[] {
  if (!fields || typeof fields !== "object") return [];
  return Object.entries(fields as Record<string, Record<string, unknown>>).map(
    ([key, field]) => ({
      key,
      label:
        typeof field?.label === "string"
          ? field.label
          : key
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (c) => c.toUpperCase()),
      kind: asFieldKind(field?.type),
    }),
  );
}

function extractDefaults(
  def: Record<string, unknown>,
): Record<string, unknown> {
  const defaults = def.defaultProps;
  if (defaults && typeof defaults === "object" && !Array.isArray(defaults)) {
    return { ...(defaults as Record<string, unknown>) };
  }
  return {};
}

function extractLabel(type: string, def: Record<string, unknown>): string {
  if (typeof def.label === "string" && def.label.trim()) return def.label;
  return type
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

function buildTypeToPuckCategory(): Map<string, string> {
  const map = new Map<string, string>();
  const categories = factoryConfig.categories as Record<
    string,
    { components?: string[] }
  >;
  for (const [puckKey, cat] of Object.entries(categories || {})) {
    for (const type of cat.components || []) {
      map.set(type, puckKey);
    }
  }
  return map;
}

/** Build the full registry from live Puck config + documentation meta. */
export function buildAevionRegistry(): AevionComponentRecord[] {
  const components = factoryConfig.components as Record<
    string,
    Record<string, unknown>
  >;
  const typeToPuck = buildTypeToPuckCategory();

  return Object.keys(components)
    .sort((a, b) => a.localeCompare(b))
    .map((type) => {
      const def = components[type] || {};
      const puckCategory = typeToPuck.get(type) || "uncategorized";
      const category = PUCK_TO_CANONICAL[puckCategory] || "uncategorized";
      const meta = COMPONENT_META[type];
      const name = extractLabel(type, def);
      const documentation = {
        purpose: meta?.purpose || `${name} block`,
        placement: meta?.placement || "Page body",
        variants: meta?.variants || [],
        constraints: meta?.constraints || "",
      };

      const fields = extractFields(def.fields);
      const slots = fields
        .filter((field) => field.kind === "slot")
        .map((field) => field.key);

      return {
        id: type,
        type,
        name,
        category,
        puckCategory,
        description: documentation.purpose,
        fields,
        slots,
        defaults: extractDefaults(def),
        permissions: { ...DEFAULT_PERMISSIONS },
        documentation,
        version: 1,
        engines: ["puck"] as Array<"puck">,
      } satisfies AevionComponentRecord;
    });
}

export function buildAevionCategories(
  records: AevionComponentRecord[] = buildAevionRegistry(),
): AevionRegistryCategory[] {
  const byCat = new Map<AevionRegistryCategoryId, string[]>();
  for (const record of records) {
    const list = byCat.get(record.category) || [];
    list.push(record.type);
    byCat.set(record.category, list);
  }

  const puckKeys: Record<AevionRegistryCategoryId, string> = {
    layout: "structure",
    basic: "basic",
    chrome: "chrome",
    sections: "sections",
    forms: "sections",
    media: "basic",
    advanced: "advanced",
    uncategorized: "uncategorized",
  };

  return [...byCat.entries()]
    .map(([id, components]) => ({
      id,
      title: CATEGORY_TITLES[id],
      puckKey: puckKeys[id],
      components: components.sort((a, b) => a.localeCompare(b)),
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
}
