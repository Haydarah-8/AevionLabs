import { LOGO_SITES } from "@/data/logo-sites";

const BLOCKED_HOST_SUFFIXES = [
  "youtube.com",
  "google.com",
  "gmail.com",
  "microsoft.com",
  "apple.com",
  "openai.com",
  "github.com",
];

const ALLOWED_ORIGINS = new Set(
  Object.values(LOGO_SITES).map((href) => new URL(href).origin),
);

export function knownFrameBlock(raw: string) {
  try {
    const host = new URL(raw).hostname.replace(/^www\./, "").toLowerCase();
    return BLOCKED_HOST_SUFFIXES.some(
      (suffix) => host === suffix || host.endsWith(`.${suffix}`),
    );
  } catch {
    return false;
  }
}

export function allowedFrameUrl(raw: string) {
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:")
      return null;
    if (!ALLOWED_ORIGINS.has(parsed.origin)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function headersBlockFraming(headers: Headers) {
  const xfo = headers.get("x-frame-options")?.toLowerCase() ?? "";
  if (xfo.includes("deny") || xfo.includes("sameorigin")) return true;
  const csp = (headers.get("content-security-policy") ?? "").toLowerCase();
  const ancestors = csp.match(/frame-ancestors\s+([^;]+)/)?.[1]?.trim();
  if (!ancestors) return false;
  if (ancestors === "'none'" || ancestors === "none") return true;
  if (ancestors.includes("*")) return false;
  return true;
}
