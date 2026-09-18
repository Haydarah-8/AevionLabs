"use client";

import { useEffect, useState } from "react";
import type { ProjectBundle, SeoConfig, SiteConfig, ThemeTokens } from "@/features/website-factory/types";
import { ProjectNav } from "./ProjectNav";
import { Field, useBundle } from "./fields";

export function SettingsForm({ id }: { id: string }) {
  const { bundle, error, loading, setError } = useBundle(id);
  const [theme, setTheme] = useState<ThemeTokens | null>(null);
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [seoConfig, setSeoConfig] = useState<SeoConfig | null>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!bundle) return;
    const data = bundle as ProjectBundle;
    setTheme(data.project.theme);
    setSiteConfig(data.project.siteConfig);
    setSeoConfig(data.project.seoConfig);
    setName(data.project.name);
  }, [bundle]);

  if (loading) return <p className="text-sm text-zinc-500">Loading…</p>;
  if (!theme || !siteConfig || !seoConfig) {
    return <p className="text-sm text-red-400">{error || "Not found"}</p>;
  }

  async function save() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`/api/admin/websites/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, theme, siteConfig, seoConfig }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setMessage("Settings saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl text-zinc-200">
      <ProjectNav id={id} />
      <h2 className="text-2xl text-white">Settings</h2>
      <div className="mt-8 space-y-6">
        <Field label="Website name" value={name} onChange={setName} />
        <Field
          label="SEO title"
          value={seoConfig.title}
          onChange={(title) => setSeoConfig({ ...seoConfig, title })}
        />
        <Field
          label="SEO description"
          value={seoConfig.description}
          onChange={(description) => setSeoConfig({ ...seoConfig, description })}
          textarea
        />
        <Field
          label="OG image URL"
          value={seoConfig.ogImage}
          onChange={(ogImage) => setSeoConfig({ ...seoConfig, ogImage })}
        />
        <Field
          label="Robots"
          value={seoConfig.robots}
          onChange={(robots) => setSeoConfig({ ...seoConfig, robots })}
        />
        <Field
          label="Announcement"
          value={siteConfig.announcement}
          onChange={(announcement) => setSiteConfig({ ...siteConfig, announcement })}
        />
        <Field
          label="Footer note"
          value={siteConfig.footerNote}
          onChange={(footerNote) => setSiteConfig({ ...siteConfig, footerNote })}
        />
        <Field
          label="Primary"
          type="color"
          value={theme.primary}
          onChange={(primary) => setTheme({ ...theme, primary })}
        />
        <Field
          label="Background"
          type="color"
          value={theme.background}
          onChange={(background) => setTheme({ ...theme, background })}
        />
        <Field
          label="Text"
          type="color"
          value={theme.foreground}
          onChange={(foreground) => setTheme({ ...theme, foreground })}
        />
        <Field
          label="Heading font"
          value={theme.headingFont}
          onChange={(headingFont) => setTheme({ ...theme, headingFont })}
        />
        <Field
          label="Body font"
          value={theme.bodyFont}
          onChange={(bodyFont) => setTheme({ ...theme, bodyFont })}
        />
      </div>
      {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
      {message ? <p className="mt-4 text-sm text-zinc-400">{message}</p> : null}
      <button
        type="button"
        disabled={busy}
        onClick={() => void save()}
        className="mt-8 rounded-lg bg-white px-4 py-2 text-sm text-black"
      >
        Save settings
      </button>
    </div>
  );
}
