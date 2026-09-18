"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PlainFigure,
  PlainHeading,
  plainControl,
  plainHoverTableRow,
} from "@/components/admin/plain";
import { balanceWord, LEAN_INK, SpectrumBar } from "@/components/admin/Spectrum";
import {
  Explain,
  ExplainMark,
  ExplainProvider,
} from "@/components/admin/Explain";
import { Modal } from "@/components/admin/Modal";
import { OutletModalBody } from "@/components/admin/OutletModal";
import {
  StatModalBody,
  STAT_BLURB,
  STAT_TITLE,
  type StatKind,
} from "@/components/admin/StatModal";
import { StoryEntry } from "@/components/admin/StoryEntry";
import { StoryModalBody } from "@/components/admin/StoryModal";
import { SliceModalBody } from "@/components/admin/SliceModal";
import { DomainModalBody } from "@/components/admin/DomainModal";
import { SourceModalBody } from "@/components/admin/SourceModal";
import { TopicModalBody, topicEyebrow } from "@/components/admin/TopicModal";
import { usePreviewCache } from "@/components/admin/usePreviewCache";
import { NEWS_TOPICS, type NewsTopicId } from "@/lib/news-intake/types";
import {
  leanForOutlet,
  LEAN_LABELS,
  LEAN_SCALE,
  type Lean,
} from "@/lib/news/lean";
import {
  clusterNewsroomItems,
  EMPTY_NEWSROOM_FILTERS,
  filterNewsroomItems,
  sortNewsroomClusters,
  splitByArrival,
  type NewsroomCluster,
  type NewsroomFilters,
  type NewsroomItem,
} from "@/lib/news/newsroom";
import { outletKey } from "@/lib/news/outlet";
import { topicArticles } from "@/lib/news/topics";
import {
  domainById,
  REACH_BLURB,
  REACH_LABEL,
  type DomainId,
  volumeSeries,
  type ClassifiedTopic,
  type Reach,
} from "@/lib/news/taxonomy";
import {
  BalancePlot,
  ColumnChart,
  Heatmap,
  LEAN_COLS,
  leanColInk,
  leanColLabel,
  Sparkline,
} from "@/components/admin/charts";
import { ACCENT, STATUS } from "@/components/admin/ui";
import type {
  DeskPayload,
  SourceHealth,
  SourceStatus,
} from "@/app/api/admin/desk/route";
import { ScrapeButton } from "@/components/admin/ScrapeButton";

/** Section heading, matching Top Pages and the other admin panels. */
/** The hairline rule that separates every section on the overview. */
const SECTION = "border-t border-black/10 pt-10";
const MICRO =
  "text-[0.8rem] text-[#737373] font-semibold";
const CONTROL =
  "text-[0.8rem] font-semibold transition-colors";

type Lens = "stories" | "wire" | "new" | "contested";

/** One level of the full-screen stack. */
type View =
  | { kind: "story"; key: string }
  | { kind: "topic"; id: string }
  | { kind: "outlet"; outlet: string }
  | { kind: "stat"; stat: StatKind }
  | { kind: "domain"; id: DomainId }
  | { kind: "source"; id: string }
  | { kind: "slice"; slice: SliceSpec };

/**
 * A described subset of the corpus.
 *
 * Held as a description rather than a list of article keys so the state stays
 * small and survives a refresh of the underlying data — the slice is resolved
 * against whatever the desk currently holds, not against a snapshot taken when
 * it was opened.
 */
type SliceSpec =
  | { type: "lean"; lean: Lean }
  | { type: "cell"; domain: DomainId; lean: Lean }
  | { type: "bucket"; at: number }
  | { type: "reach"; reach: Reach }
  | { type: "framing"; term: string };

/** A stable empty set, so the split memo does not rerun on every render. */
const EMPTY_URLS: Set<string> = new Set();

/** The result of one press of Scrape, as the desk needs to read it. */
type ScrapeReport = {
  at: string;
  /** Stored for the first time by that run. */
  created: number;
  /** Already on the desk; the feeds listed them again. */
  updated: number;
  /** Source urls of the new arrivals, for splitting the list. */
  newUrls: Set<string>;
  /** Article pages read during the same press. */
  videosFound: number;
  textSaved: number;
  /** Pages still waiting to be read. */
  remaining: number;
};

const LENSES: Array<{ id: Lens; label: string }> = [
  { id: "stories", label: "Stories" },
  { id: "wire", label: "Wire" },
  { id: "new", label: "Undrafted" },
  { id: "contested", label: "Contested" },
];

/** Which definition sits behind each headline number. */
const STAT_TERMS: Record<StatKind, string> = {
  stories: "story",
  articles: "article",
  outlets: "outlet",
  topics: "topic",
  domains: "domain",
  contested: "contested",
  undrafted: "undrafted",
};

const PAGE_STEP = 25;

/** Feed health reads at a glance; the word is still there beside it. */
const SOURCE_STATUS_INK: Record<SourceStatus, string> = {
  failing: STATUS.fail,
  stale: STATUS.warn,
  pending: STATUS.idle,
  healthy: STATUS.live,
  disabled: STATUS.idle,
};

const STATUS_LABEL: Record<SourceStatus, string> = {
  failing: "Failing",
  stale: "Stale",
  pending: "Pending",
  healthy: "Healthy",
  disabled: "Off",
};

function ago(iso: string | null) {
  if (!iso) return "never";
  const at = Date.parse(iso);
  if (Number.isNaN(at)) return "unknown";
  const diff = Date.now() - at;
  if (diff < 60 * 60 * 1000) return `${Math.max(1, Math.round(diff / 60000))}m`;
  if (diff < 24 * 60 * 60 * 1000) return `${Math.round(diff / 3600000)}h`;
  return `${Math.round(diff / 86400000)}d`;
}

