import { describe, expect, it } from "vitest";
import { dueSources } from "@/lib/news/ingestion/registry";

const NOW = Date.parse("2026-08-28T12:00:00.000Z");
const minutesAgo = (n: number) => new Date(NOW - n * 60_000).toISOString();

const source = (
  id: string,
  over: Partial<{
    enabled: boolean;
    crawl_interval: number | null;
    last_crawled_at: string | null;
  }> = {},
) => ({
  id,
  enabled: over.enabled ?? true,
  crawl_interval: over.crawl_interval ?? 60,
  last_crawled_at:
    over.last_crawled_at === undefined ? minutesAgo(5) : over.last_crawled_at,
});

describe("dueSources", () => {
  it("skips disabled feeds", () => {
    const rows = [
      source("off", { enabled: false, last_crawled_at: null }),
      source("on", { last_crawled_at: null }),
    ];
    expect(dueSources(rows, 10, NOW).map((r) => r.id)).toEqual(["on"]);
  });

  it("treats a never-crawled feed as due", () => {
    const rows = [source("fresh"), source("never", { last_crawled_at: null })];
    expect(dueSources(rows, 10, NOW).map((r) => r.id)).toEqual(["never"]);
  });

  it("waits for the interval to elapse", () => {
    const rows = [
      source("waiting", { crawl_interval: 60, last_crawled_at: minutesAgo(30) }),
      source("due", { crawl_interval: 60, last_crawled_at: minutesAgo(90) }),
    ];
    expect(dueSources(rows, 10, NOW).map((r) => r.id)).toEqual(["due"]);
  });

  it("takes the stalest first so nothing starves", () => {
    const rows = [
      source("recent", { crawl_interval: 10, last_crawled_at: minutesAgo(20) }),
      source("ancient", { crawl_interval: 10, last_crawled_at: minutesAgo(600) }),
      source("middle", { crawl_interval: 10, last_crawled_at: minutesAgo(120) }),
    ];
    expect(dueSources(rows, 3, NOW).map((r) => r.id)).toEqual([
      "ancient",
      "middle",
      "recent",
    ]);
  });

  it("honours the per-run cap", () => {
    const rows = Array.from({ length: 40 }, (_, i) =>
      source(`s${i}`, { last_crawled_at: null }),
    );
    expect(dueSources(rows, 20, NOW)).toHaveLength(20);
  });

  it("always returns at least one when the cap is zero or negative", () => {
    // A misconfigured cap must not silently stop ingestion altogether.
    const rows = [source("a", { last_crawled_at: null })];
    expect(dueSources(rows, 0, NOW)).toHaveLength(1);
    expect(dueSources(rows, -5, NOW)).toHaveLength(1);
  });

  it("treats an unparseable timestamp as due rather than skipping forever", () => {
    const rows = [source("bad", { last_crawled_at: "not-a-date" })];
    expect(dueSources(rows, 10, NOW).map((r) => r.id)).toEqual(["bad"]);
  });

  it("defaults a missing interval to an hour", () => {
    const rows = [
      source("no-interval-recent", {
        crawl_interval: null,
        last_crawled_at: minutesAgo(30),
      }),
      source("no-interval-old", {
        crawl_interval: null,
        last_crawled_at: minutesAgo(70),
      }),
    ];
    expect(dueSources(rows, 10, NOW).map((r) => r.id)).toEqual([
      "no-interval-old",
    ]);
  });
});
