export type FactoryEventName =
  | "website.created"
  | "website.updated"
  | "website.published"
  | "deployment.started"
  | "deployment.completed"
  | "deployment.failed"
  | "domain.connected"
  | "domain.verified"
  | "asset.uploaded"
  | "scrape.started"
  | "scrape.completed"
  | "scrape.failed"
  | "api_key.created"
  | "api_key.revoked"
  | "mcp.tool_executed"
  | "webhook.delivered"
  | "github.connected"
  | "export.completed";

export type FactoryEvent = {
  name: FactoryEventName;
  projectId?: string;
  resourceType?: string;
  resourceId?: string;
  actorId?: string | null;
  actorType?: "admin" | "api_key" | "mcp" | "system";
  result?: "ok" | "error";
  meta?: Record<string, unknown>;
  at?: string;
};

type Listener = (event: FactoryEvent) => void | Promise<void>;

const listeners = new Set<Listener>();

export function onFactoryEvent(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function emitFactoryEvent(event: FactoryEvent) {
  const payload: FactoryEvent = {
    ...event,
    at: event.at || new Date().toISOString(),
    actorType: event.actorType || "system",
    result: event.result || "ok",
    meta: event.meta || {},
  };
  for (const listener of listeners) {
    try {
      await listener(payload);
    } catch (err) {
      console.error("[factory-events] listener failed", err);
    }
  }
}
