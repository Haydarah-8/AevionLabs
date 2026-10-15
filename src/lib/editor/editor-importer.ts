import type { AevionPageDocument, EditorPagePayload } from "@/lib/editor/editor-types";
import { fromAevionDocument, toAevionDocument } from "@/lib/editor/editor-serializer";
import type { PageDocument, WebsitePage } from "@/features/website-factory/types";

/** Import Aevion stored page → editor payload. */
export function importPageToEditor(page: WebsitePage): EditorPagePayload {
  return {
    id: page.id,
    name: page.slug || page.id,
    title: page.title,
    document: toAevionDocument(page.draftData),
  };
}

export function importDocumentToEditor(
  page: Pick<WebsitePage, "id" | "slug" | "title">,
  document: PageDocument,
): EditorPagePayload {
  return {
    id: page.id,
    name: page.slug || page.id,
    title: page.title,
    document: toAevionDocument(document),
  };
}

/** Convert editor save result → Aevion page document for persistence. */
export function importEditorSaveToPage(doc: AevionPageDocument): PageDocument {
  return fromAevionDocument(doc);
}
