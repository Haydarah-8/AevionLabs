import type { Business, PuckData, PuckNode, ThemeTokens } from "../types";
import { DEFAULT_THEME } from "../types";
import { getTemplateDefinition, type TemplateDefinition } from "../templates";

function nid() {
  return crypto.randomUUID();
}

function hoursText(hours: Record<string, string>) {
  const lines = Object.entries(hours)
    .filter(([, value]) => value)
    .map(([day, value]) => `${day}: ${value}`);
  return lines.join(" · ");
}

function node(type: string, props: Record<string, unknown>): PuckNode {
  return { type, props: { id: nid(), ...props } };
}

function hrefFor(slug: string) {
  if (slug === "home") return "/";
  return `/${slug}`;
}

export function generatePages(
  business: Business,
  definition: TemplateDefinition,
  theme: ThemeTokens = DEFAULT_THEME,
) {
  const nav = definition.pages
    .filter((page) => page.showInNav)
    .map((page) => ({ label: page.navLabel, href: hrefFor(page.slug) }));
  const gallery = business.media
    .filter((item) => item.kind === "gallery" || item.kind === "project")
    .map((item) => ({ url: item.url, alt: item.alt }));
  if (business.heroUrl && !gallery.length) {
    gallery.push({ url: business.heroUrl, alt: business.name });
  }
  const services = (business.services.length
    ? business.services
    : [{ name: "General work", description: business.description, imageUrl: "" }]
  ).map((item) => ({
    title: item.name,
    body: item.description,
    imageUrl: item.imageUrl,
  }));
  const reviews = business.reviews.map((item) => ({
    quote: item.quote,
    name: item.customerName,
    rating: item.rating,
    source: item.source,
  }));
  const team = business.team.map((item) => ({
    name: item.name,
    role: item.role,
    photoUrl: item.photoUrl,
    bio: item.bio,
  }));
  const trust = (business.trustIndicators.length
    ? business.trustIndicators
    : [business.yearsInBusiness ? `${business.yearsInBusiness} years` : "", ...business.certifications]
  )
    .filter(Boolean)
    .map((label) => ({ label }));
  const areaItems = [
    ...(business.address ? [business.address.split(",").pop()?.trim() || ""] : []),
    ...business.usps.filter((item) => /area|cover|serve/i.test(item)),
  ]
    .filter(Boolean)
    .map((label) => ({ label }));

  const contactHref = "/contact";
  const primary = business.primaryCta.label
    ? business.primaryCta
    : { label: "Contact", href: contactHref };

  const shared = {
    Navbar: {
      name: business.name,
      logoUrl: business.logoUrl,
      homeHref: "/",
      sticky: "yes",
      ctaLabel: primary.label,
      ctaHref: primary.href || contactHref,
      links: nav,
    },
    AnnouncementBar: {
      text: business.tagline,
    },
    Footer: {
      name: business.name,
      note: business.tagline,
      phone: business.phone,
      email: business.email,
    },
    CTA: {
      heading: primary.label || "Talk to us",
      description: business.phone || business.email,
      label: primary.label || "Contact",
      href: primary.href || contactHref,
    },
    Hero: {
      eyebrow: definition.heroEyebrow,
      heading: business.tagline || business.name,
      description: business.description,
      primaryLabel: primary.label,
      primaryHref: primary.href || contactHref,
      secondaryLabel: business.secondaryCta.label,
      secondaryHref: business.secondaryCta.href || "/about",
      imageUrl: business.heroUrl,
      imageAlt: business.name,
    },
    PageHero: {
      heading: "",
      description: business.tagline,
    },
    TrustIndicators: { items: trust },
    Services: {
      heading: definition.servicesHeading,
      description: business.description,
      items: services,
      ctaLabel: "See services",
      ctaHref: "/services",
    },
    AboutSection: {
      heading: business.name,
      body: business.description,
      imageUrl: business.heroUrl,
    },
    Gallery: { heading: "Recent work", items: gallery },
    Testimonials: { heading: "Reviews", items: reviews },
    Process: { heading: "How we work", items: definition.process },
    AreasServed: { heading: "Areas served", items: areaItems },
    TeamSection: { heading: "People", items: team },
    FAQ: { heading: "Questions", items: definition.faqs },
    ContactSection: {
      heading: "Get in touch",
      phone: business.phone,
      email: business.email,
      address: [business.address, business.postcode].filter(Boolean).join(", "),
      hours: hoursText(business.openingHours),
    },
    Stats: {
      heading: "In figures",
      items: [
        business.yearsInBusiness ? { label: "Years", value: String(business.yearsInBusiness) } : null,
        business.services.length ? { label: "Services", value: String(business.services.length) } : null,
        business.reviews.length ? { label: "Reviews", value: String(business.reviews.length) } : null,
      ].filter(Boolean),
    },
    Pricing: {
      heading: "Work",
      items: services.map((item) => ({ name: item.title, body: item.body, price: "" })),
    },
    LogoCloud: { heading: "Marks we can show", items: gallery.slice(0, 4) },
    MapEmbed: { address: [business.address, business.postcode].filter(Boolean).join(", ") },
    SocialLinks: {
      items: Object.entries(business.social).map(([label, href]) => ({ label, href })),
    },
    Breadcrumbs: {
      items: [
        { label: "Home", href: "/" },
        { label: business.name, href: "/" },
      ],
    },
    BlogGrid: { heading: "Writing", items: [] },
    BeforeAfter: {
      heading: "A job",
      beforeUrl: gallery[0]?.url,
      afterUrl: gallery[1]?.url || gallery[0]?.url,
    },
  } as Record<string, Record<string, unknown>>;

  void theme;

  return definition.pages.map((page, index) => {
    const content = page.sections.map((section) => {
      const base: Record<string, unknown> = {
        ...(shared[section.type as keyof typeof shared] ?? {}),
      };
      if (section.type === "PageHero") {
        base.heading = page.title;
      }
      if (section.type === "Services" && page.slug === "menu") {
        base.heading = "Menu";
        base.ctaHref = "/contact";
      }
      return node(section.type, { ...base, ...(section.defaults ?? {}) });
    });
    const data: PuckData = {
      root: { props: { title: `${page.title} · ${business.name}` } },
      content,
    };
    return {
      slug: page.slug,
      title: page.title,
      navLabel: page.navLabel,
      showInNav: page.showInNav,
      navOrder: index,
      draftData: data,
    };
  });
}

export function generateFromBusiness(
  business: Business,
  definitionKey: string,
  theme?: ThemeTokens,
) {
  const definition = getTemplateDefinition(definitionKey);
  return generatePages(business, definition, theme);
}
