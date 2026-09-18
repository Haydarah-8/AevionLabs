"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MediaField } from "@/components/admin/cms/MediaField";
import type { CmsProject, CmsProjectRow } from "@/lib/cms/types";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[0.9rem] text-[#111] outline-none focus:border-black/25";

export function ProjectEditor({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<CmsProject | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/cms/projects/${projectId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load project");
    setProject(data.project);
  }, [projectId]);

  useEffect(() => {
    load().catch((err) =>
      setError(err instanceof Error ? err.message : "Failed to load project"),
    );
  }, [load]);

  async function save() {
    if (!project) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/cms/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: project.slug,
          client: project.client,
          overview: project.overview,
          services: project.services,
          year: project.year,
          heroSrc: project.heroSrc,
          heroAlt: project.heroAlt,
          rows: project.rows,
          resultCpt: project.resultCpt,
          resultText: project.resultText,
          status: project.status,
          featured: project.featured,
          sortOrder: project.sortOrder,
          seoTitle: project.seoTitle,
          seoDescription: project.seoDescription,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setProject(data.project);
      setNotice("Saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function setRow(index: number, patch: Partial<CmsProjectRow>) {
    if (!project) return;
    const rows = project.rows.map((row, i) => (i === index ? { ...row, ...patch } : row));
    setProject({ ...project, rows });
  }

  if (!project) {
    return <p className="text-[#737373]">{error || "Loading project…"}</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/projects"
            className="text-[0.82rem] text-[#737373] hover:text-black"
          >
            ← Work
          </Link>
          <h2 className="mt-2 text-xl text-[#111]">{project.client}</h2>
        </div>
        <div className="flex items-center gap-3">
          {notice ? <span className="text-[0.8rem] text-[#737373]">{notice}</span> : null}
          <button
            type="button"
            disabled={saving}
            onClick={() => void save()}
            className="rounded-lg bg-[#111] px-4 py-2 text-[0.88rem] font-medium text-white disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save project"}
          </button>
        </div>
      </div>
      {error ? <p className="text-[0.9rem] text-red-400">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-[0.8rem] text-[#737373]">Client / title</span>
          <input
            className={inputClass}
            value={project.client}
            onChange={(event) => setProject({ ...project, client: event.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-[0.8rem] text-[#737373]">Slug</span>
          <input
            className={inputClass}
            value={project.slug}
            onChange={(event) => setProject({ ...project, slug: event.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-[0.8rem] text-[#737373]">Year</span>
          <input
            className={inputClass}
            value={project.year}
            onChange={(event) => setProject({ ...project, year: event.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-[0.8rem] text-[#737373]">Sort order</span>
          <input
            type="number"
            className={inputClass}
            value={project.sortOrder}
            onChange={(event) =>
              setProject({ ...project, sortOrder: Number(event.target.value) })
            }
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-[0.8rem] text-[#737373]">
            Services (comma separated)
          </span>
          <input
            className={inputClass}
            value={project.services.join(", ")}
            onChange={(event) =>
              setProject({
                ...project,
                services: event.target.value
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean),
              })
            }
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-[0.8rem] text-[#737373]">Overview</span>
          <textarea
            rows={5}
            className={inputClass}
            value={project.overview}
            onChange={(event) =>
              setProject({ ...project, overview: event.target.value })
            }
          />
        </label>
        <div className="sm:col-span-2">
          <MediaField
            label="Hero image"
            value={project.heroSrc}
            owner={`projects/${project.id}`}
            onChange={(url) => setProject({ ...project, heroSrc: url })}
          />
        </div>
        <label className="block sm:col-span-2">
          <span className="text-[0.8rem] text-[#737373]">Hero alt text</span>
          <input
            className={inputClass}
            value={project.heroAlt}
            onChange={(event) => setProject({ ...project, heroAlt: event.target.value })}
          />
        </label>
        <label className="flex items-center gap-2 pt-2 text-[0.9rem] text-[#404040]">
          <input
            type="checkbox"
            checked={project.featured}
            onChange={(event) =>
              setProject({ ...project, featured: event.target.checked })
            }
          />
          Featured
        </label>
        <label className="block">
          <span className="text-[0.8rem] text-[#737373]">Status</span>
          <select
            className={inputClass}
            value={project.status}
            onChange={(event) =>
              setProject({
                ...project,
                status: event.target.value === "published" ? "published" : "draft",
              })
            }
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[1.05rem] font-medium text-[#111]">Case study sections</h3>
          <button
            type="button"
            className="text-[0.85rem] text-[#404040] hover:text-black"
            onClick={() =>
              setProject({
                ...project,
                rows: [
                  ...project.rows,
                  { cpt: `${String(project.rows.length + 1).padStart(2, "0")} ·`, text: "" },
                ],
              })
            }
          >
            Add section
          </button>
        </div>
        <div className="space-y-4">
          {project.rows.map((row, index) => (
            <div
              key={index}
              className="space-y-3 rounded-xl border border-black/10 p-4"
            >
              <label className="block">
                <span className="text-[0.8rem] text-[#737373]">Caption</span>
                <input
                  className={inputClass}
                  value={row.cpt}
                  onChange={(event) => setRow(index, { cpt: event.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-[0.8rem] text-[#737373]">Text</span>
                <textarea
                  rows={4}
                  className={inputClass}
                  value={row.text}
                  onChange={(event) => setRow(index, { text: event.target.value })}
                />
              </label>
              <MediaField
                label="Image"
                value={row.imgSrc ?? ""}
                owner={`projects/${project.id}`}
                onChange={(url) => setRow(index, { imgSrc: url })}
              />
              <label className="block">
                <span className="text-[0.8rem] text-[#737373]">Image alt</span>
                <input
                  className={inputClass}
                  value={row.imgAlt ?? ""}
                  onChange={(event) => setRow(index, { imgAlt: event.target.value })}
                />
              </label>
              <button
                type="button"
                className="text-[0.8rem] text-[#737373] hover:text-black"
                onClick={() =>
                  setProject({
                    ...project,
                    rows: project.rows.filter((_, i) => i !== index),
                  })
                }
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        <label className="block">
          <span className="text-[0.8rem] text-[#737373]">Result caption</span>
          <input
            className={inputClass}
            value={project.resultCpt}
            onChange={(event) =>
              setProject({ ...project, resultCpt: event.target.value })
            }
          />
        </label>
        <label className="block">
          <span className="text-[0.8rem] text-[#737373]">Result</span>
          <textarea
            rows={4}
            className={inputClass}
            value={project.resultText}
            onChange={(event) =>
              setProject({ ...project, resultText: event.target.value })
            }
          />
        </label>
      </div>
    </div>
  );
}
