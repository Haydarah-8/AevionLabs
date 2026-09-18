"use client";

import { useEffect, useState } from "react";
import { MediaField } from "@/components/admin/cms/MediaField";
import type { SiteSettings } from "@/lib/cms/types";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-[0.9rem] text-white outline-none placeholder:text-white/30 focus:border-white/25";

const FIELDS: Array<{
  key: keyof SiteSettings;
  label: string;
  kind?: "textarea" | "image";
}> = [
  { key: "siteName", label: "Agency name" },
  { key: "tagline", label: "Default title" },
  { key: "description", label: "Default description", kind: "textarea" },
  { key: "location", label: "Location" },
  { key: "contactEmail", label: "New-business email" },
  { key: "contactEmailDisplay", label: "Email display" },
  { key: "generalEmail", label: "General email" },
  { key: "prefooterHeading", label: "Pre-footer heading", kind: "textarea" },
  { key: "prefooterCtaLabel", label: "Pre-footer button" },
  { key: "prefooterCtaHref", label: "Pre-footer link" },
  { key: "prefooterImage", label: "Pre-footer image", kind: "image" },
  { key: "footerCopyright", label: "Footer copyright ({year} is replaced)" },
  { key: "footerDecoration", label: "Footer decoration", kind: "image" },
];

export function SettingsEditor() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetch("/api/admin/cms/settings")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load settings");
        setSettings(data.settings);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load settings"),
      );
  }, []);

  async function save() {
    if (!settings) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/cms/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setSettings(data.settings);
      setNotice("Saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (!settings) {
    return <p className="text-white/45">{error || "Loading settings…"}</p>;
  }

  return (
    <div>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-white/40">
            Agency
          </p>
          <h2 className="mt-2 text-[clamp(1.75rem,3vw,2.5rem)] font-normal tracking-[-0.035em] text-white">
            Settings
          </h2>
          <p className="mt-3 max-w-xl text-[1rem] font-light leading-relaxed text-white/50">
            Global copy and images used in the header, footer, and SEO.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {notice ? (
            <span className="text-[0.8rem] text-white/45">{notice}</span>
          ) : null}
          <button
            type="button"
            disabled={saving}
            onClick={() => void save()}
            className="rounded-full bg-white px-5 py-2.5 text-sm text-[#0d1730] disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save settings"}
          </button>
        </div>
      </div>
      {error ? <p className="mb-4 text-[0.9rem] text-red-400">{error}</p> : null}
      <div className="grid max-w-3xl gap-5">
        {FIELDS.map((field) =>
          field.kind === "image" ? (
            <MediaField
              key={field.key}
              label={field.label}
              value={settings[field.key]}
              owner="cms/settings"
              onChange={(url) => setSettings({ ...settings, [field.key]: url })}
            />
          ) : field.kind === "textarea" ? (
            <label key={field.key} className="block">
              <span className="text-[0.8rem] text-white/45">{field.label}</span>
              <textarea
                rows={4}
                className={inputClass}
                value={settings[field.key]}
                onChange={(event) =>
                  setSettings({ ...settings, [field.key]: event.target.value })
                }
              />
            </label>
          ) : (
            <label key={field.key} className="block">
              <span className="text-[0.8rem] text-white/45">{field.label}</span>
              <input
                className={inputClass}
                value={settings[field.key]}
                onChange={(event) =>
                  setSettings({ ...settings, [field.key]: event.target.value })
                }
              />
            </label>
          ),
        )}
      </div>
    </div>
  );
}
