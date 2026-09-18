import { authenticateApiRequest } from "@/features/website-factory/developer/auth";
import { apiError, apiOk } from "@/features/website-factory/application/http";
import {
  getWebsite,
  updateWebsite,
} from "@/features/website-factory/application/website";
import { factoryErrorMessage } from "@/features/website-factory/services/schemas";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticateApiRequest(request, {
    requiredScope: "websites:read",
  });
  if (auth instanceof Response) return auth;
  const { id } = await params;
  const bundle = await getWebsite(id);
  if (!bundle) return apiError("NOT_FOUND", "Website not found", [], 404);
  return apiOk(bundle);
}

const patchSchema = z.object({
  name: z.string().trim().max(160).optional(),
  theme: z.record(z.string(), z.unknown()).optional(),
  seoConfig: z.record(z.string(), z.unknown()).optional(),
  siteConfig: z.record(z.string(), z.unknown()).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticateApiRequest(request, {
    requiredScope: "websites:write",
  });
  if (auth instanceof Response) return auth;
  const { id } = await params;
  try {
    const body = patchSchema.parse(await request.json());
    const project = await updateWebsite(id, body as never, auth.actorId);
    return apiOk({ project });
  } catch (err) {
    return apiError(
      "VALIDATION_ERROR",
      factoryErrorMessage(err, "Update failed"),
    );
  }
}
