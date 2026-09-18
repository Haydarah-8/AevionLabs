"use client";

import { useMemo } from "react";
import { LEAN_INK, SpectrumBar } from "@/components/admin/Spectrum";
import type { PreviewState } from "@/components/admin/usePreviewCache";
import { LEAN_LABELS, leanForOutlet, type Lean } from "@/lib/news/lean";
import type { NewsroomItem } from "@/lib/news/newsroom";
import { outletKey } from "@/lib/news/outlet";
import {
  PlainFigure,
  PlainHeading,
  plainHoverRow,
} from "@/components/admin/plain";

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

/** Everything one outlet has published in the corpus, newest first. */
export function OutletModalBody({
  outlet,
  items,
  getPreview,
  onOpenStory,
}: {
  outlet: string;
  items: NewsroomItem[];
  getPreview: (url: string) => PreviewState | undefined;
  onOpenStory: (item: NewsroomItem) => void;
}) {
  const mine = useMemo(
    () =>
      items
        .filter((item) => outletKey(item) === outlet)
        .sort(
          (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
        ),
    [items, outlet],
  );

  const rating = mine[0] ? leanForOutlet(mine[0]) : null;

  const byTopicCategory = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of mine) {
      const key = item.category || "Uncategorised";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [mine]);

  const share = useMemo(() => {
    const acc: Record<Lean, number> = {
      "far-left": 0,
      left: 0,
      "centre-left": 0,
      centre: 0,
      "centre-right": 0,
      right: 0,
      "far-right": 0,
      unrated: 0,
    };
    if (rating) acc[rating.lean] = mine.length;
    return acc;
  }, [rating, mine.length]);

  const drafted = mine.filter((item) => item.imported).length;

  return (
    <div className="space-y-12">
      <section>
        {/* The same figure cards the desks open with, rather than four
            hand-set numbers that happened to look similar. */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <PlainFigure label="Articles" value={mine.length} />
          <PlainFigure label="Drafted" value={drafted} />
          <PlainFigure
            label="Position"
            small
            value={
              <span className="flex items-baseline gap-2">
                <span
                  aria-hidden
                  className="h-1.5 w-4 shrink-0 translate-y-[-2px] rounded-sm"
                  style={{
                    backgroundColor: LEAN_INK[rating?.lean ?? "unrated"],
                  }}
                />
                {LEAN_LABELS[rating?.lean ?? "unrated"]}
              </span>
            }
          />
          <PlainFigure
            label="Latest"
            small
            value={mine[0] ? `${ago(mine[0].publishedAt)} ago` : "—"}
          />
        </div>

        {rating?.stateControlled ? (
          <p className="mt-6 text-[0.82rem] leading-relaxed text-[#737373]">
            State-controlled outlet. Counted off the left–right scale rather
            than placed on it.
          </p>
        ) : null}

        <div className="mt-6">
          <SpectrumBar counts={share} height={3} />
        </div>
      </section>

      {byTopicCategory.length ? (
        <section className="border-t border-black/10 pt-10">
          <PlainHeading>What they cover</PlainHeading>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
            {byTopicCategory.map(([name, count]) => (
              <div
                key={name}
                className="flex items-baseline justify-between gap-3 border-b border-black/[0.06] pb-2"
              >
                <span className="text-sm text-[#111]">{name}</span>
                <span className="text-[0.82rem] tabular-nums text-[#737373]">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="border-t border-black/10 pt-10">
        <PlainHeading>Everything they published</PlainHeading>
        <ul>
          {mine.map((item) => {
            const state = getPreview(item.sourceUrl);
            return (
              <li
                key={item.key}
                className={`py-3 transition-colors ${plainHoverRow}`}
              >
                <div className="flex flex-wrap items-baseline gap-x-4">
                  <span className="text-[0.8rem] text-[#a3a3a3]">
                    {ago(item.publishedAt)}
                  </span>
                  {item.category ? (
                    <span className={MICRO}>{item.category}</span>
                  ) : null}
                  {state?.status === "ready" ? (
                    <span className="text-[0.8rem] text-[#a3a3a3]">
                      Text ready
                    </span>
                  ) : null}
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
            );
          })}
        </ul>
      </section>
    </div>
  );
}
