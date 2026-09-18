import { leanBalance, spreadWidth, type Lean } from "@/lib/news/lean";
import type { NewsroomCluster } from "@/lib/news/newsroom";
import { outletKey } from "@/lib/news/outlet";
import { topicTerms, type TopicSummary } from "@/lib/news/topics";
import { DOMAINS, type Domain, type DomainId } from "@/lib/news/domain-terms";

export { DOMAINS };
export type { Domain, DomainId };

/**
 * The third level of grouping on this desk.
 *
 *   articles → stories → topics → domains
 *
 * Topics are emergent: they come from whatever terms recur in the corpus, so
 * they are specific ("sanctions", "Gaza", "tariffs") and there are dozens of
 * them. That is the right grain for reading, and the wrong grain for a first
 * glance — forty topics is a list, not an overview.
 *
 * Domains are the opposite: a fixed, small, editorially chosen set of subject
 * areas that topics are sorted into. They do not move when the news moves,
 * which is what makes them comparable week to week.
 *
 * Keeping both is deliberate. A fixed taxonomy alone would never surface a
 * subject nobody thought to define; emergent topics alone never roll up into
 * anything you can compare. Each covers the other's blind spot.
 */

const DOMAIN_BY_ID = new Map(DOMAINS.map((domain) => [domain.id, domain]));

export function domainById(id: DomainId): Domain | undefined {
  return DOMAIN_BY_ID.get(id);
}

/**
 * Single-word terms are matched against the tokenised text so "war" cannot
 * fire inside "warehouse"; multi-word terms are matched as padded substrings.
 */
type CompiledDomain = { id: DomainId; single: Set<string>; phrases: string[] };

const COMPILED: CompiledDomain[] = DOMAINS.map((domain) => ({
  id: domain.id,
  single: new Set(domain.terms.filter((term) => !term.includes(" "))),
  phrases: domain.terms.filter((term) => term.includes(" ")),
}));

/** How strongly a piece of text belongs to each domain. */
export function scoreDomains(text: string): Map<DomainId, number> {
  const lower = ` ${text.toLowerCase()} `;
  const words = new Set(topicTerms(text));
  const scores = new Map<DomainId, number>();

  for (const domain of COMPILED) {
    let score = 0;
    for (const term of domain.single) if (words.has(term)) score += 1;
    // A phrase is a stronger signal than a lone word: "security council" is
    // unambiguous where "council" is not.
    for (const phrase of domain.phrases) {
      if (lower.includes(` ${phrase} `)) score += 2;
    }
    if (score) scores.set(domain.id, score);
  }
  return scores;
}

/**
 * How widely a topic is being carried.
 *
 * This is the distinction the desk cares about: a subject on every front page
 * and a subject two outlets are pursuing alone are different kinds of thing,
 * and the second is easy to miss precisely because it is quiet.
 */
export type Reach = "mainstream" | "emerging" | "niche";

export const REACH_LABEL: Record<Reach, string> = {
  mainstream: "Mainstream",
  emerging: "Emerging",
  niche: "Niche",
};

export const REACH_BLURB: Record<Reach, string> = {
  mainstream: "Carried across most of the corpus.",
  emerging: "Picked up beyond its first outlets.",
  niche: "Few outlets, and easy to miss.",
};

export type ClassifiedTopic = TopicSummary & {
  domain: DomainId | null;
  /** Confidence of the domain match, 0–1, for showing an unsure one quietly. */
  domainScore: number;
  reach: Reach;
  /** Share of all active outlets that carried it, 0–1. */
  outletShare: number;
};

/**
 * Sorts topics into domains and grades how widely each is carried.
 *
 * `outletUniverse` is the number of outlets active anywhere in the corpus, so
 * reach is measured against what could have covered a topic rather than
 * against the largest topic of the day — otherwise a quiet news cycle would
 * relabel everything as mainstream.
 */
