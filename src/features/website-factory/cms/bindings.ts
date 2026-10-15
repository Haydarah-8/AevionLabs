import type { Business } from "@/features/website-factory/types";
import type {
  CmsCollection,
  CmsEntry,
  FieldBinds,
} from "@/features/website-factory/cms/types";
import { CMS_PROP } from "@/features/website-factory/cms/types";

export type BindContext = {
  collections: CmsCollection[];
  /** Current CollectionList entry (relative binds). */
  entry?: CmsEntry | null;
  business?: Pick<
    Business,
    | "name"
    | "tagline"
    | "description"
    | "phone"
    | "email"
    | "address"
    | "website"
  > | null;
};

/**
 * Resolve a bind path against context.
 * - `name` / `title` → current entry field
 * - `business.name` → business fact
 * - `collections.services.0.name` → absolute collection path
 * - `services.0.name` → collection slug shortcut
 */
export function resolveBindPath(
  path: string,
  ctx: BindContext,
): string | undefined {
  const trimmed = path.trim();
  if (!trimmed) return undefined;

  if (trimmed.startsWith("business.")) {
    const key = trimmed.slice("business.".length);
    const value = (ctx.business as Record<string, unknown> | null | undefined)?.[
      key
    ];
    return typeof value === "string" ? value : value != null ? String(value) : undefined;
  }

  if (trimmed.startsWith("collections.")) {
    return resolveCollectionPath(trimmed.slice("collections.".length), ctx);
  }

  // slug.index.field or slug.field (first entry)
  if (trimmed.includes(".")) {
    const abs = resolveCollectionPath(trimmed, ctx);
    if (abs !== undefined) return abs;
  }

  // Relative to current entry
  if (ctx.entry) {
    const value = ctx.entry.values[trimmed];
    if (typeof value === "string") return value;
  }

  return undefined;
}

function resolveCollectionPath(
  path: string,
  ctx: BindContext,
): string | undefined {
  const parts = path.split(".").filter(Boolean);
  if (parts.length < 2) return undefined;
  const slug = parts[0]!;
  const collection = ctx.collections.find(
    (c) => c.slug === slug || c.id === slug,
  );
  if (!collection) return undefined;

  let index = 0;
  let fieldKey: string;
  if (/^\d+$/.test(parts[1] || "")) {
    index = Number(parts[1]);
    fieldKey = parts.slice(2).join(".");
  } else {
    fieldKey = parts.slice(1).join(".");
  }
  if (!fieldKey) return undefined;
  const entry = collection.entries[index];
  if (!entry) return undefined;
  const value = entry.values[fieldKey];
  return typeof value === "string" ? value : undefined;
}

export function readFieldBinds(
  props?: Record<string, unknown> | null,
): FieldBinds {
  const raw = props?.[CMS_PROP.binds];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: FieldBinds = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string" && value.trim()) out[key] = value.trim();
  }
  return out;
}

/** Apply `_binds` onto a shallow copy of props (fallback keeps original). */
export function applyFieldBinds(
  props: Record<string, unknown>,
  ctx: BindContext,
): Record<string, unknown> {
  const binds = readFieldBinds(props);
  if (!Object.keys(binds).length) return props;
  const next = { ...props };
  for (const [propKey, path] of Object.entries(binds)) {
    const resolved = resolveBindPath(path, ctx);
    if (resolved !== undefined) next[propKey] = resolved;
  }
  return next;
}

export function setFieldBind(
  props: Record<string, unknown>,
  propKey: string,
  path: string,
): Record<string, unknown> {
  const binds = { ...readFieldBinds(props) };
  if (!path.trim()) delete binds[propKey];
  else binds[propKey] = path.trim();
  const next = { ...props };
  if (Object.keys(binds).length) next[CMS_PROP.binds] = binds;
  else delete next[CMS_PROP.binds];
  return next;
}
