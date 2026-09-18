import { describe, expect, it } from "vitest";
import { createScrapeJob, getScrapeJob, runScrapeJob } from "./jobs";

describe("scrape job persistence", () => {
  it("creates a queued job that can be loaded back", async () => {
    const job = await createScrapeJob("https://example.com/", "proj-test");
    expect(job.status).toBe("queued");
    const loaded = await getScrapeJob(job.id);
    expect(loaded?.id).toBe(job.id);
    expect(loaded?.url).toContain("example.com");
  });

  it("marks unreachable public hosts as failed instead of hanging", async () => {
    const job = await createScrapeJob(
      "https://example.invalid/",
      "proj-test-fail",
    );
    const done = await runScrapeJob(job.id);
    expect(done?.status).toBe("failed");
    expect(done?.error || "").toMatch(
      /could not|failed|reach|extract|ENOTFOUND|fetch/i,
    );
  }, 20_000);
});
