import type { PuckData, PuckNode } from "../types";
import { emptyPuck, isPuckData } from "../types";
import { getWebsite } from "../application/website";
import { savePageDraft } from "../services/store";
import { PuckEngine } from "@/lib/editor/puck-engine";
import { toEditablePuckData } from "@/lib/editor/editor-serializer";
import {
  getAevionComponent,
  listAevionComponentTypes,
  listComponentSchemas as listRegistrySchemas,
} from "@/features/website-factory/registry";

function asContent(data: PuckData | unknown): PuckNode[] {
  if (!isPuckData(data)) {
    throw Object.assign(
      new Error("Component APIs require a Puck page document"),
      { status: 400 },
    );
  }
  return Array.isArray(data.content) ? [...data.content] : [];
}

async function resolvePage(projectId: string, pageId?: string) {
  const bundle = await getWebsite(projectId);
  if (!bundle)
    throw Object.assign(new Error("Website not found"), { status: 404 });
  const page =
    (pageId ? bundle.pages.find((p) => p.id === pageId) : null) ||
    bundle.pages.find((p) => p.slug === "home") ||
    bundle.pages[0];
  if (!page) throw new Error("No pages on website");
  return { bundle, page };
}

function engineForDraft(page: {
  id: string;
  slug: string;
  title: string;
  draftData: unknown;
}) {
  const puck = toEditablePuckData(
    isPuckData(page.draftData) ? page.draftData : emptyPuck(),
  );
  return PuckEngine.fromPuckData(puck, {
    id: page.id,
    name: page.slug,
    title: page.title,
  });
}

export function listComponentSchemas() {
  return listRegistrySchemas();
}

export function listRegisteredComponentTypes() {
  return listAevionComponentTypes();
}

export function getRegisteredComponent(type: string) {
  return getAevionComponent(type);
}

export async function listPageComponents(projectId: string, pageId?: string) {
  const { page } = await resolvePage(projectId, pageId);
  const engine = engineForDraft(page);
  const doc = engine.getDocument();
  const tree = doc.tree || [];
  return {
    pageId: page.id,
    slug: page.slug,
    engine: "puck" as const,
    components: tree.map((node, index) => ({
      index,
      id: node.id,
      type: node.type,
      props: node.props || {},
    })),
  };
}

export async function addPageComponent(input: {
  projectId: string;
  pageId?: string;
  type: string;
  props?: Record<string, unknown>;
  index?: number;
}) {
  if (!getAevionComponent(input.type)) {
    throw Object.assign(new Error(`Unknown component type: ${input.type}`), {
      status: 400,
    });
  }
  const { page } = await resolvePage(input.projectId, input.pageId);
  const engine = engineForDraft(page);
  const id = crypto.randomUUID();
  await engine.addComponent({
    id,
    type: input.type,
    props: input.props || {},
    metadata:
      typeof input.index === "number" ? { index: input.index } : undefined,
  });
  const puck = engine.getPuckData();
  await savePageDraft(page.id, puck);
  const selected = engine.getSelectedComponent();
  const content = asContent(puck);
  const index = content.findIndex((n) => String(n.props?.id) === id);
  return {
    pageId: page.id,
    index: index < 0 ? content.length - 1 : index,
    component: selected
      ? { type: selected.type, props: selected.props }
      : content[index],
  };
}

export async function updatePageComponent(input: {
  projectId: string;
  pageId?: string;
  index: number;
  props?: Record<string, unknown>;
  type?: string;
}) {
  const { page } = await resolvePage(input.projectId, input.pageId);
  const engine = engineForDraft(page);
  const listed = engine.getDocument().tree || [];
  if (input.index < 0 || input.index >= listed.length) {
    throw new Error("Component index out of range");
  }
  const target = listed[input.index];
  if (input.type && input.type !== target.type) {
    await engine.updateComponent(target.id, {
      ...(input.props || {}),
    });
    // type change via direct puck rewrite
    const puck = engine.getPuckData();
    const content = asContent(puck);
    content[input.index] = {
      ...content[input.index],
      type: input.type,
      props: { ...content[input.index].props, ...(input.props || {}) },
    };
    await savePageDraft(page.id, { ...puck, content });
    return {
      pageId: page.id,
      index: input.index,
      component: content[input.index],
    };
  }
  await engine.updateComponent(target.id, input.props || {});
  const puck = engine.getPuckData();
  await savePageDraft(page.id, puck);
  return {
    pageId: page.id,
    index: input.index,
    component: puck.content[input.index],
  };
}

export async function removePageComponent(input: {
  projectId: string;
  pageId?: string;
  index: number;
}) {
  const { page } = await resolvePage(input.projectId, input.pageId);
  const engine = engineForDraft(page);
  const listed = engine.getDocument().tree || [];
  if (input.index < 0 || input.index >= listed.length) {
    throw new Error("Component index out of range");
  }
  const target = listed[input.index];
  await engine.removeComponent(target.id);
  const puck = engine.getPuckData();
  await savePageDraft(page.id, puck);
  return {
    pageId: page.id,
    removed: { type: target.type, props: target.props },
  };
}

export async function movePageComponent(input: {
  projectId: string;
  pageId?: string;
  fromIndex: number;
  toIndex: number;
}) {
  const { page } = await resolvePage(input.projectId, input.pageId);
  const engine = engineForDraft(page);
  const listed = engine.getDocument().tree || [];
  if (
    input.fromIndex < 0 ||
    input.fromIndex >= listed.length ||
    input.toIndex < 0 ||
    input.toIndex >= listed.length
  ) {
    throw new Error("Component index out of range");
  }
  const target = listed[input.fromIndex];
  await engine.moveComponent(target.id, {
    parentId: null,
    index: input.toIndex,
  });
  await savePageDraft(page.id, engine.getPuckData());
  return {
    pageId: page.id,
    fromIndex: input.fromIndex,
    toIndex: input.toIndex,
  };
}

/** Expose headless engine for AI / MCP planned operations. */
export async function openPageEngine(projectId: string, pageId?: string) {
  const { page } = await resolvePage(projectId, pageId);
  return {
    page,
    engine: engineForDraft(page),
    async persist(engine: PuckEngine) {
      await savePageDraft(page.id, engine.getPuckData());
    },
  };
}
