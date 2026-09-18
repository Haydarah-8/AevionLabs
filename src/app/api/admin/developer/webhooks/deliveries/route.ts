import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import {
  listWebhookDeliveries,
  retryWebhookDelivery,
} from "@/features/website-factory/application/webhooks";
import { factoryErrorMessage } from "@/features/website-factory/services/schemas";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const webhookId = new URL(req.url).searchParams.get("webhookId") || undefined;
  const deliveries = await listWebhookDeliveries(webhookId || undefined);
  return NextResponse.json({ deliveries });
}

export async function POST(req: Request) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await req.json().catch(() => ({}))) as { deliveryId?: string };
    if (!body.deliveryId) {
      return NextResponse.json({ error: "deliveryId required" }, { status: 400 });
    }
    const delivery = await retryWebhookDelivery(body.deliveryId);
    return NextResponse.json({ delivery });
  } catch (err) {
    return NextResponse.json(
      { error: factoryErrorMessage(err, "Retry failed") },
      { status: 400 },
    );
  }
}
