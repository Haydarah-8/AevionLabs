import type { CSSProperties } from "react";
import type { DesignVariable, ThemeTokens } from "../types";
import { DEFAULT_THEME } from "../types";

/** Built-in theme fields exposed as --wf-* CSS variables. */
export const CORE_THEME_FIELDS = [
  "primary",
  "secondary",
  "accent",
  "background",
  "foreground",
  "headingFont",
  "bodyFont",
  "radius",
] as const;

export type CoreThemeField = (typeof CORE_THEME_FIELDS)[number];

export const CORE_CSS_VAR: Record<CoreThemeField, string> = {
  primary: "--wf-primary",
  secondary: "--wf-secondary",
  accent: "--wf-accent",
  background: "--wf-bg",
  foreground: "--wf-fg",
  headingFont: "--wf-heading",
  bodyFont: "--wf-body",
  radius: "--wf-radius",
};

export function customCssVar(key: string): string {
  return `--wf-var-${sanitizeVariableKey(key)}`;
}

export function sanitizeVariableKey(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "token";
}

export function listCustomVariables(
  theme?: Partial<ThemeTokens> | null,
): DesignVariable[] {
  const list = theme?.variables;
  if (!Array.isArray(list)) return [];
  return list.filter(
    (item): item is DesignVariable =>
      Boolean(item) &&
      typeof item === "object" &&
      typeof (item as DesignVariable).id === "string" &&
      typeof (item as DesignVariable).key === "string" &&
      typeof (item as DesignVariable).value === "string",
  );
}

export function mergeTheme(
  theme?: Partial<ThemeTokens> | null,
): ThemeTokens {
  return {
    ...DEFAULT_THEME,
    ...theme,
    variables: listCustomVariables(theme),
  };
}

/** CSS custom properties for the site root (theme bridge). */
export function themeToCssVars(
  theme?: Partial<ThemeTokens> | null,
): Record<string, string> {
  const t = mergeTheme(theme);
  const vars: Record<string, string> = {
    [CORE_CSS_VAR.primary]: t.primary,
    [CORE_CSS_VAR.secondary]: t.secondary,
    [CORE_CSS_VAR.accent]: t.accent,
    [CORE_CSS_VAR.background]: t.background,
    [CORE_CSS_VAR.foreground]: t.foreground,
    [CORE_CSS_VAR.headingFont]: t.headingFont,
    [CORE_CSS_VAR.bodyFont]: t.bodyFont,
    [CORE_CSS_VAR.radius]: t.radius,
  };
  for (const item of t.variables || []) {
    vars[customCssVar(item.key)] = item.value;
  }
  return vars;
}

export function themeStyle(
  theme?: Partial<ThemeTokens> | null,
): CSSProperties {
  return themeToCssVars(theme) as CSSProperties;
}

/** Reference usable in StyleBox fields, e.g. var(--wf-primary). */
export function cssVarReference(cssVarName: string): string {
  return `var(${cssVarName})`;
}

export function coreVarReference(field: CoreThemeField): string {
  return cssVarReference(CORE_CSS_VAR[field]);
}

export function customVarReference(key: string): string {
  return cssVarReference(customCssVar(key));
}

/**
 * Resolve shorthand theme refs in style values:
 * `$primary` / `theme.primary` → `var(--wf-primary)`
 * `$var.space-md` → `var(--wf-var-space-md)`
 */
export function resolveThemeReference(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return value;

  const coreMatch = trimmed.match(/^\$([a-zA-Z]+)$/);
  if (coreMatch) {
    const field = coreMatch[1] as CoreThemeField;
    if ((CORE_THEME_FIELDS as readonly string[]).includes(field)) {
      return coreVarReference(field);
    }
  }

  const themeDot = trimmed.match(/^theme\.([a-zA-Z]+)$/);
  if (themeDot) {
    const field = themeDot[1] as CoreThemeField;
    if ((CORE_THEME_FIELDS as readonly string[]).includes(field)) {
      return coreVarReference(field);
    }
  }

  const custom = trimmed.match(/^\$var\.([a-z0-9-_]+)$/i);
  if (custom) return customVarReference(custom[1]!);

  return value;
}

export function patchStyleWithThemeRefs(
  patch: Record<string, string>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(patch).map(([key, value]) => [
      key,
      resolveThemeReference(value),
    ]),
  );
}

export function upsertDesignVariable(
  theme: ThemeTokens,
  variable: DesignVariable,
): ThemeTokens {
  const key = sanitizeVariableKey(variable.key);
  const next: DesignVariable = {
    ...variable,
    key,
    name: variable.name.trim() || key,
    value: variable.value,
  };
  const existing = listCustomVariables(theme);
  const idx = existing.findIndex((item) => item.id === next.id);
  const variables =
    idx >= 0
      ? existing.map((item, i) => (i === idx ? next : item))
      : [...existing, next];
  return { ...theme, variables };
}

export function removeDesignVariable(
  theme: ThemeTokens,
  id: string,
): ThemeTokens {
  return {
    ...theme,
    variables: listCustomVariables(theme).filter((item) => item.id !== id),
  };
}

export function createDesignVariable(
  partial?: Partial<DesignVariable>,
): DesignVariable {
  const key = sanitizeVariableKey(partial?.key || partial?.name || "token");
  return {
    id:
      partial?.id ||
      `var_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    name: partial?.name?.trim() || key,
    key,
    value: partial?.value ?? (partial?.type === "color" ? "#111111" : "1rem"),
    type: partial?.type || "string",
  };
}

export type VariableCatalogItem = {
  id: string;
  label: string;
  cssVar: string;
  reference: string;
  value: string;
  source: "core" | "custom";
  type: DesignVariable["type"] | "color" | "font" | "size" | "string";
};

export function listVariableCatalog(
  theme?: Partial<ThemeTokens> | null,
): VariableCatalogItem[] {
  const t = mergeTheme(theme);
  const core: VariableCatalogItem[] = CORE_THEME_FIELDS.map((field) => ({
    id: `core:${field}`,
    label: field,
    cssVar: CORE_CSS_VAR[field],
    reference: coreVarReference(field),
    value: t[field],
    source: "core" as const,
    type:
      field === "headingFont" || field === "bodyFont"
        ? ("font" as const)
        : field === "radius"
          ? ("size" as const)
          : ("color" as const),
  }));
  const custom: VariableCatalogItem[] = listCustomVariables(t).map((item) => ({
    id: item.id,
    label: item.name,
    cssVar: customCssVar(item.key),
    reference: customVarReference(item.key),
    value: item.value,
    source: "custom" as const,
    type: item.type,
  }));
  return [...core, ...custom];
}
