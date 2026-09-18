import type { CSSProperties } from "react";

export type StyleBox = {
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

export function boxStyleToCss(box?: StyleBox | null): CSSProperties {
  if (!box) return {};
  const style: CSSProperties = {};

  if (box.display && box.display !== "block") style.display = box.display as CSSProperties["display"];
  if (box.display === "flex" || box.display === "inline-flex") {
    style.flexDirection = (box.direction || "row") as CSSProperties["flexDirection"];
    style.flexWrap = (box.wrap || "nowrap") as CSSProperties["flexWrap"];
    style.alignItems = (box.align || "stretch") as CSSProperties["alignItems"];
    style.justifyContent = (box.justify || "flex-start") as CSSProperties["justifyContent"];
  }
  if (box.display === "grid") {
    const cols = Number(box.gridCols || "2") || 2;
    style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
    style.alignItems = (box.align || "stretch") as CSSProperties["alignItems"];
    style.justifyContent = (box.justify || "flex-start") as CSSProperties["justifyContent"];
  }
  if (box.gap) style.gap = unit(box.gap);
  if (box.width) style.width = unit(box.width, "%");
  if (box.maxWidth) style.maxWidth = unit(box.maxWidth);
  if (box.minHeight) style.minHeight = unit(box.minHeight);
  if (box.height) style.height = unit(box.height);
  if (box.paddingTop) style.paddingTop = unit(box.paddingTop);
  if (box.paddingRight) style.paddingRight = unit(box.paddingRight);
  if (box.paddingBottom) style.paddingBottom = unit(box.paddingBottom);
  if (box.paddingLeft) style.paddingLeft = unit(box.paddingLeft);
  if (box.marginTop) style.marginTop = unit(box.marginTop);
  if (box.marginRight) style.marginRight = unit(box.marginRight);
  if (box.marginBottom) style.marginBottom = unit(box.marginBottom);
  if (box.marginLeft) style.marginLeft = unit(box.marginLeft);
  if (box.background) style.background = box.background;
  if (box.color) style.color = box.color;
  if (box.fontSize) style.fontSize = unit(box.fontSize);
  if (box.fontWeight) style.fontWeight = box.fontWeight as CSSProperties["fontWeight"];
  if (box.lineHeight) style.lineHeight = box.lineHeight;
  if (box.letterSpacing) style.letterSpacing = unit(box.letterSpacing);
  if (box.textAlign) style.textAlign = box.textAlign as CSSProperties["textAlign"];
  if (box.borderWidth) {
    style.borderWidth = unit(box.borderWidth);
    style.borderStyle = (box.borderStyle || "solid") as CSSProperties["borderStyle"];
    if (box.borderColor) style.borderColor = box.borderColor;
  }
  if (box.radius) style.borderRadius = unit(box.radius);
  if (box.opacity) style.opacity = Number(box.opacity);
  if (box.overflow) style.overflow = box.overflow as CSSProperties["overflow"];
  if (box.position && box.position !== "static") {
    style.position = box.position as CSSProperties["position"];
  }
  if (box.zIndex) style.zIndex = Number(box.zIndex);
  if (box.shadow && box.shadow !== "none") {
    style.boxShadow = SHADOWS[box.shadow] || box.shadow;
  }
  return style;
}

export function pickStyleProps<T extends Record<string, unknown>>(props: T) {
  const { styles, ...rest } = props as T & { styles?: StyleBox };
  return { styles, rest };
}
