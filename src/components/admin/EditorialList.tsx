"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  PlainFigure,
  PlainHeading,
  PlainPill,
  plainControl,
  plainHoverRow,
} from "@/components/admin/plain";
import type { BlogListItem, BlogStatus } from "@/lib/blog/types";

/**
 * How long ago, in the desk's usual shorthand.
 *
 * The row used to print the site's display date — `03.23.2026` — which answers
 * "when was this filed" and not "is this current", and the second question is
 * the one anybody scanning a list of manuscripts is actually asking.
 */
function ago(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(then).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function EditorialList() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | BlogStatus>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await fetch("/api/admin/posts");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load posts");
      setPosts(data.posts ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createPost = useCallback(async () => {
    setBusyId("new");
    setError("");
    try {
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled post", status: "draft" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create post");
      router.push(`/admin/blog/${data.post.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
      setBusyId(null);
    }
  }, [router]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key.toLowerCase() === "n" && !event.metaKey && !event.ctrlKey) {
        const tag = (event.target as HTMLElement | null)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        event.preventDefault();
        void createPost();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [createPost]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((post) => {
      if (status !== "all" && post.status !== status) return false;
      if (!q) return true;
      return (
        post.title.toLowerCase().includes(q) ||
        post.slug.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q) ||
        post.sub.toLowerCase().includes(q)
      );
    });
  }, [posts, query, status]);

  async function duplicate(id: string) {
    setBusyId(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/posts/${id}/duplicate`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to duplicate");
      router.push(`/admin/blog/${data.post.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to duplicate");
      setBusyId(null);
    }
  }

  async function remove(id: string, title: string) {
    if (!window.confirm(`Delete “${title}”? This cannot be undone.`)) return;
    setBusyId(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      setPosts((current) => current.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setBusyId(null);
    }
  }

  const published = posts.filter((p) => p.status === "published").length;
  const drafts = posts.filter((p) => p.status === "draft").length;
  const featured = posts.filter((p) => p.featured).length;
  const latest = useMemo(() => {
    const times = posts
      .map((p) => new Date(p.updatedAt).getTime())
      .filter((t) => !Number.isNaN(t));
    return times.length ? Math.max(...times) : null;
  }, [posts]);

  return (
    <div className="space-y-10">
      <div>
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-white/40">
          Editorial
        </p>
        <h2 className="mt-2 text-[clamp(1.75rem,3vw,2.5rem)] font-normal tracking-[-0.035em] text-white">
          Insights
        </h2>
        <p className="mt-3 max-w-xl text-[1rem] font-light leading-relaxed text-white/50">
          Write and publish articles for the public insights feed.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <PlainFigure label="Manuscripts" value={posts.length} />
        <PlainFigure label="Published" value={published} />
        <PlainFigure label="Drafts" value={drafts} />
        <PlainFigure
          label="Last touched"
          value={latest ? ago(new Date(latest).toISOString()) : "—"}
          small
          note={featured ? `${featured} featured` : undefined}
        />
      </div>

      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                ["all", "Everything", posts.length],
                ["published", "Published", published],
                ["draft", "Drafts", drafts],
              ] as Array<["all" | BlogStatus, string, number]>
            ).map(([value, label, count]) => (
              <PlainPill
                key={value}
                active={status === value}
                onClick={() => setStatus(value)}
                count={count}
              >
                {label}
              </PlainPill>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/news"
              target="_blank"
              rel="noreferrer"
              className={plainControl}
            >
              View live insights
            </a>
            <button
              type="button"
              onClick={() => void createPost()}
              disabled={busyId === "new"}
              className="rounded-full bg-white px-5 py-2.5 text-sm text-[#0d1730] disabled:opacity-50"
            >
              {busyId === "new" ? "Opening editor…" : "New article"}
            </button>
          </div>
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by headline, slug or desk"
          aria-label="Search the archive"
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[0.95rem] text-white placeholder:text-white/30 focus:border-white/25 focus:outline-none"
        />

        <p className="text-[0.82rem] text-white/40">
          ⌘K to jump to a manuscript · N for a new one
        </p>
      </div>

      {error ? (
        <p className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-[0.88rem] text-rose-300">
          {error}
        </p>
      ) : null}

      <section>
        <PlainHeading
          note={
            filtered.length === posts.length
              ? `${posts.length} in the archive`
              : `${filtered.length} of ${posts.length}`
          }
        >
          {status === "draft"
            ? "Drafts"
            : status === "published"
              ? "Published"
              : "Everything written"}
        </PlainHeading>

        {loading ? (
          <p className="text-[0.88rem] text-white/45">Loading archive…</p>
        ) : filtered.length === 0 ? (
          <p className="text-[0.88rem] text-white/45">
            {query
              ? `Nothing in the archive matches “${query}”.`
              : "No articles match this filter."}
          </p>
        ) : (
          <ul>
            {filtered.map((post) => (
              <li
                key={post.id}
                className={`group flex flex-col gap-3 py-4 transition-colors sm:flex-row sm:items-center sm:justify-between ${plainHoverRow}`}
              >
                <button
                  type="button"
                  onClick={() => router.push(`/admin/blog/${post.id}`)}
                  className="min-w-0 flex-1 text-left"
                >
                  <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span
                      className={
                        post.status === "published"
                          ? "text-[0.85rem] text-emerald-300/80"
                          : "text-[0.85rem] text-white/40"
                      }
                    >
                      {post.status === "published" ? "Published" : "Draft"}
                    </span>
                    <span className="text-[0.85rem] text-white/40">
                      {post.category}
                    </span>
                    <span className="text-[0.85rem] tabular-nums text-white/40">
                      {ago(post.updatedAt)}
                    </span>
                    {post.featured ? (
                      <span className="text-[0.85rem] text-white">
                        Featured
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-1.5 block truncate text-[1rem] leading-snug text-white/80 transition-colors group-hover:text-white">
                    {post.title || "Untitled post"}
                  </span>
                  <span className="mt-1 block truncate text-[0.82rem] text-white/35">
                    /news/{post.slug}
                  </span>
                </button>
                <div className="flex shrink-0 items-center gap-5">
                  {post.status === "published" ? (
                    <a
                      href={`/news/${post.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className={plainControl}
                    >
                      View
                    </a>
                  ) : null}
                  <button
                    type="button"
                    disabled={busyId === post.id}
                    onClick={() => duplicate(post.id)}
                    className={`${plainControl} disabled:opacity-40`}
                  >
                    Duplicate
                  </button>
                  <button
                    type="button"
                    disabled={busyId === post.id}
                    onClick={() => remove(post.id, post.title)}
                    className="text-[0.88rem] text-white/40 transition-colors hover:text-rose-300 disabled:opacity-40"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Open article"
        className="fixed left-1/2 top-[20%] z-[80] w-[min(92vw,36rem)] -translate-x-1/2 rounded-2xl border border-white/10 bg-[#0d1730] p-2 shadow-2xl"
      >
        <Command.Input
          placeholder="Open manuscript…"
          className="w-full rounded-xl bg-white/[0.06] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35"
        />
        <Command.List className="mt-2 max-h-80 overflow-y-auto">
          <Command.Empty className="px-4 py-6 text-[0.88rem] text-white/45">
            No matches
          </Command.Empty>
          <Command.Item
            onSelect={() => {
              setOpen(false);
              void createPost();
            }}
            className="cursor-pointer rounded-xl px-4 py-3 text-sm text-white/70 aria-selected:bg-white/[0.08] aria-selected:text-white"
          >
            New article
          </Command.Item>
          {posts.map((post) => (
            <Command.Item
              key={post.id}
              value={`${post.title} ${post.slug} ${post.category}`}
              onSelect={() => {
                setOpen(false);
                router.push(`/admin/blog/${post.id}`);
              }}
              className="cursor-pointer rounded-xl px-4 py-3 text-sm text-white aria-selected:bg-white/[0.08]"
            >
              {post.title}
              <span className="ml-2 text-[0.85rem] text-white/40">
                {post.status}
              </span>
            </Command.Item>
          ))}
        </Command.List>
      </Command.Dialog>
    </div>
  );
}
