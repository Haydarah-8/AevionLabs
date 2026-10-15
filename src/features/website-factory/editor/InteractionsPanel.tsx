"use client";

import {
  APPEAR_PRESETS,
  CLICK_PRESETS,
  HOVER_PRESETS,
  patchInteractions,
  readInteractions,
  type AppearPresetId,
  type ClickPresetId,
  type HoverPresetId,
} from "@/features/website-factory/editor/interactions";

type Props = {
  props: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
};

function PresetSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ id: string; label: string; description: string }>;
  onChange: (id: string) => void;
}) {
  return (
    <label className="ae-custom-field">
      <span>{label}</span>
      <select
        value={value || "none"}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.id} value={opt.id} title={opt.description}>
            {opt.label}
          </option>
        ))}
      </select>
      <small className="ae-note">
        {options.find((o) => o.id === (value || "none"))?.description}
      </small>
    </label>
  );
}

export function InteractionsPanel({ props, onChange }: Props) {
  const current = readInteractions(props);

  return (
    <div className="ae-interactions-panel">
      <p className="ae-section-label">Interactions</p>
      <p className="ae-note">
        Preset hover / click / appear effects. Stored as{" "}
        <code>_interactions</code> and applied with CSS (respects reduced
        motion).
      </p>
      <PresetSelect
        label="Hover"
        value={current.hover || "none"}
        options={HOVER_PRESETS}
        onChange={(id) =>
          onChange(patchInteractions(props, { hover: id as HoverPresetId }))
        }
      />
      <PresetSelect
        label="Click"
        value={current.click || "none"}
        options={CLICK_PRESETS}
        onChange={(id) =>
          onChange(patchInteractions(props, { click: id as ClickPresetId }))
        }
      />
      <PresetSelect
        label="Appear"
        value={current.appear || "none"}
        options={APPEAR_PRESETS}
        onChange={(id) =>
          onChange(patchInteractions(props, { appear: id as AppearPresetId }))
        }
      />
    </div>
  );
}
