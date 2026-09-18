/**
 * Maps inspector tabs to style-object keys and content prop heuristics
 * so each tab shows a focused subset of controls.
 */

export type InspectorTab =
  | "content"
  | "layout"
  | "typography"
  | "appearance"
  | "responsive"
  | "advanced"
  | "theme"
  | "seo"
  | "audit"
  | "history";

export const LAYOUT_STYLE_KEYS = [
  "display",
  "direction",
  "wrap",
  "align",
  "justify",
  "gap",
  "gridCols",
  "width",
  "maxWidth",
  "height",
  "minHeight",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
] as const;

export const TYPOGRAPHY_STYLE_KEYS = [
  "fontSize",
  "fontWeight",
  "lineHeight",
  "letterSpacing",
  "textAlign",
  "color",
] as const;

export const APPEARANCE_STYLE_KEYS = [
  "background",
  "borderWidth",
  "borderColor",
  "borderStyle",
  "radius",
  "opacity",
  "shadow",
] as const;

export const ADVANCED_STYLE_KEYS = [
  "overflow",
  "position",
  "zIndex",
] as const;

export const RESPONSIVE_HINTS = [
  "Use the breakpoint selector in the header to preview Mobile / Tablet / Desktop / Wide.",
  "Width, padding, and font size can be tuned under Layout and Typography for each selection.",
] as const;

/** Content props that are not the styles bag */
export const CONTENT_PROP_HINTS = [
  "eyebrow",
  "heading",
  "description",
  "body",
  "text",
  "label",
  "href",
  "primaryLabel",
  "primaryHref",
  "secondaryLabel",
  "secondaryHref",
  "imageUrl",
  "imageAlt",
  "videoUrl",
  "url",
  "alt",
  "items",
  "email",
  "phone",
  "name",
  "note",
  "columns",
] as const;

export function styleKeysForTab(tab: InspectorTab): readonly string[] | null {
  switch (tab) {
    case "layout":
      return LAYOUT_STYLE_KEYS;
    case "typography":
      return TYPOGRAPHY_STYLE_KEYS;
    case "appearance":
      return APPEARANCE_STYLE_KEYS;
    case "advanced":
      return ADVANCED_STYLE_KEYS;
    case "responsive":
      return [...LAYOUT_STYLE_KEYS, ...TYPOGRAPHY_STYLE_KEYS];
    case "content":
      return null;
    default:
      return null;
  }
}
