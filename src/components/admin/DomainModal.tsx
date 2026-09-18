"use client";

import { useMemo } from "react";
import { BarList, ColumnChart } from "@/components/admin/charts";
import { Explain } from "@/components/admin/Explain";
import {
  balanceWord,
  LEAN_INK,
  SpectrumBar,
  STATE_INK,
} from "@/components/admin/Spectrum";
import {
  leanForOutlet,
  LEAN_LABELS,
  LEAN_SCALE,
  type Lean,
} from "@/lib/news/lean";
import type { NewsroomItem } from "@/lib/news/newsroom";
import { outletKey } from "@/lib/news/outlet";
import {
  REACH_LABEL,
  volumeSeries,
  type DomainSummary,
} from "@/lib/news/taxonomy";
import {
  PlainHeading,
  plainHoverRow,
} from "@/components/admin/plain";

const MICRO =
  "text-[0.8rem] text-[#737373] font-semibold";

/* The domain summary keeps counts, not ratings, so these re-derive per item. */
const topicLean = (item: NewsroomItem): Lean => leanForOutlet(item).lean;
const isState = (item: NewsroomItem): boolean =>
  leanForOutlet(item).stateControlled;

/**
 * A whole subject area: every topic inside it, how the coverage splits, and
 * which outlets are driving it.
 *
 * This is the level the desk plans at — "what is happening in Energy" is a
 * question the topic list could not answer, because it only ever showed one
 * subject at a time.
 */
