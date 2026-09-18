import { NextRequest, NextResponse } from "next/server";
import { isCronAuthorized } from "@/lib/news/ingestion/auth";
import { ingestDueProviders } from "@/lib/news/ingestion/run";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * The API providers, on their own minute.
 *
 * This used to be the second half of /api/cron/news/ingest, and sharing a
 * 60-second function with the registry feeds went the way sharing always goes
 * here: the first leg took what it needed and the second got whatever was
 * left. Sized so the feeds fitted, the providers were skipped on every run and
 * never ingested at all. Sized so both fitted, the run came in at 52 seconds
 * of the 60 available and timed out whenever anything was slower than usual.
 *
 * Three jobs, three endpoints, a full ceiling each: feeds here's neighbour,
 * providers here, pages in /enrich. The same split that made enrichment work
 * at all when it was starved inside ingest.
 */
export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const startedAt = Date.now();
  try {
    const results = await ingestDueProviders(false);
    return NextResponse.json({ results, elapsedMs: Date.now() - startedAt });
  } catch (err) {
    console.error("[cron/news] providers:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Providers failed" },
      { status: 500 },
    );
  }
}
