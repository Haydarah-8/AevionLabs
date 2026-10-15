import { describe, expect, it } from "vitest";
import {
  createDesignVariable,
  customCssVar,
  listVariableCatalog,
  mergeTheme,
  patchStyleWithThemeRefs,
  removeDesignVariable,
  resolveThemeReference,
  sanitizeVariableKey,
  themeToCssVars,
  upsertDesignVariable,
} from "./design-variables";
import { themeStyle } from "./theme";
import { DEFAULT_THEME } from "../types";

describe("design variables", () => {
  it("sanitizes keys and builds custom CSS var names", () => {
    expect(sanitizeVariableKey(" Space MD ")).toBe("space-md");
    expect(customCssVar("space-md")).toBe("--wf-var-space-md");
  });

  it("emits core and custom CSS vars on the theme bridge", () => {
    const theme = upsertDesignVariable(DEFAULT_THEME, {
      id: "1",
      name: "Tint",
      key: "tint",
      value: "#ff0000",
      type: "color",
    });
    const vars = themeToCssVars(theme);
    expect(vars["--wf-primary"]).toBe(DEFAULT_THEME.primary);
    expect(vars["--wf-var-tint"]).toBe("#ff0000");
    expect(themeStyle(theme)["--wf-var-tint" as never]).toBe("#ff0000");
  });

  it("resolves $primary and $var.* shorthand in style patches", () => {
    expect(resolveThemeReference("$primary")).toBe("var(--wf-primary)");
    expect(resolveThemeReference("theme.accent")).toBe("var(--wf-accent)");
    expect(resolveThemeReference("$var.space-md")).toBe(
      "var(--wf-var-space-md)",
    );
    expect(resolveThemeReference("#111")).toBe("#111");
    expect(patchStyleWithThemeRefs({ color: "$primary" }).color).toBe(
      "var(--wf-primary)",
    );
  });

  it("upserts and removes custom variables", () => {
    let theme = mergeTheme(DEFAULT_THEME);
    const created = createDesignVariable({
      name: "Pad",
      key: "pad",
      value: "24px",
      type: "size",
    });
    theme = upsertDesignVariable(theme, created);
    expect(listVariableCatalog(theme).some((i) => i.id === created.id)).toBe(
      true,
    );
    theme = removeDesignVariable(theme, created.id);
    expect(theme.variables?.length || 0).toBe(0);
  });
});
