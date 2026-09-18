import { describe, expect, it } from "vitest";
import { newsItemToDraft } from "@/lib/news-intake/draft";
import type {
  ExtractedArticle,
  ExtractedContentBlock,
} from "@/lib/news-intake/extract";
import type { NewsItem } from "@/lib/news-intake/types";

const item: NewsItem = {
  id: "k1",
  title: "Outlet headline",
  sourceUrl: "https://www.abc.net.au/news/example",
  source: "ABC News",
  publishedAt: "2026-08-31T10:00:00.000Z",
  snippet: "A snippet.",
  topic: "all",
  provider: "rss",
};

function draftFrom(blocks: ExtractedContentBlock[]) {
  const article: ExtractedArticle = {
    title: "Outlet headline",
    paragraphs: blocks
      .filter((b): b is { type: "paragraph"; text: string } => b.type === "paragraph")
      .map((b) => b.text),
    blocks,
    excerpt: "A snippet.",
    canonicalUrl: item.sourceUrl,
  };
  return newsItemToDraft(item, article);
}

/** Which BlockNote block types a draft ended up carrying. */
function typesOf(blocks: ReturnType<typeof draftFrom>["content"]) {
  const counts: Record<string, number> = {};
  for (const block of blocks as Array<{ type: string }>) {
    counts[block.type] = (counts[block.type] ?? 0) + 1;
  }
  return counts;
}

describe("what survives the trip from the outlet into the editor", () => {
  it("keeps subheadings as headings, not as flat text", () => {
    const types = typesOf(
      draftFrom([
        { type: "paragraph", text: "Opening paragraph of the report here." },
        { type: "h2", text: "What happened" },
        { type: "paragraph", text: "More of the report follows on." },
        { type: "h3", text: "The response" },
      ]).content,
    );
    expect(types.heading).toBe(2);
  });

  it("keeps a bulleted list as list items rather than bullet characters", () => {
    const draft = draftFrom([
      { type: "paragraph", text: "Opening paragraph of the report here." },
      {
        type: "list",
        style: "ul",
        items: ["First finding", "Second finding", "Third finding"],
      },
    ]);
    expect(typesOf(draft.content).bulletListItem).toBe(3);
    // And not smuggled in as paragraphs with a bullet glyph.
    expect(JSON.stringify(draft.content)).not.toContain("• ");
  });

  it("keeps a numbered list numbered", () => {
    const draft = draftFrom([
      { type: "paragraph", text: "Opening paragraph of the report here." },
      { type: "list", style: "ol", items: ["Step one", "Step two"] },
    ]);
    expect(typesOf(draft.content).numberedListItem).toBe(2);
  });

  it("carries a pull-quote and its attribution", () => {
    const draft = draftFrom([
      { type: "paragraph", text: "Opening paragraph of the report here." },
      {
        type: "quote",
        text: "We were not prepared for this.",
        attribution: "A spokesperson",
      },
    ]);
    const json = JSON.stringify(draft.content);
    expect(json).toContain("We were not prepared for this.");
    expect(json).toContain("A spokesperson");
  });

  it("carries the article's own images, not just the hero", () => {
    const draft = draftFrom([
      { type: "paragraph", text: "Opening paragraph of the report here." },
      {
        type: "figure",
        src: "https://www.abc.net.au/one.jpg",
        alt: "One",
        caption: "First picture",
      },
      { type: "paragraph", text: "More of the report follows on here." },
      {
        type: "figure",
        src: "https://www.abc.net.au/two.jpg",
        alt: "Two",
        caption: "Second picture",
      },
    ]);
    expect(typesOf(draft.content).image).toBe(2);
    expect(JSON.stringify(draft.content)).toContain("First picture");
  });

  it("keeps the outlet's order rather than grouping by kind", () => {
    const draft = draftFrom([
      { type: "paragraph", text: "Opening paragraph of the report here." },
      { type: "h2", text: "A heading between them" },
      { type: "paragraph", text: "Closing paragraph of the report here." },
    ]);
    const types = (draft.content as Array<{ type: string }>).map((b) => b.type);
    const heading = types.indexOf("heading");
    const lastParagraph = types.lastIndexOf("paragraph");
    expect(heading).toBeGreaterThan(0);
    expect(lastParagraph).toBeGreaterThan(heading);
  });
});
