"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ExplainProvider } from "@/components/admin/Explain";
import { Modal } from "@/components/admin/Modal";
import { LEAN_INK, STATE_INK } from "@/components/admin/Spectrum";
import { StoryModalBody } from "@/components/admin/StoryModal";
import { usePreviewCache } from "@/components/admin/usePreviewCache";
import {
  PlainFigure,
  PlainPill,
  PlainSelect,
  plainControl,
  plainHoverRow,
} from "@/components/admin/plain";
import { LEAN_LABELS, LEAN_SCALE, type Lean } from "@/lib/news/lean";
import type { GalleryTile } from "@/lib/news/gallery";
import type { SocialPlatform } from "@/lib/news/social";
import {
  clusterNewsroomItems,
  newsroomKey,
  type NewsroomItem,
} from "@/lib/news/newsroom";
import type { GalleryPayload } from "@/app/api/admin/gallery/route";
import { ScrapeButton } from "@/components/admin/ScrapeButton";

const MICRO =
  "text-[0.65rem] text-white/40 font-semibold";

type Kind = "all" | "image" | "video";

/**
 * How the wall is laid out.
 *
 * The list is the default: it fits far more on a screen and puts the
 * headline first, which is what the desk scans. The grid is for when the
 * pictures themselves are the point.
 */
type View = "list" | "grid";

const PLATFORM_LABEL: Record<string, string> = {
  all: "All sources",
  wire: "Wire",
  youtube: "YouTube",
  tiktok: "TikTok",
  x: "X",
  instagram: "Instagram",
};


/** Only a direct file can be played by a <video> element. */
function isFileVideo(url: string): boolean {
  try {
    return /\.(mp4|webm)(\?|$)/i.test(new URL(url).pathname);
  } catch {
    return false;
  }
}

function ago(iso: string) {
  const at = Date.parse(iso);
  if (Number.isNaN(at)) return "";
  const diff = Date.now() - at;
  if (diff < 60 * 60 * 1000) return `${Math.max(1, Math.round(diff / 60000))}m`;
  if (diff < 24 * 60 * 60 * 1000) return `${Math.round(diff / 3600000)}h`;
  return `${Math.round(diff / 86400000)}d`;
}

/**
 * The picture wall.
 *
 * A masonry of everything the wire arrived with, in its own aspect ratio. The
 * tiles carry no frame, no fill and no shadow — the photograph is the card, and
 * the page behind it is the same colour as every other surface in the admin, so
 * the wall reads as one continuous sheet rather than a tray of boxes.
 */
