import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { ensureAbcRoofingDemo } from "@/features/website-factory/services/generate";
import { factoryErrorMessage } from "@/features/website-factory/services/schemas";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const bundle = await ensureAbcRoofingDemo();
    return NextResponse.json(bundle, { status: 201 });
  } catch (err) {
    console.error("[website-factory] abc demo failed", err);
    return NextResponse.json(
      { error: factoryErrorMessage(err, "Could not create ABC Roofing demo") },
      { status: 400 },
    );
  }
}

export async function GET(request: Request) {
  return POST(request);
}
