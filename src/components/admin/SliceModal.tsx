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
  leanBalance,
  leanForOutlet,
  LEAN_LABELS,
  spreadWidth,
  type Lean,
} from "@/lib/news/lean";
import {
  clusterNewsroomItems,
  type NewsroomItem,
} from "@/lib/news/newsroom";
import { outletKey } from "@/lib/news/outlet";
import { volumeSeries } from "@/lib/news/taxonomy";
import {
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

function emptyLean(): Record<Lean, number> {
  return {
    "far-left": 0,
    left: 0,
    "centre-left": 0,
    centre: 0,
    "centre-right": 0,
    right: 0,
    "far-right": 0,
    unrated: 0,
  };
}

/**
 * Any arbitrary slice of the corpus, described the same way every time.
 *
 * A point on the spectrum, one cell of the heatmap, an hour of the timeline, a
 * reach band and a framing term are all "some subset of the articles", and
 * they each want the same four answers: how it splits across the scale, when
 * it was published, who published it, and what the pieces actually are.
 * Writing five modals that differ only in their title would be five places to
 * fix the next time any of those answers changes.
 */
export function SliceModalBody({
  items,
  blurb,
  note,
  onOpenStory,
  onOpenOutlet,
}: {
  items: NewsroomItem[];
  /** What this slice is, in one line. */
  blurb: string;
  /** An optional caveat about how the slice was selected. */
  note?: string;
  onOpenStory: (item: NewsroomItem) => void;
  onOpenOutlet: (outlet: string) => void;
}) {
  const counts = useMemo(() => {
    const acc = emptyLean();
    for (const item of items) acc[leanForOutlet(item).lean] += 1;
    return acc;
  }, [items]);

  const volume = useMemo(
    () => volumeSeries(clusterNewsroomItems(items), { buckets: 24, hours: 48 }),
    [items],
  );

  const outlets = useMemo(() => {
    const map = new Map<
      string,
      { key: string; name: string; lean: Lean; state: boolean; count: number }
    >();
    for (const item of items) {
      const key = outletKey(item);
      const found = map.get(key);
      if (found) {
        found.count += 1;
        continue;
      }
      const rating = leanForOutlet(item);
      map.set(key, {
        key,
        name: item.source,
        lean: rating.lean,
        state: rating.stateControlled,
        count: 1,
      });
    }
    return [...map.values()].sort((a, b) => b.count - a.count);
  }, [items]);

  const sorted = useMemo(
    () =>
      [...items].sort(
        (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
      ),
    [items],
  );

  if (!items.length) {
    return (
      <p className="text-sm text-[#737373]">
        Nothing in the corpus matches this slice.
      </p>
    );
  }

  return (
    <div className="space-y-12">
      <section>
        <p className="mb-5 max-w-2xl text-sm leading-relaxed text-[#737373]">
          {blurb}
        </p>
        <SpectrumBar counts={counts} height={4} />
        <div className="mt-5 flex flex-wrap gap-x-8 gap-y-2">
          <span className={MICRO}>
            <span className="text-[#111]">{items.length}</span>{" "}
            articles
          </span>
          <span className={MICRO}>
            <span className="text-[#111]">{outlets.length}</span>{" "}
            outlets
          </span>
          <span className={MICRO}>
            <span className="text-[#111]">
              {spreadWidth(counts)}
            </span>
            /7 sides
          </span>
          <span className={MICRO}>{balanceWord(leanBalance(counts))}</span>
        </div>
        {note ? (
          <p className="mt-5 max-w-2xl text-[0.8rem] leading-relaxed text-[#a3a3a3]">
            {note}
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
            <Explain id="outlet">Who published it</Explain>
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
        <PlainHeading note={`${sorted.length} articles`}>
          <Explain id="article">Every article</Explain>
        </PlainHeading>
        <ul>
          {sorted.slice(0, 300).map((item) => {
            const rating = leanForOutlet(item);
            return (
              <li
                key={item.key}
                className={`py-3 transition-colors ${plainHoverRow}`}
              >
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <span
                    aria-hidden
                    className="h-1.5 w-3 shrink-0 translate-y-[-2px]"
                    style={{
                      backgroundColor: rating.stateControlled
                        ? STATE_INK
                        : LEAN_INK[rating.lean],
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => onOpenOutlet(item.source)}
                    className={`${MICRO} transition-colors hover:text-black`}
                  >
                    {item.source}
                  </button>
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
        {sorted.length > 300 ? (
          <p className="mt-4 text-[0.8rem] text-[#a3a3a3]">
            Showing the newest 300 of {sorted.length}.
          </p>
        ) : null}
      </section>
    </div>
  );
}
