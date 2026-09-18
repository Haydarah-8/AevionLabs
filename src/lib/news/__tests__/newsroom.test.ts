import { describe, expect, it } from "vitest";
import {
  clusterNewsroomItems,
  filterNewsroomItems,
  mergeNewsroomItems,
  newsroomKey,
  outletKey,
  sortNewsroomClusters,
  type NewsroomItem,
} from "@/lib/news/newsroom";

const BASE_TIME = "2026-08-27T10:00:00.000Z";

function item(partial: Partial<NewsroomItem> & { title: string }): NewsroomItem {
  const sourceUrl =
    partial.sourceUrl ?? `https://example.com/${partial.title.length}`;
  return {
    key: newsroomKey(sourceUrl),
    id: partial.id ?? null,
    title: partial.title,
    snippet: partial.snippet ?? "",
    source: partial.source ?? "Example",
    sourceId: partial.sourceId ?? "example",
    sourceUrl,
    publishedAt: partial.publishedAt ?? BASE_TIME,
    category: partial.category ?? "",
    imageUrl: partial.imageUrl,
    videoUrl: partial.videoUrl,
    platform: partial.platform,
    media: partial.media ?? "text",
    origin: partial.origin ?? "live",
    imported: partial.imported ?? false,
    storyId: partial.storyId ?? null,
  };
}

describe("newsroomKey", () => {
  it("collapses tracking params and trailing slashes", () => {
    expect(newsroomKey("https://bbc.co.uk/news/abc/?utm_source=x&fbclid=1")).toBe(
      newsroomKey("https://bbc.co.uk/news/abc"),
    );
  });

  it("keeps genuinely different urls apart", () => {
    expect(newsroomKey("https://bbc.co.uk/a")).not.toBe(
      newsroomKey("https://bbc.co.uk/b"),
    );
  });
});

describe("clusterNewsroomItems", () => {
  it("packages the same story from different outlets into one cluster", () => {
    const clusters = clusterNewsroomItems([
      item({
        title: "NATO ministers agree new defence spending target",
        source: "BBC News",
        sourceUrl: "https://bbc.co.uk/1",
      }),
      item({
        title: "NATO ministers agree new defence spending target",
        source: "Reuters",
        sourceUrl: "https://reuters.com/1",
      }),
      item({
        title: "NATO defence ministers agree a new spending target",
        source: "Al Jazeera",
        sourceUrl: "https://aljazeera.com/1",
      }),
    ]);

    expect(clusters).toHaveLength(1);
    expect(clusters[0].sourceCount).toBe(3);
    expect(clusters[0].sources).toEqual(
      expect.arrayContaining(["BBC News", "Reuters", "Al Jazeera"]),
    );
  });

  it("keeps unrelated stories in separate clusters", () => {
    const clusters = clusterNewsroomItems([
      item({ title: "NATO agrees new defence spending target" }),
      item({
        title: "Oil prices slide after OPEC output decision",
        sourceUrl: "https://example.com/oil",
      }),
    ]);
    expect(clusters).toHaveLength(2);
  });

  it("does not merge similar headlines outside the time window", () => {
    const clusters = clusterNewsroomItems([
      item({
        title: "NATO ministers agree new defence spending target",
        sourceUrl: "https://a.com/1",
      }),
      item({
        title: "NATO ministers agree new defence spending target",
        sourceUrl: "https://b.com/1",
        publishedAt: "2026-08-25T10:00:00.000Z",
      }),
    ]);
    expect(clusters).toHaveLength(2);
  });

  it("groups by pipeline story id even when headlines differ", () => {
    const clusters = clusterNewsroomItems([
      item({
        title: "Completely different wording here",
        source: "Reuters",
        sourceUrl: "https://reuters.com/2",
        storyId: "story-1",
        origin: "stored",
      }),
      item({
        title: "Nothing alike in this headline at all",
        source: "Sky",
        sourceUrl: "https://news.sky.com/2",
        storyId: "story-1",
        origin: "stored",
      }),
    ]);
    expect(clusters).toHaveLength(1);
    expect(clusters[0].sourceCount).toBe(2);
    expect(clusters[0].items).toHaveLength(2);
  });

  it("promotes the richest article to lead", () => {
    const clusters = clusterNewsroomItems([
      item({
        title: "NATO ministers agree new defence spending target",
        source: "Thin Wire",
        sourceUrl: "https://a.com/3",
      }),
      item({
        title: "NATO ministers agree new defence spending target",
        source: "Full Report",
        sourceUrl: "https://b.com/3",
        origin: "stored",
        media: "image",
        imageUrl: "https://img/1.jpg",
        snippet: "x".repeat(120),
      }),
    ]);
    expect(clusters[0].lead.source).toBe("Full Report");
  });

  it("marks a cluster imported only when every article is drafted", () => {
    const [cluster] = clusterNewsroomItems([
      item({
        title: "NATO ministers agree new defence spending target",
        sourceUrl: "https://a.com/4",
        imported: true,
      }),
      item({
        title: "NATO ministers agree new defence spending target",
        sourceUrl: "https://b.com/4",
        imported: false,
      }),
    ]);
    expect(cluster.imported).toBe(false);
  });
});

