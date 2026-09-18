import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { reorderSections, revalidateCms } from "@/lib/cms/store";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await request.json()) as { pageId?: string; ids?: string[] };
    const pageId = String(body.pageId || "");
    const ids = Array.isArray(body.ids) ? body.ids.map(String) : [];
    if (!pageId || !ids.length) {
      return NextResponse.json({ error: "Missing page or section ids" }, { status: 400 });
    }
    const sections = await reorderSections(pageId, ids);
    revalidateCms();
    return NextResponse.json({ sections });
  } catch (err) {
    console.error("[admin/cms/reorder]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to reorder" },
      { status: 500 },
    );
  }
}
