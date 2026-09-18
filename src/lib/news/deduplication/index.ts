import {
  buildIdf,
  SAME_STORY,
  similarityTokens,
  weightedSimilarity,
} from "@/lib/news/similarity";

export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(the|a|an|and|or|of|in|on|to|for|with)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

export function titleTokens(title: string): Set<string> {
  return new Set(
    normalizeTitle(title)
      .split(" ")
      .filter((token) => token.length > 2),
  );
}

export function titleSimilarity(a: string, b: string): number {
  const left = titleTokens(a);
  const right = titleTokens(b);
  if (!left.size || !right.size) return 0;
  let overlap = 0;
  for (const token of left) {
    if (right.has(token)) overlap += 1;
  }
  return overlap / (left.size + right.size - overlap);
}

export type SimilarityDetector = {
  similar(a: string, b: string): number;
};

export const lexicalSimilarity: SimilarityDetector = {
  similar: titleSimilarity,
};

export const noopSemanticSimilarity: SimilarityDetector = {
  similar: () => 0,
};

export type ExistingArticle = {
  id: string;
  title: string;
  canonical_url: string | null;
  source_url: string;
  external_id: string;
  provider: string;
  published_at: string;
  duplicate_group_id: string;
};

const WINDOW_MS = 18 * 60 * 60 * 1000;

/**
 * Kept as a fast path for near-verbatim syndication. The real decision is made
 * by the IDF-weighted comparison below — plain Jaccard at this threshold
 * grouped 3 pairs out of a 600-article corpus while roughly ninety genuine
 * same-story pairs went unmatched.
 */
const VERBATIM_THRESHOLD = 0.72;

export function findDuplicate(
  incoming: {
    title: string;
    canonicalUrl?: string;
    sourceUrl: string;
    externalId: string;
    provider: string;
    publishedAt: string;
  },
  existing: ExistingArticle[],
  semantic: SimilarityDetector = noopSemanticSimilarity,
): ExistingArticle | undefined {
  const canonical = incoming.canonicalUrl;
  if (canonical) {
    const byUrl = existing.find(
      (row) =>
        row.canonical_url === canonical ||
        row.source_url === incoming.sourceUrl,
    );
    if (byUrl) return byUrl;
  }

  const byExternal = existing.find(
    (row) =>
      row.provider === incoming.provider &&
      row.external_id === incoming.externalId,
  );
  if (byExternal) return byExternal;

  const incomingKey = normalizeTitle(incoming.title);
  const published = Date.parse(incoming.publishedAt);
  const idf = buildIdf([incoming.title, ...existing.map((row) => row.title)]);
  return existing.find((row) => {
    const delta = Math.abs(Date.parse(row.published_at) - published);
    if (Number.isNaN(delta) || delta > WINDOW_MS) return false;
    if (normalizeTitle(row.title) === incomingKey && incomingKey.length > 12) {
      return true;
    }
    const lexical = titleSimilarity(incoming.title, row.title);
    if (lexical >= VERBATIM_THRESHOLD) return true;
    const extra = semantic.similar(incoming.title, row.title);
    if (extra >= VERBATIM_THRESHOLD) return true;
    // Weighted against the candidate window, so "rare word shared" counts for
    // more than "common word shared" — the same comparison the newsroom uses,
    // so a story grouped on screen is grouped in the database too.
    return (
      weightedSimilarity(
        similarityTokens(incoming.title),
        similarityTokens(row.title),
        idf,
      ) >= SAME_STORY
    );
  });
}
