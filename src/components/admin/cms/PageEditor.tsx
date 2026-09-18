"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MediaField } from "@/components/admin/cms/MediaField";
import {
  BLOCK_ITEM_FIELDS,
  CARD_ITEM_FIELDS,
  SECTION_DEFS,
  defFor,
  type SectionField,
} from "@/lib/cms/section-defs";
import type { CmsPage, CmsSection } from "@/lib/cms/types";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[0.9rem] text-[#111] outline-none focus:border-black/25";

function FieldInput({
  field,
  value,
  owner,
  onChange,
}: {
  field: SectionField;
  value: unknown;
  owner: string;
  onChange: (value: unknown) => void;
}) {
  if (field.kind === "textarea") {
    return (
      <label className="block">
        <span className="text-[0.8rem] text-[#737373]">{field.label}</span>
        <textarea
          rows={4}
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
          className={`${inputClass} min-h-[6rem]`}
        />
      </label>
    );
  }
  if (field.kind === "image") {
    return (
      <MediaField
        label={field.label}
        value={String(value ?? "")}
        owner={owner}
        onChange={(url) => onChange(url)}
      />
    );
  }
  if (field.kind === "strings") {
    const items = Array.isArray(value) ? value.map((item) => String(item)) : [];
    return (
      <div>
        <p className="text-[0.8rem] text-[#737373]">{field.label}</p>
        <div className="mt-2 space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex gap-2">
              <input
                value={item}
                onChange={(event) => {
                  const next = [...items];
                  next[index] = event.target.value;
                  onChange(next);
                }}
                className={inputClass + " mt-0"}
              />
              <button
                type="button"
                className="text-[0.8rem] text-[#737373] hover:text-black"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="text-[0.82rem] text-[#404040] hover:text-black"
            onClick={() => onChange([...items, ""])}
          >
            Add item
          </button>
        </div>
      </div>
    );
  }
  if (field.kind === "cards" || field.kind === "blocks") {
    const itemFields = field.kind === "cards" ? CARD_ITEM_FIELDS : BLOCK_ITEM_FIELDS;
    const items = Array.isArray(value)
      ? value.map((item) =>
          item && typeof item === "object" ? (item as Record<string, unknown>) : {},
        )
      : [];
    return (
      <div>
        <p className="text-[0.8rem] text-[#737373]">{field.label}</p>
        <div className="mt-3 space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="space-y-3 rounded-lg border border-black/10 p-4"
            >
              {itemFields.map((sub) => (
                <FieldInput
                  key={sub.key}
                  field={sub}
                  value={item[sub.key]}
                  owner={owner}
                  onChange={(next) => {
                    const copy = items.map((entry) => ({ ...entry }));
                    copy[index] = { ...copy[index], [sub.key]: next };
                    onChange(copy);
                  }}
                />
              ))}
              <button
                type="button"
                className="text-[0.8rem] text-[#737373] hover:text-black"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="text-[0.82rem] text-[#404040] hover:text-black"
            onClick={() => onChange([...items, {}])}
          >
            Add {field.kind === "cards" ? "card" : "block"}
          </button>
        </div>
      </div>
    );
  }
  return (
    <label className="block">
      <span className="text-[0.8rem] text-[#737373]">{field.label}</span>
      <input
        value={String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      />
    </label>
  );
}

export function PageEditor({ pageId }: { pageId: string }) {
  const [page, setPage] = useState<CmsPage | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [addType, setAddType] = useState("rich_text");
  const saveTimer = useRef<number | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/cms/pages/${pageId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load page");
    setPage(data.page);
  }, [pageId]);

  useEffect(() => {
    load().catch((err) =>
      setError(err instanceof Error ? err.message : "Failed to load page"),
    );
  }, [load]);

  async function saveMeta(patch: Partial<CmsPage>) {
    if (!page) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/cms/pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: patch.title ?? page.title,
          slug: patch.slug ?? page.slug,
          navLabel: patch.navLabel ?? page.navLabel,
          showInNav: patch.showInNav ?? page.showInNav,
          navOrder: patch.navOrder ?? page.navOrder,
          status: patch.status ?? page.status,
          seoTitle: patch.seoTitle ?? page.seoTitle,
          seoDescription: patch.seoDescription ?? page.seoDescription,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setPage(data.page);
      setNotice("Saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function persistSection(section: CmsSection) {
    const res = await fetch(`/api/admin/cms/sections/${section.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visible: section.visible,
        data: section.data,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to save section");
    return data.section as CmsSection;
  }

  function queueSectionSave(next: CmsSection) {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      persistSection(next)
        .then(() => setNotice("Saved"))
        .catch((err) =>
          setError(err instanceof Error ? err.message : "Failed to save section"),
        );
    }, 500);
  }

  function updateSectionLocal(id: string, patch: Partial<CmsSection>) {
    setPage((current) => {
      if (!current) return current;
      const sections = current.sections.map((section) =>
        section.id === id ? { ...section, ...patch } : section,
      );
      const updated = sections.find((section) => section.id === id);
      if (updated) queueSectionSave(updated);
      return { ...current, sections };
    });
  }

  async function addSection() {
    if (!page) return;
    setError("");
    const res = await fetch(`/api/admin/cms/pages/${page.id}/sections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: addType }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to add section");
      return;
    }
    await load();
  }

  async function removeSection(id: string) {
    if (!window.confirm("Remove this section?")) return;
    const res = await fetch(`/api/admin/cms/sections/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to remove section");
      return;
    }
    await load();
  }

  async function move(id: string, direction: -1 | 1) {
    if (!page) return;
    const ids = page.sections.map((section) => section.id);
    const index = ids.indexOf(id);
    const next = index + direction;
    if (index < 0 || next < 0 || next >= ids.length) return;
    const swapped = [...ids];
    [swapped[index], swapped[next]] = [swapped[next], swapped[index]];
    const res = await fetch("/api/admin/cms/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageId: page.id, ids: swapped }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to reorder");
      return;
    }
    setPage({ ...page, sections: data.sections });
  }

  if (!page) {
    return <p className="text-[#737373]">{error || "Loading page…"}</p>;
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin/pages" className="text-[0.82rem] text-[#737373] hover:text-black">
            ← Pages
          </Link>
          <h2 className="mt-2 text-xl text-[#111]">{page.title}</h2>
          <p className="mt-1 text-[0.8rem] text-[#737373]">
            {page.path}
            {page.isSystem ? " · built-in route" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {notice ? <span className="text-[0.8rem] text-[#737373]">{notice}</span> : null}
          <button
            type="button"
            disabled={saving}
            onClick={() => void saveMeta({})}
            className="rounded-lg bg-[#111] px-4 py-2 text-[0.88rem] font-medium text-white disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save page"}
          </button>
        </div>
      </div>

      {error ? <p className="text-[0.9rem] text-red-400">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-[0.8rem] text-[#737373]">Title</span>
          <input
            className={inputClass}
            value={page.title}
            onChange={(event) => setPage({ ...page, title: event.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-[0.8rem] text-[#737373]">URL slug</span>
          <input
            className={inputClass}
            value={page.slug}
            disabled={page.isSystem}
            onChange={(event) => setPage({ ...page, slug: event.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-[0.8rem] text-[#737373]">Nav label</span>
          <input
            className={inputClass}
            value={page.navLabel}
            onChange={(event) => setPage({ ...page, navLabel: event.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-[0.8rem] text-[#737373]">Nav order</span>
          <input
            type="number"
            className={inputClass}
            value={page.navOrder}
            onChange={(event) =>
              setPage({ ...page, navOrder: Number(event.target.value) })
            }
          />
        </label>
        <label className="flex items-center gap-2 pt-6 text-[0.9rem] text-[#404040]">
          <input
            type="checkbox"
            checked={page.showInNav}
            onChange={(event) =>
              setPage({ ...page, showInNav: event.target.checked })
            }
          />
          Show in header
        </label>
        <label className="block">
          <span className="text-[0.8rem] text-[#737373]">Status</span>
          <select
            className={inputClass}
            value={page.status}
            onChange={(event) =>
              setPage({
                ...page,
                status: event.target.value === "published" ? "published" : "draft",
              })
            }
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="text-[0.8rem] text-[#737373]">SEO title</span>
          <input
            className={inputClass}
            value={page.seoTitle}
            onChange={(event) => setPage({ ...page, seoTitle: event.target.value })}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-[0.8rem] text-[#737373]">SEO description</span>
          <textarea
            className={inputClass}
            rows={3}
            value={page.seoDescription}
            onChange={(event) =>
              setPage({ ...page, seoDescription: event.target.value })
            }
          />
        </label>
      </div>

      <div>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-[1.05rem] font-medium text-[#111]">Sections</h3>
            <p className="mt-1 text-[0.8rem] text-[#737373]">
              Add, hide, reorder, or remove blocks. Changes save as you type.
            </p>
          </div>
          <div className="flex gap-2">
            <select
              value={addType}
              onChange={(event) => setAddType(event.target.value)}
              className="rounded-lg border border-black/10 bg-white px-3 py-2 text-[0.88rem] text-[#111]"
            >
              {SECTION_DEFS.map((def) => (
                <option key={def.type} value={def.type} className="bg-white">
                  {def.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => void addSection()}
              className="rounded-lg border border-white/[0.1] px-3 py-2 text-[0.88rem] text-[#111] hover:bg-white/[0.04]"
            >
              Add section
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {page.sections.map((section, index) => {
            const def = defFor(section.type);
            return (
              <section
                key={section.id}
                className="rounded-xl border border-black/10 bg-[#f6f6f6] p-5"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[0.95rem] text-[#111]">
                      {def?.label ?? section.type}
                    </p>
                    {def?.hint ? (
                      <p className="text-[0.78rem] text-[#737373]">{def.hint}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 text-[0.8rem] text-[#737373]">
                      <input
                        type="checkbox"
                        checked={section.visible}
                        onChange={(event) =>
                          updateSectionLocal(section.id, {
                            visible: event.target.checked,
                          })
                        }
                      />
                      Visible
                    </label>
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => void move(section.id, -1)}
                      className="text-[0.8rem] text-[#737373] hover:text-black disabled:opacity-30"
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      disabled={index === page.sections.length - 1}
                      onClick={() => void move(section.id, 1)}
                      className="text-[0.8rem] text-[#737373] hover:text-black disabled:opacity-30"
                    >
                      Down
                    </button>
                    <button
                      type="button"
                      onClick={() => void removeSection(section.id)}
                      className="text-[0.8rem] text-[#737373] hover:text-black"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                {def?.fields.length ? (
                  <div className="space-y-4">
                    {def.fields.map((field) => (
                      <FieldInput
                        key={field.key}
                        field={field}
                        value={section.data[field.key]}
                        owner={`cms/${page.id}`}
                        onChange={(value) =>
                          updateSectionLocal(section.id, {
                            data: { ...section.data, [field.key]: value },
                          })
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-[0.85rem] text-[#737373]">
                    This block pulls live content (blog posts or projects). No extra
                    fields.
                  </p>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
