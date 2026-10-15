"use client";

import { useState } from "react";
import type { Business, SiteConfig } from "@/features/website-factory/types";
import type { CmsCollection, CmsEntry } from "@/features/website-factory/cms/types";
import {
  createEmptyCollection,
  listCollections,
  removeCollection,
  upsertCollection,
  withSeededCollections,
} from "@/features/website-factory/cms/collections";

type Props = {
  siteConfig: SiteConfig;
  business: Business;
  onSiteConfigChange: (siteConfig: SiteConfig) => void;
};

export function CollectionsPanel({
  siteConfig,
  business,
  onSiteConfigChange,
}: Props) {
  const collections = listCollections(siteConfig);
  const [activeId, setActiveId] = useState<string | null>(
    collections[0]?.id || null,
  );
  const active = collections.find((c) => c.id === activeId) || null;

  function save(next: SiteConfig) {
    onSiteConfigChange(next);
  }

  function updateActive(patch: Partial<CmsCollection>) {
    if (!active) return;
    save(upsertCollection(siteConfig, { ...active, ...patch }));
  }

  function addEntry() {
    if (!active) return;
    const blank: CmsEntry = {
      id: `ent_${Date.now().toString(36)}`,
      values: Object.fromEntries(active.fields.map((f) => [f.key, ""])),
    };
    updateActive({ entries: [...active.entries, blank] });
  }

  return (
    <div className="ae-collections-panel">
      <p className="ae-section-label">Collections</p>
      <p className="ae-note">
        Factory CMS data for Collection List and field binds. System collections
        sync from business services / reviews / team / media.
      </p>
      <div className="ae-actions-row">
        <button
          type="button"
          className="ae-btn ghost"
          onClick={() => save(withSeededCollections(siteConfig, business))}
        >
          Sync from business
        </button>
        <button
          type="button"
          className="ae-btn ghost"
          onClick={() => {
            const created = createEmptyCollection({ name: "Posts" });
            save(upsertCollection(siteConfig, created));
            setActiveId(created.id);
          }}
        >
          Add collection
        </button>
      </div>

      {!collections.length ? (
        <p className="ae-empty-inspector">
          No collections yet. Sync from business or add one.
        </p>
      ) : (
        <ul className="ae-list">
          {collections.map((col) => (
            <li key={col.id}>
              <button
                type="button"
                className={activeId === col.id ? "is-on" : ""}
                onClick={() => setActiveId(col.id)}
              >
                {col.name}
                <small>
                  {" "}
                  · {col.slug} · {col.entries.length} items
                  {col.source && col.source !== "custom"
                    ? ` · ${col.source}`
                    : ""}
                </small>
              </button>
            </li>
          ))}
        </ul>
      )}

      {active ? (
        <div className="ae-collection-editor">
          <label className="ae-custom-field">
            <span>Name</span>
            <input
              value={active.name}
              onChange={(e) => updateActive({ name: e.target.value })}
              disabled={active.source !== "custom" && Boolean(active.source)}
            />
          </label>
          <label className="ae-custom-field">
            <span>Slug (use in Collection List)</span>
            <input
              value={active.slug}
              onChange={(e) => updateActive({ slug: e.target.value })}
              disabled={active.source !== "custom" && Boolean(active.source)}
            />
          </label>
          <p className="ae-note">
            Fields:{" "}
            {active.fields.map((f) => f.key).join(", ") || "(none)"}
          </p>
          <div className="ae-actions-row">
            <button type="button" className="ae-btn ghost" onClick={addEntry}>
              Add entry
            </button>
            {active.source === "custom" || !active.source ? (
              <button
                type="button"
                className="ae-btn ghost"
                onClick={() => {
                  save(removeCollection(siteConfig, active.id));
                  setActiveId(null);
                }}
              >
                Delete collection
              </button>
            ) : null}
          </div>
          <ul className="ae-vars-list">
            {active.entries.map((entry, index) => (
              <li key={entry.id} className="ae-vars-row">
                <div className="ae-vars-meta">
                  <strong>#{index + 1}</strong>
                  {active.fields.map((field) => (
                    <label key={field.key} className="ae-custom-field">
                      <span>{field.label}</span>
                      <input
                        value={entry.values[field.key] || ""}
                        onChange={(e) => {
                          const entries = active.entries.map((item) =>
                            item.id === entry.id
                              ? {
                                  ...item,
                                  values: {
                                    ...item.values,
                                    [field.key]: e.target.value,
                                  },
                                }
                              : item,
                          );
                          updateActive({ entries });
                        }}
                      />
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  className="ae-btn ghost"
                  onClick={() =>
                    updateActive({
                      entries: active.entries.filter((e) => e.id !== entry.id),
                    })
                  }
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
