import { NextRequest, NextResponse } from "next/server";
import { isCronAuthorized } from "@/lib/news/ingestion/auth";
import { ingestRegistryRss } from "@/lib/news/ingestion/registry";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Feeds only. Reading article pages is /api/cron/news/enrich.
 *
 * They were one endpoint at first, enrichment taking whatever time ingest left
 * over. There was never any: ingesting ~120 items runs close to the full
 * minute, so the leftover budget was always zero and no page was ever read.
 *
 * Splitting them was not enough on its own. The first authorised call to this
 * route on production returned 504: two unbounded jobs — the registry feeds,
 * then the due providers — inside a 60-second function, with nothing watching
 * the clock. A default of fifteen feeds measured about 85 seconds locally.
 *
 * So the run is bounded, and being bounded costs little: `dueSources` rotates
 * through the registry and this fires every half hour, so three feeds a run is
 * about 140 feed reads a day across 46 feeds — each feed read roughly every
 * eight hours, and the interactive Scrape button covers anything urgent.
 *
 * Three rather than five because five measured 19s, 43s and 54s on three
 * consecutive production runs. The spread is the point: a feed that times out
 * is retried three times at nine seconds each, and the database work afterwards
 * scales with however many items arrived. A ceiling that is only met on a good
 * run is not a ceiling.
 */
const FEEDS_PER_RUN = 3;

/**
 * When to stop starting new work.
 *
 * Below this, the providers leg is skipped rather than begun and killed
 * mid-write — a 504 loses the response, and with it any record of what the
 * run had already managed.
 *
 * The API providers used to share this function and now have their own at
 * /api/cron/news/providers. Sharing failed twice over: sized for the feeds the
 * providers were skipped on every run, and sized for both the run came in at
 * 52 seconds of 60 and timed out whenever anything ran slow.
 */

export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const startedAt = Date.now();
  try {
    let registry:
      | Awaited<ReturnType<typeof ingestRegistryRss>>
      | {
          error: string;
        };
    try {
      registry = await ingestRegistryRss({
        limit: FEEDS_PER_RUN,
        // The enrich cron reads pages. This one reads feeds.
        videoLookups: 0,
      });
    } catch (err) {
      console.error("[cron/news] registry:", err);
      registry = {
        error: err instanceof Error ? err.message : "Registry scrape failed",
      };
    }

    return NextResponse.json({
      registry,
      elapsedMs: Date.now() - startedAt,
    });
  } catch (err) {
    console.error("[cron/news] ingest:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Ingest failed" },
      { status: 500 },
    );
  }
}
