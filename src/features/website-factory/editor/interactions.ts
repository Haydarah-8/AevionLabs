/**
 * Data-driven interaction presets (Phase 10).
 * Stored on instance props as `_interactions`; applied via data attrs + CSS.
 */

export const STUDIO_INTERACTIONS_PROP = "_interactions" as const;

export type InteractionTrigger = "hover" | "click" | "appear";

export type HoverPresetId =
  | "none"
  | "lift"
  | "scale"
  | "fade"
  | "glow"
  | "underline";

export type ClickPresetId = "none" | "press" | "pulse" | "bounce";

export type AppearPresetId = "none" | "fade-in" | "fade-up" | "fade-down";

export type StudioInteractions = {
  hover?: HoverPresetId;
  click?: ClickPresetId;
  appear?: AppearPresetId;
};

export type InteractionPresetMeta = {
  id: string;
  label: string;
  description: string;
};

export const HOVER_PRESETS: InteractionPresetMeta[] = [
  { id: "none", label: "None", description: "No hover effect" },
  { id: "lift", label: "Lift", description: "Rise slightly with shadow" },
  { id: "scale", label: "Scale", description: "Grow a little on hover" },
  { id: "fade", label: "Fade", description: "Dim slightly on hover" },
  { id: "glow", label: "Glow", description: "Soft outline glow" },
  { id: "underline", label: "Underline", description: "Underline accent" },
];

export const CLICK_PRESETS: InteractionPresetMeta[] = [
  { id: "none", label: "None", description: "No click effect" },
  { id: "press", label: "Press", description: "Quick press-in" },
  { id: "pulse", label: "Pulse", description: "Brief scale pulse" },
  { id: "bounce", label: "Bounce", description: "Light bounce" },
];

export const APPEAR_PRESETS: InteractionPresetMeta[] = [
  { id: "none", label: "None", description: "No enter animation" },
  { id: "fade-in", label: "Fade in", description: "Opacity fade on load" },
  { id: "fade-up", label: "Fade up", description: "Rise into place" },
  { id: "fade-down", label: "Fade down", description: "Settle from above" },
];

export function readInteractions(
  props?: Record<string, unknown> | null,
): StudioInteractions {
  const raw = props?.[STUDIO_INTERACTIONS_PROP];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const rec = raw as Record<string, unknown>;
  const hover =
    typeof rec.hover === "string" && rec.hover !== "none"
      ? (rec.hover as HoverPresetId)
      : undefined;
  const click =
    typeof rec.click === "string" && rec.click !== "none"
      ? (rec.click as ClickPresetId)
      : undefined;
  const appear =
    typeof rec.appear === "string" && rec.appear !== "none"
      ? (rec.appear as AppearPresetId)
      : undefined;
  return { hover, click, appear };
}

export function hasInteractions(interactions: StudioInteractions): boolean {
  return Boolean(
    interactions.hover || interactions.click || interactions.appear,
  );
}

export function patchInteractions(
  props: Record<string, unknown>,
  patch: Partial<StudioInteractions>,
): Record<string, unknown> {
  const current = readInteractions(props);
  const next: StudioInteractions = { ...current, ...patch };

  // Normalize "none" / empty → omit
  for (const key of ["hover", "click", "appear"] as const) {
    const value = next[key];
    if (!value || value === "none") delete next[key];
  }

  const out = { ...props };
  if (hasInteractions(next)) out[STUDIO_INTERACTIONS_PROP] = next;
  else delete out[STUDIO_INTERACTIONS_PROP];
  return out;
}

/** CSS class names applied on the block shell. */
export function interactionClassNames(
  interactions: StudioInteractions,
): string {
  const parts: string[] = [];
  if (interactions.hover) parts.push(`ae-ix-hover-${interactions.hover}`);
  if (interactions.click) parts.push(`ae-ix-click-${interactions.click}`);
  if (interactions.appear) parts.push(`ae-ix-appear-${interactions.appear}`);
  return parts.join(" ");
}
