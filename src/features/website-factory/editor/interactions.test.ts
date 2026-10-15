import { describe, expect, it } from "vitest";
import {
  hasInteractions,
  interactionClassNames,
  patchInteractions,
  readInteractions,
  STUDIO_INTERACTIONS_PROP,
} from "./interactions";

describe("interactions", () => {
  it("reads and patches _interactions", () => {
    let props: Record<string, unknown> = {};
    props = patchInteractions(props, { hover: "lift", click: "press" });
    expect(props[STUDIO_INTERACTIONS_PROP]).toEqual({
      hover: "lift",
      click: "press",
    });
    expect(readInteractions(props).hover).toBe("lift");
    props = patchInteractions(props, { hover: "none" });
    expect(readInteractions(props).hover).toBeUndefined();
    expect(readInteractions(props).click).toBe("press");
  });

  it("clears prop when all presets are none", () => {
    let props = patchInteractions({}, { appear: "fade-up" });
    expect(hasInteractions(readInteractions(props))).toBe(true);
    props = patchInteractions(props, { appear: "none" });
    expect(props[STUDIO_INTERACTIONS_PROP]).toBeUndefined();
  });

  it("builds CSS class names from presets", () => {
    expect(
      interactionClassNames({
        hover: "scale",
        click: "bounce",
        appear: "fade-in",
      }),
    ).toBe("ae-ix-hover-scale ae-ix-click-bounce ae-ix-appear-fade-in");
  });
});
