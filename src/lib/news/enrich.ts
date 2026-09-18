import { getSupabaseAdmin, hasSupabaseAdmin } from "@/lib/supabase-admin";
import { extractArticleCached } from "@/lib/news-intake/extract";
import {
  failureKind,
  isRetryable,
  type FailureKind,
} from "@/lib/news-intake/failure";
import {
  firecrawlBudgetLeft,
  firecrawlUsed,
  hasFirecrawl,
  openFirecrawlBudget,
} from "@/lib/news-intake/firecrawl";
import { mapLimit } from "@/lib/news-intake/pipeline";
import { isPaywalledUrl } from "@/lib/news-intake/paywalls";

/**
 * Filling in the video and the text that the feeds never carry.
 *
 * An RSS item gives a headline, a link and a snippet. A playable video lives
 * in the article page — behind a Brightcove player id, a JSON-LD `contentUrl`
 * or an HLS manifest — so a story ingested from a feed arrives with
 * `video_url` empty even when the page is built around a video. Until now the
 * page was only ever read when somebody opened that story on the desk, which
 * is why most rows had neither text nor video.
 *
 * This walks the backlog instead: it reads the pages we have never read, and
 * writes back whatever it finds.
 *
 * `video_type` records what we learned, so a row is never re-fetched blindly:
 *
 * - `url`         — a playable source was found, and it is in `video_url`
 * - `none`        — the page was read in full and genuinely has no video
 * - `unavailable` — the read failed on something that may pass later
 * - `blocked`     — the publisher refused us (401/403/451)
 * - `gone`        — 404/410; the article no longer exists
 * - `paywalled`   — a subscription wall
 * - `null`        — never attempted; this is the queue
 *
 * Those last four were one value until we measured them. A sample of 45 stored
 * failures re-checked by hand came back 20 readable, 16 blocked, 6 gone and 1
 * paywalled: nearly half of what we had written off was simply a bad moment.
 * Splitting the states is what lets `retryUnavailable` go back for the 20
 * without also hammering the 22 that will never answer differently.
 */

/** A page read but carrying no video. A finished answer. */
export const VIDEO_NONE = "none";
/** A page we could not read this time. Worth another try later. */
export const VIDEO_UNAVAILABLE = "unavailable";
/** A page with a playable source in video_url. */
export const VIDEO_FOUND = "url";

/** Terminal failures. Recorded so the queue never picks them up again. */
export const VIDEO_BLOCKED = "blocked";
export const VIDEO_GONE = "gone";
export const VIDEO_PAYWALLED = "paywalled";
/** Fetched fine; there was simply no article on the page. */
export const VIDEO_UNREADABLE = "unreadable";

/**
 * How a failure kind is written down.
 *
 * Only `transient` maps to `unavailable`, and only `unavailable` is ever
 * picked up again — so this table is what decides which failures cost a second
 * fetch. Keep it that way: widening it is how a retry queue turns into a
 * loop that re-reads the same dead links every half hour.
 */
const STATE_FOR_KIND: Record<FailureKind, string> = {
  transient: VIDEO_UNAVAILABLE,
  blocked: VIDEO_BLOCKED,
  gone: VIDEO_GONE,
  paywalled: VIDEO_PAYWALLED,
  unreadable: VIDEO_UNREADABLE,
};

/**
 * A page that failed once is not asked again for this long.
 *
 * Long enough that a retry is a genuinely new attempt rather than the same
 * bad minute; short enough that a story is still worth having when it lands.
 */
const RETRY_AFTER_MS = 6 * 60 * 60 * 1000;

/** Pause between the two attempts inside a single run. */
const RETRY_BACKOFF_MS = 800;

export type EnrichRow = {
  id: string;
  source_url: string;
  title: string;
};

export type EnrichOutcome = {
  url: string;
  status: string;
  videoUrl?: string;
  chars?: number;
  reason?: string;
  /** True when this row had failed before and was being given another go. */
  retried?: boolean;
};

export type EnrichSummary = {
  attempted: number;
  videosFound: number;
  textSaved: number;
  unavailable: number;
  /** Rows that had previously failed and were re-read on this run. */
  retriedRows: number;
  /** How many of those retries came back with an article. */
  recovered: number;
  /** Pages this run sent to Firecrawl, and whether it was configured at all. */
  firecrawlUsed: number;
  firecrawlReady: boolean;
  /** True when the queue still holds rows this run did not reach. */
  more: boolean;
  remaining: number;
  outcomes: EnrichOutcome[];
};