export function classifyTopics(
  topics: TopicSummary[],
  outletUniverse: number,
): ClassifiedTopic[] {
  return topics.map((topic) => {
    /**
     * Each story votes once for the domain its own headline scores highest,
     * and the topic takes the majority.
     *
     * Scoring one concatenation of every article instead does not work: term
     * matching is on distinct words, so across a few hundred headlines almost
     * every domain's vocabulary turns up at least once, all the scores
     * converge, and the winner is decided by noise. Per-story voting keeps
     * each headline's own subject intact, and one story carried by twenty
     * outlets still counts once — topics are sets of stories, not of articles.
     */
    const votes = new Map<DomainId, number>();
    let cast = 0;

    for (const cluster of topic.stories) {
      const scores = scoreDomains(
        `${cluster.lead.title} ${cluster.lead.snippet}`,
      );
      let winner: DomainId | null = null;
      let top = 0;
      for (const [id, score] of scores) {
        // Strictly greater, so a tie keeps the earlier-declared domain and the
        // result never depends on Map iteration order.
        if (score > top) {
          top = score;
          winner = id;
        }
      }
      if (!winner) continue;
      votes.set(winner, (votes.get(winner) ?? 0) + 1);
      cast += 1;
    }

    let domain: DomainId | null = null;
    let best = 0;
    for (const [id, count] of votes) {
      if (count > best) {
        best = count;
        domain = id;
      }
    }
    // Confidence is the share of voting stories that agreed, which is directly
    // readable: 0.8 means four in five headlines pointed the same way.
    const total = cast;

    const outletShare = outletUniverse
      ? topic.outletCount / outletUniverse
      : 0;

    // Thresholds are on share of the outlet universe, not raw counts, so they
    // hold whether the desk is watching 40 outlets or 400.
    const reach: Reach =
      outletShare >= 0.18 || topic.outletCount >= 12
        ? "mainstream"
        : outletShare >= 0.07 || topic.outletCount >= 5
          ? "emerging"
          : "niche";

    return {
      ...topic,
      domain,
      domainScore: total ? best / total : 0,
      reach,
      outletShare,
    };
  });
}

export type DomainSummary = {
  id: DomainId;
  label: string;
  blurb: string;
  topics: ClassifiedTopic[];
  storyCount: number;
  articleCount: number;
  outletCount: number;
  leanCounts: Record<Lean, number>;
  spread: number;
  balance: number | null;
  stateCount: number;
  latestAt: string;
  /** Share of all classified articles, 0–1. */
  share: number;
};

function emptyLeanCounts(): Record<Lean, number> {
  return {
    "far-left": 0,
    left: 0,
    "centre-left": 0,
    centre: 0,
    "centre-right": 0,
    right: 0,
    "far-right": 0,
    unrated: 0,
  };
}

/** Rolls classified topics up into the fixed domain set. */
export function buildDomains(topics: ClassifiedTopic[]): DomainSummary[] {
  const grouped = new Map<DomainId, ClassifiedTopic[]>();
  for (const topic of topics) {
    if (!topic.domain) continue;
    const list = grouped.get(topic.domain);
    if (list) list.push(topic);
    else grouped.set(topic.domain, [topic]);
  }

  const totalArticles = topics.reduce(
    (sum, topic) => sum + (topic.domain ? topic.articleCount : 0),
    0,
  );

  const summaries: DomainSummary[] = [];
  for (const [id, list] of grouped) {
    const meta = DOMAIN_BY_ID.get(id);
    if (!meta) continue;

    const leanCounts = emptyLeanCounts();
    const outlets = new Set<string>();
    let articleCount = 0;
    let storyCount = 0;
    let stateCount = 0;
    let latestAt = list[0]?.latestAt ?? new Date().toISOString();

    for (const topic of list) {
      storyCount += topic.storyCount;
      articleCount += topic.articleCount;
      stateCount += topic.stateCount;
      if (Date.parse(topic.latestAt) > Date.parse(latestAt)) {
        latestAt = topic.latestAt;
      }
      for (const lean of Object.keys(leanCounts) as Lean[]) {
        leanCounts[lean] += topic.leanCounts[lean] ?? 0;
      }
      for (const cluster of topic.stories) {
        for (const item of cluster.items) outlets.add(outletKey(item));
      }
    }

    summaries.push({
      id,
      label: meta.label,
      blurb: meta.blurb,
      topics: [...list].sort((a, b) => b.articleCount - a.articleCount),
      storyCount,
      articleCount,
      outletCount: outlets.size,
      leanCounts,
      spread: spreadWidth(leanCounts),
      balance: leanBalance(leanCounts),
      stateCount,
      latestAt,
      share: totalArticles ? articleCount / totalArticles : 0,
    });
  }

  return summaries.sort((a, b) => b.articleCount - a.articleCount);
}

/**
 * Article counts per time bucket, for the volume charts.
 *
 * Buckets are returned even when empty so a gap in coverage is drawn as a gap
 * rather than closed up, which would imply continuous coverage that did not
 * happen.
 */
export function volumeSeries(
  clusters: NewsroomCluster[],
  options: { buckets?: number; hours?: number; now?: number } = {},
): Array<{ at: number; count: number }> {
  const buckets = options.buckets ?? 24;
  const hours = options.hours ?? 48;
  const now = options.now ?? Date.now();
  const span = (hours * 60 * 60 * 1000) / buckets;
  const start = now - hours * 60 * 60 * 1000;

  const series = Array.from({ length: buckets }, (_, index) => ({
    at: start + index * span,
    count: 0,
  }));

  for (const cluster of clusters) {
    for (const item of cluster.items) {
      const at = Date.parse(item.publishedAt);
      if (Number.isNaN(at) || at < start || at > now) continue;
      const index = Math.min(buckets - 1, Math.floor((at - start) / span));
      series[index].count += 1;
    }
  }
  return series;
}
