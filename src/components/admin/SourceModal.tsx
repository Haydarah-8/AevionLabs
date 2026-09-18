"use client";

import { useMemo } from "react";
import { ColumnChart } from "@/components/admin/charts";
import { LEAN_INK, SpectrumBar } from "@/components/admin/Spectrum";
import { STATUS } from "@/components/admin/ui";
import { LEAN_LABELS, leanForOutlet, type Lean } from "@/lib/news/lean";
import {
  clusterNewsroomItems,
  type NewsroomItem,
} from "@/lib/news/newsroom";
import { volumeSeries } from "@/lib/news/taxonomy";
import type { SourceHealth, SourceStatus } from "@/app/api/admin/desk/route";
import {
  PlainHeading,
  plainHoverRow,
} from "@/components/admin/plain";

const MICRO =
  "text-[0.8rem] text-[#737373] font-semibold";

const STATUS_INK: Record<SourceStatus, string> = {
  healthy: STATUS.live,
  stale: STATUS.warn,
  failing: STATUS.fail,
  pending: STATUS.idle,
  disabled: STATUS.idle,
};

const STATUS_MEANING: Record<SourceStatus, string> = {
  healthy: "Fetched successfully within the last day.",
  stale: "Last successful fetch was over a day ago.",
  failing: "Three or more consecutive failures, or silent for three days.",
  pending: "Configured but never fetched yet.",
  disabled: "Turned off; it is not being polled.",
};

function when(iso: string | null) {
  if (!iso) return "never";
  const at = Date.parse(iso);
  if (Number.isNaN(at)) return "unknown";
  return new Date(at).toLocaleString([], {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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
 * One feed: whether it is working, and what it has actually produced.
 *
 * The source table could say "failing" but not what that meant or what was
 * lost, so a broken feed looked identical to a quiet one. Both numbers matter
 * — a healthy source contributing nothing is its own kind of problem.
 */
export function SourceModalBody({
  source,
  items,
  onOpenStory,
  onOpenOutlet,
}: {
  source: SourceHealth;
  /** Every article in the corpus, filtered to this source here. */
  items: NewsroomItem[];
  onOpenStory: (item: NewsroomItem) => void;
  onOpenOutlet: (outlet: string) => void;
}) {
  const mine = useMemo(
    () =>
      items
        .filter((item) => item.sourceId === source.id)
        .sort(
          (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
        ),
    [items, source.id],
  );

  const counts = useMemo(() => {
    const acc = emptyLean();
    for (const item of mine) acc[leanForOutlet(item).lean] += 1;
    return acc;
  }, [mine]);

  const volume = useMemo(
    () => volumeSeries(clusterNewsroomItems(mine), { buckets: 24, hours: 48 }),
    [mine],
  );

  return (
    <div className="space-y-12">
      <section>
        <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3">
          <span className="flex items-baseline gap-2">
            <span
              aria-hidden
              className="h-2 w-2 shrink-0 translate-y-[-1px] rounded-full"
              style={{ backgroundColor: STATUS_INK[source.status] }}
            />
            <span
              className="text-sm font-semibold capitalize"
              style={{ color: STATUS_INK[source.status] }}
            >
              {source.status}
            </span>
          </span>
          <span className={MICRO}>
            Last success{" "}
            <span className="text-[#111]">
              {when(source.lastSuccessAt)}
            </span>
          </span>
          <span className={MICRO}>
            Consecutive failures{" "}
            <span
              className="tabular-nums"
              style={{
                color: source.failureCount ? STATUS.fail : "#111111",
              }}
            >
              {source.failureCount}
            </span>
          </span>
          <span className={MICRO}>
            Rated{" "}
            <span className="text-[#111]">
              {LEAN_LABELS[source.lean]}
            </span>
          </span>
        </div>

        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-[#737373]">
          {STATUS_MEANING[source.status]}
        </p>

        {source.status === "healthy" && !mine.length ? (
          <p
            className="mt-4 max-w-2xl text-sm leading-relaxed"
            style={{ color: STATUS.warn }}
          >
            This feed is fetching without error but nothing from it survived
            into the corpus — it is either publishing outside the window or
            everything it sent was filtered out.
          </p>
        ) : null}
      </section>

      {mine.length ? (
        <>
          <section className="border-t border-black/10 pt-10">
            <PlainHeading>What it contributed</PlainHeading>
            <SpectrumBar counts={counts} height={4} />
            <div className="mt-5 flex flex-wrap gap-x-8 gap-y-2">
              <span className={MICRO}>
                <span className="text-[#111]">{mine.length}</span>{" "}
                articles in corpus
              </span>
              <span className={MICRO}>
                <span className="text-[#111]">
                  {mine.filter((item) => !item.imported).length}
                </span>{" "}
                undrafted
              </span>
            </div>
            <div className="mt-8">
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
          </section>

          <section className="border-t border-black/10 pt-10">
            <PlainHeading note={`${mine.length} articles`}>
              Everything it published
            </PlainHeading>
            <ul>
              {mine.slice(0, 200).map((item) => {
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
                        style={{ backgroundColor: LEAN_INK[rating.lean] }}
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
          </section>
        </>
      ) : null}
    </div>
  );
}
