import * as cheerio from "cheerio";
import { circuitOpen, throttle, withBackoff } from "./throttle";
import { assertSafeFetchUrl } from "./ssrf";
import type { NewsSourceRow } from "../../../src/lib/news/sources/registry";

const USER_AGENT = "ElijahWGroup-NewsWorker/1.0 (+https://elijahwgroup.com)";

export type PageFetch = {
  html: string;
  finalUrl: string;
  status: number;
  strategy: "http" | "cheerio" | "playwright";
};

function looksThin(html: string) {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ");
  return text.replace(/\s+/g, " ").trim().length < 400;
}

export async function fetchHttp(
  url: string,
  sources: Array<Pick<NewsSourceRow, "domain" | "enabled">>,
  timeoutMs = 12000,
): Promise<PageFetch> {
  assertSafeFetchUrl(url, sources);
  const res = await fetch(url, {
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent": USER_AGENT,
    },
    signal: AbortSignal.timeout(timeoutMs),
    redirect: "follow",
  });
  const html = await res.text();
  return {
    html,
    finalUrl: res.url || url,
    status: res.status,
    strategy: "http",
  };
}

export async function fetchCheerio(
  html: string,
  finalUrl: string,
): Promise<PageFetch> {
  const $ = cheerio.load(html);
  $("script, style, noscript").remove();
  return { html: $.html() || html, finalUrl, status: 200, strategy: "cheerio" };
}

export async function fetchPlaywright(
  url: string,
  timeoutMs = 20000,
): Promise<PageFetch> {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const response = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: timeoutMs,
    });
    const html = await page.content();
    return {
      html,
      finalUrl: page.url(),
      status: response?.status() || 200,
      strategy: "playwright",
    };
  } finally {
    await browser.close();
  }
}

export async function fetchPage(
  url: string,
  source: Pick<
    NewsSourceRow,
    | "domain"
    | "enabled"
    | "requires_browser"
    | "timeout_ms"
    | "max_requests_per_minute"
    | "retry_count"
    | "failure_count"
    | "last_failure_at"
  >,
  sources: Array<Pick<NewsSourceRow, "domain" | "enabled">>,
): Promise<PageFetch> {
  if (circuitOpen(source.failure_count, source.last_failure_at)) {
    throw new Error("circuit open");
  }
  await throttle(source.domain, source.max_requests_per_minute || 6);
  if (source.requires_browser) {
    return withBackoff(
      () => fetchPlaywright(url, source.timeout_ms),
      source.retry_count,
    );
  }
  const page = await withBackoff(
    () => fetchHttp(url, sources, source.timeout_ms),
    source.retry_count,
  );
  if (looksThin(page.html)) {
    try {
      return await fetchPlaywright(url, source.timeout_ms);
    } catch {
      return fetchCheerio(page.html, page.finalUrl);
    }
  }
  return fetchCheerio(page.html, page.finalUrl);
}

export async function crawlUrlsWithCrawlee(
  urls: string[],
  perMinute: number,
): Promise<Map<string, string>> {
  const { CheerioCrawler, Configuration } = await import("crawlee");
  const pages = new Map<string, string>();
  const crawler = new CheerioCrawler(
    {
      maxRequestsPerMinute: perMinute,
      maxConcurrency: 2,
      requestHandlerTimeoutSecs: 20,
      async requestHandler({ request, body }) {
        pages.set(request.loadedUrl || request.url, String(body));
      },
    },
    new Configuration({ persistStorage: false }),
  );
  await crawler.run(urls);
  return pages;
}
