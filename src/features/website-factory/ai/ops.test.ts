import { describe, expect, it } from "vitest";
import {
  analyzeAiPlan,
  describeCall,
  isDestructiveCall,
  requiresDestructiveConfirm,
} from "./ops";

describe("AI ops analysis", () => {
  it("flags removeComponent as destructive and builds confirm copy", () => {
    const analysis = analyzeAiPlan({
      explanation: "Remove testimonials",
      destructive: false,
      calls: [{ name: "removeComponent", args: { type: "Testimonials" } }],
    });
    expect(analysis.destructive).toBe(true);
    expect(analysis.plan.destructive).toBe(true);
    expect(analysis.confirmMessage).toMatch(/Testimonials/);
    expect(requiresDestructiveConfirm(analysis.plan)).toBe(true);
  });

  it("rejects unknown tools and unknown component types", () => {
    const analysis = analyzeAiPlan({
      explanation: "Nope",
      calls: [
        { name: "deleteEverything", args: {} },
        { name: "addComponent", args: { type: "NotARealBlock" } },
      ],
    });
    expect(analysis.writableCalls).toHaveLength(0);
    expect(analysis.errors.some((e) => /Unknown tool/.test(e))).toBe(true);
    expect(analysis.errors.some((e) => /Unknown component/.test(e))).toBe(true);
  });

  it("keeps safe addComponent plans non-destructive", () => {
    const analysis = analyzeAiPlan({
      explanation: "Add FAQ",
      calls: [{ name: "addComponent", args: { type: "FAQ" } }],
    });
    expect(analysis.errors).toEqual([]);
    expect(analysis.destructive).toBe(false);
    expect(analysis.confirmMessage).toBeNull();
    expect(isDestructiveCall(analysis.writableCalls[0]!)).toBe(false);
    expect(describeCall(analysis.writableCalls[0]!)).toMatch(/Add FAQ/);
  });

  it("skips read-only ops from apply set", () => {
    const analysis = analyzeAiPlan({
      explanation: "Inspect",
      calls: [
        { name: "getWebsite", args: {} },
        { name: "updateTheme", args: { radius: "0px" } },
      ],
    });
    expect(analysis.writableCalls.map((c) => c.name)).toEqual(["updateTheme"]);
  });
});
