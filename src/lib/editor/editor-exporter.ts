import type { AevionPageDocument } from "@/lib/editor/editor-types";
import { extractNativeHtml } from "@/lib/editor/editor-serializer";
import type {
  PageDocument,
  WebsitePage,
  WebsiteProject,
} from "@/features/website-factory/types";
import { isLegacyHtmlDocument, isPuckData } from "@/features/website-factory/types";

export type ExportedWebsiteFile = {
  path: string;
  contents: string;
};

/**
 * Export Aevion page documents to standalone files.
 * Puck pages remain JSON for the Next+Puck ZIP pipeline.
 * Legacy HTML pages export as static HTML.
 */
export function exportPageFiles(
  project: Pick<WebsiteProject, "slug" | "name" | "editorEngine">,
  pages: WebsitePage[],
  mode: "draft" | "published" = "draft",
): ExportedWebsiteFile[] {
  const files: ExportedWebsiteFile[] = [];
  for (const page of pages) {
    const data =
      mode === "published"
        ? page.publishedData ?? page.draftData
        : page.draftData;
    if (isLegacyHtmlDocument(data)) {
      const html =
        extractNativeHtml(data) ||
        "<!DOCTYPE html><html><body></body></html>";
      const filename = page.slug === "home" ? "index.html" : `${page.slug}.html`;
      files.push({ path: filename, contents: html });
      continue;
    }
    if (isPuckData(data)) {
      files.push({
        path: `data/${page.slug}.json`,
        contents: JSON.stringify(data, null, 2),
      });
    }
  }
  files.push({
    path: "aevion-export.json",
    contents: JSON.stringify(
      {
        project: project.slug,
        name: project.name,
        engine: project.editorEngine,
        exportedAt: new Date().toISOString(),
        pages: pages.map((p) => ({ slug: p.slug, title: p.title })),
      },
      null,
      2,
    ),
  });
  return files;
}

export function exportDocumentAsHtml(
  doc: AevionPageDocument | PageDocument,
): string | null {
  return extractNativeHtml(doc);
}
