"use client";

import { useState } from "react";
import type { Business, ProjectBundle } from "@/features/website-factory/types";
import { Field, ImageUpload } from "@/features/website-factory/admin/fields";

function hoursToText(hours: Record<string, string>) {
  return Object.entries(hours || {})
    .map(([day, value]) => `${day}: ${value}`)
    .join("\n");
}

function textToHours(value: string) {
  const out: Record<string, string> = {};
  value.split("\n").forEach((line) => {
    const [day, ...rest] = line.split(":");
    if (day && rest.length) out[day.trim()] = rest.join(":").trim();
  });
  return out;
}

export function StudioBusinessPanel({
  bundle,
  onSaved,
}: {
  bundle: ProjectBundle;
  onSaved: (next: ProjectBundle) => void;
}) {
  const b = bundle.business;
  const [name, setName] = useState(b.name);
  const [tagline, setTagline] = useState(b.tagline);
  const [description, setDescription] = useState(b.description);
  const [industry, setIndustry] = useState(b.industry);
  const [phone, setPhone] = useState(b.phone);
  const [email, setEmail] = useState(b.email);
  const [website, setWebsite] = useState(b.website);
  const [address, setAddress] = useState(b.address);
  const [postcode, setPostcode] = useState(b.postcode);
  const [ctaLabel, setCtaLabel] = useState(b.primaryCta?.label || "Contact");
  const [usps, setUsps] = useState((b.usps || []).join("\n"));
  const [trust, setTrust] = useState((b.trustIndicators || []).join("\n"));
  const [hours, setHours] = useState(hoursToText(b.openingHours || {}));
  const [logoUrl, setLogoUrl] = useState(b.logoUrl);
  const [heroUrl, setHeroUrl] = useState(b.heroUrl);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function save() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const payload = {
        id: b.id,
        name: name.trim() || "Untitled site",
        tagline,
        description,
        industry,
        phone,
        email,
        website,
        address,
        postcode,
        logoUrl,
        heroUrl,
        faviconUrl: b.faviconUrl || "",
        openingHours: textToHours(hours),
        social: b.social || {},
        yearsInBusiness: b.yearsInBusiness,
        certifications: b.certifications || [],
        awards: b.awards || [],
        primaryCta: { label: ctaLabel || "Contact", href: b.primaryCta?.href || "/contact" },
        secondaryCta: b.secondaryCta || { label: "", href: "" },
        usps: usps.split("\n").map((s) => s.trim()).filter(Boolean),
        trustIndicators: trust.split("\n").map((s) => s.trim()).filter(Boolean),
        prospectLabel: b.prospectLabel || "",
        services: (b.services || []).map((s) => ({
          name: s.name,
          description: s.description,
          imageUrl: s.imageUrl || "",
        })),
        team: (b.team || []).map((m) => ({
          name: m.name,
          role: m.role || "",
          photoUrl: m.photoUrl || "",
          bio: m.bio || "",
        })),
        reviews: (b.reviews || []).map((r) => ({
          customerName: r.customerName,
          quote: r.quote,
          rating: r.rating,
          source: r.source || "",
        })),
        media: (b.media || []).map((m) => ({
          kind: m.kind || "gallery",
          url: m.url,
          alt: m.alt || "",
        })),
      };
      const res = await fetch("/api/admin/websites/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      if (name.trim() && name.trim() !== bundle.project.name) {
        await fetch(`/api/admin/websites/${bundle.project.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim() }),
        });
      }

      const full = await fetch(`/api/admin/websites/${bundle.project.id}`);
      const next = (await full.json()) as ProjectBundle;
      if (!full.ok) throw new Error("Saved business but failed to reload");
      onSaved(next);
      setNotice("Saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ae-panel-scroll space-y-4 p-3 text-sm">
      <p className="ae-section-label">Site details</p>
      <p className="text-[0.8rem] leading-relaxed text-zinc-500">
        Fill these anytime — Create opens a blank canvas without a wizard.
      </p>
      <Field label="Business name" value={name} onChange={setName} />
      <Field label="Industry" value={industry} onChange={setIndustry} />
      <Field label="Tagline" value={tagline} onChange={setTagline} />
      <Field
        label="About"
        value={description}
        onChange={setDescription}
        textarea
      />
      <Field label="Phone" value={phone} onChange={setPhone} />
      <Field label="Email" value={email} onChange={setEmail} />
      <Field label="Website URL" value={website} onChange={setWebsite} />
      <Field label="Address" value={address} onChange={setAddress} />
      <Field label="Postcode" value={postcode} onChange={setPostcode} />
      <Field label="Primary CTA" value={ctaLabel} onChange={setCtaLabel} />
      <Field
        label="USPs (one per line)"
        value={usps}
        onChange={setUsps}
        textarea
      />
      <Field
        label="Trust (one per line)"
        value={trust}
        onChange={setTrust}
        textarea
      />
      <Field
        label="Opening hours (Day: hours)"
        value={hours}
        onChange={setHours}
        textarea
      />
      <ImageUpload
        label="Logo"
        value={logoUrl}
        owner={`factory/${bundle.project.id}/logo`}
        onChange={setLogoUrl}
      />
      <ImageUpload
        label="Hero image"
        value={heroUrl}
        owner={`factory/${bundle.project.id}/hero`}
        onChange={setHeroUrl}
      />
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
      {notice ? <p className="text-xs text-emerald-400">{notice}</p> : null}
      <button
        type="button"
        disabled={busy}
        onClick={() => void save()}
        className="ae-btn primary w-full justify-center disabled:opacity-40"
      >
        {busy ? "Saving…" : "Save site details"}
      </button>
      <button
        type="button"
        className="ae-btn ghost w-full justify-center"
        onClick={() => {
          void fetch(`/api/admin/websites/${bundle.project.id}/generate`, {
            method: "POST",
          })
            .then(async (res) => {
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || "Rebuild failed");
              const full = await fetch(
                `/api/admin/websites/${bundle.project.id}`,
              );
              onSaved((await full.json()) as ProjectBundle);
              setNotice("Pages rebuilt from site details");
            })
            .catch((err) =>
              setError(err instanceof Error ? err.message : "Rebuild failed"),
            );
        }}
      >
        Rebuild pages from details
      </button>
      <p className="text-[0.7rem] text-zinc-600">
        Business id {(b as Business).id.slice(0, 8)}…
      </p>
    </div>
  );
}
