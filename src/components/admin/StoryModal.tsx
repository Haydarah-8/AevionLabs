"use client";

import { useMemo } from "react";
import { AdminVideo } from "@/components/admin/AdminVideo";
import { Explain } from "@/components/admin/Explain";
import { LEAN_INK, SpectrumBar, STATE_INK } from "@/components/admin/Spectrum";
import { clusterFraming } from "@/lib/news/framing";
import { galleryImageAllowed } from "@/lib/news/gallery";
import {
  LEAN_LABELS,
  LEAN_SCALE,
  leanForOutlet,
  type Lean,
} from "@/lib/news/lean";
import { safeVideoPlayback } from "@/lib/news/media";
import type { AxisSide } from "@/lib/news/framing";
import type { NewsroomCluster, NewsroomItem } from "@/lib/news/newsroom";
import { PlainHeading } from "@/components/admin/plain";

export type ReadyPreview = {
  sourceUrl: string;
  title: string;
  paragraphs: string[];
  imageUrl?: string;
  /**
   * Resolved from the page during extraction.
   *
   * The article row's own video_url comes from the feed and is usually empty
   * for an outlet video page; the playable source only appears once the page
   * itself has been read. Dropping this field from the type is what stopped
   * outlet video ever reaching the player.
   */
  videoUrl?: string;
  source: string;
  publishedAt: string;
  canonicalUrl: string;
  byline?: string;
};

const MICRO =
  "text-[0.8rem] text-[#737373] font-semibold";

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

