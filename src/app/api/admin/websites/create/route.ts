import { NextResponse } from "next/server";
import { getAdminUser, isAdminRequest } from "@/lib/admin-auth";
import { aevionCommands } from "@/lib/aevion/commands";
import { createProject } from "@/features/website-factory/services/store";
import {
  factoryErrorMessage,
  themeSchema,
} from "@/features/website-factory/services/schemas";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  blank: z.boolean().optional(),
  businessId: z.string().min(1).optional(),
  templateId: z.string().min(1).optional(),
  name: z.string().trim().max(160).optional(),
  slug: z.string().trim().max(80).optional(),
  theme: themeSchema.optional(),
  wizard: z.record(z.string(), z.unknown()).optional(),
  editorEngine: z.enum(["puck"]).optional(),
});

export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const user = await getAdminUser();
    const raw = await request.json().catch(() => ({}));
    const input = createSchema.parse(raw ?? {});
    const actorId = user?.id ?? null;

    if (input.wizard) {
      const bundle = await aevionCommands.createWebsite(
        { wizard: input.wizard },
        { actorId },
      );
      return NextResponse.json(
        { project: bundle.project, bundle },
        { status: 201 },
      );
    }

    // Default: blank canvas (no form required)
    if (input.blank !== false && !input.businessId) {
      const bundle = await aevionCommands.createWebsite(
        {
          name: input.name,
          templateId: input.templateId,
          editorEngine: input.editorEngine,
        },
        { actorId },
      );
      return NextResponse.json(
        { project: bundle.project, bundle },
        { status: 201 },
      );
    }

    if (!input.businessId || !input.templateId) {
      return NextResponse.json(
        { error: "businessId and templateId are required" },
        { status: 400 },
      );
    }
    const project = await createProject({
      businessId: input.businessId,
      templateId: input.templateId,
      name: input.name,
      slug: input.slug,
      theme: input.theme,
      editorEngine: input.editorEngine,
    });
    return NextResponse.json({ project }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: factoryErrorMessage(err, "Failed to create website") },
      { status: 400 },
    );
  }
}
