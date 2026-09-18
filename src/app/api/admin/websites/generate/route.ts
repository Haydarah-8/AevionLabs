import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { generateWebsiteFromWizard } from "@/features/website-factory/services/generate";
import {
  businessInputSchema,
  factoryErrorMessage,
  themeSchema,
} from "@/features/website-factory/services/schemas";
import { z } from "zod";

export const dynamic = "force-dynamic";

const generateSchema = z.object({
  id: z.string().min(1).optional(),
  templateId: z.string().min(1),
  name: z.string().trim().max(160).optional(),
  theme: themeSchema.optional(),
  mode: z.enum(["preserve", "rebuild", "rewrite"]).optional(),
});

export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { id, templateId, name, theme, mode } = generateSchema.parse(body);
    const business = businessInputSchema.parse(body);
    const bundle = await generateWebsiteFromWizard({
      business,
      businessId: id,
      templateId,
      theme,
      name: name || business.name,
      mode,
    });
    return NextResponse.json(bundle, { status: 201 });
  } catch (err) {
    console.error("[website-factory] wizard generate failed", err);
    return NextResponse.json(
      { error: factoryErrorMessage(err, "Generate failed") },
      { status: 400 },
    );
  }
}
