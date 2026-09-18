import { normalizeTitle } from "@/lib/news/deduplication";

/**
 * Headline similarity, weighted by how rare each shared word is.
 *
 * Plain Jaccard treats every token alike, so two headlines that share only
 * "Trump" score the same as two that share only "Warsh" — but the first pair
 * is probably two different stories about the same man, and the second is
 * almost certainly one story. Weighting by inverse document frequency is what
 * separates "same subject" from "same event", and that distinction is the
 * whole job here.
 *
 * Measured on a 600-article corpus, plain Jaccard at 0.72 grouped 3 pairs
 * while roughly ninety genuine same-story pairs sat between 0.30 and 0.72,
 * unmatched.
 */

/** Small numbers written either way must agree: "six-month" vs "6-month". */
const NUMBER_WORDS: Record<string, string> = {
  "0": "zero", "1": "one", "2": "two", "3": "three", "4": "four",
  "5": "five", "6": "six", "7": "seven", "8": "eight", "9": "nine",
  "10": "ten", "11": "eleven", "12": "twelve", "20": "twenty",
  "30": "thirty", "40": "forty", "50": "fifty", "100": "hundred",
};

/**
 * Light suffix stripping. Deliberately crude — a real stemmer would be a
 * dependency, and the only job here is making "drone"/"drones" and
 * "announce"/"announces" agree.
 */
export function stemToken(token: string): string {
  const spelled = NUMBER_WORDS[token];
  if (spelled) return spelled;
  if (token.length <= 4) return token;
  if (token.endsWith("ies") && token.length > 5) {
    return `${token.slice(0, -3)}y`;
  }
  if (token.endsWith("sses") || token.endsWith("shes") || token.endsWith("ches")) {
    return token.slice(0, -2);
  }
  if (token.endsWith("s") && !token.endsWith("ss") && !token.endsWith("us")) {
    return token.slice(0, -1);
  }
  if (token.endsWith("ing") && token.length > 6) return token.slice(0, -3);
  if (token.endsWith("ed") && token.length > 5) return token.slice(0, -2);
  return token;
}

/** Stemmed, stopworded tokens of a headline. */
export function similarityTokens(title: string): Set<string> {
  return new Set(
    normalizeTitle(title)
      .split(" ")
      .filter((token) => token.length > 2)
      .map(stemToken),
  );
}

export type IdfTable = {
  weight(token: string): number;
  documents: number;
};

/**
 * Inverse document frequency over the corpus being clustered.
 *
 * Built from the corpus itself rather than a fixed list, so a term that is
 * everywhere today ("Trump") is discounted today, and the same term is
 * informative again in a week when it is not.
 */
export function buildIdf(titles: string[]): IdfTable {
  const df = new Map<string, number>();
  for (const title of titles) {
    for (const token of similarityTokens(title)) {
      df.set(token, (df.get(token) ?? 0) + 1);
    }
  }
  const total = Math.max(1, titles.length);
  return {
    documents: total,
    weight(token: string) {
      /**
       * log(1 + N/df) rather than the textbook log(N/df), because the latter
       * reaches exactly zero for a term present in every document — and on a
       * small or homogeneous set that is every term, so every weight collapses
       * to zero and nothing can ever match anything.
       *
       * That case is reachable in production, not just in tests: the desk
       * clusters the *filtered* article list, which can be a handful of
       * near-identical headlines. This form stays strictly positive, so a
       * common term is merely weak evidence rather than no evidence.
       */
      return Math.log(1 + total / ((df.get(token) ?? 0) + 0.5));
    },
  };
}

/**
 * Cosine similarity over IDF-weighted binary vectors, in 0..1.
 *
 * Cosine rather than weighted Jaccard because headlines differ a lot in
 * length — "Iran war hits 6-month mark" against a twenty-word headline should
 * not be penalised for the words the longer one adds, only rewarded for what
 * they share.
 */
export function weightedSimilarity(
  a: Set<string>,
  b: Set<string>,
  idf: IdfTable,
): number {
  if (!a.size || !b.size) return 0;

  let shared = 0;
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  for (const token of small) {
    if (large.has(token)) {
      const w = idf.weight(token);
      shared += w * w;
    }
  }
  if (!shared) return 0;

  let normA = 0;
  for (const token of a) {
    const w = idf.weight(token);
    normA += w * w;
  }
  let normB = 0;
  for (const token of b) {
    const w = idf.weight(token);
    normB += w * w;
  }
  if (!normA || !normB) return 0;

  return shared / Math.sqrt(normA * normB);
}

/**
 * The bar two headlines must clear to be called the same story.
 *
 * Tuned against a real corpus: at 0.52 every pair a human would call the same
 * event grouped, and the highest-scoring unrelated pair — two separate stories
 * that merely shared a prominent name — sat below it.
 */
export const SAME_STORY = 0.52;
