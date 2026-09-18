import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ampHtmlHref,
  articleBodyFromJsonLd,
  clearExtractCache,
  extractArticle,
  EXTRACT_BLOCKED_REASON,
  EXTRACT_PAYWALL_REASON,
  stripBoilerplate,
} from "@/lib/news-intake/extract";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  clearExtractCache();
  vi.unstubAllGlobals();
});

function page(body: string, extra = "") {
  return `<!doctype html><html><head><title>NATO agrees new air defence plan</title></head><body><article><h1>NATO agrees new air defence plan</h1>${body}</article>${extra}</body></html>`;
}

function mockHtml(html: string, status = 200) {
  globalThis.fetch = (async () =>
    new Response(html, {
      status,
      headers: { "content-type": "text/html; charset=utf-8" },
    })) as typeof fetch;
}

describe("article extract helpers", () => {
  it("strips scripts so oversized CNN-style pages can be parsed", () => {
    const html = `article${"<script>x</script>".repeat(3)}${"a".repeat(100)}`;
    const stripped = stripBoilerplate(
      `<html><body><p>Hello</p><script>${"x".repeat(1000)}</script></body></html>`,
    );
    expect(stripped).toContain("Hello");
    expect(stripped).not.toContain("script");
    expect(html.length).toBeGreaterThan(100);
  });

  it("reads amphtml and json-ld article bodies", () => {
    expect(
      ampHtmlHref(
        `<link rel="amphtml" href="https://www.bbc.co.uk/news/articles/abc.amp">`,
      ),
    ).toBe("https://www.bbc.co.uk/news/articles/abc.amp");
    expect(
      articleBodyFromJsonLd(
        `<script type="application/ld+json">${JSON.stringify({
          "@type": "NewsArticle",
          articleBody:
            "The Federal Reserve left interest rates unchanged as inflation stays high.",
        })}</script>`,
      ),
    ).toContain("Federal Reserve");
  });
});

describe("extractArticle", () => {
  it("does not reject a public article because the page also has a huge script", async () => {
    const paras = Array.from(
      { length: 8 },
      () =>
        "<p>Allies in Brussels agreed a new air defence plan for NATO members facing missiles and drones.</p>",
    ).join("");
    mockHtml(page(paras, `<script>${"a".repeat(2_500_000)}</script>`));
    const article = await extractArticle(
      "https://www.bbc.co.uk/news/articles/abc",
    );
    expect(article.paragraphs.join(" ")).toMatch(/air defence/i);
    expect(article.paragraphs.join(" ").length).toBeGreaterThan(220);
  });

  it("keeps a short public video caption", async () => {
    mockHtml(
      page(
        `<p>Israeli strikes in Gaza kill two, including a police chief, according to local officials on Thursday.</p><iframe src="https://www.youtube.com/embed/abcdefghijk"></iframe>`,
      ),
    );
    const article = await extractArticle(
      "https://www.aljazeera.com/video/newsfeed/gaza",
    );
    expect(article.paragraphs.join(" ")).toMatch(/Gaza/i);
    expect(article.videoUrl).toContain("abcdefghijk");
  });

  it("uses JSON-LD when the visible page is an empty app shell", async () => {
    const body =
      "The Federal Reserve left interest rates unchanged as inflation stays high across the United States economy. ".repeat(
        8,
      );
    mockHtml(
      `<html><head><script type="application/ld+json">${JSON.stringify({
        "@type": "NewsArticle",
        headline: "Fed holds rates as inflation stays high",
        articleBody: body,
      })}</script></head><body><div id="app"></div></body></html>`,
    );
    const article = await extractArticle(
      "https://www.npr.org/2026/08/14/fed-rates",
    );
    expect(article.paragraphs.join(" ")).toMatch(/Federal Reserve/i);
  });

  it("explains paywalls and bot blocks instead of a generic failure", async () => {
    await expect(
      extractArticle("https://www.ft.com/content/abc"),
    ).rejects.toThrow(EXTRACT_PAYWALL_REASON);
    mockHtml("denied", 403);
    await expect(
      extractArticle("https://news.sky.com/story/abc"),
    ).rejects.toThrow(EXTRACT_BLOCKED_REASON);
  });
});
