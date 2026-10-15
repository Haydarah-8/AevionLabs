import { describe, expect, it } from "vitest";
import {
  extractNativeHtml,
  wrapNativeDocument,
} from "@/lib/editor/editor-serializer";
import { isLegacyHtmlDocument } from "@/features/website-factory/types";

describe("editor-serializer", () => {
  it("wraps puck native documents", () => {
    const native = { root: { props: {} }, content: [] };
    const doc = wrapNativeDocument("puck", native, "Home");
    expect(doc.engine).toBe("puck");
    expect(doc.version).toBe(1);
    expect(extractNativeHtml(doc)).toBeNull();
  });

  it("extracts html from legacy page documents", () => {
    const legacy = {
      version: 1 as const,
      engine: "vvveb" as const,
      native: "<html><body>Hi</body></html>",
      title: "Home",
    };
    expect(isLegacyHtmlDocument(legacy)).toBe(true);
    expect(extractNativeHtml(legacy)).toBe("<html><body>Hi</body></html>");
  });
});
