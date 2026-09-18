import { describe, expect, it } from "vitest";
import { buildAevionSkillMarkdown } from "./skills";

describe("skills package", () => {
  it("documents shipped surfaces only", () => {
    const md = buildAevionSkillMarkdown();
    expect(md).toContain("/api/v1/websites");
    expect(md).toContain("/api/mcp");
    expect(md).toContain("ae_live_");
  });
});
