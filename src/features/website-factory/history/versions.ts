/**
 * Publish history helpers (Phase 12).
 * Versions live on website_versions; `note` is the display name.
 */

import type { WebsiteProject, WebsiteVersion } from "../types";

export type VersionSnapshotSummary = {
  pageCount: number;
  slugs: string[];
  hasTheme: boolean;
  hasSiteConfig: boolean;
};

export function defaultVersionNote(versionNumber: number): string {
  return `Version ${versionNumber}`;
}

export function displayVersionName(version: WebsiteVersion): string {
  const note = (version.note || "").trim();
  if (note) return note;
  return defaultVersionNote(version.versionNumber);
}

export function isLiveVersion(
  version: WebsiteVersion,
  project: Pick<WebsiteProject, "publishedVersionId">,
): boolean {
  return Boolean(
    project.publishedVersionId &&
      project.publishedVersionId === version.id,
  );
}

export function formatVersionTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function summarizeSnapshot(
  snapshot: Record<string, unknown> | null | undefined,
): VersionSnapshotSummary {
  const pages = Array.isArray(snapshot?.pages) ? snapshot.pages : [];
  const slugs = pages
    .map((page) => {
      if (!page || typeof page !== "object") return "";
      const slug = (page as { slug?: unknown }).slug;
      return typeof slug === "string" ? slug : "";
    })
    .filter(Boolean);
  return {
    pageCount: pages.length,
    slugs,
    hasTheme: Boolean(snapshot?.theme),
    hasSiteConfig: Boolean(snapshot?.siteConfig),
  };
}

/** Newest first (version_number desc). */
export function sortVersionsNewestFirst(
  versions: WebsiteVersion[],
): WebsiteVersion[] {
  return [...versions].sort((a, b) => b.versionNumber - a.versionNumber);
}

export function normalizeVersionNote(
  note: string | null | undefined,
  versionNumber: number,
): string {
  const trimmed = (note || "").trim().slice(0, 120);
  return trimmed || defaultVersionNote(versionNumber);
}
