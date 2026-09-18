"use client";

import { useMemo, useState } from "react";
import {
  balanceWord,
  LEAN_INK,
  SpectrumBar,
  STATE_INK,
} from "@/components/admin/Spectrum";
import { BarList, ColumnChart } from "@/components/admin/charts";
import { Explain } from "@/components/admin/Explain";
import { LEAN_LABELS, LEAN_SCALE, type Lean } from "@/lib/news/lean";
import type { NewsroomItem } from "@/lib/news/newsroom";
import { detectOmissions } from "@/lib/news/omission";
import { topicArticles, type TopicSummary } from "@/lib/news/topics";
import { volumeSeries } from "@/lib/news/taxonomy";
import {
  PlainHeading,
  plainHoverRow,
} from "@/components/admin/plain";

const MICRO =
  "text-[0.8rem] text-[#737373] font-semibold";
const CONTROL =
  "text-[0.8rem] font-semibold transition-colors";

function ago(iso: string) {
  const at = Date.parse(iso);
  if (Number.isNaN(at)) return "";
  const diff = Date.now() - at;
  if (diff < 60 * 60 * 1000) return `${Math.max(1, Math.round(diff / 60000))}m`;
  if (diff < 24 * 60 * 60 * 1000) return `${Math.round(diff / 3600000)}h`;
  return `${Math.round(diff / 86400000)}d`;
}

/**
 * Everything the desk knows about one subject: how the coverage splits across
 * the scale, which outlets carried it from where, and every article behind it.
 */
