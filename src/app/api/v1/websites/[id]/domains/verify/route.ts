import { authenticateApiRequest } from "@/features/website-factory/developer/auth";
import { apiError, apiOk } from "@/features/website-factory/application/http";
import { getProjectBundle } from "@/features/website-factory/services/store";
import { getSiteUrl } from "@/lib/site";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { emitFactoryEvent } from "@/features/website-factory/application/events";
import { promises as dns } from "dns";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticateApiRequest(request, {
    requiredScope: "domains:write",
  });
  if (auth instanceof Response) return auth;
  const { id } = await params;
  const bundle = await getProjectBundle(id);
  if (!bundle) return apiError("NOT_FOUND", "Website not found", [], 404);
  const body = (await request.json().catch(() => ({}))) as { hostname?: string };
  const domain =
    bundle.domains.find((item) => item.hostname === body.hostname) ??
    bundle.domains[0];
  if (!domain) {
    return apiError("VALIDATION_ERROR", "No domain to verify");
  }
  const expected = getSiteUrl().replace(/^https?:\/\//, "");
  let verified = false;
  let detail = "";
  try {
    const cname = await dns.resolveCname(domain.hostname);
    verified = cname.some((value) =>
      value.replace(/\.$/, "").includes(expected),
    );
    detail = cname.join(", ");
  } catch {
    try {
      const txt = await dns.resolveTxt(`_aevion-verify.${domain.hostname}`);
      verified = txt.flat().some((value) => value.includes(bundle.project.slug));
      detail = txt.flat().join(" ");
    } catch (err) {
      detail = err instanceof Error ? err.message : "DNS lookup failed";
    }
  }

  try {
    await getSupabaseAdmin()
      .from("website_domains")
      .update({
        status: verified ? "verified" : "failed",
        ssl_status: verified ? "pending" : "unknown",
        verified_at: verified ? new Date().toISOString() : null,
      })
      .eq("id", domain.id);
  } catch {
    /* file fallback may not have supabase row */
  }

  await emitFactoryEvent({
    name: verified ? "domain.verified" : "domain.connected",
    projectId: id,
    resourceType: "domain",
    resourceId: domain.id,
    actorId: auth.actorId,
    result: verified ? "ok" : "error",
    meta: { hostname: domain.hostname, detail },
  });

  return apiOk({
    verified,
    hostname: domain.hostname,
    detail,
    status: verified ? "verified" : "failed",
  });
}
