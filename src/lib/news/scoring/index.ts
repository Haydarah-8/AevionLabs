const RELIABLE = new Set([
  "bbc.co.uk",
  "reuters.com",
  "apnews.com",
  "theguardian.com",
  "ft.com",
  "nytimes.com",
  "aljazeera.com",
  "npr.org",
]);

const BREAKING_TERMS = [
  "breaking",
  "explosion",
  "attack",
  "killed",
  "sanctions",
  "invasion",
  "earthquake",
  "coup",
  "crash",
  "hostage",
  "missile",
];

export type ScoreInput = {
  publishedAt: string;
  sourceDomain: string;
  country?: string;
  title: string;
  description: string;
  independentSources: number;
  recentInGroup: number;
};

export type ScoreResult = {
  freshness: number;
  relevance: number;
  engagement: number;
  isBreaking: boolean;
};

export function scoreArticle(input: ScoreInput): ScoreResult {
  const ageHours = Math.max(
    0,
    (Date.now() - Date.parse(input.publishedAt)) / 3_600_000,
  );
  const freshness = Number.isNaN(ageHours) ? 0.4 : 1 / (1 + ageHours / 6);
  const reliability = RELIABLE.has(input.sourceDomain) ? 1 : 0.45;
  const sources = Math.min(1, input.independentSources / 6);
  const velocity = Math.min(1, input.recentInGroup / 4);
  const hay = `${input.title} ${input.description}`.toLowerCase();
  const keyword = BREAKING_TERMS.some((term) => hay.includes(term)) ? 1 : 0.2;
  const geo =
    input.country === "GB" || hay.includes("uk ") || hay.includes("britain")
      ? 0.8
      : 0.4;
  const relevance = Number(
    (
      0.25 * reliability +
      0.2 * sources +
      0.2 * keyword +
      0.15 * geo +
      0.2 * freshness
    ).toFixed(4),
  );
  const engagement = Number((0.6 * velocity + 0.4 * sources).toFixed(4));
  const isBreaking =
    relevance >= 0.62 &&
    freshness >= 0.55 &&
    (input.independentSources >= 2 || (reliability === 1 && keyword === 1));
  return { freshness, relevance, engagement, isBreaking };
}
