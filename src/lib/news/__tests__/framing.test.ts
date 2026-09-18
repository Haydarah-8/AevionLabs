import { describe, expect, it } from "vitest";
import { analyseFraming, clusterFraming, framingTone } from "@/lib/news/framing";
import { detectOmissions } from "@/lib/news/omission";
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

describe("analyseFraming", () => {
  it("picks up the plainer word and the loaded one", () => {
    expect(analyseFraming("Thousands join protest in capital")).toEqual([
      expect.objectContaining({ axis: "protest", term: "protest", tone: "neutral" }),
    ]);
    expect(analyseFraming("Rioters storm the capital")).toEqual([
      expect.objectContaining({ axis: "protest", term: "rioters", tone: "loaded" }),
    ]);
  });

  it("does not match a word inside a longer one", () => {
    // "aliens" must not fire on "alienated"
    expect(analyseFraming("Voters felt alienated by the result")).toEqual([]);
  });

  it("reads multi-word terms", () => {
    const hits = analyseFraming("The asylum seekers arrived overnight");
    expect(hits.map((h) => h.term)).toContain("asylum seekers");
  });

  it("separates reporting verbs by loadedness", () => {
    expect(analyseFraming("Minister said the policy stands")[0].tone).toBe(
      "neutral",
    );
    expect(analyseFraming("Minister slammed the policy")[0].tone).toBe("loaded");
  });
});

describe("clusterFraming", () => {
  /**
   * Built directly rather than through clusterNewsroomItems: swapping the very
   * word under test lowers title similarity below the clustering threshold, so
   * relying on it here would test the clusterer, not the framing analysis.
   */
  const clusterOf = (items: NewsroomItem[]) => ({ items });

  it("surfaces where outlets used different words for the same thing", () => {
    const cluster = clusterOf([
      item({
        title: "Police clash with protesters outside parliament",
        source: "The Nation",
        sourceUrl: "https://thenation.com/1",
      }),
      item({
        title: "Police clash with rioters outside parliament",
        source: "Breitbart",
        sourceUrl: "https://breitbart.com/1",
      }),
    ]);
    const divergences = clusterFraming(cluster);
    const protest = divergences.find((d) => d.axis === "protest");
    expect(protest).toBeDefined();
    expect(protest?.mixedTone).toBe(true);
    expect(protest?.sides.map((s) => s.term).sort()).toEqual([
      "protesters",
      "rioters",
    ]);
    expect(protest?.sides.map((s) => s.lean)).toEqual(
      expect.arrayContaining(["left", "far-right"]),
    );
  });

  it("stays quiet when every outlet used the same word", () => {
    const cluster = clusterOf([
      item({
        title: "Police clash with protesters outside parliament",
        source: "Reuters",
        sourceUrl: "https://reuters.com/2",
      }),
      item({
        title: "Police clash with protesters outside parliament today",
        source: "BBC News",
        sourceUrl: "https://bbc.co.uk/2",
      }),
    ]);
    expect(clusterFraming(cluster).find((d) => d.axis === "protest")).toBeUndefined();
  });

  it("ignores two words used by the same single outlet", () => {
    // One headline reaching for both words is that writer's vocabulary, not a
    // disagreement between outlets.
    const cluster = clusterOf([
      item({
        title: "Police crackdown lands first arrests after protest",
        source: "Reuters",
        sourceUrl: "https://reuters.com/solo",
      }),
    ]);
    expect(clusterFraming(cluster)).toEqual([]);
  });

  it("still ignores it when a second outlet used only one of the words", () => {
    const cluster = clusterOf([
      item({
        title: "Police crackdown lands first arrests",
        source: "Reuters",
        sourceUrl: "https://reuters.com/s1",
      }),
      item({
        title: "Police crackdown continues",
        source: "BBC News",
        sourceUrl: "https://bbc.co.uk/s1",
      }),
    ]);
    // Both outlets say "crackdown"; only Reuters adds "arrests", so no outlet
    // chose a different word from another.
    const enforcement = clusterFraming(cluster).find(
      (d) => d.axis === "enforcement",
    );
    expect(enforcement).toBeUndefined();
  });

  it("puts mixed-tone divergences first", () => {
    const cluster = clusterOf([
      item({
        title: "Regime forces killed dozens as protesters gathered",
        source: "Fox News",
        sourceUrl: "https://foxnews.com/3",
      }),
      item({
        title: "Government forces killed dozens as rioters gathered",
        source: "Vox",
        sourceUrl: "https://vox.com/3",
      }),
    ]);
    const divergences = clusterFraming(cluster);
    expect(divergences.length).toBeGreaterThan(0);
    expect(divergences[0].mixedTone).toBe(true);
  });
});

