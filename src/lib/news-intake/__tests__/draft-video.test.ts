import { describe, expect, it } from "vitest";
import { newsItemToDraft } from "@/lib/news-intake/draft";
import type { ExtractedArticle } from "@/lib/news-intake/extract";
import type { NewsItem } from "@/lib/news-intake/types";

const item: NewsItem = {
  id: "k1",
  title: "Outlet headline",
  sourceUrl: "https://www.cbsnews.com/news/example/",
  source: "CBS News",
  publishedAt: "2026-08-29T10:00:00.000Z",
  snippet: "A snippet.",
  topic: "all",
  provider: "rss",
};

function extracted(videoUrl?: string): ExtractedArticle {
  return {
    title: "Outlet headline",
    paragraphs: ["First paragraph of the piece."],
    blocks: [{ type: "paragraph", text: "First paragraph of the piece." }],
    excerpt: "A snippet.",
    canonicalUrl: item.sourceUrl,
    videoUrl,
  };
}

/** The video sections a draft ended up carrying. */
function videoSources(videoUrl?: string): string[] {
  const draft = newsItemToDraft(item, extracted(videoUrl));
  const json = JSON.stringify(draft.content);
  const found: string[] = [];
  for (const match of json.matchAll(/"url":"([^"]+)"/g)) found.push(match[1]);
  return found;
}

describe("which videos reach a draft", () => {
  it("carries a Brightcove player, which has no file extension", () => {
    const src =
      "https://players.brightcove.net/1234/default_default/index.html?videoId=6350";
    expect(videoSources(src)).toContain(src);
  });

  it("carries an HLS manifest", () => {
    const src = "https://hlsvod.dw.com/vod/video/master.m3u8";
    expect(videoSources(src)).toContain(src);
  });

  it("carries a plain mp4", () => {
    const src = "https://prod.vodvideo.cbsnews.com/clip.mp4";
    expect(videoSources(src)).toContain(src);
  });

  it("drops YouTube, because the desk publishes outlets not platforms", () => {
    const src = "https://www.youtube.com/watch?v=abcdefghijk";
    expect(videoSources(src)).not.toContain(src);
  });

  it("drops TikTok for the same reason", () => {
    const src = "https://www.tiktok.com/@outlet/video/12345";
    expect(videoSources(src)).not.toContain(src);
  });

  it("drops anything the player cannot handle", () => {
    const src = "https://example.com/watch/some-player-page";
    expect(videoSources(src)).not.toContain(src);
  });

  it("never emits a video section when there is no video", () => {
    expect(videoSources(undefined)).toHaveLength(0);
  });
});