export const EMPTY_ENRICH: EnrichSummary = {
  attempted: 0,
  videosFound: 0,
  textSaved: 0,
  unavailable: 0,
  retriedRows: 0,
  recovered: 0,
  firecrawlUsed: 0,
  firecrawlReady: false,
  more: false,
  remaining: 0,
  outcomes: [],
};

/** How many rows are still waiting to have their page read. */
export async function countUnenriched(): Promise<number> {
  if (!hasSupabaseAdmin()) return 0;
  const { count, error } = await getSupabaseAdmin()
    .from("news_articles")
    .select("id", { count: "exact", head: true })
    .is("video_type", null)
    .not("source_url", "is", null);
  if (error) return 0;
  return count ?? 0;
}

/**
 * The next pages to read, newest first.
 *
 * Recent stories are the ones the desk actually opens, so they earn the fetch
 * budget ahead of a backlog that nobody is looking at.
 */
export async function listUnenriched(limit: number): Promise<EnrichRow[]> {
  if (!hasSupabaseAdmin()) return [];
  const { data, error } = await getSupabaseAdmin()
    .from("news_articles")
    .select("id, source_url, title")
    .is("video_type", null)
    .not("source_url", "is", null)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[news/enrich] listUnenriched:", error.message);
    return [];
  }
  return (data ?? []) as EnrichRow[];
}

/**
 * Rows that failed on a transient error and have sat long enough to be worth
 * another fetch. Oldest failure first, so nothing waits forever behind a
 * steady drip of new misses.
 */
export async function listRetryable(limit: number): Promise<EnrichRow[]> {
  return listFailed(VIDEO_UNAVAILABLE, limit);
}

/**
 * Rows a publisher refused, for the one tool that can do anything about it.
 *
 * `blocked` is otherwise terminal, and it should be: asking the same host the
 * same question from the same address gets the same 403 forever. But Firecrawl
 * asks from somewhere else, so with it configured these stop being a dead end.
 *
 * The count requested is the Firecrawl allowance and not one row more. That
 * keeps the spend identical to before — this changes *which* pages the two
 * scrapes are spent on, from whichever block happened to turn up first to the
 * backlog that has been waiting, rather than raising the bill.
 */
export async function listBlocked(limit: number): Promise<EnrichRow[]> {
  if (!hasFirecrawl()) return [];
  return listFailed(VIDEO_BLOCKED, limit);
}

async function listFailed(state: string, limit: number): Promise<EnrichRow[]> {
  if (!hasSupabaseAdmin() || limit <= 0) return [];
  const cutoff = new Date(Date.now() - RETRY_AFTER_MS).toISOString();
  const { data, error } = await getSupabaseAdmin()
    .from("news_articles")
    .select("id, source_url, title")
    .eq("video_type", state)
    .not("source_url", "is", null)
    .lt("updated_at", cutoff)
    .order("updated_at", { ascending: true })
    .limit(limit);
  if (error) {
    console.error(`[news/enrich] listFailed(${state}):`, error.message);
    return [];
  }
  return (data ?? []) as EnrichRow[];
}

/** Everything we learned about one page, written back in a single update. */
async function saveEnrichment(
  id: string,
  patch: {
    video_url?: string | null;
    video_type: string;
    content?: string;
    excerpt?: string;
    image_url?: string;
    author?: string;
  },
): Promise<boolean> {
  const { error } = await getSupabaseAdmin()
    .from("news_articles")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) console.error("[news/enrich] save:", error.message);
  return !error;
}

/**
 * Read pages from the queue and store their video and text.
 *
 * `budgetMs` exists because the cron route runs under a 60s ceiling: the run
 * stops cleanly when the budget is spent and reports what is left, rather than
 * being killed mid-write and losing the lot.
 */
