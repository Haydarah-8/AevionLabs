import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { addDomain, getProjectBundle } from "@/features/website-factory/services/store";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const bundle = await getProjectBundle(id);
  if (!bundle) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const host = getSiteUrl().replace(/^https?:\/\//, "");
  return NextResponse.json({
    domains: bundle.domains,
    expected: [
      { type: "CNAME", name: "www", value: host },
      { type: "A/ALIAS", name: "@", value: "Use your host's apex record for this Next.js deployment" },
    ],
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const body = (await request.json()) as { hostname?: string };
    const domain = await addDomain(id, String(body.hostname || ""));
    return NextResponse.json({ domain }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not add domain" },
      { status: 400 },
    );
  }
}
