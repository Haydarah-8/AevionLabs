import { describe, expect, it } from "vitest";
import {
  extractNativeHtml,
  wrapNativeDocument,
} from "@/lib/editor/editor-serializer";
import { isLegacyHtmlDocument } from "@/features/website-factory/types";

describe("feature editor-serializer", () => {
  it("wraps puck documents", () => {
    const doc = wrapNativeDocument(
      "puck",
      { root: { props: {} }, content: [] },
      "Home",
    );
    expect(doc.engine).toBe("puck");
  });

  it("reads legacy html envelopes", () => {
    const page = {
      version: 1 as const,
      engine: "vvveb" as const,
      title: "About",
      native: "<html><body>About</body></html>",
    };
    expect(isLegacyHtmlDocument(page)).toBe(true);
    expect(extractNativeHtml(page)).toContain("About");
  });
});
