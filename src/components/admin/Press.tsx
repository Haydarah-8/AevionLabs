"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BarList } from "@/components/admin/charts";
import {
  ArcDiagram,
  RadialClock,
  WaffleChart,
} from "@/components/admin/charts-advanced";
import {
  Explain,
  ExplainMark,
  ExplainProvider,
} from "@/components/admin/Explain";
import { Modal } from "@/components/admin/Modal";
import { OutletModalBody } from "@/components/admin/OutletModal";
import {
  PlainFigure,
  PlainHeading,
  PlainRow,
  plainControl,
  plainHoverTableRow,
} from "@/components/admin/plain";
import { LEAN_INK, SpectrumBar, STATE_INK } from "@/components/admin/Spectrum";
import { StoryModalBody } from "@/components/admin/StoryModal";
import { usePreviewCache } from "@/components/admin/usePreviewCache";
import { ACCENT, STATUS } from "@/components/admin/ui";
import { LEAN_LABELS, LEAN_SCALE, type Lean } from "@/lib/news/lean";
import {
  clusterNewsroomItems,
  type NewsroomItem,
} from "@/lib/news/newsroom";
import { outletKey } from "@/lib/news/outlet";
import type { PressPayload } from "@/app/api/admin/press/route";
import { ScrapeButton } from "@/components/admin/ScrapeButton";

const SECTION = "border-t border-black/10 pt-10";

type Sort = "articles" | "stories" | "exclusivity" | "loaded" | "cadence";

/** Which definition sits behind each sortable column. */
const COLUMN_TERMS: Record<Sort, string> = {
  articles: "article",
  stories: "story",
  exclusivity: "exclusivity",
  loaded: "loaded-share",
  cadence: "cadence",
};

/**
 * The press.
 *
 * A directory of who the desk is actually reading, and how they differ from
 * each other — position on the scale, how much they run alone, how loaded
 * their language is, and how often they publish. The newsroom shows the news;
 * this shows the instrument it is measured with.
 */
