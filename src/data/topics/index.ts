import { COMPANY_TOPICS } from "@/data/topics/companies";
import { SERVICE_TOPICS } from "@/data/topics/services";
import { TECHNOLOGY_TOPICS } from "@/data/topics/technologies";
import type { Topic } from "@/data/topics/types";
import { serviceHref, topicSlug, withHref } from "@/lib/topic-slug";

export type { Topic, TopicExample, TopicKind } from "@/data/topics/types";
export { enrichTopic } from "@/data/topics/enrich";

export { SERVICE_TOPICS };

export const PLATFORM_TOPICS: Topic[] = [
  ...COMPANY_TOPICS,
  ...TECHNOLOGY_TOPICS,
];

const PLATFORM_BY_SLUG = new Map(
  PLATFORM_TOPICS.map((topic) => [topic.slug, topic]),
);
const SERVICE_BY_SLUG = new Map(
  SERVICE_TOPICS.map((topic) => [topic.slug, topic]),
);

export function getPlatformTopic(slug: string) {
  return PLATFORM_BY_SLUG.get(topicSlug(slug));
}

export function getServiceTopic(slug: string) {
  return SERVICE_BY_SLUG.get(topicSlug(slug));
}

export function getAnyTopic(slug: string) {
  return getServiceTopic(slug) ?? getPlatformTopic(slug);
}

export function hrefForTopic(topic: Topic) {
  return topic.kind === "service"
    ? serviceHref(topic.slug)
    : withHref(topic.slug);
}

export function hrefForSlug(slug: string) {
  const topic = getAnyTopic(slug);
  if (!topic) return withHref(slug);
  return hrefForTopic(topic);
}

export function relatedTopics(topic: Topic) {
  return topic.related
    .map((slug) => getAnyTopic(slug))
    .filter((item): item is Topic => Boolean(item && item.slug !== topic.slug));
}

export function platformNeighbors(slug: string) {
  const index = PLATFORM_TOPICS.findIndex((topic) => topic.slug === slug);
  if (index < 0) return { prev: null, next: null };
  const last = PLATFORM_TOPICS.length;
  return {
    prev: PLATFORM_TOPICS[(index - 1 + last) % last],
    next: PLATFORM_TOPICS[(index + 1) % last],
  };
}

export function kindLabel(kind: Topic["kind"]) {
  if (kind === "company") return "Company";
  if (kind === "technology") return "Technology";
  return "Service";
}
