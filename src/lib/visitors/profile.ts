import type { VisitorRecord } from "@/lib/tracker-store";

/**
 * Everything the desk knows about one visitor.
 *
 * Built from the raw page-view records, which are one row per view rather than
 * one per person — so the whole job here is deciding what counts as the same
 * visitor, what counts as a separate visit, and which of the dozens of fields
 * on a record are worth surfacing.
 *
 * Identity is the visitor id, not the IP. An IP is shared by everyone behind a
 * router, a corporate NAT or a mobile carrier, and it changes under one person
 * as they move between networks — grouping by it would merge strangers and
 * split individuals in the same view.
 */

/** A run of page views with no long gap between them. */
export type VisitorSession = {
  startedAt: string;
  endedAt: string;
  /** Minutes from first to last view. Zero for a single-page visit. */
  durationMinutes: number;
  views: Array<{
    at: string;
    path: string;
    title: string;
    referrer: string;
    loadMs: number | null;
  }>;
};

export type VisitorProfile = {
  visitorId: string;
  /** Every address seen for this visitor, newest first. */
  ips: string[];
  firstSeen: string;
  lastSeen: string;
  /** Total page views across all visits. */
  views: number;
  /** Number of separate visits. */
  sessions: VisitorSession[];
  /** sessions.length - 1: how many times they came back. */
  returns: number;
  /** Distinct paths, most visited first. */
  pages: Array<{ path: string; title: string; views: number }>;
  /** Where they arrived from, excluding internal navigation. */
  referrers: Array<{ referrer: string; count: number }>;
  /** Median page load, in milliseconds. */
  medianLoadMs: number | null;
  /** The most recent record, for the device and location panels. */
  latest: VisitorRecord;
  /** Devices seen, in case they visit from more than one. */
  devices: string[];
  /** How much of themselves they have given the site. */
  engagement: {
    /** Summed visit durations. A single-page visit contributes nothing. */
    totalMinutes: number;
    averageVisitMinutes: number;
    /** Longest single visit. */
    longestVisitMinutes: number;
    pagesPerVisit: number;
    /** Visits that were one page and out. */
    singlePageVisits: number;
  };
  /** The rhythm of their returning. */
  cadence: {
    /** Mean hours between the start of one visit and the next. */
    averageGapHours: number | null;
    longestGapHours: number | null;
    /** Hours from their first view to their last. */
    knownForHours: number;
    /**
     * Views by hour of day in the visitor's own time, 0–23.
     *
     * Their clock rather than ours: "reads at 8am" is a fact about a person,
     * while the same figure in UTC is a fact about our server.
     */
    byHour: number[];
  };
  /** Where they come in, and where they leave. */
  entryPages: Array<{ path: string; count: number }>;
  exitPages: Array<{ path: string; count: number }>;
};

function round(value: number, places = 1) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

/** Counts of a string, largest first. */
function tally(values: string[]): Array<{ path: string; count: number }> {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()]
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * How long a gap ends a visit.
 *
 * Thirty minutes is the web-analytics convention. It is arbitrary but shared,
 * which matters more than being right: a number nobody else uses cannot be
 * compared with anything.
 */
const SESSION_GAP_MS = 30 * 60 * 1000;

function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return Math.round(sorted[Math.floor(sorted.length / 2)]);
}

/** Groups a visitor's page views into visits. */
export function buildSessions(records: VisitorRecord[]): VisitorSession[] {
  const sorted = [...records].sort(
    (a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp),
  );

  const sessions: VisitorSession[] = [];
  for (const record of sorted) {
    const at = Date.parse(record.timestamp);
    if (Number.isNaN(at)) continue;

    const view = {
      at: record.timestamp,
      path: record.page?.path || "/",
      title: record.page?.title || "",
      referrer: record.page?.referrer || "",
      loadMs: record.performance?.pageLoadTime ?? null,
    };

    const current = sessions[sessions.length - 1];
    if (current && at - Date.parse(current.endedAt) <= SESSION_GAP_MS) {
      current.views.push(view);
      current.endedAt = record.timestamp;
      current.durationMinutes = Math.round(
        (Date.parse(current.endedAt) - Date.parse(current.startedAt)) / 60000,
      );
      continue;
    }

    sessions.push({
      startedAt: record.timestamp,
      endedAt: record.timestamp,
      durationMinutes: 0,
      views: [view],
    });
  }

  // Newest visit first: the question is almost always "what did they just do".
  return sessions.reverse();
}

