import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { listTemplates } from "@/features/website-factory/services/store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const templates = await listTemplates();
    return NextResponse.json({ templates });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load templates" },
      { status: 500 },
    );
  }
}
