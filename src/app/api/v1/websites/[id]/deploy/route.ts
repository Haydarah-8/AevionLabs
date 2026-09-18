import { authenticateApiRequest } from "@/features/website-factory/developer/auth";
import { apiError, apiOk } from "@/features/website-factory/application/http";
import {
  deployWebsite,
  getDeploymentStatus,
} from "@/features/website-factory/application/deployment";
import { factoryErrorMessage } from "@/features/website-factory/services/schemas";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await authenticateApiRequest(request, {
    requiredScope: "deployments:read",
  });
  if (auth instanceof Response) return auth;
  return apiOk(await getDeploymentStatus());
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticateApiRequest(request, {
    requiredScope: "deployments:write",
  });
  if (auth instanceof Response) return auth;
  const { id } = await params;
  try {
    const result = await deployWebsite(id, auth.actorId);
    return apiOk(result);
  } catch (err) {
    const message = factoryErrorMessage(err, "Deploy failed");
    const configured = !/not configured/i.test(message);
    return apiError(
      configured ? "DEPLOYMENT_FAILED" : "INTEGRATION_ERROR",
      message,
      [{ configured }],
      configured ? 500 : 400,
    );
  }
}
