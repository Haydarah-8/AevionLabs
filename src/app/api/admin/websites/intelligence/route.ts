import { NextResponse } from "next/server";
import { after } from "next/server";
import { getAdminUser, isAdminRequest } from "@/lib/admin-auth";
import {
  listWebsiteScrapeJobs,
  startWebsiteScrape,
} from "@/features/website-factory/application/scrape";
import { factoryErrorMessage } from "@/features/website-factory/services/schemas";
import { runScrapeJob } from "@/features/website-factory/intelligence/jobs";
import { emitFactoryEvent } from "@/features/website-factory/application/events";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const projectId =
    new URL(request.url).searchParams.get("projectId") || undefined;
  const jobs = await listWebsiteScrapeJobs(projectId);
  return NextResponse.json({ jobs, engine: "readability+linkedom+jsonld" });
}

export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const user = await getAdminUser();
    // Default to sync for reliability in local/dev; client can pass sync:false.
    const sync = body.sync !== false;
    const projectId =
      typeof body.projectId === "string" && body.projectId.trim()
        ? body.projectId.trim()
        : undefined;

    const job = await startWebsiteScrape({
      url: String(body.url || ""),
      projectId,
      actorId: user?.id ?? null,
      sync,
    });

    if (!sync && job?.id) {
      after(async () => {
        const done = await runScrapeJob(job.id, { downloadAssets: false });
        if (!done) return;
        await emitFactoryEvent({
          name:
            done.status === "succeeded" ? "scrape.completed" : "scrape.failed",
          projectId,
          resourceType: "scrape_job",
          resourceId: done.id,
          result: done.status === "succeeded" ? "ok" : "error",
          meta: {
            pages: done.pages,
            assets: done.assets,
            error: done.error,
          },
        });
      });
    }

    if (sync && job && "status" in job && job.status === "failed") {
      return NextResponse.json(
        { error: ("error" in job && job.error) || "Import failed", job },
        { status: 422 },
      );
    }

    return NextResponse.json(
      {
        job,
        engine: "readability+linkedom+jsonld",
      },
      { status: sync ? 200 : 202 },
    );
  } catch (err) {
    console.error("[website-factory] intelligence POST", err);
    return NextResponse.json(
      { error: factoryErrorMessage(err, "Could not start import") },
      { status: 400 },
    );
  }
}
