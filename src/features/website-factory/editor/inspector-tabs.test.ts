import { describe, expect, it } from "vitest";
import {
  styleKeysForTab,
  LAYOUT_STYLE_KEYS,
  TYPOGRAPHY_STYLE_KEYS,
  APPEARANCE_STYLE_KEYS,
} from "./inspector-tabs";

describe("inspector tab helpers", () => {
  it("maps layout/typography/appearance to distinct style keys", () => {
    expect(styleKeysForTab("layout")).toEqual(LAYOUT_STYLE_KEYS);
    expect(styleKeysForTab("typography")).toEqual(TYPOGRAPHY_STYLE_KEYS);
    expect(styleKeysForTab("appearance")).toEqual(APPEARANCE_STYLE_KEYS);
  });

  it("returns null for content (prop fields) and theme/seo shells", () => {
    expect(styleKeysForTab("content")).toBeNull();
    expect(styleKeysForTab("theme")).toBeNull();
    expect(styleKeysForTab("seo")).toBeNull();
  });

  it("does not reuse the same key set across primary tabs", () => {
    const layout = styleKeysForTab("layout")!;
    const type = styleKeysForTab("typography")!;
    expect(layout.some((k) => type.includes(k as never))).toBe(false);
  });
});
