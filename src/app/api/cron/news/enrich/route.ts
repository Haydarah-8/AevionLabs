import { NextRequest, NextResponse } from "next/server";
import { isCronAuthorized } from "@/lib/news/ingestion/auth";
import { countUnenriched, enrichArticles } from "@/lib/news/enrich";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Reading article pages, on its own schedule.
 *
 * This was first bolted onto the ingest route with whatever time was left of
 * its 60s ceiling. In practice there was never any: a single ingest of ~120
 * feed items runs close to the whole minute, so the budget arithmetic resolved
 * to zero on every run and not one page was ever read by the cron. The two
 * jobs want the same scarce second, so they get separate endpoints instead of
 * competing inside one.
 *
 * A run takes whatever the queue offers, up to its batch, and stops on the
 * budget rather than being killed mid-write.
 */
const BATCH = 200;
/**
 * Deliberately well under the 60s ceiling, because the budget only stops work
 * from *starting*.
 *
 * A page read already in flight carries on: a 20s fetch, an 800ms pause and a
 * 20s retry can all begin at 44.9s and finish long after. Measured on
 * production at 45s, the run returned in 59.0s — one second of headroom, which
 * is another way of saying it was going to 504.
 */
const BUDGET_MS = 30_000;

export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const startedAt = Date.now();
  try {
    const queued = await countUnenriched();
    const summary = await enrichArticles({
      limit: BATCH,
      budgetMs: BUDGET_MS,
    });
    return NextResponse.json({
      queuedBefore: queued,
      attempted: summary.attempted,
      videosFound: summary.videosFound,
      textSaved: summary.textSaved,
      unavailable: summary.unavailable,
      retried: summary.retriedRows,
      recovered: summary.recovered,
      firecrawl: summary.firecrawlReady
        ? { used: summary.firecrawlUsed }
        : "not configured",
      remaining: summary.remaining,
      elapsedMs: Date.now() - startedAt,
    });
  } catch (err) {
    console.error("[cron/news] enrich:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Enrich failed" },
      { status: 500 },
    );
  }
}
