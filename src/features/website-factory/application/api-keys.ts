import { createHash, randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isMissingTable } from "../services/persistence";
import { emitFactoryEvent } from "./events";
import { API_SCOPES, type ApiScope } from "../developer/scopes";

export { API_SCOPES, type ApiScope };

export type ApiKeyRecord = {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  createdBy: string | null;
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
};

const FILE = path.join(process.cwd(), "data", "factory-api-keys.json");

type StoredKey = ApiKeyRecord & { keyHash: string };

async function loadFile(): Promise<StoredKey[]> {
  try {
    return JSON.parse(await readFile(FILE, "utf8")) as StoredKey[];
  } catch {
    return [];
  }
}

async function saveFile(items: StoredKey[]) {
  await mkdir(path.dirname(FILE), { recursive: true });
  await writeFile(FILE, JSON.stringify(items, null, 2), "utf8");
}

export function hashApiKey(secret: string) {
  return createHash("sha256").update(secret).digest("hex");
}

function generateSecret() {
  return `ae_live_${randomBytes(24).toString("base64url")}`;
}

export async function createApiKey(input: {
  name: string;
  scopes: string[];
  createdBy?: string | null;
}) {
  const secret = generateSecret();
  const keyHash = hashApiKey(secret);
  const keyPrefix = secret.slice(0, 12);
  const record: StoredKey = {
    id: crypto.randomUUID(),
    name: input.name.trim() || "API key",
    keyPrefix,
    keyHash,
    scopes: input.scopes.filter((scope) =>
      (API_SCOPES as readonly string[]).includes(scope),
    ),
    createdBy: input.createdBy ?? null,
    lastUsedAt: null,
    revokedAt: null,
    createdAt: new Date().toISOString(),
  };

  try {
    const { error } = await getSupabaseAdmin().from("factory_api_keys").insert({
      id: record.id,
      name: record.name,
      key_prefix: record.keyPrefix,
      key_hash: record.keyHash,
      scopes: record.scopes,
      created_by: record.createdBy,
      created_at: record.createdAt,
    });
    if (error) {
      if (!isMissingTable(error)) throw new Error(error.message);
      const items = await loadFile();
      items.unshift(record);
      await saveFile(items);
    }
  } catch (err) {
    if (!isMissingTable(err)) {
      const items = await loadFile();
      items.unshift(record);
      await saveFile(items);
    } else {
      const items = await loadFile();
      items.unshift(record);
      await saveFile(items);
    }
  }

  await emitFactoryEvent({
    name: "api_key.created",
    resourceType: "api_key",
    resourceId: record.id,
    actorId: input.createdBy,
    meta: { name: record.name, scopes: record.scopes },
  });

  const { keyHash: _, ...publicRecord } = record;
  return { key: publicRecord, secret };
}

export async function listApiKeys(): Promise<ApiKeyRecord[]> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("factory_api_keys")
      .select("id,name,key_prefix,scopes,created_by,last_used_at,revoked_at,created_at")
      .order("created_at", { ascending: false });
    if (!error && data) {
      return data.map((row) => ({
        id: String(row.id),
        name: String(row.name),
        keyPrefix: String(row.key_prefix),
        scopes: Array.isArray(row.scopes) ? row.scopes.map(String) : [],
        createdBy: row.created_by ? String(row.created_by) : null,
        lastUsedAt: row.last_used_at ? String(row.last_used_at) : null,
        revokedAt: row.revoked_at ? String(row.revoked_at) : null,
        createdAt: String(row.created_at),
      }));
    }
  } catch {
    /* fall through */
  }
  return (await loadFile()).map(({ keyHash: _, ...item }) => item);
}

export async function revokeApiKey(id: string, actorId?: string | null) {
  const revokedAt = new Date().toISOString();
  try {
    const { error } = await getSupabaseAdmin()
      .from("factory_api_keys")
      .update({ revoked_at: revokedAt })
      .eq("id", id);
    if (error && !isMissingTable(error)) throw new Error(error.message);
    if (error && isMissingTable(error)) {
      const items = await loadFile();
      const next = items.map((item) =>
        item.id === id ? { ...item, revokedAt } : item,
      );
      await saveFile(next);
    }
  } catch {
    const items = await loadFile();
    await saveFile(
      items.map((item) => (item.id === id ? { ...item, revokedAt } : item)),
    );
  }
  await emitFactoryEvent({
    name: "api_key.revoked",
    resourceType: "api_key",
    resourceId: id,
    actorId,
  });
}

export async function authenticateApiKey(raw: string): Promise<{
  key: ApiKeyRecord;
  scopes: Set<string>;
} | null> {
  if (!raw?.startsWith("ae_live_")) return null;
  const keyHash = hashApiKey(raw);
  let stored: StoredKey | null = null;

  try {
    const { data, error } = await getSupabaseAdmin()
      .from("factory_api_keys")
      .select("*")
      .eq("key_hash", keyHash)
      .maybeSingle();
    if (!error && data) {
      stored = {
        id: String(data.id),
        name: String(data.name),
        keyPrefix: String(data.key_prefix),
        keyHash: String(data.key_hash),
        scopes: Array.isArray(data.scopes) ? data.scopes.map(String) : [],
        createdBy: data.created_by ? String(data.created_by) : null,
        lastUsedAt: data.last_used_at ? String(data.last_used_at) : null,
        revokedAt: data.revoked_at ? String(data.revoked_at) : null,
        createdAt: String(data.created_at),
      };
    }
  } catch {
    /* fall through */
  }

  if (!stored) {
    stored = (await loadFile()).find((item) => item.keyHash === keyHash) ?? null;
  }
  if (!stored || stored.revokedAt) return null;

  const lastUsedAt = new Date().toISOString();
  try {
    await getSupabaseAdmin()
      .from("factory_api_keys")
      .update({ last_used_at: lastUsedAt })
      .eq("id", stored.id);
  } catch {
    /* ignore */
  }

  const { keyHash: _, ...key } = stored;
  return { key: { ...key, lastUsedAt }, scopes: new Set(stored.scopes) };
}

export function requireScope(scopes: Set<string>, needed: ApiScope) {
  if (!scopes.has(needed)) {
    throw Object.assign(new Error(`Missing scope: ${needed}`), {
      code: "FORBIDDEN",
      status: 403,
    });
  }
}