export function Press() {
  const [data, setData] = useState<PressPayload | null>(null);
  const [items, setItems] = useState<NewsroomItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sort, setSort] = useState<Sort>("articles");
  const [openOutlet, setOpenOutlet] = useState<string | null>(null);
  const [openStory, setOpenStory] = useState<NewsroomItem | null>(null);
  const previews = usePreviewCache();

  const load = useCallback(async (fresh = false) => {
    setLoading(true);
    try {
      const [pressRes, deskRes] = await Promise.all([
        fetch(`/api/admin/press${fresh ? "?fresh=1" : ""}`),
        fetch("/api/admin/desk?topic=all"),
      ]);
      const payload = (await pressRes.json()) as PressPayload & {
        error?: string;
      };
      if (!pressRes.ok) throw new Error(payload.error || "Failed to load");
      setData(payload);
      // The outlet modal reads whole articles, which the press endpoint does
      // not carry; the desk already has them.
      if (deskRes.ok) {
        const desk = (await deskRes.json()) as { items?: NewsroomItem[] };
        setItems(desk.items ?? []);
      }
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const sorted = useMemo(() => {
    const rows = [...(data?.outlets ?? [])];
    rows.sort((a, b) => {
      switch (sort) {
        case "stories":
          return b.stories - a.stories;
        case "exclusivity":
          return b.exclusivity - a.exclusivity;
        case "loaded":
          // Outlets that used no framing vocabulary have no share to rank on,
          // so they sort last rather than as zero.
          if (a.loadedShare === null) return b.loadedShare === null ? 0 : 1;
          if (b.loadedShare === null) return -1;
          return b.loadedShare - a.loadedShare;
        case "cadence":
          if (a.cadenceMinutes === null) return 1;
          if (b.cadenceMinutes === null) return -1;
          return a.cadenceMinutes - b.cadenceMinutes;
        default:
          return b.articles - a.articles;
      }
    });
    return rows;
  }, [data?.outlets, sort]);

  const outletItems = useMemo(() => {
    if (!openOutlet) return [];
    return items.filter((item) => outletKey(item) === openOutlet);
  }, [items, openOutlet]);

  const openStoryCluster = useMemo(() => {
    if (!openStory) return undefined;
    return clusterNewsroomItems(items).find((cluster) =>
      cluster.items.some((entry) => entry.key === openStory.key),
    );
  }, [items, openStory]);

  const openPreview = openStory ? previews.get(openStory.sourceUrl) : undefined;

  useEffect(() => {
    if (openStory) previews.prioritise(openStory.sourceUrl);
  }, [openStory, previews]);

  if (loading && !data) {
    return <p className="text-[0.88rem] text-[#737373]">Reading the press…</p>;
  }
  if (error && !data) return <p className="text-sm text-[#c85f5f]">{error}</p>;
  if (!data) return null;

  const columns: Array<[Sort, string]> = [
    ["articles", "Articles"],
    ["stories", "Stories"],
    ["exclusivity", "Alone"],
    ["loaded", "Loaded"],
    ["cadence", "Cadence"],
  ];

  return (
    <ExplainProvider>
    <div className="space-y-16">
      {/* The same figure cards the rest of the desk opens with. */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {(
          [
            ["Outlets", data.totals.outlets, "outlet"],
            ["Articles", data.totals.articles, "article"],
            ["Stories", data.totals.stories, "story"],
            ["State-run", data.totals.stateControlled, "state-controlled"],
            ["Unrated", data.totals.unrated, "unrated"],
          ] as Array<[string, number, string]>
        ).map(([label, value, term]) => (
          <div key={label} className="relative">
            <PlainFigure label={label} value={value} />
            <span className="absolute right-3 top-3">
              <ExplainMark id={term} />
            </span>
          </div>
        ))}
      </div>

      {/* Composition of the corpus. */}
      <section className={SECTION}>
        <PlainHeading
          note={
            <span className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <button
                type="button"
                onClick={() => void load(true)}
                disabled={loading}
                className={plainControl}
              >
                {loading ? "Refreshing…" : "Refresh"}
              </button>
              <ScrapeButton disabled={loading} onDone={() => load(true)} />
            </span>
          }
        >
          <Explain id="waffle">The landscape</Explain>
        </PlainHeading>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-[0.9rem] font-medium text-[#404040]">
              <Explain id="lean">Articles by position</Explain>
            </p>
            <WaffleChart
              columns={20}
              cells={100}
              slices={data.bands
                .slice()
                .sort(
                  (a, b) =>
                    LEAN_SCALE.indexOf(a.lean) - LEAN_SCALE.indexOf(b.lean),
                )
                .map((band) => ({
                  id: band.lean,
                  label: LEAN_LABELS[band.lean],
                  value: band.articles,
                  ink: LEAN_INK[band.lean],
                }))}
            />
          </div>

          <div>
            <p className="mb-3 text-[0.9rem] font-medium text-[#404040]">
              <Explain id="loaded-share">Loaded language by position</Explain>
            </p>
            {/* The same ruled row the overview uses, with the position swatch
                kept: the colour is the scale, and the words alone lose it. */}
            <ul>
              {data.bands
                .slice()
                .sort(
                  (a, b) =>
                    LEAN_SCALE.indexOf(a.lean) - LEAN_SCALE.indexOf(b.lean),
                )
                .map((band) => (
                  <PlainRow
                    key={band.lean}
                    primary={
                      <span className="flex items-baseline gap-2.5">
                        <span
                          aria-hidden
                          className="h-1.5 w-4 shrink-0 translate-y-[-2px] rounded-sm"
                          style={{ backgroundColor: LEAN_INK[band.lean] }}
                        />
                        {LEAN_LABELS[band.lean]}
                      </span>
                    }
                    secondary={`${band.outlets} outlets`}
                    value={
                      band.loadedShare === null
                        ? "—"
                        : `${Math.round(band.loadedShare * 100)}%`
                    }
                    bar={band.loadedShare ?? 0}
                  />
                ))}
            </ul>
            <p className="mt-5 text-[0.8rem] leading-relaxed text-[#737373]">
              Share of an outlet&rsquo;s framing vocabulary that is the loaded
              choice rather than the plain one. It is word counting, not
              judgement — a week of war coverage raises it too.
            </p>
          </div>
        </div>
      </section>

      {/* The directory. */}
      <section className={SECTION}>
        <PlainHeading note={`${sorted.length} in the corpus`}>
          <Explain id="outlet">Every outlet</Explain>
        </PlainHeading>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-black/10 text-left text-[0.8rem] text-[#737373]">
                <th className="pb-2.5 pr-4">
                  <Explain id="outlet">Outlet</Explain>
                </th>
                <th className="pb-2.5 pr-4">
                  <Explain id="lean">Position</Explain>
                </th>
                {columns.map(([id, label]) => (
                  <th
                    key={id}
                    className="pb-2.5 pl-3 text-right"
                    aria-sort={sort === id ? "descending" : "none"}
                  >
                    <span className="inline-flex items-center">
                      <button
                        type="button"
                        onClick={() => setSort(id)}
                        className="transition-colors"
                        style={{
                          color: sort === id ? ACCENT.bright : undefined,
                        }}
                      >
                        {label}
                        {sort === id ? " ↓" : ""}
                      </button>
                      <ExplainMark id={COLUMN_TERMS[id]} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((profile) => (
                <tr
                  key={profile.key}
                  className={`border-b border-white/[0.02] transition-colors last:border-0 ${plainHoverTableRow}`}
                >
                  <td className="py-3 pr-4">
                    <button
                      type="button"
                      onClick={() => setOpenOutlet(profile.key)}
                      className="text-left text-[0.9rem] text-[#404040] transition-colors hover:text-black"
                    >
                      {profile.name}
                    </button>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="flex items-baseline gap-2">
                      <span
                        aria-hidden
                        className="h-1.5 w-4 shrink-0 translate-y-[-2px]"
                        style={{
                          backgroundColor: profile.stateControlled
                            ? STATE_INK
                            : LEAN_INK[profile.lean],
                        }}
                      />
                      <span className="text-[0.85rem] text-[#737373]">
                        {profile.stateControlled
                          ? "State"
                          : LEAN_LABELS[profile.lean]}
                      </span>
                    </span>
                  </td>
                  <td className="py-3 pl-3 text-right text-[0.88rem] tabular-nums text-[#737373]">
                    {profile.articles}
                  </td>
                  <td className="py-3 pl-3 text-right text-[0.88rem] tabular-nums text-[#737373]">
                    {profile.stories}
                  </td>
                  <td className="py-3 pl-3 text-right text-[0.88rem] tabular-nums text-[#737373]">
                    {Math.round(profile.exclusivity * 100)}%
                  </td>
                  <td
                    className="py-3 pl-3 text-right text-[0.88rem] tabular-nums"
                    style={{
                      color:
                        profile.loadedShare === null
                          ? "#3e3e49"
                          : profile.loadedShare > 0.5
                            ? STATUS.warn
                            : "#8b8b96",
                    }}
                  >
                    {profile.loadedShare === null
                      ? "—"
                      : `${Math.round(profile.loadedShare * 100)}%`}
                  </td>
                  <td className="py-3 pl-3 text-right text-[0.88rem] tabular-nums text-[#737373]">
                    {profile.cadenceMinutes === null
                      ? "—"
                      : `${profile.cadenceMinutes}m`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-5 max-w-3xl text-[0.8rem] leading-relaxed text-[#737373]">
          &ldquo;Alone&rdquo; is the share of an outlet&rsquo;s stories no other
          outlet in the corpus ran. &ldquo;Cadence&rdquo; is the median gap
          between its articles. A dash means there was nothing to measure, which
          is not the same as zero.
        </p>
      </section>

      {/* Who publishes when. */}
      {data.clocks.length ? (
        <section className={SECTION}>
          <PlainHeading note="UTC hour · busiest six outlets">
            Publishing clocks
          </PlainHeading>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
            {data.clocks.map((clock) => (
              <button
                key={clock.key}
                type="button"
                onClick={() => setOpenOutlet(clock.key)}
                className="flex flex-col items-center transition-opacity hover:opacity-75"
              >
                <RadialClock hours={clock.hours} size={128} />
                <span className="mt-2.5 truncate text-[0.85rem] text-[#737373]">
                  {clock.name}
                </span>
              </button>
            ))}
          </div>
          <p className="mt-5 max-w-3xl text-[0.8rem] leading-relaxed text-[#737373]">
            A newsroom&rsquo;s working day is visible in its clock. Two outlets
            peaking twelve hours apart are not disagreeing — they are in
            different time zones, and their copy reaches the wire when this desk
            is asleep.
          </p>
        </section>
      ) : null}

      {/* Who runs alone. */}
      <section className={SECTION}>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <PlainHeading>
              <Explain id="exclusivity">Most on their own</Explain>
            </PlainHeading>
            <BarList
              rows={data.exclusive.map((profile) => ({
                id: profile.key,
                label: profile.name,
                value: Math.round(profile.exclusivity * 100),
                ink: profile.stateControlled
                  ? STATE_INK
                  : LEAN_INK[profile.lean],
                note: `${profile.exclusives}/${profile.stories}`,
              }))}
              max={100}
              onSelect={setOpenOutlet}
            />
          </div>
          <div>
            <PlainHeading>
              <Explain id="loaded-share">Most loaded language</Explain>
            </PlainHeading>
            <BarList
              rows={data.loaded.map((profile) => ({
                id: profile.key,
                label: profile.name,
                value: Math.round((profile.loadedShare ?? 0) * 100),
                ink: profile.stateControlled
                  ? STATE_INK
                  : LEAN_INK[profile.lean],
                note: `${profile.articles} articles`,
              }))}
              max={100}
              onSelect={setOpenOutlet}
            />
          </div>
        </div>
      </section>

      {/* Who moves together. */}
      <section className={SECTION}>
        <PlainHeading
          note={`${data.coCoverage.links.length} pairs sharing a story`}
        >
          <Explain id="co-coverage">Who moves together</Explain>
        </PlainHeading>
        {data.coCoverage.links.length ? (
          <ArcDiagram
            nodes={data.coCoverage.nodes}
            links={data.coCoverage.links}
            width={880}
            height={215}
          />
        ) : (
          <p className="text-sm text-[#737373]">
            No two outlets have landed on the same story in this window.
          </p>
        )}
        <p className="mt-5 max-w-3xl text-[0.8rem] leading-relaxed text-[#737373]">
          A thicker arc is more stories in common. Overlap is sparse because
          most stories in this corpus are still carried by a single outlet —
          which is also why the &ldquo;Alone&rdquo; column above reads high for
          so many of them.
        </p>
      </section>

      {/* Everything one outlet published. */}
      <Modal
        open={Boolean(openOutlet)}
        onClose={() => setOpenOutlet(null)}
        eyebrow={
          openOutlet ? <span>{outletItems.length} articles</span> : null
        }
        title={
          data.outlets.find((o) => o.key === openOutlet)?.name ?? "Outlet"
        }
      >
        {openOutlet ? (
          <>
            <div className="mb-8">
              <SpectrumBar
                counts={
                  {
                    ...Object.fromEntries(
                      LEAN_SCALE.map((lean) => [lean, 0]),
                    ),
                    unrated: 0,
                    [data.outlets.find((o) => o.key === openOutlet)?.lean ??
                    "unrated"]: outletItems.length,
                  } as Record<Lean, number>
                }
                height={3}
              />
            </div>
            <OutletModalBody
              outlet={openOutlet}
              items={items}
              getPreview={previews.get}
              onOpenStory={(entry) => setOpenStory(entry)}
            />
          </>
        ) : null}
      </Modal>

      {/* One story, read in place. */}
      <Modal
        open={Boolean(openStory)}
        onClose={() => setOpenStory(null)}
        onBack={openOutlet ? () => setOpenStory(null) : undefined}
        backLabel={
          data.outlets.find((o) => o.key === openOutlet)?.name ?? "Outlet"
        }
        eyebrow={openStory ? <span>{openStory.source}</span> : null}
        title={openStory?.title ?? ""}
      >
        {openStory ? (
          <StoryModalBody
            item={openStory}
            cluster={openStoryCluster}
            preview={
              openPreview?.status === "ready" ? openPreview.preview : null
            }
            previewFail={
              openPreview?.status === "failed" ? openPreview.reason : ""
            }
            reading={!openPreview || openPreview.status === "loading"}
            onOpenOutlet={() => undefined}
            onOpenStory={(entry) => setOpenStory(entry)}
            onOpenTerm={() => undefined}
          />
        ) : null}
      </Modal>
    </div>
    </ExplainProvider>
  );
}
