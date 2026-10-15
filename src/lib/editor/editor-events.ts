export type EditorEventName =
  | "editor.ready"
  | "editor.destroyed"
  | "editor.page.loaded"
  | "editor.page.saved"
  | "editor.selection.changed"
  | "editor.viewport.changed"
  | "editor.error"
  | "website.published";

export type EditorEventDetail = {
  engine: "puck";
  projectId?: string;
  pageId?: string;
  message?: string;
  meta?: Record<string, unknown>;
};

type Listener = (detail: EditorEventDetail) => void;

const listeners = new Map<EditorEventName, Set<Listener>>();

export function onEditorEvent(name: EditorEventName, listener: Listener) {
  if (!listeners.has(name)) listeners.set(name, new Set());
  listeners.get(name)!.add(listener);
  return () => listeners.get(name)?.delete(listener);
}

export function emitEditorEvent(
  name: EditorEventName,
  detail: EditorEventDetail,
) {
  listeners.get(name)?.forEach((listener) => {
    try {
      listener(detail);
    } catch {
      /* ignore listener errors */
    }
  });
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(`aevion.${name}`, { detail }));
  }
}
