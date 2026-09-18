import type { NewsCategory } from "@/lib/news/categories";

export type NewsProviderId =
  | "rss"
  | "gdelt"
  | "newsdata"
  | "currents"
  | "gnews"
  | "guardian";

export type NormalizedArticle = {
  externalId: string;
  provider: NewsProviderId;
  title: string;
  description: string;
  content: string;
  sourceName: string;
  sourceDomain: string;
  sourceUrl: string;
  canonicalUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  videoType?: string;
  videoThumbnail?: string;
  author?: string;
  publishedAt: string;
  category: NewsCategory;
  subcategory?: string;
  country?: string;
  language: string;
  tags: string[];
  keywords: string[];
};

export type NewsArticleRow = {
  id: string;
  external_id: string;
  provider: NewsProviderId;
  source_name: string;
  source_domain: string;
  source_url: string;
  canonical_url: string | null;
  title: string;
  description: string;
  content: string;
  author: string | null;
  image_url: string | null;
  video_url: string | null;
  video_type: string | null;
  video_thumbnail: string | null;
  published_at: string;
  first_seen_at: string;
  updated_at: string;
  category: string;
  subcategory: string | null;
  country: string | null;
  language: string;
  tags: string[];
  keywords: string[];
  is_breaking: boolean;
  is_featured: boolean;
  relevance_score: number;
  freshness_score: number;
  engagement_score: number;
  duplicate_group_id: string;
  status: "visible" | "hidden";
  short_summary: string | null;
  key_points: unknown;
  ai_topic: string | null;
  sentiment: string | null;
  entities: unknown;
  ai_tags: string[] | null;
};

export type StorySource = {
  name: string;
  url: string;
  domain: string;
  provider: string;
};

export type StoryGroup = {
  id: string;
  title: string;
  description: string;
  category: string;
  publishedAt: string;
  imageUrl?: string;
  videoUrl?: string;
  isBreaking: boolean;
  isFeatured: boolean;
  hasVideo: boolean;
  sourceCount: number;
  sources: StorySource[];
  primaryUrl: string;
  shortSummary?: string;
};
