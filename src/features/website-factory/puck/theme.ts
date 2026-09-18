import type { CSSProperties } from "react";
import type { ThemeTokens } from "../types";
import { DEFAULT_THEME } from "../types";

export function themeStyle(theme?: Partial<ThemeTokens> | null): CSSProperties {
  const t = { ...DEFAULT_THEME, ...theme };
  return {
    ["--wf-primary" as string]: t.primary,
    ["--wf-secondary" as string]: t.secondary,
    ["--wf-accent" as string]: t.accent,
    ["--wf-bg" as string]: t.background,
    ["--wf-fg" as string]: t.foreground,
    ["--wf-heading" as string]: t.headingFont,
    ["--wf-body" as string]: t.bodyFont,
    ["--wf-radius" as string]: t.radius,
  };
}
