import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { listBusinesses, upsertBusiness } from "@/features/website-factory/services/store";
import { businessInputSchema, factoryErrorMessage } from "@/features/website-factory/services/schemas";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const businesses = await listBusinesses();
    return NextResponse.json({ businesses });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load businesses" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const id = typeof body.id === "string" && body.id ? body.id : undefined;
    const input = businessInputSchema.parse(body);
    const business = await upsertBusiness(input, id);
    return NextResponse.json({ business }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: factoryErrorMessage(err, "Failed to save business") },
      { status: 400 },
    );
  }
}
