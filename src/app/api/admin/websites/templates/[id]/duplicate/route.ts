import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { duplicateTemplate } from "@/features/website-factory/services/store";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const template = await duplicateTemplate(id);
    return NextResponse.json({ template }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to duplicate" },
      { status: 500 },
    );
  }
}
