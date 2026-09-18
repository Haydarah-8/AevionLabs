import { ExtractFailure } from "@/lib/news-intake/failure";

/**
 * The last resort, for pages that refuse us outright.
 *
 * Firecrawl runs a real browser behind rotating proxies, so it gets HTML from
 * hosts that answer our own request with a 403. That is the only thing it is
 * used for here. It is deliberately *not* the main pipeline:
 *
 * - Our own fetch reads most pages perfectly well and costs nothing. Routing
 *   ~345 articles a day through a paid API to fix the ~6% it cannot read would
 *   be about 10,000 credits a month to avoid roughly 600 failures.
 * - Firecrawl returns markdown by default, which would throw away the figures,
 *   headings, quotes, lists and video that the extractor works to preserve. So
 *   we ask for raw HTML and run it through the same parser as everything else.
 *   The output of a Firecrawl read is indistinguishable from a normal one.
 *
 * It is also not used for paywalls or for pages that are simply gone. A
 * subscription wall is not ours to get past, and no proxy resurrects a 404.
 *
 * A note on what this is buying, because it changed: most of what used to look
 * like deliberate blocking was self-inflicted — the extractor claimed to be
 * Chrome and got treated as a liar. Identifying honestly recovered 15 of 30
 * previously-blocked pages for free. What is left is publishers who mean it,
 * and this is the only way past them.
 */

const ENDPOINT = "https://api.firecrawl.dev/v2/scrape";

/** Firecrawl runs a browser; it is slower than a plain fetch and must be. */
const TIMEOUT_MS = 45_000;

/**
 * How many pages one enrichment run may send to Firecrawl.
 *
 * This is a spending limit, not a tuning knob. The cron fires 48 times a day,
 * so a cap of 2 is up to 96 scrapes a day and a cap of 10 is 480 — enough to
 * clear a free grant inside a week. Raise it deliberately, against the usage
 * figure on the Firecrawl dashboard, not because a backlog looks slow.
 */
const DEFAULT_MAX_PER_RUN = 2;

let budget = 0;
let used = 0;

/** Whether a key is configured at all. Without one this module does nothing. */
export function hasFirecrawl(): boolean {
  return Boolean(process.env.FIRECRAWL_API_KEY?.startsWith("fc-"));
}

/**
 * Open the allowance for one run. Called once per enrichment pass, so a stuck
 * loop cannot spend the month's credits in an afternoon.
 */
export function openFirecrawlBudget(max?: number): void {
  const configured = Number(process.env.FIRECRAWL_MAX_PER_RUN);
  budget = Math.max(
    0,
    max ?? (Number.isFinite(configured) ? configured : DEFAULT_MAX_PER_RUN),
  );
  used = 0;
}

/** How many scrapes this run has spent. Reported by the cron route. */
export function firecrawlUsed(): number {
  return used;
}

export function firecrawlBudgetLeft(): number {
  return Math.max(0, budget - used);
}

export type FirecrawlPage = { html: string; finalUrl: string };

/**
 * Fetch one page through Firecrawl.
 *
 * Returns `undefined` when it is not configured or the run's allowance is
 * spent — both are ordinary conditions, not errors, and the caller simply
 * keeps the failure it already had. A genuine Firecrawl failure throws, so it
 * is classified like any other.
 */
export async function firecrawlPage(
  url: string,
): Promise<FirecrawlPage | undefined> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key || !hasFirecrawl()) return undefined;
  if (firecrawlBudgetLeft() <= 0) return undefined;

  used += 1;

  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        // Raw HTML, not markdown: the extractor needs the document to find
        // figures, iframes and captions. `onlyMainContent` is off for the same
        // reason — its idea of the main content drops the media around it.
        formats: ["rawHtml"],
        onlyMainContent: false,
        blockAds: true,
        proxy: "auto",
        timeout: TIMEOUT_MS - 5_000,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    const name = err instanceof Error ? err.name : "";
    throw new ExtractFailure(
      name === "TimeoutError"
        ? "Firecrawl took too long to answer."
        : "Could not reach Firecrawl.",
      "transient",
    );
  }

  if (res.status === 401 || res.status === 403) {
    // Our key, not the publisher. Worth saying plainly rather than recording
    // it against the article as though the outlet had refused us.
    throw new ExtractFailure(
      "Firecrawl rejected the API key.",
      "unreadable",
      res.status,
    );
  }
  if (res.status === 402 || res.status === 429) {
    throw new ExtractFailure(
      res.status === 402
        ? "Firecrawl credits are exhausted."
        : "Firecrawl rate limit reached.",
      "transient",
      res.status,
    );
  }
  if (!res.ok) {
    throw new ExtractFailure(
      `Firecrawl returned ${res.status}.`,
      "transient",
      res.status,
    );
  }

  const payload = (await res.json()) as {
    success?: boolean;
    data?: {
      rawHtml?: string | null;
      html?: string | null;
      metadata?: { url?: string; sourceURL?: string; statusCode?: number };
    };
    error?: string;
  };

  const html = payload.data?.rawHtml || payload.data?.html || "";
  if (!payload.success || !html) {
    throw new ExtractFailure(
      payload.error || "Firecrawl returned no page.",
      "unreadable",
    );
  }

  const status = payload.data?.metadata?.statusCode;
  // Firecrawl reports success for its own request even when the publisher
  // answered it with a 404. Believing that would store an error page as an
  // article.
  if (status && status >= 400) {
    throw new ExtractFailure(
      `Publisher returned ${status} to Firecrawl.`,
      status === 404 || status === 410 ? "gone" : "blocked",
      status,
    );
  }

  return {
    html,
    finalUrl: payload.data?.metadata?.url || payload.data?.metadata?.sourceURL || url,
  };
}