describe("framingTone", () => {
  it("counts loaded against plain language", () => {
    const tone = framingTone(
      item({
        title: "Regime slammed the so-called protesters",
        sourceUrl: "https://a.com/1",
      }),
    );
    expect(tone.loaded).toBeGreaterThanOrEqual(3);
    expect(tone.neutral).toBe(1);
  });
});

describe("detectOmissions", () => {
  /** One topic carried only on the left, with active right-leaning outlets. */
  // Distinct storyIds keep these as separate stories that share one subject,
  // which is what buildTopics needs to form a topic at all.
  const items = [
    item({
      title: "Sanctions package widened against Moscow banks",
      source: "Jacobin",
      sourceUrl: "https://jacobin.com/a",
      storyId: "s1",
    }),
    item({
      title: "Sanctions relief debated in committee hearing",
      source: "Vox",
      sourceUrl: "https://vox.com/a",
      storyId: "s2",
    }),
    // Right-leaning outlets that published other things in the window.
    item({ title: "Housing starts fell again last quarter", source: "Fox News", sourceUrl: "https://foxnews.com/x", storyId: "f1" }),
    item({ title: "Airline profits beat expectations", source: "Fox News", sourceUrl: "https://foxnews.com/y", storyId: "f2" }),
    item({ title: "Cup final draws record audience", source: "New York Post", sourceUrl: "https://nypost.com/x", storyId: "n1" }),
    item({ title: "Marathon route changed for repairs", source: "New York Post", sourceUrl: "https://nypost.com/y", storyId: "n2" }),
  ];

  /** Selected by id: the filler stories must not decide which topic wins. */
  const sanctionsTopic = () => {
    const topic = buildTopics(clusterNewsroomItems(items), {
      minStories: 2,
    }).find((entry) => entry.id === "sanctions");
    if (!topic) throw new Error("expected a sanctions topic");
    return topic;
  };

  it("names the outlets that were active but silent", () => {
    const report = detectOmissions(sanctionsTopic(), items);
    expect(report.silent.map((s) => s.name).sort()).toEqual([
      "Fox News",
      "New York Post",
    ]);
    expect(report.oneSided).toBe(true);
    expect(report.note).toContain("absent on the right");
  });

  it("ignores outlets too quiet to call silent", () => {
    // Requiring 3+ published excludes both, which each published 2.
    const report = detectOmissions(sanctionsTopic(), items, 3);
    expect(report.silent).toHaveLength(0);
  });

  it("reports nothing missing when every side covered it", () => {
    const spread = [
      item({ title: "Budget vote passes narrowly in the lower house", source: "Jacobin", sourceUrl: "https://jacobin.com/b", storyId: "b1" }),
      item({ title: "Budget deadline looms for regional funding", source: "Vox", sourceUrl: "https://vox.com/b", storyId: "b2" }),
      item({ title: "Budget forecast revised by the watchdog", source: "Reuters", sourceUrl: "https://reuters.com/b", storyId: "b3" }),
      item({ title: "Budget cuts hit defence procurement plans", source: "Fox News", sourceUrl: "https://foxnews.com/b", storyId: "b4" }),
      item({ title: "Budget row erupts over welfare spending", source: "Breitbart", sourceUrl: "https://breitbart.com/b", storyId: "b5" }),
      item({ title: "Budget analysis questions revenue assumptions", source: "National Review", sourceUrl: "https://nationalreview.com/b", storyId: "b6" }),
      item({ title: "Budget timetable slips by another fortnight", source: "CNN", sourceUrl: "https://cnn.com/b", storyId: "b7" }),
    ];
    const topic = buildTopics(clusterNewsroomItems(spread), {
      minStories: 2,
    }).find((entry) => entry.id === "budget");
    if (!topic) throw new Error("expected a budget topic");
    const report = detectOmissions(topic, spread);
    expect(report.oneSided).toBe(false);
    expect(report.silent).toHaveLength(0);
  });
});
