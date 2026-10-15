import { describe, expect, it } from "vitest";
import {
  isFlexDisplay,
  isGridDisplay,
  LAYOUT_PRESETS,
  spacingInputValue,
  spacingPatchValue,
} from "./layout-presets";

describe("layout presets", () => {
  it("ships core layout presets that patch StyleBox keys", () => {
    const ids = LAYOUT_PRESETS.map((p) => p.id);
    expect(ids).toContain("full");
    expect(ids).toContain("flex-row");
    expect(ids).toContain("grid-3");
    const flex = LAYOUT_PRESETS.find((p) => p.id === "flex-row");
    expect(flex?.patch.display).toBe("flex");
    expect(flex?.patch.direction).toBe("row");
  });

  it("detects flex/grid display modes", () => {
    expect(isFlexDisplay("flex")).toBe(true);
    expect(isFlexDisplay("inline-flex")).toBe(true);
    expect(isFlexDisplay("block")).toBe(false);
    expect(isGridDisplay("grid")).toBe(true);
    expect(isGridDisplay("flex")).toBe(false);
  });

  it("normalizes spacing input values", () => {
    expect(spacingInputValue("24px")).toBe("24");
    expect(spacingInputValue("24")).toBe("24");
    expect(spacingInputValue("auto")).toBe("auto");
    expect(spacingInputValue("")).toBe("");
    expect(spacingPatchValue(" 16 ")).toBe("16");
  });
});
