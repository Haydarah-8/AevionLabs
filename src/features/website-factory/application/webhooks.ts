import { createHmac, randomBytes, createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isMissingTable } from "../services/persistence";
import { onFactoryEvent, type FactoryEvent, type FactoryEventName } from "./events";

export type WebhookRecord = {
  id: string;
  name: string;
  url: string;
  secretPrefix: string;
  events: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

type StoredWebhook = WebhookRecord & { secretHash: string; secret: string };

const FILE = path.join(process.cwd(), "data", "factory-webhooks.json");
const DELIVERIES = path.join(process.cwd(), "data", "factory-webhook-deliveries.json");

async function loadWebhooks(): Promise<StoredWebhook[]> {
  try {
    return JSON.parse(await readFile(FILE, "utf8")) as StoredWebhook[];
  } catch {
    return [];
  }
}

async function saveWebhooks(items: StoredWebhook[]) {
  await mkdir(path.dirname(FILE), { recursive: true });
  await writeFile(FILE, JSON.stringify(items, null, 2), "utf8");
}

async function loadDeliveries() {
  try {
    return JSON.parse(await readFile(DELIVERIES, "utf8")) as Array<Record<string, unknown>>;
  } catch {
    return [];
  }
}

async function saveDeliveries(items: Array<Record<string, unknown>>) {
  await mkdir(path.dirname(DELIVERIES), { recursive: true });
  await writeFile(DELIVERIES, JSON.stringify(items.slice(0, 200), null, 2), "utf8");
}

function hashSecret(secret: string) {
  return createHash("sha256").update(secret).digest("hex");
}

export function signWebhookPayload(secret: string, body: string) {
  return createHmac("sha256", secret).update(body).digest("hex");
}

export async function createWebhook(input: {
  name: string;
  url: string;
  events: string[];
}) {
  const secret = `whsec_${randomBytes(24).toString("base64url")}`;
  const record: StoredWebhook = {
    id: crypto.randomUUID(),
    name: input.name.trim() || "Webhook",
    url: input.url.trim(),
    secret,
    secretHash: hashSecret(secret),
    secretPrefix: secret.slice(0, 10),
    events: input.events,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const { error } = await getSupabaseAdmin().from("factory_webhooks").insert({
      id: record.id,
      name: record.name,
      url: record.url,
      secret_hash: record.secretHash,
      secret_prefix: record.secretPrefix,
      events: record.events,
      active: true,
      created_at: record.createdAt,
      updated_at: record.updatedAt,
    });
    if (error) {
      if (!isMissingTable(error)) throw new Error(error.message);
      const items = await loadWebhooks();
      items.unshift(record);
      await saveWebhooks(items);
    } else {
      // Keep plaintext secret only in file fallback for delivery signing when DB has hash only.
      const items = await loadWebhooks();
      items.unshift(record);
      await saveWebhooks(items);
    }
  } catch {
    const items = await loadWebhooks();
    items.unshift(record);
    await saveWebhooks(items);
  }

  const { secretHash: _, secret: s, ...pub } = record;
  return { webhook: pub, secret: s };
}

export async function listWebhooks(): Promise<WebhookRecord[]> {
  const items = await loadWebhooks();
  return items.map(({ secret: _s, secretHash: _h, ...item }) => item);
}

export async function deleteWebhook(id: string) {
  try {
    await getSupabaseAdmin().from("factory_webhooks").delete().eq("id", id);
  } catch {
    /* ignore */
  }
  await saveWebhooks((await loadWebhooks()).filter((item) => item.id !== id));
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

async function postOnce(webhook: StoredWebhook, body: string, eventName: string) {
  const signature = signWebhookPayload(webhook.secret, body);
  try {
    const res = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Aevion-Signature": signature,
        "X-Aevion-Event": eventName,
      },
      body,
      signal: AbortSignal.timeout(8000),
    });
    return {
      ok: res.ok,
      responseStatus: res.status,
      error: res.ok ? "" : `HTTP ${res.status}`,
    };
  } catch (err) {
    return {
      ok: false,
      responseStatus: null as number | null,
      error: err instanceof Error ? err.message : "Delivery failed",
    };
  }
}

async function deliver(webhook: StoredWebhook, event: FactoryEvent) {
  const payload = {
    id: crypto.randomUUID(),
    event: event.name,
    created_at: event.at || new Date().toISOString(),
    data: {
      projectId: event.projectId,
      resourceType: event.resourceType,
      resourceId: event.resourceId,
      meta: event.meta,
      result: event.result,
    },
  };
  const body = JSON.stringify(payload);
  let status = "failed";
  let responseStatus: number | null = null;
  let error = "";
  let attempt = 0;
  const maxAttempts = 3;
  const backoffs = [0, 400, 1200];

  for (let i = 0; i < maxAttempts; i++) {
    attempt = i + 1;
    if (backoffs[i]) await sleep(backoffs[i]);
    const result = await postOnce(webhook, body, event.name);
    responseStatus = result.responseStatus;
    error = result.error;
    if (result.ok) {
      status = "delivered";
      break;
    }
  }

  const delivery = {
    id: crypto.randomUUID(),
    webhookId: webhook.id,
    event: event.name,
    payload,
    status,
    attempt,
    responseStatus,
    error,
    createdAt: new Date().toISOString(),
    deliveredAt: status === "delivered" ? new Date().toISOString() : null,
  };
  const deliveries = await loadDeliveries();
  deliveries.unshift(delivery);
  await saveDeliveries(deliveries);
  return delivery;
}

export async function listWebhookDeliveries(webhookId?: string) {
  const items = await loadDeliveries();
  if (!webhookId) return items;
  return items.filter((d) => d.webhookId === webhookId);
}

export async function retryWebhookDelivery(deliveryId: string) {
  const deliveries = await loadDeliveries();
  const existing = deliveries.find((d) => d.id === deliveryId);
  if (!existing) throw new Error("Delivery not found");
  const hooks = await loadWebhooks();
  const webhook = hooks.find((h) => h.id === existing.webhookId);
  if (!webhook) throw new Error("Webhook not found");

  const body = JSON.stringify(existing.payload);
  const result = await postOnce(webhook, body, String(existing.event));
  const retry = {
    id: crypto.randomUUID(),
    webhookId: webhook.id,
    event: existing.event,
    payload: existing.payload,
    status: result.ok ? "delivered" : "failed",
    attempt: Number(existing.attempt || 1) + 1,
    responseStatus: result.responseStatus,
    error: result.error,
    createdAt: new Date().toISOString(),
    deliveredAt: result.ok ? new Date().toISOString() : null,
    retriedFrom: deliveryId,
  };
  deliveries.unshift(retry);
  await saveDeliveries(deliveries);
  return retry;
}

let wired = false;

export function wireWebhooksToEvents() {
  if (wired) return;
  wired = true;
  onFactoryEvent(async (event) => {
    const hooks = await loadWebhooks();
    for (const hook of hooks) {
      if (!hook.active) continue;
      if (hook.events.length && !hook.events.includes(event.name)) continue;
      try {
        await deliver(hook, event);
      } catch (err) {
        console.error("[webhooks] deliver failed", err);
      }
    }
  });
}

wireWebhooksToEvents();

export const WEBHOOK_EVENTS: FactoryEventName[] = [
  "website.created",
  "website.updated",
  "website.published",
  "deployment.started",
  "deployment.completed",
  "deployment.failed",
  "domain.connected",
  "domain.verified",
  "asset.uploaded",
  "scrape.started",
  "scrape.completed",
  "scrape.failed",
];
