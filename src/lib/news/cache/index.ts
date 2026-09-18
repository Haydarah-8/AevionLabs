import type { NormalizedArticle } from "@/lib/news/types";

const cache = new Map<string, { at: number; articles: NormalizedArticle[] }>();

export function rememberProviderSuccess(
  provider: string,
  articles: NormalizedArticle[],
) {
  cache.set(provider, { at: Date.now(), articles });
}

export function lastProviderSuccess(provider: string): NormalizedArticle[] {
  return cache.get(provider)?.articles ?? [];
}
