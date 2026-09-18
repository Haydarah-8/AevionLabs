import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearExtractCache, extractArticle } from "@/lib/news-intake/extract";
import { openFirecrawlBudget } from "@/lib/news-intake/firecrawl";

/**
 * Where the fallback is allowed to fire.
 *
 * The whole cost argument rests on this being narrow: a refusal, and nothing
 * else. A 404 or a timeout reaching Firecrawl would quietly turn a targeted
 * fallback into a paid pipeline.
 */

const URL = "https://axios.com/2026/09/a-blocked-story/";
const FIRECRAWL = "https://api.firecrawl.dev/v2/scrape";

const BODY = `
<html><head><title>The story they would not give us</title></head><body>
<article>
<p>Lawmakers returned to a budget request that had grown by a third since the
spring, and to a continuing resolution with eleven days left on it.</p>
<p>The committee's staff had spent August reconciling two versions of the same
supplemental, one of which had never been formally introduced.</p>
<p>By the time the chair gavelled in, three of the four subcommittees had
filed their marks, and the fourth had asked for an extension until Friday.</p>
</article></body></html>`;

const original = process.env.FIRECRAWL_API_KEY;

beforeEach(() => {
  clearExtractCache();
  process.env.FIRECRAWL_API_KEY = "fc-test-key-not-real";
  openFirecrawlBudget(3);
});

afterEach(() => {
  vi.restoreAllMocks();
  clearExtractCache();
  if (original === undefined) delete process.env.FIRECRAWL_API_KEY;
  else process.env.FIRECRAWL_API_KEY = original;
});

/** Publisher answers `status`; Firecrawl, if asked, hands back a real page. */
function stubNetwork(status: number) {
  const calls: string[] = [];
  vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const target = typeof input === "string" ? input : String(input);
    calls.push(target);
    if (target === FIRECRAWL) {
      return new Response(
        JSON.stringify({
          success: true,
          data: { rawHtml: BODY, metadata: { url: URL, statusCode: 200 } },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }
    return new Response(status === 200 ? BODY : "refused", {
      status,
      headers: { "content-type": "text/html" },
    });
  });
  return calls;
}

describe("when the fallback is reached", () => {
  it("rescues a page the publisher refuses", async () => {
    const calls = stubNetwork(403);
    const article = await extractArticle(URL);

    expect(calls).toContain(FIRECRAWL);
    expect(article.title).toContain("would not give us");
    expect(article.paragraphs.join(" ")).toContain("continuing resolution");
  });

  it("is not spent on an article that no longer exists", async () => {
    const calls = stubNetwork(404);
    await expect(extractArticle(URL)).rejects.toThrow(/404/);
    expect(calls).not.toContain(FIRECRAWL);
  });

  it("is not spent on a publisher having a bad minute", async () => {
    const calls = stubNetwork(503);
    await expect(extractArticle(URL)).rejects.toThrow(/503/);
    expect(calls).not.toContain(FIRECRAWL);
  });

  it("is not spent when our own fetch works", async () => {
    const calls = stubNetwork(200);
    const article = await extractArticle(URL);
    expect(article.paragraphs.length).toBeGreaterThan(0);
    expect(calls).not.toContain(FIRECRAWL);
  });

  it("still records the block when the allowance is gone", async () => {
    openFirecrawlBudget(0);
    const calls = stubNetwork(403);
    await expect(extractArticle(URL)).rejects.toThrow();
    expect(calls).not.toContain(FIRECRAWL);
  });
});
