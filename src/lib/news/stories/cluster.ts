import { findDuplicate, type ExistingArticle } from "@/lib/news/deduplication";
import { outletKeyFromUrl } from "@/lib/news/outlet";
import { breakingScore, isBreakingStory } from "@/lib/news/scoring/breaking";

export type StoryRecord = {
  id: string;
  headline: string;
  summary: string;
  category: string;
  source_count: number;
  importance_score: number;
  breaking_score: number;
  duplicate_group_id: string | null;
};

export function clusterArticle(input: {
  title: string;
  description: string;
  canonicalUrl?: string;
  sourceUrl: string;
  externalId: string;
  provider: string;
  publishedAt: string;
  category: string;
  trustScore: number;
  existing: ExistingArticle[];
  stories: StoryRecord[];
}): {
  story: StoryRecord;
  duplicate?: ExistingArticle;
  created: boolean;
} {
  const duplicate = findDuplicate(input, input.existing);
  if (duplicate) {
    const existingStory = input.stories.find(
      (story) =>
        story.duplicate_group_id === duplicate.duplicate_group_id ||
        story.id === duplicate.duplicate_group_id,
    ) ?? {
      id: duplicate.duplicate_group_id,
      headline: duplicate.title,
      summary: input.description,
      category: input.category,
      source_count: 1,
      importance_score: 0.4,
      breaking_score: 0,
      duplicate_group_id: duplicate.duplicate_group_id,
    };
    // Count the outlets actually in this group rather than incrementing on
    // every match — the same article re-ingested must not inflate the story.
    const groupId = duplicate.duplicate_group_id;
    const outlets = new Set<string>();
    for (const row of input.existing) {
      if (row.duplicate_group_id !== groupId) continue;
      const key = outletKeyFromUrl(row.canonical_url || row.source_url);
      if (key) outlets.add(key);
    }
    const incoming = outletKeyFromUrl(input.canonicalUrl || input.sourceUrl);
    if (incoming) outlets.add(incoming);
    const sourceCount = Math.max(1, outlets.size);
    const score = breakingScore({
      freshness: 0.8,
      independentSources: sourceCount,
      trustScore: input.trustScore,
      recentInGroup: sourceCount,
    });
    return {
      created: false,
      duplicate,
      story: {
        ...existingStory,
        source_count: sourceCount,
        breaking_score: score,
        importance_score: Math.max(existingStory.importance_score, score),
      },
    };
  }

  const id = crypto.randomUUID();
  const score = breakingScore({
    freshness: 1,
    independentSources: 1,
    trustScore: input.trustScore,
    recentInGroup: 1,
  });
  return {
    created: true,
    story: {
      id,
      headline: input.title,
      summary: input.description.slice(0, 400),
      category: input.category,
      source_count: 1,
      importance_score: score,
      breaking_score: score,
      duplicate_group_id: id,
    },
  };
}

export { isBreakingStory };
