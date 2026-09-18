"use client";

import { useEffect, useState } from "react";
import { DeveloperNav } from "@/features/website-factory/developer/DeveloperNav";

export default function McpDeveloperPage() {
  const [configs, setConfigs] = useState<Record<string, unknown>>({});
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    void fetch("/api/admin/websites/mcp")
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed");
        setConfigs(json.clientConfigs || { cursor: json.clientConfigs?.cursor });
      })
      .catch((err) => setError(err.message));
  }, []);

  function copy(label: string, value: unknown) {
    void navigator.clipboard.writeText(JSON.stringify(value, null, 2)).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(""), 2000);
    });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <DeveloperNav />
      <div>
        <h1 className="text-2xl font-semibold text-white">MCP</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Production endpoint <code>/api/mcp</code> with API key scope{" "}
          <code>mcp:use</code>. Paste config into Cursor, Claude, or Codex — there is
          no one-click install.
        </p>
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {Object.entries(configs).map(([key, value]) => (
        <section key={key} className="space-y-2 rounded border border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium capitalize text-zinc-100">{key}</h2>
            <button
              type="button"
              className="text-xs text-zinc-400"
              onClick={() => copy(key, value)}
            >
              {copied === key ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="overflow-auto rounded bg-zinc-950 p-3 text-xs text-zinc-300">
            {JSON.stringify(value, null, 2)}
          </pre>
        </section>
      ))}
      {!Object.keys(configs).length ? (
        <pre className="overflow-auto rounded border border-zinc-800 bg-zinc-950 p-4 text-xs text-zinc-300">
          Loading…
        </pre>
      ) : null}
      <p className="text-xs text-zinc-500">
        Replace <code>ae_live_YOUR_KEY</code> with a key that includes resource
        scopes plus <code>mcp:use</code>.
      </p>
    </div>
  );
}
