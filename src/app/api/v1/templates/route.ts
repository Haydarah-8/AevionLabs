import { authenticateApiRequest } from "@/features/website-factory/developer/auth";
import { apiOk } from "@/features/website-factory/application/http";
import { listTemplates } from "@/features/website-factory/services/store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await authenticateApiRequest(request, {
    requiredScope: "templates:read",
  });
  if (auth instanceof Response) return auth;
  const templates = await listTemplates();
  return apiOk(templates, { count: templates.length });
}
