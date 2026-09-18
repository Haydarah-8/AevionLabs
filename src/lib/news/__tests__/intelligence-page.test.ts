import { describe, expect, it } from "vitest";
import {
  outletVolume,
  sourceHealth,
  summarizeCategories,
  topStories,
  totals,
  volumeByDay,
} from "@/lib/news/intelligence";
import {
  clusterNewsroomItems,
  newsroomKey,
  type NewsroomItem,
} from "@/lib/news/newsroom";
import { clusterArticle } from "@/lib/news/stories/cluster";

const NOW = Date.parse("2026-08-27T12:00:00.000Z");

function item(
  partial: Partial<NewsroomItem> & { title: string; sourceUrl: string },
): NewsroomItem {
  return {
    key: newsroomKey(partial.sourceUrl),
    id: partial.id ?? null,
    title: partial.title,
    snippet: partial.snippet ?? "",
    source: partial.source ?? "Example",
    sourceId: partial.sourceId ?? "example",
    sourceUrl: partial.sourceUrl,
    publishedAt: partial.publishedAt ?? new Date(NOW).toISOString(),
    category: partial.category ?? "World",
    media: "text",
    origin: "stored",
    imported: false,
    storyId: partial.storyId ?? null,
    platform: partial.platform,
  };
}

describe("summarizeCategories", () => {
  it("ranks categories by volume with shares", () => {
    const rows = summarizeCategories([
      item({ title: "a", sourceUrl: "https://a.com/1", category: "World" }),
      item({ title: "b", sourceUrl: "https://b.com/1", category: "World" }),
      item({ title: "c", sourceUrl: "https://c.com/1", category: "Defence" }),
    ]);
    expect(rows[0]).toMatchObject({ name: "World", count: 2 });
    expect(rows[0].share).toBeCloseTo(2 / 3);
  });

  it("labels missing categories rather than dropping them", () => {
    const rows = summarizeCategories([
      item({ title: "a", sourceUrl: "https://a.com/2", category: "" }),
    ]);
    expect(rows[0].name).toBe("Uncategorised");
  });
});

describe("volumeByDay", () => {
  it("returns one bucket per day and bins by published date", () => {
    const buckets = volumeByDay(
      [
        item({ title: "today", sourceUrl: "https://a.com/3" }),
        item({
          title: "yesterday",
          sourceUrl: "https://b.com/3",
          publishedAt: new Date(NOW - 24 * 60 * 60 * 1000).toISOString(),
        }),
        item({
          title: "ancient",
          sourceUrl: "https://c.com/3",
          publishedAt: "2020-01-01T00:00:00.000Z",
        }),
      ],
      7,
      NOW,
    );
    expect(buckets).toHaveLength(7);
    expect(buckets.reduce((sum, b) => sum + b.count, 0)).toBe(2);
    expect(buckets[buckets.length - 1].count).toBe(1);
  });
});

describe("outletVolume", () => {
  it("counts one outlet once across its desks", () => {
    const rows = outletVolume([
      item({
        title: "a",
        sourceUrl: "https://www.bbc.co.uk/news/1",
        source: "BBC News",
      }),
      item({
        title: "b",
        sourceUrl: "https://www.bbc.co.uk/news/technology/2",
        source: "BBC Technology",
      }),
      item({ title: "c", sourceUrl: "https://reuters.com/1", source: "Reuters" }),
    ]);
    expect(rows).toHaveLength(2);
    expect(rows[0].count).toBe(2);
  });
});

describe("sourceHealth", () => {
  const base = { failure_count: 0 };

  it("flags failing, stale, healthy and disabled distinctly", () => {
    const rows = sourceHealth(
      [
        {
          ...base,
          id: "ok",
          name: "OK",
          enabled: true,
          last_success_at: new Date(NOW - 60 * 60 * 1000).toISOString(),
        },
        {
          ...base,
          id: "stale",
          name: "Stale",
          enabled: true,
          last_success_at: new Date(NOW - 30 * 60 * 60 * 1000).toISOString(),
        },
        {
          ...base,
          id: "dead",
          name: "Dead",
          enabled: true,
          last_success_at: new Date(NOW - 10 * 24 * 60 * 60 * 1000).toISOString(),
        },
        { ...base, id: "off", name: "Off", enabled: false, last_success_at: null },
        { ...base, id: "new", name: "New", enabled: true, last_success_at: null },
      ],
      [],
      NOW,
    );
    const byId = Object.fromEntries(rows.map((r) => [r.id, r.status]));
    expect(byId).toEqual({
      ok: "healthy",
      stale: "stale",
      dead: "failing",
      off: "disabled",
      new: "pending",
    });
  });

  it("does not call a never-crawled source failing once it starts erroring", () => {
    const [row] = sourceHealth(
      [
        {
          id: "broken",
          name: "Broken",
          enabled: true,
          last_success_at: null,
          failure_count: 4,
        },
      ],
      [],
      NOW,
    );
    expect(row.status).toBe("failing");
  });

  it("treats a repeatedly failing source as failing even if recent", () => {
    const [row] = sourceHealth(
      [
        {
          id: "flaky",
          name: "Flaky",
          enabled: true,
          last_success_at: new Date(NOW - 60 * 1000).toISOString(),
          failure_count: 5,
        },
      ],
      [],
      NOW,
    );
    expect(row.status).toBe("failing");
  });

  it("sorts problems to the top", () => {
    const rows = sourceHealth(
      [
        { ...base, id: "ok", name: "OK", enabled: true, last_success_at: new Date(NOW).toISOString() },
        { ...base, id: "dead", name: "Dead", enabled: true, last_success_at: null },
      ],
      [],
      NOW,
    );
    expect(rows[0].id).toBe("dead");
  });
});

