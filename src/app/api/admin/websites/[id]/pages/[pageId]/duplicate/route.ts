import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { duplicatePage } from "@/features/website-factory/services/store";
import { factoryErrorMessage } from "@/features/website-factory/services/schemas";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; pageId: string }> },
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { pageId } = await params;
  try {
    const page = await duplicatePage(pageId);
    return NextResponse.json({ page }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: factoryErrorMessage(err, "Could not duplicate page") },
      { status: 400 },
    );
  }
}
