import { authenticateApiRequest } from "@/features/website-factory/developer/auth";
import { apiError, apiOk } from "@/features/website-factory/application/http";
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
  const auth = await authenticateApiRequest(request, {
    requiredScope: "webhooks:read",
  });
  if (auth instanceof Response) return auth;
  const webhooks = await listWebhooks();
  return apiOk(
    { webhooks, events: WEBHOOK_EVENTS },
    { count: webhooks.length },
  );
}

export async function POST(request: Request) {
  const auth = await authenticateApiRequest(request, {
    requiredScope: "webhooks:write",
  });
  if (auth instanceof Response) return auth;
  try {
    const body = z
      .object({
        name: z.string().min(1).max(120),
        url: z.string().url(),
        events: z.array(z.string()).default([]),
      })
      .parse(await request.json());
    const created = await createWebhook(body);
    return apiOk(created, {}, { status: 201 });
  } catch (err) {
    return apiError(
      "VALIDATION_ERROR",
      factoryErrorMessage(err, "Could not create webhook"),
    );
  }
}

export async function DELETE(request: Request) {
  const auth = await authenticateApiRequest(request, {
    requiredScope: "webhooks:write",
  });
  if (auth instanceof Response) return auth;
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return apiError("VALIDATION_ERROR", "id required");
  await deleteWebhook(id);
  return apiOk({ ok: true });
}
