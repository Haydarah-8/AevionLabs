"use client";

import {
  APPEARANCE_STYLE_KEYS,
  ADVANCED_STYLE_KEYS,
  LAYOUT_STYLE_KEYS,
  RESPONSIVE_HINTS,
  TYPOGRAPHY_STYLE_KEYS,
  type InspectorTab,
} from "./inspector-tabs";

type Props = {
  tab: InspectorTab;
  selectedLabel: string;
  selectedStyles: Record<string, string>;
  onStylePatch: (patch: Record<string, string>) => void;
  fieldsSlot: React.ReactNode;
  viewportButtons?: React.ReactNode;
  zoom: number;
};

function StyleEditors({
  keys,
  values,
  onChange,
}: {
  keys: readonly string[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}) {
  return (
    <div className="ae-style-editors">
      {keys.map((key) => (
        <label key={key} className="ae-custom-field">
          <span>{key}</span>
          {key === "background" || key === "color" || key === "borderColor" ? (
            <input
              type="color"
              value={
                /^#[0-9a-fA-F]{6}$/.test(values[key] || "")
                  ? values[key]
                  : "#111111"
              }
              onChange={(event) => onChange(key, event.target.value)}
            />
          ) : null}
          <input
            type="text"
            value={values[key] || ""}
            onChange={(event) => onChange(key, event.target.value)}
            placeholder={key}
          />
        </label>
      ))}
    </div>
  );
}

export function ContextualInspector({
  tab,
  selectedLabel,
  selectedStyles,
  onStylePatch,
  fieldsSlot,
  viewportButtons,
  zoom,
}: Props) {
  function setKey(key: string, value: string) {
    onStylePatch({ [key]: value });
  }

  if (tab === "content") {
    return (
      <div className="ae-panel-scroll ae-pane">
        <p className="ae-note" style={{ marginBottom: 10 }}>
          Content for <strong>{selectedLabel}</strong>
        </p>
        {fieldsSlot}
      </div>
    );
  }

  if (tab === "layout") {
    return (
      <div className="ae-panel-scroll ae-pane">
        <p className="ae-note" style={{ marginBottom: 10 }}>
          Layout for <strong>{selectedLabel}</strong>
        </p>
        <StyleEditors
          keys={LAYOUT_STYLE_KEYS}
          values={selectedStyles}
          onChange={setKey}
        />
        {fieldsSlot}
      </div>
    );
  }

  if (tab === "typography") {
    return (
      <div className="ae-panel-scroll ae-pane">
        <p className="ae-note" style={{ marginBottom: 10 }}>
          Typography for <strong>{selectedLabel}</strong>
        </p>
        <StyleEditors
          keys={TYPOGRAPHY_STYLE_KEYS}
          values={selectedStyles}
          onChange={setKey}
        />
      </div>
    );
  }

  if (tab === "appearance") {
    return (
      <div className="ae-panel-scroll ae-pane">
        <p className="ae-note" style={{ marginBottom: 10 }}>
          Appearance for <strong>{selectedLabel}</strong>
        </p>
        <StyleEditors
          keys={APPEARANCE_STYLE_KEYS}
          values={selectedStyles}
          onChange={setKey}
        />
      </div>
    );
  }

  if (tab === "responsive") {
    return (
      <div className="ae-panel-scroll ae-pane">
        <p className="ae-note" style={{ marginBottom: 10 }}>
          Responsive · canvas zoom {zoom}%
        </p>
        {viewportButtons}
        <ul className="ae-review-list">
          {RESPONSIVE_HINTS.map((hint) => (
            <li key={hint}>
              <span className="ae-note">{hint}</span>
            </li>
          ))}
        </ul>
        <StyleEditors
          keys={["width", "maxWidth", "paddingTop", "paddingBottom", "fontSize"]}
          values={selectedStyles}
          onChange={setKey}
        />
      </div>
    );
  }

  if (tab === "advanced") {
    return (
      <div className="ae-panel-scroll ae-pane">
        <p className="ae-note" style={{ marginBottom: 10 }}>
          Advanced for <strong>{selectedLabel}</strong>
        </p>
        <StyleEditors
          keys={ADVANCED_STYLE_KEYS}
          values={selectedStyles}
          onChange={setKey}
        />
        {fieldsSlot}
      </div>
    );
  }

  return null;
}
