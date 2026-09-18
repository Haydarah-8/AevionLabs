"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PlainHeading,
  PlainPill,
  plainControl,
  plainHoverRow,
} from "@/components/admin/plain";
import type { CmsPageSummary, CmsStatus } from "@/lib/cms/types";

export function PageList() {
  const router = useRouter();
  const [pages, setPages] = useState<CmsPageSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<"all" | CmsStatus>("all");

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await fetch("/api/admin/cms/pages");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load pages");
      setPages(data.pages ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load pages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function createPage() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/cms/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New page", status: "draft", showInNav: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create page");
      router.push(`/admin/pages/${data.page.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create page");
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this page and all of its sections?")) return;
    setError("");
    try {
      const res = await fetch(`/api/admin/cms/pages/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  const filtered = pages.filter(
    (page) => status === "all" || page.status === status,
  );

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <PlainHeading note="Edit copy, images, sections, and add pages">
          Pages
        </PlainHeading>
        <button
          type="button"
          disabled={busy}
          onClick={() => void createPage()}
          className="rounded-lg bg-[#111] px-4 py-2 text-[0.88rem] font-medium text-white disabled:opacity-50"
        >
          {busy ? "Creating…" : "New page"}
        </button>
      </div>
      <div className="mb-6 flex gap-2">
        {(["all", "published", "draft"] as const).map((value) => (
          <PlainPill
            key={value}
            active={status === value}
            onClick={() => setStatus(value)}
            count={
              value === "all"
                ? pages.length
                : pages.filter((page) => page.status === value).length
            }
          >
            {value === "all" ? "All" : value}
          </PlainPill>
        ))}
      </div>
      {error ? <p className="mb-4 text-[0.9rem] text-red-400">{error}</p> : null}
      {loading ? (
        <p className="text-[#737373]">Loading pages…</p>
      ) : (
        <ul>
          {filtered.map((page) => (
            <li key={page.id}>
              <div className={`flex items-center justify-between gap-4 py-4 ${plainHoverRow}`}>
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => router.push(`/admin/pages/${page.id}`)}
                >
                  <p className="truncate text-[0.98rem] text-[#111]">{page.title}</p>
                  <p className="mt-0.5 text-[0.8rem] text-[#737373]">
                    {page.path}
                    {page.isSystem ? " · built-in" : ""}
                    {page.showInNav ? " · in nav" : ""}
                    {` · ${page.status}`}
                  </p>
                </button>
                {!page.isSystem ? (
                  <button
                    type="button"
                    className={plainControl}
                    onClick={() => void remove(page.id)}
                  >
                    Delete
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
