import { describe, expect, it } from "vitest";
import {
  buildOutletProfiles,
  mostExclusive,
  mostLoaded,
  summariseByLean,
} from "@/lib/news/press";
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

describe("buildOutletProfiles", () => {
  it("counts articles, stories and exclusives", () => {
    const clusters = clusterNewsroomItems([
      item({
        title: "NATO ministers agree new defence spending target",
        source: "BBC News",
        sourceUrl: "https://bbc.co.uk/1",
        storyId: "s1",
      }),
      item({
        title: "NATO ministers agree new defence spending target",
        source: "Reuters",
        sourceUrl: "https://reuters.com/1",
        storyId: "s1",
      }),
      item({
        title: "Exclusive investigation into offshore banking networks",
        source: "BBC News",
        sourceUrl: "https://bbc.co.uk/2",
        storyId: "s2",
      }),
    ]);

    const byName = new Map(
      buildOutletProfiles(clusters).map((p) => [p.name, p]),
    );
    const bbc = byName.get("BBC News");
    expect(bbc?.articles).toBe(2);
    expect(bbc?.stories).toBe(2);
    expect(bbc?.exclusives).toBe(1);
    expect(bbc?.exclusivity).toBe(0.5);
    expect(byName.get("Reuters")?.exclusives).toBe(0);
  });

  it("counts an exclusive once per story, not once per article", () => {
    // Three updates on the same solo story is one exclusive.
    const clusters = clusterNewsroomItems([
      item({ title: "Solo scoop on the ministry contract", source: "Solo", sourceUrl: "https://s.com/1", storyId: "x" }),
      item({ title: "Solo scoop on the ministry contract", source: "Solo", sourceUrl: "https://s.com/2", storyId: "x" }),
      item({ title: "Solo scoop on the ministry contract", source: "Solo", sourceUrl: "https://s.com/3", storyId: "x" }),
    ]);
    const [profile] = buildOutletProfiles(clusters);
    expect(profile.articles).toBe(3);
    expect(profile.stories).toBe(1);
    expect(profile.exclusives).toBe(1);
  });

  it("measures framing tone per article", () => {
    const clusters = clusterNewsroomItems([
      item({
        title: "Rioters storm the capital as the regime slammed critics",
        source: "Loud Post",
        sourceUrl: "https://loud.com/1",
      }),
    ]);
    const [profile] = buildOutletProfiles(clusters);
    expect(profile.loadedRate).toBeGreaterThan(0);
    expect(profile.loadedShare).toBeGreaterThan(0.5);
  });

  it("reports null rather than zero when no framing words appear at all", () => {
    // Using no loaded words and using no vocabulary from these axes are
    // different facts, and averaging the second as 0 would be a claim.
    const clusters = clusterNewsroomItems([
      item({
        title: "Quarterly figures released by the statistics agency",
        source: "Dry Wire",
        sourceUrl: "https://dry.com/1",
      }),
    ]);
    const [profile] = buildOutletProfiles(clusters);
    expect(profile.loadedShare).toBeNull();
  });

  it("computes a median cadence, and null for a single article", () => {
    const clusters = clusterNewsroomItems([
      item({ title: "First unrelated headline about shipping", source: "Wire", sourceUrl: "https://w.com/1", publishedAt: hoursAgo(3) }),
      item({ title: "Second unrelated headline about farming", source: "Wire", sourceUrl: "https://w.com/2", publishedAt: hoursAgo(2) }),
      item({ title: "Third unrelated headline about railways", source: "Wire", sourceUrl: "https://w.com/3", publishedAt: hoursAgo(1) }),
    ]);
    expect(buildOutletProfiles(clusters)[0].cadenceMinutes).toBe(60);

    const one = clusterNewsroomItems([
      item({ title: "Only headline", source: "Once", sourceUrl: "https://o.com/1" }),
    ]);
    expect(buildOutletProfiles(one)[0].cadenceMinutes).toBeNull();
  });
});

describe("summariseByLean", () => {
  it("rolls outlets up by position and averages only the rated ones", () => {
    const clusters = clusterNewsroomItems([
      item({ title: "Rioters storm parliament in violent unrest", source: "Breitbart", sourceUrl: "https://breitbart.com/1" }),
      item({ title: "Quarterly shipping figures released today", source: "Fox News", sourceUrl: "https://foxnews.com/1" }),
    ]);
    const bands = summariseByLean(buildOutletProfiles(clusters));
    const total = bands.reduce((sum, b) => sum + b.articles, 0);
    expect(total).toBe(2);
    for (const band of bands) {
      expect(band.outlets).toBeGreaterThan(0);
    }
  });

  it("returns an empty list for an empty corpus", () => {
    expect(summariseByLean([])).toEqual([]);
  });
});

describe("mostExclusive / mostLoaded", () => {
  const profile = (over: Partial<Parameters<typeof mostExclusive>[0][number]>) =>
    ({
      key: "k",
      name: "N",
      lean: "centre" as const,
      stateControlled: false,
      articles: 20,
      stories: 20,
      exclusives: 0,
      exclusivity: 0,
      loadedRate: 0,
      neutralRate: 0,
      loadedShare: 0,
      cadenceMinutes: null,
      firstAt: hoursAgo(5),
      lastAt: hoursAgo(1),
      ...over,
    }) as Parameters<typeof mostExclusive>[0][number];

  it("excludes outlets below the story floor", () => {
    // 1 of 2 stories exclusive is 50%, and means nothing.
    const rows = [profile({ name: "Tiny", stories: 2, exclusivity: 0.5 })];
    expect(mostExclusive(rows, { minStories: 8 })).toEqual([]);
  });

  it("ranks by exclusivity once past the floor", () => {
    const rows = [
      profile({ name: "Low", stories: 20, exclusivity: 0.1 }),
      profile({ name: "High", stories: 20, exclusivity: 0.9 }),
    ];
    expect(mostExclusive(rows).map((r) => r.name)).toEqual(["High", "Low"]);
  });

  it("skips outlets with no framing vocabulary when ranking loadedness", () => {
    const rows = [
      profile({ name: "Unmeasured", loadedShare: null }),
      profile({ name: "Measured", loadedShare: 0.4 }),
    ];
    expect(mostLoaded(rows).map((r) => r.name)).toEqual(["Measured"]);
  });
});
