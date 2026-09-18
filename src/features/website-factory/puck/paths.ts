import type { PuckData } from "../types";

export function prefixHref(href: string, basePath: string) {
  if (!href) return href;
  if (
    href.startsWith("http") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("#")
  ) {
    return href;
  }
  const cleaned = href.startsWith("/") ? href : `/${href}`;
  if (!basePath) return cleaned;
  if (cleaned === "/") return basePath;
  return `${basePath}${cleaned}`;
}

export function prefixPuckData(data: PuckData, basePath: string): PuckData {
  if (!basePath) return data;
  const walk = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(walk);
    if (value && typeof value === "object") {
      const next: Record<string, unknown> = {};
      for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
        if ((key === "href" || key.endsWith("Href") || key === "homeHref") && typeof item === "string") {
          next[key] = prefixHref(item, basePath);
        } else {
          next[key] = walk(item);
        }
      }
      return next;
    }
    return value;
  };
  return walk(data) as PuckData;
}
