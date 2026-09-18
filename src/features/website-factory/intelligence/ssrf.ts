const BLOCKED_HOSTS = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata.google.internal",
  "metadata.google.com",
]);

const BLOCKED_SUFFIXES = [".local", ".internal", ".localhost", ".lan"];

function isPrivateIpv4(host: string) {
  const parts = host.split(".").map((part) => Number(part));
  if (
    parts.length !== 4 ||
    parts.some((part) => Number.isNaN(part) || part < 0 || part > 255)
  ) {
    return false;
  }
  const [a, b] = parts;
  if (a === 10 || a === 127 || a === 0 || a === 255) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return false;
}

function isBlockedHost(hostname: string) {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (BLOCKED_HOSTS.has(host)) return true;
  if (BLOCKED_SUFFIXES.some((suffix) => host.endsWith(suffix))) return true;
  if (host === "::1" || host === "0:0:0:0:0:0:0:1") return true;
  if (
    host.startsWith("fe80:") ||
    host.startsWith("fc") ||
    host.startsWith("fd")
  )
    return true;
  if (isPrivateIpv4(host)) return true;
  return false;
}

export function assertPublicHttpUrl(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error("Enter a website URL");
  let parsed: URL;
  try {
    parsed = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
  } catch {
    throw new Error("Enter a valid URL");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only http and https URLs can be analysed");
  }
  if (parsed.username || parsed.password) {
    throw new Error("URLs with credentials are not allowed");
  }
  if (parsed.port && !["", "80", "443"].includes(parsed.port)) {
    throw new Error("Non-standard ports are not allowed");
  }
  if (isBlockedHost(parsed.hostname)) {
    throw new Error("That host cannot be fetched from Aevion");
  }
  parsed.hash = "";
  return parsed;
}

export const SCRAPE_LIMITS = {
  maxPages: 6,
  maxDepth: 2,
  maxBytes: 1_200_000,
  timeoutMs: 10000,
  concurrency: 3,
  jobDeadlineMs: 45_000,
};
