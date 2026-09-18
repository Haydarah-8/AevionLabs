import { authenticateApiRequest } from "@/features/website-factory/developer/auth";
import { apiError, apiOk } from "@/features/website-factory/application/http";
import {
  publishWebsiteLive,
  publishWebsitePreview,
} from "@/features/website-factory/application/website";
import { factoryErrorMessage } from "@/features/website-factory/services/schemas";
import { z } from "zod";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  mode: z.enum(["preview", "live"]).default("live"),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticateApiRequest(request, {
    requiredScope: "websites:write",
  });
  if (auth instanceof Response) return auth;
  const { id } = await params;
  try {
    const body = bodySchema.parse(await request.json().catch(() => ({})));
    if (body.mode === "preview") {
      return apiOk(await publishWebsitePreview(id, auth.actorId));
    }
    return apiOk(await publishWebsiteLive(id, auth.actorId));
  } catch (err) {
    return apiError(
      "INTERNAL_ERROR",
      factoryErrorMessage(err, "Publish failed"),
      [],
      500,
    );
  }
}
