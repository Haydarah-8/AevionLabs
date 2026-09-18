import type { BusinessInput } from "../services/schemas";
import { DEFAULT_THEME } from "../types";

/** Canonical ABC Roofing demo used for generate + canvas seed. */
export const ABC_ROOFING_ID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
export const ABC_ROOFING_SLUG = "abc-roofing";
export const ABC_ROOFING_TEMPLATE_SLUG = "roofing-premium";

export const ABC_ROOFING_INPUT: BusinessInput = {
  name: "ABC Roofing",
  slug: ABC_ROOFING_SLUG,
  industry: "Roofing",
  tagline: "Roof work you can inspect.",
  description:
    "ABC Roofing repairs, replaces, and surveys domestic and small commercial roofs in Manchester. The crew on site is the crew you were quoted.",
  phone: "0161 000 0000",
  email: "hello@abc-roofing.example",
  address: "Manchester",
  postcode: "M1 1AA",
  website: "",
  logoUrl: "",
  faviconUrl: "",
  heroUrl: "",
  openingHours: {
    Monday: "8am–5pm",
    Tuesday: "8am–5pm",
    Wednesday: "8am–5pm",
    Thursday: "8am–5pm",
    Friday: "8am–5pm",
  },
  social: {},
  yearsInBusiness: 12,
  certifications: [],
  awards: [],
  primaryCta: { label: "Get a quote", href: "/contact" },
  secondaryCta: { label: "Call us", href: "tel:01610000000" },
  usps: ["Fully insured", "Written quotes", "Photos of the work"],
  trustIndicators: ["12 years trading", "Local crew", "No subcontracted surprise"],
  prospectLabel: "Homeowners & small commercial",
  services: [
    {
      name: "Roof replacement",
      description: "A full strip and relay, written down before we start.",
      imageUrl: "",
    },
    {
      name: "Repairs",
      description: "Leaks, slipped slates, and leadwork that actually holds.",
      imageUrl: "",
    },
    {
      name: "Surveys",
      description: "We look at the roof. You get the photos.",
      imageUrl: "",
    },
  ],
  team: [],
  reviews: [
    {
      customerName: "J. Khan",
      quote:
        "They showed up, did the work they priced, and left the loft dry.",
      rating: 5,
      source: "Google",
    },
  ],
  media: [],
};

export const ABC_ROOFING_THEME = {
  ...DEFAULT_THEME,
  primary: "#1a2744",
  secondary: "#5c6b7a",
  accent: "#c45c26",
  background: "#f7f5f2",
  foreground: "#141414",
};