export function Newsroom() {
  const router = useRouter();
  const [topic, setTopic] = useState<NewsTopicId>("all");
  const [activeLens, setActiveLens] = useState<Lens>("stories");
  const [data, setData] = useState<DeskPayload | null>(null);
  const [filters, setFilters] = useState<NewsroomFilters>(
    EMPTY_NEWSROOM_FILTERS,
  );
  const [pinnedTopic, setPinnedTopic] = useState<string | null>(null);
  /**
   * Views are a stack, so opening an outlet from inside a topic can step back
   * to the topic rather than dumping the reader on the page.
   */
  const [stack, setStack] = useState<View[]>([]);
  const modal = stack[stack.length - 1] ?? null;
  const push = useCallback((view: View) => setStack((s) => [...s, view]), []);
  const pop = useCallback(() => setStack((s) => s.slice(0, -1)), []);
  const closeAll = useCallback(() => setStack([]), []);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [cursor, setCursor] = useState("");
  const [visible, setVisible] = useState(PAGE_STEP);

  const [loading, setLoading] = useState(true);
  /** History pulled in behind the desk's newest page. */
  const [archive, setArchive] = useState<NewsroomItem[]>([]);
  const [loadingArchive, setLoadingArchive] = useState(false);
  const [archiveExhausted, setArchiveExhausted] = useState(false);
  const [drafting, setDrafting] = useState(false);

  const previews = usePreviewCache();

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  /**
   * What the last press of Scrape actually brought in.
   *
   * Without this a scrape is indistinguishable from a refresh: the list just
   * redraws and the desk cannot tell which stories are new. Holding the report
   * lets the run be reported honestly — arrivals apart from everything the
   * feeds merely listed again — and it is cleared as soon as the lens, topic
   * or filters change, because the split stops being meaningful there.
   */
  const [scrapeReport, setScrapeReport] = useState<ScrapeReport | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);
  const inFlight = useRef(false);
  const deferredQuery = useDeferredValue(filters.query);

  const load = useCallback(
    async (
      nextTopic: NewsTopicId,
      mode: "full" | "silent" | "fresh" = "full",
    ) => {
      if (inFlight.current) return;
      inFlight.current = true;
      if (mode !== "silent") setLoading(true);
      try {
        const res = await fetch(
          `/api/admin/desk?topic=${encodeURIComponent(nextTopic)}${
            mode === "fresh" ? "&fresh=1" : ""
          }`,
        );
        const payload = (await res.json()) as DeskPayload & { error?: string };
        if (!res.ok) throw new Error(payload.error || "Failed to load");
        setData(payload);
        setError("");
      } catch (err) {
        if (mode !== "silent") {
          setError(err instanceof Error ? err.message : "Failed to load");
        }
      } finally {
        inFlight.current = false;
        if (mode !== "silent") setLoading(false);
      }
    },
    [],
  );


  useEffect(() => {
    // A topic change is a different corpus; the pages read behind the old
    // one do not belong to it.
    setArchive([]);
    setArchiveExhausted(false);
    void load(topic);
  }, [load, topic]);

  useEffect(() => {
    setVisible(PAGE_STEP);
  }, [filters, topic, activeLens, pinnedTopic]);

  /** What the desk itself returned: the newest page. */
  const deskItems = useMemo(() => data?.items ?? [], [data?.items]);

  /**
   * The desk plus whatever history has been pulled in behind it.
   *
   * Archive pages are appended rather than swapped in, so scrolling back never
   * costs you the front page, and every count, filter and cluster on the
   * screen is computed over the whole of what is loaded.
   */
  const items = useMemo(
    () => (archive.length ? [...deskItems, ...archive] : deskItems),
    [deskItems, archive],
  );

  /**
   * Reads one page further back and appends it.
   *
   * The desk holds the newest few hundred stories, so anything older simply
   * stopped existing as soon as enough new ones arrived. Each press asks for
   * the next page after everything already loaded and appends it, so the
   * archive accumulates rather than replacing the desk.
   *
   * A page that adds nothing new ends the walk, which is also how the end of
   * the corpus announces itself.
   */
  const loadArchive = useCallback(async () => {
    if (inFlight.current) return;
    const loaded = [...deskItems, ...archive];
    if (!loaded.length) return;

    inFlight.current = true;
    setLoadingArchive(true);
    try {
      // The offset is how many stored stories are already here, so the next
      // page begins exactly where this one ends.
      const res = await fetch(
        `/api/admin/desk?topic=${encodeURIComponent(topic)}&offset=${loaded.length}`,
      );
      const payload = (await res.json()) as DeskPayload & { error?: string };
      if (!res.ok) throw new Error(payload.error || "Failed to load archive");

      const seen = new Set(loaded.map((item) => item.key));
      const fresh = payload.items.filter((item) => !seen.has(item.key));
      if (!fresh.length) {
        setArchiveExhausted(true);
        return;
      }
      setArchive((current) => [...current, ...fresh]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load archive");
    } finally {
      inFlight.current = false;
      setLoadingArchive(false);
    }
  }, [deskItems, archive, topic]);

  /** Pinning a topic narrows the whole stream to that subject. */
  const scoped = useMemo(() => {
    if (!pinnedTopic) return items;
    const entry = data?.topics.find((row) => row.id === pinnedTopic);
    if (!entry) return items;
    const keys = new Set(topicArticles(entry).map((item) => item.key));
    return items.filter((item) => keys.has(item.key));
  }, [items, pinnedTopic, data?.topics]);

  const filtered = useMemo(
    () => filterNewsroomItems(scoped, { ...filters, query: deferredQuery }),
    [scoped, filters, deferredQuery],
  );

  const clusters = useMemo(
    () => sortNewsroomClusters(clusterNewsroomItems(filtered), "newest"),
    [filtered],
  );

  const rows = useMemo<
    Array<{ item: NewsroomItem; cluster?: NewsroomCluster }>
  >(() => {
    if (activeLens === "stories") {
      return clusters.map((cluster) => ({ item: cluster.lead, cluster }));
    }
    if (activeLens === "contested") {
      return clusters
        .filter((cluster) => cluster.sourceCount > 1)
        .sort((a, b) => b.sourceCount - a.sourceCount)
        .map((cluster) => ({ item: cluster.lead, cluster }));
    }
    const flat = [...filtered].sort(
      (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
    );
    if (activeLens === "new") {
      return flat.filter((item) => !item.imported).map((item) => ({ item }));
    }
    return flat.map((item) => ({ item }));
  }, [activeLens, clusters, filtered]);

  const paged = useMemo(() => rows.slice(0, visible), [rows, visible]);

  /** The visible rows split by whether the last scrape brought them in. */
  const split = useMemo(
    () => splitByArrival(paged, scrapeReport?.newUrls ?? EMPTY_URLS),
    [paged, scrapeReport],
  );

  // Pull the text for everything on screen ahead of the click, so opening a
  // story is instant rather than a wait.
  useEffect(() => {
    if (!paged.length) return;
    previews.prefetch(paged.map((row) => row.item.sourceUrl));
  }, [paged, previews]);

  const openStory = useCallback(
    (item: NewsroomItem) => {
      previews.prioritise(item.sourceUrl);
      push({ kind: "story", key: item.key });
    },
    [previews, push],
  );

  const markImported = useCallback((keys: Set<string>) => {
    setData((current) =>
      current
        ? {
            ...current,
            items: current.items.map((item) =>
              keys.has(item.key) ? { ...item, imported: true } : item,
            ),
          }
        : current,
    );
  }, []);

  const draft = useCallback(
    async (targets: NewsroomItem[]) => {
      const fresh = targets.filter((item) => !item.imported);
      if (!fresh.length) return;
      setDrafting(true);
      setError("");
      setNotice("");
      try {
        const res = await fetch("/api/admin/events/draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            urls: fresh.map((item) => item.sourceUrl),
            topic,
          }),
        });
        const payload = (await res.json()) as {
          created?: Array<{ id: string }>;
          skipped?: Array<{ url: string; reason: string }>;
          error?: string;
        };
        if (!res.ok) throw new Error(payload.error || "Failed to draft");
        const created = payload.created ?? [];
        const skipped = payload.skipped ?? [];
        const skippedUrls = new Set(skipped.map((entry) => entry.url));
        if (created.length) {
          markImported(
            new Set(
              fresh
                .filter((item) => !skippedUrls.has(item.sourceUrl))
                .map((item) => item.key),
            ),
          );
          setSelected(new Set());

          /**
           * One draft means you meant to write it, so go there.
           *
           * Drafting used to leave you on the wire with a line of grey text
           * and a link to hunt for — the story was converted, formatted and
           * waiting, and nothing took you to it. A batch is different: there
           * is no single document to open, so that keeps the summary.
           */
          if (created.length === 1) {
            router.push(`/admin/blog/${created[0].id}`);
            return;
          }

          setNotice(
            `${created.length} drafts created${
              skipped.length ? ` · ${skipped.length} skipped` : ""
            }.`,
          );
          return;
        }
        setError(skipped[0]?.reason || "No drafts were created.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to draft");
      } finally {
        setDrafting(false);
      }
    },
    [markImported, router, topic],
  );

  const dismiss = useCallback(
    async (targets: NewsroomItem[]) => {
      if (!targets.length) return;
      const keys = new Set(targets.map((item) => item.key));
      setData((current) =>
        current
          ? {
              ...current,
              items: current.items.filter((item) => !keys.has(item.key)),
            }
          : current,
      );
      setSelected(new Set());
      try {
        const res = await fetch("/api/admin/newsroom", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "dismiss",
            urls: targets.map((item) => item.sourceUrl),
            ids: targets
              .map((item) => item.id)
              .filter((id): id is string => Boolean(id)),
          }),
        });
        if (!res.ok) throw new Error("Failed to dismiss");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to dismiss");
        void load(topic, "silent");
      }
    },
    [load, topic],
  );

  const selectedItems = useMemo(
    () => filtered.filter((item) => selected.has(item.key)),
    [filtered, selected],
  );

  /** Index of the story currently open, for prev/next stepping. */
  const openIndex = useMemo(
    () =>
      modal?.kind === "story"
        ? paged.findIndex((row) => row.item.key === modal.key)
        : -1,
    [modal, paged],
  );

  const stepStory = useCallback(
    (delta: number) => {
      if (openIndex < 0) return;
      const next = paged[openIndex + delta];
      if (next) void openStory(next.item);
    },
    [openIndex, paged, openStory],
  );

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      // Inside a story, j/k and the arrows step to the next one.
      if (modal?.kind === "story") {
        if (event.key === "j" || event.key === "ArrowRight") {
          event.preventDefault();
          stepStory(1);
        }
        if (event.key === "k" || event.key === "ArrowLeft") {
          event.preventDefault();
          stepStory(-1);
        }
        return;
      }
      if (modal) return;

      if (event.key === "/") {
        event.preventDefault();
        searchRef.current?.focus();
        return;
      }
      const index = paged.findIndex((row) => row.item.key === cursor);
      if (event.key === "j" || event.key === "ArrowDown") {
        event.preventDefault();
        const next = paged[index + 1] ?? paged[0];
        if (next) setCursor(next.item.key);
        return;
      }
      if (event.key === "k" || event.key === "ArrowUp") {
        event.preventDefault();
        const prev = paged[index - 1] ?? paged[paged.length - 1];
        if (prev) setCursor(prev.item.key);
        return;
      }
      const current = paged[index];
      if (!current) return;
      if (event.key === "Enter") {
        event.preventDefault();
        void openStory(current.item);
      }
      if (event.key === "d") {
        event.preventDefault();
        void draft([current.item]);
      }
      if (event.key === "x") {
        event.preventDefault();
        void dismiss(current.cluster ? current.cluster.items : [current.item]);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cursor, dismiss, draft, modal, openStory, paged, stepStory]);

  /** Resolve a display name to the outlet identity used for grouping. */
  const openOutletByName = useCallback(
    (name: string) => {
      const match = items.find((item) => item.source === name);
      push({ kind: "outlet", outlet: match ? outletKey(match) : name });
    },
    [items, push],
  );

  const openOutletName = useMemo(() => {
    if (modal?.kind !== "outlet") return null;
    const match = items.find((item) => outletKey(item) === modal.outlet);
    return match
      ? `${items.filter((i) => outletKey(i) === modal.outlet).length} articles in the corpus`
      : null;
  }, [modal, items]);

  const openOutletTitle = useMemo(() => {
    if (modal?.kind !== "outlet") return "";
    const match = items.find((item) => outletKey(item) === modal.outlet);
    return match?.source ?? modal.outlet;
  }, [modal, items]);

  /** The label on the back button names the level below. */
  const backLabel = useMemo(() => {
    const under = stack[stack.length - 2];
    if (!under) return undefined;
    if (under.kind === "topic") {
      return data?.topics.find((t) => t.id === under.id)?.label ?? "Topic";
    }
    if (under.kind === "outlet") {
      const match = items.find((item) => outletKey(item) === under.outlet);
      return match?.source ?? "Outlet";
    }
    if (under.kind === "stat") return STAT_TITLE[under.stat];
    if (under.kind === "domain") {
      return domainById(under.id)?.label ?? "Subject area";
    }
    if (under.kind === "source") {
      return (
        data?.sources.find((entry) => entry.id === under.id)?.name ?? "Source"
      );
    }
    if (under.kind === "slice") {
      const spec = under.slice;
      if (spec.type === "lean") return LEAN_LABELS[spec.lean];
      if (spec.type === "cell") {
        return `${domainById(spec.domain)?.label ?? spec.domain} · ${LEAN_LABELS[spec.lean]}`;
      }
      if (spec.type === "reach") return `${REACH_LABEL[spec.reach]} topics`;
      if (spec.type === "framing") return `“${spec.term}”`;
      return "That hour";
    }
    return "Story";
  }, [stack, data?.topics, data?.sources, items]);

  const openStoryRow = useMemo(
    () =>
      modal?.kind === "story"
        ? (rows.find((row) => row.item.key === modal.key) ??
          (() => {
            const item = items.find((entry) => entry.key === modal.key);
            return item ? { item, cluster: undefined } : undefined;
          })())
        : undefined,
    [modal, rows, items],
  );

  const openTopic = useMemo(
    () =>
      modal?.kind === "topic"
        ? (data?.topics.find((entry) => entry.id === modal.id) ?? null)
        : null,
    [modal, data?.topics],
  );

  const openPreview =
    openStoryRow ? previews.get(openStoryRow.item.sourceUrl) : undefined;

  const domains = useMemo(() => data?.domains ?? [], [data?.domains]);

  /** One sparkline per domain, over the same 48h window as the corpus chart. */
  const domainVolume = useMemo(() => {
    const map = new Map<string, Array<{ at: number; count: number }>>();
    for (const domain of domains) {
      map.set(
        domain.id,
        volumeSeries(
          domain.topics.flatMap((topic) => topic.stories),
          { buckets: 20, hours: 48 },
        ),
      );
    }
    return map;
  }, [domains]);

  /** Domain × spectrum grid: which parts of the press carry which subjects. */
  const heatCells = useMemo(
    () =>
      domains.flatMap((domain) =>
        LEAN_COLS.map((lean) => ({
          row: domain.id,
          col: lean,
          value: domain.leanCounts[lean] ?? 0,
        })),
      ),
    [domains],
  );

  /**
   * Topics split by how widely they are carried. Mainstream first because that
   * is what the desk is already covering; niche last because that is where the
   * unclaimed work is, and it reads as a conclusion rather than a preamble.
   */
  const byReach = useMemo(() => {
    const groups: Record<Reach, ClassifiedTopic[]> = {
      mainstream: [],
      emerging: [],
      niche: [],
    };
    for (const topic of data?.topics ?? []) groups[topic.reach].push(topic);
    return groups;
  }, [data?.topics]);

  const openDomain = useMemo(
    () =>
      modal?.kind === "domain"
        ? (domains.find((entry) => entry.id === modal.id) ?? null)
        : null,
    [modal, domains],
  );

  const openSource = useMemo(
    () =>
      modal?.kind === "source"
        ? (data?.sources.find((entry) => entry.id === modal.id) ?? null)
        : null,
    [modal, data?.sources],
  );

  /** Articles belonging to one topic id, used by several slice types. */
  const itemsForDomain = useCallback(
    (id: DomainId) => {
      const domain = domains.find((entry) => entry.id === id);
      if (!domain) return [];
      return domain.topics.flatMap((topic) =>
        topic.stories.flatMap((cluster) => cluster.items),
      );
    },
    [domains],
  );

  /**
   * Turns a slice description into the articles it names.
   *
   * The bucket case has to re-derive the window the timeline chart used, since
   * the chart hands back only the bucket's start time.
   */
  const slice = useMemo(() => {
    if (modal?.kind !== "slice") return null;
    const spec = modal.slice;

    if (spec.type === "lean") {
      return {
        title: `${LEAN_LABELS[spec.lean]} coverage`,
        blurb: `Every article in the corpus from outlets rated ${LEAN_LABELS[spec.lean].toLowerCase()}.`,
        note: "Ratings describe an outlet's typical editorial framing, not the accuracy of any single article.",
        items: items.filter((item) => leanForOutlet(item).lean === spec.lean),
      };
    }

    if (spec.type === "cell") {
      const domain = domains.find((entry) => entry.id === spec.domain);
      return {
        title: `${domain?.label ?? spec.domain} · ${LEAN_LABELS[spec.lean]}`,
        blurb: `${domain?.label ?? "This area"} as covered by outlets rated ${LEAN_LABELS[spec.lean].toLowerCase()}.`,
        items: itemsForDomain(spec.domain).filter(
          (item) => leanForOutlet(item).lean === spec.lean,
        ),
      };
    }

    if (spec.type === "bucket") {
      // The corpus timeline runs 48h over 32 buckets, so each spans 90 minutes.
      const span = (48 * 60 * 60 * 1000) / 32;
      const end = spec.at + span;
      return {
        title: new Date(spec.at).toLocaleString([], {
          weekday: "long",
          hour: "2-digit",
          minute: "2-digit",
        }),
        blurb: `Everything published in the 90 minutes from ${new Date(spec.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`,
        note: "Timestamps come from the publisher's own feed, and some outlets stamp the fetch time rather than the publication time.",
        items: items.filter((item) => {
          const at = Date.parse(item.publishedAt);
          return at >= spec.at && at < end;
        }),
      };
    }

    if (spec.type === "reach") {
      const topics = byReach[spec.reach];
      return {
        title: `${REACH_LABEL[spec.reach]} topics`,
        blurb: `${REACH_BLURB[spec.reach]} ${topics.length} ${topics.length === 1 ? "topic" : "topics"} at this reach.`,
        items: topics.flatMap((topic) =>
          topic.stories.flatMap((cluster) => cluster.items),
        ),
      };
    }

    const term = spec.term.toLowerCase();
    return {
      title: `“${spec.term}”`,
      blurb: `Every article whose headline or summary uses the word “${spec.term}”.`,
      note: "A plain word match. It counts the term inside a quotation the same as the outlet's own voice, and cannot tell the two apart.",
      items: items.filter((item) =>
        ` ${`${item.title} ${item.snippet}`.toLowerCase()} `.includes(
          ` ${term} `,
        ),
      ),
    };
  }, [modal, items, domains, byReach, itemsForDomain]);

  const totals = data?.totals;
  const pinned = data?.topics.find((entry) => entry.id === pinnedTopic) ?? null;

  return (
    <ExplainProvider>
    <div className="space-y-16">
      {/* The same six-up stat grid the overview opens with. */}
      <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:grid-cols-7">
        {(
          [
            ["stories", "Stories", totals?.stories],
            ["articles", "Articles", totals?.articles],
            ["outlets", "Outlets", totals?.outlets],
            ["domains", "Subject Areas", totals?.domains],
            ["topics", "Topics", totals?.topics],
            ["contested", "Contested", totals?.contested],
            ["undrafted", "Undrafted", totals?.fresh],
          ] as Array<[StatKind, string, number | undefined]>
        ).map(([stat, label2, value]) => (
          <div key={stat} className="relative">
            <button
              type="button"
              onClick={() => push({ kind: "stat", stat })}
              className="w-full text-left transition-opacity hover:opacity-70"
              aria-label={`${label2} — open detail`}
            >
              <PlainFigure label={label2} value={value ?? 0} />
            </button>
            {/* Pressing the number opens the articles behind it; pressing the
                marker opens what the measure means. */}
            <span className="absolute right-3 top-3">
              <ExplainMark id={STAT_TERMS[stat]} />
            </span>
          </div>
        ))}
      </div>

      {data ? (
        <section className={SECTION}>
          <PlainHeading
            note={
              /* Scrape belongs beside the line that says how stale the corpus
                 is — that sentence is what makes anyone want to press it. It
                 used to live at the bottom of the page in the wire's header,
                 which is a long way from the question it answers. */
              <span className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <span>
                  Scraped{" "}
                  <span className="tabular-nums">
                    {ago(data.lastScrapedAt)}
                  </span>{" "}
                  ago
                </span>
                <ScrapeButton
                  disabled={loading}
                  onPayload={(payload) => {
                    const registry = payload.registry;
                    setScrapeReport({
                      at: registry?.scrapedAt ?? new Date().toISOString(),
                      created: registry?.created ?? 0,
                      updated: registry?.updated ?? 0,
                      newUrls: new Set(
                        (registry?.newItems ?? []).map((entry) => entry.url),
                      ),
                      videosFound: payload.enriched?.videosFound ?? 0,
                      textSaved: payload.enriched?.textSaved ?? 0,
                      remaining: payload.enriched?.remaining ?? 0,
                    });
                  }}
                  onDone={() => load(topic, "fresh")}
                />
              </span>
            }
          >
            <Explain id="spectrum-bar">Coverage across the spectrum</Explain>
          </PlainHeading>

          <SpectrumBar counts={data.corpusLean} height={4} />

          <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4 lg:grid-cols-8">
            {[...LEAN_SCALE, "unrated" as Lean].map((lean) => (
              <button
                key={lean}
                type="button"
                onClick={() =>
                  push({ kind: "slice", slice: { type: "lean", lean } })
                }
                className="flex flex-col text-left transition-opacity hover:opacity-70"
                aria-label={`${LEAN_LABELS[lean]} coverage — open detail`}
              >
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="h-1.5 w-4 shrink-0 rounded-sm"
                    style={{ backgroundColor: LEAN_INK[lean] }}
                  />
                  <span className="text-[0.85rem] text-[#737373]">
                    {LEAN_LABELS[lean]}
                  </span>
                </span>
                <span className="mt-2 text-[1.35rem] font-medium leading-none tabular-nums text-[#111]">
                  {data.corpusLean[lean] ?? 0}
                </span>
              </button>
            ))}
          </div>

          <p className="mt-8 max-w-3xl text-[0.8rem] leading-relaxed text-[#737373]">
            Lean ratings are assigned per outlet from published media-bias
            services and describe typical editorial framing, not the accuracy of
            any article. They are contested, and editable in
            src/lib/news/lean.ts. State outlets sit off this scale.
          </p>
        </section>
      ) : null}

      {/* Publication volume across the whole corpus. */}
      {data?.volume?.length ? (
        <section className={SECTION}>
          <PlainHeading
            note={
              <>
                <span className="tabular-nums">
                  {data.volume.reduce((sum, point) => sum + point.count, 0)}
                </span>{" "}
                articles timestamped in window
              </>
            }
          >
            <Explain id="article">Publication volume over 48 hours</Explain>
          </PlainHeading>
          <ColumnChart
            series={data.volume}
            height={80}
            onSelect={(point) =>
              push({ kind: "slice", slice: { type: "bucket", at: point.at } })
            }
            formatLabel={(at) =>
              new Date(at).toLocaleString([], {
                weekday: "short",
                hour: "2-digit",
              })
            }
          />
        </section>
      ) : null}

      {/* General level: the fixed subject areas. */}
      {domains.length ? (
        <section className={SECTION}>
          <PlainHeading
            note={
              <button
                type="button"
                onClick={() => push({ kind: "stat", stat: "domains" })}
                className={plainControl}
              >
                All {domains.length} →
              </button>
            }
          >
            <Explain id="domain">Subject areas</Explain>
          </PlainHeading>

          <div className="grid grid-cols-1 gap-x-12 gap-y-8 lg:grid-cols-2">
            {domains.map((domain) => (
              <div key={domain.id} className="border-b border-black/[0.06] pb-6">
                <div className="flex items-start justify-between gap-6">
                  <button
                    type="button"
                    onClick={() => push({ kind: "domain", id: domain.id })}
                    className="min-w-0 text-left transition-opacity hover:opacity-75"
                  >
                    <p className="text-[0.95rem] font-medium text-[#111]">
                      {domain.label}
                    </p>
                    <p className="mt-1.5 text-[0.82rem] leading-relaxed text-[#737373]">
                      {domain.blurb}
                    </p>
                  </button>
                  <div className="shrink-0 text-right">
                    <Sparkline
                      series={domainVolume.get(domain.id) ?? []}
                      width={110}
                      height={26}
                      label={`${domain.label}: ${domain.articleCount} articles over 48 hours`}
                    />
                    <p className="mt-1.5 text-[0.82rem] tabular-nums text-[#737373]">
                      {domain.articleCount} · {Math.round(domain.share * 100)}%
                    </p>
                  </div>
                </div>

                <div className="mt-3.5">
                  <SpectrumBar counts={domain.leanCounts} height={3} />
                </div>

                <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
                  {domain.topics.slice(0, 6).map((topic) => (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => push({ kind: "topic", id: topic.id })}
                      className="text-[0.85rem] text-[#737373] transition-colors hover:text-black"
                    >
                      {topic.label}
                      <span className="ml-1.5 text-[0.78rem] tabular-nums text-[#737373]">
                        {topic.storyCount}
                      </span>
                    </button>
                  ))}
                  {domain.topics.length > 6 ? (
                    <span className="text-[0.82rem] text-[#737373]">
                      +{domain.topics.length - 6}
                    </span>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => push({ kind: "domain", id: domain.id })}
                  className="mt-3.5 block text-left text-[0.85rem] text-[#737373] transition-colors hover:text-black"
                >
                  {domain.storyCount} stories · {domain.outletCount} outlets ·{" "}
                  {domain.spread}/7 sides · {balanceWord(domain.balance)} →
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Which part of the press is carrying which subject. */}
      {domains.length ? (
        <section className={SECTION}>
          <PlainHeading note="Shaded by share of each row">
            <Explain id="lean">Subject area against the spectrum</Explain>
          </PlainHeading>
          <Heatmap
            rows={domains.map((domain) => ({
              id: domain.id,
              label: domain.label,
            }))}
            cols={LEAN_COLS}
            cells={heatCells}
            colLabel={leanColLabel}
            colInk={leanColInk}
            onSelectRow={(id) => push({ kind: "domain", id: id as DomainId })}
            onSelectCol={(col) =>
              push({
                kind: "slice",
                slice: { type: "lean", lean: col as Lean },
              })
            }
            onSelectCell={(row, col) =>
              push({
                kind: "slice",
                slice: {
                  type: "cell",
                  domain: row as DomainId,
                  lean: col as Lean,
                },
              })
            }
          />
          <p className="mt-5 max-w-3xl text-[0.8rem] leading-relaxed text-[#737373]">
            A row that shades to one side is a subject only part of the press is
            carrying. It describes this corpus over this window, not any
            outlet in general.
          </p>
        </section>
      ) : null}

      {/* Specific level: emergent topics, graded by how widely carried. */}
      {data?.topics.length ? (
        <section className={SECTION}>
          <PlainHeading note="Specific subjects, by how far they reach">
            <Explain id="topic">Topics</Explain>
          </PlainHeading>

          <div className="mb-9">
            <p className="mb-3 text-[0.9rem] font-medium text-[#404040]">
              Where each topic sits on the scale
            </p>
            <BalancePlot
              rows={data.topics.map((topic) => ({
                id: topic.id,
                label: topic.label,
                balance: topic.balance,
                weight: topic.articleCount,
              }))}
              onSelect={(id) => push({ kind: "topic", id })}
            />
          </div>

          <div className="space-y-10">
            {(["mainstream", "emerging", "niche"] as Reach[]).map((reach) =>
              byReach[reach].length ? (
                <div key={reach}>
                  {/* The mark is a sibling of the button, not a child. A
                      <button> inside a <button> is invalid HTML: React logs a
                      hydration error for it on every render, and the inner
                      control is not reliably clickable. */}
                  <div className="mb-3 flex flex-wrap items-baseline gap-x-3">
                    <button
                      type="button"
                      onClick={() =>
                        push({ kind: "slice", slice: { type: "reach", reach } })
                      }
                      className="flex flex-wrap items-baseline gap-x-3 text-left transition-opacity hover:opacity-75"
                    >
                      <span className="text-[0.9rem] font-medium text-[#111]">
                        {REACH_LABEL[reach]}
                      </span>
                      <span className="text-[0.85rem] tabular-nums text-[#737373]">
                        {byReach[reach].length}
                      </span>
                      <span className="text-[0.82rem] text-[#737373]">
                        {REACH_BLURB[reach]}
                      </span>
                    </button>
                    <ExplainMark id="reach" />
                  </div>
                  <TopicTable
                    topics={byReach[reach]}
                    pinnedTopic={pinnedTopic}
                    onOpen={(id) => push({ kind: "topic", id })}
                  />
                </div>
              ) : null,
            )}
          </div>
        </section>
      ) : null}

      <section className={SECTION}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-[1.05rem] font-medium text-[#111]">The wire</h3>
          <div className="flex flex-wrap items-center gap-6">
            <Link
              href="/admin/blog"
              className={`${CONTROL} text-[#737373] hover:text-black`}
            >
              Editorial
            </Link>
            <button
              type="button"
              onClick={() => void load(topic, "fresh")}
              disabled={loading}
              className={`${CONTROL} text-[#737373] hover:text-black disabled:opacity-30`}
            >
              {loading ? "Refreshing" : "Refresh"}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <input
            ref={searchRef}
            value={filters.query}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                query: event.target.value,
              }))
            }
            placeholder="Search the wire…"
            className="min-w-[16rem] flex-1 border-b border-black/10 bg-transparent px-0 py-2 text-sm text-[#111] placeholder:text-[#a3a3a3] focus:border-white/20 focus:outline-none"
          />
          <div className="flex flex-wrap items-center gap-6">
            {LENSES.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => setActiveLens(entry.id)}
                className={`${CONTROL} ${
                  activeLens === entry.id
                    ? "text-[#111]"
                    : "text-[#737373] hover:text-[#737373]"
                }`}
              >
                {entry.label}
              </button>
            ))}
          </div>
          <select
            value={topic}
            onChange={(event) => setTopic(event.target.value as NewsTopicId)}
            className="cursor-pointer appearance-none bg-transparent text-[0.8rem] text-[#737373] focus:outline-none"
          >
            {NEWS_TOPICS.map((entry) => (
              <option
                key={entry.id}
                value={entry.id}
                style={{ backgroundColor: "#ffffff" }}
              >
                {entry.label}
              </option>
            ))}
          </select>
          <span className={`${MICRO} `}>{rows.length} shown</span>
          {/* Kept beside the count rather than at the foot of the list: pulling
              a page of history makes more rows than fit, which puts "load more"
              back on screen and hides anything reported down there — exactly
              when you most want to know the archive grew. */}
          {archive.length ? (
            <span className={`${MICRO} text-[#ffffff]`}>
              +{archive.length} archived
            </span>
          ) : null}
        </div>

        {pinned ? (
          <p className="mt-6 flex flex-wrap items-baseline gap-x-4 text-[0.8rem] text-[#737373]">
            <span className="font-semibold text-[#111]">{pinned.label}</span>
            <span>
              {pinned.outletCount} outlets · {pinned.spread}/7 sides ·{" "}
              {balanceWord(pinned.balance)}
            </span>
            <button
              type="button"
              onClick={() => setPinnedTopic(null)}
              className={`${CONTROL} text-[#737373] hover:text-black`}
            >
              Clear
            </button>
          </p>
        ) : null}

        {selected.size ? (
          <p className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.8rem] text-[#737373]">
            <span className="font-semibold text-[#111]">
              {selected.size} selected
            </span>
            <button
              type="button"
              onClick={() => void draft(selectedItems)}
              disabled={drafting}
              className={`${CONTROL} text-[#111] hover:text-black disabled:opacity-30`}
            >
              {drafting ? "Writing" : "Draft selected"}
            </button>
            <button
              type="button"
              onClick={() => void dismiss(selectedItems)}
              className={`${CONTROL} text-[#737373] hover:text-black`}
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className={`${CONTROL} text-[#737373] hover:text-black`}
            >
              Clear
            </button>
          </p>
        ) : null}

        {scrapeReport ? (
          <ScrapeSummary
            report={scrapeReport}
            onDismiss={() => setScrapeReport(null)}
          />
        ) : null}
        {error ? <p className="mt-6 text-sm text-[#111]">{error}</p> : null}
        {notice ? (
          <p className="mt-6 text-sm text-[#737373]">
            {notice}{" "}
            <Link
              href="/admin/blog"
              className="text-[#111] underline underline-offset-4"
            >
              Open editorial
            </Link>
          </p>
        ) : null}

        <div className="mt-8">
          {loading && !data ? (
            <div className="py-12 text-center text-sm text-[#737373]">
              Reading the wire…
            </div>
          ) : rows.length ? (
            <>
              {(() => {
                const renderRow = ({
                  item,
                  cluster,
                }: (typeof paged)[number]) => (
                  <StoryEntry
                    key={item.key}
                    item={item}
                    cluster={cluster}
                    checked={selected.has(item.key)}
                    selectable={activeLens === "new"}
                    busy={drafting}
                    onOpen={() => void openStory(item)}
                    onToggle={() =>
                      setSelected((current) => {
                        const next = new Set(current);
                        if (next.has(item.key)) next.delete(item.key);
                        else next.add(item.key);
                        return next;
                      })
                    }
                    onDraft={() => void draft([item])}
                    onDismiss={() =>
                      void dismiss(cluster ? cluster.items : [item])
                    }
                  />
                );

                // Without a scrape to report against, everything is simply the
                // desk as it stands — one list, no headings.
                if (!split.fresh.length) {
                  return <ul>{paged.map(renderRow)}</ul>;
                }

                return (
                  <>
                    <SplitHeading
                      label="New this scrape"
                      count={split.fresh.length}
                      tone="fresh"
                    />
                    <ul>{split.fresh.map(renderRow)}</ul>
                    {split.older.length ? (
                      <>
                        <SplitHeading
                          label="Already on the desk"
                          count={split.older.length}
                          tone="older"
                        />
                        <ul>{split.older.map(renderRow)}</ul>
                      </>
                    ) : null}
                  </>
                );
              })()}
              {visible < rows.length ? (
                <button
                  type="button"
                  onClick={() => setVisible((n) => n + PAGE_STEP)}
                  className={`mt-8 w-full py-3 ${CONTROL} text-[#737373] hover:text-black`}
                >
                  Load {Math.min(PAGE_STEP, rows.length - visible)} more
                </button>
              ) : (
                /* Everything loaded is on screen, so the only thing left is
                   history. The archive keeps whatever it fetches, so pressing
                   this repeatedly walks steadily backwards through the corpus
                   rather than replacing the desk. */
                <div className="mt-10 border-t border-[#26262e] pt-6 text-center">
                  {archiveExhausted ? (
                    <p className="text-[0.78rem] text-[#737373]">
                      That is the whole archive — nothing older is stored.
                    </p>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => void loadArchive()}
                        disabled={loadingArchive}
                        className={`${CONTROL} px-5 py-3 text-[#737373] transition-colors hover:text-black disabled:opacity-40`}
                      >
                        {loadingArchive
                          ? "Reading the archive…"
                          : "Load earlier stories"}
                      </button>
                      {archive.length ? (
                        <p className="mt-2 text-[0.72rem] text-[#a3a3a3]">
                          <span className="tabular-nums">{archive.length}</span>{" "}
                          archived stories loaded
                        </p>
                      ) : null}
                    </>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center text-sm text-[#737373]">
              Nothing here. Clear the search, or scrape for fresh wire.
            </div>
          )}
        </div>
      </section>

      {data ? (
        <section className={SECTION}>
          <h3 className="mb-5 text-[1.05rem] font-medium text-[#111]">
            <Explain id="feed-health">Sources</Explain>
          </h3>
          <SourceTable
            sources={data.sources}
            onOpen={(id) => push({ kind: "source", id })}
          />
        </section>
      ) : null}

      {/* A story: its text beside the whole spread of coverage. */}
      <Modal
        open={modal?.kind === "story" && Boolean(openStoryRow)}
        onClose={closeAll}
        onBack={stack.length > 1 ? pop : undefined}
        backLabel={backLabel}
        eyebrow={
          openStoryRow ? (
            <>
              <button
                type="button"
                onClick={() => openOutletByName(openStoryRow.item.source)}
                className="text-[#737373] transition-colors hover:text-black"
              >
                {openStoryRow.item.source}
              </button>
              <span className="tabular-nums">
                {new Date(openStoryRow.item.publishedAt).toLocaleString(
                  "en-GB",
                  {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  },
                )}
              </span>
              {openStoryRow.cluster && openStoryRow.cluster.sourceCount > 1 ? (
                <span className="text-[#737373]">
                  {openStoryRow.cluster.sourceCount} outlets
                </span>
              ) : null}
              {openStoryRow.item.imported ? <span>Drafted</span> : null}
            </>
          ) : null
        }
        title={openStoryRow?.item.title ?? ""}
        actions={
          openStoryRow ? (
            <>
              <button
                type="button"
                onClick={() => void draft([openStoryRow.item])}
                disabled={drafting || openStoryRow.item.imported}
                className={`${CONTROL} text-[#111] hover:text-black disabled:opacity-30`}
              >
                {openStoryRow.item.imported
                  ? "Drafted"
                  : drafting
                    ? "Writing"
                    : "Draft"}
              </button>
              <button
                type="button"
                onClick={() => {
                  void dismiss(
                    openStoryRow.cluster
                      ? openStoryRow.cluster.items
                      : [openStoryRow.item],
                  );
                  closeAll();
                }}
                className={`${CONTROL} text-[#737373] hover:text-black`}
              >
                Dismiss
              </button>
            </>
          ) : null
        }
        footer={
          openStoryRow && stack.length === 1 ? (
            <>
              <button
                type="button"
                onClick={() => stepStory(-1)}
                disabled={openIndex <= 0}
                className={`${CONTROL} text-[#737373] hover:text-black disabled:opacity-25`}
              >
                ← Previous
              </button>
              <span className={`${MICRO} `}>
                {openIndex >= 0 ? `${openIndex + 1} / ${paged.length}` : ""}
              </span>
              <button
                type="button"
                onClick={() => stepStory(1)}
                disabled={openIndex < 0 || openIndex >= paged.length - 1}
                className={`${CONTROL} text-[#737373] hover:text-black disabled:opacity-25`}
              >
                Next →
              </button>
            </>
          ) : null
        }
      >
        {openStoryRow ? (
          <StoryModalBody
            item={openStoryRow.item}
            cluster={openStoryRow.cluster}
            preview={
              openPreview?.status === "ready" ? openPreview.preview : null
            }
            previewFail={
              openPreview?.status === "failed" ? openPreview.reason : ""
            }
            reading={!openPreview || openPreview.status === "loading"}
            onOpenOutlet={openOutletByName}
            onOpenStory={openStory}
            onOpenTerm={(term) =>
              push({ kind: "slice", slice: { type: "framing", term } })
            }
            onDraft={(targets) => void draft(targets)}
            drafting={drafting}
          />
        ) : null}
      </Modal>

      {/* A topic: the spread, the outlets, every article. */}
      <Modal
        open={modal?.kind === "topic" && Boolean(openTopic)}
        onClose={closeAll}
        onBack={stack.length > 1 ? pop : undefined}
        backLabel={backLabel}
        eyebrow={openTopic ? <span>{topicEyebrow(openTopic)}</span> : null}
        title={openTopic?.label ?? ""}
        actions={
          openTopic ? (
            <button
              type="button"
              onClick={() => {
                setPinnedTopic(openTopic.id);
                closeAll();
              }}
              className={`${CONTROL} text-[#111] hover:text-black`}
            >
              Filter wire to this
            </button>
          ) : null
        }
      >
        {openTopic ? (
          <TopicModalBody
            topic={openTopic}
            allItems={items}
            onOpenStory={openStory}
            onOpenOutlet={openOutletByName}
            onOpenLean={(lean) =>
              push({ kind: "slice", slice: { type: "lean", lean } })
            }
          />
        ) : null}
      </Modal>

      {/* An outlet: everything it has published in the corpus. */}
      <Modal
        open={modal?.kind === "outlet"}
        onClose={closeAll}
        onBack={stack.length > 1 ? pop : undefined}
        backLabel={backLabel}
        eyebrow={
          openOutletName ? <span>{openOutletName}</span> : null
        }
        title={openOutletTitle}
        actions={
          modal?.kind === "outlet" ? (
            <button
              type="button"
              onClick={() => {
                setFilters((current) => ({
                  ...current,
                  source: openOutletTitle,
                }));
                closeAll();
              }}
              className={`${CONTROL} text-[#111] hover:text-black`}
            >
              Filter wire to this
            </button>
          ) : null
        }
      >
        {modal?.kind === "outlet" ? (
          <OutletModalBody
            outlet={modal.outlet}
            items={items}
            getPreview={previews.get}
            onOpenStory={openStory}
          />
        ) : null}
      </Modal>

      {/* The working behind a headline number. */}
      <Modal
        open={modal?.kind === "stat"}
        onClose={closeAll}
        onBack={stack.length > 1 ? pop : undefined}
        backLabel={backLabel}
        eyebrow={
          modal?.kind === "stat" ? <span>{STAT_BLURB[modal.stat]}</span> : null
        }
        title={modal?.kind === "stat" ? STAT_TITLE[modal.stat] : ""}
      >
        {modal?.kind === "stat" ? (
          <StatModalBody
            kind={modal.stat}
            items={filtered}
            clusters={clusters}
            topics={data?.topics ?? []}
            domains={domains}
            onOpenStory={openStory}
            onOpenTopic={(id) => push({ kind: "topic", id })}
            onOpenOutlet={(outlet) => push({ kind: "outlet", outlet })}
          />
        ) : null}
      </Modal>

      {/* A subject area: every topic under it and who is driving it. */}
      <Modal
        open={modal?.kind === "domain" && !!openDomain}
        onClose={closeAll}
        onBack={stack.length > 1 ? pop : undefined}
        backLabel={backLabel}
        eyebrow={
          openDomain ? (
            <>
              <span>{openDomain.topics.length} topics</span>
              <span>{openDomain.storyCount} stories</span>
              <span>{openDomain.articleCount} articles</span>
              <span>{openDomain.outletCount} outlets</span>
            </>
          ) : null
        }
        title={openDomain?.label ?? ""}
      >
        {openDomain ? (
          <DomainModalBody
            domain={openDomain}
            onOpenTopic={(id) => push({ kind: "topic", id })}
            onOpenOutlet={(outlet) => push({ kind: "outlet", outlet })}
            onOpenStory={openStory}
            onOpenLean={(lean) =>
              push({
                kind: "slice",
                slice: { type: "cell", domain: openDomain.id, lean },
              })
            }
          />
        ) : null}
      </Modal>

      {/* One feed: whether it works, and what it actually produced. */}
      <Modal
        open={modal?.kind === "source" && !!openSource}
        onClose={closeAll}
        onBack={stack.length > 1 ? pop : undefined}
        backLabel={backLabel}
        eyebrow={
          openSource ? (
            <>
              <span>{STATUS_LABEL[openSource.status]}</span>
              <span>{openSource.articles} in corpus</span>
              <span>{LEAN_LABELS[openSource.lean]}</span>
            </>
          ) : null
        }
        title={openSource?.name ?? ""}
      >
        {openSource ? (
          <SourceModalBody
            source={openSource}
            items={items}
            onOpenStory={openStory}
            onOpenOutlet={(outlet) => push({ kind: "outlet", outlet })}
          />
        ) : null}
      </Modal>

      {/* Any described subset of the corpus. */}
      <Modal
        open={modal?.kind === "slice" && !!slice}
        onClose={closeAll}
        onBack={stack.length > 1 ? pop : undefined}
        backLabel={backLabel}
        eyebrow={
          slice ? <span>{slice.items.length} articles</span> : null
        }
        title={slice?.title ?? ""}
      >
        {slice ? (
          <SliceModalBody
            items={slice.items}
            blurb={slice.blurb}
            note={slice.note}
            onOpenStory={openStory}
            onOpenOutlet={(outlet) => push({ kind: "outlet", outlet })}
          />
        ) : null}
      </Modal>
    </div>
    </ExplainProvider>
  );
}

/**
 * Topics as a sortable table rather than the card grid this replaced.
 *
 * Cards showed a name and a count; the questions actually asked of a topic —
 * is anyone contesting it, how far has it spread, which way does it lean —
 * need columns you can rank on. Sorting is client-side over one already-loaded
 * group, so it never refetches.
 */
type TopicSort = "articles" | "stories" | "outlets" | "spread" | "balance";

/** Which definition sits behind each topic column. */
const TOPIC_COLUMN_TERMS: Record<TopicSort, string> = {
  articles: "article",
  stories: "story",
  outlets: "outlet",
  spread: "spread",
  balance: "balance",
};

function TopicTable({
  topics,
  pinnedTopic,
  onOpen,
}: {
  topics: ClassifiedTopic[];
  pinnedTopic: string | null;
  onOpen: (id: string) => void;
}) {
  const [sort, setSort] = useState<TopicSort>("articles");

  const sorted = useMemo(() => {
    const copy = [...topics];
    copy.sort((a, b) => {
      switch (sort) {
        case "stories":
          return b.storyCount - a.storyCount;
        case "outlets":
          return b.outletCount - a.outletCount;
        case "spread":
          return b.spread - a.spread;
        case "balance":
          // Unrated topics have no position, so they sort last either way
          // rather than being treated as centre.
          if (a.balance === null) return b.balance === null ? 0 : 1;
          if (b.balance === null) return -1;
          return a.balance - b.balance;
        default:
          return b.articleCount - a.articleCount;
      }
    });
    return copy;
  }, [topics, sort]);

  const columns: Array<[TopicSort, string]> = [
    ["articles", "Articles"],
    ["stories", "Stories"],
    ["outlets", "Outlets"],
    ["spread", "Sides"],
    ["balance", "Lean"],
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-black/10 text-left text-[0.8rem] text-[#737373]">
            <th className="pb-2.5 pr-4 font-bold">
              <Explain id="topic">Topic</Explain>
            </th>
            <th className="pb-2.5 pr-4 font-bold">
              <Explain id="domain">Subject Area</Explain>
            </th>
            <th className="pb-2.5 pr-4 font-bold">
              <Explain id="spectrum-bar">Spectrum</Explain>
            </th>
            {columns.map(([id, label]) => (
              <th
                key={id}
                className="pb-2.5 pl-3 text-right font-bold"
                aria-sort={sort === id ? "descending" : "none"}
              >
                <span className="inline-flex items-center">
                  <button
                    type="button"
                    onClick={() => setSort(id)}
                    className="transition-colors"
                    style={{ color: sort === id ? ACCENT.bright : undefined }}
                  >
                    {label}
                    {sort === id ? " ↓" : ""}
                  </button>
                  <ExplainMark id={TOPIC_COLUMN_TERMS[id]} />
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((entry) => (
            <tr
              key={entry.id}
              className={`border-b border-white/[0.02] transition-colors last:border-0 ${plainHoverTableRow}`}
            >
              <td className="py-2.5 pr-4">
                <button
                  type="button"
                  onClick={() => onOpen(entry.id)}
                  className={`text-left text-[0.85rem] transition-colors hover:text-black ${
                    entry.id === pinnedTopic
                      ? "font-semibold text-[#111]"
                      : "text-[#111]"
                  }`}
                >
                  {entry.label}
                </button>
              </td>
              <td className="py-2.5 pr-4">
                {/* Dimmed when fewer than half the headlines agreed on the
                    area — a named subject like "Trump" genuinely spans
                    several, and overstating the match would be worse than
                    showing the doubt. */}
                <span
                  className="text-[0.7rem]"
                  style={{
                    color:
                      entry.domainScore >= 0.4 ? "#8b8b96" : "#4a4a55",
                  }}
                  title={
                    entry.domain
                      ? `${Math.round(entry.domainScore * 100)}% of stories agreed`
                      : "No subject area matched"
                  }
                >
                  {entry.domain
                    ? (domainById(entry.domain)?.label ?? entry.domain)
                    : "—"}
                </span>
              </td>
              <td className="w-40 py-2.5 pr-4">
                <SpectrumBar counts={entry.leanCounts} height={3} />
              </td>
              <td className="py-3 pl-3 text-right text-[0.88rem] tabular-nums text-[#737373]">
                {entry.articleCount}
              </td>
              <td className="py-3 pl-3 text-right text-[0.88rem] tabular-nums text-[#737373]">
                {entry.storyCount}
              </td>
              <td className="py-3 pl-3 text-right text-[0.88rem] tabular-nums text-[#737373]">
                {entry.outletCount}
              </td>
              <td className="py-3 pl-3 text-right text-[0.88rem] tabular-nums text-[#737373]">
                {entry.spread}/7
              </td>
              <td className="py-3 pl-3 text-right text-[0.85rem] text-[#737373]">
                {balanceWord(entry.balance)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SourceTable({
  sources,
  onOpen,
}: {
  sources: SourceHealth[];
  onOpen: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-black/10 text-left text-[0.8rem] text-[#737373]">
            <th className="pb-3 pr-4 font-semibold">
              <Explain id="outlet">Source</Explain>
            </th>
            <th className="px-4 pb-3 font-semibold">
              <Explain id="lean">Lean</Explain>
            </th>
            <th className="px-4 pb-3 font-semibold">
              <Explain id="feed-health">State</Explain>
            </th>
            <th className="pb-3 pl-4 text-right font-semibold">
              <Explain id="article">Articles</Explain>
            </th>
          </tr>
        </thead>
        <tbody>
          {sources.map((source) => (
            <tr
              key={source.id}
              className={`border-b border-black/[0.06] transition-colors last:border-0 ${plainHoverTableRow}`}
            >
              <td className="py-3 pr-4">
                <button
                  type="button"
                  onClick={() => onOpen(source.id)}
                  className="text-left font-semibold text-[#111] transition-colors hover:text-black"
                >
                  {source.name}
                </button>
              </td>
              <td className="px-4 py-3">
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="h-1.5 w-4 shrink-0"
                    style={{ backgroundColor: LEAN_INK[source.lean] }}
                  />
                  <span className="text-[0.7rem] text-[#737373]">
                    {LEAN_LABELS[source.lean]}
                  </span>
                </span>
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onOpen(source.id)}
                  className="text-[0.7rem] transition-opacity hover:opacity-70"
                  style={{ color: SOURCE_STATUS_INK[source.status] }}
                >
                  {STATUS_LABEL[source.status]}
                </button>
              </td>
              <td className="py-3 pl-4 text-right tabular-nums text-[#111]">
                {source.articles}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * The heading that separates what just arrived from what was already here.
 *
 * It only appears after a scrape, so the desk reads as one list at rest and
 * splits in two exactly when the split carries information.
 */
function SplitHeading({
  label,
  count,
  tone,
}: {
  label: string;
  count: number;
  tone: "fresh" | "older";
}) {
  return (
    <div className="mt-10 flex items-baseline gap-3 border-b border-[#26262e] pb-2 first:mt-0">
      <span
        aria-hidden
        className={`h-1.5 w-1.5 rounded-full ${
          tone === "fresh" ? "bg-[#5ac8a8]" : "bg-[#4a4a55]"
        }`}
      />
      <h3
        className={`text-[0.85rem] ${
          tone === "fresh" ? "text-[#5ac8a8]" : "text-[#6a6a76]"
        }`}
      >
        {label}
      </h3>
      <span className="text-[0.7rem] text-[#6a6a76]">{count}</span>
    </div>
  );
}

/** What the last scrape did, in the terms the desk cares about. */
function ScrapeSummary({
  report,
  onDismiss,
}: {
  report: ScrapeReport;
  onDismiss: () => void;
}) {
  const figures: Array<{ label: string; value: number; accent?: boolean }> = [
    { label: "new stories", value: report.created, accent: true },
    { label: "already had", value: report.updated },
    { label: "videos found", value: report.videosFound, accent: true },
    { label: "articles read", value: report.textSaved },
  ];
  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3 border border-[#26262e] bg-[#131318] px-5 py-4">
      {figures.map((figure) => (
        <span key={figure.label} className="flex items-baseline gap-2">
          <span
            className={`text-[1.05rem] ${
              figure.accent && figure.value > 0 ? "text-[#5ac8a8]" : "text-[#111]"
            }`}
          >
            {figure.value}
          </span>
          <span className="text-[0.78rem] text-[#737373]">{figure.label}</span>
        </span>
      ))}
      {report.remaining > 0 ? (
        <span className="text-[0.78rem] text-[#6a6a76]">
          <span className="tabular-nums">{report.remaining}</span> pages still
          queued — the half-hourly run clears them
        </span>
      ) : (
        <span className="text-[0.78rem] text-[#6a6a76]">
          every page read
        </span>
      )}
      <button
        type="button"
        onClick={onDismiss}
        className="ml-auto text-[0.78rem] text-[#737373] underline underline-offset-4 transition-colors hover:text-black"
      >
        Clear
      </button>
    </div>
  );
}
