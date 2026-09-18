"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { WebsiteTemplate } from "@/features/website-factory/types";
import { TEMPLATE_DEFS } from "@/features/website-factory/templates";

export function TemplateList() {
  const [templates, setTemplates] = useState<WebsiteTemplate[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/websites/templates");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load");
    setTemplates(data.templates ?? []);
  }, []);

  useEffect(() => {
    void load().catch((err) =>
      setError(err instanceof Error ? err.message : "Failed to load"),
    );
  }, [load]);

  async function duplicate(id: string) {
    setBusy(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/websites/templates/${id}/duplicate`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Duplicate failed");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Duplicate failed");
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="text-zinc-200">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-white/40">
            Studio
          </p>
          <h2 className="mt-2 text-[clamp(1.75rem,3vw,2.5rem)] font-normal tracking-[-0.035em] text-white">
            Templates
          </h2>
          <p className="mt-3 max-w-xl text-[1rem] font-light leading-relaxed text-white/50">
            Starter sites you can use as a base — pick one, generate a project,
            then edit in Studio.
          </p>
        </div>
        <Link
          href="/admin/websites/new"
          className="rounded-full bg-white px-5 py-2.5 text-sm text-[#0d1730]"
        >
          Create blank canvas
        </Link>
      </div>

      {error ? <p className="mb-4 text-sm text-red-400">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {templates.map((item) => {
          const def =
            item.definitionKey && TEMPLATE_DEFS[item.definitionKey]
              ? TEMPLATE_DEFS[item.definitionKey]
              : null;
          const pages = def?.pages.map((p) => p.navLabel || p.title) || [];
          return (
            <article
              key={item.id}
              className="flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition hover:border-white/20 hover:bg-white/[0.05]"
            >
              <div
                className="mb-4 aspect-[16/10] rounded-xl bg-gradient-to-br from-[#1a2744] via-[#14213d] to-[#0a0f1c] p-4"
                aria-hidden
              >
                <div className="h-2 w-16 rounded-full bg-white/20" />
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-3/4 max-w-[12rem] rounded bg-white/25" />
                  <div className="h-2 w-1/2 max-w-[8rem] rounded bg-white/15" />
                  <div className="mt-6 grid grid-cols-3 gap-2">
                    <div className="h-10 rounded bg-white/10" />
                    <div className="h-10 rounded bg-white/10" />
                    <div className="h-10 rounded bg-white/10" />
                  </div>
                </div>
              </div>
              <p className="text-[0.65rem] uppercase tracking-[0.18em] text-white/40">
                {item.industry}
              </p>
              <h3 className="mt-2 text-lg tracking-[-0.02em] text-white">
                {item.name}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-white/50">
                {item.description}
              </p>
              <p className="mt-3 text-xs text-white/35">
                {item.pagesCount} pages
                {pages.length
                  ? ` · ${pages.slice(0, 4).join(", ")}${pages.length > 4 ? "…" : ""}`
                  : ""}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href={`/admin/websites/new?template=${encodeURIComponent(item.id)}`}
                  className="rounded-full bg-white px-4 py-2 text-sm text-[#0d1730]"
                >
                  Use as base
                </Link>
                <button
                  type="button"
                  disabled={busy === item.id}
                  onClick={() => void duplicate(item.id)}
                  className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:text-white disabled:opacity-40"
                >
                  {busy === item.id ? "Copying…" : "Duplicate"}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {!templates.length && !error ? (
        <p className="py-12 text-sm text-white/45">Loading templates…</p>
      ) : null}
    </div>
  );
}
