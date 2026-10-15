/**
 * Layout presets and option lists for the visual layout panel.
 * All patches use StyleBox token keys (same as style-fields / boxStyleToCss).
 */

export type LayoutPreset = {
  id: string;
  label: string;
  patch: Record<string, string>;
};

export const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    id: "full",
    label: "Full width",
    patch: { width: "100%", maxWidth: "", marginLeft: "", marginRight: "" },
  },
  {
    id: "centered",
    label: "Centered",
    patch: {
      width: "100%",
      maxWidth: "72.5rem",
      marginLeft: "auto",
      marginRight: "auto",
    },
  },
  {
    id: "pad-l",
    label: "Pad L",
    patch: {
      paddingTop: "64",
      paddingBottom: "64",
      paddingLeft: "24",
      paddingRight: "24",
    },
  },
  {
    id: "flex-row",
    label: "Flex row",
    patch: {
      display: "flex",
      direction: "row",
      gap: "16",
      align: "center",
      justify: "flex-start",
    },
  },
  {
    id: "flex-col",
    label: "Flex column",
    patch: {
      display: "flex",
      direction: "column",
      gap: "16",
      align: "stretch",
      justify: "flex-start",
    },
  },
  {
    id: "grid-3",
    label: "3-col grid",
    patch: { display: "grid", gridCols: "3", gap: "20" },
  },
];

export const DISPLAY_OPTIONS = [
  { value: "block", label: "Block" },
  { value: "flex", label: "Flex" },
  { value: "grid", label: "Grid" },
  { value: "inline-flex", label: "Inline" },
  { value: "none", label: "None" },
] as const;

export const DIRECTION_OPTIONS = [
  { value: "row", label: "Row →" },
  { value: "column", label: "Col ↓" },
  { value: "row-reverse", label: "Row ←" },
  { value: "column-reverse", label: "Col ↑" },
] as const;

export const WRAP_OPTIONS = [
  { value: "nowrap", label: "No wrap" },
  { value: "wrap", label: "Wrap" },
] as const;

export const ALIGN_OPTIONS = [
  { value: "stretch", label: "Stretch" },
  { value: "flex-start", label: "Start" },
  { value: "center", label: "Center" },
  { value: "flex-end", label: "End" },
  { value: "baseline", label: "Baseline" },
] as const;

export const JUSTIFY_OPTIONS = [
  { value: "flex-start", label: "Start" },
  { value: "center", label: "Center" },
  { value: "flex-end", label: "End" },
  { value: "space-between", label: "Between" },
  { value: "space-around", label: "Around" },
] as const;

export const GRID_COLS_OPTIONS = [
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "6", label: "6" },
] as const;

/** Normalize a spacing field for display in number inputs. */
export function spacingInputValue(raw?: string): string {
  if (!raw?.trim()) return "";
  const trimmed = raw.trim();
  if (trimmed === "auto") return "auto";
  const match = trimmed.match(/^(-?\d+(?:\.\d+)?)(px)?$/i);
  if (match) return match[1]!;
  return trimmed;
}

/** Write spacing back — bare numbers become px via boxStyleToCss unit(). */
export function spacingPatchValue(input: string): string {
  return input.trim();
}

export function isFlexDisplay(display?: string) {
  return display === "flex" || display === "inline-flex";
}

export function isGridDisplay(display?: string) {
  return display === "grid";
}
