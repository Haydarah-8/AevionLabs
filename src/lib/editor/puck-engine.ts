import {
  emptyPuck,
  isPuckData,
  type PuckData,
  type PuckNode,
} from "@/features/website-factory/types";
import type {
  AevionPageDocument,
  ComponentDefinition,
  EditorEngine,
  EditorInitOptions,
  EditorPagePayload,
  EditorViewport,
  MoveTarget,
} from "@/lib/editor/editor-types";
import { emitEditorEvent } from "@/lib/editor/editor-events";
import {
  fromAevionDocument,
  toAevionDocument,
  wrapNativeDocument,
} from "@/lib/editor/editor-serializer";

function clonePuck(data: PuckData): PuckData {
  return structuredClone(data);
}

function ensurePuck(native: unknown): PuckData {
  if (isPuckData(native)) return clonePuck(native);
  const fromDoc = fromAevionDocument(
    wrapNativeDocument("puck", native ?? emptyPuck()),
  );
  return isPuckData(fromDoc) ? clonePuck(fromDoc) : emptyPuck();
}

function nodeId(node: PuckNode, fallbackIndex: number): string {
  const id = node.props?.id;
  return typeof id === "string" && id ? id : `idx-${fallbackIndex}`;
}

function findIndexById(content: PuckNode[], id: string): number {
  return content.findIndex((node, index) => nodeId(node, index) === id);
}

function toDefinition(node: PuckNode, index: number): ComponentDefinition {
  const props = { ...(node.props || {}) };
  const id = nodeId(node, index);
  const styles =
    props.styles && typeof props.styles === "object"
      ? (props.styles as Record<string, unknown>)
      : undefined;
  return {
    id,
    type: node.type,
    props,
    styles,
  };
}

/**
 * Headless Puck engine for API / AI / MCP / tests.
 * Studio UI continues to use compositional Puck; this adapter owns document
 * mutations that must stay engine-agnostic at the Aevion boundary.
 */
export class PuckEngine implements EditorEngine {
  readonly id = "puck" as const;

  private data: PuckData = emptyPuck();
  private page: EditorPagePayload | null = null;
  private selectedId: string | null = null;
  private viewport: EditorViewport = "desktop";
  private past: PuckData[] = [];
  private future: PuckData[] = [];
  private onChange?: (doc: AevionPageDocument) => void;
  private ready = false;
  private projectId?: string;

  /** Create an engine already loaded with Puck page JSON. */
  static fromPuckData(data: PuckData, pageMeta?: Partial<EditorPagePayload>) {
    const engine = new PuckEngine();
    engine.data = clonePuck(data);
    engine.page = {
      id: pageMeta?.id || "page",
      name: pageMeta?.name || "page",
      title: pageMeta?.title || "Page",
      document: toAevionDocument(engine.data),
    };
    engine.ready = true;
    return engine;
  }

  async initialize(options: EditorInitOptions): Promise<void> {
    this.onChange = options.onChange;
    this.viewport = options.viewport || "desktop";
    this.projectId =
      typeof options.pages[0]?.id === "string" ? undefined : undefined;
    const first = options.pages[0];
    if (first) {
      await this.loadPage(first);
    } else {
      this.data = emptyPuck();
      this.page = null;
    }
    this.ready = true;
    options.onReady?.();
    emitEditorEvent("editor.ready", {
      engine: "puck",
      pageId: this.page?.id,
      projectId: this.projectId,
    });
  }

  async loadPage(page: EditorPagePayload): Promise<void> {
    this.page = page;
    this.selectedId = null;
    this.past = [];
    this.future = [];
    this.data = page.document
      ? ensurePuck(page.document.native)
      : emptyPuck();
    emitEditorEvent("editor.page.loaded", {
      engine: "puck",
      pageId: page.id,
    });
  }

  async savePage(): Promise<AevionPageDocument> {
    this.assertReady();
    const doc = this.getDocument();
    if (this.page) {
      this.page = { ...this.page, document: doc };
    }
    emitEditorEvent("editor.page.saved", {
      engine: "puck",
      pageId: this.page?.id,
    });
    return doc;
  }

  async addComponent(component: ComponentDefinition): Promise<void> {
    this.assertReady();
    const content = [...this.data.content];
    const id = component.id || crypto.randomUUID();
    const node: PuckNode = {
      type: component.type,
      props: {
        ...component.props,
        id,
        ...(component.styles ? { styles: component.styles } : {}),
      },
    };
    const index =
      typeof component.metadata?.index === "number"
        ? Math.max(
            0,
            Math.min(Number(component.metadata.index), content.length),
          )
        : content.length;
    content.splice(index, 0, node);
    this.commit({ ...this.data, content });
    this.selectedId = id;
  }

