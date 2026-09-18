"use client";

import { useMemo } from "react";
import { balanceWord, LEAN_INK, SpectrumBar } from "@/components/admin/Spectrum";
import { LEAN_LABELS, leanForOutlet, type Lean } from "@/lib/news/lean";
import type { NewsroomCluster, NewsroomItem } from "@/lib/news/newsroom";
import { outletKey } from "@/lib/news/outlet";
import type { TopicSummary } from "@/lib/news/topics";
import type { DomainSummary } from "@/lib/news/taxonomy";
import {
  plainHoverRow,
} from "@/components/admin/plain";

export type StatKind =
  | "stories"
  | "articles"
  | "outlets"
  | "topics"
  | "domains"
  | "contested"
  | "undrafted";

export const STAT_TITLE: Record<StatKind, string> = {
  stories: "Stories",
  articles: "Articles",
  outlets: "Outlets",
  topics: "Topics",
  domains: "Subject Areas",
  contested: "Contested Topics",
  undrafted: "Undrafted",
};

export const STAT_BLURB: Record<StatKind, string> = {
  stories:
    "Each row is one event, with every outlet that ran it folded into it.",
  articles: "Every article in the corpus, newest first.",
  outlets: "Who is publishing, how much, and from where on the scale.",
  topics: "Specific subjects the wire is currently carrying.",
  domains:
    "The fixed subject areas those topics roll up into — stable week to week, so they can be compared.",
  contested:
    "Topics covered from three or more points on the scale — where framing diverges most.",
  undrafted: "Nothing has been written from these yet.",
};

const MICRO =
  "text-[0.8rem] text-[#737373] font-semibold";

function ago(iso: string) {
  const at = Date.parse(iso);
  if (Number.isNaN(at)) return "";
  const diff = Date.now() - at;
  if (diff < 60 * 60 * 1000) return `${Math.max(1, Math.round(diff / 60000))}m`;
  if (diff < 24 * 60 * 60 * 1000) return `${Math.round(diff / 3600000)}h`;
  return `${Math.round(diff / 86400000)}d`;
}

/**
 * The detail behind a headline number. A statistic on its own is a claim;
 * this is the working that backs it, and every row drills further.
 */
