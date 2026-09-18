import { describe, expect, it } from "vitest";
import { leanBalance, leanForOutlet, spreadWidth } from "@/lib/news/lean";
import {
  clusterNewsroomItems,
  newsroomKey,
  type NewsroomItem,
} from "@/lib/news/newsroom";
import { buildTopics, topicArticles, topicTerms } from "@/lib/news/topics";

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
    category: "World",
    media: partial.media ?? "text",
    origin: "stored",
    imported: false,
    storyId: partial.storyId ?? null,
    platform: partial.platform,
  };
}

describe("topicTerms", () => {
  it("keeps distinctive words and drops filler", () => {
    const terms = topicTerms("The new report says Ukraine will get more aid");
    expect(terms).toContain("ukraine");
    expect(terms).toContain("aid");
    expect(terms).not.toContain("the");
    expect(terms).not.toContain("says");
    expect(terms).not.toContain("new");
  });

  it("ignores short words and bare numbers", () => {
    expect(topicTerms("US 2026 tax bill")).toEqual(["tax", "bill"]);
  });

  it("strips html entities instead of turning them into topics", () => {
    const terms = topicTerms("Israel&rsquo;s cabinet meets &amp; votes");
    expect(terms).not.toContain("rsquo");
    expect(terms).not.toContain("amp");
    expect(terms).toContain("israel");
  });
});

describe("leanForOutlet", () => {
  it("rates outlets by masthead, not display name", () => {
    expect(
      leanForOutlet({ source: "Fox", sourceUrl: "https://foxnews.com/a" }).lean,
    ).toBe("right");
    expect(
      leanForOutlet({ source: "Jacobin", sourceUrl: "https://jacobin.com/a" })
        .lean,
    ).toBe("far-left");
  });

  it("flags state-controlled outlets off the left-right scale", () => {
    const tass = leanForOutlet({ source: "TASS", sourceUrl: "https://tass.com/a" });
    expect(tass.stateControlled).toBe(true);
    expect(tass.lean).toBe("unrated");
  });

  it("returns unrated rather than guessing for unknown outlets", () => {
    expect(
      leanForOutlet({ source: "Who", sourceUrl: "https://example.com/a" }).lean,
    ).toBe("unrated");
  });

  /**
   * Domains whose masthead cannot be derived by any single rule: abcnews.go.com
   * reduces to "go" and news.sky.com to "sky". Ratings key on the domain.
   */
  it("rates outlets on awkward multi-label domains", () => {
    expect(
      leanForOutlet({
        source: "ABC News",
        sourceUrl: "https://abcnews.go.com/International/story",
      }).lean,
    ).toBe("centre-left");
    expect(
      leanForOutlet({
        source: "Sky News",
        sourceUrl: "https://news.sky.com/story/1",
      }).lean,
    ).toBe("centre-left");
  });

  it("matches subdomains of a rated domain", () => {
    expect(
      leanForOutlet({ source: "BBC", sourceUrl: "https://www.bbc.co.uk/news/x" })
        .lean,
    ).toBe("centre");
  });

  /**
   * A large share of the corpus is YouTube posts, where the host identifies
   * the platform rather than the publisher. Those must rate by masthead.
   */
  it("rates a social post by its publisher, not the platform", () => {
    expect(
      leanForOutlet({
        source: "Sky News",
        sourceUrl: "https://www.youtube.com/watch?v=abc",
        platform: "youtube",
      }).lean,
    ).toBe("centre-left");
    expect(
      leanForOutlet({
        source: "Reuters",
        sourceUrl: "https://www.youtube.com/watch?v=def",
        platform: "youtube",
      }).lean,
    ).toBe("centre");
  });

  it("still refuses to guess for an unknown publisher on a platform", () => {
    expect(
      leanForOutlet({
        source: "Some Random Channel",
        sourceUrl: "https://www.youtube.com/watch?v=ghi",
        platform: "youtube",
      }).lean,
    ).toBe("unrated");
  });
});

