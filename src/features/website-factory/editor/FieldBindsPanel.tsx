"use client";

import { readFieldBinds, setFieldBind } from "@/features/website-factory/cms/bindings";
import { listCollections } from "@/features/website-factory/cms/collections";
import type { SiteConfig } from "@/features/website-factory/types";

const BINDABLE_PROPS = [
  "heading",
  "text",
  "body",
  "description",
  "eyebrow",
  "label",
  "name",
  "title",
  "imageUrl",
  "imageAlt",
  "primaryLabel",
  "secondaryLabel",
] as const;

type Props = {
  props: Record<string, unknown>;
  siteConfig?: SiteConfig | null;
  onChange: (next: Record<string, unknown>) => void;
};

export function FieldBindsPanel({ props, siteConfig, onChange }: Props) {
  const binds = readFieldBinds(props);
  const collections = listCollections(siteConfig);
  const suggestions = [
    "business.name",
    "business.tagline",
    "business.phone",
    "business.email",
    ...collections.flatMap((c) =>
      c.fields.slice(0, 3).map((f) => `${c.slug}.0.${f.key}`),
    ),
  ];

  return (
    <div className="ae-field-binds">
      <p className="ae-section-label">Field binds</p>
      <p className="ae-note">
        Map props to CMS / business paths. Examples:{" "}
        <code>business.name</code>, <code>services.0.name</code>, or{" "}
        <code>name</code> inside a Collection List entry.
      </p>
      {BINDABLE_PROPS.map((key) => (
        <label key={key} className="ae-custom-field">
          <span>{key}</span>
          <input
            list="ae-bind-suggestions"
            value={binds[key] || ""}
            placeholder="(unbound)"
            onChange={(e) => onChange(setFieldBind(props, key, e.target.value))}
          />
        </label>
      ))}
      <datalist id="ae-bind-suggestions">
        {suggestions.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
    </div>
  );
}
