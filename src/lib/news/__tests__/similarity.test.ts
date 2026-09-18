import { describe, expect, it } from "vitest";
import {
  buildIdf,
  SAME_STORY,
  similarityTokens,
  stemToken,
  weightedSimilarity,
} from "@/lib/news/similarity";

const score = (a: string, b: string, corpus: string[]) => {
  const idf = buildIdf(corpus);
  return weightedSimilarity(similarityTokens(a), similarityTokens(b), idf);
};

describe("stemToken", () => {
  it("folds plurals", () => {
    expect(stemToken("drones")).toBe("drone");
    expect(stemToken("announces")).toBe("announce");
    expect(stemToken("bodies")).toBe("body");
  });

  it("leaves short words and double-s endings alone", () => {
    expect(stemToken("gas")).toBe("gas");
    expect(stemToken("press")).toBe("press");
    expect(stemToken("us")).toBe("us");
  });

  it("maps small numbers to their written form", () => {
    // "6-month" and "six-month" must produce the same token.
    expect(stemToken("6")).toBe(stemToken("six"));
  });
});

describe("weightedSimilarity", () => {
  /** A corpus where "trump" is everywhere and "warsh" is rare. */
  const corpus = [
    "Trump signs order on trade",
    "Trump speaks at rally in Ohio",
    "Trump meets allies over defence",
    "Trump comments on the economy",
    "Trump visits the border",
    "Fed Chair Warsh signals rate hikes may be needed",
    "Storm warnings issued across the coast",
    "Election results confirmed in three states",
  ];

  it("scores a shared rare word above a shared common one", () => {
    const rare = score(
      "Fed Chair Warsh signals rate hikes",
      "Warsh signals the Fed may raise rates",
      corpus,
    );
    const common = score(
      "Trump signs order on trade",
      "Trump visits the border",
      corpus,
    );
    expect(rare).toBeGreaterThan(common);
    expect(rare).toBeGreaterThanOrEqual(SAME_STORY);
    expect(common).toBeLessThan(SAME_STORY);
  });

  it("matches headlines that differ in wording but not in event", () => {
    expect(
      score(
        "Four plead guilty to arson attack on Jewish community ambulances",
        "Four men plead guilty to destroying Jewish community ambulance",
        corpus,
      ),
    ).toBeGreaterThanOrEqual(SAME_STORY);
  });

  it("matches across digits and words for the same number", () => {
    expect(
      score(
        "Iran war hits 6-month mark with no end in sight",
        "As Iran war hits six-month mark, Trump says he is not in a hurry",
        corpus,
      ),
    ).toBeGreaterThanOrEqual(SAME_STORY);
  });

  it("does not match two different stories about the same person", () => {
    expect(
      score(
        "Trump signs order renaming Lake Ontario",
        "Trump awards Artemis crew a space medal",
        corpus,
      ),
    ).toBeLessThan(SAME_STORY);
  });

  it("is symmetric", () => {
    const a = "Nepal army rescues survivors from hydropower tunnel";
    const b = "Nepal flood survivors rescued from hydropower tunnel";
    expect(score(a, b, corpus)).toBeCloseTo(score(b, a, corpus), 10);
  });

  it("scores a headline against itself as 1", () => {
    const a = "Fed Chair Warsh signals rate hikes may be needed";
    expect(score(a, a, corpus)).toBeCloseTo(1, 10);
  });

  it("returns 0 when nothing is shared", () => {
    expect(score("Storm warnings issued", "Election results confirmed", corpus))
      .toBe(0);
  });

  it("still works when every headline shares every word", () => {
    /**
     * The degenerate corpus: textbook log(N/df) makes every weight exactly
     * zero here, so nothing matches anything. The desk clusters the filtered
     * list, which really can be three near-identical headlines.
     */
    const identical = [
      "NATO ministers agree new defence spending target",
      "NATO ministers agree new defence spending target",
      "NATO defence ministers agree a new spending target",
    ];
    expect(score(identical[0], identical[2], identical)).toBeGreaterThanOrEqual(
      SAME_STORY,
    );
  });

  it("handles an empty headline without dividing by zero", () => {
    expect(score("", "Trump signs order", corpus)).toBe(0);
    expect(score("", "", corpus)).toBe(0);
  });
});
