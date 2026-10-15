import { describe, expect, it } from "vitest";
import {
  createEmptyCollection,
  listCollections,
  seedCollectionsFromBusiness,
  upsertCollection,
} from "./collections";
import { applyFieldBinds, resolveBindPath, setFieldBind } from "./bindings";
import { CMS_PROP } from "./types";
import type { Business } from "../types";

const business = {
  id: "b1",
  name: "Acme",
  slug: "acme",
  tagline: "We build",
  description: "",
  industry: "",
  logoUrl: "",
  faviconUrl: "",
  heroUrl: "",
  phone: "555",
  email: "a@b.c",
  website: "",
  address: "",
  postcode: "",
  openingHours: {},
  social: {},
  yearsInBusiness: null,
  certifications: [],
  awards: [],
  primaryCta: { label: "", href: "" },
  secondaryCta: { label: "", href: "" },
  usps: [],
  trustIndicators: [],
  prospectLabel: "",
  createdAt: "",
  updatedAt: "",
  services: [
    {
      id: "s1",
      businessId: "b1",
      name: "Plumbing",
      description: "Pipes",
      imageUrl: "/a.jpg",
      sortOrder: 0,
    },
  ],
  team: [],
  reviews: [],
  media: [],
} satisfies Business;

describe("collections", () => {
  it("seeds system collections from business", () => {
    const cols = seedCollectionsFromBusiness(business);
    expect(cols.some((c) => c.slug === "services")).toBe(true);
    const services = cols.find((c) => c.slug === "services")!;
    expect(services.entries[0]!.values.name).toBe("Plumbing");
  });

  it("upserts custom collections on siteConfig", () => {
    const created = createEmptyCollection({ name: "Blog" });
    const next = upsertCollection(
      {
        stickyHeader: true,
        announcement: "",
        navCta: { label: "", href: "" },
        footerNote: "",
      },
      created,
    );
    expect(listCollections(next)).toHaveLength(1);
    expect(listCollections(next)[0]!.slug).toBe("blog");
  });
});

describe("bindings", () => {
  it("resolves business and collection paths", () => {
    const cols = seedCollectionsFromBusiness(business);
    const ctx = { collections: cols, business, entry: null };
    expect(resolveBindPath("business.name", ctx)).toBe("Acme");
    expect(resolveBindPath("services.0.name", ctx)).toBe("Plumbing");
    expect(resolveBindPath("collections.services.0.description", ctx)).toBe(
      "Pipes",
    );
  });

  it("applies _binds onto props", () => {
    const cols = seedCollectionsFromBusiness(business);
    const props = setFieldBind(
      { heading: "Fallback" },
      "heading",
      "business.name",
    );
    expect(props[CMS_PROP.binds]).toEqual({ heading: "business.name" });
    const resolved = applyFieldBinds(props, {
      collections: cols,
      business,
    });
    expect(resolved.heading).toBe("Acme");
  });

  it("resolves relative binds from entry context", () => {
    const cols = seedCollectionsFromBusiness(business);
    const entry = cols.find((c) => c.slug === "services")!.entries[0]!;
    expect(
      resolveBindPath("name", { collections: cols, entry, business }),
    ).toBe("Plumbing");
  });
});
