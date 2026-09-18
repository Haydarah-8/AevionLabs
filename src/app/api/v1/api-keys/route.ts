import { authenticateApiRequest } from "@/features/website-factory/developer/auth";
import { apiError, apiOk } from "@/features/website-factory/application/http";
import {
  createApiKey,
  listApiKeys,
  revokeApiKey,
  API_SCOPES,
} from "@/features/website-factory/application/api-keys";
import { factoryErrorMessage } from "@/features/website-factory/services/schemas";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await authenticateApiRequest(request, {
    requiredScope: "websites:read",
  });
  if (auth instanceof Response) return auth;
  if (auth.actorType !== "admin") {
    return apiError("FORBIDDEN", "Admin session required to list keys", [], 403);
  }
  return apiOk(await listApiKeys(), { scopes: API_SCOPES });
}

const createSchema = z.object({
  name: z.string().min(1).max(120),
  scopes: z.array(z.string()).min(1),
});

export async function POST(request: Request) {
  const auth = await authenticateApiRequest(request, {
    requiredScope: "websites:write",
  });
  if (auth instanceof Response) return auth;
  if (auth.actorType !== "admin") {
    return apiError("FORBIDDEN", "Admin session required to create keys", [], 403);
  }
  try {
    const body = createSchema.parse(await request.json());
    const created = await createApiKey({
      name: body.name,
      scopes: body.scopes,
      createdBy: auth.actorId,
    });
    return apiOk(created, {}, { status: 201 });
  } catch (err) {
    return apiError(
      "VALIDATION_ERROR",
      factoryErrorMessage(err, "Could not create API key"),
    );
  }
}

export async function DELETE(request: Request) {
  const auth = await authenticateApiRequest(request, {
    requiredScope: "websites:write",
  });
  if (auth instanceof Response) return auth;
  if (auth.actorType !== "admin") {
    return apiError("FORBIDDEN", "Admin session required", [], 403);
  }
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return apiError("VALIDATION_ERROR", "id is required");
  await revokeApiKey(id, auth.actorId);
  return apiOk({ revoked: true });
}
