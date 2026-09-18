import { authenticateApiRequest } from "@/features/website-factory/developer/auth";
import { apiOk } from "@/features/website-factory/application/http";
import { SKILL_PACKAGES } from "@/features/website-factory/developer/skills-packages";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await authenticateApiRequest(request, {
    requiredScope: "websites:read",
  });
  if (auth instanceof Response) return auth;
  return apiOk(
    SKILL_PACKAGES.map(({ id, name, description, files }) => ({
      id,
      name,
      description,
      files: Object.keys(files),
      downloadPath: `/api/admin/developer/skills/${id}/zip`,
    })),
    { count: SKILL_PACKAGES.length },
  );
}
