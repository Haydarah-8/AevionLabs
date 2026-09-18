import type { PuckData, PuckNode } from "../types";
import { getWebsite } from "../application/website";
import { savePageDraft } from "../services/store";
import { COMPONENT_META } from "../puck/meta";

function asContent(data: PuckData): PuckNode[] {
  return Array.isArray(data.content) ? [...data.content] : [];
}

export function listComponentSchemas() {
  return Object.entries(COMPONENT_META).map(([type, meta]) => ({
    type,
    ...meta,
  }));
}

export async function listPageComponents(projectId: string, pageId?: string) {
  const bundle = await getWebsite(projectId);
  if (!bundle) throw Object.assign(new Error("Website not found"), { status: 404 });
  const page =
    (pageId ? bundle.pages.find((p) => p.id === pageId) : null) ||
    bundle.pages.find((p) => p.slug === "home") ||
    bundle.pages[0];
  if (!page) throw new Error("No pages on website");
  return {
    pageId: page.id,
    slug: page.slug,
    components: asContent(page.draftData).map((node, index) => ({
      index,
      id: String(node.props?.id || `idx-${index}`),
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
  const listed = await listPageComponents(input.projectId, input.pageId);
  const bundle = await getWebsite(input.projectId);
  const page = bundle!.pages.find((p) => p.id === listed.pageId)!;
  const content = asContent(page.draftData);
  const node: PuckNode = {
    type: input.type,
    props: {
      id: crypto.randomUUID(),
      ...(input.props || {}),
    },
  };
  const index =
    typeof input.index === "number"
      ? Math.max(0, Math.min(input.index, content.length))
      : content.length;
  content.splice(index, 0, node);
  const draftData: PuckData = { ...page.draftData, content };
  await savePageDraft(page.id, draftData);
  return { pageId: page.id, index, component: node };
}

export async function updatePageComponent(input: {
  projectId: string;
  pageId?: string;
  index: number;
  props?: Record<string, unknown>;
  type?: string;
}) {
  const listed = await listPageComponents(input.projectId, input.pageId);
  const bundle = await getWebsite(input.projectId);
  const page = bundle!.pages.find((p) => p.id === listed.pageId)!;
  const content = asContent(page.draftData);
  if (input.index < 0 || input.index >= content.length) {
    throw new Error("Component index out of range");
  }
  const current = content[input.index];
  content[input.index] = {
    ...current,
    type: input.type || current.type,
    props: { ...current.props, ...(input.props || {}) },
  };
  await savePageDraft(page.id, { ...page.draftData, content });
  return { pageId: page.id, index: input.index, component: content[input.index] };
}

export async function removePageComponent(input: {
  projectId: string;
  pageId?: string;
  index: number;
}) {
  const listed = await listPageComponents(input.projectId, input.pageId);
  const bundle = await getWebsite(input.projectId);
  const page = bundle!.pages.find((p) => p.id === listed.pageId)!;
  const content = asContent(page.draftData);
  if (input.index < 0 || input.index >= content.length) {
    throw new Error("Component index out of range");
  }
  const [removed] = content.splice(input.index, 1);
  await savePageDraft(page.id, { ...page.draftData, content });
  return { pageId: page.id, removed };
}

export async function movePageComponent(input: {
  projectId: string;
  pageId?: string;
  fromIndex: number;
  toIndex: number;
}) {
  const listed = await listPageComponents(input.projectId, input.pageId);
  const bundle = await getWebsite(input.projectId);
  const page = bundle!.pages.find((p) => p.id === listed.pageId)!;
  const content = asContent(page.draftData);
  if (
    input.fromIndex < 0 ||
    input.fromIndex >= content.length ||
    input.toIndex < 0 ||
    input.toIndex >= content.length
  ) {
    throw new Error("Component index out of range");
  }
  const [node] = content.splice(input.fromIndex, 1);
  content.splice(input.toIndex, 0, node);
  await savePageDraft(page.id, { ...page.draftData, content });
  return { pageId: page.id, fromIndex: input.fromIndex, toIndex: input.toIndex };
}
