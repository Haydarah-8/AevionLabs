"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteRender } from "@/features/website-factory/puck/SiteRender";
import { themeStyle } from "@/features/website-factory/puck/theme";
import { generateFromBusiness } from "@/features/website-factory/mapping/generate";
import {
  ABC_ROOFING_INPUT,
  ABC_ROOFING_TEMPLATE_SLUG,
  ABC_ROOFING_THEME,
} from "@/features/website-factory/demo/abc-roofing";
import { SEEDED_TEMPLATES } from "@/features/website-factory/templates/seeds";
import { DEFAULT_THEME, type Business, type ThemeTokens } from "@/features/website-factory/types";
import { Field, ImageUpload } from "./fields";

type Template = {
  id: string;
  slug: string;
  name: string;
  industry: string;
  description: string;
  pagesCount: number;
  definitionKey?: string;
};

type Panel = "business" | "proof" | "template" | "theme" | "source";

const PANELS: Array<{ id: Panel; label: string }> = [
  { id: "business", label: "Business" },
  { id: "proof", label: "Proof" },
  { id: "template", label: "Template" },
  { id: "theme", label: "Theme" },
  { id: "source", label: "Source" },
];

function draftBusiness(input: {
  name: string;
  tagline: string;
  description: string;
  industry: string;
  phone: string;
  email: string;
  address: string;
  postcode: string;
  ctaLabel: string;
  usps: string;
  trust: string;
  hours: string;
  services: Array<{ name: string; description: string }>;
  reviews: Array<{
    customerName: string;
    quote: string;
    rating: number;
    source: string;
  }>;
  logoUrl: string;
  heroUrl: string;
  gallery: string[];
}): Business {
  const openingHours: Record<string, string> = {};
  input.hours.split("\n").forEach((line) => {
    const [day, ...rest] = line.split(":");
    if (day && rest.length) openingHours[day.trim()] = rest.join(":").trim();
  });
  return {
    id: "draft",
    name: input.name || "Untitled site",
    slug: "draft",
    tagline: input.tagline,
    description: input.description,
    industry: input.industry,
    logoUrl: input.logoUrl,
    faviconUrl: "",
    heroUrl: input.heroUrl,
    phone: input.phone,
    email: input.email,
    website: "",
    address: input.address,
    postcode: input.postcode,
    openingHours,
    social: {},
    yearsInBusiness: null,
    certifications: [],
    awards: [],
    primaryCta: { label: input.ctaLabel || "Contact", href: "/contact" },
    secondaryCta: { label: "", href: "" },
    usps: input.usps.split("\n").map((s) => s.trim()).filter(Boolean),
    trustIndicators: input.trust.split("\n").map((s) => s.trim()).filter(Boolean),
    prospectLabel: "",
    createdAt: "",
    updatedAt: "",
    services: input.services
      .filter((s) => s.name.trim())
      .map((s, i) => ({
        id: `s${i}`,
        businessId: "draft",
        name: s.name,
        description: s.description,
        imageUrl: "",
        sortOrder: i,
      })),
    team: [],
    reviews: input.reviews
      .filter((r) => r.customerName.trim() && r.quote.trim())
      .map((r, i) => ({
        id: `r${i}`,
        businessId: "draft",
        customerName: r.customerName,
        quote: r.quote,
        rating: r.rating,
        source: r.source,
        sortOrder: i,
      })),
    media: input.gallery.filter(Boolean).map((url, i) => ({
      id: `m${i}`,
      businessId: "draft",
      kind: "gallery",
      url,
      alt: input.name,
      sortOrder: i,
    })),
  };
}

