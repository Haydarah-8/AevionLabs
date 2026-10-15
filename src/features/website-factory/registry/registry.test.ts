import { describe, expect, it } from "vitest";
import { factoryConfig } from "@/features/website-factory/puck/config";
import {
  getAevionComponent,
  listAevionCategories,
  listAevionComponents,
  listAevionComponentTypes,
  listComponentSchemas,
  componentDocumentationMarkdown,
  registryStats,
  resetAevionRegistryCache,
} from "@/features/website-factory/registry";

describe("aevion component registry", () => {
  it("includes every puck component type", () => {
    resetAevionRegistryCache();
    const puckTypes = Object.keys(
      (factoryConfig.components || {}) as Record<string, unknown>,
    );
    const registryTypes = new Set(listAevionComponentTypes());
    expect(registryTypes.size).toBe(puckTypes.length);
    for (const type of puckTypes) {
      expect(registryTypes.has(type)).toBe(true);
      expect(getAevionComponent(type)?.type).toBe(type);
    }
  });

  it("exposes categories and schemas for mcp/api", () => {
    resetAevionRegistryCache();
    const cats = listAevionCategories();
    expect(cats.length).toBeGreaterThan(3);
    expect(cats.some((c) => c.id === "sections")).toBe(true);
    const schemas = listComponentSchemas();
    expect(schemas[0]).toHaveProperty("fields");
    expect(schemas[0]).toHaveProperty("category");
    expect(schemas[0]).toHaveProperty("engines");
  });

  it("builds documentation markdown", () => {
    const md = componentDocumentationMarkdown("Hero");
    expect(md).toContain("# ");
    expect(md).toContain("Purpose");
    expect(md).toContain("`Hero`");
  });

  it("reports registry stats", () => {
    const stats = registryStats();
    expect(stats.total).toBe(listAevionComponents().length);
    expect(stats.total).toBeGreaterThan(50);
  });
});
