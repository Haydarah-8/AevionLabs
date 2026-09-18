import { describe, expect, it } from "vitest";
import { coCoverage, hourOfDayProfile } from "@/lib/news/signals";
import {
  clusterNewsroomItems,
  newsroomKey,
  type NewsroomItem,
} from "@/lib/news/newsroom";

const NOW = Date.parse("2026-08-28T12:00:00.000Z");
const hoursAgo = (n: number) => new Date(NOW - n * 3600_000).toISOString();

function item(
  partial: Partial<NewsroomItem> & { title: string; sourceUrl: string },
): NewsroomItem {
  return {
    key: newsroomKey(partial.sourceUrl),
    id: null,
    title: partial.title,
    snippet: partial.snippet ?? "",
    source: partial.source ?? "Example",
    sourceId: "example",
    sourceUrl: partial.sourceUrl,
    publishedAt: partial.publishedAt ?? hoursAgo(1),
    category: "World",
    media: "text",
    origin: "stored",
    imported: false,
    storyId: partial.storyId ?? null,
  };
}

describe("hourOfDayProfile", () => {
  it("returns 24 buckets and counts in UTC", () => {
    const items = [
      item({ title: "a", sourceUrl: "https://x.com/a", publishedAt: "2026-08-28T09:30:00.000Z" }),
      item({ title: "b", sourceUrl: "https://x.com/b", publishedAt: "2026-08-28T09:59:00.000Z" }),
      item({ title: "c", sourceUrl: "https://x.com/c", publishedAt: "2026-08-28T11:05:00.000Z" }),
    ];
    const hours = hourOfDayProfile(items, { now: NOW });
    expect(hours).toHaveLength(24);
    expect(hours[9]).toBe(2);
    expect(hours[11]).toBe(1);
    expect(hours.reduce((a, b) => a + b, 0)).toBe(3);
  });

  it("ignores anything outside the window", () => {
    const items = [
      item({ title: "old", sourceUrl: "https://x.com/o", publishedAt: hoursAgo(400) }),
    ];
    expect(
      hourOfDayProfile(items, { now: NOW, withinHours: 24 }).reduce(
        (a, b) => a + b,
        0,
      ),
    ).toBe(0);
  });

  it("ignores articles stamped in the future", () => {
    const items = [
      item({
        title: "future",
        sourceUrl: "https://x.com/f",
        publishedAt: new Date(NOW + 3600_000).toISOString(),
      }),
    ];
    expect(
      hourOfDayProfile(items, { now: NOW }).reduce((a, b) => a + b, 0),
    ).toBe(0);
  });

  it("returns all zeroes for an empty corpus rather than throwing", () => {
    const hours = hourOfDayProfile([], { now: NOW });
    expect(hours).toHaveLength(24);
    expect(hours.every((n) => n === 0)).toBe(true);
  });
});

describe("coCoverage", () => {
  // Deliberately unrelated headlines. Near-identical ones merge into a single
  // story, and the fixture would stop testing what it claims to.
  const HEADLINES: Record<string, string> = {
    s1: "NATO ministers agree new defence spending target in Brussels",
    s2: "Tariff rise on steel imports rattles manufacturers",
    s3: "Wildfire evacuation orders widen across the northern valleys",
  };
  const story = (id: string, sources: string[]) =>
    sources.map((source, i) =>
      item({
        title: HEADLINES[id],
        source,
        sourceUrl: `https://${source.replace(/\W/g, "")}.com/${id}-${i}`,
        storyId: id,
      }),
    );

  it("links outlets that repeatedly share stories", () => {
    const clusters = clusterNewsroomItems([
      ...story("s1", ["BBC News", "Reuters"]),
      ...story("s2", ["BBC News", "Reuters"]),
      ...story("s3", ["BBC News", "CNN"]),
    ]);
    const { nodes, links } = coCoverage(clusters);
    expect(links).toHaveLength(1);
    expect(links[0].value).toBe(2);
    expect([links[0].source, links[0].target].sort()).toEqual([
      "BBC News",
      "Reuters",
    ]);
    // CNN shared only once, so it is not drawn at all.
    expect(nodes.map((n) => n.id).sort()).toEqual(["BBC News", "Reuters"]);
  });

  it("returns nothing when no pair clears the default floor", () => {
    const clusters = clusterNewsroomItems(story("s1", ["BBC News", "Reuters"]));
    expect(coCoverage(clusters)).toEqual({ nodes: [], links: [] });
  });

  it("keeps single overlaps when the caller lowers the floor", () => {
    // The Press directory does this deliberately, and labels it as such.
    const clusters = clusterNewsroomItems(story("s1", ["BBC News", "Reuters"]));
    expect(coCoverage(clusters, { minShared: 1 }).links).toHaveLength(1);
  });

  it("counts a pair once per story regardless of ordering", () => {
    const clusters = clusterNewsroomItems([
      ...story("s1", ["Reuters", "BBC News"]),
      ...story("s2", ["BBC News", "Reuters"]),
    ]);
    expect(coCoverage(clusters).links).toHaveLength(1);
  });

  it("honours the link limit", () => {
    const clusters = clusterNewsroomItems([
      ...story("s1", ["A News", "B News", "C News"]),
      ...story("s2", ["A News", "B News", "C News"]),
    ]);
    // Three outlets make three pairs; the cap takes the strongest.
    expect(coCoverage(clusters, { limit: 2 }).links).toHaveLength(2);
  });
});
