import { promises as dns } from "dns";
import { NextResponse } from "next/server";
import { getAdminUser, isAdminRequest } from "@/lib/admin-auth";
import { getProjectBundle } from "@/features/website-factory/services/store";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getSiteUrl } from "@/lib/site";
import { emitFactoryEvent } from "@/features/website-factory/application/events";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const bundle = await getProjectBundle(id);
  if (!bundle) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = (await request.json().catch(() => ({}))) as { hostname?: string };
  const domain =
    bundle.domains.find((item) => item.hostname === body.hostname) ??
    bundle.domains[0];
  if (!domain) {
    return NextResponse.json({ error: "No domain to verify" }, { status: 400 });
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
  const { error } = await getSupabaseAdmin()
    .from("website_domains")
    .update({
      status: verified ? "verified" : "failed",
      ssl_status: verified ? "pending" : "unknown",
      verified_at: verified ? new Date().toISOString() : null,
    })
    .eq("id", domain.id);
  if (error) throw new Error(error.message);

  const user = await getAdminUser();
  await emitFactoryEvent({
    name: verified ? "domain.verified" : "domain.connected",
    projectId: id,
    resourceType: "domain",
    resourceId: domain.id,
    actorId: user?.id ?? null,
    result: verified ? "ok" : "error",
    meta: { hostname: domain.hostname, detail },
  });

  return NextResponse.json({
    verified,
    hostname: domain.hostname,
    detail,
    status: verified ? "verified" : "failed",
  });
}
