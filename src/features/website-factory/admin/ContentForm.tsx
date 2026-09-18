"use client";

import { useEffect, useState } from "react";
import type { Business, ProjectBundle } from "@/features/website-factory/types";
import { ProjectNav } from "./ProjectNav";
import { Field, ImageUpload, useBundle } from "./fields";

export function ContentForm({ id }: { id: string }) {
  const { bundle, error, loading, setError } = useBundle(id);
  const [business, setBusiness] = useState<Business | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (bundle) setBusiness((bundle as ProjectBundle).business);
  }, [bundle]);

  if (loading) return <p className="text-sm text-zinc-500">Loading…</p>;
  if (!business) return <p className="text-sm text-red-400">{error || "Not found"}</p>;

  async function save(regenerate: boolean) {
    if (!business) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/admin/websites/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: business.id,
          name: business.name,
          tagline: business.tagline,
          description: business.description,
          industry: business.industry,
          phone: business.phone,
          email: business.email,
          address: business.address,
          postcode: business.postcode,
          logoUrl: business.logoUrl,
          heroUrl: business.heroUrl,
          openingHours: business.openingHours,
          primaryCta: business.primaryCta,
          usps: business.usps,
          trustIndicators: business.trustIndicators,
          services: business.services.map((item) => ({
            name: item.name,
            description: item.description,
            imageUrl: item.imageUrl,
          })),
          reviews: business.reviews.map((item) => ({
            customerName: item.customerName,
            quote: item.quote,
            rating: item.rating,
            source: item.source,
          })),
          team: business.team.map((item) => ({
            name: item.name,
            role: item.role,
            photoUrl: item.photoUrl,
            bio: item.bio,
          })),
          media: business.media.map((item) => ({
            kind: item.kind,
            url: item.url,
            alt: item.alt,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setBusiness(data.business);
      if (regenerate) {
        const gen = await fetch(`/api/admin/websites/${id}/generate`, { method: "POST" });
        const genData = await gen.json();
        if (!gen.ok) throw new Error(genData.error || "Generate failed");
        setMessage("Saved and regenerated draft pages from this content.");
      } else {
        setMessage("Business saved. Draft pages were not regenerated.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl text-zinc-200">
      <ProjectNav id={id} />
      <h2 className="text-2xl text-white">Content</h2>
      <p className="mt-2 text-sm text-zinc-500">
        This is the business record. Regenerating overwrites draft pages.
      </p>
      <div className="mt-8 space-y-6">
        <Field label="Name" value={business.name} onChange={(name) => setBusiness({ ...business, name })} />
        <Field
          label="Tagline"
          value={business.tagline}
          onChange={(tagline) => setBusiness({ ...business, tagline })}
        />
        <Field
          label="About"
          value={business.description}
          onChange={(description) => setBusiness({ ...business, description })}
          textarea
        />
        <Field label="Phone" value={business.phone} onChange={(phone) => setBusiness({ ...business, phone })} />
        <Field label="Email" value={business.email} onChange={(email) => setBusiness({ ...business, email })} />
        <Field
          label="Address"
          value={business.address}
          onChange={(address) => setBusiness({ ...business, address })}
        />
        <ImageUpload
          label="Logo"
          value={business.logoUrl}
          owner={`websites/${id}`}
          onChange={(logoUrl) => setBusiness({ ...business, logoUrl })}
        />
        <ImageUpload
          label="Hero"
          value={business.heroUrl}
          owner={`websites/${id}`}
          onChange={(heroUrl) => setBusiness({ ...business, heroUrl })}
        />
      </div>
      {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
      {message ? <p className="mt-4 text-sm text-zinc-400">{message}</p> : null}
      <div className="mt-8 flex gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => void save(false)}
          className="rounded-lg border border-white/15 px-4 py-2 text-sm"
        >
          Save
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void save(true)}
          className="rounded-lg bg-white px-4 py-2 text-sm text-black"
        >
          Save and regenerate
        </button>
      </div>
    </div>
  );
}
