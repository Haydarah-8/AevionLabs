import { NextResponse } from "next/server";
import { getAdminUser, isAdminRequest } from "@/lib/admin-auth";
import { publishWebsiteLive } from "@/features/website-factory/application/website";
import { z } from "zod";

export const dynamic = "force-dynamic";

const bodySchema = z
  .object({
    note: z.string().trim().max(120).optional(),
  })
  .optional();

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
    const body = bodySchema.parse(await request.json().catch(() => ({})));
    const result = await publishWebsiteLive(
      id,
      user?.id ?? null,
      body?.note ?? null,
    );
    return NextResponse.json(result);
  } catch (err) {
    console.error("[website-factory] publish failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Publish failed" },
      { status: 500 },
    );
  }
}
