import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequest } from "@/lib/admin-auth";
import { findReplaceBusinessCopy } from "@/features/website-factory/intelligence/apply";
import { factoryErrorMessage } from "@/features/website-factory/services/schemas";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const bodySchema = z.object({
  find: z.string().min(1).max(200),
  replace: z.string().max(200),
  rebuildPages: z.boolean().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const body = bodySchema.parse(await request.json());
    const bundle = await findReplaceBusinessCopy(
      id,
      body.find,
      body.replace,
      body.rebuildPages !== false,
    );
    return NextResponse.json({ bundle });
  } catch (err) {
    return NextResponse.json(
      { error: factoryErrorMessage(err, "Find & replace failed") },
      { status: 400 },
    );
  }
}
