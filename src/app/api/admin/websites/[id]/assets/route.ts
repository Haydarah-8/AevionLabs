import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminUser, isAdminRequest } from "@/lib/admin-auth";
import { assignAsset } from "@/features/website-factory/application/asset";
import { generateWebsite } from "@/features/website-factory/services/generate";
import { getProjectBundle } from "@/features/website-factory/services/store";
import { factoryErrorMessage } from "@/features/website-factory/services/schemas";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  action: z.enum(["hero", "logo", "favicon", "gallery", "service"]),
  url: z.string().min(1).max(2000),
  alt: z.string().max(200).optional(),
  rebuild: z.boolean().optional(),
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
    const user = await getAdminUser();
    await assignAsset({
      projectId: id,
      action: body.action,
      url: body.url,
      alt: body.alt,
      actorId: user?.id ?? null,
    });
    const next =
      body.rebuild === false
        ? await getProjectBundle(id)
        : await generateWebsite(id, "rebuild");
    return NextResponse.json({ bundle: next });
  } catch (err) {
    return NextResponse.json(
      { error: factoryErrorMessage(err, "Asset action failed") },
      { status: 400 },
    );
  }
}
