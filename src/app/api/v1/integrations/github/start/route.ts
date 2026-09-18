import { authenticateApiRequest } from "@/features/website-factory/developer/auth";
import { apiError, apiOk } from "@/features/website-factory/application/http";
import { githubAuthorizeUrl } from "@/features/website-factory/application/integrations";
import { randomBytes } from "node:crypto";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await authenticateApiRequest(request, {
    requiredScope: "websites:write",
  });
  if (auth instanceof Response) return auth;
  if (auth.actorType !== "admin") {
    return apiError("FORBIDDEN", "Admin session required for GitHub OAuth", [], 403);
  }
  const state = randomBytes(16).toString("hex");
  const url = githubAuthorizeUrl(state);
  if (!url) {
    return apiError(
      "INTEGRATION_ERROR",
      "GitHub OAuth is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.",
      [],
      400,
    );
  }
  return apiOk({ authorizeUrl: url, state });
}
