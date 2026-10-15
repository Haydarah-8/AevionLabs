import type { CSSProperties } from "react";
import {
  boxStyleToCss,
  type StyleBox,
  type StyleTokens,
} from "./styles";

/** Studio breakpoints. Desktop = base `styles`; tablet/mobile = overrides. */
export type StudioBreakpoint = "desktop" | "tablet" | "mobile";

export const STUDIO_BREAKPOINTS: readonly StudioBreakpoint[] = [
  "desktop",
  "tablet",
  "mobile",
] as const;

/** max-width media queries (iframe canvas width matches these). */
export const BREAKPOINT_MAX_WIDTH: Record<"tablet" | "mobile", number> = {
  tablet: 768,
  mobile: 390,
};

export function breakpointFromWidth(width: number): StudioBreakpoint {
  if (width <= BREAKPOINT_MAX_WIDTH.mobile) return "mobile";
  if (width <= BREAKPOINT_MAX_WIDTH.tablet) return "tablet";
  return "desktop";
}

export function stripResponsive(styles?: StyleBox | null): StyleTokens {
  if (!styles) return {};
  const { responsive: _r, ...tokens } = styles;
  return tokens;
}

function asTokens(value?: StyleTokens | null): StyleTokens {
  if (!value) return {};
  const { responsive: _r, ...tokens } = value as StyleBox;
  return tokens;
}

/** Merge base → tablet → mobile for the active breakpoint. */
export function resolveStyleBox(
  styles: StyleBox | null | undefined,
  breakpoint: StudioBreakpoint,
): StyleTokens {
  const base = stripResponsive(styles);
  if (breakpoint === "desktop") return base;
  const tablet = asTokens(styles?.responsive?.tablet);
  if (breakpoint === "tablet") return { ...base, ...tablet };
  const mobile = asTokens(styles?.responsive?.mobile);
  return { ...base, ...tablet, ...mobile };
}

/** Keys explicitly set on the override layer (not inherited). */
export function overrideKeysAt(
  styles: StyleBox | null | undefined,
  breakpoint: StudioBreakpoint,
): string[] {
  if (breakpoint === "desktop") return [];
  const layer = asTokens(styles?.responsive?.[breakpoint]);
  return Object.keys(layer).filter((key) => {
    const value = layer[key as keyof StyleTokens];
    return value != null && String(value).length > 0;
  });
}

export function isOverriddenAt(
  styles: StyleBox | null | undefined,
  breakpoint: StudioBreakpoint,
  key: string,
): boolean {
  return overrideKeysAt(styles, breakpoint).includes(key);
}

/**
 * Patch styles for a breakpoint.
 * Empty string on tablet/mobile removes the override (inherit).
 * Empty string on desktop clears the base token.
 */
export function patchStylesAtBreakpoint(
  styles: StyleBox | null | undefined,
  breakpoint: StudioBreakpoint,
  patch: Record<string, string>,
): StyleBox {
  const base = stripResponsive(styles);
  const responsive = { ...(styles?.responsive || {}) };

  if (breakpoint === "desktop") {
    const nextBase: StyleTokens = { ...base };
    for (const [key, value] of Object.entries(patch)) {
      (nextBase as Record<string, string>)[key] = value;
    }
    return cleanStyleBox({ ...nextBase, responsive });
  }

  const layer: StyleTokens = { ...asTokens(responsive[breakpoint]) };
  for (const [key, value] of Object.entries(patch)) {
    if (!value?.trim()) {
      delete (layer as Record<string, string | undefined>)[key];
    } else {
      (layer as Record<string, string>)[key] = value;
    }
  }

  if (Object.keys(layer).length === 0) {
    delete responsive[breakpoint];
  } else {
    responsive[breakpoint] = layer;
  }

  return cleanStyleBox({ ...base, responsive });
}

/** Remove one override key (inherit from larger breakpoint / base). */
export function inheritStyleKey(
  styles: StyleBox | null | undefined,
  breakpoint: StudioBreakpoint,
  key: string,
): StyleBox {
  if (breakpoint === "desktop") {
    const base = stripResponsive(styles);
    const next = { ...base };
    delete (next as Record<string, string | undefined>)[key];
    return cleanStyleBox({
      ...next,
      responsive: styles?.responsive,
    });
  }
  return patchStylesAtBreakpoint(styles, breakpoint, { [key]: "" });
}

/** Clear all overrides for tablet or mobile. Desktop no-op for overrides. */
export function resetBreakpointOverrides(
  styles: StyleBox | null | undefined,
  breakpoint: StudioBreakpoint,
): StyleBox {
  if (breakpoint === "desktop") {
    return cleanStyleBox({
      ...stripResponsive(styles),
      responsive: styles?.responsive,
    });
  }
  const responsive = { ...(styles?.responsive || {}) };
  delete responsive[breakpoint];
  return cleanStyleBox({
    ...stripResponsive(styles),
    responsive,
  });
}

function cleanStyleBox(styles: StyleBox): StyleBox {
  const responsive = styles.responsive;
  if (!responsive) return { ...stripResponsive(styles) };
  const tablet = asTokens(responsive.tablet);
  const mobile = asTokens(responsive.mobile);
  const next: StyleBox["responsive"] = {};
  if (Object.keys(tablet).length) next.tablet = tablet;
  if (Object.keys(mobile).length) next.mobile = mobile;
  const base = stripResponsive(styles);
  if (!Object.keys(next).length) return { ...base };
  return { ...base, responsive: next };
}

export function hasResponsiveOverrides(
  styles: StyleBox | null | undefined,
): boolean {
  return Boolean(
    styles?.responsive?.tablet &&
      Object.keys(asTokens(styles.responsive.tablet)).length,
  ) ||
    Boolean(
      styles?.responsive?.mobile &&
        Object.keys(asTokens(styles.responsive.mobile)).length,
    );
}

function camelToKebab(input: string) {
  return input.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

/** Serialize React CSSProperties for a stylesheet rule body. */
export function cssPropertiesToText(style: CSSProperties): string {
  return Object.entries(style)
    .filter(([, value]) => value != null && value !== "")
    .map(([key, value]) => `${camelToKebab(key)}:${String(value)}`)
    .join(";");
}

function escapeAttr(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/**
 * Build scoped CSS: base + tablet/mobile media queries with fully resolved tokens.
 */
export function responsiveStyleSheet(
  scopeId: string,
  styles: StyleBox | null | undefined,
): string {
  const selector = `[data-ae-r="${escapeAttr(scopeId)}"]`;
  const desktop = cssPropertiesToText(
    boxStyleToCss(resolveStyleBox(styles, "desktop")),
  );
  const tablet = cssPropertiesToText(
    boxStyleToCss(resolveStyleBox(styles, "tablet")),
  );
  const mobile = cssPropertiesToText(
    boxStyleToCss(resolveStyleBox(styles, "mobile")),
  );

  const parts: string[] = [];
  if (desktop) parts.push(`${selector}{${desktop}}`);
  if (hasResponsiveOverrides(styles)) {
    if (tablet) {
      parts.push(
        `@media (max-width:${BREAKPOINT_MAX_WIDTH.tablet}px){${selector}{${tablet}}}`,
      );
    }
    if (mobile) {
      parts.push(
        `@media (max-width:${BREAKPOINT_MAX_WIDTH.mobile}px){${selector}{${mobile}}}`,
      );
    }
  }
  return parts.join("");
}
