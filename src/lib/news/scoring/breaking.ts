export type BreakingInput = {
  freshness: number;
  independentSources: number;
  trustScore: number;
  recentInGroup: number;
  topicWeight?: number;
};

const BREAKING_THRESHOLD = 0.72;

export function breakingScore(input: BreakingInput): number {
  const freshness = clamp(input.freshness);
  const sources = clamp(input.independentSources / 5);
  const trust = clamp(input.trustScore);
  const velocity = clamp(input.recentInGroup / 4);
  const topic = clamp(input.topicWeight ?? 0.4);
  return Number(
    (
      0.28 * freshness +
      0.24 * sources +
      0.18 * trust +
      0.2 * velocity +
      0.1 * topic
    ).toFixed(4),
  );
}

export function isBreakingStory(
  score: number,
  threshold = BREAKING_THRESHOLD,
): boolean {
  return score >= threshold;
}

function clamp(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}