export function DomainModalBody({
  domain,
  onOpenTopic,
  onOpenOutlet,
  onOpenStory,
  onOpenLean,
}: {
  domain: DomainSummary;
  onOpenTopic: (id: string) => void;
  onOpenOutlet: (outlet: string) => void;
  onOpenStory: (item: NewsroomItem) => void;
  onOpenLean: (lean: Lean) => void;
}) {
  const volume = useMemo(
    () =>
      volumeSeries(
        domain.topics.flatMap((topic) => topic.stories),
        { buckets: 24, hours: 48 },
      ),
    [domain.topics],
  );

  const outlets = useMemo(() => {
    const map = new Map<
      string,
      { key: string; name: string; lean: Lean; state: boolean; count: number }
    >();
    for (const topic of domain.topics) {
      for (const cluster of topic.stories) {
        for (const item of cluster.items) {
          const key = outletKey(item);
          const found = map.get(key);
          if (found) {
            found.count += 1;
            continue;
          }
          map.set(key, {
            key,
            name: item.source,
            lean: topicLean(item),
            state: isState(item),
            count: 1,
          });
        }
      }
    }
    return [...map.values()].sort((a, b) => b.count - a.count);
  }, [domain.topics]);

  const stories = useMemo(
    () =>
      domain.topics
        .flatMap((topic) => topic.stories)
        .sort(
          (a, b) =>
            b.sourceCount - a.sourceCount ||
            Date.parse(b.latestAt) - Date.parse(a.latestAt),
        )
        .slice(0, 40),
    [domain.topics],
  );

  return (
    <div className="space-y-12">
      <section>
        <p className="mb-5 max-w-2xl text-sm leading-relaxed text-[#737373]">
          {domain.blurb}
        </p>
        <SpectrumBar counts={domain.leanCounts} height={4} />
        <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4 lg:grid-cols-7">
          {LEAN_SCALE.map((lean) => (
            <button
              key={lean}
              type="button"
              onClick={() => onOpenLean(lean)}
              className="flex flex-col text-left transition-opacity hover:opacity-70"
              aria-label={`${LEAN_LABELS[lean]} coverage — open detail`}
            >
              <span className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="h-1.5 w-4 shrink-0 rounded-sm"
                  style={{ backgroundColor: LEAN_INK[lean] }}
                />
                <span className="text-[0.8rem] text-[#737373]">
                  {LEAN_LABELS[lean]}
                </span>
              </span>
              <span className="mt-2 text-[1.35rem] font-medium leading-none tabular-nums text-[#111]">
                {domain.leanCounts[lean] ?? 0}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2">
          <span className={MICRO}>
            <span className="text-[#111]">
              {domain.storyCount}
            </span>{" "}
            stories
          </span>
          <span className={MICRO}>
            <span className="text-[#111]">
              {domain.articleCount}
            </span>{" "}
            articles
          </span>
          <span className={MICRO}>
            <span className="text-[#111]">
              {domain.outletCount}
            </span>{" "}
            outlets
          </span>
          <span className={MICRO}>{domain.spread}/7 sides</span>
          <span className={MICRO}>{balanceWord(domain.balance)}</span>
          <span className={MICRO}>
            <span className="text-[#111]">
              {Math.round(domain.share * 100)}%
            </span>{" "}
            of classified coverage
          </span>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-10 border-t border-black/10 pt-10 lg:grid-cols-2">
        <div>
          <PlainHeading>
            <Explain id="article">When it was published</Explain>
          </PlainHeading>
          <ColumnChart
            series={volume}
            height={72}
            formatLabel={(at) =>
              new Date(at).toLocaleString([], {
                weekday: "short",
                hour: "2-digit",
              })
            }
          />
        </div>
        <div>
          <PlainHeading>
            <Explain id="outlet">Loudest outlets</Explain>
          </PlainHeading>
          <BarList
            rows={outlets.slice(0, 8).map((outlet) => ({
              id: outlet.key,
              label: outlet.name,
              value: outlet.count,
              ink: outlet.state ? STATE_INK : LEAN_INK[outlet.lean],
              note: outlet.state
                ? "state"
                : LEAN_LABELS[outlet.lean].toLowerCase(),
            }))}
            onSelect={onOpenOutlet}
          />
        </div>
      </section>

      <section className="border-t border-black/10 pt-10">
        <PlainHeading note={`${domain.topics.length} topics`}>
          <Explain id="topic">Topics in this area</Explain>
        </PlainHeading>
        <ul>
          {domain.topics.map((topic) => (
            <li
              key={topic.id}
              className={`py-3.5 transition-colors ${plainHoverRow}`}
            >
              <button
                type="button"
                onClick={() => onOpenTopic(topic.id)}
                className="block w-full text-left"
              >
                <span className="flex flex-wrap items-baseline justify-between gap-3">
                  <span className="flex items-baseline gap-3">
                    <span className="text-sm font-semibold text-[#111]">
                      {topic.label}
                    </span>
                    <span className="text-[0.8rem] text-[#a3a3a3]">
                      {REACH_LABEL[topic.reach]}
                    </span>
                  </span>
                  <span className="text-[0.82rem] tabular-nums text-[#737373]">
                    {topic.articleCount}
                  </span>
                </span>
                <span className="mt-2 block">
                  <SpectrumBar counts={topic.leanCounts} height={2} />
                </span>
                <span className="mt-2 block text-[0.8rem] text-[#a3a3a3]">
                  {topic.storyCount} stories · {topic.outletCount} outlets ·{" "}
                  {topic.spread}/7 sides · {balanceWord(topic.balance)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-black/10 pt-10">
        <PlainHeading>
          <Explain id="story">Most corroborated stories</Explain>
        </PlainHeading>
        <ul>
          {stories.map((cluster) => (
            <li
              key={cluster.key}
              className={`py-3 transition-colors ${plainHoverRow}`}
            >
              <div className="flex flex-wrap items-baseline gap-x-3">
                <span className={MICRO}>{cluster.lead.source}</span>
                {cluster.sourceCount > 1 ? (
                  <span className="text-[0.8rem] text-[#737373]">
                    +{cluster.sourceCount - 1} more
                  </span>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => onOpenStory(cluster.lead)}
                className="mt-1 block w-full text-left text-sm leading-snug text-[#111] transition-colors hover:text-black"
              >
                {cluster.lead.title}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
