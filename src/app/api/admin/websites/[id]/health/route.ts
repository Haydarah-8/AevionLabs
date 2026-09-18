import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getProjectBundle } from "@/features/website-factory/services/store";
import { analyseWebsiteHealth } from "@/features/website-factory/services/health";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const bundle = await getProjectBundle(id);
  if (!bundle) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(analyseWebsiteHealth(bundle));
}
