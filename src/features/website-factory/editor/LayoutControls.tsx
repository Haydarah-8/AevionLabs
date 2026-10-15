"use client";

import { useState } from "react";
import {
  ALIGN_OPTIONS,
  DIRECTION_OPTIONS,
  DISPLAY_OPTIONS,
  GRID_COLS_OPTIONS,
  isFlexDisplay,
  isGridDisplay,
  JUSTIFY_OPTIONS,
  LAYOUT_PRESETS,
  spacingInputValue,
  spacingPatchValue,
  WRAP_OPTIONS,
} from "./layout-presets";

type Props = {
  values: Record<string, string>;
  onChange: (patch: Record<string, string>) => void;
  /** Show raw token fields under a disclosure. */
  advancedSlot?: React.ReactNode;
};

function Segmented({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="ae-layout-group">
      <div className="ae-layout-label">{label}</div>
      <div className="ae-seg" role="group" aria-label={label}>
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`ae-seg-btn${value === opt.value ? " is-on" : ""}`}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="ae-layout-field">
      <span>{label}</span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function SpacingBox({
  values,
  onChange,
}: {
  values: Record<string, string>;
  onChange: (patch: Record<string, string>) => void;
}) {
  function set(key: string, raw: string) {
    onChange({ [key]: spacingPatchValue(raw) });
  }

  return (
    <div className="ae-layout-group">
      <div className="ae-layout-label">Spacing</div>
      <div className="ae-spacing-box" aria-label="Margin and padding">
        <span className="ae-spacing-tag ae-spacing-tag-margin">margin</span>
        <input
          className="ae-sp ae-sp-mt"
          aria-label="Margin top"
          title="Margin top"
          value={spacingInputValue(values.marginTop)}
          placeholder="0"
          onChange={(e) => set("marginTop", e.target.value)}
        />
        <input
          className="ae-sp ae-sp-mr"
          aria-label="Margin right"
          title="Margin right"
          value={spacingInputValue(values.marginRight)}
          placeholder="0"
          onChange={(e) => set("marginRight", e.target.value)}
        />
        <input
          className="ae-sp ae-sp-mb"
          aria-label="Margin bottom"
          title="Margin bottom"
          value={spacingInputValue(values.marginBottom)}
          placeholder="0"
          onChange={(e) => set("marginBottom", e.target.value)}
        />
        <input
          className="ae-sp ae-sp-ml"
          aria-label="Margin left"
          title="Margin left"
          value={spacingInputValue(values.marginLeft)}
          placeholder="0"
          onChange={(e) => set("marginLeft", e.target.value)}
        />
        <div className="ae-spacing-pad">
          <span className="ae-spacing-tag">padding</span>
          <input
            className="ae-sp ae-sp-pt"
            aria-label="Padding top"
            title="Padding top"
            value={spacingInputValue(values.paddingTop)}
            placeholder="0"
            onChange={(e) => set("paddingTop", e.target.value)}
          />
          <input
            className="ae-sp ae-sp-pr"
            aria-label="Padding right"
            title="Padding right"
            value={spacingInputValue(values.paddingRight)}
            placeholder="0"
            onChange={(e) => set("paddingRight", e.target.value)}
          />
          <input
            className="ae-sp ae-sp-pb"
            aria-label="Padding bottom"
            title="Padding bottom"
            value={spacingInputValue(values.paddingBottom)}
            placeholder="0"
            onChange={(e) => set("paddingBottom", e.target.value)}
          />
          <input
            className="ae-sp ae-sp-pl"
            aria-label="Padding left"
            title="Padding left"
            value={spacingInputValue(values.paddingLeft)}
            placeholder="0"
            onChange={(e) => set("paddingLeft", e.target.value)}
          />
          <div className="ae-spacing-inner" aria-hidden />
        </div>
      </div>
      <div className="ae-layout-row">
        <Field
          label="Gap"
          value={spacingInputValue(values.gap)}
          placeholder="16"
          onChange={(v) => set("gap", v)}
        />
      </div>
    </div>
  );
}

export function LayoutControls({ values, onChange, advancedSlot }: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const display = values.display || "block";
  const flex = isFlexDisplay(display);
  const grid = isGridDisplay(display);

  return (
    <div className="ae-layout-controls">
      <div className="ae-layout-group">
        <div className="ae-layout-label">Presets</div>
        <div className="ae-style-presets">
          {LAYOUT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className="ae-preset-chip"
              onClick={() => onChange({ ...preset.patch })}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <Segmented
        label="Display"
        options={DISPLAY_OPTIONS}
        value={display}
        onChange={(value) => onChange({ display: value })}
      />

      {flex ? (
        <>
          <Segmented
            label="Direction"
            options={DIRECTION_OPTIONS}
            value={values.direction || "row"}
            onChange={(value) => onChange({ direction: value })}
          />
          <Segmented
            label="Wrap"
            options={WRAP_OPTIONS}
            value={values.wrap || "nowrap"}
            onChange={(value) => onChange({ wrap: value })}
          />
          <Segmented
            label="Align"
            options={ALIGN_OPTIONS}
            value={values.align || "stretch"}
            onChange={(value) => onChange({ align: value })}
          />
          <Segmented
            label="Justify"
            options={JUSTIFY_OPTIONS}
            value={values.justify || "flex-start"}
            onChange={(value) => onChange({ justify: value })}
          />
        </>
      ) : null}

      {grid ? (
        <Segmented
          label="Columns"
          options={GRID_COLS_OPTIONS}
          value={values.gridCols || "2"}
          onChange={(value) => onChange({ gridCols: value })}
        />
      ) : null}

      <SpacingBox values={values} onChange={onChange} />

      <div className="ae-layout-group">
        <div className="ae-layout-label">Size</div>
        <div className="ae-layout-grid2">
          <Field
            label="Width"
            value={values.width || ""}
            placeholder="100%"
            onChange={(v) => onChange({ width: v })}
          />
          <Field
            label="Max width"
            value={values.maxWidth || ""}
            placeholder="72.5rem"
            onChange={(v) => onChange({ maxWidth: v })}
          />
          <Field
            label="Height"
            value={values.height || ""}
            placeholder="auto"
            onChange={(v) => onChange({ height: v })}
          />
          <Field
            label="Min height"
            value={values.minHeight || ""}
            placeholder="0"
            onChange={(v) => onChange({ minHeight: v })}
          />
        </div>
      </div>

      {advancedSlot ? (
        <div className="ae-layout-group">
          <button
            type="button"
            className="ae-btn ghost ae-layout-advanced-toggle"
            onClick={() => setShowAdvanced((v) => !v)}
          >
            {showAdvanced ? "Hide all fields" : "All fields"}
          </button>
          {showAdvanced ? advancedSlot : null}
        </div>
      ) : null}
    </div>
  );
}
