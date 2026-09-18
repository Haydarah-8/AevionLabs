import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import {
  deleteProject,
  getProjectById,
  revalidateCms,
  updateProject,
} from "@/lib/cms/store";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const project = await getProjectById(id);
    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ project });
  } catch (err) {
    console.error("[admin/cms/projects] get:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load project" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const body = await request.json().catch(() => ({}));
    const project = await updateProject(id, body ?? {});
    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    revalidateCms(`/work/${project.slug}`);
    return NextResponse.json({ project });
  } catch (err) {
    console.error("[admin/cms/projects] update:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update project" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const existing = await getProjectById(id);
    const ok = await deleteProject(id);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    revalidateCms(existing ? `/work/${existing.slug}` : undefined);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/cms/projects] delete:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete project" },
      { status: 500 },
    );
  }
}
