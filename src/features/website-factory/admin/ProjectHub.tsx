"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ProjectBundle } from "@/features/website-factory/types";
import {
  factoryDraftPath,
  factoryLivePath,
  factoryPreviewPath,
} from "@/features/website-factory/urls";
import { ProjectNav } from "./ProjectNav";
import { useBundle } from "./fields";

export function ProjectHub({ id }: { id: string }) {
  const router = useRouter();
  const { bundle, error, loading, setError } = useBundle(id);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("");

  const data = bundle as ProjectBundle | null;

  async function post(path: string, body?: unknown) {
    setBusy(path);
    setError("");
    setMessage("");
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Request failed");
      return json as Record<string, never> & {
        url?: string;
        versionNumber?: number;
        project?: { id: string };
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
      return null;
    } finally {
      setBusy("");
    }
  }

  async function exportZip() {
    setBusy("export");
    setError("");
    try {
      const res = await fetch(`/api/admin/websites/${id}/export`);
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Export failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${data?.project.slug || "website"}-website.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage("ZIP downloaded.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setBusy("");
    }
  }

  if (loading) return <p className="text-sm text-white/45">Loading…</p>;
  if (!data) return <p className="text-sm text-red-400">{error || "Not found"}</p>;

  return (
    <div className="text-zinc-200">
      <ProjectNav id={id} />
      <p className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-white/40">
        Project
      </p>
      <h2 className="mt-2 text-[clamp(1.75rem,3vw,2.5rem)] font-normal tracking-[-0.035em] text-white">
        {data.project.name}
      </h2>
      <p className="mt-3 text-[1rem] font-light text-white/50">
        {data.business.name} · {data.template.name} · {data.project.status}
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          ["Draft", factoryDraftPath(data.project.slug)],
          ["Preview", factoryPreviewPath(data.project.slug)],
          ["Live", factoryLivePath(data.project.slug)],
        ].map(([label, href]) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-4 transition hover:border-white/20"
          >
            <p className="text-[0.65rem] uppercase tracking-[0.16em] text-white/40">
              {label}
            </p>
            <p className="mt-2 truncate text-sm text-white/70">{href}</p>
          </a>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <a
          href={`/admin/websites/${id}/editor`}
          className="rounded-full bg-white px-5 py-2.5 text-sm text-[#0d1730]"
        >
          Open editor
        </a>
        <button
          type="button"
          disabled={Boolean(busy)}
          onClick={async () => {
            const json = await post(`/api/admin/websites/${id}/preview`);
            if (json?.url) setMessage(`Preview snapshot ready: ${json.url}`);
          }}
          className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/75"
        >
          Publish preview
        </button>
        <button
          type="button"
          disabled={Boolean(busy)}
          onClick={async () => {
            const json = await post(`/api/admin/websites/${id}/publish`);
            if (json?.url)
              setMessage(
                `Published v${json.versionNumber}: ${json.url}`,
              );
          }}
          className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/75"
        >
          Publish live
        </button>
        <button
          type="button"
          disabled={Boolean(busy)}
          onClick={() => void exportZip()}
          className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/75"
        >
          Export ZIP
        </button>
        <button
          type="button"
          disabled={Boolean(busy)}
          onClick={async () => {
            const json = await post(`/api/admin/websites/${id}/duplicate`);
            if (json?.project?.id)
              router.push(`/admin/websites/${json.project.id}`);
          }}
          className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/75"
        >
          Duplicate
        </button>
      </div>

      {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
      {message ? <p className="mt-4 text-sm text-emerald-400/90">{message}</p> : null}

      <h3 className="mt-12 text-lg tracking-[-0.02em] text-white">Versions</h3>
      <div className="mt-4 divide-y divide-white/10 border-t border-white/10">
        {data.versions.map((version) => (
          <div
            key={version.id}
            className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
          >
            <p className="text-white/70">
              v{version.versionNumber} ·{" "}
              {new Date(version.createdAt).toLocaleString()} · {version.note}
            </p>
            <button
              type="button"
              disabled={Boolean(busy)}
              onClick={async () => {
                const json = await post(`/api/admin/websites/${id}/restore`, {
                  versionId: version.id,
                });
                if (json) {
                  setMessage(
                    `Restored v${version.versionNumber} into draft. Live snapshot unchanged.`,
                  );
                }
              }}
              className="text-white/50 underline hover:text-white"
            >
              Restore to draft
            </button>
          </div>
        ))}
        {!data.versions.length ? (
          <p className="py-4 text-sm text-white/45">No published versions yet.</p>
        ) : null}
      </div>
    </div>
  );
}
