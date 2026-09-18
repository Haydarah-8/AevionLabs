import { describe, expect, it } from "vitest";
import { newsItemToDraft } from "@/lib/news-intake/draft";
import type { ExtractedArticle } from "@/lib/news-intake/extract";
import type { NewsItem } from "@/lib/news-intake/types";
import { articleImageAllowed } from "@/lib/news/media";

const item: NewsItem = {
  id: "test-verge-laptop",
  title: "The Verge reviews a new coding laptop",
  source: "The Verge",
  provider: "the-verge",
  sourceUrl: "https://www.theverge.com/2026/08/laptop-review",
  publishedAt: "2026-08-28T09:00:00.000Z",
  snippet: "A thin machine aimed at software developers.",
  topic: "all",
};

function article(
  blocks: ExtractedArticle["blocks"],
  extra: Partial<ExtractedArticle> = {},
): ExtractedArticle {
  return {
    title: item.title,
    byline: "Daniel Woolfolk",
    paragraphs: blocks.flatMap((b) => (b.type === "paragraph" ? [b.text] : [])),
    blocks,
    excerpt: "A continuing resolution, a budget request and a supplemental.",
    canonicalUrl: item.sourceUrl,
    ...extra,
  };
}

function blocksOfType(draft: ReturnType<typeof newsItemToDraft>, type: string) {
  return (draft.content ?? []).filter((block) => block.type === type);
}

describe("media carried into a draft", () => {
  it("sends an iframe player to an embed block, not a <video>", () => {
    // The exact pair from the Breaking Defense draft that rendered two dead
    // players: BlockNote's video block would point a <video> at an HTML page.
    const draft = newsItemToDraft(
      item,
      article([
        { type: "paragraph", text: "While lawmakers wrap up their recess…" },
        {
          type: "video",
          src: "https://player.vimeo.com/video/1221893911?h=8de9ffb2c7&autoplay=1",
          caption: "Congressional Round Up ep. 30",
        },
      ]),
    );

    expect(blocksOfType(draft, "video")).toHaveLength(0);
    const embeds = blocksOfType(draft, "embed");
    expect(embeds).toHaveLength(1);
    // The player address keeps Vimeo's `h` token — without it an unlisted
    // video answers 403 and the frame shows Vimeo's own error card — while
    // the autoplay junk around it is dropped.
    expect(embeds[0].props?.url).toBe(
      "https://player.vimeo.com/video/1221893911?h=8de9ffb2c7",
    );
    expect(embeds[0].props?.caption).toBe("Congressional Round Up ep. 30");
  });

  it("prefers the address that carries the access token", () => {
    // Markup order is an accident; the playable url is not.
    const draft = newsItemToDraft(
      item,
      article([
        { type: "paragraph", text: "Lead paragraph." },
        { type: "video", src: "https://vimeo.com/1221893911", caption: "BD" },
        {
          type: "video",
          src: "https://player.vimeo.com/video/1221893911?h=8de9ffb2c7",
          caption: "Round Up",
        },
      ]),
    );
    const embeds = blocksOfType(draft, "embed");
    expect(embeds).toHaveLength(1);
    expect(embeds[0].props?.url).toBe(
      "https://player.vimeo.com/video/1221893911?h=8de9ffb2c7",
    );
  });

  it("keeps a real media file on the video block", () => {
    const draft = newsItemToDraft(
      item,
      article([
        { type: "paragraph", text: "Lead paragraph." },
        {
          type: "video",
          src: "https://cdn.example.com/clips/hearing.mp4",
          caption: "Hearing",
        },
      ]),
    );
    expect(blocksOfType(draft, "embed")).toHaveLength(0);
    expect(blocksOfType(draft, "video")).toHaveLength(1);
  });

  it("carries the same video once however it is spelled", () => {
    // The page linked its Vimeo clip twice: once as the iframe src and once as
    // the plain page url. Both reached the draft, one above the other.
    const draft = newsItemToDraft(
      item,
      article(
        [
          { type: "paragraph", text: "Lead paragraph." },
          {
            type: "video",
            src: "https://player.vimeo.com/video/1221893911?h=8de9ffb2c7",
            caption: "Congressional Round Up ep. 30",
          },
          {
            type: "video",
            src: "https://vimeo.com/1221893911",
            caption: "Breaking Defense",
          },
        ],
        { videoUrl: "https://vimeo.com/1221893911" },
      ),
    );
    expect(blocksOfType(draft, "embed")).toHaveLength(1);
  });

  it("illustrates a draft from outlets the old allowlist refused", () => {
    const draft = newsItemToDraft(
      item,
      article([
        { type: "paragraph", text: "Lead paragraph." },
        {
          type: "figure",
          src: "https://images.thediplomat.com/assets/hearing.jpg",
          alt: "The hearing",
          caption: "The Diplomat",
        },
        {
          type: "figure",
          src: "https://static.dw.com/image/12345_6.jpg",
          alt: "Berlin",
          caption: "DW",
        },
      ]),
    );
    expect(blocksOfType(draft, "image")).toHaveLength(2);
  });

  it("still refuses platforms and tracking pixels", () => {
    expect(articleImageAllowed("https://i.ytimg.com/vi/abc/hq.jpg")).toBe(false);
    expect(articleImageAllowed("https://pbs.twimg.com/media/x.jpg")).toBe(false);
    expect(articleImageAllowed("https://cdn.example.com/pixel.gif")).toBe(false);
    expect(articleImageAllowed("http://insecure.example.com/a.jpg")).toBe(false);
    expect(articleImageAllowed("https://images.thediplomat.com/a.jpg")).toBe(
      true,
    );
  });

  it("does not carry a YouTube video into a draft", () => {
    // Outlets, not platforms — the standing rule, unchanged by any of this.
    const draft = newsItemToDraft(
      item,
      article([
        { type: "paragraph", text: "Lead paragraph." },
        {
          type: "video",
          src: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          caption: "YouTube",
        },
      ]),
    );
    expect(blocksOfType(draft, "embed")).toHaveLength(0);
    expect(blocksOfType(draft, "video")).toHaveLength(0);
  });
});
