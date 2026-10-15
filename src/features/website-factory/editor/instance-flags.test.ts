import { describe, expect, it } from "vitest";
import {
  listSlotContainers,
  listSlotFieldsForType,
  setLockedOnSlotTree,
} from "./slots";
import {
  applyVariantToProps,
  hasApplyableVariants,
  listVariantsForType,
} from "./variants";
import { isLayerLocked, patchInstanceFlags, STUDIO_PROP } from "./studio-props";

describe("slots", () => {
  it("discovers slot fields on layout containers", () => {
    const section = listSlotFieldsForType("Section");
    expect(section.some((s) => s.slotKey === "content")).toBe(true);
    const two = listSlotFieldsForType("TwoColumn");
    expect(two.map((s) => s.slotKey).sort()).toEqual(["left", "right"]);
    expect(listSlotContainers().length).toBeGreaterThan(3);
  });

  it("cascades lock onto nested slot children", () => {
    const props = {
      content: [
        { type: "Heading", props: { text: "Hi", id: "a" } },
        {
          type: "Box",
          props: {
            id: "b",
            content: [{ type: "TextBlock", props: { id: "c", text: "x" } }],
          },
        },
      ],
    };
    const locked = setLockedOnSlotTree(props, "Section", true);
    const content = locked.content as Array<{
      props: Record<string, unknown>;
    }>;
    expect(content[0]!.props._locked).toBe(true);
    const nested = content[1]!.props.content as Array<{
      props: Record<string, unknown>;
    }>;
    expect(nested[0]!.props._locked).toBe(true);
  });
});

describe("variants", () => {
  it("lists applyable flex/grid/heading variants", () => {
    expect(hasApplyableVariants("Flex")).toBe(true);
    expect(listVariantsForType("Heading").some((v) => v.id === "h1")).toBe(
      true,
    );
  });

  it("applies variant props and sets _variant", () => {
    const next = applyVariantToProps("ButtonBlock", "ghost", {
      label: "Go",
      ghost: "no",
    });
    expect(next[STUDIO_PROP.variant]).toBe("ghost");
    expect(next.ghost).toBe("yes");
  });
});

describe("instance flags", () => {
  it("patches lock/hide/label cleanly", () => {
    const next = patchInstanceFlags(
      { text: "Hi" },
      { _locked: true, _label: "Hero", _hidden: true },
    );
    expect(isLayerLocked(next)).toBe(true);
    expect(next[STUDIO_PROP.label]).toBe("Hero");
    expect(next[STUDIO_PROP.hidden]).toBe(true);
    const cleared = patchInstanceFlags(next, {
      _locked: false,
      _hidden: false,
    });
    expect(cleared[STUDIO_PROP.locked]).toBeUndefined();
  });
});
