import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { createPage, listPages, revalidateCms } from "@/lib/cms/store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const pages = await listPages();
    return NextResponse.json({ pages });
  } catch (err) {
    console.error("[admin/cms/pages]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load pages" },
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
    const page = await createPage(body ?? {});
    revalidateCms(page.path);
    return NextResponse.json({ page }, { status: 201 });
  } catch (err) {
    console.error("[admin/cms/pages] create:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create page" },
      { status: 500 },
    );
  }
}
