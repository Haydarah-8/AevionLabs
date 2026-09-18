import { imageAllowed } from "@/lib/news-intake/draft";
import type { NewsTopicId } from "@/lib/news-intake/types";
import {
  buildIdf,
  SAME_STORY,
  similarityTokens,
  weightedSimilarity,
} from "@/lib/news/similarity";
import { safeVideoPlayback } from "@/lib/news/media";
import { normalizeOutletName, outletKey } from "@/lib/news/outlet";
import type { SocialPlatform } from "@/lib/news/social";

/** How a story is presented in the newsroom list. */
export type NewsroomMedia = "video" | "image" | "text";

/** Where the story came from: already stored by the ingester, or fetched live. */
export type NewsroomOrigin = "stored" | "live";

export type NewsroomItem = {
  /** Canonical source URL — stable identity across both origins. */
  key: string;
  /** Article row id when the story is already stored, else null. */
  id: string | null;
  title: string;
  snippet: string;
  source: string;
  sourceId: string;
  sourceUrl: string;
  publishedAt: string;
  category: string;
  imageUrl?: string;
  videoUrl?: string;
  /** Set when the story is a social post rather than a wire article. */
  platform?: SocialPlatform;
  media: NewsroomMedia;
  origin: NewsroomOrigin;
  imported: boolean;
  /** Cluster id assigned by the ingest pipeline (duplicate_group_id). */
  storyId?: string | null;
};

/** One real-world story, as covered by one or more outlets. */
export type NewsroomCluster = {
  key: string;
  /** Best article to read and draft from. */
  lead: NewsroomItem;
  /** Every article in the cluster, lead first. */
  items: NewsroomItem[];
  /** Distinct outlet names covering the story. */
  sources: string[];
  sourceCount: number;
  latestAt: string;
  /** True when every article in the cluster is already drafted. */
  imported: boolean;
};

export type NewsroomFilters = {
  query: string;
  source: string;
  category: string;
  media: "all" | NewsroomMedia | "social";
  status: "all" | "new" | "imported";
};

export const NEWSROOM_PAGE_SIZE = 30;

export const EMPTY_NEWSROOM_FILTERS: NewsroomFilters = {
  query: "",
  source: "all",
  category: "all",
  media: "all",
  status: "all",
};

/** Trailing slashes and tracking params make the same story look like two. */
export function newsroomKey(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    for (const param of [...parsed.searchParams.keys()]) {
      if (/^(utm_|fbclid|gclid|mc_|ref$|ref_)/i.test(param)) {
        parsed.searchParams.delete(param);
      }
    }
    const normalized = parsed.toString().replace(/\/$/, "");
    return normalized.toLowerCase();
  } catch {
    return url.trim().toLowerCase();
  }
}

export function newsroomMedia(item: {
  videoUrl?: string;
  imageUrl?: string;
}): NewsroomMedia {
  if (safeVideoPlayback(item.videoUrl)) return "video";
  if (imageAllowed(item.imageUrl)) return "image";
  return "text";
}

/**
 * Stored rows win over live ones — they carry the article id needed for
 * hide/merge actions — but a live row can still fill in missing media.
 */
export function mergeNewsroomItems(groups: NewsroomItem[][]): NewsroomItem[] {
  const byKey = new Map<string, NewsroomItem>();
  for (const group of groups) {
    for (const item of group) {
      const current = byKey.get(item.key);
      if (!current) {
        byKey.set(item.key, item);
        continue;
      }
      const winner = current.origin === "stored" ? current : item;
      const other = winner === current ? item : current;
      byKey.set(item.key, {
        ...winner,
        imported: current.imported || item.imported,
        snippet: winner.snippet || other.snippet,
        imageUrl: winner.imageUrl || other.imageUrl,
        videoUrl: winner.videoUrl || other.videoUrl,
        category: winner.category || other.category,
        storyId: winner.storyId || other.storyId || null,
        media: newsroomMedia({
          videoUrl: winner.videoUrl || other.videoUrl,
          imageUrl: winner.imageUrl || other.imageUrl,
        }),
      });
    }
  }
  return [...byKey.values()].sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  );
}

