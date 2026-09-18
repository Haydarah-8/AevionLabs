import { describe, expect, it } from "vitest";
import {
  buildDomains,
  classifyTopics,
  DOMAINS,
  scoreDomains,
  volumeSeries,
} from "@/lib/news/taxonomy";
import {
  clusterNewsroomItems,
  newsroomKey,
  type NewsroomItem,
} from "@/lib/news/newsroom";
import { buildTopics } from "@/lib/news/topics";

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
    publishedAt: partial.publishedAt ?? "2026-08-28T10:00:00.000Z",
    category: partial.category ?? "World",
    media: "text",
    origin: "stored",
    imported: false,
    storyId: partial.storyId ?? null,
  };
}

describe("domain definitions", () => {
  it("has no term claimed by two domains", () => {
    // An overlapping term makes classification depend on iteration order,
    // which would silently move topics between domains as the list is edited.
    const seen = new Map<string, string>();
    const clashes: string[] = [];
    for (const domain of DOMAINS) {
      for (const term of domain.terms) {
        const owner = seen.get(term);
        if (owner && owner !== domain.id) {
          clashes.push(`"${term}" in ${owner} and ${domain.id}`);
        }
        seen.set(term, domain.id);
      }
    }
    expect(clashes).toEqual([]);
  });

  it("has no duplicate terms inside one domain", () => {
    for (const domain of DOMAINS) {
      expect(new Set(domain.terms).size).toBe(domain.terms.length);
    }
  });
});

describe("scoreDomains", () => {
  it("puts a military headline in conflict", () => {
    const scores = scoreDomains(
      "Missile strike hits airbase as troops mass near the frontline",
    );
    const top = [...scores.entries()].sort((a, b) => b[1] - a[1])[0];
    expect(top[0]).toBe("conflict");
  });

  it("weights a phrase above a lone word", () => {
    const phrase = scoreDomains("The security council met today");
    const single = scoreDomains("The summit met today");
    expect(phrase.get("diplomacy")).toBeGreaterThan(
      single.get("diplomacy") ?? 0,
    );
  });

  it("does not fire on a word inside a longer one", () => {
    // "war" must not match "warehouse", "aid" must not match "maiden".
    expect(scoreDomains("The warehouse maiden voyage").size).toBe(0);
  });

  it("returns nothing for text about none of the domains", () => {
    expect(scoreDomains("A recipe for lemon cake and custard").size).toBe(0);
  });
});

describe("classifyTopics", () => {
  const conflictItems = [
    item({
      title: "Missile strike on airbase kills troops",
      source: "Reuters",
      sourceUrl: "https://reuters.com/1",
      storyId: "c1",
    }),
    item({
      title: "Missile barrage continues near the frontline",
      source: "BBC News",
      sourceUrl: "https://bbc.co.uk/1",
      storyId: "c2",
    }),
  ];

  const topicOf = (items: NewsroomItem[], id: string) => {
    const found = buildTopics(clusterNewsroomItems(items), {
      minStories: 2,
    }).find((entry) => entry.id === id);
    if (!found) throw new Error(`expected a "${id}" topic`);
    return found;
  };

  it("assigns a domain and a confidence", () => {
    const [classified] = classifyTopics([topicOf(conflictItems, "missile")], 40);
    expect(classified.domain).toBe("conflict");
    expect(classified.domainScore).toBeGreaterThan(0);
    expect(classified.domainScore).toBeLessThanOrEqual(1);
  });

  it("leaves a topic matching no domain unclassified", () => {
    const items = [
      item({
        title: "Lemon custard recipe wins baking prize",
        source: "Reuters",
        sourceUrl: "https://reuters.com/cake1",
        storyId: "k1",
      }),
      item({
        title: "Lemon shortage bites bakeries",
        source: "BBC News",
        sourceUrl: "https://bbc.co.uk/cake2",
        storyId: "k2",
      }),
    ];
    const [classified] = classifyTopics([topicOf(items, "lemon")], 40);
    expect(classified.domain).toBeNull();
    expect(classified.domainScore).toBe(0);
  });

  it("grades reach against the outlet universe, not the raw count", () => {
    const topic = topicOf(conflictItems, "missile");
    // Two outlets out of four is broad; out of a hundred it is not.
    expect(classifyTopics([topic], 4)[0].reach).toBe("mainstream");
    expect(classifyTopics([topic], 100)[0].reach).toBe("niche");
  });

  it("reports outlet share as a fraction of the universe", () => {
    const [classified] = classifyTopics([topicOf(conflictItems, "missile")], 8);
    expect(classified.outletShare).toBeCloseTo(0.25, 5);
  });
});

describe("buildDomains", () => {
  it("rolls topics up and shares sum to one", () => {
    const items = [
      item({ title: "Missile strike hits the airbase", source: "Reuters", sourceUrl: "https://reuters.com/a", storyId: "a1" }),
      item({ title: "Missile defences intercept the barrage", source: "BBC News", sourceUrl: "https://bbc.co.uk/a", storyId: "a2" }),
      item({ title: "Tariff rise hits importers hard", source: "Fox News", sourceUrl: "https://foxnews.com/b", storyId: "b1" }),
      item({ title: "Tariff talks stall over steel quotas", source: "Vox", sourceUrl: "https://vox.com/b", storyId: "b2" }),
    ];
    const topics = classifyTopics(
      buildTopics(clusterNewsroomItems(items), { minStories: 2 }),
      10,
    );
    const domains = buildDomains(topics);

    expect(domains.map((d) => d.id).sort()).toEqual(["conflict", "economy"]);
    const total = domains.reduce((sum, d) => sum + d.share, 0);
    expect(total).toBeCloseTo(1, 5);
    expect(domains[0].articleCount).toBeGreaterThan(0);
    expect(domains[0].outletCount).toBeGreaterThan(0);
  });

  it("drops unclassified topics rather than inventing a domain", () => {
    const topics = classifyTopics([], 10);
    expect(buildDomains(topics)).toEqual([]);
  });
});

describe("volumeSeries", () => {
  const now = Date.parse("2026-08-28T12:00:00.000Z");

  it("returns every bucket, including empty ones", () => {
    const series = volumeSeries([], { buckets: 12, hours: 24, now });
    expect(series).toHaveLength(12);
    expect(series.every((point) => point.count === 0)).toBe(true);
  });

  it("counts an article into the bucket for its timestamp", () => {
    const clusters = clusterNewsroomItems([
      item({
        title: "Missile strike reported overnight",
        sourceUrl: "https://a.com/1",
        // Two hours before "now", in a 24h window of 12 buckets (2h each),
        // so it lands in the final bucket.
        publishedAt: "2026-08-28T10:30:00.000Z",
      }),
    ]);
    const series = volumeSeries(clusters, { buckets: 12, hours: 24, now });
    expect(series[11].count).toBe(1);
    expect(series.reduce((sum, point) => sum + point.count, 0)).toBe(1);
  });

  it("ignores articles outside the window", () => {
    const clusters = clusterNewsroomItems([
      item({
        title: "Old missile story from last week",
        sourceUrl: "https://a.com/2",
        publishedAt: "2026-08-01T10:00:00.000Z",
      }),
    ]);
    const series = volumeSeries(clusters, { buckets: 12, hours: 24, now });
    expect(series.reduce((sum, point) => sum + point.count, 0)).toBe(0);
  });
});
