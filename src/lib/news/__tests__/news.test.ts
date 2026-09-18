import { describe, expect, it } from "vitest";
import { classifyCategory } from "../categories";
import { PROVIDER_IDS } from "../providers";
import {
  findDuplicate,
  normalizeTitle,
  titleSimilarity,
} from "../deduplication";
import { normalizeArticle } from "../normalizer";

describe("normalizeTitle", () => {
  it("strips punctuation and stopwords", () => {
    expect(normalizeTitle("The UK and France agree a defence pact")).toBe(
      "uk france agree defence pact",
    );
  });
});

describe("normalizeArticle", () => {
  it("drops articles without a title or http url", () => {
    expect(
      normalizeArticle("gdelt", { title: "Hello", sourceUrl: "not-a-url" }),
    ).toBeNull();
  });

  it("strips html and keeps publisher metadata", () => {
    const article = normalizeArticle("guardian", {
      title: "<b>NATO meets</b>",
      description: "<p>Leaders gather in Brussels</p>",
      sourceUrl: "https://www.theguardian.com/world/nato-meets?utm_source=rss",
      sourceName: "The Guardian",
      publishedAt: "2026-08-13T10:00:00Z",
      categoryHint: "World",
    });
    expect(article?.title).toBe("NATO meets");
    expect(article?.description).toBe("Leaders gather in Brussels");
    expect(article?.sourceDomain).toBe("theguardian.com");
    expect(article?.canonicalUrl).not.toContain("utm_source");
    expect(article?.category).toBe("World");
  });
});

describe("deduplication", () => {
  it("matches canonical urls", () => {
    const match = findDuplicate(
      {
        title: "A",
        canonicalUrl: "https://example.com/story",
        sourceUrl: "https://example.com/story",
        externalId: "1",
        provider: "gnews",
        publishedAt: new Date().toISOString(),
      },
      [
        {
          id: "x",
          title: "Other",
          canonical_url: "https://example.com/story",
          source_url: "https://example.com/story",
          external_id: "9",
          provider: "gdelt",
          published_at: new Date().toISOString(),
          duplicate_group_id: "group-1",
        },
      ],
    );
    expect(match?.duplicate_group_id).toBe("group-1");
  });

  it("groups similar titles in a time window", () => {
    expect(
      titleSimilarity(
        "UK and France sign new defence agreement",
        "France and the UK sign a new defence agreement",
      ),
    ).toBeGreaterThan(0.72);
  });
});

describe("providers", () => {
  it("registers the no-key RSS provider first", () => {
    expect(PROVIDER_IDS[0]).toBe("rss");
    expect(PROVIDER_IDS).toContain("gdelt");
  });
});

describe("classifyCategory", () => {
  it("maps obvious AI coverage", () => {
    expect(classifyCategory("OpenAI launches new model", "")).toBe("AI");
  });
});
