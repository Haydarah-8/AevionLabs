import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { addPage } from "@/features/website-factory/services/store";
import { factoryErrorMessage } from "@/features/website-factory/services/schemas";
import { z } from "zod";

export const dynamic = "force-dynamic";

const pageSchema = z.object({
  title: z.string().trim().min(1).max(120),
  slug: z.string().trim().max(80).optional(),
  showInNav: z.boolean().optional(),
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
    const input = pageSchema.parse(await request.json());
    const page = await addPage(id, input);
    return NextResponse.json({ page }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: factoryErrorMessage(err, "Could not add page") },
      { status: 400 },
    );
  }
}
