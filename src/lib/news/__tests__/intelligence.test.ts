import { describe, expect, it } from "vitest";
import { getAIProvider, ruleBasedProvider } from "../ai/providers";
import { canonicalUrl } from "../normalizer/sanitize";
import {
  parseRss,
  isHardNewsEvent,
  findVideoInHtml,
  passesAdminNewsFilter,
} from "@/lib/news-intake/rss";
import { imageAllowed } from "@/lib/news-intake/draft";
import { safeEmbedUrl, safeVideoPlayback } from "@/lib/news/media";
import {
  isSocialSource,
  pageSlice,
  socialPlatformFromUrl,
  SOCIAL_FEEDS,
} from "@/lib/news/social";
import { circuitOpen, withBackoff } from "../ingestion/retry";
import { breakingScore, isBreakingStory } from "../scoring/breaking";
import { clusterArticle } from "../stories/cluster";
import {
  isAdminBlockedHost,
  isAggregatorFeed,
  shouldExcludeFromAdminFeed,
  SEED_SOURCES,
} from "../sources/registry";

describe("admin source allowlist", () => {
  it("blocks Guardian and paywalled hosts", () => {
    expect(isAdminBlockedHost("www.theguardian.com")).toBe(true);
    expect(
      shouldExcludeFromAdminFeed("https://www.theguardian.com/world/a"),
    ).toBe(true);
    expect(shouldExcludeFromAdminFeed("https://www.ft.com/content/x")).toBe(
      true,
    );
    expect(shouldExcludeFromAdminFeed("https://www.bbc.co.uk/news/world")).toBe(
      false,
    );
  });

  it("seeds only free tech outlets", () => {
    const ids = SEED_SOURCES.map((source) => source.id);
    expect(ids).toContain("bbc-tech");
    expect(ids).toContain("hacker-news");
    expect(ids).not.toContain("bbc-world");
    expect(ids).not.toContain("guardian");
    expect(
      SEED_SOURCES.some((source) => source.domain.includes("theguardian")),
    ).toBe(false);
  });

  /** The desk is text-first: video platforms are not carried. */
  it("declares no platform feeds — the desk shows outlets", () => {
    expect(SOCIAL_FEEDS).toHaveLength(0);
  });

  it("keeps platform links out, but not an outlet's own video pages", () => {
    expect(
      shouldExcludeFromAdminFeed("https://www.youtube.com/watch?v=abc"),
    ).toBe(true);
    expect(shouldExcludeFromAdminFeed("https://youtu.be/abc")).toBe(true);
    expect(
      shouldExcludeFromAdminFeed("https://www.tiktok.com/@bbc/video/1"),
    ).toBe(true);
    // An outlet's own video section is the outlet publishing, so it stays.
    expect(
      shouldExcludeFromAdminFeed("https://www.aljazeera.com/video/newsfeed/x"),
    ).toBe(false);
    expect(shouldExcludeFromAdminFeed("https://www.ft.com/content/x")).toBe(
      true,
    );
    expect(
      shouldExcludeFromAdminFeed("https://www.bbc.co.uk/news/articles/1"),
    ).toBe(false);
  });

  it("treats Google News RSS as an aggregator feed", () => {
    expect(
      isAggregatorFeed({
        id: "google-tech",
        domain: "news.google.com",
        rss_url: "https://news.google.com/rss/search?q=x",
      }),
    ).toBe(true);
    expect(
      isAggregatorFeed({
        id: "bbc-tech",
        domain: "bbc.co.uk",
        rss_url: "https://feeds.bbci.co.uk/news/world/rss.xml",
      }),
    ).toBe(false);
  });
});

describe("canonical urls", () => {
  it("strips tracking params", () => {
    expect(
      canonicalUrl(
        "https://apnews.com/article/x?utm_source=rss&utm_medium=feed",
      ),
    ).toBe("https://apnews.com/article/x");
  });
});

