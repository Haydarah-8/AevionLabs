import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { addSection, getPageById, revalidateCms } from "@/lib/cms/store";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const body = await request.json().catch(() => ({}));
    const section = await addSection(id, body ?? {});
    const page = await getPageById(id);
    revalidateCms(page?.path);
    return NextResponse.json({ section }, { status: 201 });
  } catch (err) {
    console.error("[admin/cms/sections] create:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to add section" },
      { status: 500 },
    );
  }
}
