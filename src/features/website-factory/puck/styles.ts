import type { CSSProperties } from "react";

/** Layout/type/appearance tokens (no nested responsive bag). */
export type StyleTokens = {
  display?: string;
  direction?: string;
  wrap?: string;
  align?: string;
  justify?: string;
  gap?: string;
  gridCols?: string;
  width?: string;
  maxWidth?: string;
  minHeight?: string;
  height?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  background?: string;
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textAlign?: string;
  borderWidth?: string;
  borderColor?: string;
  borderStyle?: string;
  radius?: string;
  opacity?: string;
  overflow?: string;
  position?: string;
  zIndex?: string;
  shadow?: string;
};

/**
 * Component style bag. Top-level tokens = desktop/base.
 * Overrides: `styles.responsive.tablet` / `styles.responsive.mobile`.
 */
export type StyleBox = StyleTokens & {
  responsive?: {
    tablet?: StyleTokens;
    mobile?: StyleTokens;
  };
};

export const defaultBoxStyle: StyleBox = {
  display: "block",
  direction: "row",
  wrap: "nowrap",
  align: "stretch",
  justify: "flex-start",
  gap: "",
  gridCols: "2",
  width: "100%",
  maxWidth: "",
  minHeight: "",
  height: "",
  paddingTop: "",
  paddingRight: "",
  paddingBottom: "",
  paddingLeft: "",
  marginTop: "",
  marginRight: "",
  marginBottom: "",
  marginLeft: "",
  background: "",
  color: "",
  fontSize: "",
  fontWeight: "",
  lineHeight: "",
  letterSpacing: "",
  textAlign: "",
  borderWidth: "",
  borderColor: "",
  borderStyle: "solid",
  radius: "",
  opacity: "",
  overflow: "",
  position: "static",
  zIndex: "",
  shadow: "none",
};

function unit(value?: string, fallbackUnit = "px") {
  if (!value?.trim()) return undefined;
  const v = value.trim();
  if (v === "auto" || v === "none" || v === "0") return v;
  if (/^-?\d+(\.\d+)?(px|rem|em|%|vh|vw|ch)$/i.test(v)) return v;
  if (/^-?\d+(\.\d+)?$/.test(v)) return `${v}${fallbackUnit}`;
  return v;
}

const SHADOWS: Record<string, string> = {
  none: "none",
  sm: "0 1px 2px rgba(0,0,0,.08)",
  md: "0 8px 24px rgba(0,0,0,.12)",
  lg: "0 18px 48px rgba(0,0,0,.16)",
};

export function boxStyleToCss(box?: StyleTokens | StyleBox | null): CSSProperties {
  if (!box) return {};
  const { responsive: _ignored, ...tokens } = box as StyleBox;
  const style: CSSProperties = {};
  const b = tokens as StyleTokens;

  if (b.display && b.display !== "block")
    style.display = b.display as CSSProperties["display"];
  if (b.display === "flex" || b.display === "inline-flex") {
    style.flexDirection = (b.direction || "row") as CSSProperties["flexDirection"];
    style.flexWrap = (b.wrap || "nowrap") as CSSProperties["flexWrap"];
    style.alignItems = (b.align || "stretch") as CSSProperties["alignItems"];
    style.justifyContent = (b.justify || "flex-start") as CSSProperties["justifyContent"];
  }
  if (b.display === "grid") {
    const cols = Number(b.gridCols || "2") || 2;
    style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
    style.alignItems = (b.align || "stretch") as CSSProperties["alignItems"];
    style.justifyContent = (b.justify || "flex-start") as CSSProperties["justifyContent"];
  }
  if (b.gap) style.gap = unit(b.gap);
  if (b.width) style.width = unit(b.width, "%");
  if (b.maxWidth) style.maxWidth = unit(b.maxWidth);
  if (b.minHeight) style.minHeight = unit(b.minHeight);
  if (b.height) style.height = unit(b.height);
  if (b.paddingTop) style.paddingTop = unit(b.paddingTop);
  if (b.paddingRight) style.paddingRight = unit(b.paddingRight);
  if (b.paddingBottom) style.paddingBottom = unit(b.paddingBottom);
  if (b.paddingLeft) style.paddingLeft = unit(b.paddingLeft);
  if (b.marginTop) style.marginTop = unit(b.marginTop);
  if (b.marginRight) style.marginRight = unit(b.marginRight);
  if (b.marginBottom) style.marginBottom = unit(b.marginBottom);
  if (b.marginLeft) style.marginLeft = unit(b.marginLeft);
  if (b.background) style.background = b.background;
  if (b.color) style.color = b.color;
  if (b.fontSize) style.fontSize = unit(b.fontSize);
  if (b.fontWeight) style.fontWeight = b.fontWeight as CSSProperties["fontWeight"];
  if (b.lineHeight) style.lineHeight = b.lineHeight;
  if (b.letterSpacing) style.letterSpacing = unit(b.letterSpacing);
  if (b.textAlign) style.textAlign = b.textAlign as CSSProperties["textAlign"];
  if (b.borderWidth) {
    style.borderWidth = unit(b.borderWidth);
    style.borderStyle = (b.borderStyle || "solid") as CSSProperties["borderStyle"];
    if (b.borderColor) style.borderColor = b.borderColor;
  }
  if (b.radius) style.borderRadius = unit(b.radius);
  if (b.opacity) style.opacity = Number(b.opacity);
  if (b.overflow) style.overflow = b.overflow as CSSProperties["overflow"];
  if (b.position && b.position !== "static") {
    style.position = b.position as CSSProperties["position"];
  }
  if (b.zIndex) style.zIndex = Number(b.zIndex);
  if (b.shadow && b.shadow !== "none") {
    style.boxShadow = SHADOWS[b.shadow] || b.shadow;
  }
  return style;
}

export function pickStyleProps<T extends Record<string, unknown>>(props: T) {
  const { styles, ...rest } = props as T & { styles?: StyleBox };
  return { styles, rest };
}
