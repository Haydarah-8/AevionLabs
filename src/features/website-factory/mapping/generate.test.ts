import { describe, expect, it } from "vitest";
import { generateFromBusiness } from "./generate";
import { DEFAULT_THEME, type Business } from "../types";

const business: Business = {
  id: "b1",
  name: "ABC Roofing",
  slug: "abc-roofing",
  tagline: "Roof work you can inspect.",
  description: "Repairs and replacements in Manchester.",
  industry: "Roofing",
  logoUrl: "",
  faviconUrl: "",
  heroUrl: "",
  phone: "0161 000 0000",
  email: "hello@abc.example",
  website: "",
  address: "Manchester",
  postcode: "M1 1AA",
  openingHours: {},
  social: {},
  yearsInBusiness: 12,
  certifications: [],
  awards: [],
  primaryCta: { label: "Get a quote", href: "/contact" },
  secondaryCta: { label: "", href: "" },
  usps: ["Insured"],
  trustIndicators: ["12 years"],
  prospectLabel: "",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  services: [
    {
      id: "s",
      businessId: "b1",
      name: "Repairs",
      description: "Leaks.",
      imageUrl: "",
      sortOrder: 0,
    },
  ],
  team: [],
  reviews: [],
  media: [],
};

describe("generateFromBusiness", () => {
  it("maps roofing to puck pages without inventing reviews", () => {
    const pages = generateFromBusiness(business, "roofing", DEFAULT_THEME);
    expect(pages.map((page) => page.slug)).toEqual([
      "home",
      "about",
      "services",
      "projects",
      "contact",
    ]);
    const home = pages[0].draftData.content;
    expect(home.some((node) => node.type === "Hero")).toBe(true);
    expect(home.some((node) => node.type === "Navbar")).toBe(true);
    const hero = home.find((node) => node.type === "Hero");
    expect(hero?.props.heading).toBe("Roof work you can inspect.");
  });

  it("builds construction and dental templates", () => {
    expect(
      generateFromBusiness(business, "construction").length,
    ).toBeGreaterThan(3);
    expect(
      generateFromBusiness(business, "dental").some(
        (page) => page.slug === "treatments",
      ),
    ).toBe(true);
    expect(
      generateFromBusiness(business, "landscaping").some(
        (page) => page.slug === "gallery",
      ),
    ).toBe(true);
  });
});
