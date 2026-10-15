import { describe, expect, it } from "vitest";
import {
  breakpointFromWidth,
  inheritStyleKey,
  overrideKeysAt,
  patchStylesAtBreakpoint,
  resetBreakpointOverrides,
  resolveStyleBox,
  responsiveStyleSheet,
  hasResponsiveOverrides,
} from "@/features/website-factory/puck/responsive";
import type { StyleBox } from "@/features/website-factory/puck/styles";
import { RESPONSIVE_STYLE_KEYS } from "@/features/website-factory/editor/inspector-tabs";

describe("responsive breakpoints", () => {
  it("maps canvas widths to breakpoints", () => {
    expect(breakpointFromWidth(1280)).toBe("desktop");
    expect(breakpointFromWidth(768)).toBe("tablet");
    expect(breakpointFromWidth(390)).toBe("mobile");
    expect(breakpointFromWidth(400)).toBe("tablet");
  });

  it("resolves tablet and mobile overrides over base", () => {
    const styles: StyleBox = {
      fontSize: "18px",
      paddingTop: "40px",
      responsive: {
        tablet: { fontSize: "16px" },
        mobile: { fontSize: "14px", paddingTop: "24px" },
      },
    };
    expect(resolveStyleBox(styles, "desktop").fontSize).toBe("18px");
    expect(resolveStyleBox(styles, "tablet").fontSize).toBe("16px");
    expect(resolveStyleBox(styles, "tablet").paddingTop).toBe("40px");
    expect(resolveStyleBox(styles, "mobile").fontSize).toBe("14px");
    expect(resolveStyleBox(styles, "mobile").paddingTop).toBe("24px");
  });

  it("patches tablet override and inherits on empty", () => {
    let styles: StyleBox = { width: "100%", fontSize: "18px" };
    styles = patchStylesAtBreakpoint(styles, "tablet", { fontSize: "15px" });
    expect(styles.responsive?.tablet?.fontSize).toBe("15px");
    expect(styles.fontSize).toBe("18px");
    expect(overrideKeysAt(styles, "tablet")).toEqual(["fontSize"]);

    styles = patchStylesAtBreakpoint(styles, "tablet", { fontSize: "" });
    expect(styles.responsive?.tablet).toBeUndefined();
    expect(hasResponsiveOverrides(styles)).toBe(false);
  });

  it("inheritStyleKey and resetBreakpointOverrides", () => {
    let styles: StyleBox = {
      width: "100%",
      responsive: {
        mobile: { width: "100%", paddingTop: "12px" },
      },
    };
    styles = inheritStyleKey(styles, "mobile", "width");
    expect(overrideKeysAt(styles, "mobile")).toEqual(["paddingTop"]);
    styles = resetBreakpointOverrides(styles, "mobile");
    expect(hasResponsiveOverrides(styles)).toBe(false);
  });

  it("emits media queries in stylesheet", () => {
    const styles: StyleBox = {
      fontSize: "20px",
      responsive: { mobile: { fontSize: "14px" } },
    };
    const css = responsiveStyleSheet("comp-1", styles);
    expect(css).toContain('[data-ae-r="comp-1"]');
    expect(css).toContain("@media (max-width:390px)");
    expect(css).toContain("font-size:14px");
  });

  it("exposes focused responsive style keys", () => {
    expect(RESPONSIVE_STYLE_KEYS).toContain("fontSize");
    expect(RESPONSIVE_STYLE_KEYS).toContain("paddingTop");
  });
});
