"use client";

import { useEffect, useMemo, useState } from "react";
import { DeveloperNav } from "@/features/website-factory/developer/DeveloperNav";
import {
  clientInstallPayload,
  type ConnectClient,
} from "@/features/website-factory/developer/connect";
import { CONNECT_DEFAULT_SCOPES } from "@/features/website-factory/platform/pillars";

export default function ConnectPage() {
  const [host, setHost] = useState("http://localhost:3005");
  const [client, setClient] = useState<ConnectClient>("cursor");
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState("");
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState<{
    integrations: Array<{
      provider: string;
      status: string;
      accountLabel: string;
    }>;
    vercel: { configured: boolean; message: string; provider: string };
    githubConfigured: boolean;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") setHost(window.location.origin);
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected"))
      setNotice(`Connected: ${params.get("connected")}`);
    if (params.get("error")) setError(params.get("error") || "OAuth error");
    void fetch("/api/v1/integrations")
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok)
          throw new Error(json.error?.message || json.error || "Failed");
        setData(json.data);
      })
      .catch((err) => setError(err.message));
  }, []);

  const payload = useMemo(() => {
    const key = secret || "ae_live_YOUR_KEY";
    return clientInstallPayload(client, host, key);
  }, [client, host, secret]);

  const webInstall =
    client === "cursor" && secret
      ? `https://cursor.com/en/install-mcp?name=${encodeURIComponent("aevion")}&config=${encodeURIComponent(
          btoa(
            unescape(
              encodeURIComponent(
                JSON.stringify({
                  url: `${host.replace(/\/$/, "")}/api/mcp`,
                  headers: { Authorization: `Bearer ${secret}` },
                }),
              ),
            ),
          ),
        )}`
      : null;

  async function createAndConnect() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/admin/developer/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Connect ${client} ${new Date().toISOString().slice(0, 10)}`,
          scopes: [...CONNECT_DEFAULT_SCOPES],
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not create key");
      const key = json.secret as string;
      if (!key) throw new Error("No secret returned");
      setSecret(key);
      setNotice(
        "API key created. Use Open in Cursor / Copy config now — secret shown once.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connect failed");
    } finally {
      setBusy(false);
    }
  }

  async function startGithub() {
    setError("");
    const res = await fetch("/api/v1/integrations/github/start", {
      method: "POST",
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(
        json.error?.message || json.error || "GitHub not configured",
      );
    }
    window.location.href = json.data.authorizeUrl;
  }

  function copy(label: string, text: string) {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(""), 2000);
    });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <DeveloperNav />
      <div>
        <p className="text-xs uppercase tracking-wide text-zinc-500">
          Aevion Connect
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-white">
          Connect external tools
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          One flow: mint a scoped API key, then install MCP into Cursor
          (one-click deeplink), Claude, or Codex. GitHub and Vercel stay honest
          — no fake success.
        </p>
      </div>
      {notice ? <p className="text-sm text-emerald-400">{notice}</p> : null}
      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <section className="space-y-4 rounded border border-zinc-800 p-4">
        <h2 className="font-medium text-zinc-100">1. Choose client</h2>
        <div className="flex flex-wrap gap-2">
          {(["cursor", "claude", "codex"] as const).map((id) => (
            <button
              key={id}
              type="button"
              className={`rounded-full px-3 py-1.5 text-sm capitalize ${
                client === id
                  ? "bg-white text-black"
                  : "border border-zinc-700 text-zinc-300"
              }`}
              onClick={() => setClient(id)}
            >
              {id}
            </button>
          ))}
        </div>

        <h2 className="font-medium text-zinc-100">2. Create install key</h2>
        <button
          type="button"
          className="rounded bg-white px-3 py-2 text-sm text-black disabled:opacity-40"
          disabled={busy}
          onClick={() => void createAndConnect()}
        >
          {busy ? "Creating…" : "Create key + prepare install"}
        </button>
        {secret ? (
          <div className="rounded border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-50">
            Secret (once): <code className="break-all">{secret}</code>
          </div>
        ) : null}

        <h2 className="font-medium text-zinc-100">
          3. Install {payload.label}
        </h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-zinc-500">
          {payload.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <pre className="overflow-auto rounded bg-zinc-950 p-3 text-xs text-zinc-300">
          {JSON.stringify(payload.json, null, 2)}
        </pre>
        <div className="flex flex-wrap gap-2">
          {payload.deeplink && secret ? (
            <a
              className="rounded bg-white px-3 py-2 text-sm text-black"
              href={payload.deeplink}
            >
              Open in Cursor
            </a>
          ) : null}
          {webInstall ? (
            <a
              className="rounded border border-zinc-600 px-3 py-2 text-sm text-zinc-200"
              href={webInstall}
              target="_blank"
              rel="noreferrer"
            >
              Cursor web install link
            </a>
          ) : null}
          <button
            type="button"
            className="rounded border border-zinc-700 px-3 py-2 text-sm text-zinc-200"
            onClick={() => copy("json", JSON.stringify(payload.json, null, 2))}
          >
            {copied === "json" ? "Copied" : "Copy JSON"}
          </button>
          {secret ? (
            <button
              type="button"
              className="rounded border border-zinc-700 px-3 py-2 text-sm text-zinc-200"
              onClick={() => copy("key", secret)}
            >
              {copied === "key" ? "Copied" : "Copy key"}
            </button>
          ) : null}
        </div>
        {!secret ? (
          <p className="text-xs text-zinc-600">
            Create a key first so Open in Cursor embeds a real bearer token.
          </p>
        ) : null}
      </section>

      <section className="rounded border border-zinc-800 p-4">
        <h2 className="font-medium text-zinc-100">GitHub</h2>
        <p className="mt-1 text-sm text-zinc-400">
          {data?.githubConfigured
            ? "OAuth ready — connect to export full site files as a PR."
            : "Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to enable."}
        </p>
        <button
          type="button"
          className="mt-3 rounded bg-white px-3 py-2 text-sm text-black disabled:opacity-40"
          disabled={!data?.githubConfigured}
          onClick={() =>
            void startGithub().catch((err) => setError(err.message))
          }
        >
          Connect GitHub
        </button>
        {data?.integrations
          .filter((item) => item.provider === "github")
          .map((item) => (
            <p key={item.provider} className="mt-2 text-xs text-zinc-500">
              Status: {item.status}
              {item.accountLabel ? ` · ${item.accountLabel}` : ""}
            </p>
          ))}
      </section>

      <section className="rounded border border-zinc-800 p-4">
        <h2 className="font-medium text-zinc-100">Vercel</h2>
        <p className="mt-1 text-sm text-zinc-400">
          {data?.vercel.configured
            ? "Configured via VERCEL_TOKEN — Studio Deploy uses the live provider."
            : data?.vercel.message ||
              "Not configured. Set VERCEL_TOKEN to enable live deploy."}
        </p>
      </section>
    </div>
  );
}
