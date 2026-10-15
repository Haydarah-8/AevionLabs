import { describe, expect, it, beforeEach } from "vitest";
import {
  getLayerLabel,
  isLayerHidden,
  isLayerLocked,
  STUDIO_PROP,
} from "./studio-props";
import {
  clearStudioSelection,
  getStudioSelection,
  isStudioSelected,
  selectStudioOnly,
  setStudioSelection,
  toggleStudioSelection,
} from "./studio-selection";
import { withStudioConfig } from "./withStudioConfig";
import { factoryConfig } from "@/features/website-factory/puck/config";

describe("studio-props", () => {
  it("uses custom label when present", () => {
    expect(
      getLayerLabel("Hero", { [STUDIO_PROP.label]: "  Top banner  " }),
    ).toBe("Top banner");
    expect(getLayerLabel("Hero", {})).toBe("Hero");
  });

  it("reads lock and hide flags", () => {
    expect(isLayerLocked({ [STUDIO_PROP.locked]: true })).toBe(true);
    expect(isLayerLocked({})).toBe(false);
    expect(isLayerHidden({ [STUDIO_PROP.hidden]: true })).toBe(true);
    expect(isLayerHidden(null)).toBe(false);
  });
});

describe("studio-selection", () => {
  beforeEach(() => {
    clearStudioSelection();
  });

  it("selects a single id", () => {
    selectStudioOnly("a");
    expect(getStudioSelection()).toEqual(["a"]);
    expect(isStudioSelected("a")).toBe(true);
  });

  it("toggles multi-select", () => {
    selectStudioOnly("a");
    toggleStudioSelection("b");
    expect(getStudioSelection()).toEqual(["a", "b"]);
    toggleStudioSelection("a");
    expect(getStudioSelection()).toEqual(["b"]);
  });

  it("dedupes setStudioSelection", () => {
    setStudioSelection(["x", "x", "y", ""]);
    expect(getStudioSelection()).toEqual(["x", "y"]);
  });
});

describe("withStudioConfig", () => {
  it("wraps every factory component", () => {
    const studio = withStudioConfig(factoryConfig);
    const base = Object.keys(
      (factoryConfig.components || {}) as Record<string, unknown>,
    );
    const wrapped = Object.keys(
      (studio.components || {}) as Record<string, unknown>,
    );
    expect(wrapped.sort()).toEqual(base.sort());
    expect(base.length).toBeGreaterThan(0);
  });

  it("locks drag/delete/duplicate when _locked", async () => {
    const studio = withStudioConfig(factoryConfig);
    const firstType = Object.keys(
      (studio.components || {}) as Record<string, unknown>,
    )[0];
    const def = (
      studio.components as Record<
        string,
        {
          resolvePermissions?: (
            data: { props?: Record<string, unknown> },
            params: { permissions: Record<string, boolean | undefined> },
          ) => Promise<Record<string, boolean | undefined>>;
        }
      >
    )[firstType];

    const permissions = await def.resolvePermissions!(
      { props: { [STUDIO_PROP.locked]: true } },
      {
        permissions: {
          drag: true,
          delete: true,
          duplicate: true,
        },
      },
    );

    expect(permissions.drag).toBe(false);
    expect(permissions.delete).toBe(false);
    expect(permissions.duplicate).toBe(false);
    expect(permissions.edit).toBe(false);
  });
});
