import { describe, expect, it } from "vitest";
import { listScrapeImports, saveScrapeImport } from "../cms/scrape-cms";
import type { IntelligenceResult } from "./types";

const sample: IntelligenceResult = {
  sourceUrl: "https://example.com/",
  name: "Example Co",
  tagline: "Demo",
  description: "A demo business",
  phone: "",
  email: "hi@example.com",
  address: "",
  postcode: "",
  logoUrl: "",
  faviconUrl: "",
  heroUrl: "",
  social: {},
  brandColors: ["#111111"],
  services: [
    {
      name: "Consulting",
      description: "Advice",
      imageUrl: "",
      include: true,
    },
  ],
  reviews: [],
  pages: [
    {
      url: "https://example.com/",
      title: "Home",
      type: "home",
      heading: "Hello",
      excerpt: "Welcome",
      body: "Body",
      include: true,
    },
  ],
  images: [],
  provenance: [
    {
      sourceUrl: "https://example.com/",
      sourcePage: "https://example.com/",
      importedAt: new Date().toISOString(),
      contentType: "home",
    },
  ],
  robotsAllowed: true,
  engine: "test",
};

describe("scrape CMS", () => {
  it("stores and lists scrape imports", async () => {
    const saved = await saveScrapeImport({
      projectId: "00000000-0000-4000-8000-000000000099",
      sourceUrl: sample.sourceUrl,
      result: sample,
    });
    expect(saved.title).toBe("Example Co");
    expect(saved.pageCount).toBe(1);
    const listed = await listScrapeImports(
      "00000000-0000-4000-8000-000000000099",
    );
    expect(listed.some((item) => item.id === saved.id)).toBe(true);
  });
});
