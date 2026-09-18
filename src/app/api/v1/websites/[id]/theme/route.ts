import { authenticateApiRequest } from "@/features/website-factory/developer/auth";
import { apiError, apiOk } from "@/features/website-factory/application/http";
import { getTheme, updateTheme } from "@/features/website-factory/application/theme";
import { factoryErrorMessage } from "@/features/website-factory/services/schemas";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticateApiRequest(request, {
    requiredScope: "themes:read",
  });
  if (auth instanceof Response) return auth;
  const { id } = await params;
  const theme = await getTheme(id);
  if (!theme) return apiError("NOT_FOUND", "Theme not found", [], 404);
  return apiOk(theme);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticateApiRequest(request, {
    requiredScope: "themes:write",
  });
  if (auth instanceof Response) return auth;
  const { id } = await params;
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const theme = await updateTheme(id, body as never, auth.actorId);
    return apiOk(theme);
  } catch (err) {
    return apiError(
      "VALIDATION_ERROR",
      factoryErrorMessage(err, "Could not update theme"),
    );
  }
}
