"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SEEDED_TEMPLATES } from "@/features/website-factory/templates/seeds";
import { DEFAULT_THEME } from "@/features/website-factory/types";
import { Field, ImageUpload } from "./fields";

type Template = {
  id: string;
  name: string;
  industry: string;
  description: string;
  pagesCount: number;
};

type BusinessRow = {
  id: string;
  name: string;
  slug: string;
  industry: string;
  tagline: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  postcode: string;
  logoUrl: string;
  heroUrl: string;
  usps: string[];
  trustIndicators: string[];
  openingHours: Record<string, string>;
  primaryCta: { label: string; href: string };
  services: Array<{ name: string; description: string; imageUrl: string }>;
  reviews: Array<{
    customerName: string;
    quote: string;
    rating: number;
    source: string;
  }>;
  media: Array<{ kind: string; url: string; alt: string }>;
};

type Line = { name: string; description: string; imageUrl?: string };
type Review = {
  customerName: string;
  quote: string;
  rating: number;
  source: string;
};

const STEPS = [
  "Source",
  "Business",
  "Template",
  "About",
  "Proof",
  "Images",
  "Theme",
];

export function CreateWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [businesses, setBusinesses] = useState<BusinessRow[]>([]);
  const [existingId, setExistingId] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [industry, setIndustry] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [postcode, setPostcode] = useState("");
  const [hours, setHours] = useState("Monday: 8am–5pm\nTuesday: 8am–5pm");
  const [ctaLabel, setCtaLabel] = useState("Get a quote");
  const [usps, setUsps] = useState("");
  const [trust, setTrust] = useState("");
  const [services, setServices] = useState<Line[]>([
    { name: "", description: "" },
    { name: "", description: "" },
    { name: "", description: "" },
  ]);
  const [reviews, setReviews] = useState<Review[]>([
    { customerName: "", quote: "", rating: 5, source: "Google" },
  ]);
  const [logoUrl, setLogoUrl] = useState("");
  const [heroUrl, setHeroUrl] = useState("");
  const [gallery, setGallery] = useState(["", "", ""]);
  const [templateId, setTemplateId] = useState("");
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [sourceUrl, setSourceUrl] = useState("");
  const [mode, setMode] = useState<"preserve" | "rebuild" | "rewrite">(
    "rebuild",
  );
  const [analyseStep, setAnalyseStep] = useState("");

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("template");
    if (fromUrl) {
      setTemplateId(fromUrl);
      setStep(2);
    }
  }, []);

  useEffect(() => {
    void Promise.all([
      fetch("/api/admin/websites/templates").then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not load templates");
        return data;
      }),
      fetch("/api/admin/websites/businesses").then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not load businesses");
        return data;
      }),
    ])
      .then(([tpl, biz]) => {
        const next = (tpl.templates ?? []) as Template[];
        setTemplates(next.length ? next : SEEDED_TEMPLATES);
        setTemplateId((current) => {
          if (current && (next.length ? next : SEEDED_TEMPLATES).some((t) => t.id === current)) {
            return current;
          }
          return (next[0] ?? SEEDED_TEMPLATES[0]).id;
        });
        setBusinesses(biz.businesses ?? []);
      })
      .catch(() => {
        setTemplates(SEEDED_TEMPLATES);
        setTemplateId((current) => current || SEEDED_TEMPLATES[0].id);
      });
  }, []);

  useEffect(() => {
    if (!existingId) return;
    const row = businesses.find((item) => item.id === existingId);
    if (!row) return;
    setName(row.name);
    setTagline(row.tagline);
    setDescription(row.description);
    setIndustry(row.industry);
    setPhone(row.phone);
    setEmail(row.email);
    setAddress(row.address);
    setPostcode(row.postcode);
    setLogoUrl(row.logoUrl);
    setHeroUrl(row.heroUrl);
    setUsps((row.usps ?? []).join("\n"));
    setTrust((row.trustIndicators ?? []).join("\n"));
    setCtaLabel(row.primaryCta?.label || "Get a quote");
    const hourLines = Object.entries(row.openingHours ?? {})
      .map(([day, value]) => `${day}: ${value}`)
      .join("\n");
    if (hourLines) setHours(hourLines);
    if (row.services?.length) {
      setServices(
        row.services.map((item) => ({
          name: item.name,
          description: item.description,
        })),
      );
    }
    if (row.reviews?.length) {
      setReviews(row.reviews);
    }
    if (row.media?.length) {
      setGallery(
        row.media
          .map((item) => item.url)
          .concat(["", "", ""])
          .slice(0, 3),
      );
    }
  }, [existingId, businesses]);

  const openingHours = useMemo(() => {
    const out: Record<string, string> = {};
    hours.split("\n").forEach((line) => {
      const [day, ...rest] = line.split(":");
      if (day && rest.length) out[day.trim()] = rest.join(":").trim();
    });
    return out;
  }, [hours]);

  async function analyse() {
    setBusy(true);
    setError("");
    setAnalyseStep("Discovering pages");
    try {
      const created = await fetch("/api/admin/websites/intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: sourceUrl, sync: true }),
      });
      const createdData = await created.json();
      if (!created.ok) throw new Error(createdData.error || "Analyse failed");
      let job = createdData.job;
      for (
        let i = 0;
        i < 120 && (job.status === "running" || job.status === "queued");
        i += 1
      ) {
        setAnalyseStep(job.step || job.status);
        await new Promise((resolve) => setTimeout(resolve, 600));
        const res = await fetch(`/api/admin/websites/intelligence/${job.id}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Analyse failed");
        job = json.job;
      }
      if (job?.status === "failed")
        throw new Error(job.error || "Analyse failed");
      if (job?.status !== "succeeded")
        throw new Error("Import timed out — try again");
      const result = job?.result;
      if (!result) throw new Error("No content returned");
      setAnalyseStep(job.step || "Ready");
      setName(result.name || name);
      setTagline(result.tagline || tagline);
      setDescription(result.description || description);
      setPhone(result.phone || phone);
      setEmail(result.email || email);
      setLogoUrl(result.logoUrl || logoUrl);
      setHeroUrl(result.heroUrl || heroUrl);
      if (result.services?.length) {
        setServices(
          result.services
            .filter((item: { include?: boolean }) => item.include !== false)
            .map(
              (item: {
                name: string;
                description: string;
                imageUrl?: string;
              }) => ({
                name: item.name,
                description: item.description,
                imageUrl: item.imageUrl,
              }),
            ),
        );
      }
      const includedImages = (result.images || [])
        .filter(
          (item: { include?: boolean; url: string }) => item.include !== false,
        )
        .map((item: { url: string }) => item.url);
      if (includedImages.length)
        setGallery(includedImages.concat(["", "", ""]).slice(0, 3));
      setAnalyseStep(
        `Found ${result.pages?.length || 0} pages, ${result.images?.length || 0} images, ${result.services?.length || 0} services`,
      );
      setStep(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analyse failed");
    } finally {
      setBusy(false);
    }
  }

  async function generate() {
    setBusy(true);
    setError("");
    try {
      if (!name.trim()) throw new Error("Enter a business name");
      const chosenTemplate =
        templateId || templates[0]?.id || SEEDED_TEMPLATES[0].id;
      const res = await fetch("/api/admin/websites/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: existingId || undefined,
          name,
          tagline,
          description,
          industry,
          phone,
          email,
          address,
          postcode,
          logoUrl,
          heroUrl,
          openingHours,
          primaryCta: { label: ctaLabel, href: "/contact" },
          usps: usps
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean),
          trustIndicators: trust
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean),
          services: services.filter((item) => item.name.trim()),
          reviews: reviews.filter(
            (item) => item.customerName.trim() && item.quote.trim(),
          ),
          media: gallery
            .filter(Boolean)
            .map((url) => ({ kind: "gallery", url, alt: name })),
          website: sourceUrl,
          templateId: chosenTemplate,
          theme,
          mode,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Generate failed");
      const projectId = data.project?.id;
      if (!projectId) throw new Error("Generate did not return a website");
      router.push(`/admin/websites/${projectId}/editor`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generate failed");
      setBusy(false);
    }
  }

  return (
    <div className="text-zinc-200">
      <p className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-white/40">
        Studio
      </p>
      <h2 className="mt-2 text-[clamp(1.75rem,3vw,2.5rem)] font-normal tracking-[-0.035em] text-white">
        Create website
      </h2>
      <p className="mt-3 max-w-xl text-[1rem] font-light leading-relaxed text-white/50">
        Paste a public URL or enter the business. Analyse, pick a template,
        generate, then edit in Studio.
      </p>
      <button
        type="button"
        className="mt-4 text-sm text-zinc-400 underline"
        onClick={() => {
          setName("ABC Roofing");
          setIndustry("Roofing");
          setTagline("Roof work you can inspect.");
          setDescription(
            "ABC Roofing repairs, replaces, and surveys domestic and small commercial roofs in Manchester. The crew on site is the crew you were quoted.",
          );
          setPhone("0161 000 0000");
          setEmail("hello@abc-roofing.example");
          setAddress("Manchester");
          setPostcode("M1 1AA");
          setCtaLabel("Get a quote");
          setUsps("Fully insured\nWritten quotes\nPhotos of the work");
          setTrust("12 years trading\nLocal crew\nNo subcontracted surprise");
          setServices([
            {
              name: "Roof replacement",
              description:
                "A full strip and relay, written down before we start.",
            },
            {
              name: "Repairs",
              description:
                "Leaks, slipped slates, and leadwork that actually holds.",
            },
            {
              name: "Surveys",
              description: "We look at the roof. You get the photos.",
            },
          ]);
          setReviews([
            {
              customerName: "J. Khan",
              quote:
                "They showed up, did the work they priced, and left the loft dry.",
              rating: 5,
              source: "Google",
            },
          ]);
          setTemplateId(
            templates.find(
              (item) => /roof/i.test(item.name) || /roof/i.test(item.industry),
            )?.id ||
              templates[0]?.id ||
              SEEDED_TEMPLATES[0].id,
          );
        }}
      >
        Fill ABC Roofing example
      </button>
      <ol className="mt-8 flex flex-wrap gap-2">
        {STEPS.map((label, index) => (
          <li key={label}>
            <span
              className={`inline-flex rounded-full px-3 py-1.5 text-sm ${
                index === step
                  ? "bg-white text-[#0d1730]"
                  : "text-white/45"
              }`}
            >
              {index + 1}. {label}
            </span>
          </li>
        ))}
      </ol>

      <div className={`mt-10 space-y-6 ${step === 2 ? "max-w-4xl" : "max-w-2xl"}`}>
        {step === 0 ? (
          <>
            <Field
              label="Existing website URL"
              value={sourceUrl}
              onChange={setSourceUrl}
            />
            <p className="text-sm text-zinc-500">
              Optional. We fetch public pages, respect robots.txt, and never
              keep scraper URLs as the live site.
            </p>
            <button
              type="button"
              disabled={busy || !sourceUrl.trim()}
              className="rounded-lg border border-white/15 px-4 py-2 text-sm disabled:opacity-40"
              onClick={() => void analyse()}
            >
              {busy ? analyseStep || "Analysing…" : "Analyse website"}
            </button>
            {analyseStep ? (
              <p className="text-sm text-zinc-500">{analyseStep}</p>
            ) : null}
            <fieldset className="space-y-2 text-sm text-zinc-400">
              <legend className="text-white">Generation mode</legend>
              {(["preserve", "rebuild", "rewrite"] as const).map((item) => (
                <label key={item} className="block">
                  <input
                    type="radio"
                    name="mode"
                    checked={mode === item}
                    onChange={() => setMode(item)}
                  />{" "}
                  {item === "preserve"
                    ? "Preserve — imported copy, Aevion layout"
                    : item === "rewrite"
                      ? "Rewrite — tighten existing copy, no invented claims"
                      : "Rebuild — business data on a new Aevion template"}
                </label>
              ))}
            </fieldset>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <label className="block text-sm text-zinc-400">
              Existing business
              <select
                value={existingId}
                onChange={(event) => setExistingId(event.target.value)}
                className="mt-1 w-full border-b border-white/15 bg-transparent py-2 text-white outline-none"
              >
                <option value="">Create new</option>
                {businesses.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <Field label="Business name" value={name} onChange={setName} />
            <Field label="Industry" value={industry} onChange={setIndustry} />
          </>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {!templates.length ? (
              <p className="text-sm text-white/45">No templates loaded.</p>
            ) : null}
            {templates.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setTemplateId(item.id)}
                className={`rounded-2xl border p-4 text-left transition ${
                  templateId === item.id
                    ? "border-white bg-white/[0.08] text-white"
                    : "border-white/10 bg-white/[0.02] text-white/55 hover:border-white/25 hover:text-white"
                }`}
              >
                <div
                  className="mb-3 aspect-[16/10] rounded-xl bg-gradient-to-br from-[#1a2744] via-[#14213d] to-[#0a0f1c] p-3"
                  aria-hidden
                >
                  <div className="h-1.5 w-12 rounded-full bg-white/20" />
                  <div className="mt-3 h-2 w-2/3 max-w-[8rem] rounded bg-white/25" />
                  <div className="mt-2 h-1.5 w-1/2 max-w-[5rem] rounded bg-white/15" />
                </div>
                <p className="text-[0.65rem] uppercase tracking-[0.16em] text-white/40">
                  {item.industry}
                </p>
                <p className="mt-2 text-white">{item.name}</p>
                <p className="mt-1 text-sm text-white/45">
                  {item.pagesCount} pages · {item.description}
                </p>
              </button>
            ))}
          </div>
        ) : null}

        {step === 3 ? (
          <>
            <Field label="Tagline" value={tagline} onChange={setTagline} />
            <Field
              label="About"
              value={description}
              onChange={setDescription}
              textarea
            />
            <Field label="Phone" value={phone} onChange={setPhone} />
            <Field label="Email" value={email} onChange={setEmail} />
            <Field label="Address" value={address} onChange={setAddress} />
            <Field label="Postcode" value={postcode} onChange={setPostcode} />
            <Field
              label="Opening hours (one day per line)"
              value={hours}
              onChange={setHours}
              textarea
            />
            <Field
              label="Primary button"
              value={ctaLabel}
              onChange={setCtaLabel}
            />
          </>
        ) : null}

        {step === 4 ? (
          <>
            {services.map((item, index) => (
              <div
                key={index}
                className="space-y-3 border-t border-white/10 pt-4"
              >
                <Field
                  label={`Service ${index + 1}`}
                  value={item.name}
                  onChange={(value) =>
                    setServices((current) =>
                      current.map((row, i) =>
                        i === index ? { ...row, name: value } : row,
                      ),
                    )
                  }
                />
                <Field
                  label="Description"
                  value={item.description}
                  onChange={(value) =>
                    setServices((current) =>
                      current.map((row, i) =>
                        i === index ? { ...row, description: value } : row,
                      ),
                    )
                  }
                  textarea
                />
              </div>
            ))}
            <Field
              label="USPs (one per line)"
              value={usps}
              onChange={setUsps}
              textarea
            />
            <Field
              label="Trust lines (one per line)"
              value={trust}
              onChange={setTrust}
              textarea
            />
            {reviews.map((item, index) => (
              <div
                key={index}
                className="space-y-3 border-t border-white/10 pt-4"
              >
                <Field
                  label="Reviewer"
                  value={item.customerName}
                  onChange={(value) =>
                    setReviews((current) =>
                      current.map((row, i) =>
                        i === index ? { ...row, customerName: value } : row,
                      ),
                    )
                  }
                />
                <Field
                  label="Quote"
                  value={item.quote}
                  onChange={(value) =>
                    setReviews((current) =>
                      current.map((row, i) =>
                        i === index ? { ...row, quote: value } : row,
                      ),
                    )
                  }
                  textarea
                />
              </div>
            ))}
          </>
        ) : null}

        {step === 5 ? (
          <>
            <ImageUpload
              label="Logo"
              value={logoUrl}
              owner="websites/new"
              onChange={setLogoUrl}
            />
            <ImageUpload
              label="Hero"
              value={heroUrl}
              owner="websites/new"
              onChange={setHeroUrl}
            />
            {gallery.map((url, index) => (
              <ImageUpload
                key={index}
                label={`Gallery ${index + 1}`}
                value={url}
                owner="websites/new"
                onChange={(value) =>
                  setGallery((current) =>
                    current.map((item, i) => (i === index ? value : item)),
                  )
                }
              />
            ))}
          </>
        ) : null}

        {step === 6 ? (
          <>
            <Field
              label="Primary"
              type="color"
              value={theme.primary}
              onChange={(primary) =>
                setTheme((current) => ({ ...current, primary }))
              }
            />
            <Field
              label="Background"
              type="color"
              value={theme.background}
              onChange={(background) =>
                setTheme((current) => ({ ...current, background }))
              }
            />
            <Field
              label="Text"
              type="color"
              value={theme.foreground}
              onChange={(foreground) =>
                setTheme((current) => ({ ...current, foreground }))
              }
            />
            <Field
              label="Heading font"
              value={theme.headingFont}
              onChange={(headingFont) =>
                setTheme((current) => ({ ...current, headingFont }))
              }
            />
            <Field
              label="Body font"
              value={theme.bodyFont}
              onChange={(bodyFont) =>
                setTheme((current) => ({ ...current, bodyFont }))
              }
            />
          </>
        ) : null}
      </div>

      {error ? <p className="mt-6 text-sm text-red-400">{error}</p> : null}

      <div className="mt-10 flex gap-3">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((current) => current - 1)}
            className="rounded-lg border border-white/15 px-4 py-2 text-sm"
          >
            Back
          </button>
        ) : null}
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep((current) => current + 1)}
            className="rounded-lg bg-white px-4 py-2 text-sm text-black"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            disabled={busy || !name || !(templateId || templates[0]?.id)}
            onClick={() => void generate()}
            className="rounded-lg bg-white px-4 py-2 text-sm text-black disabled:opacity-40"
          >
            {busy ? "Generating…" : "Generate"}
          </button>
        )}
      </div>
    </div>
  );
}
