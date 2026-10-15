"use client";

import { useState } from "react";
import type { DesignVariable, ThemeTokens } from "@/features/website-factory/types";
import {
  createDesignVariable,
  listCustomVariables,
  listVariableCatalog,
  removeDesignVariable,
  upsertDesignVariable,
} from "@/features/website-factory/puck/design-variables";

type Props = {
  theme: ThemeTokens;
  onThemeChange: (theme: ThemeTokens) => void;
  /** Apply a CSS var() reference to the selected block (e.g. background). */
  onApplyReference?: (cssReference: string, target: "color" | "background") => void;
  hasSelection?: boolean;
};

export function DesignVariablesPanel({
  theme,
  onThemeChange,
  onApplyReference,
  hasSelection,
}: Props) {
  const catalog = listVariableCatalog(theme);
  const custom = listCustomVariables(theme);
  const [draft, setDraft] = useState<DesignVariable | null>(null);

  function startAdd() {
    setDraft(createDesignVariable({ type: "color", name: "Brand tint", key: "tint" }));
  }

  function saveDraft() {
    if (!draft) return;
    onThemeChange(upsertDesignVariable(theme, draft));
    setDraft(null);
  }

  return (
    <div className="ae-vars-panel">
      <p className="ae-section-label">Design variables</p>
      <p className="ae-note">
        Core brand tokens and custom variables become CSS custom properties on
        the site root (<code>--wf-*</code> / <code>--wf-var-*</code>). Use{" "}
        <code>var(--wf-primary)</code> or <code>$primary</code> in style fields.
      </p>

      <ul className="ae-vars-list">
        {catalog.map((item) => (
          <li key={item.id} className="ae-vars-row">
            <div className="ae-vars-meta">
              <strong>{item.label}</strong>
              <code>{item.cssVar}</code>
              <small>{item.value}</small>
            </div>
            <div className="ae-vars-actions">
              {item.type === "color" || item.source === "core" ? (
                <span
                  className="ae-vars-swatch"
                  style={{ background: item.value }}
                  title={item.value}
                />
              ) : null}
              {onApplyReference &&
              (item.type === "color" ||
                item.label === "primary" ||
                item.label === "accent" ||
                item.label === "background" ||
                item.label === "foreground" ||
                item.label === "secondary") ? (
                <>
                  <button
                    type="button"
                    className="ae-btn ghost"
                    disabled={!hasSelection}
                    title="Set selected block text colour"
                    onClick={() => onApplyReference(item.reference, "color")}
                  >
                    Text
                  </button>
                  <button
                    type="button"
                    className="ae-btn ghost"
                    disabled={!hasSelection}
                    title="Set selected block background"
                    onClick={() =>
                      onApplyReference(item.reference, "background")
                    }
                  >
                    Fill
                  </button>
                </>
              ) : null}
              {item.source === "custom" ? (
                <>
                  <button
                    type="button"
                    className="ae-btn ghost"
                    onClick={() => {
                      const found = custom.find((v) => v.id === item.id);
                      if (found) setDraft({ ...found });
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="ae-btn ghost"
                    onClick={() =>
                      onThemeChange(removeDesignVariable(theme, item.id))
                    }
                  >
                    Delete
                  </button>
                </>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      <div className="ae-actions-row">
        <button type="button" className="ae-btn ghost" onClick={startAdd}>
          Add variable
        </button>
      </div>

      {draft ? (
        <div className="ae-vars-editor">
          <p className="ae-section-label">
            {custom.some((v) => v.id === draft.id) ? "Edit variable" : "New variable"}
          </p>
          <label className="ae-custom-field">
            <span>Name</span>
            <input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </label>
          <label className="ae-custom-field">
            <span>Key</span>
            <input
              value={draft.key}
              onChange={(e) => setDraft({ ...draft, key: e.target.value })}
              placeholder="space-md"
            />
          </label>
          <label className="ae-custom-field">
            <span>Type</span>
            <select
              value={draft.type}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  type: e.target.value as DesignVariable["type"],
                })
              }
            >
              <option value="color">Color</option>
              <option value="size">Size</option>
              <option value="font">Font</option>
              <option value="string">String</option>
            </select>
          </label>
          <label className="ae-custom-field">
            <span>Value</span>
            {draft.type === "color" ? (
              <input
                type="color"
                value={
                  /^#[0-9a-fA-F]{6}$/.test(draft.value) ? draft.value : "#111111"
                }
                onChange={(e) => setDraft({ ...draft, value: e.target.value })}
              />
            ) : null}
            <input
              type="text"
              value={draft.value}
              onChange={(e) => setDraft({ ...draft, value: e.target.value })}
              placeholder={draft.type === "size" ? "1rem" : ""}
            />
          </label>
          <div className="ae-actions-row">
            <button type="button" className="ae-btn primary" onClick={saveDraft}>
              Save variable
            </button>
            <button
              type="button"
              className="ae-btn ghost"
              onClick={() => setDraft(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
