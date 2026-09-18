import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isMissingTable } from "../services/persistence";
import {
  emitFactoryEvent,
  onFactoryEvent,
  type FactoryEvent,
} from "./events";

export type AuditEntry = {
  id: string;
  actorId: string | null;
  actorType: string;
  action: string;
  resourceType: string;
  resourceId: string;
  projectId: string | null;
  result: string;
  meta: Record<string, unknown>;
  createdAt: string;
};

const FILE = path.join(process.cwd(), "data", "factory-audit.json");

async function loadFile(): Promise<AuditEntry[]> {
  try {
    return JSON.parse(await readFile(FILE, "utf8")) as AuditEntry[];
  } catch {
    return [];
  }
}

async function saveFile(entries: AuditEntry[]) {
  await mkdir(path.dirname(FILE), { recursive: true });
  await writeFile(FILE, JSON.stringify(entries.slice(0, 500), null, 2), "utf8");
}

export async function writeAudit(input: {
  action: string;
  actorId?: string | null;
  actorType?: string;
  resourceType?: string;
  resourceId?: string;
  projectId?: string | null;
  result?: string;
  meta?: Record<string, unknown>;
}) {
  const entry: AuditEntry = {
    id: crypto.randomUUID(),
    actorId: input.actorId ?? null,
    actorType: input.actorType || "system",
    action: input.action,
    resourceType: input.resourceType || "",
    resourceId: input.resourceId || "",
    projectId: input.projectId ?? null,
    result: input.result || "ok",
    meta: input.meta || {},
    createdAt: new Date().toISOString(),
  };

  try {
    const { error } = await getSupabaseAdmin().from("factory_audit_logs").insert({
      id: entry.id,
      actor_id: entry.actorId,
      actor_type: entry.actorType,
      action: entry.action,
      resource_type: entry.resourceType,
      resource_id: entry.resourceId,
      project_id: entry.projectId,
      result: entry.result,
      meta: entry.meta,
      created_at: entry.createdAt,
    });
    if (error) {
      if (!isMissingTable(error)) console.error("[audit] supabase", error.message);
      const items = await loadFile();
      items.unshift(entry);
      await saveFile(items);
    }
  } catch (err) {
    if (!isMissingTable(err)) console.error("[audit] write failed", err);
    const items = await loadFile();
    items.unshift(entry);
    await saveFile(items);
  }
  return entry;
}

export async function listAuditLogs(limit = 50) {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("factory_audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (!error && data) {
      return data.map((row) => ({
        id: String(row.id),
        actorId: row.actor_id ? String(row.actor_id) : null,
        actorType: String(row.actor_type ?? "system"),
        action: String(row.action),
        resourceType: String(row.resource_type ?? ""),
        resourceId: String(row.resource_id ?? ""),
        projectId: row.project_id ? String(row.project_id) : null,
        result: String(row.result ?? "ok"),
        meta: (row.meta as Record<string, unknown>) || {},
        createdAt: String(row.created_at),
      })) satisfies AuditEntry[];
    }
  } catch {
    /* fall through */
  }
  return (await loadFile()).slice(0, limit);
}

let wired = false;

export function wireAuditToEvents() {
  if (wired) return;
  wired = true;
  onFactoryEvent(async (event: FactoryEvent) => {
    await writeAudit({
      action: event.name,
      actorId: event.actorId,
      actorType: event.actorType,
      resourceType: event.resourceType,
      resourceId: event.resourceId,
      projectId: event.projectId,
      result: event.result,
      meta: event.meta,
    });
  });
}

// Auto-wire on import in server contexts.
wireAuditToEvents();

export { emitFactoryEvent };
