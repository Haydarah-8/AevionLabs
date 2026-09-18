"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Modal } from "@/components/admin/Modal";
import { PlainFigure } from "@/components/admin/plain";
import { VisitorModalBody } from "@/components/admin/VisitorModal";
import { computeVisitorStats } from "@/lib/analytics-aggregator";
import { isAutomated } from "@/lib/visitors/intel";
import type { VisitorRecord } from "@/lib/tracker-store";
import { buildVisitorProfile, recordsForVisitor } from "@/lib/visitors/profile";

type Filter = "all" | "new" | "returning";

interface VisitorsTabProps {
  visitors: VisitorRecord[];
  loading: boolean;
  onRefresh: () => void;
}

/**
 * The audit stream: one line per page view, newest first.
 *
 * Deliberately a different question from the visitors panel. That one answers
 * "who is this person" by folding every view into a profile; this one answers
 * "what just happened", which needs the views left as they arrived, in order,
 * updating while you watch.
 *
 * Set in the same plain type as that panel — ordinary sans, sentence case, no
 * monospace — because the two are read one after the other and a stylised log
 * in front of a plain profile made them look like different products.
 *
 * The dense table it replaces put nine columns into the width of a phone. Rows
 * carry the same facts with room to breathe, and clicking one still opens the
 * whole person rather than the single view that was clicked.
 */
export function VisitorsTab({
  visitors,
  loading,
  onRefresh,
}: VisitorsTabProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [live, setLive] = useState(true);
  /** Hide views that came from a datacentre, an anonymiser or a crawler. */
  const [peopleOnly, setPeopleOnly] = useState(true);
  const [visible, setVisible] = useState(50);

  /**
   * The record whose visitor is open.
   *
   * The row identifies the person; the panel is then built from every record
   * belonging to them, not just the view that was clicked.
   */
  const [openRecord, setOpenRecord] = useState<VisitorRecord | null>(null);

  useEffect(() => {
    if (!live) return;
    const interval = setInterval(onRefresh, 8000);
    return () => clearInterval(interval);
  }, [live, onRefresh]);

  const stats = useMemo(() => computeVisitorStats(visitors), [visitors]);

  const openProfile = useMemo(() => {
    if (!openRecord) return null;
    return buildVisitorProfile(recordsForVisitor(visitors, openRecord));
  }, [openRecord, visitors]);

  const matches = useCallback(
    (record: VisitorRecord) => {
      const needle = deferredSearch.trim().toLowerCase();
      if (!needle) return true;
      return [
        record.ip,
        record.visitorId,
        record.page?.path,
        record.page?.title,
        record.browser?.name,
        record.device?.os,
        record.location?.city,
        record.location?.country,
        record.location?.isp,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    },
    [deferredSearch],
  );

  const counts = useMemo(() => {
    const found = visitors
      .filter(matches)
      .filter((record) => !peopleOnly || !isAutomated(record));
    return {
      all: found,
      new: found.filter((record) => record.type === "new"),
      returning: found.filter((record) => record.type === "returning"),
    };
  }, [visitors, matches, peopleOnly]);

  const filtered = counts[filter];
  const shown = filtered.slice(0, visible);

  /**
   * A new search or filter starts at the top of its own results.
   *
   * Adjusted during render rather than in an effect: an effect would paint the
   * old page length once and then correct it, and React can restart a render
   * cheaply where it cannot un-paint a frame.
   */
  const signature = `${filter}|${deferredSearch}|${peopleOnly}`;
  const [lastSignature, setLastSignature] = useState(signature);
  if (signature !== lastSignature) {
    setLastSignature(signature);
    setVisible(50);
  }

  return (
    <div className="space-y-9">
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <PlainFigure label="Views logged" value={stats.totalAll} />
        <PlainFigure label="People" value={stats.uniqueVisitors} />
        <PlainFigure label="New today" value={stats.newToday} />
        <PlainFigure label="Returning today" value={stats.returningToday} />
      </section>

      <div className="flex flex-wrap items-center gap-x-2 gap-y-3">
        {(
          [
            ["all", "Everything"],
            ["new", "First visit"],
            ["returning", "Returning"],
          ] as Array<[Filter, string]>
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`rounded-full px-3.5 py-1.5 text-[0.88rem] transition-colors ${
              filter === id
                ? "bg-[#111] font-medium text-white"
                : "text-white/45 hover:bg-black/[0.05] hover:text-white"
            }`}
          >
            {label}
            <span
              className={`ml-2 tabular-nums ${
                filter === id ? "text-white/55" : "text-white/45"
              }`}
            >
              {counts[id].length}
            </span>
          </button>
        ))}

        <div className="ml-auto flex flex-wrap items-center gap-5">
          <button
            type="button"
            onClick={() => setPeopleOnly((current) => !current)}
            className="flex items-center gap-2 text-[0.88rem] text-white/45 transition-colors hover:text-white"
          >
            <span
              aria-hidden
              className={`h-1.5 w-1.5 rounded-full ${
                peopleOnly ? "bg-[#5ac8a8]" : "bg-[#4a4a55]"
              }`}
            />
            {peopleOnly ? "People only" : "Including machines"}
          </button>
          {/* The dot is the state; the words say what it means, so the status
              still reads without relying on colour. */}
          <button
            type="button"
            onClick={() => setLive((current) => !current)}
            className="flex items-center gap-2 text-[0.88rem] text-white/45 transition-colors hover:text-white"
          >
            <span
              aria-hidden
              className={`h-1.5 w-1.5 rounded-full ${
                live ? "animate-pulse bg-[#5ac8a8]" : "bg-[#4a4a55]"
              }`}
            />
            {live ? "Updating live" : "Paused"}
          </button>

          <button
            type="button"
            onClick={onRefresh}
            className="text-[0.88rem] text-white/45 transition-colors hover:text-white"
          >
            {loading ? "Reading…" : "Refresh"}
          </button>
        </div>
      </div>

      <div>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by address, page, city, country, network, browser or device"
          aria-label="Search the audit stream"
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[0.95rem] text-white placeholder:text-white/30 focus:border-white/25 focus:outline-none"
        />
      </div>

      {loading && !visitors.length ? (
        <p className="py-20 text-center text-[0.95rem] text-white/45">
          Reading the log…
        </p>
      ) : shown.length ? (
        <>
          <ul>
            {shown.map((record) => (
              <ViewRow
                key={record.id}
                record={record}
                onOpen={() => setOpenRecord(record)}
              />
            ))}
          </ul>

          {visible < filtered.length ? (
            <button
              type="button"
              onClick={() => setVisible((n) => n + 50)}
              className="w-full py-4 text-[0.9rem] text-white/45 transition-colors hover:text-white"
            >
              Show {Math.min(50, filtered.length - visible)} more of{" "}
              {filtered.length}
            </button>
          ) : (
            <p className="py-4 text-center text-[0.85rem] text-white/40">
              That is all {filtered.length} of them.
            </p>
          )}
        </>
      ) : (
        <div className="py-20 text-center">
          <p className="text-[0.95rem] text-white/45">
            {search
              ? "Nothing matches that search."
              : peopleOnly
                ? "No human traffic in the log — only machines."
                : "Nothing logged yet."}
          </p>
          {search ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="mt-3 text-[0.88rem] text-[#ffffff] underline underline-offset-4"
            >
              Clear the search
            </button>
          ) : null}
        </div>
      )}

      {openProfile ? (
        <Modal
          open
          onClose={() => setOpenRecord(null)}
          eyebrow={
            <span className="flex flex-wrap items-baseline gap-x-4">
              <span>{place(openProfile.latest)}</span>
              <span>{ago(openProfile.lastSeen)}</span>
              <span>
                {openProfile.sessions.length} visit
                {openProfile.sessions.length === 1 ? "" : "s"} ·{" "}
                {openProfile.views} pages
              </span>
            </span>
          }
          title={openProfile.ips[0] || openProfile.visitorId}
        >
          <VisitorModalBody profile={openProfile} />
        </Modal>
      ) : null}
    </div>
  );
}

