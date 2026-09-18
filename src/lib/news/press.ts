import { framingTone } from "@/lib/news/framing";
import { leanForOutlet, type Lean } from "@/lib/news/lean";
import type { NewsroomCluster, NewsroomItem } from "@/lib/news/newsroom";
import { outletKey } from "@/lib/news/outlet";

/**
 * The press itself, rather than the news.
 *
 * The newsroom answers "what is being reported" and signals answers "what
 * changed". Neither answers "who are we reading, and how do they differ" — and
 * for a desk whose whole method is reading across the spectrum, that is the
 * question behind the other two.
 *
 * Every measure here describes this corpus over this window. None of them is a
 * verdict on an outlet: an outlet with a high loaded-language rate may be a
 * tabloid or may have spent the week covering a war, and this cannot tell the
 * difference.
 */

export type OutletProfile = {
  key: string;
  name: string;
  lean: Lean;
  stateControlled: boolean;
  articles: number;
  /** Distinct stories it appeared in. */
  stories: number;
  /** Stories only it ran. */
  exclusives: number;
  /** exclusives ÷ stories, 0–1. */
  exclusivity: number;
  /** Loaded framing words per article. */
  loadedRate: number;
  /** Plain framing words per article. */
  neutralRate: number;
  /**
   * Loaded ÷ (loaded + neutral), 0–1, or null when the outlet used no framing
   * vocabulary at all — which is different from using only plain words.
   */
  loadedShare: number | null;
  /** Median gap between its articles, in minutes. */
  cadenceMinutes: number | null;
  firstAt: string;
  lastAt: string;
};

/** One row per outlet, richest first. */
export function buildOutletProfiles(
  clusters: NewsroomCluster[],
): OutletProfile[] {
  const byOutlet = new Map<
    string,
    {
      key: string;
      name: string;
      lean: Lean;
      state: boolean;
      items: NewsroomItem[];
      stories: Set<string>;
      exclusives: number;
    }
  >();

  for (const cluster of clusters) {
    const keys = new Set(cluster.items.map((item) => outletKey(item)));
    for (const item of cluster.items) {
      const key = outletKey(item);
      let row = byOutlet.get(key);
      if (!row) {
        const rating = leanForOutlet(item);
        row = {
          key,
          name: item.source,
          lean: rating.lean,
          state: rating.stateControlled,
          items: [],
          stories: new Set(),
          exclusives: 0,
        };
        byOutlet.set(key, row);
      }
      row.items.push(item);
      row.stories.add(cluster.key);
    }
    // A story only this outlet ran. Counted once per cluster, not once per
    // article, or an outlet that filed three updates on its own scoop would
    // score three exclusives for one story.
    if (keys.size === 1) {
      const only = byOutlet.get([...keys][0]);
      if (only) only.exclusives += 1;
    }
  }

  const profiles: OutletProfile[] = [];
  for (const row of byOutlet.values()) {
    let loaded = 0;
    let neutral = 0;
    for (const item of row.items) {
      const tone = framingTone(item);
      loaded += tone.loaded;
      neutral += tone.neutral;
    }

    const stamps = row.items
      .map((item) => Date.parse(item.publishedAt))
      .filter((at) => !Number.isNaN(at))
      .sort((a, b) => a - b);

    const gaps: number[] = [];
    for (let i = 1; i < stamps.length; i += 1) {
      gaps.push((stamps[i] - stamps[i - 1]) / 60000);
    }
    gaps.sort((a, b) => a - b);

    const stories = row.stories.size;
    const articles = row.items.length;
    const framingWords = loaded + neutral;

    profiles.push({
      key: row.key,
      name: row.name,
      lean: row.lean,
      stateControlled: row.state,
      articles,
      stories,
      exclusives: row.exclusives,
      exclusivity: stories ? Number((row.exclusives / stories).toFixed(3)) : 0,
      loadedRate: Number((loaded / Math.max(1, articles)).toFixed(3)),
      neutralRate: Number((neutral / Math.max(1, articles)).toFixed(3)),
      loadedShare: framingWords
        ? Number((loaded / framingWords).toFixed(3))
        : null,
      cadenceMinutes: gaps.length
        ? Number(gaps[Math.floor(gaps.length / 2)].toFixed(1))
        : null,
      firstAt: stamps.length
        ? new Date(stamps[0]).toISOString()
        : new Date().toISOString(),
      lastAt: stamps.length
        ? new Date(stamps[stamps.length - 1]).toISOString()
        : new Date().toISOString(),
    });
  }

  return profiles.sort((a, b) => b.articles - a.articles);
}

export type LeanBand = {
  lean: Lean;
  outlets: number;
  articles: number;
  /** Mean loaded share across the outlets in this band that used any. */
  loadedShare: number | null;
};

/** The corpus rolled up by position on the scale. */
export function summariseByLean(profiles: OutletProfile[]): LeanBand[] {
  const map = new Map<Lean, OutletProfile[]>();
  for (const profile of profiles) {
    const list = map.get(profile.lean);
    if (list) list.push(profile);
    else map.set(profile.lean, [profile]);
  }

  const out: LeanBand[] = [];
  for (const [lean, list] of map) {
    const rated = list.filter((p) => p.loadedShare !== null);
    out.push({
      lean,
      outlets: list.length,
      articles: list.reduce((sum, p) => sum + p.articles, 0),
      loadedShare: rated.length
        ? Number(
            (
              rated.reduce((sum, p) => sum + (p.loadedShare ?? 0), 0) /
              rated.length
            ).toFixed(3),
          )
        : null,
    });
  }
  return out;
}

/**
 * How much of an outlet's output the rest of the corpus never touched.
 *
 * The floor exists because the ratio is meaningless on tiny numbers — an
 * outlet with two stories is either at 0% or 100% and neither figure says
 * anything about how it operates.
 */
export function mostExclusive(
  profiles: OutletProfile[],
  options: { minStories?: number; limit?: number } = {},
): OutletProfile[] {
  const minStories = options.minStories ?? 8;
  return profiles
    .filter((profile) => profile.stories >= minStories)
    .sort((a, b) => b.exclusivity - a.exclusivity)
    .slice(0, options.limit ?? 12);
}

/** Outlets reaching for loaded vocabulary most often. */
export function mostLoaded(
  profiles: OutletProfile[],
  options: { minArticles?: number; limit?: number } = {},
): OutletProfile[] {
  const minArticles = options.minArticles ?? 8;
  return profiles
    .filter(
      (profile) =>
        profile.articles >= minArticles && profile.loadedShare !== null,
    )
    .sort((a, b) => (b.loadedShare ?? 0) - (a.loadedShare ?? 0))
    .slice(0, options.limit ?? 12);
}
