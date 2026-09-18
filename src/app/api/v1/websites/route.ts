import { authenticateApiRequest } from "@/features/website-factory/developer/auth";
import { apiError, apiOk } from "@/features/website-factory/application/http";
import {
  createWebsiteFromWizard,
  listWebsites,
} from "@/features/website-factory/application/website";
import { createProject } from "@/features/website-factory/services/store";
import { factoryErrorMessage } from "@/features/website-factory/services/schemas";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await authenticateApiRequest(request, {
    requiredScope: "websites:read",
  });
  if (auth instanceof Response) return auth;
  const projects = await listWebsites();
  return apiOk(projects, { count: projects.length });
}

const createSchema = z.object({
  businessId: z.string().min(1).optional(),
  templateId: z.string().min(1).optional(),
  name: z.string().trim().max(160).optional(),
  slug: z.string().trim().max(80).optional(),
  wizard: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: Request) {
  const auth = await authenticateApiRequest(request, {
    requiredScope: "websites:write",
  });
  if (auth instanceof Response) return auth;
  try {
    const body = createSchema.parse(await request.json());
    if (body.wizard) {
      const bundle = await createWebsiteFromWizard(
        body.wizard as never,
        auth.actorId,
      );
      return apiOk(bundle, {}, { status: 201 });
    }
    if (!body.businessId || !body.templateId) {
      return apiError(
        "VALIDATION_ERROR",
        "businessId and templateId are required (or pass wizard)",
      );
    }
    const project = await createProject({
      businessId: body.businessId,
      templateId: body.templateId,
      name: body.name,
      slug: body.slug,
    });
    return apiOk({ project }, {}, { status: 201 });
  } catch (err) {
    return apiError(
      "VALIDATION_ERROR",
      factoryErrorMessage(err, "Failed to create website"),
    );
  }
}
