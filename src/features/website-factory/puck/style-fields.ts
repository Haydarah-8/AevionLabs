import type { Fields } from "@puckeditor/core";
import { defaultBoxStyle, type StyleBox } from "./styles";

const text = { type: "text" as const };
const select = (options: Array<{ label: string; value: string }>) => ({
  type: "select" as const,
  options,
});

/** Webflow-like layout / spacing / size / type / appearance object field */
export const styleObjectField = {
  type: "object" as const,
  label: "Style & layout",
  objectFields: {
    display: select([
      { label: "Block", value: "block" },
      { label: "Flex", value: "flex" },
      { label: "Grid", value: "grid" },
      { label: "Inline flex", value: "inline-flex" },
      { label: "None", value: "none" },
    ]),
    direction: select([
      { label: "Row", value: "row" },
      { label: "Column", value: "column" },
      { label: "Row reverse", value: "row-reverse" },
      { label: "Column reverse", value: "column-reverse" },
    ]),
    wrap: select([
      { label: "No wrap", value: "nowrap" },
      { label: "Wrap", value: "wrap" },
    ]),
    align: select([
      { label: "Stretch", value: "stretch" },
      { label: "Start", value: "flex-start" },
      { label: "Center", value: "center" },
      { label: "End", value: "flex-end" },
      { label: "Baseline", value: "baseline" },
    ]),
    justify: select([
      { label: "Start", value: "flex-start" },
      { label: "Center", value: "center" },
      { label: "End", value: "flex-end" },
      { label: "Space between", value: "space-between" },
      { label: "Space around", value: "space-around" },
    ]),
    gap: { type: "text" as const, label: "Gap (px / rem)" },
    gridCols: select([
      { label: "2 columns", value: "2" },
      { label: "3 columns", value: "3" },
      { label: "4 columns", value: "4" },
      { label: "6 columns", value: "6" },
    ]),
    width: { type: "text" as const, label: "Width (%, px)" },
    maxWidth: { type: "text" as const, label: "Max width" },
    height: { type: "text" as const, label: "Height" },
    minHeight: { type: "text" as const, label: "Min height" },
    paddingTop: { type: "text" as const, label: "Padding top" },
    paddingRight: { type: "text" as const, label: "Padding right" },
    paddingBottom: { type: "text" as const, label: "Padding bottom" },
    paddingLeft: { type: "text" as const, label: "Padding left" },
    marginTop: { type: "text" as const, label: "Margin top" },
    marginRight: { type: "text" as const, label: "Margin right" },
    marginBottom: { type: "text" as const, label: "Margin bottom" },
    marginLeft: { type: "text" as const, label: "Margin left" },
    background: { type: "text" as const, label: "Background" },
    color: { type: "text" as const, label: "Text colour" },
    fontSize: { type: "text" as const, label: "Font size" },
    fontWeight: select([
      { label: "Inherit", value: "" },
      { label: "Light 300", value: "300" },
      { label: "Regular 400", value: "400" },
      { label: "Medium 500", value: "500" },
      { label: "Semi 600", value: "600" },
      { label: "Bold 700", value: "700" },
    ]),
    lineHeight: { type: "text" as const, label: "Line height" },
    letterSpacing: { type: "text" as const, label: "Letter spacing" },
    textAlign: select([
      { label: "Inherit", value: "" },
      { label: "Left", value: "left" },
      { label: "Center", value: "center" },
      { label: "Right", value: "right" },
    ]),
    borderWidth: { type: "text" as const, label: "Border width" },
    borderColor: { type: "text" as const, label: "Border colour" },
    borderStyle: select([
      { label: "Solid", value: "solid" },
      { label: "Dashed", value: "dashed" },
      { label: "None", value: "none" },
    ]),
    radius: { type: "text" as const, label: "Radius" },
    opacity: { type: "text" as const, label: "Opacity (0–1)" },
    overflow: select([
      { label: "Visible", value: "" },
      { label: "Hidden", value: "hidden" },
      { label: "Auto", value: "auto" },
    ]),
    position: select([
      { label: "Static", value: "static" },
      { label: "Relative", value: "relative" },
      { label: "Absolute", value: "absolute" },
      { label: "Sticky", value: "sticky" },
    ]),
    zIndex: { type: "text" as const, label: "Z-index" },
    shadow: select([
      { label: "None", value: "none" },
      { label: "Small", value: "sm" },
      { label: "Medium", value: "md" },
      { label: "Large", value: "lg" },
    ]),
  },
};

export function withStyleFields<T extends Record<string, unknown>>(
  fields: T,
): T & { styles: typeof styleObjectField } {
  return { ...fields, styles: styleObjectField };
}

export const defaultStyles = (): StyleBox => ({ ...defaultBoxStyle });

export type StyledFields = Fields<{ styles: StyleBox }>;

export { text };
