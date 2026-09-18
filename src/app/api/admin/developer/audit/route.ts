import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { listAuditLogs } from "@/features/website-factory/application/audit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const projectId = url.searchParams.get("projectId") || undefined;
  const limit = Math.min(Number(url.searchParams.get("limit") || 100), 200);
  let logs = await listAuditLogs(limit);
  if (projectId) {
    logs = logs.filter((l) => l.projectId === projectId);
  }
  return NextResponse.json({ logs });
}
