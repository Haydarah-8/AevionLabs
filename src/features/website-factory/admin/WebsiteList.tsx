"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { factoryPreviewPath } from "@/features/website-factory/urls";

type Row = {
  id: string;
  name: string;
  slug: string;
  status: string;
  businessName: string;
  templateName: string;
  updatedAt: string;
  customDomain: string | null;
  deploymentUrl: string;
  previewUrl: string;
  liveUrl: string;
};

export function WebsiteList() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await fetch("/api/admin/websites");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setRows(data.projects ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const published = rows.filter((row) => row.status === "published").length;
  const drafts = rows.filter(
    (row) => row.status === "draft" || row.status === "ready",
  ).length;

  return (
    <div className="text-zinc-200">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-white/40">
            Studio
          </p>
          <h2 className="mt-2 text-[clamp(1.75rem,3vw,2.5rem)] font-normal tracking-[-0.035em] text-white">
            Editor
          </h2>
          <p className="mt-3 max-w-xl text-[1rem] font-light leading-relaxed text-white/50">
            Open a site in Studio, or start from a template.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/websites/templates"
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/75 hover:text-white"
          >
            Templates
          </Link>
          <Link
            href="/admin/developer"
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/75 hover:text-white"
          >
            Platform
          </Link>
          <Link
            href="/admin/websites/new"
            className="rounded-full bg-white px-5 py-2.5 text-sm text-[#0d1730]"
          >
            New website
          </Link>
        </div>
      </div>

      <div className="mb-10 grid gap-3 sm:grid-cols-3">
        {[
          ["Sites", rows.length],
          ["Draft / ready", drafts],
          ["Published", published],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-4"
          >
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-white/40">
              {label}
            </p>
            <p className="mt-2 text-3xl tracking-[-0.03em] text-white">{value}</p>
          </div>
        ))}
      </div>

      {error ? <p className="mb-4 text-sm text-red-400">{error}</p> : null}
      {loading ? <p className="text-sm text-white/45">Loading…</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((row) => (
          <button
            type="button"
            key={row.id}
            onClick={() => router.push(`/admin/websites/${row.id}/editor`)}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 text-left transition hover:border-white/20 hover:bg-white/[0.05]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg tracking-[-0.02em] text-white">
                  {row.name}
                </h3>
                <p className="mt-1 text-sm text-white/45">
                  {row.businessName} · {row.templateName}
                </p>
              </div>
              <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[0.7rem] uppercase tracking-[0.12em] text-white/55">
                {row.status}
              </span>
            </div>
            <p className="mt-4 text-xs text-white/35">
              {row.customDomain ||
                factoryPreviewPath(row.slug).replace(/^\//, "")}
            </p>
            <div className="mt-5 flex gap-2 text-sm text-white/70">
              <span className="underline-offset-2 hover:underline">Open editor</span>
              <span className="text-white/25">·</span>
              <Link
                href={`/admin/websites/${row.id}`}
                onClick={(e) => e.stopPropagation()}
                className="hover:text-white"
              >
                Hub
              </Link>
            </div>
          </button>
        ))}
      </div>

      {!loading && !rows.length ? (
        <div className="mt-8 rounded-2xl border border-dashed border-white/15 px-6 py-14 text-center">
          <p className="text-white/55">No websites yet.</p>
          <Link
            href="/admin/websites/templates"
            className="mt-4 inline-flex rounded-full bg-white px-5 py-2.5 text-sm text-[#0d1730]"
          >
            Browse templates
          </Link>
        </div>
      ) : null}
    </div>
  );
}
