import type { NewsroomCluster, NewsroomItem } from "@/lib/news/newsroom";

/**
 * Publishing rhythm, and which outlets keep landing on the same stories.
 *
 * Both are properties of the corpus rather than of any one article, and both
 * are read by The Press. Each takes `now` explicitly so the windows can be
 * tested rather than trusted.
 */

const HOUR = 60 * 60 * 1000;

/* ------------------------------------------------------------------ */
/* Rhythm and co-occurrence                                           */
/* ------------------------------------------------------------------ */

/**
 * Article counts by hour of the day, summed across the window.
 *
 * Hours are taken in UTC. A desk reading a global wire has no single local
 * midnight, and converting to the viewer's timezone would make the same corpus
 * peak at a different hour for two people looking at the same screen.
 */
export function hourOfDayProfile(
  items: NewsroomItem[],
  options: { now?: number; withinHours?: number } = {},
): number[] {
  const now = options.now ?? Date.now();
  const from = now - (options.withinHours ?? 168) * HOUR;
  const hours = Array.from({ length: 24 }, () => 0);
  for (const item of items) {
    const at = Date.parse(item.publishedAt);
    if (Number.isNaN(at) || at < from || at > now) continue;
    hours[new Date(at).getUTCHours()] += 1;
  }
  return hours;
}

export type CoCoverage = {
  nodes: Array<{ id: string; label: string; value: number }>;
  links: Array<{ source: string; target: string; value: number }>;
};

/**
 * Which outlets keep running the same stories as each other.
 *
 * By default only pairs that co-occur more than once are kept: two outlets
 * sharing a single story is a coincidence of one busy news day, and drawing
 * every such pair produces a hairball in which nothing is visible. Callers
 * showing a directory rather than looking for a pattern lower `minShared`,
 * and say so where they do.
 */
export function coCoverage(
  clusters: NewsroomCluster[],
  options: { minShared?: number; limit?: number } = {},
): CoCoverage {
  const minShared = options.minShared ?? 2;
  const limit = options.limit ?? 18;

  const totals = new Map<string, number>();
  const pairs = new Map<string, number>();

  for (const cluster of clusters) {
    const outlets = [...new Set(cluster.items.map((item) => item.source))].sort();
    for (const outlet of outlets) {
      totals.set(outlet, (totals.get(outlet) ?? 0) + 1);
    }
    if (outlets.length < 2) continue;
    for (let i = 0; i < outlets.length; i += 1) {
      for (let j = i + 1; j < outlets.length; j += 1) {
        const key = `${outlets[i]}\u0000${outlets[j]}`;
        pairs.set(key, (pairs.get(key) ?? 0) + 1);
      }
    }
  }

  const links = [...pairs.entries()]
    .filter(([, value]) => value >= minShared)
    .map(([key, value]) => {
      const [source, target] = key.split("\u0000");
      return { source, target, value };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);

  // Only outlets that appear in a surviving link — an isolated dot on the axis
  // says nothing and costs horizontal room the labelled ones need.
  const involved = new Set(links.flatMap((link) => [link.source, link.target]));
  const nodes = [...involved]
    .map((id) => ({ id, label: id, value: totals.get(id) ?? 0 }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return { nodes, links };
}