/* ── Pieces ──────────────────────────────────────────────────────────────── */

function ago(iso: string): string {
  const at = Date.parse(iso);
  if (Number.isNaN(at)) return "";
  const diff = Date.now() - at;
  if (diff < 60_000) return "just now";
  if (diff < 3600_000) return `${Math.round(diff / 60_000)} min ago`;
  if (diff < 86_400_000) return `${Math.round(diff / 3600_000)}h ago`;
  return `${Math.round(diff / 86_400_000)}d ago`;
}

function place(record: VisitorRecord): string {
  return (
    [record.location?.city, record.location?.country]
      .filter(Boolean)
      .join(", ") || "Unknown"
  );
}

/** One page view, as it arrived. */
function ViewRow({
  record,
  onOpen,
}: {
  record: VisitorRecord;
  onOpen: () => void;
}) {
  const load = record.performance?.pageLoadTime;

  return (
    <li className="border-b border-white/10 last:border-0">
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-start gap-5 rounded-lg px-3 py-3.5 text-left transition-colors hover:bg-black/[0.04]"
      >
        {/* When, first: this is a log, and the reader is scanning downwards
            through time before anything else. */}
        <span className="w-20 shrink-0 pt-0.5 text-[0.85rem] tabular-nums text-white/45">
          {ago(record.timestamp)}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-[0.95rem] font-medium text-white">
              {record.ip}
            </span>
            <span className="text-[0.88rem] text-white/45">
              {place(record)}
            </span>
            <span
              className={`text-[0.85rem] ${
                record.type === "returning" ? "text-[#5ac8a8]" : "text-white/45"
              }`}
            >
              {record.type === "returning"
                ? `visit ${record.sessionNumber}`
                : "first visit"}
            </span>
          </span>

          <span className="mt-1.5 block truncate text-[0.92rem] text-white/75">
            {record.page?.title || record.page?.path || "—"}
          </span>

          <span className="mt-1.5 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[0.83rem] text-white/45">
            <span className="truncate">{record.page?.path}</span>
            <span>
              {[record.browser?.name, record.device?.os]
                .filter(Boolean)
                .join(" on ")}
            </span>
            {record.location?.isp ? (
              <span className="truncate">{record.location.isp}</span>
            ) : null}
            {typeof load === "number" ? <span>{load} ms</span> : null}
          </span>
        </span>

        <span className="hidden shrink-0 self-center text-[0.85rem] text-white/40 sm:block">
          Open →
        </span>
      </button>
    </li>
  );
}
