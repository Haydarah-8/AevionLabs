import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { deleteSection, revalidateCms, updateSection } from "@/lib/cms/store";

export const dynamic = "force-dynamic";

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
    const section = await updateSection(id, body ?? {});
    if (!section) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    revalidateCms();
    return NextResponse.json({ section });
  } catch (err) {
    console.error("[admin/cms/sections] update:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update section" },
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
    await deleteSection(id);
    revalidateCms();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/cms/sections] delete:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete section" },
      { status: 500 },
    );
  }
}
