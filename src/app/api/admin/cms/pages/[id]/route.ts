import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import {
  deletePage,
  getPageById,
  revalidateCms,
  updatePage,
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
    const page = await getPageById(id);
    if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ page });
  } catch (err) {
    console.error("[admin/cms/pages] get:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load page" },
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
    const page = await updatePage(id, body ?? {});
    if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
    revalidateCms(page.path);
    return NextResponse.json({ page });
  } catch (err) {
    console.error("[admin/cms/pages] update:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update page" },
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
    const existing = await getPageById(id);
    const ok = await deletePage(id);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    revalidateCms(existing?.path);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/cms/pages] delete:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete page" },
      { status: 500 },
    );
  }
}
