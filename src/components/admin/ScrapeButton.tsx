"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Fetch the wire, now.
 *
 * The half-hourly cron is the normal way stories arrive; this is for when the
 * desk wants them before the next tick — a story is breaking, or somebody has
 * just added an outlet and wants to see whether it works.
 *
 * One press does both halves of the job. Reading feeds alone would produce
 * headlines with no article behind them, so the same request also reads the
 * pages, which is where the video and the text actually live.
 *
 * That does not fit in one request. The route's ceiling is 60 seconds and a
 * full pass measured 1m46s, so the button presses a bounded round repeatedly
 * until the wire stops yielding and the read queue is empty. The desk sees one
 * button and one running state; the rounds are ours to worry about.
 *
 * It reports what changed rather than just finishing quietly. "Scraped" tells
 * you a request completed; "18 new, 9 with video" tells you whether it was
 * worth pressing.
 */

/**
 * How many rounds one press may run.
 *
 * Enough to work through the registry twice over at eight feeds a round, and
 * few enough that a press cannot turn into an unattended job. A run that hits
 * the cap has still done real work; the half-hourly cron picks up the rest.
 */
const MAX_ROUNDS = 12;

export type ScrapeReport = {
  created: number;
  updated: number;
  videosFound: number;
  textSaved: number;
  recovered: number;
  remaining: number;
};

/** What the run brought in, for callers that do more than reload. */
export type ScrapePayload = {
  registry?: {
    created?: number;
    updated?: number;
    scrapedAt?: string;
    newItems?: Array<{ url: string }>;
  };
  /** Pages still waiting to be read, whether or not this round read any. */
  queued?: number;
  enriched?: {
    videosFound?: number;
    textSaved?: number;
    recovered?: number;
    remaining?: number;
  } | null;
  error?: string;
};

export function ScrapeButton({
  onDone,
  onPayload,
  disabled,
}: {
  /** Reload the page's own data once new stories have landed. */
  onDone?: () => void | Promise<void>;
  /**
   * The raw result. The newsroom needs it to mark which stories arrived on
   * this press, which is the whole point of its new-versus-already-seen split
   * and cannot be recovered from a reload.
   */
  onPayload?: (payload: ScrapePayload) => void;
  disabled?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [round, setRound] = useState(0);
  const [report, setReport] = useState<ScrapeReport | null>(null);
  const [error, setError] = useState("");
  // A scrape runs for the better part of a minute, which is long enough for
  // the desk to navigate away mid-request. The result is then nobody's.
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const scrape = useCallback(async () => {
    setBusy(true);
    setError("");
    setReport(null);
    setRound(0);

    const total: ScrapeReport = {
      created: 0,
      updated: 0,
      videosFound: 0,
      textSaved: 0,
      recovered: 0,
      remaining: 0,
    };

    try {
      for (let i = 1; i <= MAX_ROUNDS; i += 1) {
        if (!alive.current) return;
        setRound(i);

        const res = await fetch("/api/admin/newsroom", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "scrape" }),
        });
        const payload = (await res
          .json()
          .catch(() => null)) as ScrapePayload | null;
        if (!res.ok) throw new Error(payload?.error || "Scrape failed");

        // The caller is told what arrived even if this button has gone away —
        // the page it belongs to may still be mounted and waiting for it.
        if (payload) onPayload?.(payload);

        const created = payload?.registry?.created ?? 0;
        const updated = payload?.registry?.updated ?? 0;
        total.created += created;
        total.updated += updated;
        total.videosFound += payload?.enriched?.videosFound ?? 0;
        total.textSaved += payload?.enriched?.textSaved ?? 0;
        total.recovered += payload?.enriched?.recovered ?? 0;
        total.remaining = payload?.queued ?? payload?.enriched?.remaining ?? 0;

        if (alive.current) setReport({ ...total });

        // Stop when the wire has nothing further and every page has been read.
        // Both conditions matter: feeds can be quiet while a backlog of pages
        // still waits, and a burst of new stories arrives with its pages
        // already queued.
        if (!created && !updated && !total.remaining) break;
      }
      await onDone?.();
    } catch (err) {
      if (alive.current) {
        setError(err instanceof Error ? err.message : "Scrape failed");
      }
    } finally {
      if (alive.current) {
        setBusy(false);
        setRound(0);
      }
    }
  }, [onDone, onPayload]);

  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <button
        type="button"
        onClick={() => void scrape()}
        disabled={busy || disabled}
        title="Read every feed now, and the pages behind the new stories"
        className="rounded-lg border border-[#ffffff]/45 bg-[#ffffff]/10 px-3.5 py-1.5 text-[0.85rem] text-[#ffffff] transition-colors hover:bg-[#ffffff] hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? "Scraping…" : "Scrape"}
      </button>

      {busy ? (
        <span className="text-[0.82rem] text-[#737373]">
          {report && (report.created || report.updated)
            ? `Round ${round} · ${summarise(report)}`
            : `Reading feeds and pages, round ${round} of up to ${MAX_ROUNDS}`}
        </span>
      ) : error ? (
        <span className="text-[0.82rem] text-rose-300">{error}</span>
      ) : report ? (
        <span className="text-[0.82rem] text-[#737373]">
          {summarise(report)}
        </span>
      ) : null}
    </span>
  );
}

/**
 * What the run actually produced, in the desk's words.
 *
 * A run that found nothing says so plainly. Reporting "0 new" as though it
 * were a result reads like a failure when it usually means the wire simply has
 * not moved since the last press.
 */
function summarise(report: ScrapeReport): string {
  const parts: string[] = [];
  if (report.created) parts.push(`${report.created} new`);
  if (report.updated) parts.push(`${report.updated} updated`);
  if (report.videosFound) parts.push(`${report.videosFound} with video`);
  if (report.textSaved) parts.push(`${report.textSaved} read in full`);
  if (report.recovered) parts.push(`${report.recovered} recovered`);
  if (!parts.length) return "Nothing new on the wire";
  const tail = report.remaining ? `, ${report.remaining} still to read` : "";
  return parts.join(" · ") + tail;
}
