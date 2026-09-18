import { describe, expect, it } from "vitest";
import { SEED_SOURCES } from "@/lib/news/sources/registry";

describe("news source registry", () => {
  it("has no duplicate source ids", () => {
    const ids = SEED_SOURCES.map((row) => row.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every rss source an https feed url", () => {
    for (const row of SEED_SOURCES) {
      if (row.crawl_method !== "rss") continue;
      expect(row.rss_url, `${row.id} has no feed url`).toBeTruthy();
      expect(row.rss_url, `${row.id} feed is not https`).toMatch(/^https:\/\//);
    }
  });

  it("seeds only technology desks", () => {
    const allowed = new Set([
      "Technology",
      "AI",
      "Science",
      "Engineering",
    ]);
    for (const row of SEED_SOURCES) {
      expect(allowed.has(row.category), `${row.id} is ${row.category}`).toBe(
        true,
      );
    }
  });
});