export function TopicModalBody({
  topic,
  allItems,
  onOpenStory,
  onOpenOutlet,
  onOpenLean,
}: {
  topic: TopicSummary;
  /** The whole corpus, needed to tell silence apart from absence. */
  allItems: NewsroomItem[];
  onOpenStory: (item: NewsroomItem) => void;
  onOpenOutlet: (outletName: string) => void;
  /** Opens one point of the scale across the whole corpus. */
  onOpenLean: (lean: Lean) => void;
}) {
  const [tab, setTab] = useState<"outlets" | "articles">("outlets");
  const articles = useMemo(() => topicArticles(topic), [topic]);
  const omissions = useMemo(
    () => detectOmissions(topic, allItems),
    [topic, allItems],
  );
  const volume = useMemo(
    () => volumeSeries(topic.stories, { buckets: 24, hours: 48 }),
    [topic.stories],
  );

  const byLean = useMemo(() => {
    const groups = new Map<Lean, typeof topic.outlets>();
    for (const outlet of topic.outlets) {
      const list = groups.get(outlet.lean);
      if (list) list.push(outlet);
      else groups.set(outlet.lean, [outlet]);
    }
    return groups;
  }, [topic]);

  return (
    <div className="space-y-12">
      <section>
        <SpectrumBar counts={topic.leanCounts} height={4} />
        <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4 lg:grid-cols-8">
          {[...LEAN_SCALE, "unrated" as Lean].map((lean) => (
            <button
              key={lean}
              type="button"
              onClick={() => onOpenLean(lean)}
              className="flex flex-col text-left transition-opacity hover:opacity-70"
              aria-label={LEAN_LABELS[lean] + " coverage — open detail"}
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
                {topic.leanCounts[lean] ?? 0}
              </span>
            </button>
          ))}
        </div>
        {topic.stateCount ? (
          <p className="mt-6 text-[0.82rem] leading-relaxed text-[#737373]">
            {topic.stateCount} article{topic.stateCount === 1 ? "" : "s"} from
            state-controlled outlets, counted off the left–right scale.
          </p>
        ) : null}
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
            rows={topic.outlets.slice(0, 8).map((outlet) => ({
              id: outlet.name,
              label: outlet.name,
              value: outlet.articles,
              ink: outlet.stateControlled
                ? STATE_INK
                : LEAN_INK[outlet.lean],
              note: outlet.stateControlled
                ? "state"
                : LEAN_LABELS[outlet.lean].toLowerCase(),
            }))}
            onSelect={onOpenOutlet}
          />
        </div>
      </section>

      <section className="border-t border-black/10 pt-10">
        <PlainHeading
          note={`${omissions.coveringOutlets} of ${omissions.activeOutlets} active`}
        >
          <Explain id="omission">Who is not covering it</Explain>
        </PlainHeading>

        {/* A one-sided topic is the finding this panel exists for, so it is the
            one line here that earns colour. */}
        <p
          className={`text-sm leading-relaxed ${
            omissions.oneSided
              ? "font-medium text-[#c9963f]"
              : "text-[#737373]"
          }`}
        >
          {omissions.note}
        </p>

        {omissions.silent.length ? (
          <ul className="mt-5 grid grid-cols-1 gap-x-10 sm:grid-cols-2">
            {omissions.silent.slice(0, 16).map((outlet) => (
              <li
                key={outlet.outlet}
                className={`transition-colors ${plainHoverRow}`}
              >
                <button
                  type="button"
                  onClick={() => onOpenOutlet(outlet.name)}
                  className="flex w-full items-baseline justify-between gap-3 py-2.5 text-left"
                >
                  <span className="flex items-baseline gap-2">
                    <span
                      aria-hidden
                      className="h-1.5 w-4 shrink-0 rounded-sm"
                      style={{ backgroundColor: LEAN_INK[outlet.lean] }}
                    />
                    <span className="text-sm text-[#111] transition-colors hover:text-black">
                      {outlet.name}
                    </span>
                  </span>
                  <span className="text-[0.82rem] tabular-nums text-[#737373]">
                    {outlet.published} other
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <p className="mt-5 max-w-2xl text-[0.8rem] leading-relaxed text-[#a3a3a3]">
          Only outlets that published something else in the same window are
          counted as silent — an outlet that published nothing at all has a
          broken feed, not an editorial position.
        </p>
      </section>

      <section className="border-t border-black/10 pt-10">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-4 border-b border-black/10 pb-2.5">
          {/* Not PlainHeading: the tabs sit opposite the title rather than
              beside it, so the rule and type are borrowed and the layout is
              this section's own. */}
          <h3 className="text-[1.05rem] font-medium text-[#111]">
            <Explain id={tab === "outlets" ? "outlet" : "article"}>
              {tab === "outlets" ? "Who is covering it" : "Every article"}
            </Explain>
          </h3>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setTab("outlets")}
              className={`${CONTROL} ${
                tab === "outlets"
                  ? "text-[#111]"
                  : "text-[#737373] hover:text-[#737373]"
              }`}
            >
              Outlets {topic.outletCount}
            </button>
            <button
              type="button"
              onClick={() => setTab("articles")}
              className={`${CONTROL} ${
                tab === "articles"
                  ? "text-[#111]"
                  : "text-[#737373] hover:text-[#737373]"
              }`}
            >
              Articles {articles.length}
            </button>
          </div>
        </div>

        {tab === "outlets" ? (
          <div className="grid grid-cols-1 gap-x-12 gap-y-8 sm:grid-cols-2">
            {[...LEAN_SCALE, "unrated" as Lean]
              .filter((lean) => byLean.get(lean)?.length)
              .map((lean) => (
                <div key={lean}>
                  <div className="mb-3 flex items-center gap-2">
                    <span
                      aria-hidden
                      className="h-1.5 w-4 shrink-0 rounded-sm"
                      style={{ backgroundColor: LEAN_INK[lean] }}
                    />
                    <span className="text-[0.8rem] text-[#737373]">
                      {LEAN_LABELS[lean]}
                    </span>
                  </div>
                  <ul>
                    {byLean.get(lean)?.map((outlet) => (
                      <li
                        key={outlet.name}
                className={`transition-colors ${plainHoverRow}`}
                      >
                        <button
                          type="button"
                          onClick={() => onOpenOutlet(outlet.name)}
                          className="flex w-full items-baseline justify-between gap-3 py-2.5 text-left"
                        >
                          <span className="text-sm text-[#111] transition-colors hover:text-black">
                            {outlet.name}
                            {outlet.stateControlled ? (
                              <span className="ml-2 text-[0.8rem] text-[#737373]">
                                State
                              </span>
                            ) : null}
                          </span>
                          <span className="text-[0.82rem] tabular-nums text-[#737373]">
                            {outlet.articles}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        ) : (
          <ul>
            {articles.slice(0, 150).map((item) => (
              <li
                key={item.key}
                className={`py-3 transition-colors ${plainHoverRow}`}
              >
                <div className="flex flex-wrap items-baseline gap-x-4">
                  <span className={MICRO}>{item.source}</span>
                  <span className="text-[0.8rem] text-[#a3a3a3]">
                    {ago(item.publishedAt)}
                  </span>
                  {item.imported ? (
                    <span className="text-[0.8rem] text-[#a3a3a3]">
                      Drafted
                    </span>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => onOpenStory(item)}
                  className="mt-1 block w-full text-left text-sm leading-snug text-[#111] transition-colors hover:text-black"
                >
                  {item.title}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export function topicEyebrow(topic: TopicSummary) {
  return `${topic.storyCount} stories · ${topic.articleCount} articles · ${topic.outletCount} outlets · ${topic.spread}/7 sides · ${balanceWord(topic.balance)}`;
}
