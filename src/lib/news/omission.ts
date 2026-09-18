import { LEAN_SCALE, leanForOutlet, type Lean } from "@/lib/news/lean";
import type { NewsroomItem } from "@/lib/news/newsroom";
import { outletKey } from "@/lib/news/outlet";
import type { TopicSummary } from "@/lib/news/topics";

/**
 * Omission detection.
 *
 * Who is *not* covering a story is often more telling than who is. A topic
 * carried by nine left-leaning outlets and no right-leaning ones is a finding
 * in itself.
 *
 * The comparison is against outlets that are demonstrably active — an outlet
 * only counts as silent if it published something else in the same window. An
 * outlet that published nothing at all is broken, not silent, and saying
 * otherwise would manufacture a pattern out of a failed feed.
 */

export type SilentOutlet = {
  outlet: string;
  name: string;
  lean: Lean;
  /** How much it published in the window, all subjects. */
  published: number;
};

export type OmissionReport = {
  /** Points on the scale with zero coverage of this topic. */
  missingLeans: Lean[];
  /** Active outlets on those points that ran nothing on it. */
  silent: SilentOutlet[];
  /** Active outlets in the window, for context. */
  activeOutlets: number;
  /** Outlets that did cover it. */
  coveringOutlets: number;
  /**
   * True when one side of the scale carried it and the other did not at all —
   * the strongest form of the signal.
   */
  oneSided: boolean;
  note: string;
};

const LEFT: Lean[] = ["far-left", "left", "centre-left"];
const RIGHT: Lean[] = ["centre-right", "right", "far-right"];

/** Outlets that published anything in the window, keyed by outlet identity. */
export function activeOutlets(items: NewsroomItem[]): Map<string, SilentOutlet> {
  const map = new Map<string, SilentOutlet>();
  for (const item of items) {
    const key = outletKey(item);
    const found = map.get(key);
    if (found) {
      found.published += 1;
      continue;
    }
    map.set(key, {
      outlet: key,
      name: item.source,
      lean: leanForOutlet(item).lean,
      published: 1,
    });
  }
  return map;
}

export function detectOmissions(
  topic: TopicSummary,
  allItems: NewsroomItem[],
  /** Only outlets at or above this volume count as reliably active. */
  minPublished = 2,
): OmissionReport {
  const active = activeOutlets(allItems);

  const covering = new Set<string>();
  for (const cluster of topic.stories) {
    for (const item of cluster.items) covering.add(outletKey(item));
  }

  const missingLeans = LEAN_SCALE.filter(
    (lean) => (topic.leanCounts[lean] ?? 0) === 0,
  );

  const silent = [...active.values()]
    .filter(
      (outlet) =>
        outlet.published >= minPublished &&
        outlet.lean !== "unrated" &&
        !covering.has(outlet.outlet) &&
        missingLeans.includes(outlet.lean),
    )
    .sort((a, b) => b.published - a.published);

  const leftCovered = LEFT.some((lean) => (topic.leanCounts[lean] ?? 0) > 0);
  const rightCovered = RIGHT.some((lean) => (topic.leanCounts[lean] ?? 0) > 0);
  const oneSided = leftCovered !== rightCovered && silent.length > 0;

  let note: string;
  if (!missingLeans.length) {
    note = "Covered from every point on the scale.";
  } else if (oneSided) {
    note = leftCovered
      ? `Carried on the left, absent on the right — ${silent.length} active right-leaning ${silent.length === 1 ? "outlet" : "outlets"} ran nothing on it.`
      : `Carried on the right, absent on the left — ${silent.length} active left-leaning ${silent.length === 1 ? "outlet" : "outlets"} ran nothing on it.`;
  } else if (silent.length) {
    note = `${silent.length} active ${silent.length === 1 ? "outlet" : "outlets"} on the missing points of the scale ran nothing on it.`;
  } else {
    note = "No active outlets sit on the missing points of the scale.";
  }

  return {
    missingLeans,
    silent,
    activeOutlets: [...active.values()].filter(
      (outlet) => outlet.published >= minPublished,
    ).length,
    coveringOutlets: covering.size,
    oneSided,
    note,
  };
}
