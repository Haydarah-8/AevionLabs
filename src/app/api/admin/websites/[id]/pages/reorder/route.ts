import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { reorderPages } from "@/features/website-factory/services/store";
import { factoryErrorMessage } from "@/features/website-factory/services/schemas";
import { z } from "zod";

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
    const body = z
      .object({ pageIds: z.array(z.string().min(1)).min(1) })
      .parse(await request.json());
    await reorderPages(id, body.pageIds);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: factoryErrorMessage(err, "Could not reorder pages") },
      { status: 400 },
    );
  }
}