export function matchesNewsroomQuery(item: NewsroomItem, query: string) {
  if (!query) return true;
  const haystack =
    `${item.title} ${item.snippet} ${item.source} ${item.category}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}

export function filterNewsroomItems(
  items: NewsroomItem[],
  filters: NewsroomFilters,
): NewsroomItem[] {
  return items.filter((item) => {
    if (filters.source !== "all" && item.source !== filters.source) {
      return false;
    }
    if (filters.category !== "all" && item.category !== filters.category) {
      return false;
    }
    if (filters.media === "social" && !item.platform) return false;
    if (
      filters.media !== "all" &&
      filters.media !== "social" &&
      (item.media !== filters.media || item.platform)
    ) {
      return false;
    }
    if (filters.status === "new" && item.imported) return false;
    if (filters.status === "imported" && !item.imported) return false;
    return matchesNewsroomQuery(item, filters.query);
  });
}

/** Same window the ingest pipeline dedupes with. */
const CLUSTER_WINDOW_MS = 18 * 60 * 60 * 1000;

export { outletKey, normalizeOutletName } from "@/lib/news/outlet";

/** Richer articles make better leads — they are what the draft is written from. */
function leadScore(item: NewsroomItem) {
  let score = 0;
  if (item.origin === "stored") score += 4;
  if (item.media === "video") score += 3;
  else if (item.media === "image") score += 2;
  if (item.snippet.length > 80) score += 1;
  if (!item.platform) score += 1;
  return score;
}

/**
 * Groups articles into the stories they report on. Stored articles already
 * carry a cluster id from the ingest pipeline; live wire items are matched by
 * title similarity inside the same time window the pipeline uses, so a story
 * picked up by six outlets collapses into one row instead of six.
 */
export function clusterNewsroomItems(
  items: NewsroomItem[],
): NewsroomCluster[] {
  const clusters: NewsroomCluster[] = [];
  const byStory = new Map<string, NewsroomCluster>();

  const start = (key: string, item: NewsroomItem): NewsroomCluster => ({
    key,
    lead: item,
    items: [item],
    sources: [item.source],
    sourceCount: 1,
    latestAt: item.publishedAt,
    imported: item.imported,
  });

  const add = (cluster: NewsroomCluster, item: NewsroomItem) => {
    cluster.items.push(item);
    if (Date.parse(item.publishedAt) > Date.parse(cluster.latestAt)) {
      cluster.latestAt = item.publishedAt;
    }
  };

  /**
   * Pass one: seed clusters from the ids the ingest pipeline already assigned.
   *
   * This used to be the whole of it, and `continue` meant an article carrying
   * a story id never reached title matching. Since ingest assigns every stored
   * article an id — a unique one whenever it found no duplicate — that short
   * circuit disabled title clustering for the entire stored corpus: 600
   * articles produced 597 groups.
   */
  for (const item of items) {
    const key = item.storyId ?? item.key;
    const found = item.storyId ? byStory.get(item.storyId) : undefined;
    if (found) {
      add(found, item);
      continue;
    }
    const created = start(key, item);
    if (item.storyId) byStory.set(item.storyId, created);
    clusters.push(created);
  }

  /**
   * Pass two: merge the seeds that are the same story.
   *
   * Merging clusters rather than filing articles one at a time means a group
   * ingest already found stays intact and joins as a unit, and the comparison
   * is always against a cluster's lead — the fullest headline it has — rather
   * than against whichever member happened to arrive first.
   */
  const idf = buildIdf(items.map((item) => item.title));
  const tokens = new Map<string, Set<string>>();
  const tokensFor = (cluster: NewsroomCluster) => {
    const cached = tokens.get(cluster.key);
    if (cached) return cached;
    const built = similarityTokens(cluster.lead.title);
    tokens.set(cluster.key, built);
    return built;
  };

  const merged: NewsroomCluster[] = [];
  for (const cluster of clusters) {
    const mine = tokensFor(cluster);
    const at = Date.parse(cluster.latestAt);
    const target = merged.find((other) => {
      const delta = Math.abs(Date.parse(other.latestAt) - at);
      if (Number.isNaN(delta) || delta > CLUSTER_WINDOW_MS) return false;
      return weightedSimilarity(tokensFor(other), mine, idf) >= SAME_STORY;
    });
    if (!target) {
      merged.push(cluster);
      continue;
    }
    // The lead is chosen below, after every merge, so the target's cached
    // tokens still describe the headline being compared against.
    for (const item of cluster.items) add(target, item);
  }

  clusters.length = 0;
  clusters.push(...merged);

  for (const cluster of clusters) {
    cluster.items.sort((a, b) => leadScore(b) - leadScore(a));
    cluster.lead = cluster.items[0];
    // One entry per organisation, keeping the richest article's display name.
    // Keyed on domain first, then collapsed again by masthead so one outlet
    // publishing across two domains is not counted as two.
    const byOutlet = new Map<string, string>();
    for (const item of cluster.items) {
      const key = outletKey(item);
      if (!byOutlet.has(key)) byOutlet.set(key, item.source);
    }
    const byMasthead = new Map<string, string>();
    for (const name of byOutlet.values()) {
      const masthead = normalizeOutletName(name) || name.toLowerCase();
      if (!byMasthead.has(masthead)) byMasthead.set(masthead, name);
    }
    cluster.sources = [...byMasthead.values()];
    cluster.sourceCount = byMasthead.size;
    cluster.imported = cluster.items.every((item) => item.imported);
  }

  return clusters;
}

export type NewsroomSort = "newest" | "coverage";

export function sortNewsroomClusters(
  clusters: NewsroomCluster[],
  sort: NewsroomSort,
): NewsroomCluster[] {
  const sorted = [...clusters];
  if (sort === "coverage") {
    sorted.sort(
      (a, b) =>
        b.sourceCount - a.sourceCount ||
        Date.parse(b.latestAt) - Date.parse(a.latestAt),
    );
    return sorted;
  }
  sorted.sort((a, b) => Date.parse(b.latestAt) - Date.parse(a.latestAt));
  return sorted;
}

export type NewsroomPayload = {
  items: NewsroomItem[];
  sources: Array<{
    id: string;
    name: string;
    domain: string;
    enabled: boolean;
    last_success_at: string | null;
  }>;
  categories: string[];
  sourceNames: string[];
  topic: NewsTopicId;
  fetchedAt: string;
  lastScrapedAt: string | null;
  errors: string[];
};

/**
 * Splits the desk into what a scrape just brought in and what was already here.
 *
 * A cluster counts as new when any one of its articles is new: a story that
 * gained a fresh outlet this run is news to the desk even though the story
 * itself is not. Judging a cluster only by its lead would hide exactly the
 * case the split exists to show.
 *
 * With no new urls the answer is the list unchanged, so the caller can render
 * one list at rest and two only when the division carries information.
 */
export function splitByArrival<
  T extends {
    item: { sourceUrl: string };
    cluster?: { items: Array<{ sourceUrl: string }> };
  },
>(rows: T[], newUrls: Set<string>): { fresh: T[]; older: T[] } {
  if (!newUrls.size) return { fresh: [], older: rows };
  const isFresh = (row: T) =>
    (row.cluster?.items ?? [row.item]).some((entry) =>
      newUrls.has(entry.sourceUrl),
    );
  const fresh: T[] = [];
  const older: T[] = [];
  for (const row of rows) (isFresh(row) ? fresh : older).push(row);
  return { fresh, older };
}
