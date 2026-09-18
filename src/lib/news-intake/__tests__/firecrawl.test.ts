import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  firecrawlBudgetLeft,
  firecrawlPage,
  firecrawlUsed,
  hasFirecrawl,
  openFirecrawlBudget,
} from "@/lib/news-intake/firecrawl";

/**
 * Firecrawl costs money per page, so the tests that matter are the ones about
 * restraint: that it stays switched off without a key, that a run cannot spend
 * more than its allowance, and that a publisher's 404 is not stored as an
 * article because Firecrawl's own request succeeded.
 */

const KEY = "fc-test-key-not-real";
const URL = "https://axios.com/2026/09/blocked-story/";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

const original = process.env.FIRECRAWL_API_KEY;

beforeEach(() => {
  delete process.env.FIRECRAWL_MAX_PER_RUN;
});

afterEach(() => {
  vi.restoreAllMocks();
  if (original === undefined) delete process.env.FIRECRAWL_API_KEY;
  else process.env.FIRECRAWL_API_KEY = original;
});

describe("firecrawl fallback", () => {
  it("does nothing at all without a key", async () => {
    delete process.env.FIRECRAWL_API_KEY;
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    openFirecrawlBudget(5);

    expect(hasFirecrawl()).toBe(false);
    await expect(firecrawlPage(URL)).resolves.toBeUndefined();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("ignores a key that is not a Firecrawl key", async () => {
    process.env.FIRECRAWL_API_KEY = "sk-someone-elses-key";
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    openFirecrawlBudget(5);

    expect(hasFirecrawl()).toBe(false);
    await expect(firecrawlPage(URL)).resolves.toBeUndefined();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("spends the run's allowance and then stops", async () => {
    process.env.FIRECRAWL_API_KEY = KEY;
    // A fresh Response per call: a body can only be read once.
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(async () =>
      jsonResponse({
        success: true,
        data: {
          rawHtml: "<html><body><p>Recovered.</p></body></html>",
          metadata: { url: URL, statusCode: 200 },
        },
      }),
    );

    openFirecrawlBudget(2);
    expect(firecrawlBudgetLeft()).toBe(2);

    await expect(firecrawlPage(URL)).resolves.toMatchObject({
      finalUrl: URL,
    });
    await expect(firecrawlPage(URL)).resolves.toBeTruthy();
    // Third call is over the allowance: no request is made at all.
    await expect(firecrawlPage(URL)).resolves.toBeUndefined();

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(firecrawlUsed()).toBe(2);
    expect(firecrawlBudgetLeft()).toBe(0);
  });

  it("takes its allowance from the environment", () => {
    process.env.FIRECRAWL_MAX_PER_RUN = "7";
    openFirecrawlBudget();
    expect(firecrawlBudgetLeft()).toBe(7);
  });

  it("defaults to a small allowance rather than an open tab", () => {
    delete process.env.FIRECRAWL_MAX_PER_RUN;
    openFirecrawlBudget();
    // The cron fires 48 times a day; the default must assume that.
    expect(firecrawlBudgetLeft()).toBeLessThanOrEqual(3);
  });

  it("asks for raw HTML, never markdown", async () => {
    process.env.FIRECRAWL_API_KEY = KEY;
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({
        success: true,
        data: { rawHtml: "<html></html>", metadata: { statusCode: 200 } },
      }),
    );
    openFirecrawlBudget(1);
    await firecrawlPage(URL);

    const body = JSON.parse(
      String((fetchSpy.mock.calls[0][1] as RequestInit).body),
    );
    // Markdown would discard the figures, captions and iframes the extractor
    // exists to preserve.
    expect(body.formats).toEqual(["rawHtml"]);
    expect(body.onlyMainContent).toBe(false);
  });

  it("does not treat a publisher's 404 as a recovered article", async () => {
    process.env.FIRECRAWL_API_KEY = KEY;
    // Firecrawl reports success for its own request; the publisher said 404.
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({
        success: true,
        data: {
          rawHtml: "<html><body>Page not found</body></html>",
          metadata: { url: URL, statusCode: 404 },
        },
      }),
    );
    openFirecrawlBudget(1);
    await expect(firecrawlPage(URL)).rejects.toThrow(/404/);
  });

  it("says plainly when the key is the problem", async () => {
    process.env.FIRECRAWL_API_KEY = KEY;
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ error: "unauthorized" }, 401),
    );
    openFirecrawlBudget(1);
    await expect(firecrawlPage(URL)).rejects.toThrow(/API key/i);
  });

  it("reports exhausted credits as worth trying later, not as our fault", async () => {
    process.env.FIRECRAWL_API_KEY = KEY;
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ error: "payment required" }, 402),
    );
    openFirecrawlBudget(1);
    await expect(firecrawlPage(URL)).rejects.toThrow(/credits/i);
  });
});

describe("the blocked backlog", () => {
  it("is left alone entirely when Firecrawl is not configured", async () => {
    delete process.env.FIRECRAWL_API_KEY;
    const { listBlocked } = await import("@/lib/news/enrich");
    // No key means no way past a 403, so re-reading those rows would spend a
    // fetch to learn what we already knew. It must not even ask the database.
    await expect(listBlocked(50)).resolves.toEqual([]);
  });

  it("asks for no more rows than Firecrawl can pay for", async () => {
    process.env.FIRECRAWL_API_KEY = KEY;
    const { listBlocked } = await import("@/lib/news/enrich");
    // A zero allowance is the same as no allowance: nothing is picked up.
    await expect(listBlocked(0)).resolves.toEqual([]);
  });
});
