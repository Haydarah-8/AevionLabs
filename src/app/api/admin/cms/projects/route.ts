import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { createProject, listProjects, revalidateCms } from "@/lib/cms/store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const projects = await listProjects(true);
    return NextResponse.json({ projects });
  } catch (err) {
    console.error("[admin/cms/projects]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load projects" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json().catch(() => ({}));
    const project = await createProject(body ?? {});
    revalidateCms(`/work/${project.slug}`);
    return NextResponse.json({ project }, { status: 201 });
  } catch (err) {
    console.error("[admin/cms/projects] create:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create project" },
      { status: 500 },
    );
  }
}