describe("rss parsing", () => {
  it("reads item title and link", () => {
    const xml = `<?xml version="1.0"?><rss><channel><item>
      <title>NATO agrees new air defence plan</title>
      <link>https://www.bbc.co.uk/news/articles/abc</link>
      <pubDate>Thu, 13 Aug 2026 10:00:00 GMT</pubDate>
      <description>Snippet</description>
    </item></channel></rss>`;
    const items = parseRss(xml, {
      source: "BBC News",
      provider: "bbc-tech",
      topic: "all",
    });
    expect(items[0]?.title).toBe("NATO agrees new air defence plan");
    expect(items[0]?.sourceUrl).toContain("bbc.co.uk");
  });

  it("reads youtube and enclosure videos from rss", () => {
    const xml = `<?xml version="1.0"?><rss><channel><item>
      <title>NATO agrees new air defence plan</title>
      <link>https://www.bbc.co.uk/news/articles/video</link>
      <description><![CDATA[Clip <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe>]]></description>
      <media:content url="https://ichef.bbci.co.uk/news/800/x.jpg" medium="image" />
    </item>
    <item>
      <title>Ukraine troops hold the line near Kharkiv</title>
      <link>https://www.reuters.com/world/ukraine-video</link>
      <enclosure url="https://www.reuters.com/video/clip.mp4" type="video/mp4" />
      <description>Front line report</description>
    </item></channel></rss>`;
    const items = parseRss(xml, {
      source: "BBC News",
      provider: "bbc-tech",
      topic: "all",
    });
    expect(items[0]?.videoUrl).toBe(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    );
    expect(items[1]?.videoUrl).toBe("https://www.reuters.com/video/clip.mp4");
  });

  it("drops advertisement items", () => {
    const xml = `<?xml version="1.0"?><rss><channel><item>
      <title>Advertisement: Buy this now</title>
      <link>https://www.bbc.co.uk/news/articles/ad</link>
      <description>Sponsored content</description>
    </item>
    <item>
      <title>Shop the deal</title>
      <link>https://taboola.com/item/x</link>
      <description>Partner content</description>
    </item></channel></rss>`;
    const items = parseRss(xml, {
      source: "BBC News",
      provider: "bbc-tech",
      topic: "all",
    });
    expect(items).toHaveLength(0);
  });

  it("drops youtube channel videos that are not tech articles", () => {
    const xml = `<?xml version="1.0"?><feed>
      <entry>
        <title>Watch: briefing from the newsroom</title>
        <link href="https://www.youtube.com/watch?v=abcdefghijk" />
        <published>2026-08-13T10:00:00Z</published>
        <media:thumbnail url="https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg" />
      </entry>
    </feed>`;
    const items = parseRss(xml, {
      source: "BBC News",
      provider: "youtube-bbc-news",
      topic: "all",
    });
    expect(items).toHaveLength(0);
  });

  it("keeps tech news and drops lifestyle, ads, and world politics", () => {
    expect(
      isHardNewsEvent(
        "OpenAI releases a new GPT model for developers",
        "The company says the model is faster for coding",
        "https://techcrunch.com/2026/09/10/openai-gpt",
      ),
    ).toBe(true);
    expect(
      isHardNewsEvent(
        "Nvidia unveils next-generation AI chips",
        "The GPU maker outlined a new semiconductor roadmap",
        "https://www.theverge.com/nvidia-ai-chips",
      ),
    ).toBe(true);
    expect(
      isHardNewsEvent(
        "Dream Big with a Home Equity Loan",
        "Turn equity into cash",
        "https://www.cnn.com/business/home-equity",
      ),
    ).toBe(false);
    expect(
      isHardNewsEvent(
        "Israel strikes Hezbollah targets in Lebanon",
        "Missiles hit south of Beirut",
        "https://www.bbc.co.uk/news/articles/abc",
      ),
    ).toBe(false);
    expect(
      isHardNewsEvent(
        "Fed holds rates as inflation stays high",
        "The Federal Reserve left interest rates unchanged",
        "https://www.reuters.com/markets/fed",
      ),
    ).toBe(false);
    expect(
      isHardNewsEvent(
        "Fireworks light skies over Pakistan’s capital as crowds celebrate Independence Day",
        "Crowds celebrate the 79th anniversary of independence",
        "https://abcnews.go.com/International/fireworks-pakistan",
      ),
    ).toBe(false);
  });
});

describe("video scrape", () => {
  it("finds youtube, vimeo, and mp4 in page html", () => {
    expect(
      findVideoInHtml(
        '<meta property="og:image" content="https://ichef.bbci.co.uk/news/800/x.jpg" /><iframe src="https://www.youtube.com/embed/abcdefghijk"></iframe>',
      ),
    ).toBe("https://www.youtube.com/watch?v=abcdefghijk");
    expect(
      findVideoInHtml(
        '<meta property="og:video" content="https://player.vimeo.com/video/123456" />',
      ),
    ).toBe("https://vimeo.com/123456");
    expect(
      findVideoInHtml(
        '<video controls><source src="https://cdn.cnn.com/video/clip.mp4" type="video/mp4"></video>',
      ),
    ).toBe("https://cdn.cnn.com/video/clip.mp4");
  });

  it("embeds youtube shorts and plays https mp4", () => {
    expect(safeEmbedUrl("https://www.youtube.com/shorts/abcdefghijk")).toBe(
      "https://www.youtube.com/embed/abcdefghijk",
    );
    expect(safeEmbedUrl("https://youtu.be/abcdefghijk")).toBe(
      "https://www.youtube.com/embed/abcdefghijk",
    );
    expect(safeVideoPlayback("https://www.reuters.com/video/clip.mp4")).toEqual(
      {
        type: "file",
        src: "https://www.reuters.com/video/clip.mp4",
      },
    );
    expect(
      safeEmbedUrl("https://www.tiktok.com/@bbcnews/video/1234567890123456789"),
    ).toBe("https://www.tiktok.com/embed/v2/1234567890123456789");
    expect(safeEmbedUrl("https://www.instagram.com/reel/AbCdEfGhIjK/")).toBe(
      "https://www.instagram.com/reel/AbCdEfGhIjK/embed/",
    );
    expect(
      safeEmbedUrl("https://x.com/Reuters/status/1234567890123456789"),
    ).toBe(
      "https://platform.twitter.com/embed/Tweet.html?dnt=true&id=1234567890123456789",
    );
  });
});

