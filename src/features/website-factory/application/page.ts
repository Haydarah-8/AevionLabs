import {
  addPage,
  deletePage,
  duplicatePage,
  updatePage,
} from "../services/store";
import { emitFactoryEvent } from "./events";
import { getWebsite } from "./website";

export async function listWebsitePages(projectId: string) {
  const bundle = await getWebsite(projectId);
  if (!bundle) throw Object.assign(new Error("Website not found"), { status: 404 });
  return bundle.pages;
}

export async function createWebsitePage(
  projectId: string,
  input: Parameters<typeof addPage>[1],
  actorId?: string | null,
) {
  const page = await addPage(projectId, input);
  await emitFactoryEvent({
    name: "website.updated",
    projectId,
    resourceType: "page",
    resourceId: page.id,
    actorId,
    meta: { action: "page.created" },
  });
  return page;
}

export async function updateWebsitePage(
  pageId: string,
  patch: Parameters<typeof updatePage>[1],
  actorId?: string | null,
  projectId?: string,
) {
  const page = await updatePage(pageId, patch);
  await emitFactoryEvent({
    name: "website.updated",
    projectId,
    resourceType: "page",
    resourceId: pageId,
    actorId,
    meta: { action: "page.updated" },
  });
  return page;
}

export async function removeWebsitePage(
  pageId: string,
  actorId?: string | null,
  projectId?: string,
) {
  await deletePage(pageId);
  await emitFactoryEvent({
    name: "website.updated",
    projectId,
    resourceType: "page",
    resourceId: pageId,
    actorId,
    meta: { action: "page.deleted" },
  });
}

export async function duplicateWebsitePage(
  pageId: string,
  actorId?: string | null,
  projectId?: string,
) {
  const page = await duplicatePage(pageId);
  await emitFactoryEvent({
    name: "website.updated",
    projectId,
    resourceType: "page",
    resourceId: page.id,
    actorId,
    meta: { action: "page.duplicated", from: pageId },
  });
  return page;
}
