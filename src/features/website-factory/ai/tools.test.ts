import { describe, expect, it } from "vitest";
import { planFromPrompt, applyToolCalls } from "./tools";
import { emptyPuck, DEFAULT_THEME, type ProjectBundle } from "../types";

const bundle = {
  project: {
    id: "p",
    businessId: "b",
    templateId: "t",
    name: "ABC",
    slug: "abc",
    status: "ready",
    theme: DEFAULT_THEME,
    siteConfig: {
      stickyHeader: true,
      announcement: "",
      navCta: { label: "", href: "" },
      footerNote: "",
    },
    seoConfig: {
      title: "ABC",
      description: "Roofing",
      ogImage: "",
      robots: "index,follow",
    },
    subdomain: null,
    customDomain: null,
    deploymentStatus: "idle",
    deploymentProvider: "",
    deploymentUrl: "",
    publishedVersionId: null,
    createdAt: "",
    updatedAt: "",
    publishedAt: null,
  },
  business: {
    id: "b",
    name: "ABC Roofing",
    slug: "abc",
    tagline: "Inspectable work",
    description: "Roofs.",
    industry: "Roofing",
    logoUrl: "",
    faviconUrl: "",
    heroUrl: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    postcode: "",
    openingHours: {},
    social: {},
    yearsInBusiness: null,
    certifications: [],
    awards: [],
    primaryCta: { label: "Quote", href: "/contact" },
    secondaryCta: { label: "", href: "" },
    usps: [],
    trustIndicators: [],
    prospectLabel: "",
    createdAt: "",
    updatedAt: "",
    services: [],
    team: [],
    reviews: [
      {
        id: "r",
        businessId: "b",
        customerName: "J",
        quote: "Dry loft.",
        rating: 5,
        source: "Google",
        sortOrder: 0,
      },
    ],
    media: [],
  },
  template: {
    id: "t",
    slug: "roofing",
    name: "Roofing",
    industry: "Roofing",
    description: "",
    thumbnailUrl: "",
    version: 1,
    definitionKey: "roofing",
    pagesCount: 5,
    configuration: {},
    duplicatedFrom: null,
    active: true,
  },
  pages: [],
  versions: [],
  deployments: [],
  domains: [],
} as unknown as ProjectBundle;

describe("AI tools", () => {
  it("plans a testimonial insert from a prompt", () => {
    const plan = planFromPrompt(
      "Add a testimonial section after services",
      bundle,
    );
    expect(plan.calls[0]?.name).toBe("addComponent");
    const next = applyToolCalls(
      bundle,
      { ...emptyPuck(), content: [{ type: "Services", props: { id: "s" } }] },
      plan.calls,
    );
    expect(next.data.content.some((node) => node.type === "Testimonials")).toBe(
      true,
    );
  });
});
