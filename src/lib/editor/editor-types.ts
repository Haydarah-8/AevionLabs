/**
 * Aevion editor abstraction — engines adapt to this contract.
 * Aevion remains source of truth for businesses, pages, deploy, API, MCP.
 * Puck is the permanent visual editing engine.
 */

/** Active visual engine. Legacy Grapes/Vvveb payloads may still exist in storage. */
export type EditorEngineId = "puck";

export type EditorViewport = "desktop" | "tablet" | "mobile";

export type ComponentDefinition = {
  id: string;
  type: string;
  props: Record<string, unknown>;
  children?: ComponentDefinition[];
  styles?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

export type AevionPageDocument = {
  version: 1;
  engine: EditorEngineId;
  /** Preferred structured tree for AI / templates (optional). */
  tree?: ComponentDefinition[];
  /** Engine-native payload for faithful round-trip (PuckData). */
  native: unknown;
  title?: string;
  updatedAt?: string;
};

export type EditorPagePayload = {
  id: string;
  name: string;
  title: string;
  document: AevionPageDocument | null;
};

export type EditorInitOptions = {
  /** Optional DOM mount — unused by headless API/MCP operations. */
  mount?: HTMLElement;
  pages: EditorPagePayload[];
  viewport?: EditorViewport;
  onChange?: (doc: AevionPageDocument) => void;
  onReady?: () => void;
  onError?: (error: Error) => void;
};

export type MoveTarget = {
  parentId: string | null;
  index: number;
};

/**
 * Headless + Studio adapter contract.
 * Production Studio chrome may still use Puck compositional APIs directly;
 * API / AI / MCP should mutate pages through this interface.
 */
export interface EditorEngine {
  readonly id: EditorEngineId;
  initialize(options: EditorInitOptions): Promise<void>;
  loadPage(page: EditorPagePayload): Promise<void>;
  savePage(): Promise<AevionPageDocument>;
  addComponent(component: ComponentDefinition): Promise<void>;
  updateComponent(id: string, props: Record<string, unknown>): Promise<void>;
  removeComponent(id: string): Promise<void>;
  duplicateComponent(id: string): Promise<void>;
  moveComponent(id: string, destination: MoveTarget): Promise<void>;
  undo(): Promise<void>;
  redo(): Promise<void>;
  selectComponent(id: string): Promise<void>;
  getSelectedComponent(): ComponentDefinition | null;
  getDocument(): AevionPageDocument;
  setViewport(viewport: EditorViewport): void;
  destroy(): Promise<void>;
}
