"use client";

import { useEffect, useState } from "react";
import { API_SCOPES } from "@/features/website-factory/developer/scopes";
import { DeveloperNav } from "@/features/website-factory/developer/DeveloperNav";

type KeyRow = {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  revokedAt: string | null;
  createdAt: string;
};

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<KeyRow[]>([]);
  const [name, setName] = useState("Studio key");
  const [scopes, setScopes] = useState<string[]>([
    "websites:read",
    "websites:write",
    "mcp:use",
  ]);
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/admin/developer/api-keys");
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to load");
    setKeys(json.keys || []);
  }

  useEffect(() => {
    void load().catch((err) => setError(err.message));
  }, []);

  async function create() {
    setError("");
    setSecret("");
    const res = await fetch("/api/admin/developer/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, scopes }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Create failed");
    setSecret(json.secret);
    await load();
  }

  async function revoke(id: string) {
    const res = await fetch(`/api/admin/developer/api-keys?id=${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error || "Revoke failed");
    }
    await load();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <DeveloperNav />
      <div>
        <h1 className="text-2xl font-semibold text-white">API keys</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Hashed keys for API v1 and MCP. Secrets are shown once.
        </p>
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {secret ? (
        <div className="rounded border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
          Copy now — this secret will not be shown again:
          <code className="mt-2 block break-all font-mono text-amber-50">{secret}</code>
        </div>
      ) : null}
      <form
        className="space-y-3 rounded border border-zinc-800 bg-zinc-950/60 p-4"
        onSubmit={(event) => {
          event.preventDefault();
          void create().catch((err) => setError(err.message));
        }}
      >
        <label className="block text-sm text-zinc-300">
          Name
          <input
            className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <fieldset className="space-y-1">
          <legend className="text-sm text-zinc-300">Scopes</legend>
          <div className="grid grid-cols-2 gap-1">
            {API_SCOPES.map((scope) => (
              <label key={scope} className="flex items-center gap-2 text-xs text-zinc-400">
                <input
                  type="checkbox"
                  checked={scopes.includes(scope)}
                  onChange={(event) => {
                    setScopes((prev) =>
                      event.target.checked
                        ? [...prev, scope]
                        : prev.filter((item) => item !== scope),
                    );
                  }}
                />
                {scope}
              </label>
            ))}
          </div>
        </fieldset>
        <button
          type="submit"
          className="rounded bg-white px-3 py-2 text-sm font-medium text-black"
        >
          Create key
        </button>
      </form>
      <ul className="space-y-2">
        {keys.map((key) => (
          <li
            key={key.id}
            className="flex items-center justify-between rounded border border-zinc-800 px-3 py-2 text-sm"
          >
            <div>
              <div className="font-medium text-zinc-100">{key.name}</div>
              <div className="text-xs text-zinc-500">
                {key.keyPrefix}… · {key.scopes.join(", ")}
                {key.revokedAt ? " · revoked" : ""}
              </div>
            </div>
            {!key.revokedAt ? (
              <button
                type="button"
                className="text-xs text-red-300"
                onClick={() =>
                  void revoke(key.id).catch((err) => setError(err.message))
                }
              >
                Revoke
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
