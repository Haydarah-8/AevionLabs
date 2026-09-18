"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PlainHeading,
  PlainPill,
  plainControl,
  plainHoverRow,
} from "@/components/admin/plain";
import type { CmsProject, CmsStatus } from "@/lib/cms/types";

export function ProjectList() {
  const router = useRouter();
  const [projects, setProjects] = useState<CmsProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<"all" | CmsStatus>("all");

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await fetch("/api/admin/cms/projects");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load projects");
      setProjects(data.projects ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function createProject() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/cms/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client: "Untitled project", status: "draft" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create project");
      router.push(`/admin/projects/${data.project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this project?")) return;
    try {
      const res = await fetch(`/api/admin/cms/projects/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  const filtered = projects.filter(
    (project) => status === "all" || project.status === status,
  );

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <PlainHeading note="Case studies are unpublished from the public site. Insights live on /news.">
          Work
        </PlainHeading>
        <button
          type="button"
          disabled={busy}
          onClick={() => void createProject()}
          className="rounded-lg bg-[#111] px-4 py-2 text-[0.88rem] font-medium text-white disabled:opacity-50"
        >
          {busy ? "Creating…" : "New project"}
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
                ? projects.length
                : projects.filter((project) => project.status === value).length
            }
          >
            {value === "all" ? "All" : value}
          </PlainPill>
        ))}
      </div>
      {error ? <p className="mb-4 text-[0.9rem] text-red-400">{error}</p> : null}
      {loading ? (
        <p className="text-[#737373]">Loading projects…</p>
      ) : (
        <ul>
          {filtered.map((project) => (
            <li key={project.id}>
              <div className={`flex items-center justify-between gap-4 py-4 ${plainHoverRow}`}>
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => router.push(`/admin/projects/${project.id}`)}
                >
                  <p className="truncate text-[0.98rem] text-[#111]">{project.client}</p>
                  <p className="mt-0.5 text-[0.8rem] text-[#737373]">
                    /work/{project.slug} · {project.year} · {project.status}
                  </p>
                </button>
                <button
                  type="button"
                  className={plainControl}
                  onClick={() => void remove(project.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