export async function enrichArticles(options?: {
  limit?: number;
  budgetMs?: number;
  concurrency?: number;
  /**
   * Share of the batch kept for rows that failed before. The queue of pages
   * never read still goes first — a story nobody has looked at is worth more
   * than one we already missed — but leaving no room at all is how the 44%
   * that were only unlucky stayed lost.
   */
  retryShare?: number;
  /** Pages this run may send to Firecrawl. See lib/news-intake/firecrawl. */
  firecrawlMax?: number;
}): Promise<EnrichSummary> {
  if (!hasSupabaseAdmin()) return EMPTY_ENRICH;

  const limit = Math.min(Math.max(options?.limit ?? 40, 1), 200);
  const budgetMs = options?.budgetMs ?? 30_000;
  const concurrency = Math.min(Math.max(options?.concurrency ?? 4, 1), 8);
  const retryShare = Math.min(Math.max(options?.retryShare ?? 0.3, 0), 1);
  const startedAt = Date.now();

  // One allowance per run. Without this a paid fallback is metered by how
  // often the cron happens to fire, which is not a budget.
  openFirecrawlBudget(options?.firecrawlMax);

  const fresh = await listUnenriched(limit);
  // Whatever the fresh queue does not use goes to retries, so a quiet news
  // hour spends its whole budget clearing the backlog instead of idling.
  const retrySlots = Math.max(
    Math.round(limit * retryShare),
    limit - fresh.length,
  );
  const retries = await listRetryable(Math.min(retrySlots, limit));
  // Exactly as many refused pages as Firecrawl can pay for, and none when it
  // is not configured — an unaided retry of a 403 is a fetch spent to learn
  // what we already knew.
  const blocked = await listBlocked(firecrawlBudgetLeft());
  const retryIds = new Set([...retries, ...blocked].map((row) => row.id));
  const queue = [...fresh, ...retries, ...blocked].slice(
    0,
    limit + blocked.length,
  );

  if (!queue.length) {
    return {
      ...EMPTY_ENRICH,
      firecrawlReady: hasFirecrawl(),
      remaining: await countUnenriched(),
    };
  }

  const outcomes: EnrichOutcome[] = [];

  await mapLimit(queue, concurrency, async (row) => {
    if (Date.now() - startedAt > budgetMs) return null;

    const url = row.source_url;
    const retried = retryIds.has(row.id);

    // A paywalled page is a known dead end; spending a fetch on it only to be
    // refused wastes budget that a readable page could have used.
    if (isPaywalledUrl(url)) {
      await saveEnrichment(row.id, { video_type: VIDEO_PAYWALLED });
      outcomes.push({
        url,
        status: VIDEO_PAYWALLED,
        reason: "Paywalled",
        retried,
      });
      return null;
    }

    /**
     * Two attempts, and only for a failure that might answer differently.
     *
     * The second is skipped when the budget is nearly gone: finishing the rest
     * of the queue beats spending the last seconds on one stubborn page.
     */
    let lastError: unknown;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const article = await extractArticleCached(url);
        const content = article.paragraphs.join("\n\n").trim();
        const videoUrl = article.videoUrl?.trim();

        const patch: Parameters<typeof saveEnrichment>[1] = {
          video_type: videoUrl ? VIDEO_FOUND : VIDEO_NONE,
        };
        if (videoUrl) patch.video_url = videoUrl;
        // Below ~120 characters it is a cookie wall or a stub, not an article.
        if (content.length >= 120) patch.content = content;
        if (article.excerpt) patch.excerpt = article.excerpt.slice(0, 800);
        if (article.imageUrl) patch.image_url = article.imageUrl;
        if (article.byline) patch.author = article.byline;

        await saveEnrichment(row.id, patch);
        outcomes.push({
          url,
          status: videoUrl ? VIDEO_FOUND : VIDEO_NONE,
          videoUrl,
          chars: content.length,
          retried,
        });
        return null;
      } catch (err) {
        lastError = err;
        const kind = failureKind(err);
        const timeLeft = budgetMs - (Date.now() - startedAt);
        if (
          attempt === 0 &&
          isRetryable(kind) &&
          timeLeft > RETRY_BACKOFF_MS + 5_000
        ) {
          await new Promise((resolve) =>
            setTimeout(resolve, RETRY_BACKOFF_MS),
          );
          continue;
        }
        break;
      }
    }

    const kind = failureKind(lastError);
    await saveEnrichment(row.id, { video_type: STATE_FOR_KIND[kind] });
    outcomes.push({
      url,
      status: STATE_FOR_KIND[kind],
      reason:
        lastError instanceof Error ? lastError.message : "Extraction failed",
      retried,
    });
    return null;
  });

  const remaining = await countUnenriched();
  const readable = (outcome: EnrichOutcome) =>
    outcome.status === VIDEO_FOUND || outcome.status === VIDEO_NONE;
  return {
    attempted: outcomes.length,
    videosFound: outcomes.filter((o) => o.status === VIDEO_FOUND).length,
    textSaved: outcomes.filter((o) => (o.chars ?? 0) >= 120).length,
    unavailable: outcomes.filter((o) => !readable(o)).length,
    retriedRows: outcomes.filter((o) => o.retried).length,
    recovered: outcomes.filter((o) => o.retried && readable(o)).length,
    firecrawlUsed: firecrawlUsed(),
    firecrawlReady: hasFirecrawl(),
    more: remaining > 0,
    remaining,
    outcomes,
  };
}
