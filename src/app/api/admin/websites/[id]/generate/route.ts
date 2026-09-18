import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { generateWebsite } from "@/features/website-factory/services/generate";

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
    const bundle = await generateWebsite(id);
    return NextResponse.json(bundle);
  } catch (err) {
    console.error("[website-factory] generate failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Generate failed" },
      { status: 500 },
    );
  }
}
