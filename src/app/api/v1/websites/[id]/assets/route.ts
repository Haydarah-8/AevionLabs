import { authenticateApiRequest } from "@/features/website-factory/developer/auth";
import { apiError, apiOk } from "@/features/website-factory/application/http";
import { listProjectAssets } from "@/features/website-factory/application/asset";
import { getProjectBundle } from "@/features/website-factory/services/store";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticateApiRequest(request, {
    requiredScope: "assets:read",
  });
  if (auth instanceof Response) return auth;
  const { id } = await params;
  const bundle = await getProjectBundle(id);
  if (!bundle) return apiError("NOT_FOUND", "Website not found", [], 404);
  const assets = await listProjectAssets(id);
  return apiOk(assets, { count: assets.length });
}
