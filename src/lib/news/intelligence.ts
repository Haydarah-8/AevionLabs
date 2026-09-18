import {
  outletKey,
  type NewsroomCluster,
  type NewsroomItem,
} from "@/lib/news/newsroom";
import { breakingScore, isBreakingStory } from "@/lib/news/scoring/breaking";

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

export type IntelligenceTotals = {
  stories: number;
  articles: number;
  outlets: number;
  /** Stories carried by more than one independent outlet. */
  corroborated: number;
  breaking: number;
  last24h: number;
};

export type CategorySlice = { name: string; count: number; share: number };

export type VolumeBucket = { label: string; iso: string; count: number };

export type OutletVolume = {
  name: string;
  count: number;
  share: number;
  lastAt: string;
};

export type SourceStatus =
  | "healthy"
  | "stale"
  | "failing"
  | "pending"
  | "disabled";

export type SourceHealth = {
  id: string;
  name: string;
  status: SourceStatus;
  lastSuccessAt: string | null;
  failureCount: number;
  articles: number;
};

export type TopStory = {
  key: string;
  headline: string;
  category: string;
  outlets: string[];
  outletCount: number;
  articleCount: number;
  latestAt: string;
  score: number;
  breaking: boolean;
  leadUrl: string;
};

/**
 * Recomputes the breaking signal from the number of genuinely distinct outlets
 * on a story. The stored news_stories.source_count counts every re-ingest of
 * the same article, so scores derived from it run high.
 */
export function clusterBreakingScore(
  cluster: NewsroomCluster,
  trustBySource: Map<string, number>,
  now = Date.now(),
): number {
  const ageHours = Math.max(0, (now - Date.parse(cluster.latestAt)) / HOUR_MS);
  const freshness = Number.isNaN(ageHours) ? 0.4 : 1 / (1 + ageHours / 6);
  const trust = Math.max(
    0.4,
    ...cluster.items.map((item) => trustBySource.get(item.sourceId) ?? 0.6),
  );
  const recentInGroup = cluster.items.filter(
    (item) => now - Date.parse(item.publishedAt) <= 6 * HOUR_MS,
  ).length;
  return breakingScore({
    freshness,
    independentSources: cluster.sourceCount,
    trustScore: trust,
    recentInGroup,
  });
}

export function topStories(
  clusters: NewsroomCluster[],
  trustBySource: Map<string, number>,
  limit = 12,
  now = Date.now(),
): TopStory[] {
  return clusters
    .map((cluster) => {
      const score = clusterBreakingScore(cluster, trustBySource, now);
      return {
        key: cluster.key,
        headline: cluster.lead.title,
        category: cluster.lead.category || "Uncategorised",
        outlets: cluster.sources,
        outletCount: cluster.sourceCount,
        articleCount: cluster.items.length,
        latestAt: cluster.latestAt,
        score,
        breaking: isBreakingStory(score),
        leadUrl: cluster.lead.sourceUrl,
      };
    })
    .sort(
      (a, b) =>
        b.outletCount - a.outletCount ||
        b.score - a.score ||
        Date.parse(b.latestAt) - Date.parse(a.latestAt),
    )
    .slice(0, limit);
}

export function summarizeCategories(
  items: NewsroomItem[],
  limit = 8,
): CategorySlice[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const name = item.category || "Uncategorised";
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  const total = items.length || 1;
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count, share: count / total }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function volumeByDay(
  items: NewsroomItem[],
  days = 7,
  now = Date.now(),
): VolumeBucket[] {
  const buckets: VolumeBucket[] = [];
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const day = new Date(startOfToday.getTime() - offset * DAY_MS);
    buckets.push({
      label: day.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
      }),
      iso: day.toISOString(),
      count: 0,
    });
  }

  const firstDay = startOfToday.getTime() - (days - 1) * DAY_MS;
  for (const item of items) {
    const at = Date.parse(item.publishedAt);
    if (Number.isNaN(at) || at < firstDay) continue;
    const index = Math.floor((at - firstDay) / DAY_MS);
    if (index >= 0 && index < buckets.length) buckets[index].count += 1;
  }
  return buckets;
}

export function outletVolume(
  items: NewsroomItem[],
  limit = 10,
): OutletVolume[] {
  const byOutlet = new Map<string, OutletVolume>();
  for (const item of items) {
    const key = outletKey(item);
    const current = byOutlet.get(key);
    if (!current) {
      byOutlet.set(key, {
        name: item.source,
        count: 1,
        share: 0,
        lastAt: item.publishedAt,
      });
      continue;
    }
    current.count += 1;
    if (Date.parse(item.publishedAt) > Date.parse(current.lastAt)) {
      current.lastAt = item.publishedAt;
    }
  }
  const total = items.length || 1;
  return [...byOutlet.values()]
    .map((row) => ({ ...row, share: row.count / total }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function sourceHealth(
  sources: Array<{
    id: string;
    name: string;
    enabled: boolean;
    last_success_at: string | null;
    failure_count?: number | null;
  }>,
  items: NewsroomItem[],
  now = Date.now(),
): SourceHealth[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    if (!item.sourceId) continue;
    counts.set(item.sourceId, (counts.get(item.sourceId) ?? 0) + 1);
  }

  return sources
    .map((source) => {
      const failureCount = source.failure_count ?? 0;
      const lastSuccess = source.last_success_at
        ? Date.parse(source.last_success_at)
        : NaN;
      const age = Number.isNaN(lastSuccess) ? Infinity : now - lastSuccess;

      let status: SourceStatus = "healthy";
      if (!source.enabled) status = "disabled";
      // Never crawled and never failed: newly added, not broken.
      else if (!source.last_success_at && failureCount === 0)
        status = "pending";
      else if (failureCount >= 3 || age > 3 * DAY_MS) status = "failing";
      else if (age > DAY_MS) status = "stale";

      return {
        id: source.id,
        name: source.name,
        status,
        lastSuccessAt: source.last_success_at,
        failureCount,
        articles: counts.get(source.id) ?? 0,
      };
    })
    .sort((a, b) => {
      const rank: Record<SourceStatus, number> = {
        failing: 0,
        stale: 1,
        pending: 2,
        healthy: 3,
        disabled: 4,
      };
      return rank[a.status] - rank[b.status] || b.articles - a.articles;
    });
}

export function totals(
  items: NewsroomItem[],
  clusters: NewsroomCluster[],
  stories: TopStory[],
  now = Date.now(),
): IntelligenceTotals {
  const outlets = new Set(items.map((item) => outletKey(item)));
  return {
    stories: clusters.length,
    articles: items.length,
    outlets: outlets.size,
    corroborated: clusters.filter((cluster) => cluster.sourceCount > 1).length,
    breaking: stories.filter((story) => story.breaking).length,
    last24h: items.filter(
      (item) => now - Date.parse(item.publishedAt) <= DAY_MS,
    ).length,
  };
}

export type IntelligencePayload = {
  generatedAt: string;
  totals: IntelligenceTotals;
  stories: TopStory[];
  categories: CategorySlice[];
  volume: VolumeBucket[];
  outlets: OutletVolume[];
  sources: SourceHealth[];
  /** Columns the AI enrichment step would fill; false when it has never run. */
  enrichmentActive: boolean;
};