/** Everything known about one visitor, from their page views. */
export function buildVisitorProfile(
  records: VisitorRecord[],
): VisitorProfile | null {
  if (!records.length) return null;

  const sorted = [...records].sort(
    (a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp),
  );
  const latest = sorted[0];

  const pageCounts = new Map<string, { title: string; views: number }>();
  const referrerCounts = new Map<string, number>();
  const loads: number[] = [];
  const ips: string[] = [];
  const devices = new Set<string>();

  for (const record of sorted) {
    const path = record.page?.path || "/";
    const entry = pageCounts.get(path);
    if (entry) entry.views += 1;
    else pageCounts.set(path, { title: record.page?.title || "", views: 1 });

    const referrer = record.page?.referrer?.trim();
    // Internal navigation is not a referrer worth reporting — it says only
    // that they clicked a link on the site they were already on.
    if (
      referrer &&
      !referrer.includes("theaevionlabs") &&
      !referrer.includes("elijahwgroup") &&
      !referrer.startsWith("/")
    ) {
      referrerCounts.set(referrer, (referrerCounts.get(referrer) ?? 0) + 1);
    }

    if (typeof record.performance?.pageLoadTime === "number") {
      loads.push(record.performance.pageLoadTime);
    }
    if (record.ip && !ips.includes(record.ip)) ips.push(record.ip);
    if (record.device?.type) devices.add(record.device.type);
  }

  const sessions = buildSessions(records);

  const durations = sessions.map((session) => session.durationMinutes);
  const totalMinutes = durations.reduce((sum, value) => sum + value, 0);

  /**
   * Gaps between the *starts* of consecutive visits.
   *
   * Measuring start to start rather than end to start keeps the figure stable
   * for someone whose visits vary in length: a reader who arrives every
   * morning has a 24-hour cadence whether they stay a minute or an hour.
   */
  const starts = sessions
    .map((session) => Date.parse(session.startedAt))
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);
  const gaps: number[] = [];
  for (let i = 1; i < starts.length; i += 1) {
    gaps.push((starts[i] - starts[i - 1]) / 3_600_000);
  }

  // The visitor's own clock: their offset is minutes *behind* UTC, as
  // getTimezoneOffset reports it, so it is subtracted rather than added.
  const offsetMinutes = latest.location?.timezoneOffset ?? 0;
  const byHour = new Array<number>(24).fill(0);
  for (const record of sorted) {
    const at = Date.parse(record.timestamp);
    if (!Number.isFinite(at)) continue;
    const local = new Date(at - offsetMinutes * 60_000);
    byHour[local.getUTCHours()] += 1;
  }

  const firstSeen = sorted[sorted.length - 1].timestamp;

  return {
    engagement: {
      totalMinutes: round(totalMinutes),
      averageVisitMinutes: sessions.length
        ? round(totalMinutes / sessions.length)
        : 0,
      longestVisitMinutes: durations.length ? Math.max(...durations) : 0,
      pagesPerVisit: sessions.length
        ? round(records.length / sessions.length)
        : 0,
      singlePageVisits: sessions.filter((session) => session.views.length === 1)
        .length,
    },
    cadence: {
      averageGapHours: gaps.length
        ? round(gaps.reduce((sum, value) => sum + value, 0) / gaps.length)
        : null,
      longestGapHours: gaps.length ? round(Math.max(...gaps)) : null,
      knownForHours: round(
        Math.max(0, Date.parse(latest.timestamp) - Date.parse(firstSeen)) /
          3_600_000,
      ),
      byHour,
    },
    entryPages: tally(
      sessions.map((session) => session.views[0]?.path).filter(Boolean),
    ),
    exitPages: tally(
      sessions
        .map((session) => session.views[session.views.length - 1]?.path)
        .filter(Boolean),
    ),
    visitorId: latest.visitorId,
    ips,
    firstSeen,
    lastSeen: latest.timestamp,
    views: records.length,
    sessions,
    returns: Math.max(0, sessions.length - 1),
    pages: [...pageCounts.entries()]
      .map(([path, value]) => ({ path, ...value }))
      .sort((a, b) => b.views - a.views),
    referrers: [...referrerCounts.entries()]
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count),
    medianLoadMs: median(loads),
    latest,
    devices: [...devices],
  };
}

/**
 * Every record belonging to the same visitor as the one given.
 *
 * Falls back to the IP only when the visitor id is missing, which happens for
 * records written before the id existed. That fallback is deliberately narrow:
 * it is better to show one visit than to merge a whole office into one person.
 */
export function recordsForVisitor(
  all: VisitorRecord[],
  target: VisitorRecord,
): VisitorRecord[] {
  if (target.visitorId) {
    return all.filter((record) => record.visitorId === target.visitorId);
  }
  return all.filter((record) => !record.visitorId && record.ip === target.ip);
}

/**
 * Everyone who has visited, most recently seen first.
 *
 * Used for the directory view, where the question is "who has been here"
 * rather than "what happened just now".
 */
export function buildAllProfiles(all: VisitorRecord[]): VisitorProfile[] {
  const byVisitor = new Map<string, VisitorRecord[]>();
  for (const record of all) {
    const key = record.visitorId || `ip:${record.ip}`;
    const list = byVisitor.get(key);
    if (list) list.push(record);
    else byVisitor.set(key, [record]);
  }

  return [...byVisitor.values()]
    .map((records) => buildVisitorProfile(records))
    .filter((profile): profile is VisitorProfile => Boolean(profile))
    .sort((a, b) => Date.parse(b.lastSeen) - Date.parse(a.lastSeen));
}
