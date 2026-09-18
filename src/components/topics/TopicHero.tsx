"use client";

import { FadeIn, RevealLines } from "@/components/anim/text";
import { TopicBrandMark } from "@/components/home/ClientLogos";
import { kindLabel, type Topic } from "@/data/topics";

function hostLabel(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "");
  }
}

export function TopicHero({ topic }: { topic: Topic }) {
  return (
    <header className="topic-hero">
      <div className="topic-row is-hero">
        <p className="topic-kicker">{kindLabel(topic.kind)}</p>
        <div className="topic-copy">
          <TopicBrandMark slug={topic.slug} />
          <RevealLines as="h1" className="topic-hero-name" trigger="intro">
            {topic.name}
          </RevealLines>
          <FadeIn
            as="p"
            className="topic-hero-lede"
            trigger="intro"
            delay={0.08}
          >
            {topic.lede}
          </FadeIn>
          {topic.officialUrl ? (
            <a
              className="topic-hero-visit"
              href={topic.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {hostLabel(topic.officialUrl)}
            </a>
          ) : null}
        </div>
      </div>
    </header>
  );
}