describe("social feeds", () => {
  it("classifies platform urls and pages items by 25", () => {
    expect(
      socialPlatformFromUrl("https://www.youtube.com/watch?v=abcdefghijk"),
    ).toBe("youtube");
    expect(
      socialPlatformFromUrl("https://www.tiktok.com/@bbcnews/video/1"),
    ).toBe("tiktok");
    expect(socialPlatformFromUrl("https://www.instagram.com/p/abc/")).toBe(
      "instagram",
    );
    expect(socialPlatformFromUrl("https://x.com/BBCWorld/status/1")).toBe("x");
    expect(
      isSocialSource({
        id: "x-bbcworld",
        domain: "x.com",
        rss_url: "https://rsshub.app/twitter/user/BBCWorld",
      }),
    ).toBe(true);
    expect(
      pageSlice(
        Array.from({ length: 60 }, (_, i) => i + 1),
        1,
      ),
    ).toHaveLength(25);
    expect(
      pageSlice(
        Array.from({ length: 60 }, (_, i) => i + 1),
        3,
      )[0],
    ).toBe(51);
  });

  it("keeps social platform urls out of the tech desk", () => {
    expect(
      passesAdminNewsFilter(
        "Watch: briefing from the newsroom",
        "",
        "https://www.youtube.com/watch?v=abcdefghijk",
        "all",
        "",
        "youtube-bbc-news",
      ),
    ).toBe(false);
  });
});

describe("allowed images", () => {
  it("accepts allowlisted publisher CDNs only", () => {
    expect(imageAllowed("https://ichef.bbci.co.uk/news/800/x.jpg")).toBe(true);
    expect(imageAllowed("https://cdn.cnn.com/cnnnext/dam/x.jpg")).toBe(true);
    expect(
      imageAllowed("https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg"),
    ).toBe(true);
    expect(imageAllowed("https://evil.example/x.jpg")).toBe(false);
  });
});

describe("story clustering and breaking score", () => {
  it("creates a story then attaches a duplicate", () => {
    const first = clusterArticle({
      title: "NATO agrees new air defence plan",
      description: "Allies meet in Brussels",
      sourceUrl: "https://www.bbc.co.uk/news/1",
      canonicalUrl: "https://www.bbc.co.uk/news/1",
      externalId: "1",
      provider: "rss",
      publishedAt: new Date().toISOString(),
      category: "World",
      trustScore: 0.95,
      existing: [],
      stories: [],
    });
    expect(first.created).toBe(true);
    const second = clusterArticle({
      title: "NATO agrees new air defence plan",
      description: "Follow-up",
      sourceUrl: "https://www.reuters.com/world/2",
      canonicalUrl: "https://www.reuters.com/world/2",
      externalId: "2",
      provider: "rss",
      publishedAt: new Date().toISOString(),
      category: "World",
      trustScore: 0.95,
      existing: [
        {
          id: "a",
          title: first.story.headline,
          canonical_url: "https://www.bbc.co.uk/news/1",
          source_url: "https://www.bbc.co.uk/news/1",
          external_id: "1",
          provider: "rss",
          published_at: new Date().toISOString(),
          duplicate_group_id: first.story.id,
        },
      ],
      stories: [first.story],
    });
    expect(second.created).toBe(false);
    expect(second.story.source_count).toBeGreaterThan(1);
  });

  it("does not mark a single obscure item as breaking", () => {
    const score = breakingScore({
      freshness: 0.4,
      independentSources: 1,
      trustScore: 0.2,
      recentInGroup: 1,
    });
    expect(score).toBeLessThan(0.5);
    expect(isBreakingStory(score)).toBe(false);
  });

  it("marks multi-source velocity as breaking", () => {
    const score = breakingScore({
      freshness: 0.95,
      independentSources: 5,
      trustScore: 0.95,
      recentInGroup: 5,
      topicWeight: 0.8,
    });
    expect(isBreakingStory(score)).toBe(true);
  });
});

describe("retry and AI fallback", () => {
  it("retries then succeeds", async () => {
    let n = 0;
    const value = await withBackoff(async () => {
      n += 1;
      if (n < 2) throw new Error("fail");
      return "ok";
    }, 3);
    expect(value).toBe("ok");
    expect(n).toBe(2);
  });

  it("opens a circuit after repeated failures", () => {
    expect(circuitOpen(5, new Date().toISOString())).toBe(true);
    expect(circuitOpen(1, new Date().toISOString())).toBe(false);
  });

  it("uses rules when AI is disabled", async () => {
    expect(getAIProvider().id).toBe("rules");
    const result = await ruleBasedProvider.classify({
      title: "UK parliament votes on defence treaty",
      description: "Westminster",
    });
    expect(result.category).toBe("Politics");
    expect(result.entities).toContain("UK");
  });
});