  async updateComponent(
    id: string,
    props: Record<string, unknown>,
  ): Promise<void> {
    this.assertReady();
    const content = [...this.data.content];
    const index = findIndexById(content, id);
    if (index < 0) throw new Error(`Component not found: ${id}`);
    const current = content[index];
    content[index] = {
      ...current,
      props: { ...current.props, ...props, id },
    };
    this.commit({ ...this.data, content });
  }

  async removeComponent(id: string): Promise<void> {
    this.assertReady();
    const content = [...this.data.content];
    const index = findIndexById(content, id);
    if (index < 0) throw new Error(`Component not found: ${id}`);
    content.splice(index, 1);
    this.commit({ ...this.data, content });
    if (this.selectedId === id) this.selectedId = null;
  }

  async duplicateComponent(id: string): Promise<void> {
    this.assertReady();
    const content = [...this.data.content];
    const index = findIndexById(content, id);
    if (index < 0) throw new Error(`Component not found: ${id}`);
    const source = content[index];
    const copy: PuckNode = {
      type: source.type,
      props: {
        ...structuredClone(source.props || {}),
        id: crypto.randomUUID(),
      },
    };
    content.splice(index + 1, 0, copy);
    this.commit({ ...this.data, content });
    this.selectedId = String(copy.props.id);
  }

  async moveComponent(id: string, destination: MoveTarget): Promise<void> {
    this.assertReady();
    const content = [...this.data.content];
    const from = findIndexById(content, id);
    if (from < 0) throw new Error(`Component not found: ${id}`);
    const [node] = content.splice(from, 1);
    const to = Math.max(0, Math.min(destination.index, content.length));
    content.splice(to, 0, node);
    this.commit({ ...this.data, content });
  }

  async undo(): Promise<void> {
    this.assertReady();
    const previous = this.past.pop();
    if (!previous) return;
    this.future.push(clonePuck(this.data));
    this.data = previous;
    this.emitChange();
  }

  async redo(): Promise<void> {
    this.assertReady();
    const next = this.future.pop();
    if (!next) return;
    this.past.push(clonePuck(this.data));
    this.data = next;
    this.emitChange();
  }

  async selectComponent(id: string): Promise<void> {
    this.assertReady();
    const index = findIndexById(this.data.content, id);
    if (index < 0) throw new Error(`Component not found: ${id}`);
    this.selectedId = id;
    emitEditorEvent("editor.selection.changed", {
      engine: "puck",
      pageId: this.page?.id,
      meta: { componentId: id },
    });
  }

  getSelectedComponent(): ComponentDefinition | null {
    if (!this.selectedId) return null;
    const index = findIndexById(this.data.content, this.selectedId);
    if (index < 0) return null;
    return toDefinition(this.data.content[index], index);
  }

  getDocument(): AevionPageDocument {
    return {
      version: 1,
      engine: "puck",
      native: clonePuck(this.data),
      title: this.page?.title,
      updatedAt: new Date().toISOString(),
      tree: this.data.content.map((node, index) => toDefinition(node, index)),
    };
  }

  /** Convenience for Aevion persistence (always Puck JSON). */
  getPuckData(): PuckData {
    return clonePuck(this.data);
  }

  setViewport(viewport: EditorViewport): void {
    this.viewport = viewport;
    emitEditorEvent("editor.viewport.changed", {
      engine: "puck",
      pageId: this.page?.id,
      meta: { viewport },
    });
  }

  getViewport(): EditorViewport {
    return this.viewport;
  }

  async destroy(): Promise<void> {
    emitEditorEvent("editor.destroyed", {
      engine: "puck",
      pageId: this.page?.id,
    });
    this.ready = false;
    this.page = null;
    this.selectedId = null;
    this.past = [];
    this.future = [];
    this.onChange = undefined;
    this.data = emptyPuck();
  }

  private assertReady() {
    if (!this.ready && !this.page) {
      // Allow fromPuckData path without initialize()
      if (this.data) return;
      throw new Error("PuckEngine is not initialized");
    }
  }

  private commit(next: PuckData) {
    this.past.push(clonePuck(this.data));
    if (this.past.length > 100) this.past.shift();
    this.future = [];
    this.data = next;
    this.emitChange();
  }

  private emitChange() {
    this.onChange?.(this.getDocument());
  }
}

export function createPuckEngine(): PuckEngine {
  return new PuckEngine();
}
