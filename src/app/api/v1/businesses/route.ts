import { authenticateApiRequest } from "@/features/website-factory/developer/auth";
import { apiOk } from "@/features/website-factory/application/http";
import { listBusinesses } from "@/features/website-factory/services/store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await authenticateApiRequest(request, {
    requiredScope: "businesses:read",
  });
  if (auth instanceof Response) return auth;
  const businesses = await listBusinesses();
  return apiOk(businesses, { count: businesses.length });
}
