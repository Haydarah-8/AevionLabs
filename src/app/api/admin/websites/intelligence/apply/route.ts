import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminUser, isAdminRequest } from "@/lib/admin-auth";
import { applyWebsiteScrape } from "@/features/website-factory/application/scrape";
import { factoryErrorMessage } from "@/features/website-factory/services/schemas";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  projectId: z.string().min(1),
  result: z.record(z.string(), z.unknown()),
  rebuildPages: z.boolean().optional(),
  applyBrandColors: z.boolean().optional(),
  cmsImportId: z.string().uuid().optional(),
  fields: z
    .object({
      identity: z.boolean().optional(),
      contact: z.boolean().optional(),
      services: z.boolean().optional(),
      reviews: z.boolean().optional(),
      media: z.boolean().optional(),
      social: z.boolean().optional(),
    })
    .optional(),
});

export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const parsed = bodySchema.parse(await request.json());
    const user = await getAdminUser();
    const bundle = await applyWebsiteScrape({
      projectId: parsed.projectId,
      result: parsed.result as never,
      rebuildPages: parsed.rebuildPages,
      applyBrandColors: parsed.applyBrandColors,
      fields: parsed.fields,
      actorId: user?.id ?? null,
      cmsImportId: parsed.cmsImportId,
    });
    return NextResponse.json({ bundle });
  } catch (err) {
    return NextResponse.json(
      { error: factoryErrorMessage(err, "Could not apply import") },
      { status: 400 },
    );
  }
}
