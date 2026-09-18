import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isMissingTable } from "../services/persistence";
import { emitFactoryEvent } from "./events";

export type IntegrationStatus =
  | "not_connected"
  | "connecting"
  | "connected"
  | "expired"
  | "revoked"
  | "error";

export type IntegrationRecord = {
  id: string;
  provider: string;
  status: IntegrationStatus;
  accountLabel: string;
  meta: Record<string, unknown>;
  connectedAt: string | null;
  updatedAt: string;
};

const FILE = path.join(process.cwd(), "data", "factory-integrations.json");

type Stored = IntegrationRecord & { encryptedCredentials: string };

async function loadAll(): Promise<Stored[]> {
  try {
    return JSON.parse(await readFile(FILE, "utf8")) as Stored[];
  } catch {
    return [];
  }
}

async function saveAll(items: Stored[]) {
  await mkdir(path.dirname(FILE), { recursive: true });
  await writeFile(FILE, JSON.stringify(items, null, 2), "utf8");
}

export async function getIntegration(provider: string): Promise<IntegrationRecord | null> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("factory_integrations")
      .select("*")
      .eq("provider", provider)
      .maybeSingle();
    if (!error && data) {
      return {
        id: String(data.id),
        provider: String(data.provider),
        status: data.status as IntegrationStatus,
        accountLabel: String(data.account_label ?? ""),
        meta: (data.meta as Record<string, unknown>) || {},
        connectedAt: data.connected_at ? String(data.connected_at) : null,
        updatedAt: String(data.updated_at),
      };
    }
  } catch {
    /* fall through */
  }
  const item = (await loadAll()).find((row) => row.provider === provider);
  if (!item) return null;
  const { encryptedCredentials: _, ...pub } = item;
  return pub;
}

export async function listIntegrations() {
  const providers = ["github", "vercel", "cursor", "claude", "codex"];
  const out: IntegrationRecord[] = [];
  for (const provider of providers) {
    const existing = await getIntegration(provider);
    out.push(
      existing || {
        id: provider,
        provider,
        status: "not_connected",
        accountLabel: "",
        meta: {},
        connectedAt: null,
        updatedAt: new Date().toISOString(),
      },
    );
  }
  return out;
}

export async function upsertIntegration(input: {
  provider: string;
  status: IntegrationStatus;
  accountLabel?: string;
  meta?: Record<string, unknown>;
  credentials?: string;
  connectedBy?: string | null;
}) {
  const now = new Date().toISOString();
  const record: Stored = {
    id: crypto.randomUUID(),
    provider: input.provider,
    status: input.status,
    accountLabel: input.accountLabel || "",
    meta: input.meta || {},
    encryptedCredentials: input.credentials || "",
    connectedAt: input.status === "connected" ? now : null,
    updatedAt: now,
  };

  try {
    const { error } = await getSupabaseAdmin().from("factory_integrations").upsert(
      {
        provider: record.provider,
        status: record.status,
        account_label: record.accountLabel,
        meta: record.meta,
        encrypted_credentials: record.encryptedCredentials,
        connected_by: input.connectedBy ?? null,
        connected_at: record.connectedAt,
        updated_at: record.updatedAt,
      },
      { onConflict: "provider" },
    );
    if (error && !isMissingTable(error)) throw new Error(error.message);
  } catch {
    /* file fallback */
  }

  const items = await loadAll();
  const next = items.filter((item) => item.provider !== record.provider);
  next.unshift(record);
  await saveAll(next);

  if (input.provider === "github" && input.status === "connected") {
    await emitFactoryEvent({
      name: "github.connected",
      resourceType: "integration",
      resourceId: input.provider,
      actorId: input.connectedBy,
    });
  }

  const { encryptedCredentials: _, ...pub } = record;
  return pub;
}

export type IntegrationProvider = {
  id: string;
  authorizeUrl: (state: string) => string | null;
  getStatus: () => Promise<IntegrationRecord>;
  disconnect: () => Promise<void>;
};

export function githubAuthorizeUrl(state: string) {
  const clientId = process.env.GITHUB_CLIENT_ID?.trim();
  if (!clientId) return null;
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3005";
  const redirect = `${site.replace(/\/$/, "")}/api/v1/integrations/github/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirect,
    scope: "repo read:user",
    state,
  });
  return `https://github.com/login/oauth/authorize?${params}`;
}

export async function exchangeGithubCode(code: string) {
  const clientId = process.env.GITHUB_CLIENT_ID?.trim();
  const clientSecret = process.env.GITHUB_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new Error("GitHub OAuth is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.");
  }
  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
    }),
  });
  const json = (await res.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };
  if (!json.access_token) {
    throw new Error(json.error_description || json.error || "GitHub OAuth failed");
  }
  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${json.access_token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "AevionWebsiteFactory",
    },
  });
  const user = (await userRes.json()) as { login?: string };
  return {
    token: json.access_token,
    login: user.login || "github",
  };
}
