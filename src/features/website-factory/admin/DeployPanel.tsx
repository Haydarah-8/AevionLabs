"use client";

import { useEffect, useState } from "react";
import type { ProjectBundle, WebsiteDomain } from "@/features/website-factory/types";
import { factoryLivePath } from "@/features/website-factory/urls";
import { ProjectNav } from "./ProjectNav";
import { Field, useBundle } from "./fields";

export function DeployPanel({ id }: { id: string }) {
  const { bundle, error, loading, setError } = useBundle(id);
  const [hostname, setHostname] = useState("");
  const [vercel, setVercel] = useState<{ configured: boolean; message: string } | null>(null);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    void fetch(`/api/admin/websites/${id}/deploy`)
      .then((res) => res.json())
      .then((data) => setVercel({ configured: Boolean(data.configured), message: data.message || "" }));
  }, [id]);

  const data = bundle as ProjectBundle | null;

  async function deployVercel() {
    setBusy("vercel");
    setError("");
    setMessage("");
    try {
      const res = await fetch(`/api/admin/websites/${id}/deploy`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Deploy failed");
      setMessage(`Deployed: ${json.url}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deploy failed");
    } finally {
      setBusy("");
    }
  }

  async function addDomain() {
    setBusy("domain");
    setError("");
    setMessage("");
    try {
      const res = await fetch(`/api/admin/websites/${id}/domains`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostname }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not add domain");
      setMessage(`Added ${json.domain.hostname}. Verify DNS before it is marked live.`);
      setHostname("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add domain");
    } finally {
      setBusy("");
    }
  }

  async function verify(domainHost?: string) {
    setBusy("verify");
    setError("");
    setMessage("");
    try {
      const res = await fetch(`/api/admin/websites/${id}/domains/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostname: domainHost }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Verify failed");
      setMessage(
        json.verified
          ? `${json.hostname} verified.`
          : `${json.hostname} is not verified yet. ${json.detail || ""}`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verify failed");
    } finally {
      setBusy("");
    }
  }

  if (loading) return <p className="text-sm text-zinc-500">Loading…</p>;
  if (!data) return <p className="text-sm text-red-400">{error || "Not found"}</p>;

  return (
    <div className="max-w-2xl text-zinc-200">
      <ProjectNav id={id} />
      <h2 className="text-2xl text-white">Deploy</h2>
      <p className="mt-2 text-sm text-zinc-500">
        Live on Aevion: {factoryLivePath(data.project.slug)}. Custom domains stay pending until DNS
        actually matches.
      </p>

      <div className="mt-10 border-t border-white/10 pt-6">
        <h3 className="text-lg text-white">Vercel</h3>
        {vercel && !vercel.configured ? (
          <p className="mt-3 text-sm text-zinc-400">{vercel.message}</p>
        ) : (
          <button
            type="button"
            disabled={Boolean(busy) || vercel?.configured === false}
            onClick={() => void deployVercel()}
            className="mt-4 rounded-lg bg-white px-4 py-2 text-sm text-black disabled:opacity-40"
          >
            {busy === "vercel" ? "Deploying…" : "Deploy to Vercel"}
          </button>
        )}
        {data.deployments
          .filter((item) => item.provider === "vercel")
          .slice(0, 5)
          .map((item) => (
            <p key={item.id} className="mt-3 text-sm text-zinc-500">
              {item.status} · {item.url || item.error} · {new Date(item.createdAt).toLocaleString()}
            </p>
          ))}
      </div>

      <div className="mt-10 border-t border-white/10 pt-6">
        <h3 className="text-lg text-white">Custom domain</h3>
        <div className="mt-4 flex gap-3">
          <Field label="Hostname" value={hostname} onChange={setHostname} />
          <button
            type="button"
            disabled={Boolean(busy) || !hostname}
            onClick={() => void addDomain()}
            className="self-end rounded-lg border border-white/15 px-4 py-2 text-sm"
          >
            Add
          </button>
        </div>
        {(data.domains as WebsiteDomain[]).map((domain) => (
          <div key={domain.id} className="mt-6 border-t border-white/10 pt-4 text-sm">
            <p className="text-white">
              {domain.hostname} · {domain.status}
              {domain.verifiedAt ? ` · verified ${new Date(domain.verifiedAt).toLocaleString()}` : ""}
            </p>
            <ul className="mt-2 space-y-1 text-zinc-500">
              {domain.dnsRecords.map((record) => (
                <li key={`${record.type}-${record.name}`}>
                  {record.type} {record.name} → {record.value}
                </li>
              ))}
            </ul>
            <button
              type="button"
              disabled={Boolean(busy)}
              onClick={() => void verify(domain.hostname)}
              className="mt-3 underline"
            >
              Check DNS
            </button>
          </div>
        ))}
      </div>
      {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
      {message ? <p className="mt-4 text-sm text-zinc-400">{message}</p> : null}
    </div>
  );
}
