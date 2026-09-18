import { applyIntelligenceImport } from "../intelligence/apply";
import type { IntelligenceResult } from "../intelligence/types";
import { emitFactoryEvent } from "./events";
import { getWebsite } from "./website";

/**
 * Typed AI / intelligence apply surface — no shell, SQL, or unrestricted network.
 */
export async function applyWebsiteImport(input: {
  projectId: string;
  result: IntelligenceResult;
  rebuildPages?: boolean;
  applyBrandColors?: boolean;
  fields?: {
    identity?: boolean;
    contact?: boolean;
    services?: boolean;
    reviews?: boolean;
    media?: boolean;
    social?: boolean;
  };
  actorId?: string | null;
}) {
  const project = await getWebsite(input.projectId);
  if (!project) throw Object.assign(new Error("Website not found"), { status: 404 });

  const bundle = await applyIntelligenceImport({
    projectId: input.projectId,
    result: input.result,
    rebuildPages: input.rebuildPages,
    applyBrandColors: input.applyBrandColors,
    fields: input.fields,
  });

  await emitFactoryEvent({
    name: "website.updated",
    projectId: input.projectId,
    resourceType: "website",
    resourceId: input.projectId,
    actorId: input.actorId,
    meta: {
      action: "intelligence.applied",
      rebuildPages: input.rebuildPages !== false,
    },
  });

  return bundle;
}
