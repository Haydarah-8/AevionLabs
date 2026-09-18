import { authenticateApiRequest } from "@/features/website-factory/developer/auth";
import { apiError, apiOk } from "@/features/website-factory/application/http";
import { addDomain, getProjectBundle } from "@/features/website-factory/services/store";
import { getSiteUrl } from "@/lib/site";
import { factoryErrorMessage } from "@/features/website-factory/services/schemas";
import { emitFactoryEvent } from "@/features/website-factory/application/events";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticateApiRequest(request, {
    requiredScope: "domains:read",
  });
  if (auth instanceof Response) return auth;
  const { id } = await params;
  const bundle = await getProjectBundle(id);
  if (!bundle) return apiError("NOT_FOUND", "Website not found", [], 404);
  const host = getSiteUrl().replace(/^https?:\/\//, "");
  return apiOk({
    domains: bundle.domains,
    expected: [
      { type: "CNAME", name: "www", value: host },
      {
        type: "A/ALIAS",
        name: "@",
        value: "Use your host's apex record for this Next.js deployment",
      },
    ],
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticateApiRequest(request, {
    requiredScope: "domains:write",
  });
  if (auth instanceof Response) return auth;
  const { id } = await params;
  try {
    const body = (await request.json()) as { hostname?: string };
    const domain = await addDomain(id, String(body.hostname || ""));
    await emitFactoryEvent({
      name: "domain.connected",
      projectId: id,
      resourceType: "domain",
      resourceId: String((domain as { id?: string }).id || body.hostname || ""),
      actorId: auth.actorId,
      meta: { hostname: body.hostname },
    });
    return apiOk(domain, {}, { status: 201 });
  } catch (err) {
    return apiError(
      "VALIDATION_ERROR",
      factoryErrorMessage(err, "Could not add domain"),
    );
  }
}