describe("topStories", () => {
  it("ranks corroborated stories above single-outlet ones", () => {
    const clusters = clusterNewsroomItems([
      item({ title: "Lone report on a quiet topic", sourceUrl: "https://a.com/9" }),
      item({
        title: "NATO ministers agree new defence spending target",
        sourceUrl: "https://bbc.co.uk/9",
        source: "BBC News",
      }),
      item({
        title: "NATO ministers agree new defence spending target",
        sourceUrl: "https://reuters.com/9",
        source: "Reuters",
      }),
    ]);
    const stories = topStories(clusters, new Map(), 10, NOW);
    expect(stories[0].outletCount).toBe(2);
    expect(stories[0].outlets).toEqual(
      expect.arrayContaining(["BBC News", "Reuters"]),
    );
  });
});

describe("totals", () => {
  it("counts distinct outlets and corroborated stories", () => {
    const items = [
      item({ title: "Shared story headline here", sourceUrl: "https://bbc.co.uk/10", source: "BBC News" }),
      item({ title: "Shared story headline here", sourceUrl: "https://reuters.com/10", source: "Reuters" }),
      item({ title: "A different single story", sourceUrl: "https://cnn.com/10", source: "CNN" }),
    ];
    const clusters = clusterNewsroomItems(items);
    const t = totals(items, clusters, topStories(clusters, new Map(), 10, NOW), NOW);
    expect(t.articles).toBe(3);
    expect(t.outlets).toBe(3);
    expect(t.corroborated).toBe(1);
  });
});

describe("clusterArticle source_count", () => {
  const story = {
    id: "group-1",
    headline: "Existing",
    summary: "",
    category: "World",
    source_count: 4,
    importance_score: 0.5,
    breaking_score: 0.5,
    duplicate_group_id: "group-1",
  };

  it("does not inflate when the same outlet is re-ingested", () => {
    const result = clusterArticle({
      title: "Existing story",
      description: "",
      canonicalUrl: "https://bbc.co.uk/story",
      sourceUrl: "https://bbc.co.uk/story",
      externalId: "https://bbc.co.uk/story",
      provider: "rss",
      publishedAt: new Date(NOW).toISOString(),
      category: "World",
      trustScore: 0.8,
      existing: [
        {
          id: "a",
          title: "Existing story",
          canonical_url: "https://bbc.co.uk/story",
          source_url: "https://bbc.co.uk/story",
          external_id: "https://bbc.co.uk/story",
          provider: "rss",
          published_at: new Date(NOW).toISOString(),
          duplicate_group_id: "group-1",
        },
      ],
      stories: [story],
    });
    expect(result.created).toBe(false);
    expect(result.story.source_count).toBe(1);
  });

  it("counts a genuinely new outlet joining the story", () => {
    const result = clusterArticle({
      title: "Existing story",
      description: "",
      canonicalUrl: "https://reuters.com/story",
      sourceUrl: "https://reuters.com/story",
      externalId: "https://reuters.com/story",
      provider: "rss",
      publishedAt: new Date(NOW).toISOString(),
      category: "World",
      trustScore: 0.8,
      existing: [
        {
          id: "a",
          title: "Existing story",
          canonical_url: "https://bbc.co.uk/story",
          source_url: "https://bbc.co.uk/story",
          external_id: "https://bbc.co.uk/story",
          provider: "rss",
          published_at: new Date(NOW).toISOString(),
          duplicate_group_id: "group-1",
        },
      ],
      stories: [story],
    });
    expect(result.story.source_count).toBe(2);
  });
});
