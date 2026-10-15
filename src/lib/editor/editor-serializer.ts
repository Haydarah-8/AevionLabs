import type {
  AevionPageDocument,
  EditorEngineId,
} from "@/lib/editor/editor-types";
import {
  emptyPuck,
  isGrapesDocument,
  isLegacyHtmlDocument,
  isPageDocument,
  isPuckData,
  type PageDocument,
  type PuckData,
} from "@/features/website-factory/types";

/**
 * Aevion PageDocument ↔ editor-native payloads.
 * Active engine is always Puck. Legacy HTML / accidental Grapes envelopes
 * remain readable and normalize to Puck for editing tooling.
 */

export function toAevionDocument(data: PageDocument): AevionPageDocument {
  if (isLegacyHtmlDocument(data)) {
    return {
      version: 1,
      engine: "puck",
      native: emptyPuck(),
      title: data.title,
      updatedAt: data.updatedAt,
      tree: data.tree,
    };
  }
  if (isGrapesDocument(data)) {
    // Do not keep Grapes as an active engine — expose empty Puck for tooling.
    return {
      version: 1,
      engine: "puck",
      native: emptyPuck(),
      title: data.title,
      updatedAt: data.updatedAt,
    };
  }
  return {
    version: 1,
    engine: "puck",
    native: data,
  };
}

export function fromAevionDocument(doc: AevionPageDocument): PageDocument {
  if (isPuckData(doc.native)) return doc.native;
  return emptyPuck();
}

export function wrapNativeDocument(
  engine: EditorEngineId,
  native: unknown,
  title?: string,
): AevionPageDocument {
  return {
    version: 1,
    engine: "puck" as const,
    native,
    title,
    updatedAt: new Date().toISOString(),
  };
}

export function extractNativeHtml(
  doc: AevionPageDocument | PageDocument | null | undefined,
): string | null {
  if (!doc) return null;
  if (isLegacyHtmlDocument(doc)) return doc.native;
  if (isGrapesDocument(doc)) return doc.native.html || null;
  if (
    "engine" in doc &&
    typeof (doc as { native?: unknown }).native === "string"
  ) {
    const engine = (doc as { engine?: string }).engine;
    if (engine === "vvveb" || engine === "html") {
      return String((doc as { native: string }).native);
    }
  }
  return null;
}

export function parsePageDocument(value: unknown): PageDocument | null {
  return isPageDocument(value) ? value : null;
}

export function requirePuckData(value: PageDocument): PuckData {
  if (!isPuckData(value)) {
    throw new Error("Expected a Puck page document");
  }
  return value;
}

/** Normalize any stored page payload to editable Puck JSON. */
export function toEditablePuckData(
  value: PageDocument | null | undefined,
): PuckData {
  if (!value) return emptyPuck();
  if (isPuckData(value)) return value;
  return emptyPuck();
}