export function StatModalBody({
  kind,
  items,
  clusters,
  topics,
  domains,
  onOpenStory,
  onOpenTopic,
  onOpenOutlet,
}: {
  kind: StatKind;
  items: NewsroomItem[];
  clusters: NewsroomCluster[];
  topics: TopicSummary[];
  domains: DomainSummary[];
  onOpenStory: (item: NewsroomItem) => void;
  onOpenTopic: (id: string) => void;
  onOpenOutlet: (outlet: string) => void;
}) {
  const outlets = useMemo(() => {
    const map = new Map<
      string,
      { key: string; name: string; lean: Lean; state: boolean; count: number }
    >();
    for (const item of items) {
      const key = outletKey(item);
      const rating = leanForOutlet(item);
      const found = map.get(key);
      if (found) found.count += 1;
      else {
        map.set(key, {
          key,
          name: item.source,
          lean: rating.lean,
          state: rating.stateControlled,
          count: 1,
        });
      }
    }
    return [...map.values()].sort((a, b) => b.count - a.count);
  }, [items]);

  if (kind === "outlets") {
    const max = outlets[0]?.count ?? 1;
    return (
      <ul>
        {outlets.map((outlet) => (
          <li
            key={outlet.key}
            className={`py-3 transition-colors ${plainHoverRow}`}
          >
            <button
              type="button"
              onClick={() => onOpenOutlet(outlet.key)}
              className="grid w-full grid-cols-[1fr_auto] items-center gap-4 text-left"
            >
              <span className="min-w-0">
                <span className="flex items-baseline gap-3">
                  <span className="truncate text-sm font-semibold text-[#111]">
                    {outlet.name}
                  </span>
                  {outlet.state ? (
                    <span className="text-[0.8rem] text-[#737373]">
                      State
                    </span>
                  ) : null}
                </span>
                <span className="mt-2 flex items-center gap-3">
                  <span
                    aria-hidden
                    className="h-1.5 w-4 shrink-0"
                    style={{ backgroundColor: LEAN_INK[outlet.lean] }}
                  />
                  <span className={MICRO}>{LEAN_LABELS[outlet.lean]}</span>
                  <span
                    aria-hidden
                    className="h-1 max-w-[10rem] flex-1"
                    style={{
                      width: `${(outlet.count / max) * 100}%`,
                      backgroundColor: "rgba(255,255,255,0.12)",
                    }}
                  />
                </span>
              </span>
              <span className="text-sm tabular-nums text-[#737373]">
                {outlet.count}
              </span>
            </button>
          </li>
        ))}
      </ul>
    );
  }

  if (kind === "domains") {
    return (
      <ul>
        {domains.map((domain) => (
          <li
            key={domain.id}
            className="border-b border-black/[0.06] py-4 last:border-0"
          >
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-sm font-semibold text-[#111]">
                {domain.label}
              </span>
              <span className="text-[0.82rem] tabular-nums text-[#737373]">
                {domain.articleCount}
              </span>
            </div>
            <p className="mt-1 text-[0.82rem] text-[#737373]">{domain.blurb}</p>
            <div className="mt-2.5">
              <SpectrumBar counts={domain.leanCounts} height={2} />
            </div>
            <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1">
              {domain.topics.slice(0, 8).map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => onOpenTopic(topic.id)}
                  className="text-[0.82rem] text-[#737373] transition-colors hover:text-black"
                >
                  {topic.label}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (kind === "topics" || kind === "contested") {
    const list =
      kind === "contested" ? topics.filter((t) => t.spread >= 3) : topics;
    return (
      <ul>
        {list.map((topic) => (
          <li
            key={topic.id}
            className={`py-4 transition-colors ${plainHoverRow}`}
          >
            <button
              type="button"
              onClick={() => onOpenTopic(topic.id)}
              className="block w-full text-left"
            >
              <span className="flex items-baseline justify-between gap-4">
                <span className="text-sm font-semibold text-[#111]">
                  {topic.label}
                </span>
                <span className="text-[0.82rem] tabular-nums text-[#737373]">
                  {topic.storyCount}
                </span>
              </span>
              <span className="mt-2 block">
                <SpectrumBar counts={topic.leanCounts} height={2} />
              </span>
              <span className="mt-2 block text-[0.8rem] text-[#a3a3a3]">
                {topic.outletCount} outlets · {topic.spread}/7 sides ·{" "}
                {balanceWord(topic.balance)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    );
  }

  if (kind === "stories") {
    return (
      <ul>
        {clusters.slice(0, 200).map((cluster) => (
          <li
            key={cluster.key}
            className={`py-3 transition-colors ${plainHoverRow}`}
          >
            <div className="flex flex-wrap items-baseline gap-x-4">
              <span className={MICRO}>{cluster.lead.source}</span>
              <span className="text-[0.8rem] text-[#a3a3a3]">
                {ago(cluster.latestAt)}
              </span>
              {cluster.sourceCount > 1 ? (
                <span className="text-[0.8rem] text-[#737373]">
                  {cluster.sourceCount} outlets
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
    );
  }

  const list =
    kind === "undrafted" ? items.filter((item) => !item.imported) : items;
  const sorted = [...list].sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  );

  return (
    <ul>
      {sorted.slice(0, 250).map((item) => {
        const rating = leanForOutlet(item);
        return (
          <li
            key={item.key}
            className={`py-3 transition-colors ${plainHoverRow}`}
          >
            <div className="flex flex-wrap items-baseline gap-x-4">
              <span className={MICRO}>{item.source}</span>
              <span className="flex items-baseline gap-1.5">
                <span
                  aria-hidden
                  className="h-1.5 w-3 shrink-0"
                  style={{ backgroundColor: LEAN_INK[rating.lean] }}
                />
                <span className="text-[0.8rem] text-[#737373]">
                  {LEAN_LABELS[rating.lean]}
                </span>
              </span>
              <span className="text-[0.8rem] text-[#a3a3a3]">
                {ago(item.publishedAt)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onOpenStory(item)}
              className="mt-1 block w-full text-left text-sm leading-snug text-[#111] transition-colors hover:text-black"
            >
              {item.title}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
