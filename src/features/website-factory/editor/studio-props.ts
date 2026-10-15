/**
 * Aevion instance flags stored on Puck component props.
 * Persist in page draft/published JSON alongside content props.
 */

export const STUDIO_PROP = {
  label: "_label",
  locked: "_locked",
  hidden: "_hidden",
  variant: "_variant",
  lockChildren: "_lockChildren",
} as const;

export type StudioInstanceFlags = {
  id?: string;
  _label?: string;
  _locked?: boolean;
  _hidden?: boolean;
  /** Active documented / preset variant id for this instance. */
  _variant?: string;
  /** When true, locking this block also locks nested slot children (UI-assisted). */
  _lockChildren?: boolean;
};

/** @deprecated Prefer StudioInstanceFlags */
export type StudioLayerProps = StudioInstanceFlags;

export function getLayerLabel(
  type: string,
  props?: Record<string, unknown> | null,
): string {
  const custom = props?.[STUDIO_PROP.label];
  if (typeof custom === "string" && custom.trim()) return custom.trim();
  return type;
}

export function getInstanceVariant(
  props?: Record<string, unknown> | null,
): string {
  const value = props?.[STUDIO_PROP.variant];
  return typeof value === "string" ? value : "";
}

export function isLayerLocked(props?: Record<string, unknown> | null): boolean {
  return Boolean(props?.[STUDIO_PROP.locked]);
}

export function isLayerHidden(props?: Record<string, unknown> | null): boolean {
  return Boolean(props?.[STUDIO_PROP.hidden]);
}

export function locksChildren(props?: Record<string, unknown> | null): boolean {
  return Boolean(props?.[STUDIO_PROP.lockChildren]);
}

export function readInstanceFlags(
  props?: Record<string, unknown> | null,
): StudioInstanceFlags {
  return {
    id: typeof props?.id === "string" ? props.id : undefined,
    _label:
      typeof props?.[STUDIO_PROP.label] === "string"
        ? (props[STUDIO_PROP.label] as string)
        : undefined,
    _locked: isLayerLocked(props),
    _hidden: isLayerHidden(props),
    _variant: getInstanceVariant(props) || undefined,
    _lockChildren: locksChildren(props),
  };
}

export function patchInstanceFlags(
  props: Record<string, unknown>,
  patch: Partial<StudioInstanceFlags>,
): Record<string, unknown> {
  const next = { ...props };
  if ("_label" in patch) {
    const label = patch._label?.trim();
    if (label) next[STUDIO_PROP.label] = label;
    else delete next[STUDIO_PROP.label];
  }
  if ("_locked" in patch) {
    if (patch._locked) next[STUDIO_PROP.locked] = true;
    else delete next[STUDIO_PROP.locked];
  }
  if ("_hidden" in patch) {
    if (patch._hidden) next[STUDIO_PROP.hidden] = true;
    else delete next[STUDIO_PROP.hidden];
  }
  if ("_variant" in patch) {
    const variant = patch._variant?.trim();
    if (variant) next[STUDIO_PROP.variant] = variant;
    else delete next[STUDIO_PROP.variant];
  }
  if ("_lockChildren" in patch) {
    if (patch._lockChildren) next[STUDIO_PROP.lockChildren] = true;
    else delete next[STUDIO_PROP.lockChildren];
  }
  return next;
}
