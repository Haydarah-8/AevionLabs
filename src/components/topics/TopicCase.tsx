"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { FadeIn } from "@/components/anim/text";
import { IntroContext } from "@/components/anim/useIntro";
import { TopicHero } from "@/components/topics/TopicHero";
import {
  enrichTopic,
  hrefForTopic,
  platformNeighbors,
  type Topic,
} from "@/data/topics";

function TopicIntro({ children }: { children: ReactNode }) {
  const [introToken, setIntroToken] = useState(0);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setIntroToken(1));
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <IntroContext.Provider
      value={{ introToken, fireIntro: () => setIntroToken((n) => n + 1) }}
    >
      {children}
    </IntroContext.Provider>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="topic-row">
      <h2 className="topic-kicker">{label}</h2>
      <FadeIn className="topic-copy">{children}</FadeIn>
    </section>
  );
}

export function TopicCase({ topic }: { topic: Topic }) {
  const detail = enrichTopic(topic);
  const next = platformNeighbors(topic.slug).next;

  return (
    <TopicIntro>
      <article className="topic-page">
        <TopicHero topic={topic} />

        <div className="topic-body">
          {detail.what.length ? (
            <Section label="What it is">
              {detail.what.map((paragraph) => (
                <p key={paragraph.slice(0, 32)} className="topic-p">
                  {paragraph}
                </p>
              ))}
            </Section>
          ) : null}

          {detail.usedFor.length ? (
            <Section label="What it does">
              {detail.usedFor.map((paragraph) => (
                <p key={paragraph.slice(0, 32)} className="topic-p">
                  {paragraph}
                </p>
              ))}
            </Section>
          ) : null}

          {topic.headline || detail.aside || detail.note ? (
            <Section label="Why we use it">
              {topic.headline ? (
                <p className="topic-lead">{topic.headline}</p>
              ) : null}
              {detail.aside ? <p className="topic-p">{detail.aside}</p> : null}
              {detail.note ? <p className="topic-p">{detail.note}</p> : null}
            </Section>
          ) : null}

          {detail.knownUsers.length ? (
            <Section label="Built on it">
              <ul className="topic-built">
                {detail.knownUsers.map((user) => (
                  <li key={user.name}>
                    <p>{user.name}</p>
                    <p>{user.note}</p>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {next ? (
            <Link href={hrefForTopic(next)} className="topic-row topic-next">
              <span className="topic-kicker">Next</span>
              <span className="topic-next-name">{next.name}</span>
            </Link>
          ) : null}
        </div>
      </article>
    </TopicIntro>
  );
}
