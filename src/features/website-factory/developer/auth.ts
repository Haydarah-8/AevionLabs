import { getAdminUser, isAdminRequest } from "@/lib/admin-auth";
import {
  authenticateApiKey,
  requireScope,
  type ApiScope,
} from "../application/api-keys";
import { apiError } from "../application/http";
import { rateLimit } from "../application/rate-limit";

export type ApiAuthContext = {
  actorId: string | null;
  actorType: "admin" | "api_key";
  scopes: Set<string>;
  keyId?: string;
};

export async function authenticateApiRequest(
  request: Request,
  options?: { requiredScope?: ApiScope; rateKey?: string; limit?: number },
): Promise<ApiAuthContext | Response> {
  const limit = rateLimit({
    key: options?.rateKey || `v1:${request.headers.get("x-forwarded-for") || "local"}`,
    limit: options?.limit ?? 120,
    windowMs: 60_000,
  });
  if (!limit.ok) {
    return apiError("RATE_LIMITED", "Rate limit exceeded", [], 429);
  }

  const auth = request.headers.get("authorization") || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";

  if (bearer.startsWith("ae_live_")) {
    const result = await authenticateApiKey(bearer);
    if (!result) return apiError("UNAUTHORIZED", "Invalid API key", [], 401);
    if (options?.requiredScope) {
      try {
        requireScope(result.scopes, options.requiredScope);
      } catch (err) {
        return apiError(
          "FORBIDDEN",
          err instanceof Error ? err.message : "Forbidden",
          [],
          403,
        );
      }
    }
    return {
      actorId: result.key.createdBy,
      actorType: "api_key",
      scopes: result.scopes,
      keyId: result.key.id,
    };
  }

  if (await isAdminRequest(request)) {
    const user = await getAdminUser();
    const scopes = new Set<string>([
      "websites:read",
      "websites:write",
      "pages:read",
      "pages:write",
      "assets:read",
      "assets:write",
      "templates:read",
      "themes:read",
      "themes:write",
      "businesses:read",
      "webhooks:read",
      "webhooks:write",
      "deployments:read",
      "deployments:write",
      "domains:read",
      "domains:write",
      "mcp:use",
    ]);
    if (options?.requiredScope && !scopes.has(options.requiredScope)) {
      return apiError("FORBIDDEN", `Missing scope: ${options.requiredScope}`, [], 403);
    }
    return {
      actorId: user?.id ?? null,
      actorType: "admin",
      scopes,
    };
  }

  return apiError("UNAUTHORIZED", "Authentication required", [], 401);
}
