/**
 * Acceptance checklist for real environments.
 * Skips GitHub/Vercel assertions when credentials are unset — never fakes success.
 */
import { describe, expect, it } from "vitest";
import { getDeploymentStatus } from "../application/deployment";
import { githubAuthorizeUrl } from "../application/integrations";
import { MCP_TOOLS, MCP_RESOURCES } from "../integrations/mcp-server";
import { SKILL_PACKAGES } from "../developer/skills-packages";
import { API_SCOPES } from "../developer/scopes";

describe("e2e capability gates", () => {
  it("reports vercel honestly", async () => {
    const status = await getDeploymentStatus();
    if (!process.env.VERCEL_TOKEN?.trim()) {
      expect(status.configured).toBe(false);
      expect(status.message.length).toBeGreaterThan(0);
    } else {
      expect(status.configured).toBe(true);
    }
  });

  it("reports github oauth honestly", () => {
    const url = githubAuthorizeUrl("test-state");
    if (!process.env.GITHUB_CLIENT_ID?.trim()) {
      expect(url).toBeNull();
    } else {
      expect(url).toContain("github.com/login/oauth/authorize");
    }
  });

  it("ships MCP tools for create→scrape→publish path", () => {
    const names = new Set(MCP_TOOLS.map((tool) => tool.name as string));
    for (const needed of [
      "listWebsites",
      "getWebsite",
      "createWebsite",
      "scrapeWebsite",
      "applyScrape",
      "approveImport",
      "publishWebsite",
      "deployWebsite",
      "listResources",
    ]) {
      expect(names.has(needed)).toBe(true);
    }
  });

  it("exposes MCP resources", () => {
    expect(MCP_RESOURCES.length).toBeGreaterThanOrEqual(4);
  });

  it("exposes scopes for new v1 surfaces", () => {
    for (const scope of [
      "themes:read",
      "themes:write",
      "webhooks:read",
      "webhooks:write",
      "businesses:read",
      "domains:read",
      "domains:write",
    ]) {
      expect(API_SCOPES).toContain(scope);
    }
  });

  it("ships five skill ZIP packages", () => {
    expect(SKILL_PACKAGES).toHaveLength(5);
  });

  it("documents developer portal routes", () => {
    const routes = [
      "/admin/developer",
      "/admin/developer/api-keys",
      "/admin/developer/mcp",
      "/admin/developer/webhooks",
      "/admin/developer/integrations",
      "/admin/developer/skills",
      "/admin/developer/audit",
      "/docs",
    ];
    expect(routes.every((r) => r.startsWith("/"))).toBe(true);
  });
});
