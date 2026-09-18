import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { listProjects } from "@/features/website-factory/services/store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const projects = await listProjects();
    return NextResponse.json({ projects });
  } catch (err) {
    console.error("[admin/websites]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load websites" },
      { status: 500 },
    );
  }
}
