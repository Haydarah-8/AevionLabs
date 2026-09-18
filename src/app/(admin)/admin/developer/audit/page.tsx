"use client";

import { useEffect, useState } from "react";
import { DeveloperNav } from "@/features/website-factory/developer/DeveloperNav";

type AuditLog = {
  id: string;
  actorType: string;
  action: string;
  resourceType: string;
  resourceId: string;
  projectId: string | null;
  result: string;
  createdAt: string;
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [error, setError] = useState("");
  const [projectId, setProjectId] = useState("");

  async function load(filter?: string) {
    const qs = filter ? `?projectId=${encodeURIComponent(filter)}` : "";
    const res = await fetch(`/api/admin/developer/audit${qs}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed");
    setLogs(json.logs || []);
  }

  useEffect(() => {
    void load().catch((err) => setError(err.message));
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <DeveloperNav />
      <div>
        <h1 className="text-2xl font-semibold text-white">Audit logs</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Events written by application services (create, publish, deploy, scrape…).
        </p>
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void load(projectId.trim() || undefined).catch((err) => setError(err.message));
        }}
      >
        <input
          className="flex-1 rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
          placeholder="Filter by project ID (optional)"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
        />
        <button type="submit" className="rounded bg-white px-3 py-2 text-sm text-black">
          Filter
        </button>
      </form>
      <div className="overflow-x-auto rounded border border-zinc-800">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="border-b border-zinc-800 text-zinc-500">
            <tr>
              <th className="px-3 py-2">When</th>
              <th className="px-3 py-2">Action</th>
              <th className="px-3 py-2">Resource</th>
              <th className="px-3 py-2">Actor</th>
              <th className="px-3 py-2">Result</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-zinc-900">
                <td className="whitespace-nowrap px-3 py-2 text-zinc-500">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="px-3 py-2">{log.action}</td>
                <td className="px-3 py-2">
                  {log.resourceType}
                  {log.resourceId ? ` · ${log.resourceId.slice(0, 8)}` : ""}
                  {log.projectId ? (
                    <span className="block text-zinc-600">project {log.projectId.slice(0, 8)}</span>
                  ) : null}
                </td>
                <td className="px-3 py-2">{log.actorType}</td>
                <td className="px-3 py-2">{log.result}</td>
              </tr>
            ))}
            {!logs.length ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-zinc-600">
                  No audit entries yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