export function CreateCanvas() {
  const router = useRouter();
  const [panel, setPanel] = useState<Panel>("business");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateSlug, setTemplateSlug] = useState(ABC_ROOFING_TEMPLATE_SLUG);
  const [previewPage, setPreviewPage] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [analyseStep, setAnalyseStep] = useState("");

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
  const [services, setServices] = useState([
    { name: "", description: "" },
    { name: "", description: "" },
    { name: "", description: "" },
  ]);
  const [reviews, setReviews] = useState([
    { customerName: "", quote: "", rating: 5, source: "Google" },
  ]);
  const [logoUrl, setLogoUrl] = useState("");
  const [heroUrl, setHeroUrl] = useState("");
  const [gallery, setGallery] = useState(["", "", ""]);
  const [theme, setTheme] = useState<ThemeTokens>(DEFAULT_THEME);
  const [sourceUrl, setSourceUrl] = useState("");
  const [mode, setMode] = useState<"preserve" | "rebuild" | "rewrite">("rebuild");

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("template");
    if (fromUrl) setTemplateSlug(fromUrl);
  }, []);

  useEffect(() => {
    void fetch("/api/admin/websites/templates")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not load templates");
        const next = (data.templates ?? []) as Template[];
        setTemplates(next.length ? next : SEEDED_TEMPLATES);
        setTemplateSlug((current) => {
          const list = next.length ? next : SEEDED_TEMPLATES;
          if (list.some((t) => t.slug === current || t.id === current)) return current;
          return list[0]?.slug || ABC_ROOFING_TEMPLATE_SLUG;
        });
      })
      .catch(() => {
        setTemplates(SEEDED_TEMPLATES);
        setTemplateSlug(ABC_ROOFING_TEMPLATE_SLUG);
      });
  }, []);

  const selected = useMemo(
    () =>
      templates.find((t) => t.slug === templateSlug || t.id === templateSlug) ||
      templates[0],
    [templates, templateSlug],
  );

  const definitionKey =
    selected?.definitionKey ||
    SEEDED_TEMPLATES.find((t) => t.slug === templateSlug)?.definitionKey ||
    "roofing";

  const pages = useMemo(() => {
    try {
      const business = draftBusiness({
        name,
        tagline,
        description,
        industry,
        phone,
        email,
        address,
        postcode,
        ctaLabel,
        usps,
        trust,
        hours,
        services,
        reviews,
        logoUrl,
        heroUrl,
        gallery,
      });
      return generateFromBusiness(business, definitionKey, theme);
    } catch {
      return [];
    }
  }, [
    name,
    tagline,
    description,
    industry,
    phone,
    email,
    address,
    postcode,
    ctaLabel,
    usps,
    trust,
    hours,
    services,
    reviews,
    logoUrl,
    heroUrl,
    gallery,
    definitionKey,
    theme,
  ]);

  const activePage = pages[Math.min(previewPage, Math.max(pages.length - 1, 0))];

  function loadAbc() {
    setName(ABC_ROOFING_INPUT.name);
    setTagline(ABC_ROOFING_INPUT.tagline);
    setDescription(ABC_ROOFING_INPUT.description);
    setIndustry(ABC_ROOFING_INPUT.industry);
    setPhone(ABC_ROOFING_INPUT.phone);
    setEmail(ABC_ROOFING_INPUT.email);
    setAddress(ABC_ROOFING_INPUT.address);
    setPostcode(ABC_ROOFING_INPUT.postcode);
    setCtaLabel(ABC_ROOFING_INPUT.primaryCta.label);
    setUsps(ABC_ROOFING_INPUT.usps.join("\n"));
    setTrust(ABC_ROOFING_INPUT.trustIndicators.join("\n"));
    setHours(
      Object.entries(ABC_ROOFING_INPUT.openingHours)
        .map(([day, value]) => `${day}: ${value}`)
        .join("\n"),
    );
    setServices(
      ABC_ROOFING_INPUT.services.map((s) => ({
        name: s.name,
        description: s.description || "",
      })),
    );
    setReviews(
      ABC_ROOFING_INPUT.reviews.map((r) => ({
        customerName: r.customerName,
        quote: r.quote || "",
        rating: r.rating || 5,
        source: r.source || "Google",
      })),
    );
    setTheme(ABC_ROOFING_THEME);
    setTemplateSlug(ABC_ROOFING_TEMPLATE_SLUG);
    setPanel("business");
    setPreviewPage(0);
    setError("");
  }

  async function openAbcDemo() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/websites/demo/abc", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not open ABC demo");
      const id = data.project?.id;
      if (!id) throw new Error("Demo did not return a project");
      router.push(`/admin/websites/${id}/editor`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Demo failed");
      loadAbc();
      setBusy(false);
    }
  }

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
      const result = createdData.job?.result as
        | {
            name?: string;
            tagline?: string;
            description?: string;
            phone?: string;
            email?: string;
            address?: string;
            postcode?: string;
            logoUrl?: string;
            heroUrl?: string;
            industry?: string;
          }
        | null
        | undefined;
      if (!result) {
        throw new Error("Import finished without extractable business data");
      }
      if (result.name) setName(result.name);
      if (result.tagline) setTagline(result.tagline);
      if (result.description) setDescription(result.description);
      if (result.industry) setIndustry(result.industry);
      if (result.phone) setPhone(result.phone);
      if (result.email) setEmail(result.email);
      if (result.address) setAddress(result.address);
      if (result.postcode) setPostcode(result.postcode);
      if (result.logoUrl) setLogoUrl(result.logoUrl);
      if (result.heroUrl) setHeroUrl(result.heroUrl);
      setPanel("business");
      setAnalyseStep("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analyse failed");
      setAnalyseStep("");
    } finally {
      setBusy(false);
    }
  }

  async function generate() {
    if (!name.trim()) {
      setError("Add a business name in the side panel.");
      setPanel("business");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const openingHours: Record<string, string> = {};
      hours.split("\n").forEach((line) => {
        const [day, ...rest] = line.split(":");
        if (day && rest.length) openingHours[day.trim()] = rest.join(":").trim();
      });
      const res = await fetch("/api/admin/websites/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
          usps: usps.split("\n").map((s) => s.trim()).filter(Boolean),
          trustIndicators: trust.split("\n").map((s) => s.trim()).filter(Boolean),
          services: services.filter((item) => item.name.trim()),
          reviews: reviews.filter(
            (item) => item.customerName.trim() && item.quote.trim(),
          ),
          media: gallery
            .filter(Boolean)
            .map((url) => ({ kind: "gallery", url, alt: name })),
          website: sourceUrl,
          templateId: selected?.slug || selected?.id || ABC_ROOFING_TEMPLATE_SLUG,
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
    <div className="create-canvas flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#0c0c0e] text-[#f2f2f3]">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/[0.08] px-4 py-3">
        <div className="flex min-w-0 items-center gap-4">
          <Link
            href="/admin/websites"
            className="text-[0.8rem] text-white/45 underline-offset-2 hover:text-white hover:underline"
          >
            Sites
          </Link>
          <div className="min-w-0">
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-white/35">
              New website
            </p>
            <p className="truncate text-[0.95rem] tracking-[-0.02em] text-white">
              {name || "Blank canvas"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={loadAbc}
            className="rounded-full border border-white/15 px-3 py-1.5 text-[0.8rem] text-white/70 hover:text-white"
          >
            Fill ABC
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void openAbcDemo()}
            className="rounded-full border border-white/15 px-3 py-1.5 text-[0.8rem] text-white/70 hover:text-white disabled:opacity-40"
          >
            Open ABC example
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void generate()}
            className="rounded-full bg-white px-4 py-1.5 text-[0.85rem] text-[#0d1730] disabled:opacity-40"
          >
            {busy ? "Working…" : "Generate & edit"}
          </button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[52px_minmax(260px,320px)_minmax(0,1fr)]">
        <nav className="hidden flex-col items-center gap-1 border-r border-white/[0.08] py-3 lg:flex">
          {PANELS.map((item) => (
            <button
              key={item.id}
              type="button"
              title={item.label}
              onClick={() => setPanel(item.id)}
              className={`flex h-10 w-10 items-center justify-center rounded-lg text-[0.65rem] uppercase tracking-[0.08em] ${
                panel === item.id
                  ? "bg-white text-[#0d1730]"
                  : "text-white/40 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              {item.label.slice(0, 1)}
            </button>
          ))}
        </nav>

        <aside className="min-h-0 overflow-y-auto border-r border-white/[0.08] bg-[#141416] p-4">
          <div className="mb-4 flex flex-wrap gap-1 lg:hidden">
            {PANELS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPanel(item.id)}
                className={`rounded-full px-3 py-1 text-[0.75rem] ${
                  panel === item.id
                    ? "bg-white text-[#0d1730]"
                    : "text-white/45"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <p className="mb-4 text-[0.65rem] uppercase tracking-[0.18em] text-white/35">
            {PANELS.find((p) => p.id === panel)?.label}
          </p>

          {error ? (
            <p className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {error}
            </p>
          ) : null}

          {panel === "business" ? (
            <div className="space-y-4">
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
              <Field label="Address" value={address} onChange={setAddress} />
              <Field label="Postcode" value={postcode} onChange={setPostcode} />
              <Field label="CTA label" value={ctaLabel} onChange={setCtaLabel} />
              <Field
                label="Opening hours"
                value={hours}
                onChange={setHours}
                textarea
              />
              <ImageUpload
                label="Logo"
                value={logoUrl}
                owner="factory/draft"
                onChange={setLogoUrl}
              />
              <ImageUpload
                label="Hero"
                value={heroUrl}
                owner="factory/draft"
                onChange={setHeroUrl}
              />
            </div>
          ) : null}

          {panel === "proof" ? (
            <div className="space-y-4">
              <Field
                label="USPs (one per line)"
                value={usps}
                onChange={setUsps}
                textarea
              />
              <Field
                label="Trust lines"
                value={trust}
                onChange={setTrust}
                textarea
              />
              {services.map((service, index) => (
                <div key={index} className="space-y-2 border-b border-white/10 pb-4">
                  <Field
                    label={`Service ${index + 1}`}
                    value={service.name}
                    onChange={(value) =>
                      setServices((current) =>
                        current.map((item, i) =>
                          i === index ? { ...item, name: value } : item,
                        ),
                      )
                    }
                  />
                  <Field
                    label="Description"
                    value={service.description}
                    onChange={(value) =>
                      setServices((current) =>
                        current.map((item, i) =>
                          i === index ? { ...item, description: value } : item,
                        ),
                      )
                    }
                    textarea
                  />
                </div>
              ))}
              {reviews.map((review, index) => (
                <div key={index} className="space-y-2">
                  <Field
                    label="Reviewer"
                    value={review.customerName}
                    onChange={(value) =>
                      setReviews((current) =>
                        current.map((item, i) =>
                          i === index ? { ...item, customerName: value } : item,
                        ),
                      )
                    }
                  />
                  <Field
                    label="Quote"
                    value={review.quote}
                    onChange={(value) =>
                      setReviews((current) =>
                        current.map((item, i) =>
                          i === index ? { ...item, quote: value } : item,
                        ),
                      )
                    }
                    textarea
                  />
                </div>
              ))}
              {gallery.map((url, index) => (
                <ImageUpload
                  key={index}
                  label={`Gallery ${index + 1}`}
                  value={url}
                  owner="factory/draft"
                  onChange={(value) =>
                    setGallery((current) =>
                      current.map((item, i) => (i === index ? value : item)),
                    )
                  }
                />
              ))}
            </div>
          ) : null}

          {panel === "template" ? (
            <div className="grid gap-2">
              {templates.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setTemplateSlug(item.slug || item.id);
                    setPreviewPage(0);
                  }}
                  className={`rounded-xl border p-3 text-left ${
                    (selected?.id === item.id || selected?.slug === item.slug)
                      ? "border-white bg-white/[0.08]"
                      : "border-white/10 hover:border-white/25"
                  }`}
                >
                  <p className="text-[0.65rem] uppercase tracking-[0.14em] text-white/40">
                    {item.industry}
                  </p>
                  <p className="mt-1 text-sm text-white">{item.name}</p>
                  <p className="mt-1 text-xs text-white/40">
                    {item.pagesCount} pages
                  </p>
                </button>
              ))}
            </div>
          ) : null}

          {panel === "theme" ? (
            <div className="space-y-4">
              {(
                [
                  ["primary", "Primary"],
                  ["secondary", "Secondary"],
                  ["accent", "Accent"],
                  ["background", "Background"],
                  ["foreground", "Foreground"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="block text-sm text-white/45">
                  {label}
                  <input
                    type="color"
                    value={theme[key]}
                    onChange={(event) =>
                      setTheme((current) => ({
                        ...current,
                        [key]: event.target.value,
                      }))
                    }
                    className="mt-1 h-10 w-full cursor-pointer rounded-lg border border-white/10 bg-transparent"
                  />
                </label>
              ))}
            </div>
          ) : null}

          {panel === "source" ? (
            <div className="space-y-4">
              <Field
                label="Existing website URL"
                value={sourceUrl}
                onChange={setSourceUrl}
              />
              <button
                type="button"
                disabled={busy || !sourceUrl.trim()}
                onClick={() => void analyse()}
                className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 disabled:opacity-40"
              >
                {busy && analyseStep ? analyseStep : "Analyse website"}
              </button>
              <fieldset className="space-y-2 text-sm text-white/50">
                <legend className="text-white">Mode</legend>
                {(["preserve", "rebuild", "rewrite"] as const).map((item) => (
                  <label key={item} className="block">
                    <input
                      type="radio"
                      name="mode"
                      checked={mode === item}
                      onChange={() => setMode(item)}
                    />{" "}
                    {item}
                  </label>
                ))}
              </fieldset>
            </div>
          ) : null}
        </aside>

        <section className="relative min-h-0 overflow-hidden bg-[#cfcfd4]">
          <div className="absolute inset-x-0 top-0 z-10 flex items-center gap-2 border-b border-black/10 bg-[#cfcfd4]/90 px-3 py-2 backdrop-blur">
            {pages.map((page, index) => (
              <button
                key={page.slug}
                type="button"
                onClick={() => setPreviewPage(index)}
                className={`rounded-full px-3 py-1 text-[0.75rem] ${
                  previewPage === index
                    ? "bg-[#0d1730] text-white"
                    : "text-[#0d1730]/60 hover:text-[#0d1730]"
                }`}
              >
                {page.title}
              </button>
            ))}
            {!pages.length ? (
              <p className="text-[0.8rem] text-[#0d1730]/50">
                Start typing in the side panel — the canvas updates live.
              </p>
            ) : null}
          </div>
          <div className="h-full overflow-y-auto pt-12">
            {activePage?.draftData ? (
              <div
                className="factory-site mx-auto min-h-full max-w-5xl bg-white shadow-sm"
                style={themeStyle(theme) as CSSProperties}
              >
                <SiteRender data={activePage.draftData} />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center px-8 text-center">
                <div>
                  <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[#0d1730]/40">
                    Canvas
                  </p>
                  <h2 className="mt-3 text-[clamp(1.75rem,4vw,2.75rem)] font-normal tracking-[-0.04em] text-[#0d1730]">
                    Blank site
                  </h2>
                  <p className="mx-auto mt-3 max-w-sm text-[0.95rem] font-light text-[#0d1730]/55">
                    Fill ABC Roofing, pick a template, or enter the business in
                    the side panel. Generate opens Studio.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
