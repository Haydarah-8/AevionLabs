import { NextResponse } from "next/server";
import { getAdminUser, isAdminRequest } from "@/lib/admin-auth";
import { renameWebsiteVersion } from "@/features/website-factory/application/website";
import { factoryErrorMessage } from "@/features/website-factory/services/schemas";
import { z } from "zod";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  note: z.string().trim().max(120),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; versionId: string }> },
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, versionId } = await params;
  try {
    const user = await getAdminUser();
    const { note } = bodySchema.parse(await request.json());
    const result = await renameWebsiteVersion(
      id,
      versionId,
      note,
      user?.id ?? null,
    );
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: factoryErrorMessage(err, "Could not rename version") },
      { status: 400 },
    );
  }
}
