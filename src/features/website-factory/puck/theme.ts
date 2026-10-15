import type { CSSProperties } from "react";
import type { ThemeTokens } from "../types";
import { themeStyle as themeToStyle } from "./design-variables";

/** Apply project theme (+ custom design variables) as CSS custom properties. */
export function themeStyle(theme?: Partial<ThemeTokens> | null): CSSProperties {
  return themeToStyle(theme);
}

export {
  CORE_CSS_VAR,
  CORE_THEME_FIELDS,
  coreVarReference,
  createDesignVariable,
  customCssVar,
  customVarReference,
  listCustomVariables,
  listVariableCatalog,
  mergeTheme,
  patchStyleWithThemeRefs,
  removeDesignVariable,
  resolveThemeReference,
  sanitizeVariableKey,
  themeToCssVars,
  upsertDesignVariable,
} from "./design-variables";
