"use client";

import type { CustomField } from "@puckeditor/core";

/** Colour input that stores hex strings */
export const colourField = {
  type: "custom" as const,
  render: ({
    value,
    onChange,
    name,
  }: {
    value: string;
    onChange: (value: string) => void;
    name: string;
  }) => (
    <label className="ae-custom-field">
      <span>{name}</span>
      <input
        type="color"
        value={/^#[0-9a-fA-F]{6}$/.test(value || "") ? value : "#111111"}
        onChange={(event) => onChange(event.target.value)}
      />
      <input
        type="text"
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder="#111111"
      />
    </label>
  ),
} satisfies CustomField<string>;

/** Spacing shorthand (px) */
export const spacingField = {
  type: "custom" as const,
  render: ({
    value,
    onChange,
    name,
  }: {
    value: string;
    onChange: (value: string) => void;
    name: string;
  }) => (
    <label className="ae-custom-field">
      <span>{name}</span>
      <input
        type="range"
        min={0}
        max={128}
        step={4}
        value={Number.parseInt(String(value || "0"), 10) || 0}
        onChange={(event) => onChange(event.target.value)}
      />
      <input
        type="text"
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder="24"
      />
    </label>
  ),
} satisfies CustomField<string>;

/** Simple image URL field with preview */
export const imageUrlField = {
  type: "custom" as const,
  render: ({
    value,
    onChange,
    name,
  }: {
    value: string;
    onChange: (value: string) => void;
    name: string;
  }) => (
    <div className="ae-custom-field ae-image-field">
      <span>{name}</span>
      <input
        type="url"
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder="https://… or /factory-assets/…"
      />
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="ae-image-preview" />
      ) : null}
    </div>
  ),
} satisfies CustomField<string>;

/** Page/path link field */
export const linkField = {
  type: "custom" as const,
  render: ({
    value,
    onChange,
    name,
  }: {
    value: string;
    onChange: (value: string) => void;
    name: string;
  }) => (
    <label className="ae-custom-field">
      <span>{name}</span>
      <input
        type="text"
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder="/contact or https://…"
      />
    </label>
  ),
} satisfies CustomField<string>;