describe("lean maths", () => {
  it("counts how many points on the scale covered a topic", () => {
    expect(spreadWidth({ left: 2, centre: 1, right: 3 })).toBe(3);
    expect(spreadWidth({ centre: 5 })).toBe(1);
    expect(spreadWidth({})).toBe(0);
  });

  it("puts balance at zero when coverage is symmetric", () => {
    expect(leanBalance({ left: 2, right: 2 })).toBe(0);
  });

  it("goes negative for left-dominated and positive for right", () => {
    expect(leanBalance({ "far-left": 4 })).toBe(-3);
    expect(leanBalance({ "far-right": 4 })).toBe(3);
  });

  it("returns null when nothing is rated", () => {
    expect(leanBalance({ unrated: 9 })).toBeNull();
  });
});

describe("buildTopics", () => {
  const clusters = clusterNewsroomItems([
    item({
      title: "Ukraine strikes Russian refinery in overnight raid",
      source: "Reuters",
      sourceUrl: "https://reuters.com/1",
    }),
    item({
      title: "Ukraine drone attack hits fuel depot",
      source: "Fox News",
      sourceUrl: "https://foxnews.com/1",
    }),
    item({
      title: "Ukraine aid package clears committee",
      source: "Jacobin",
      sourceUrl: "https://jacobin.com/1",
    }),
    item({
      title: "Tariffs on steel imports raised again",
      source: "CNN",
      sourceUrl: "https://cnn.com/1",
    }),
    item({
      title: "Tariffs bite into manufacturing margins",
      source: "Breitbart",
      sourceUrl: "https://breitbart.com/1",
    }),
  ]);

  it("groups stories about the same subject into one topic", () => {
    const topics = buildTopics(clusters, { minStories: 2 });
    const ids = topics.map((topic) => topic.id);
    expect(ids).toContain("ukraine");
    expect(ids).toContain("tariffs");
    const ukraine = topics.find((topic) => topic.id === "ukraine");
    expect(ukraine?.storyCount).toBe(3);
  });

  it("assigns each story to exactly one topic", () => {
    const topics = buildTopics(clusters, { minStories: 2 });
    const keys = topics.flatMap((topic) =>
      topic.stories.map((story) => story.key),
    );
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("measures the spread of outlets across the scale", () => {
    const topics = buildTopics(clusters, { minStories: 2 });
    const ukraine = topics.find((topic) => topic.id === "ukraine");
    // Reuters centre, Fox right, Jacobin far-left.
    expect(ukraine?.spread).toBe(3);
    expect(ukraine?.leanCounts.centre).toBe(1);
    expect(ukraine?.leanCounts.right).toBe(1);
    expect(ukraine?.leanCounts["far-left"]).toBe(1);
  });

  it("drops subjects that only one story mentions", () => {
    const topics = buildTopics(clusters, { minStories: 2 });
    expect(topics.some((topic) => topic.id === "committee")).toBe(false);
  });

  it("lists every outlet covering a topic once", () => {
    const topics = buildTopics(clusters, { minStories: 2 });
    const ukraine = topics.find((topic) => topic.id === "ukraine");
    expect(ukraine?.outletCount).toBe(3);
    expect(ukraine?.outlets.map((o) => o.name)).toEqual(
      expect.arrayContaining(["Reuters", "Fox News", "Jacobin"]),
    );
  });
});

describe("topicArticles", () => {
  it("returns every article under a topic, newest first", () => {
    const clusters = clusterNewsroomItems([
      item({
        title: "Sanctions package widened again",
        sourceUrl: "https://a.com/1",
        source: "Reuters",
        publishedAt: "2026-08-28T08:00:00.000Z",
      }),
      item({
        title: "Sanctions relief debated in committee",
        sourceUrl: "https://b.com/1",
        source: "Vox",
        publishedAt: "2026-08-28T11:00:00.000Z",
      }),
    ]);
    const [topic] = buildTopics(clusters, { minStories: 2 });
    const articles = topicArticles(topic);
    expect(articles).toHaveLength(2);
    expect(Date.parse(articles[0].publishedAt)).toBeGreaterThan(
      Date.parse(articles[1].publishedAt),
    );
  });
});
