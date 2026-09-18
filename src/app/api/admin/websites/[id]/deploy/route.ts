import { NextResponse } from "next/server";
import { getAdminUser, isAdminRequest } from "@/lib/admin-auth";
import {
  deployWebsite,
  getDeploymentStatus,
} from "@/features/website-factory/application/deployment";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getDeploymentStatus());
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const user = await getAdminUser();
    const result = await deployWebsite(id, user?.id ?? null);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Deploy failed";
    const status = /not configured/i.test(message) ? 400 : 500;
    return NextResponse.json(
      { error: message, configured: status !== 400 },
      { status },
    );
  }
}