describe("outletKey", () => {
  it("treats one masthead's desks as a single outlet", () => {
    const bbc = outletKey({
      source: "BBC News",
      sourceUrl: "https://www.bbc.co.uk/news/articles/1",
    });
    expect(
      outletKey({
        source: "BBC Technology",
        sourceUrl: "https://www.bbc.co.uk/news/technology/2",
      }),
    ).toBe(bbc);
    expect(
      outletKey({
        source: "BBC Science",
        sourceUrl: "https://www.bbc.co.uk/news/science/3",
      }),
    ).toBe(bbc);
  });

  it("attributes a social clip to its publisher, not the platform", () => {
    expect(
      outletKey({
        source: "Al Jazeera English",
        sourceUrl: "https://www.youtube.com/watch?v=abc",
        platform: "youtube",
      }),
    ).toBe(
      outletKey({
        source: "Al Jazeera",
        sourceUrl: "https://www.aljazeera.com/news/1",
      }),
    );
  });

  it("keeps genuinely different outlets apart", () => {
    expect(
      outletKey({ source: "Reuters", sourceUrl: "https://reuters.com/a" }),
    ).not.toBe(
      outletKey({ source: "CNN", sourceUrl: "https://edition.cnn.com/a" }),
    );
    expect(
      outletKey({
        source: "Defense News",
        sourceUrl: "https://www.defensenews.com/a",
      }),
    ).not.toBe(
      outletKey({
        source: "Defense One",
        sourceUrl: "https://www.defenseone.com/a",
      }),
    );
  });

  it("counts one outlet once even across two feeds of the same story", () => {
    const [cluster] = clusterNewsroomItems([
      item({
        title: "Record rain in Japan leaves several dead and thousands stranded",
        source: "Al Jazeera",
        sourceUrl: "https://www.aljazeera.com/news/japan",
      }),
      item({
        title: "Record rain in Japan leaves several dead and thousands stranded",
        source: "Al Jazeera English",
        sourceUrl: "https://www.youtube.com/watch?v=japan",
        platform: "youtube",
      }),
    ]);
    expect(cluster.sourceCount).toBe(1);
  });
});

describe("sortNewsroomClusters", () => {
  it("puts the most widely covered story first under coverage sort", () => {
    const clusters = clusterNewsroomItems([
      item({ title: "Single outlet story about tariffs", sourceUrl: "https://a.com/5" }),
      item({
        title: "NATO ministers agree new defence spending target",
        source: "BBC",
        sourceUrl: "https://b.com/5",
      }),
      item({
        title: "NATO ministers agree new defence spending target",
        source: "Reuters",
        sourceUrl: "https://c.com/5",
      }),
    ]);
    const sorted = sortNewsroomClusters(clusters, "coverage");
    expect(sorted[0].sourceCount).toBe(2);
  });
});

describe("mergeNewsroomItems", () => {
  it("prefers the stored row but keeps the live row's media and story id", () => {
    const merged = mergeNewsroomItems([
      [
        item({
          title: "Shared story",
          sourceUrl: "https://a.com/6",
          origin: "stored",
          id: "row-1",
        }),
      ],
      [
        item({
          title: "Shared story",
          sourceUrl: "https://a.com/6",
          origin: "live",
          imageUrl: "https://img/2.jpg",
          storyId: "story-9",
        }),
      ],
    ]);
    expect(merged).toHaveLength(1);
    expect(merged[0].origin).toBe("stored");
    expect(merged[0].id).toBe("row-1");
    expect(merged[0].imageUrl).toBe("https://img/2.jpg");
    expect(merged[0].storyId).toBe("story-9");
  });
});

describe("filterNewsroomItems", () => {
  const items = [
    item({ title: "Defence budget rises", source: "BBC", category: "Defence" }),
    item({
      title: "Oil markets wobble",
      source: "Reuters",
      category: "Energy",
      sourceUrl: "https://r.com/1",
      imported: true,
    }),
  ];

  it("matches every search term across title and source", () => {
    const found = filterNewsroomItems(items, {
      query: "oil reuters",
      source: "all",
      category: "all",
      media: "all",
      status: "all",
    });
    expect(found).toHaveLength(1);
    expect(found[0].title).toBe("Oil markets wobble");
  });

  it("filters new versus imported", () => {
    const found = filterNewsroomItems(items, {
      query: "",
      source: "all",
      category: "all",
      media: "all",
      status: "new",
    });
    expect(found).toHaveLength(1);
    expect(found[0].imported).toBe(false);
  });
});
