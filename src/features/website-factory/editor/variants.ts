import { COMPONENT_META } from "@/features/website-factory/puck/meta";
import { STUDIO_PROP } from "@/features/website-factory/editor/studio-props";
import type { StyleBox } from "@/features/website-factory/puck/styles";

export type VariantPreset = {
  id: string;
  label: string;
  /** Top-level prop patches (not styles). */
  props?: Record<string, unknown>;
  /** Merged into props.styles */
  styles?: Partial<StyleBox>;
  /** True when this preset can be applied (vs docs-only). */
  applyable: boolean;
};

/**
 * Applyable instance variants for key components.
 * Docs-only variants from COMPONENT_META still appear in the catalog.
 */
const PRESETS: Record<string, VariantPreset[]> = {
  Flex: [
    {
      id: "row",
      label: "Row",
      applyable: true,
      styles: { display: "flex", direction: "row", wrap: "wrap" },
    },
    {
      id: "column",
      label: "Column",
      applyable: true,
      styles: { display: "flex", direction: "column", wrap: "nowrap" },
    },
  ],
  Grid: [
    {
      id: "2-col",
      label: "2 columns",
      applyable: true,
      styles: { display: "grid", gridCols: "2" },
    },
    {
      id: "3-col",
      label: "3 columns",
      applyable: true,
      styles: { display: "grid", gridCols: "3" },
    },
    {
      id: "4-col",
      label: "4 columns",
      applyable: true,
      styles: { display: "grid", gridCols: "4" },
    },
  ],
  ButtonBlock: [
    {
      id: "solid",
      label: "Solid",
      applyable: true,
      props: { ghost: "no" },
    },
    {
      id: "ghost",
      label: "Ghost",
      applyable: true,
      props: { ghost: "yes" },
    },
  ],
  Heading: [
    { id: "h1", label: "H1", applyable: true, props: { as: "h1" } },
    { id: "h2", label: "H2", applyable: true, props: { as: "h2" } },
    { id: "h3", label: "H3", applyable: true, props: { as: "h3" } },
    { id: "h4", label: "H4", applyable: true, props: { as: "h4" } },
  ],
  Section: [
    {
      id: "pad-l",
      label: "Large padding",
      applyable: true,
      styles: { paddingTop: "64", paddingBottom: "64" },
    },
    {
      id: "pad-m",
      label: "Medium padding",
      applyable: true,
      styles: { paddingTop: "40", paddingBottom: "40" },
    },
  ],
  Container: [
    {
      id: "narrow",
      label: "Narrow",
      applyable: true,
      props: { maxWidth: "42rem" },
      styles: { maxWidth: "42rem" },
    },
    {
      id: "wide",
      label: "Wide",
      applyable: true,
      props: { maxWidth: "72.5rem" },
      styles: { maxWidth: "72.5rem" },
    },
  ],
};

function slugifyVariant(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Combined applyable presets + documentation-only variants from meta. */
export function listVariantsForType(type: string): VariantPreset[] {
  const presets = PRESETS[type] || [];
  const byId = new Map(presets.map((p) => [p.id, p]));
  const docs = COMPONENT_META[type]?.variants || [];
  for (const label of docs) {
    const id = slugifyVariant(label);
    if (!id || byId.has(id)) continue;
    byId.set(id, {
      id,
      label,
      applyable: false,
    });
  }
  return [...byId.values()];
}

export function getVariantPreset(
  type: string,
  variantId: string,
): VariantPreset | null {
  return (
    listVariantsForType(type).find((item) => item.id === variantId) || null
  );
}

/**
 * Apply a variant to instance props. Always sets `_variant`.
 * Applyable presets merge props/styles; docs-only only set the flag.
 */
export function applyVariantToProps(
  type: string,
  variantId: string,
  props: Record<string, unknown>,
): Record<string, unknown> {
  const preset = getVariantPreset(type, variantId);
  const next: Record<string, unknown> = {
    ...props,
    [STUDIO_PROP.variant]: variantId,
  };
  if (!preset?.applyable) return next;
  if (preset.props) Object.assign(next, preset.props);
  if (preset.styles) {
    const current =
      (props.styles as Record<string, unknown> | undefined) || {};
    next.styles = { ...current, ...preset.styles };
  }
  return next;
}

export function hasApplyableVariants(type: string): boolean {
  return listVariantsForType(type).some((v) => v.applyable);
}
