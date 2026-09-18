import { NextResponse } from "next/server";
import { getAdminUser, isAdminRequest } from "@/lib/admin-auth";
import {
  createApiKey,
  listApiKeys,
  revokeApiKey,
  API_SCOPES,
} from "@/features/website-factory/application/api-keys";
import { factoryErrorMessage } from "@/features/website-factory/services/schemas";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ keys: await listApiKeys(), scopes: API_SCOPES });
}

export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const user = await getAdminUser();
    const body = z
      .object({
        name: z.string().min(1).max(120),
        scopes: z.array(z.string()).min(1),
      })
      .parse(await request.json());
    const created = await createApiKey({
      name: body.name,
      scopes: body.scopes,
      createdBy: user?.id ?? null,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: factoryErrorMessage(err, "Could not create API key") },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  const user = await getAdminUser();
  await revokeApiKey(id, user?.id ?? null);
  return NextResponse.json({ ok: true });
}
