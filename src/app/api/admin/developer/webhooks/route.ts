import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import {
  createWebhook,
  deleteWebhook,
  listWebhooks,
  WEBHOOK_EVENTS,
} from "@/features/website-factory/application/webhooks";
import { factoryErrorMessage } from "@/features/website-factory/services/schemas";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    webhooks: await listWebhooks(),
    events: WEBHOOK_EVENTS,
  });
}

export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = z
      .object({
        name: z.string().min(1).max(120),
        url: z.string().url(),
        events: z.array(z.string()).default([]),
      })
      .parse(await request.json());
    const created = await createWebhook(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: factoryErrorMessage(err, "Could not create webhook") },
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
  await deleteWebhook(id);
  return NextResponse.json({ ok: true });
}
