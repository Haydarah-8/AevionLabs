import { listIntegrations } from "@/features/website-factory/application/integrations";
import { authenticateApiRequest } from "@/features/website-factory/developer/auth";
import { apiOk } from "@/features/website-factory/application/http";
import { getDeploymentStatus } from "@/features/website-factory/application/deployment";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await authenticateApiRequest(request, {
    requiredScope: "websites:read",
  });
  if (auth instanceof Response) return auth;
  const integrations = await listIntegrations();
  const vercel = await getDeploymentStatus();
  return apiOk({
    integrations,
    vercel,
    githubConfigured: Boolean(process.env.GITHUB_CLIENT_ID?.trim()),
  });
}
