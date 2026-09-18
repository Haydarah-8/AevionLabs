import { describe, expect, it } from "vitest";
import {
  buildGallery,
  galleryImageAllowed,
  galleryPlatforms,
  galleryTotals,
  galleryVideoAllowed,
  imageIdentity,
} from "@/lib/news/gallery";
import { newsroomKey, type NewsroomItem } from "@/lib/news/newsroom";

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
    category: partial.category ?? "World",
    imageUrl: partial.imageUrl,
    videoUrl: partial.videoUrl,
    media: partial.media ?? "text",
    origin: "stored",
    imported: false,
    storyId: partial.storyId ?? null,
  };
}

describe("galleryImageAllowed", () => {
  it("accepts an ordinary https image from any host", () => {
    // The intake allowlist passes 79 of 607 corpus images; this grid uses a
    // plain <img>, so it does not need one.
    expect(galleryImageAllowed("https://i.dailymail.com/a/b.jpg")).toBe(true);
    expect(galleryImageAllowed("https://cdn.i-scmp.com/x.png")).toBe(true);
  });

  it("rejects anything not served over https", () => {
    expect(galleryImageAllowed("http://example.com/a.jpg")).toBe(false);
    expect(galleryImageAllowed("data:image/png;base64,AAAA")).toBe(false);
  });

  it("rejects platform stills — the desk shows outlets", () => {
    expect(galleryImageAllowed("https://i.ytimg.com/vi/abc/hq.jpg")).toBe(false);
    expect(galleryImageAllowed("https://www.tiktok.com/x.jpg")).toBe(false);
  });

  it("rejects tracking pixels", () => {
    expect(galleryImageAllowed("https://t.example.com/1x1.gif")).toBe(false);
    expect(galleryImageAllowed("https://t.example.com/pixel.png")).toBe(false);
  });

  it("rejects nothing at all rather than throwing", () => {
    expect(galleryImageAllowed(undefined)).toBe(false);
    expect(galleryImageAllowed("not a url")).toBe(false);
  });
});

