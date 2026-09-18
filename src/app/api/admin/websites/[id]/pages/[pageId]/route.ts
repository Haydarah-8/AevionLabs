import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { deletePage, savePageDraft, updatePage } from "@/features/website-factory/services/store";
import { isPuckData } from "@/features/website-factory/types";
import { factoryErrorMessage } from "@/features/website-factory/services/schemas";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; pageId: string }> },
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { pageId } = await params;
  try {
    const body = await request.json();
    if (!isPuckData(body.data)) {
      return NextResponse.json({ error: "Invalid editor data" }, { status: 400 });
    }
    await savePageDraft(pageId, body.data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Save failed" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; pageId: string }> },
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { pageId } = await params;
  try {
    const page = await updatePage(pageId, await request.json());
    return NextResponse.json({ page });
  } catch (err) {
    return NextResponse.json(
      { error: factoryErrorMessage(err, "Could not update page") },
      { status: 400 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; pageId: string }> },
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { pageId } = await params;
  try {
    await deletePage(pageId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: factoryErrorMessage(err, "Could not delete page") },
      { status: 400 },
    );
  }
}
