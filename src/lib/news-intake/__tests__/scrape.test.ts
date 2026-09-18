import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  parseStrategicalBriefing,
  parseXinhuaArticle,
  parseXinhuaHomepage,
} from "@/lib/news-intake/scrape";

const fixtures = path.join(
  process.cwd(),
  "src/lib/news-intake/__tests__/fixtures",
);

describe("scrape parsers", () => {
  it("parses Strategical briefing listing titles and dates", () => {
    const html = fs.readFileSync(
      path.join(fixtures, "strategical-briefing.html"),
      "utf8",
    );
    const items = parseStrategicalBriefing(html);
    expect(items.length).toBeGreaterThan(5);
    const ankara = items.find((item) =>
      item.url.includes("ankara-turns-alliance-spending-pledges"),
    );
    expect(ankara?.title).toContain("Ankara turns alliance spending pledges");
    expect(ankara?.publishedAt).toMatch(/^2026-/);
  });

  it("parses Xinhua homepage article links", () => {
    const html = fs.readFileSync(
      path.join(fixtures, "xinhua-home.html"),
      "utf8",
    );
    const items = parseXinhuaHomepage(html);
    expect(items.length).toBeGreaterThan(5);
    expect(items.some((item) => item.title.includes("commercial space"))).toBe(
      true,
    );
  });

  it("parses Xinhua article metadata", () => {
    const html = fs.readFileSync(
      path.join(fixtures, "xinhua-article.html"),
      "utf8",
    );
    const parsed = parseXinhuaArticle(
      html,
      "https://english.news.cn/20260814/83aa986b27874e81806704f6a299c3e6/c.html",
    );
    expect(parsed.title).toContain("commercial space industry");
    expect(parsed.publishedAt).toMatch(/^2026-08-14/);
  });
});
