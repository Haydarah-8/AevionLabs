import { describe, expect, it } from "vitest";
import {
  defaultVersionNote,
  displayVersionName,
  formatVersionTime,
  isLiveVersion,
  normalizeVersionNote,
  sortVersionsNewestFirst,
  summarizeSnapshot,
} from "./versions";
import type { WebsiteVersion } from "../types";

function ver(
  partial: Partial<WebsiteVersion> & Pick<WebsiteVersion, "id" | "versionNumber">,
): WebsiteVersion {
  return {
    projectId: "p1",
    authorId: null,
    snapshot: {},
    note: "",
    createdAt: "2026-01-01T12:00:00.000Z",
    ...partial,
  };
}

describe("history versions", () => {
  it("displays note or default Version N", () => {
    expect(displayVersionName(ver({ id: "a", versionNumber: 3 }))).toBe(
      "Version 3",
    );
    expect(
      displayVersionName(
        ver({ id: "a", versionNumber: 3, note: " Launch day " }),
      ),
    ).toBe("Launch day");
  });

  it("flags the live published version", () => {
    const v = ver({ id: "live", versionNumber: 2, note: "Live" });
    expect(isLiveVersion(v, { publishedVersionId: "live" })).toBe(true);
    expect(isLiveVersion(v, { publishedVersionId: "other" })).toBe(false);
  });

  it("summarizes snapshot pages", () => {
    const summary = summarizeSnapshot({
      theme: { primary: "#000" },
      siteConfig: {},
      pages: [{ slug: "home" }, { slug: "about" }],
    });
    expect(summary.pageCount).toBe(2);
    expect(summary.slugs).toEqual(["home", "about"]);
    expect(summary.hasTheme).toBe(true);
  });

  it("sorts newest first and normalizes notes", () => {
    const sorted = sortVersionsNewestFirst([
      ver({ id: "1", versionNumber: 1 }),
      ver({ id: "3", versionNumber: 3 }),
      ver({ id: "2", versionNumber: 2 }),
    ]);
    expect(sorted.map((v) => v.versionNumber)).toEqual([3, 2, 1]);
    expect(normalizeVersionNote("  Hello  ", 1)).toBe("Hello");
    expect(normalizeVersionNote("", 4)).toBe(defaultVersionNote(4));
  });

  it("formats timestamps", () => {
    expect(formatVersionTime("2026-01-01T12:00:00.000Z")).toContain("2026");
  });
});
