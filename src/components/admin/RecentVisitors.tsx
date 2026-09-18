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
import { formatDuration } from "@/lib/visitors/format";
import { isAutomated } from "@/lib/visitors/intel";
import type { RecentVisitorsPayload } from "@/app/api/admin/recent-visitors/route";
import type { VisitorProfile } from "@/lib/visitors/profile";
import { describePlace, placeConfidence } from "@/lib/visitors/place";

type Band = "all" | "active" | "returning" | "new";

/**
 * Who is on the site, and everything known about them.
 *
 * Rebuilt in plain type alongside the panel it opens. The desk's shared stat
 * cards and lens switches set their labels in small uppercase and their
 * numbers in monospace; the equivalents here are written locally in ordinary
 * sans, so the two views read as one thing rather than as a stylised list in
 * front of a plain panel.
 *
 * A visitor rather than a page view is the unit: the same reader returning
 * four times is one person with four visits, not four rows. Everything is
 * derived from the profiles the Audit Stream already builds, so the two can
 * never disagree about who somebody is.
 */
export function RecentVisitors({
  embedded = false,
}: { embedded?: boolean } = {}) {
  const [data, setData] = useState<RecentVisitorsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [band, setBand] = useState<Band>("all");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [open, setOpen] = useState<VisitorProfile | null>(null);
  /**
   * Hide the machines.
   *
   * On by default, because most of what reaches the site is not a reader:
   * of 146 addresses in the log, 106 were a datacentre or an anonymiser.
   * A list that opens on those buries the handful of people in them.
   */
  const [peopleOnly, setPeopleOnly] = useState(true);

  const load = useCallback(async (fresh = false) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/recent-visitors${fresh ? "?fresh=1" : ""}`,
      );
      const payload = (await res.json()) as RecentVisitorsPayload & {
        error?: string;
      };
      if (!res.ok) throw new Error(payload.error || "Failed to load");
      setData(payload);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const all = useMemo(() => data?.visitors ?? [], [data]);

  const matches = useCallback(
    (profile: VisitorProfile) => {
      const needle = deferredQuery.trim().toLowerCase();
      if (!needle) return true;
      const loc = profile.latest.location;
      return [
        profile.visitorId,
        ...profile.ips,
        loc?.city,
        loc?.region,
        loc?.country,
        loc?.isp,
        profile.latest.browser?.name,
        profile.latest.device?.os,
        ...profile.pages.map((page) => page.path),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    },
    [deferredQuery],
  );

  /**
   * "Recently" is measured against when the feed was built, not against now.
   *
   * Reading the clock during render would make the same data produce a
   * different list on a re-render, and the payload already carries the moment
   * it was assembled.
   */
  const hourAgo = data ? Date.parse(data.generatedAt) - 3600_000 : 0;

  const bands = useMemo(() => {
    const found = all
      .filter(matches)
      .filter((p) => !peopleOnly || !isAutomated(p.latest));
    return {
      all: found,
      active: found.filter((p) => Date.parse(p.lastSeen) >= hourAgo),
      returning: found.filter((p) => p.returns > 0),
      new: found.filter((p) => p.returns === 0),
    };
  }, [all, matches, hourAgo, peopleOnly]);

  const shown = bands[band];
  const totals = data?.totals;

  return (
    <div className={embedded ? "" : "px-6 py-10 sm:px-10"}>
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <PlainFigure label="Visitors" value={String(totals?.visitors ?? 0)} />
        <PlainFigure label="Pages read" value={String(totals?.views ?? 0)} />
        <PlainFigure label="Returning" value={String(totals?.returning ?? 0)} />
        <PlainFigure label="Countries" value={String(totals?.countries ?? 0)} />
      </section>

      <div className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-3">
        {(
          [
            ["all", "Everyone"],
            ["active", "Last hour"],
            ["returning", "Returning"],
            ["new", "First visit"],
          ] as Array<[Band, string]>
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setBand(id)}
            className={`rounded-full px-3.5 py-1.5 text-[0.88rem] transition-colors ${
              band === id
                ? "bg-[#111] font-medium text-white"
                : "text-[#737373] hover:bg-black/[0.05] hover:text-black"
            }`}
          >
            {label}
            {/* The count is under the current search, so switching band never
                lands on an unexplained empty list. */}
            <span
              className={`ml-2 tabular-nums ${
                band === id ? "text-black/55" : "text-[#737373]"
              }`}
            >
              {bands[id].length}
            </span>
          </button>
        ))}

        <div className="ml-auto flex items-center gap-5">
          <button
            type="button"
            onClick={() => setPeopleOnly((current) => !current)}
            className="flex items-center gap-2 text-[0.88rem] text-[#737373] transition-colors hover:text-black"
          >
            <span
              aria-hidden
              className={`h-1.5 w-1.5 rounded-full ${
                peopleOnly ? "bg-[#5ac8a8]" : "bg-[#4a4a55]"
              }`}
            />
            {peopleOnly ? "People only" : "Including machines"}
          </button>
          <button
            type="button"
            onClick={() => void load(true)}
            className="text-[0.88rem] text-[#737373] transition-colors hover:text-black"
          >
            {loading ? "Reading…" : "Refresh"}
          </button>
        </div>
      </div>

      <div className="mt-5">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by address, city, country, network, browser or page"
          aria-label="Search visitors"
          className="w-full rounded-lg border border-black/10 bg-white px-4 py-2.5 text-[0.95rem] text-[#111] placeholder:text-[#4a4a55] focus:border-black/25 focus:outline-none"
        />
      </div>

      {error ? (
        <p className="mt-6 text-[0.95rem] text-[#111]">{error}</p>
      ) : null}

      {loading && !data ? (
        <p className="mt-16 text-center text-[0.95rem] text-[#737373]">
          Reading the log…
        </p>
      ) : shown.length ? (
        <ul className="mt-6">
          {shown.map((profile) => (
            <Row
              key={profile.visitorId}
              profile={profile}
              active={Date.parse(profile.lastSeen) >= hourAgo}
              onOpen={() => setOpen(profile)}
            />
          ))}
        </ul>
      ) : (
        <div className="mt-16 text-center">
          <p className="text-[0.95rem] text-[#737373]">
            {query
              ? "Nobody matches that search."
              : peopleOnly
                ? "No people in this window — only automated traffic."
                : band === "active"
                  ? "Nobody has visited in the last hour."
                  : "No visits recorded in this window."}
          </p>
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="mt-3 text-[0.88rem] text-[#ffffff] underline underline-offset-4"
            >
              Clear the search
            </button>
          ) : null}
        </div>
      )}

      {open ? (
        <Modal
          open
          onClose={() => setOpen(null)}
          eyebrow={
            <span className="flex flex-wrap items-baseline gap-x-4">
              <span>{place(open)}</span>
              <span>{ago(open.lastSeen)}</span>
              <span>
                {open.sessions.length} visit
                {open.sessions.length === 1 ? "" : "s"} · {open.views} pages
              </span>
            </span>
          }
          title={open.ips[0] || open.visitorId}
        >
          <VisitorModalBody profile={open} />
        </Modal>
      ) : null}
    </div>
  );
}

/* ── Pieces ──────────────────────────────────────────────────────────────── */

function ago(iso: string) {
  const at = Date.parse(iso);
  if (Number.isNaN(at)) return "";
  const diff = Date.now() - at;
  if (diff < 60_000) return "just now";
  if (diff < 3600_000) return `${Math.round(diff / 60_000)} min ago`;
  if (diff < 86_400_000) return `${Math.round(diff / 3600_000)}h ago`;
  return `${Math.round(diff / 86_400_000)}d ago`;
}

function place(profile: VisitorProfile) {
  const loc = profile.latest.location;
  return (
    describePlace([loc?.city, loc?.country], placeConfidence(loc)) || "Unknown"
  );
}


/** One visitor, summarised enough to decide whether to open them. */
function Row({
  profile,
  active,
  onOpen,
}: {
  profile: VisitorProfile;
  active: boolean;
  onOpen: () => void;
}) {
  const latestView = profile.sessions[0]?.views.at(-1);
  const loc = profile.latest.location;

  return (
    <li className="border-b border-black/10 last:border-0">
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-start gap-5 rounded-lg px-3 py-4 text-left transition-colors hover:bg-black/[0.04]"
      >
        {/* Visits, not views: the number that says whether they came back. */}
        <span className="flex w-12 shrink-0 flex-col items-center pt-0.5">
          <span className="text-[1.5rem] font-medium leading-none text-[#ffffff]">
            {profile.sessions.length}
          </span>
          <span className="mt-1 text-[0.75rem] text-[#737373]">
            {profile.sessions.length === 1 ? "visit" : "visits"}
          </span>
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            {active ? (
              <span
                aria-hidden
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#5ac8a8]"
              />
            ) : null}
            <span className="text-[0.95rem] font-medium text-[#111]">
              {profile.ips[0] || profile.visitorId.slice(0, 14)}
            </span>
            <span className="text-[0.88rem] text-[#737373]">
              {place(profile)}
            </span>
            <span className="text-[0.85rem] text-[#737373]">
              {ago(profile.lastSeen)}
            </span>
            {profile.returns > 0 ? (
              <span className="text-[0.85rem] text-[#5ac8a8]">
                came back {profile.returns} time
                {profile.returns === 1 ? "" : "s"}
              </span>
            ) : (
              <span className="text-[0.85rem] text-[#737373]">first visit</span>
            )}
          </span>

          <span className="mt-1.5 block truncate text-[0.92rem] text-[#404040]">
            {latestView?.title || latestView?.path || "—"}
          </span>

          <span className="mt-1.5 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[0.83rem] text-[#737373]">
            <span>
              {profile.views} page{profile.views === 1 ? "" : "s"} ·{" "}
              {formatDuration(profile.engagement.totalMinutes)} on site
            </span>
            <span>
              {[profile.latest.browser?.name, profile.latest.device?.os]
                .filter(Boolean)
                .join(" on ")}
            </span>
            {loc?.isp ? <span className="truncate">{loc.isp}</span> : null}
          </span>
        </span>

        <span className="hidden shrink-0 self-center text-[0.85rem] text-[#a3a3a3] sm:block">
          Open →
        </span>
      </button>
    </li>
  );
}
