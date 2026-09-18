import { describe, expect, it } from "vitest";
import {
  MCP_TOOLS,
  MCP_RESOURCES,
  executeMcpTool,
} from "../integrations/mcp-server";
import { SKILL_PACKAGES } from "../developer/skills-packages";
import { COMPONENT_META } from "../puck/meta";
import { factoryConfig } from "../puck/config";

describe("MCP resources", () => {
  it("lists resources and tools agree with docs surfaces", async () => {
    const uris = MCP_RESOURCES.map((r) => r.uri);
    expect(uris).toContain("aevion://components");
    expect(uris).toContain("aevion://tools");
    expect(uris).toContain("aevion://openapi");
    expect(uris).toContain("aevion://tokens");

    const scopes = new Set(["mcp:use", "websites:read", "pages:read"]);
    const resources = await executeMcpTool({
      name: "listResources",
      scopes,
    });
    expect(resources).toEqual(MCP_RESOURCES);

    const tools = await executeMcpTool({ name: "listTools", scopes });
    expect(Array.isArray(tools)).toBe(true);
    expect((tools as unknown[]).length).toBe(MCP_TOOLS.length);

    const components = await executeMcpTool({
      name: "readResource",
      arguments: { uri: "aevion://components" },
      scopes,
    });
    expect(Array.isArray(components)).toBe(true);
  });

  it("ships createWebsite, exportWebsite, approveImport, theme, assets, components", () => {
    const names = new Set(MCP_TOOLS.map((t) => t.name as string));
    for (const needed of [
      "createWebsite",
      "exportWebsite",
      "getTheme",
      "updateTheme",
      "listAssets",
      "listComponents",
      "addComponent",
      "updateComponent",
      "removeComponent",
      "moveComponent",
      "approveImport",
      "listResources",
      "readResource",
    ]) {
      expect(names.has(needed)).toBe(true);
    }
  });
});

describe("skill packages", () => {
  it("includes ZIP file maps for all five packages", () => {
    expect(SKILL_PACKAGES.map((p) => p.id).sort()).toEqual(
      ["api", "deployment", "mcp", "scraper", "website-builder"].sort(),
    );
    for (const pkg of SKILL_PACKAGES) {
      expect(pkg.files["SKILL.md"]).toBeTruthy();
      expect(pkg.files["metadata.json"]).toBeTruthy();
    }
  });
});

describe("new blocks registered", () => {
  it("registers Phase A components in puck config + meta", () => {
    const components = factoryConfig.components as Record<string, unknown>;
    for (const name of [
      "MobileNavbar",
      "MinimalHero",
      "ImageText",
      "FeatureGrid",
      "ServiceCard",
      "Projects",
      "ProjectCard",
      "TeamMember",
      "Certifications",
      "Awards",
      "BookingCTA",
      "QuoteForm",
      "Newsletter",
    ]) {
      expect(components[name]).toBeTruthy();
      expect(COMPONENT_META[name]).toBeTruthy();
    }
  });
});
