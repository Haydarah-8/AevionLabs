"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { NEWS_CATEGORIES } from "@/lib/news/categories";
import { fallbackImage, safeEmbedUrl } from "@/lib/news/media";
import type { StoryGroup } from "@/lib/news/types";

function timeLabel(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const delta = Date.now() - date.getTime();
  const mins = Math.round(delta / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function StoryCard({
  story,
  compact = false,
}: {
  story: StoryGroup;
  compact?: boolean;
}) {
  const embed = story.hasVideo ? safeEmbedUrl(story.videoUrl) : undefined;
  return (
    <article className={compact ? "" : "border-b border-black/15 pb-10"}>
      <a
        href={story.primaryUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group block"
      >
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.75rem] font-semibold uppercase tracking-[0.15em]">
          <span className="text-[#111]">{story.category}</span>
          <span className="h-px w-3 bg-black/20" aria-hidden />
          <span className="text-[#6a6a6a]">{story.sources[0]?.name}</span>
          {story.isBreaking ? (
            <span className="text-[#111]">Breaking</span>
          ) : null}
          {story.hasVideo ? (
            <span className="text-[#6a6a6a]">Video</span>
          ) : null}
        </div>
        {!compact && story.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={story.imageUrl}
            alt=""
            loading="lazy"
            className="mb-5 aspect-[16/9] w-full object-cover bg-[#f4f4f4]"
            onError={(event) => {
              event.currentTarget.src = fallbackImage(story.category);
            }}
          />
        ) : null}
        <h3
          className={`font-normal leading-tight text-[#111] transition-opacity group-hover:opacity-40 ${
            compact ? "text-[1.15rem]" : "text-[clamp(1.35rem,2.6vw,2rem)]"
          }`}
        >
          {story.title}
        </h3>
        {!compact && story.description ? (
          <p className="mt-3 text-[1rem] font-light leading-[1.8] text-[#3f3f3f]">
            {story.shortSummary ? (
              <>
                <span className="mr-2 text-[0.65rem] font-medium uppercase tracking-widest text-[#6a6a6a]">
                  EWG note
                </span>
                {story.shortSummary}
              </>
            ) : (
              story.description
            )}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[#6a6a6a]">
          <span>{timeLabel(story.publishedAt)}</span>
          <span className="text-[0.75rem] font-medium uppercase tracking-[0.14em] text-[#111]">
            {story.sourceCount > 1
              ? `${story.sourceCount} sources reporting this story`
              : "Original source →"}
          </span>
        </div>
      </a>
      {embed && !compact ? (
        <div className="mt-5 aspect-video overflow-hidden bg-[#0a0a0f]">
          <iframe
            src={embed}
            title={story.title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : null}
    </article>
  );
}

export function LiveFeed({
  initialGroups,
  initialBreaking,
  initialCursor,
}: {
  initialGroups: StoryGroup[];
  initialBreaking: StoryGroup[];
  initialCursor: string | null;
}) {
  const [category, setCategory] = useState("All");
  const [groups, setGroups] = useState(initialGroups);
  const [breaking, setBreaking] = useState(initialBreaking);
  const [cursor, setCursor] = useState(initialCursor);
  const [pending, setPending] = useState<StoryGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const seen = useRef(new Set(initialGroups.map((group) => group.id)));

  const load = useCallback(async (nextCategory: string, reset: boolean) => {
    setLoading(reset);
    setError("");
    try {
      const res = await fetch(
        `/api/live/articles?category=${encodeURIComponent(nextCategory)}`,
      );
      const data = (await res.json()) as {
        groups?: StoryGroup[];
        breaking?: StoryGroup[];
        cursor?: string | null;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || "Failed to load live news");
      const next = data.groups ?? [];
      setGroups(next);
      setBreaking(data.breaking ?? []);
      setCursor(data.cursor ?? null);
      setPending([]);
      seen.current = new Set(next.map((group) => group.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load live news");
    } finally {
      setLoading(false);
    }
  }, []);

  async function loadMore() {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/live/articles?category=${encodeURIComponent(category)}&cursor=${encodeURIComponent(cursor)}`,
      );
      const data = (await res.json()) as {
        groups?: StoryGroup[];
        cursor?: string | null;
      };
      const extra = (data.groups ?? []).filter(
        (group) => !seen.current.has(group.id),
      );
      extra.forEach((group) => seen.current.add(group.id));
      setGroups((current) => [...current, ...extra]);
      setCursor(data.cursor ?? null);
    } finally {
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    const id = window.setInterval(async () => {
      try {
        const res = await fetch(
          `/api/live/articles?category=${encodeURIComponent(category)}`,
        );
        if (!res.ok) return;
        const data = (await res.json()) as {
          groups?: StoryGroup[];
          breaking?: StoryGroup[];
          cursor?: string | null;
        };
        const next = data.groups ?? [];
        if (!seen.current.size && next.length) {
          next.forEach((group) => seen.current.add(group.id));
          setGroups(next);
          setBreaking(data.breaking ?? []);
          setCursor(data.cursor ?? null);
          return;
        }
        const incoming = next.filter((group) => !seen.current.has(group.id));
        if (!incoming.length) return;
        setPending((current) => {
          const ids = new Set(current.map((item) => item.id));
          return [
            ...incoming.filter((group) => !ids.has(group.id)),
            ...current,
          ];
        });
      } catch {
        /* keep the current list if a poll fails */
      }
    }, 60_000);
    return () => window.clearInterval(id);
  }, [category]);

  useEffect(() => {
    let client: ReturnType<typeof createBrowserSupabase> | null = null;
    try {
      client = createBrowserSupabase();
    } catch {
      return;
    }
    const channel = client
      .channel("live-news")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "news_articles",
          filter: "status=eq.visible",
        },
        (payload) => {
          const row = payload.new as {
            duplicate_group_id?: string;
            title?: string;
            description?: string;
            category?: string;
            published_at?: string;
            image_url?: string;
            video_url?: string;
            is_breaking?: boolean;
            is_featured?: boolean;
            source_name?: string;
            source_url?: string;
            source_domain?: string;
            provider?: string;
            short_summary?: string | null;
          };
          const id = row.duplicate_group_id;
          if (!id || seen.current.has(id)) return;
          const story: StoryGroup = {
            id,
            title: row.title || "New story",
            description: row.description || "",
            category: row.category || "World",
            publishedAt: row.published_at || new Date().toISOString(),
            imageUrl: row.image_url || fallbackImage(row.category || "World"),
            videoUrl: row.video_url || undefined,
            isBreaking: Boolean(row.is_breaking),
            isFeatured: Boolean(row.is_featured),
            hasVideo: Boolean(row.video_url),
            sourceCount: 1,
            sources: [
              {
                name: row.source_name || row.provider || "Source",
                url: row.source_url || "#",
                domain: row.source_domain || "",
                provider: row.provider || "",
              },
            ],
            primaryUrl: row.source_url || "#",
            shortSummary: row.short_summary || undefined,
          };
          setPending((current) => [
            story,
            ...current.filter((item) => item.id !== id),
          ]);
        },
      )
      .subscribe();
    return () => {
      void client?.removeChannel(channel);
    };
  }, []);

  function revealPending() {
    const incoming = pending.filter((story) => !seen.current.has(story.id));
    incoming.forEach((story) => seen.current.add(story.id));
    setGroups((current) => [...incoming, ...current]);
    setBreaking((current) => {
      const extra = incoming.filter((story) => story.isBreaking);
      return extra.length ? [...extra, ...current] : current;
    });
    setPending([]);
  }

  const categories = useMemo(() => ["All", ...NEWS_CATEGORIES], []);
  const trending = groups.slice(0, 6);

  return (
    <div className="bg-white text-[#111]">
      {breaking[0] ? (
        <div className="border-b border-black/15 px-[var(--section-x)] py-3">
          <p className="mx-auto flex max-w-[var(--section-max)] flex-wrap items-center gap-3 text-[0.75rem] font-medium uppercase tracking-[0.16em]">
            <span className="text-[#111]">Breaking</span>
            <a
              href={breaking[0].primaryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-normal normal-case tracking-normal text-[#111] no-underline hover:opacity-40"
            >
              {breaking[0].title}
            </a>
          </p>
        </div>
      ) : null}

      <div className="mx-auto grid max-w-[var(--section-max)] gap-10 px-[var(--section-x)] pb-[var(--section-y)] lg:grid-cols-[180px_minmax(0,1fr)_280px]">
        <nav className="flex gap-4 overflow-x-auto border-t border-black/15 pt-10 lg:sticky lg:top-28 lg:block lg:overflow-visible">
          {categories.map((entry) => (
            <button
              key={entry}
              type="button"
              onClick={() => {
                setCategory(entry);
                void load(entry, true);
              }}
              className={`whitespace-nowrap border-0 bg-transparent p-0 pb-2 text-[0.75rem] font-medium uppercase tracking-[0.15em] lg:block lg:pb-3 ${
                category === entry
                  ? "text-[#111]"
                  : "text-[#6a6a6a] hover:text-[#111]"
              }`}
            >
              {entry}
            </button>
          ))}
        </nav>

        <div>
          {pending.length ? (
            <button
              type="button"
              onClick={revealPending}
              className="mb-8 inline-block border-0 bg-transparent p-0 text-[0.98rem] text-[#111] underline decoration-black/30 underline-offset-4"
            >
              {pending.length} new stor{pending.length === 1 ? "y" : "ies"}
            </button>
          ) : null}
          {error ? (
            <p className="mb-8 text-[#3f3f3f]">{error}</p>
          ) : null}
          {loading ? (
            <div className="space-y-10">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse border-b border-black/15 pb-10"
                >
                  <div className="mb-4 h-3 w-40 bg-[#e8eef1]" />
                  <div className="mb-4 aspect-[16/9] bg-[#e8eef1]" />
                  <div className="h-8 w-4/5 bg-[#e8eef1]" />
                </div>
              ))}
            </div>
          ) : groups.length === 0 ? (
            <p className="text-[1.125rem] font-light text-[#3f3f3f]">
              No live stories in this desk yet. The feed fills as providers are
              ingested.
            </p>
          ) : (
            <ul className="space-y-10">
              {groups.map((story) => (
                <li key={story.id}>
                  <StoryCard story={story} />
                </li>
              ))}
            </ul>
          )}
          {cursor && groups.length > 0 ? (
            <button
              type="button"
              onClick={() => void loadMore()}
              disabled={loadingMore}
              className="mt-12 border-0 bg-transparent p-0 text-[0.98rem] text-[#111] underline decoration-black/30 underline-offset-4 disabled:opacity-40"
            >
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          ) : null}
        </div>

        <aside className="hidden lg:block">
          <p className="text-[0.75rem] font-medium uppercase tracking-[0.15em] text-[#6a6a6a]">
            Trending
          </p>
          <ul className="mt-6 space-y-6">
            {trending.map((story) => (
              <li key={`trend-${story.id}`}>
                <StoryCard story={story} compact />
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
