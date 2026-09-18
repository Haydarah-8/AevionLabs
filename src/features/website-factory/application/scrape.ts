import {
  createScrapeJob,
  getScrapeJob,
  listScrapeJobs,
  runScrapeJob,
} from "../intelligence/jobs";
import { applyIntelligenceImport } from "../intelligence/apply";
import { assertPublicHttpUrl } from "../intelligence/ssrf";
import type { IntelligenceResult } from "../intelligence/types";
import { emitFactoryEvent } from "./events";
import {
  getScrapeImport,
  listScrapeImports,
  markScrapeImportApplied,
} from "../cms/scrape-cms";

export async function startWebsiteScrape(input: {
  url: string;
  projectId?: string;
  actorId?: string | null;
  sync?: boolean;
}) {
  const url = assertPublicHttpUrl(input.url).toString();
  const job = await createScrapeJob(url, input.projectId);
  await emitFactoryEvent({
    name: "scrape.started",
    projectId: input.projectId,
    resourceType: "scrape_job",
    resourceId: job.id,
    actorId: input.actorId,
    meta: { url },
  });

  // Sync path runs inline. Async path is started by the route via `after()`
  // so Next.js does not cancel the scrape when the HTTP response is sent.
  if (input.sync) {
    const done = await runScrapeJob(job.id, { downloadAssets: false });
    if (done) {
      await emitFactoryEvent({
        name: done.status === "succeeded" ? "scrape.completed" : "scrape.failed",
        projectId: input.projectId,
        resourceType: "scrape_job",
        resourceId: done.id,
        result: done.status === "succeeded" ? "ok" : "error",
        meta: {
          pages: done.pages,
          assets: done.assets,
          error: done.error,
        },
      });
    }
    return done;
  }

  return {
    ...job,
    status: "queued" as const,
    step: "Queued — starting shortly",
  };
}

export async function getWebsiteScrapeJob(id: string) {
  return getScrapeJob(id);
}

export async function listWebsiteScrapeJobs(projectId?: string) {
  return listScrapeJobs(projectId);
}

export async function applyWebsiteScrape(input: {
  projectId: string;
  result: IntelligenceResult;
  rebuildPages?: boolean;
  applyBrandColors?: boolean;
  fields?: Parameters<typeof applyIntelligenceImport>[0]["fields"];
  actorId?: string | null;
  cmsImportId?: string | null;
}) {
  const bundle = await applyIntelligenceImport({
    projectId: input.projectId,
    result: input.result,
    rebuildPages: input.rebuildPages,
    applyBrandColors: input.applyBrandColors,
    fields: input.fields,
  });
  if (input.cmsImportId) {
    await markScrapeImportApplied(input.cmsImportId);
  }
  await emitFactoryEvent({
    name: "website.updated",
    projectId: input.projectId,
    resourceType: "import",
    resourceId: input.projectId,
    actorId: input.actorId,
    meta: { sourceUrl: input.result.sourceUrl },
  });
  return bundle;
}

export { listScrapeImports, getScrapeImport, markScrapeImportApplied };
