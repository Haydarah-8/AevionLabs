import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import {
  ensureScrapeJobRunning,
  getScrapeJob,
} from "@/features/website-factory/intelligence/jobs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  let job = await getScrapeJob(id);
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (job.status === "queued" || job.status === "running") {
    // Kick / resume if idle or stale — never leave the UI polling a dead job.
    void ensureScrapeJobRunning(job.id);
    job = (await getScrapeJob(id)) ?? job;
  }

  return NextResponse.json({ job });
}