describe("galleryVideoAllowed", () => {
  it("accepts a direct file", () => {
    expect(galleryVideoAllowed("https://cdn.example.com/clip.mp4")).toBe(true);
  });

  it("rejects the platforms, however well-formed the id", () => {
    expect(
      galleryVideoAllowed("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
    ).toBe(false);
    expect(galleryVideoAllowed("https://youtu.be/dQw4w9WgXcQ")).toBe(false);
    expect(
      galleryVideoAllowed(
        "https://www.tiktok.com/@bbcnews/video/7231234567890123456",
      ),
    ).toBe(false);
  });

  it("rejects a page that merely mentions video", () => {
    expect(galleryVideoAllowed("https://example.com/story.html")).toBe(false);
  });
});

describe("imageIdentity", () => {
  it("treats the same picture at two sizes as one", () => {
    expect(imageIdentity("https://cdn.x.com/a/photo.jpg?w=800&q=70")).toBe(
      imageIdentity("https://cdn.x.com/a/photo.jpg?w=1600&q=90"),
    );
  });

  it("folds CDN size segments in the path", () => {
    expect(imageIdentity("https://cdn.x.com/800x450/a/photo.jpg")).toBe(
      imageIdentity("https://cdn.x.com/1600x900/a/photo.jpg"),
    );
  });

  it("keeps genuinely different pictures apart", () => {
    expect(imageIdentity("https://cdn.x.com/a/one.jpg")).not.toBe(
      imageIdentity("https://cdn.x.com/a/two.jpg"),
    );
  });

  it("keeps the same path on different hosts apart", () => {
    // Two outlets' own copies are two files, even at the same path.
    expect(imageIdentity("https://a.com/photo.jpg")).not.toBe(
      imageIdentity("https://b.com/photo.jpg"),
    );
  });
});

describe("buildGallery", () => {
  it("keeps only articles with usable media", () => {
    const tiles = buildGallery([
      item({ title: "text only", sourceUrl: "https://x.com/1" }),
      item({
        title: "has a picture",
        sourceUrl: "https://x.com/2",
        imageUrl: "https://cdn.x.com/a.jpg",
      }),
    ]);
    expect(tiles.map((t) => t.title)).toEqual(["has a picture"]);
  });

  it("collapses a syndicated picture into one tile and counts the rest", () => {
    const tiles = buildGallery([
      item({
        title: "Newest wording",
        source: "BBC News",
        sourceUrl: "https://x.com/1",
        imageUrl: "https://cdn.x.com/wire/photo.jpg?w=800",
        publishedAt: hoursAgo(1),
      }),
      item({
        title: "Older wording",
        source: "Reuters",
        sourceUrl: "https://x.com/2",
        imageUrl: "https://cdn.x.com/wire/photo.jpg?w=1600&q=80",
        publishedAt: hoursAgo(5),
      }),
    ]);
    expect(tiles).toHaveLength(1);
    // Newest keeps the tile.
    expect(tiles[0].title).toBe("Newest wording");
    expect(tiles[0].reused).toBe(1);
  });

  it("gives video its own tile even when the still repeats", () => {
    const tiles = buildGallery([
      item({
        title: "Clip",
        sourceUrl: "https://x.com/1",
        imageUrl: "https://cdn.x.com/same.jpg",
        videoUrl: "https://cdn.x.com/clip.mp4",
      }),
      item({
        title: "Still",
        sourceUrl: "https://x.com/2",
        imageUrl: "https://cdn.x.com/same.jpg",
      }),
    ]);
    expect(tiles).toHaveLength(2);
    expect(tiles.find((t) => t.kind === "video")?.title).toBe("Clip");
  });

  it("orders newest first", () => {
    const tiles = buildGallery([
      item({ title: "old", sourceUrl: "https://x.com/1", imageUrl: "https://c.com/1.jpg", publishedAt: hoursAgo(9) }),
      item({ title: "new", sourceUrl: "https://x.com/2", imageUrl: "https://c.com/2.jpg", publishedAt: hoursAgo(1) }),
    ]);
    expect(tiles.map((t) => t.title)).toEqual(["new", "old"]);
  });

  it("drops a platform article entirely", () => {
    const tiles = buildGallery([
      item({
        title: "yt",
        sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        imageUrl: "https://i.ytimg.com/vi/a/hq.jpg",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      }),
    ]);
    expect(tiles).toEqual([]);
  });

  it("treats an outlet's own video page as video, with no playable file", () => {
    // Twenty outlet feeds were probed and none attached an mp4, so this is
    // what outlet video actually looks like: a page, not a file.
    const tiles = buildGallery([
      item({
        title: "Board of Peace warns Gaza could be gone",
        source: "Al Jazeera",
        sourceUrl: "https://www.aljazeera.com/video/newsfeed/2026/8/29/board",
        imageUrl: "https://www.aljazeera.com/still.jpg",
      }),
    ]);
    expect(tiles).toHaveLength(1);
    expect(tiles[0].kind).toBe("video");
    expect(tiles[0].videoPage).toBe(true);
    expect(tiles[0].videoUrl).toBeUndefined();
  });

  it("prefers a real file over the page heuristic", () => {
    const tiles = buildGallery([
      item({
        title: "NBC clip",
        source: "NBC News",
        sourceUrl: "https://www.nbcnews.com/video/segment-123",
        videoUrl: "https://cdn.nbc.com/clip.mp4",
        imageUrl: "https://cdn.nbc.com/still.jpg",
      }),
    ]);
    expect(tiles[0].kind).toBe("video");
    expect(tiles[0].videoUrl).toBe("https://cdn.nbc.com/clip.mp4");
    expect(tiles[0].videoPage).toBe(false);
  });

  it("honours the limit", () => {
    const many = Array.from({ length: 30 }, (_, i) =>
      item({
        title: `t${i}`,
        sourceUrl: `https://x.com/${i}`,
        imageUrl: `https://c.com/${i}.jpg`,
      }),
    );
    expect(buildGallery(many, { limit: 10 })).toHaveLength(10);
  });
});

describe("galleryPlatforms", () => {
  it("counts each platform, calling non-social items wire", () => {
    const tiles = buildGallery([
      item({ title: "a", sourceUrl: "https://bbc.co.uk/1", imageUrl: "https://c.com/a.jpg" }),
      item({
        title: "b",
        source: "Al Jazeera",
        sourceUrl: "https://www.aljazeera.com/video/newsfeed/2026/8/29/x",
        imageUrl: "https://c.com/b.jpg",
      }),
    ]);
    const byPlatform = Object.fromEntries(
      galleryPlatforms(tiles).map((p) => [p.platform, p.count]),
    );
    // Everything is an outlet now, so everything is wire.
    expect(byPlatform.wire).toBe(2);
    expect(byPlatform.youtube).toBeUndefined();
  });

  it("returns an empty list for an empty wall", () => {
    expect(galleryPlatforms([])).toEqual([]);
  });
});

describe("galleryTotals", () => {
  it("counts tiles, kinds, outlets and reuse", () => {
    const tiles = buildGallery([
      item({ title: "a", source: "BBC News", sourceUrl: "https://x.com/1", imageUrl: "https://c.com/a.jpg" }),
      item({ title: "b", source: "Reuters", sourceUrl: "https://x.com/2", imageUrl: "https://c.com/b.jpg", videoUrl: "https://c.com/b.mp4" }),
      item({ title: "c", source: "Reuters", sourceUrl: "https://x.com/3", imageUrl: "https://c.com/a.jpg?w=99" }),
    ]);
    const totals = galleryTotals(tiles);
    expect(totals.images).toBe(1);
    expect(totals.videos).toBe(1);
    expect(totals.reused).toBe(1);
    expect(totals.outlets).toBeGreaterThan(0);
  });

  it("returns zeroes for an empty wall", () => {
    expect(galleryTotals([])).toEqual({
      tiles: 0,
      images: 0,
      videos: 0,
      outlets: 0,
      reused: 0,
      undrafted: 0,
    });
  });
});

describe("syndicated video collapses to one tile", () => {
  const CLIP = "https://cdn.example.com/videos/abc.mp4";

  it("keeps one tile when several outlets carry the same file", () => {
    const tiles = buildGallery([
      item({
        title: "Outlet A",
        sourceUrl: "https://a.example.com/1",
        videoUrl: CLIP,
        imageUrl: "https://a.example.com/still-a.jpg",
        publishedAt: hoursAgo(1),
      }),
      item({
        title: "Outlet B",
        sourceUrl: "https://b.example.com/2",
        videoUrl: CLIP,
        imageUrl: "https://b.example.com/still-b.jpg",
        publishedAt: hoursAgo(3),
      }),
      item({
        title: "Outlet C",
        sourceUrl: "https://c.example.com/3",
        videoUrl: CLIP,
        imageUrl: "https://c.example.com/still-c.jpg",
        publishedAt: hoursAgo(5),
      }),
    ]);
    const videos = tiles.filter((tile) => tile.kind === "video");
    expect(videos).toHaveLength(1);
    // The newest keeps the tile, and the other two are counted on it.
    expect(videos[0].title).toBe("Outlet A");
    expect(videos[0].reused).toBe(2);
  });

  it("still gives genuinely different footage its own tile", () => {
    const tiles = buildGallery([
      item({
        title: "One",
        sourceUrl: "https://a.example.com/1",
        videoUrl: "https://cdn.example.com/videos/one.mp4",
        imageUrl: "https://a.example.com/still.jpg",
      }),
      item({
        title: "Two",
        sourceUrl: "https://b.example.com/2",
        videoUrl: "https://cdn.example.com/videos/two.mp4",
        imageUrl: "https://b.example.com/still.jpg",
      }),
    ]);
    expect(tiles.filter((tile) => tile.kind === "video")).toHaveLength(2);
  });
});
