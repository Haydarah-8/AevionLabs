import type { NewsProviderId, NormalizedArticle } from "@/lib/news/types";

export type ProviderHealth = {
  ok: boolean;
  message?: string;
};

export type NewsProvider = {
  id: NewsProviderId;
  minIntervalMs: number;
  configured(): boolean;
  fetchLatest(): Promise<NormalizedArticle[]>;
  search(query: string): Promise<NormalizedArticle[]>;
  fetchByCategory(category: string): Promise<NormalizedArticle[]>;
  healthCheck(): Promise<ProviderHealth>;
};