export function Gallery() {
  const router = useRouter();
  const [data, setData] = useState<GalleryPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [kind, setKind] = useState<Kind>("all");
  const [outlet, setOutlet] = useState("all");
  const [leanFilter, setLeanFilter] = useState<Lean | "all">("all");
  const [view, setView] = useState<View>("list");
  const [visible, setVisible] = useState(60);
  const [open, setOpen] = useState<GalleryTile | null>(null);
  const [platform, setPlatform] = useState<SocialPlatform | "wire" | "all">(
    "all",
  );
  const [undraftedOnly, setUndraftedOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [drafting, setDrafting] = useState(false);
  const [notice, setNotice] = useState("");

  /**
   * Tiles the browser could not load.
   *
   * Many outlets refuse hotlinked images, and no amount of checking on the
   * server can predict it — the only authority is whether the request
   * succeeded. A broken tile is removed rather than left as an empty frame.
   */
  const [broken, setBroken] = useState<Set<string>>(new Set());
  const previews = usePreviewCache();

  const load = useCallback(async (fresh = false) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/gallery${fresh ? "?fresh=1" : ""}`);
      const payload = (await res.json()) as GalleryPayload & {
        error?: string;
      };
      if (!res.ok) throw new Error(payload.error || "Failed to load");
      setData(payload);
      setBroken(new Set());
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

  useEffect(() => {
    setVisible(60);
  }, [kind, outlet, leanFilter, platform, undraftedOnly, query]);

  const tiles = useMemo(() => {
    return (data?.tiles ?? []).filter((tile) => {
      if (broken.has(tile.key)) return false;
      if (kind !== "all" && tile.kind !== kind) return false;
      if (outlet !== "all" && tile.source !== outlet) return false;
      if (leanFilter !== "all" && tile.lean !== leanFilter) return false;
      if (platform !== "all" && (tile.platform ?? "wire") !== platform) {
        return false;
      }
      if (undraftedOnly && tile.imported) return false;
      const needle = query.trim().toLowerCase();
      if (
        needle &&
        ![tile.title, tile.source, tile.category].some((value) =>
          String(value ?? "").toLowerCase().includes(needle),
        )
      ) {
        return false;
      }
      return true;
    });
  }, [
    data?.tiles,
    broken,
    kind,
    outlet,
    leanFilter,
    platform,
    undraftedOnly,
    query,
  ]);

  /**
   * How many tiles each kind lens would show.
   *
   * Counted against every filter *except* kind itself, so the numbers say what
   * clicking that lens would give you rather than what the current one already
   * gives — which would read 0 on the two lenses you are not standing in.
   */
  const kindCounts = useMemo(() => {
    const pool = (data?.tiles ?? []).filter((tile) => {
      if (broken.has(tile.key)) return false;
      if (outlet !== "all" && tile.source !== outlet) return false;
      if (leanFilter !== "all" && tile.lean !== leanFilter) return false;
      if (platform !== "all" && (tile.platform ?? "wire") !== platform) {
        return false;
      }
      if (undraftedOnly && tile.imported) return false;
      const needle = query.trim().toLowerCase();
      if (
        needle &&
        ![tile.title, tile.source, tile.category].some((value) =>
          String(value ?? "").toLowerCase().includes(needle),
        )
      ) {
        return false;
      }
      return true;
    });
    return {
      all: pool.length,
      image: pool.filter((tile) => tile.kind === "image").length,
      video: pool.filter((tile) => tile.kind === "video").length,
    };
  }, [data?.tiles, broken, outlet, leanFilter, platform, undraftedOnly, query]);

  const shown = useMemo(() => tiles.slice(0, visible), [tiles, visible]);

  /** The story modal wants a full article, which the wall does not carry. */
  const openItem: NewsroomItem | null = useMemo(() => {
    if (!open) return null;
    return {
      key: newsroomKey(open.sourceUrl),
      id: null,
      title: open.title,
      snippet: "",
      source: open.source,
      sourceId: "",
      sourceUrl: open.sourceUrl,
      publishedAt: open.publishedAt,
      category: open.category,
      imageUrl: open.imageUrl,
      videoUrl: open.videoUrl,
      media: open.kind,
      origin: "stored",
      imported: open.imported,
      storyId: null,
    };
  }, [open]);

  useEffect(() => {
    if (openItem) previews.prioritise(openItem.sourceUrl);
  }, [openItem, previews]);

  const preview = openItem ? previews.get(openItem.sourceUrl) : undefined;

  /**
   * Pull the article text for everything on screen before it is asked for.
   *
   * Opening a tile should not be a wait: extraction is the slow part, so the
   * visible rows are queued in the background and the text is usually already
   * cached by the time anyone clicks.
   */
  useEffect(() => {
    if (!shown.length) return;
    previews.prefetch(shown.map((tile) => tile.sourceUrl));
  }, [shown, previews]);

  const toggleSelected = useCallback((key: string) => {
    setSelected((set) => {
      const next = new Set(set);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const draft = useCallback(
    async (targets: GalleryTile[]) => {
      const fresh = targets.filter((tile) => !tile.imported);
      if (!fresh.length) return;
      setDrafting(true);
      setNotice("");
      try {
        const res = await fetch("/api/admin/events/draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            urls: fresh.map((tile) => tile.sourceUrl),
            topic: "all",
          }),
        });
        const payload = (await res.json()) as {
          created?: Array<{ id: string }>;
          skipped?: Array<{ url: string; reason: string }>;
          error?: string;
        };
        if (!res.ok) throw new Error(payload.error || "Failed to draft");
        const created = payload.created?.length ?? 0;
        const skipped = payload.skipped?.length ?? 0;
        // Mark locally rather than refetching the whole wall: a refetch would
        // reshuffle every tile under the reader's cursor.
        const drafted = new Set(
          fresh
            .filter(
              (tile) =>
                !(payload.skipped ?? []).some((s) => s.url === tile.sourceUrl),
            )
            .map((tile) => tile.key),
        );
        setData((current) =>
          current
            ? {
                ...current,
                tiles: current.tiles.map((tile) =>
                  drafted.has(tile.key) ? { ...tile, imported: true } : tile,
                ),
              }
            : current,
        );
        setSelected(new Set());

        // A single draft is a decision to write that story, so open it.
        // A batch has no one document to land on and keeps the summary.
        const firstId = payload.created?.[0]?.id;
        if (created === 1 && firstId) {
          router.push(`/admin/blog/${firstId}`);
          return;
        }
        setNotice(
          `${created} drafted${skipped ? `, ${skipped} skipped` : ""}.`,
        );
      } catch (err) {
        setNotice(err instanceof Error ? err.message : "Failed to draft");
      } finally {
        setDrafting(false);
      }
    },
    [router],
  );

  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = sentinel.current;
    if (!node) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) setVisible((n) => n + 60);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  if (loading && !data) return <p className={MICRO}>Developing the wall…</p>;
  if (error && !data) return <p className="text-sm text-[#c85f5f]">{error}</p>;
  if (!data) return null;

  const { totals } = data;

  return (
    <ExplainProvider>
      <div className="space-y-12">
        <div>
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-white/40">
            Media
          </p>
          <h2 className="mt-2 text-[clamp(1.75rem,3vw,2.5rem)] font-normal tracking-[-0.035em] text-white">
            Gallery
          </h2>
          <p className="mt-3 max-w-xl text-[1rem] font-light leading-relaxed text-white/50">
            Visual feed of coverage and media from the desk.
          </p>
        </div>
        {/*
          The same shape as every other desk: the figures, then the lenses,
          then a search, then the thing itself. The wall used to open with a
          run-on sentence of counts and a toolbar of underlined captions, which
          made it the one page that did not look like the rest of the product.
        */}
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <PlainFigure label="Showing" value={tiles.length} />
          <PlainFigure label="Stills" value={totals.images} />
          <PlainFigure label="Video" value={totals.videos} />
          <PlainFigure label="Outlets" value={totals.outlets} />
        </section>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-3">
          {(["list", "grid"] as View[]).map((option) => (
            <PlainPill
              key={option}
              active={view === option}
              onClick={() => setView(option)}
            >
              {option === "list" ? "List" : "Grid"}
            </PlainPill>
          ))}

          <span aria-hidden className="mx-2 h-4 w-px bg-white/[0.08]" />

          {(["all", "image", "video"] as Kind[]).map((option) => (
            <PlainPill
              key={option}
              active={kind === option}
              onClick={() => setKind(option)}
              /* The count is the point: video is a thin slice of a wall of
                 stills, so without it the lens looks empty rather than
                 selective, and there is no telling "no video today" from
                 "the filter is broken". */
              count={
                option === "all"
                  ? kindCounts.all
                  : option === "image"
                    ? kindCounts.image
                    : kindCounts.video
              }
            >
              {option === "all"
                ? "Everything"
                : option === "image"
                  ? "Stills"
                  : "Video"}
            </PlainPill>
          ))}

          <PlainPill
            active={undraftedOnly}
            onClick={() => setUndraftedOnly((v) => !v)}
          >
            Undrafted only
          </PlainPill>

          <span className="ml-auto flex flex-wrap items-center gap-x-5 gap-y-2">
            <button
              type="button"
              onClick={() => void load(true)}
              disabled={loading}
              className={plainControl}
            >
              {loading ? "Refreshing…" : "Refresh"}
            </button>
            {/* Refresh re-reads what we already have; Scrape goes and gets
                more. Two different jobs, so two controls rather than one
                that quietly does both. */}
            <ScrapeButton disabled={loading} onDone={() => load(true)} />
          </span>
        </div>

        {/* The wall had no search at all, which on a page of several hundred
            pictures meant scrolling was the only way to find one. */}
        <div>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by headline, outlet or desk"
            aria-label="Search the wall"
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[0.95rem] text-white placeholder:text-white/30 focus:border-white/25 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <PlainSelect
            label="Outlet"
            value={outlet}
            onChange={setOutlet}
            options={[
              { value: "all", label: "Every outlet" },
              ...data.outlets.map((name) => ({ value: name, label: name })),
            ]}
          />

          <PlainSelect
            label="Source"
            value={platform}
            onChange={(value) =>
              setPlatform(value as SocialPlatform | "wire" | "all")
            }
            options={[
              { value: "all", label: "All sources" },
              ...(data.platforms ?? []).map((entry) => ({
                value: entry.platform,
                label: `${PLATFORM_LABEL[entry.platform] ?? entry.platform} (${entry.count})`,
              })),
            ]}
          />

          {/* The spectrum stays a row of swatches rather than a select: the
              colours are the scale, and naming them in a dropdown would lose
              the ordering that makes it readable. */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="text-[0.8rem] text-white/45">Side</span>
            <button
              type="button"
              onClick={() => setLeanFilter("all")}
              className={`text-[0.85rem] transition-colors ${
                leanFilter === "all" ? "text-white" : "text-white/45 hover:text-white"
              }`}
            >
              All
            </button>
            {LEAN_SCALE.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setLeanFilter(value)}
                title={LEAN_LABELS[value]}
                aria-label={LEAN_LABELS[value]}
                className="flex items-center transition-opacity hover:opacity-100"
                style={{ opacity: leanFilter === value ? 1 : 0.4 }}
              >
                <span
                  aria-hidden
                  className="h-2 w-6 shrink-0 rounded-sm"
                  style={{ backgroundColor: LEAN_INK[value] }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Selection only appears once something is selected: an empty
            toolbar is a permanent reminder of a feature nobody asked for. */}
        {selected.size ? (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-white/[0.08] py-3">
            <span className={MICRO}>
              <span className="tabular-nums text-white">{selected.size}</span>{" "}
              selected
            </span>
            <button
              type="button"
              disabled={drafting}
              onClick={() =>
                void draft(tiles.filter((tile) => selected.has(tile.key)))
              }
              className="text-[0.85rem] transition-colors disabled:opacity-40"
              style={{ color: "#ffffff" }}
            >
              {drafting ? "Writing…" : "Draft selected"}
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className={`${MICRO} transition-colors hover:text-white`}
            >
              Clear
            </button>
          </div>
        ) : null}

        {notice ? (
          <p className="text-[0.7rem] text-white/45">{notice}</p>
        ) : null}

        {/* The wall. CSS columns rather than a fixed grid, so every picture
            keeps its own aspect ratio and nothing is cropped to fit a cell.
            Three across at most, with a wide gutter: at five the pictures were
            thumbnails, and the pictures are the content. */}
        {shown.length ? (
          view === "grid" ? (
            <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 [&>*]:mb-6">
              {shown.map((tile) => (
                <GalleryCard
                  key={tile.key}
                  tile={tile}
                  selected={selected.has(tile.key)}
                  onToggle={() => toggleSelected(tile.key)}
                  onOpen={() => setOpen(tile)}
                  onBroken={() =>
                    setBroken((set) => {
                      const next = new Set(set);
                      next.add(tile.key);
                      return next;
                    })
                  }
                />
              ))}
            </div>
          ) : (
            <ul>
              {shown.map((tile) => (
                <GalleryRow
                  key={tile.key}
                  tile={tile}
                  selected={selected.has(tile.key)}
                  drafting={drafting}
                  onToggle={() => toggleSelected(tile.key)}
                  onOpen={() => setOpen(tile)}
                  onDraft={() => void draft([tile])}
                  onBroken={() =>
                    setBroken((set) => {
                      const next = new Set(set);
                      next.add(tile.key);
                      return next;
                    })
                  }
                />
              ))}
            </ul>
          )
        ) : (
          <p className="text-sm text-white/45">
            Nothing on the wire carries a usable picture under these filters.
          </p>
        )}

        <div ref={sentinel} aria-hidden className="h-px" />

        {visible < tiles.length ? (
          <p className={MICRO}>
            Showing {shown.length} of {tiles.length}
          </p>
        ) : null}

        <p className="max-w-3xl text-[0.65rem] leading-relaxed text-white/40">
          Video is nearly absent because YouTube is not carried on this desk,
          and it accounts for all but a handful of the wire&rsquo;s video.
          Tiles that fail to load are removed on sight — many outlets refuse
          hotlinked images, and that can only be discovered by asking for them.
        </p>

        <Modal
          open={Boolean(open)}
          onClose={() => setOpen(null)}
          eyebrow={
            open ? (
              <>
                <span>{open.source}</span>
                <span>{ago(open.publishedAt)} ago</span>
                {open.reused ? <span>+{open.reused} carried it too</span> : null}
              </>
            ) : null
          }
          title={open?.title ?? ""}
        >
          {openItem ? (
            <StoryModalBody
              item={openItem}
              cluster={clusterNewsroomItems([openItem])[0]}
              preview={preview?.status === "ready" ? preview.preview : null}
              previewFail={preview?.status === "failed" ? preview.reason : ""}
              reading={!preview || preview.status === "loading"}
              onOpenOutlet={() => undefined}
              onOpenStory={() => undefined}
              onOpenTerm={() => undefined}
              onDraft={() => open && void draft([open])}
              drafting={drafting}
            />
          ) : null}
        </Modal>
      </div>
    </ExplainProvider>
  );
}

/**
 * One tile.
 *
 * No frame and no fill: the picture sits directly on the page, and the caption
 * is the only chrome. The lean stripe is the one piece of colour, so the wall
 * still reads politically at a glance.
 */
function GalleryCard({
  tile,
  selected,
  onToggle,
  onOpen,
  onBroken,
}: {
  tile: GalleryTile;
  selected: boolean;
  onToggle: () => void;
  onOpen: () => void;
  onBroken: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const ink = tile.stateControlled ? STATE_INK : LEAN_INK[tile.lean];
  const badge =
    tile.platform && tile.platform !== "x"
      ? PLATFORM_LABEL[tile.platform]
      : tile.kind === "video"
        ? "Video"
        : null;

  return (
    <figure className="group relative break-inside-avoid">
      {/* Select sits outside the open button: a checkbox inside a button is
          invalid, and the two actions are genuinely different. */}
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={selected}
        aria-label={selected ? "Deselect" : "Select"}
        className="absolute right-3 top-3 z-10 h-5 w-5 border transition-opacity"
        style={{
          borderColor: selected ? "#ffffff" : "rgba(255,255,255,0.35)",
          backgroundColor: selected ? "#ffffff" : "rgba(0,0,0,0.35)",
          opacity: selected ? 1 : undefined,
        }}
      />
      <button
        type="button"
        onClick={onOpen}
        className="block w-full text-left"
        aria-label={`${tile.title} — ${tile.source}`}
      >
        <span className="relative block overflow-hidden bg-white">
          {tile.kind === "video" && tile.videoUrl && isFileVideo(tile.videoUrl) ? (
            // Only a real file can play inline. Muted, looping, on hover: a
            // moving thumbnail rather than a player, because nothing should
            // start making noise on a page of tiles.
            <video
              src={tile.videoUrl}
              poster={tile.imageUrl}
              muted
              loop
              playsInline
              preload="metadata"
              onError={onBroken}
              onLoadedData={() => setLoaded(true)}
              onMouseEnter={(event) =>
                void event.currentTarget.play().catch(() => undefined)
              }
              onMouseLeave={(event) => event.currentTarget.pause()}
              className="w-full transition-opacity duration-500"
              style={{ opacity: loaded ? 1 : 0 }}
            />
          ) : !tile.imageUrl ? (
            // A YouTube or TikTok tile whose feed gave no still. Rather than
            // drop it, stand in a plate the play affordance can sit on.
            <span className="flex aspect-video w-full items-center justify-center bg-white/[0.03]">
              <span className="text-[0.8rem] text-white/45">
                {tile.source}
              </span>
            </span>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={tile.imageUrl}
              alt=""
              loading="lazy"
              decoding="async"
              // Some hosts serve a placeholder to hotlinkers unless the
              // referrer is stripped.
              referrerPolicy="no-referrer"
              onError={onBroken}
              onLoad={(event) => {
                // A 1px response is a hotlink refusal dressed as success.
                if (event.currentTarget.naturalWidth < 24) onBroken();
                else setLoaded(true);
              }}
              className="w-full transition-all duration-500 group-hover:brightness-110"
              style={{ opacity: loaded ? 1 : 0 }}
            />
          )}

          {tile.kind === "video" ? (
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/55 text-[1rem] text-white transition-transform group-hover:scale-110">
                ▶
              </span>
            </span>
          ) : null}
          {badge ? (
            <span className="pointer-events-none absolute left-2 top-2 bg-black/65 px-1.5 py-0.5 text-[0.78rem] text-white">
              {badge}
            </span>
          ) : null}
          {tile.imported ? (
            <span className="pointer-events-none absolute bottom-2 left-2 bg-black/65 px-1.5 py-0.5 text-[0.78rem] text-white/45">
              Drafted
            </span>
          ) : null}
        </span>

        <figcaption className="mt-4 flex items-start gap-3">
          <span
            aria-hidden
            className="mt-[0.5rem] h-2 w-4 shrink-0"
            style={{ backgroundColor: ink }}
          />
          <span className="min-w-0">
            <span className="block truncate text-[0.8rem] text-white/45">
              {tile.source}
              <span className="ml-2.5 tabular-nums font-normal text-white/40">
                {ago(tile.publishedAt)}
              </span>
            </span>
            <span className="mt-1.5 block text-[0.95rem] font-medium leading-[1.4] text-white/75 transition-colors group-hover:text-white">
              {tile.title}
            </span>
          </span>
        </figcaption>
      </button>
    </figure>
  );
}

/**
 * One row of the list view.
 *
 * Rebuilt, because the old row was a caption strip pretending to be a list.
 * The picture was 112px wide — too small to tell two press conferences apart,
 * which is the one thing a picture desk needs a picture for. Position was a
 * bare colour chip with no word beside it, so the scale was unreadable without
 * going back to the filter row to decode it. The timestamp was set at 0.62rem,
 * the smallest text anywhere in the admin. And drafting — the thing this page
 * exists to feed — could only be reached by first selecting a row and then
 * finding a bar that appears somewhere else.
 *
 * So: a picture large enough to read, the position named as well as coloured,
 * type on the same scale as every other desk, and Draft on the row where the
 * decision is actually made.
 */
function GalleryRow({
  tile,
  selected,
  drafting,
  onToggle,
  onOpen,
  onDraft,
  onBroken,
}: {
  tile: GalleryTile;
  selected: boolean;
  drafting: boolean;
  onToggle: () => void;
  onOpen: () => void;
  onDraft: () => void;
  onBroken: () => void;
}) {
  const ink = tile.stateControlled ? STATE_INK : LEAN_INK[tile.lean];
  const position = tile.stateControlled ? "State" : LEAN_LABELS[tile.lean];

  return (
 <li className={`group flex items-start gap-5 py-5 transition-colors ${plainHoverRow}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={selected}
        aria-label={selected ? "Deselect" : "Select"}
        className="mt-1.5 h-4 w-4 shrink-0 rounded border transition-colors"
        style={{
          borderColor: selected ? "#ffffff" : "rgba(255,255,255,0.2)",
          backgroundColor: selected ? "#ffffff" : "transparent",
        }}
      />

      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 flex-1 items-start gap-5 text-left"
        aria-label={`${tile.title} — ${tile.source}`}
      >
        <span className="relative block h-24 w-40 shrink-0 overflow-hidden rounded-lg bg-white/[0.03]">
          {tile.kind === "video" &&
          tile.videoUrl &&
          isFileVideo(tile.videoUrl) ? (
            // The list is the default view, so a video that only ever showed a
            // still here was, to anyone reading the wall, not a video at all.
            // Same treatment as the grid: muted and looping on hover, a moving
            // thumbnail rather than a player.
            <video
              src={tile.videoUrl}
              poster={tile.imageUrl}
              muted
              loop
              playsInline
              preload="metadata"
              onError={onBroken}
              onMouseEnter={(event) =>
                void event.currentTarget.play().catch(() => undefined)
              }
              onMouseLeave={(event) => event.currentTarget.pause()}
              className="h-full w-full object-cover"
            />
          ) : tile.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={tile.imageUrl}
              alt=""
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={onBroken}
              className="h-full w-full object-cover"
            />
          ) : null}
          {tile.kind === "video" ? (
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-[0.7rem] text-white">
                ▶
              </span>
            </span>
          ) : null}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-[0.88rem] text-white/45">{tile.source}</span>
            <span className="flex items-baseline gap-1.5">
              <span
                aria-hidden
                className="h-1.5 w-3 shrink-0 translate-y-[-2px] rounded-sm"
                style={{ backgroundColor: ink }}
              />
              {/* The colour alone was a code with the key on another row. */}
              <span className="text-[0.82rem] text-white/45">{position}</span>
            </span>
            <span className="text-[0.82rem] tabular-nums text-white/45">
              {ago(tile.publishedAt)}
            </span>
            {tile.kind === "video" ? (
              <span className="text-[0.82rem] text-white/45">Video</span>
            ) : null}
          </span>
          <span className="mt-2 block text-[1rem] leading-snug text-white/75 transition-colors group-hover:text-white">
            {tile.title}
          </span>
        </span>
      </button>

      {/* The wall exists to feed the editor, so the action lives on the row. */}
      <button
        type="button"
        onClick={onDraft}
        disabled={drafting || tile.imported}
        title={
          tile.imported
            ? "A draft already exists for this picture"
            : "Create a draft and open it in the editor"
        }
        className={`mt-0.5 shrink-0 rounded-lg border px-3.5 py-2 text-[0.85rem] transition-colors disabled:cursor-not-allowed ${
          tile.imported
            ? "border-white/10 text-white/40"
            : "border-[#ffffff]/45 bg-[#ffffff]/10 text-[#ffffff] hover:bg-[#ffffff] hover:text-white"
        }`}
      >
        {tile.imported ? "Drafted" : drafting ? "Writing…" : "Draft"}
      </button>
    </li>
  );
}
