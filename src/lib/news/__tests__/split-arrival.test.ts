import { describe, expect, it } from "vitest";
import { splitByArrival } from "@/lib/news/newsroom";

const row = (sourceUrl: string, clusterUrls?: string[]) => ({
  item: { sourceUrl },
  cluster: clusterUrls
    ? { items: clusterUrls.map((url) => ({ sourceUrl: url })) }
    : undefined,
});

describe("splitting the desk after a scrape", () => {
  it("leaves the list whole when nothing arrived", () => {
    const rows = [row("https://a.test/1"), row("https://b.test/2")];
    const { fresh, older } = splitByArrival(rows, new Set());
    expect(fresh).toHaveLength(0);
    expect(older).toEqual(rows);
  });

  it("separates the arrivals from the rest", () => {
    const rows = [row("https://a.test/1"), row("https://b.test/2")];
    const { fresh, older } = splitByArrival(
      rows,
      new Set(["https://a.test/1"]),
    );
    expect(fresh.map((r) => r.item.sourceUrl)).toEqual(["https://a.test/1"]);
    expect(older.map((r) => r.item.sourceUrl)).toEqual(["https://b.test/2"]);
  });

  it("counts a cluster as new when any member outlet is new", () => {
    // The lead is old, but a second outlet picked the story up this run.
    const rows = [
      row("https://lead.test/old", [
        "https://lead.test/old",
        "https://other.test/new",
      ]),
    ];
    const { fresh, older } = splitByArrival(
      rows,
      new Set(["https://other.test/new"]),
    );
    expect(fresh).toHaveLength(1);
    expect(older).toHaveLength(0);
  });

  it("keeps a cluster whose outlets were all already here", () => {
    const rows = [
      row("https://lead.test/old", [
        "https://lead.test/old",
        "https://other.test/old",
      ]),
    ];
    const { fresh, older } = splitByArrival(
      rows,
      new Set(["https://unrelated.test/new"]),
    );
    expect(fresh).toHaveLength(0);
    expect(older).toHaveLength(1);
  });

  it("preserves order within each side", () => {
    const rows = [
      row("https://a.test/1"),
      row("https://b.test/2"),
      row("https://c.test/3"),
      row("https://d.test/4"),
    ];
    const { fresh, older } = splitByArrival(
      rows,
      new Set(["https://c.test/3", "https://a.test/1"]),
    );
    expect(fresh.map((r) => r.item.sourceUrl)).toEqual([
      "https://a.test/1",
      "https://c.test/3",
    ]);
    expect(older.map((r) => r.item.sourceUrl)).toEqual([
      "https://b.test/2",
      "https://d.test/4",
    ]);
  });
});
