/**
 * Vvveb-inspired Studio tools catalog (~100).
 * @see https://demo.vvveb.com/admin/index.php?module=editor/page-builder&template=index.html&url=/
 */

export type StudioToolCategory =
  | "edit"
  | "insert"
  | "layout"
  | "typography"
  | "style"
  | "responsive"
  | "content"
  | "code"
  | "ai"
  | "view"
  | "export";

export type StudioTool = {
  id: string;
  label: string;
  hint?: string;
  category: StudioToolCategory;
  /** Action key handled by StudioToolsPanel / chrome */
  action: string;
  payload?: Record<string, string>;
};

export const STUDIO_TOOL_CATEGORIES: Array<{
  id: StudioToolCategory;
  title: string;
}> = [
  { id: "edit", title: "Edit" },
  { id: "insert", title: "Insert" },
  { id: "layout", title: "Layout" },
  { id: "typography", title: "Typography" },
  { id: "style", title: "Style" },
  { id: "responsive", title: "Responsive" },
  { id: "content", title: "Content" },
  { id: "code", title: "Code" },
  { id: "ai", title: "AI" },
  { id: "view", title: "View" },
  { id: "export", title: "Export" },
];

export const STUDIO_TOOLS: StudioTool[] = [
  // Edit (12)
  { id: "undo", label: "Undo", category: "edit", action: "undo" },
  { id: "redo", label: "Redo", category: "edit", action: "redo" },
  { id: "duplicate", label: "Duplicate block", category: "edit", action: "duplicate" },
  { id: "delete", label: "Delete block", category: "edit", action: "delete" },
  { id: "cut", label: "Cut block", category: "edit", action: "cut" },
  { id: "copy", label: "Copy block", category: "edit", action: "copy" },
  { id: "paste", label: "Paste block", category: "edit", action: "paste" },
  { id: "select-parent", label: "Select parent", category: "edit", action: "select-parent" },
  { id: "select-none", label: "Clear selection", category: "edit", action: "select-none" },
  { id: "lock", label: "Lock / unlock", category: "edit", action: "toggle-lock" },
  { id: "hide", label: "Hide / show", category: "edit", action: "toggle-hide" },
  { id: "rename", label: "Focus content fields", category: "edit", action: "focus-content" },

  // Insert (14)
  { id: "ins-section", label: "Insert Section", category: "insert", action: "insert", payload: { type: "Section" } },
  { id: "ins-container", label: "Insert Container", category: "insert", action: "insert", payload: { type: "Container" } },
  { id: "ins-flex", label: "Insert Flex row", category: "insert", action: "insert", payload: { type: "Flex" } },
  { id: "ins-grid", label: "Insert Grid", category: "insert", action: "insert", payload: { type: "Grid" } },
  { id: "ins-heading", label: "Insert Heading", category: "insert", action: "insert", payload: { type: "Heading" } },
  { id: "ins-text", label: "Insert Text", category: "insert", action: "insert", payload: { type: "TextBlock" } },
  { id: "ins-image", label: "Insert Image", category: "insert", action: "insert", payload: { type: "ImageBlock" } },
  { id: "ins-button", label: "Insert Button", category: "insert", action: "insert", payload: { type: "ButtonBlock" } },
  { id: "ins-divider", label: "Insert Divider", category: "insert", action: "insert", payload: { type: "Divider" } },
  { id: "ins-spacer", label: "Insert Spacer", category: "insert", action: "insert", payload: { type: "Spacer" } },
  { id: "ins-hero", label: "Insert Hero", category: "insert", action: "insert", payload: { type: "Hero" } },
  { id: "ins-cta", label: "Insert CTA", category: "insert", action: "insert", payload: { type: "CTA" } },
  { id: "ins-html", label: "Insert HTML", category: "insert", action: "insert", payload: { type: "RichText" } },
  { id: "ins-video", label: "Insert Video", category: "insert", action: "insert", payload: { type: "VideoBlock" } },

  // Layout (12)
  { id: "lay-full", label: "Full width", category: "layout", action: "style", payload: { width: "100%", maxWidth: "100%" } },
  { id: "lay-center", label: "Center block", category: "layout", action: "style", payload: { marginLeft: "auto", marginRight: "auto", maxWidth: "72.5rem" } },
  { id: "lay-flex-row", label: "Flex row", category: "layout", action: "style", payload: { display: "flex", direction: "row", gap: "16", align: "center" } },
  { id: "lay-flex-col", label: "Flex column", category: "layout", action: "style", payload: { display: "flex", direction: "column", gap: "16" } },
  { id: "lay-grid-2", label: "2-column grid", category: "layout", action: "style", payload: { display: "grid", gridCols: "2", gap: "20" } },
  { id: "lay-grid-3", label: "3-column grid", category: "layout", action: "style", payload: { display: "grid", gridCols: "3", gap: "20" } },
  { id: "lay-grid-4", label: "4-column grid", category: "layout", action: "style", payload: { display: "grid", gridCols: "4", gap: "16" } },
  { id: "lay-pad-s", label: "Padding S", category: "layout", action: "style", payload: { paddingTop: "16", paddingBottom: "16", paddingLeft: "16", paddingRight: "16" } },
  { id: "lay-pad-m", label: "Padding M", category: "layout", action: "style", payload: { paddingTop: "32", paddingBottom: "32", paddingLeft: "24", paddingRight: "24" } },
  { id: "lay-pad-l", label: "Padding L", category: "layout", action: "style", payload: { paddingTop: "64", paddingBottom: "64", paddingLeft: "32", paddingRight: "32" } },
  { id: "lay-gap", label: "Gap 24", category: "layout", action: "style", payload: { gap: "24" } },
  { id: "lay-sticky", label: "Sticky position", category: "layout", action: "style", payload: { position: "sticky", zIndex: "20" } },

  // Typography (12)
  { id: "ty-left", label: "Align left", category: "typography", action: "style", payload: { textAlign: "left" } },
  { id: "ty-center", label: "Align center", category: "typography", action: "style", payload: { textAlign: "center" } },
  { id: "ty-right", label: "Align right", category: "typography", action: "style", payload: { textAlign: "right" } },
  { id: "ty-justify", label: "Justify", category: "typography", action: "style", payload: { textAlign: "justify" } },
  { id: "ty-sm", label: "Font size S", category: "typography", action: "style", payload: { fontSize: "0.875rem" } },
  { id: "ty-md", label: "Font size M", category: "typography", action: "style", payload: { fontSize: "1rem" } },
  { id: "ty-lg", label: "Font size L", category: "typography", action: "style", payload: { fontSize: "1.25rem" } },
  { id: "ty-xl", label: "Font size XL", category: "typography", action: "style", payload: { fontSize: "2rem" } },
  { id: "ty-bold", label: "Bold", category: "typography", action: "style", payload: { fontWeight: "700" } },
  { id: "ty-medium", label: "Medium", category: "typography", action: "style", payload: { fontWeight: "500" } },
  { id: "ty-tight", label: "Tight leading", category: "typography", action: "style", payload: { lineHeight: "1.15" } },
  { id: "ty-loose", label: "Loose leading", category: "typography", action: "style", payload: { lineHeight: "1.7" } },

  // Style (14)
  { id: "st-bg-white", label: "BG white", category: "style", action: "style", payload: { background: "#ffffff" } },
  { id: "st-bg-soft", label: "BG soft grey", category: "style", action: "style", payload: { background: "#f4f4f5" } },
  { id: "st-bg-dark", label: "BG dark", category: "style", action: "style", payload: { background: "#111111", color: "#ffffff" } },
  { id: "st-bg-brand", label: "BG brand", category: "style", action: "style", payload: { background: "var(--wf-accent, #2563eb)", color: "#fff" } },
  { id: "st-radius-0", label: "Radius none", category: "style", action: "style", payload: { radius: "0" } },
  { id: "st-radius-m", label: "Radius M", category: "style", action: "style", payload: { radius: "12px" } },
  { id: "st-radius-pill", label: "Radius pill", category: "style", action: "style", payload: { radius: "999px" } },
  { id: "st-shadow-sm", label: "Shadow S", category: "style", action: "style", payload: { shadow: "sm" } },
  { id: "st-shadow-md", label: "Shadow M", category: "style", action: "style", payload: { shadow: "md" } },
  { id: "st-shadow-lg", label: "Shadow L", category: "style", action: "style", payload: { shadow: "lg" } },
  { id: "st-border", label: "Hairline border", category: "style", action: "style", payload: { borderWidth: "1px", borderStyle: "solid", borderColor: "#e4e4e7" } },
  { id: "st-opacity", label: "Opacity 80%", category: "style", action: "style", payload: { opacity: "0.8" } },
  { id: "st-copy", label: "Copy styles", category: "style", action: "copy-styles" },
  { id: "st-paste", label: "Paste styles", category: "style", action: "paste-styles" },

  // Responsive (8)
  { id: "vp-mobile", label: "Mobile view", category: "responsive", action: "viewport", payload: { width: "390" } },
  { id: "vp-tablet", label: "Tablet view", category: "responsive", action: "viewport", payload: { width: "768" } },
  { id: "vp-laptop", label: "Laptop view", category: "responsive", action: "viewport", payload: { width: "1024" } },
  { id: "vp-desktop", label: "Desktop view", category: "responsive", action: "viewport", payload: { width: "1280" } },
  { id: "vp-wide", label: "Wide view", category: "responsive", action: "viewport", payload: { width: "1440" } },
  { id: "vp-zoom-out", label: "Zoom out", category: "responsive", action: "zoom", payload: { delta: "-10" } },
  { id: "vp-zoom-in", label: "Zoom in", category: "responsive", action: "zoom", payload: { delta: "10" } },
  { id: "vp-zoom-100", label: "Zoom 100%", category: "responsive", action: "zoom", payload: { value: "100" } },

  // Content (8)
  { id: "ct-assets", label: "Open assets", category: "content", action: "open-tab", payload: { tab: "assets" } },
  { id: "ct-pages", label: "Open pages", category: "content", action: "open-tab", payload: { tab: "pages" } },
  { id: "ct-layers", label: "Open layers", category: "content", action: "open-tab", payload: { tab: "layers" } },
  { id: "ct-import", label: "Open import", category: "content", action: "open-tab", payload: { tab: "import" } },
  { id: "ct-find", label: "Find & replace", category: "content", action: "open-tab", payload: { tab: "import" } },
  { id: "ct-seo", label: "Page SEO", category: "content", action: "right-tab", payload: { tab: "seo" } },
  { id: "ct-theme", label: "Theme tokens", category: "content", action: "right-tab", payload: { tab: "theme" } },
  { id: "ct-audit", label: "Health audit", category: "content", action: "right-tab", payload: { tab: "audit" } },

  // Code (6)
  { id: "code-html", label: "Export HTML", category: "code", action: "export-html" },
  { id: "code-json", label: "Copy page JSON", category: "code", action: "export-json" },
  { id: "code-css", label: "Copy theme CSS vars", category: "code", action: "export-css" },
  { id: "code-inspect", label: "Inspector content", category: "code", action: "right-tab", payload: { tab: "content" } },
  { id: "code-advanced", label: "Advanced props", category: "code", action: "right-tab", payload: { tab: "advanced" } },
  { id: "code-history", label: "Version history", category: "code", action: "right-tab", payload: { tab: "history" } },

  // AI (4)
  { id: "ai-open", label: "AI assistant", category: "ai", action: "open-tab", payload: { tab: "ai" } },
  { id: "ai-improve", label: "Improve copy", category: "ai", action: "ai-prompt", payload: { prompt: "Improve the selected block copy for clarity and conversion" } },
  { id: "ai-shorten", label: "Shorten copy", category: "ai", action: "ai-prompt", payload: { prompt: "Shorten the selected block copy" } },
  { id: "ai-cta", label: "Stronger CTA", category: "ai", action: "ai-prompt", payload: { prompt: "Rewrite CTA labels to be more compelling" } },

  // View (6)
  { id: "view-focus", label: "Focus mode", category: "view", action: "toggle-focus" },
  { id: "view-preview", label: "Live preview", category: "view", action: "preview" },
  { id: "view-draft", label: "Draft URL", category: "view", action: "draft" },
  { id: "view-refresh", label: "Refresh frame", category: "view", action: "refresh-frame" },
  { id: "view-outline", label: "Open outline", category: "view", action: "open-tab", payload: { tab: "layers" } },
  { id: "view-blocks", label: "Browse blocks", category: "view", action: "open-tab", payload: { tab: "add" } },

  // Export (4)
  { id: "ex-save", label: "Save page", category: "export", action: "save" },
  { id: "ex-publish", label: "Publish hint", category: "export", action: "notice", payload: { message: "Use Deploy panel to publish" } },
  { id: "ex-deploy", label: "Open deploy", category: "export", action: "open-tab", payload: { tab: "deploy" } },
  { id: "ex-api", label: "Open API / MCP", category: "export", action: "open-tab", payload: { tab: "api" } },
];

export const STUDIO_TOOL_COUNT = STUDIO_TOOLS.length;