function dateline(iso: string) {
  const at = Date.parse(iso);
  if (Number.isNaN(at)) return "";
  return new Date(at).toLocaleString([], {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * One story, set as an article.
 *
 * The reading column is typeset rather than dumped out: a hero, a kicker, a
 * headline, a dateline, a lead paragraph set larger than the body, and a
 * measure capped near 68 characters — the width at which the eye stops losing
 * its place between lines.
 *
 * Set in the same sans as the rest of the desk. It used to borrow the public
 * site's serif so the desk read what it publishes, but the admin is plain
 * throughout now and one serif column in the middle of it read as a mistake
 * rather than as a choice. The measure and the leading are what carry long
 * text; the face was never doing that work.
 *
 * Beside it sits the thing the desk is actually for: every outlet that ran the
 * same story, arranged by where they sit on the scale.
 */
export function StoryModalBody({
  item,
  cluster,
  preview,
  previewFail,
  reading,
  onOpenOutlet,
  onOpenStory,
  onOpenTerm,
  onDraft,
  drafting = false,
}: {
  item: NewsroomItem;
  cluster?: NewsroomCluster;
  preview: ReadyPreview | null;
  previewFail: string;
  reading: boolean;
  onOpenOutlet: (outletName: string) => void;
  onOpenStory: (entry: NewsroomItem) => void;
  /** Opens every article in the corpus using one framing word. */
  onOpenTerm: (term: string) => void;
  /** Writes a draft from this article. Omitted where drafting is unavailable. */
  onDraft?: (targets: NewsroomItem[]) => void;
  drafting?: boolean;
}) {
  const members = useMemo(() => cluster?.items ?? [item], [cluster, item]);
  const rating = leanForOutlet(item);

  const counts = useMemo(() => {
    const acc = emptyLean();
    for (const entry of members) acc[leanForOutlet(entry).lean] += 1;
    return acc;
  }, [members]);

  const byLean = useMemo(() => {
    const groups = new Map<Lean, NewsroomItem[]>();
    for (const entry of members) {
      const { lean } = leanForOutlet(entry);
      const list = groups.get(lean);
      if (list) list.push(entry);
      else groups.set(lean, [entry]);
    }
    return groups;
  }, [members]);

  const framing = useMemo(() => clusterFraming({ items: members }), [members]);

  // The extracted page is the better source: an outlet's video page carries
  // no video_url in the feed, and the playable file is only found by reading
  // the page.
  const videoUrl = preview?.videoUrl || item.videoUrl;
  const playback = safeVideoPlayback(videoUrl);
  const heroImage =
    !playback && galleryImageAllowed(preview?.imageUrl || item.imageUrl)
      ? preview?.imageUrl || item.imageUrl
      : undefined;

  const paragraphs = preview?.paragraphs ?? [];
  const [lead, ...body] = paragraphs;
  const undrafted = members.filter((entry) => !entry.imported).length;

  return (
    <div>
      {/*
        The article sits in the middle of the dialog rather than in a
        three-fifths column beside a sidebar.
        
        Two things were wrong with the old split. The measure is capped near
        68 characters either way, so the extra width bought the reading column
        nothing — it only pushed the text off-centre, leaving it starting at
        the far left of a very wide dialog with the eye travelling further to
        find each line. And the coverage panel sat level with the opening
        paragraphs, competing with them: a spectrum bar and a list of outlets
        are what you want *after* reading the piece, not alongside the first
        sentence of it.
      */}
      <article className="mx-auto w-full max-w-[46rem]">
        {/* Hero: the clip if there is one, otherwise the photograph. */}
        {playback ? (
          <div className="mb-9">
            <AdminVideo
              url={videoUrl}
              poster={preview?.imageUrl || item.imageUrl}
            />
          </div>
        ) : heroImage ? (
          <figure className="mb-9">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImage}
              alt=""
              referrerPolicy="no-referrer"
              className="max-h-[26rem] w-full object-cover"
            />
          </figure>
        ) : null}

        {/* Kicker: who ran it, and where they sit. */}
        <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2">
          <button
            type="button"
            onClick={() => onOpenOutlet(item.source)}
            className="flex items-center gap-2 transition-opacity hover:opacity-75"
          >
            <span
              aria-hidden
              className="h-2.5 w-2.5 shrink-0"
              style={{
                backgroundColor: rating.stateControlled
                  ? STATE_INK
                  : LEAN_INK[rating.lean],
              }}
            />
            <span className="text-[0.85rem] text-[#111]">
              {item.source}
            </span>
          </button>
          <span className="text-[0.8rem] text-[#737373]">
            {rating.stateControlled
              ? "State-controlled"
              : LEAN_LABELS[rating.lean]}
          </span>
          {item.category ? (
            <span className="text-[0.8rem] text-[#a3a3a3]">
              {item.category}
            </span>
          ) : null}
        </div>

        <h1 className="text-[2rem] font-medium leading-[1.2] text-[#111] sm:text-[2.4rem]">
          {preview?.title || item.title}
        </h1>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-black/10 pb-5">
          {preview?.byline ? (
            <span className="text-[0.88rem] text-[#b8b8c0]">
              {preview.byline}
            </span>
          ) : null}
          <span className="text-[0.85rem] text-[#737373]">
            {dateline(item.publishedAt)}
          </span>

          {/* Under the headline, not at the foot of the article: the decision
              to write this up is made on sight, and it used to require
              scrolling past the whole piece to reach a grey line of text. */}
          {onDraft ? (
            <button
              type="button"
              onClick={() => onDraft([item])}
              disabled={drafting || item.imported}
              className={`ml-auto shrink-0 border px-5 py-2.5 text-[0.85rem] transition-colors disabled:cursor-not-allowed ${
                item.imported
                  ? "border-black/10 text-[#a3a3a3]"
                  : "border-[#ffffff]/45 bg-[#ffffff]/10 text-[#ffffff] hover:bg-[#ffffff] hover:text-black"
              }`}
            >
              {item.imported
                ? "Drafted"
                : drafting
                  ? "Writing…"
                  : "Draft in editor →"}
            </button>
          ) : null}
        </div>

        {/*
          Centred inside the article, and genuinely narrower than it.

          This was capped at 68ch, which sounds like the right measure and was
          not: `ch` is the width of a zero, and DM Sans sets a wide one, so 68ch
          came out larger than the column it was inside and never applied —
          leaving lines of about 85 characters. A rem cap bites regardless of
          the face, and the hero and headline keep the full width above it.
        */}
        <div className="mx-auto mt-8 max-w-[38rem]">
          {reading ? (
            // Lines of the right shape, so the column does not jump when the
            // text lands.
            <div className="space-y-4" aria-busy>
              {[0, 1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="h-4 animate-pulse bg-white/[0.04]"
                  style={{ width: `${100 - n * 6}%` }}
                />
              ))}
            </div>
          ) : previewFail ? (
            <div className="space-y-5">
              {item.snippet ? (
                <p className="text-[1.05rem] leading-[1.8] text-[#404040]">
                  {item.snippet}
                </p>
              ) : null}
              <p className="text-sm leading-relaxed text-[#737373]">
                {previewFail}
              </p>
            </div>
          ) : paragraphs.length ? (
            <>
              {/* The lead is set larger. It carries the story, and every
                  newspaper on earth marks it somehow. */}
              <p className="text-[1.18rem] leading-[1.7] text-[#dcdce2]">
                {lead}
              </p>
              <div className="mt-6 space-y-5">
                {body.map((paragraph, index) => (
                  <p
                    key={`${preview?.sourceUrl}-${index}`}
                    className="text-[1.02rem] leading-[1.8] text-[#b8b8c0]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </>
          ) : item.snippet ? (
            <p className="text-[1.05rem] leading-[1.8] text-[#404040]">
              {item.snippet}
            </p>
          ) : null}

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-black/10 pt-6">
            <a
              href={preview?.canonicalUrl || item.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[0.8rem] text-[#737373] transition-colors hover:text-black"
            >
              Read at {item.source} →
            </a>
          </div>
        </div>
      </article>

      {/* Below the article, and wider than it: the spread of coverage is a
          table of who said what, which reads better across the full width
          than squeezed into a rail. */}
      <aside className="mx-auto mt-16 w-full max-w-[60rem] border-t border-black/10 pt-12">
        <PlainHeading
          note={`${members.length} ${members.length === 1 ? "outlet" : "outlets"}`}
        >
          <Explain id="story">Coverage</Explain>
        </PlainHeading>

        <SpectrumBar counts={counts} height={4} />

        {framing.length ? (
          <div className="mt-8">
            <PlainHeading>
              <Explain id="framing">How it is being framed</Explain>
            </PlainHeading>
            <div className="space-y-5">
              {framing.slice(0, 4).map((divergence) => {
                const terms = new Map<string, AxisSide[]>();
                for (const side of divergence.sides) {
                  const list = terms.get(side.term);
                  if (list) list.push(side);
                  else terms.set(side.term, [side]);
                }
                return (
                  <div key={divergence.axis}>
                    <p className={MICRO}>{divergence.label}</p>
                    <ul className="mt-2 space-y-1.5">
                      {[...terms.entries()].map(([term, sides]) => (
                        <li
                          key={term}
                          className="flex flex-wrap items-baseline gap-x-3"
                        >
                          {/* Amber marks the loaded choice; the plainer word
                              stays grey. Weight repeats the distinction so it
                              survives without the colour. */}
                          <button
                            type="button"
                            onClick={() => onOpenTerm(term)}
                            className={`text-sm transition-opacity hover:opacity-70 ${
                              sides[0].tone === "loaded"
                                ? "font-semibold text-[#c9963f]"
                                : "text-[#737373]"
                            }`}
                            aria-label={`Every article using "${term}"`}
                          >
                            &ldquo;{term}&rdquo;
                          </button>
                          <span className="text-[0.8rem] text-[#737373]">
                            {[...new Set(sides.map((s) => s.outlet))].join(", ")}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
            <p className="mt-5 text-[0.8rem] leading-relaxed text-[#a3a3a3]">
              Word choice only. This cannot read tone or context, and a term
              inside a quotation counts the same as the outlet&rsquo;s own
              voice — a difference here is a prompt to read both, not a verdict.
            </p>
          </div>
        ) : null}

        <div className="mt-8 space-y-8">
          {[...LEAN_SCALE, "unrated" as Lean]
            .filter((lean) => byLean.get(lean)?.length)
            .map((lean) => (
              <div key={lean}>
                <div className="mb-3 flex items-center gap-2">
                  <span
                    aria-hidden
                    className="h-1.5 w-4 shrink-0"
                    style={{ backgroundColor: LEAN_INK[lean] }}
                  />
                  <span className="text-[0.8rem] text-[#737373]">
                    {LEAN_LABELS[lean]}
                  </span>
                  <span className="text-[0.8rem] text-[#a3a3a3]">
                    {byLean.get(lean)?.length}
                  </span>
                </div>
                <ul>
                  {byLean.get(lean)?.map((entry) => {
                    const entryRating = leanForOutlet(entry);
                    return (
                      <li
                        key={entry.key}
                        className="border-b border-black/[0.06] py-3 last:border-0"
                      >
                        <div className="flex flex-wrap items-baseline gap-x-3">
                          <button
                            type="button"
                            onClick={() => onOpenOutlet(entry.source)}
                            className={`${MICRO} transition-colors hover:text-black`}
                          >
                            {entry.source}
                          </button>
                          {entryRating.stateControlled ? (
                            <span className="text-[0.8rem] text-[#737373]">
                              State
                            </span>
                          ) : null}
                          {entry.key === item.key ? (
                            <span className="text-[0.8rem] text-[#a3a3a3]">
                              Reading
                            </span>
                          ) : null}
                          {entry.imported ? (
                            <span className="text-[0.8rem] text-[#a3a3a3]">
                              Drafted
                            </span>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => onOpenStory(entry)}
                          className="mt-1 block w-full text-left text-sm leading-snug text-[#737373] transition-colors hover:text-black"
                        >
                          {entry.title}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
        </div>

        {/* Draft the whole cluster at once — one story, every account of it. */}
        {onDraft && members.length > 1 && undrafted > 0 ? (
          <button
            type="button"
            onClick={() => onDraft(members)}
            disabled={drafting}
            className="mt-8 text-[0.8rem] text-[#737373] transition-colors hover:text-black disabled:opacity-30"
          >
            {drafting ? "Writing…" : `Draft all ${undrafted} undrafted`}
          </button>
        ) : null}
      </aside>
    </div>
  );
}
