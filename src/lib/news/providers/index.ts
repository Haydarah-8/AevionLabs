import { currentsProvider } from "@/lib/news/providers/currents";
import { gdeltProvider } from "@/lib/news/providers/gdelt";
import { gnewsProvider } from "@/lib/news/providers/gnews";
import { guardianProvider } from "@/lib/news/providers/guardian";
import { newsdataProvider } from "@/lib/news/providers/newsdata";
import { rssProvider } from "@/lib/news/providers/rss";
import type { NewsProvider } from "@/lib/news/providers/types";
import type { NewsProviderId } from "@/lib/news/types";

export const NEWS_PROVIDERS: NewsProvider[] = [
  rssProvider,
  gdeltProvider,
  newsdataProvider,
  currentsProvider,
  gnewsProvider,
  guardianProvider,
];

export function getProvider(id: string): NewsProvider | undefined {
  return NEWS_PROVIDERS.find((provider) => provider.id === id);
}

export function configuredProviders(): NewsProvider[] {
  return NEWS_PROVIDERS.filter((provider) => provider.configured());
}

export const PROVIDER_IDS: NewsProviderId[] = NEWS_PROVIDERS.map(
  (provider) => provider.id,
);
