"use client";

import { useEffect, useState } from "react";
import { DeveloperNav } from "@/features/website-factory/developer/DeveloperNav";

type Webhook = {
  id: string;
  name: string;
  url: string;
  secretPrefix: string;
  events: string[];
  active: boolean;
};

type Delivery = {
  id: string;
  webhookId: string;
  event: string;
  status: string;
  attempt: number;
  responseStatus: number | null;
  error: string;
  createdAt: string;
};

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [name, setName] = useState("Deploy hook");
  const [url, setUrl] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [filterHook, setFilterHook] = useState("");

  async function load() {
    const res = await fetch("/api/admin/developer/webhooks");
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed");
    setWebhooks(json.webhooks || []);
    setEvents(json.events || []);
  }

  async function loadDeliveries(webhookId?: string) {
    const qs = webhookId ? `?webhookId=${encodeURIComponent(webhookId)}` : "";
    const res = await fetch(`/api/admin/developer/webhooks/deliveries${qs}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed");
    setDeliveries(json.deliveries || []);
  }

  useEffect(() => {
    void Promise.all([load(), loadDeliveries()]).catch((err) => setError(err.message));
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <DeveloperNav />
      <div>
        <h1 className="text-2xl font-semibold text-white">Webhooks</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Signed deliveries with up to 3 attempts and backoff. Secret shown once on create.
        </p>
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {secret ? (
        <div className="rounded border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          Signing secret (once): <code className="break-all">{secret}</code>
        </div>
      ) : null}
      <form
        className="space-y-3 rounded border border-zinc-800 p-4"
        onSubmit={(event) => {
          event.preventDefault();
          void (async () => {
            const res = await fetch("/api/admin/developer/webhooks", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name, url, events: selected }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Create failed");
            setSecret(json.secret);
            await load();
          })().catch((err) => setError(err.message));
        }}
      >
        <input
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
        />
        <input
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://hooks.example.com/aevion"
        />
        <div className="grid grid-cols-2 gap-1">
          {events.map((eventName) => (
            <label key={eventName} className="flex gap-2 text-xs text-zinc-400">
              <input
                type="checkbox"
                checked={selected.includes(eventName)}
                onChange={(e) =>
                  setSelected((prev) =>
                    e.target.checked
                      ? [...prev, eventName]
                      : prev.filter((item) => item !== eventName),
                  )
                }
              />
              {eventName}
            </label>
          ))}
        </div>
        <button type="submit" className="rounded bg-white px-3 py-2 text-sm text-black">
          Create webhook
        </button>
      </form>
      <ul className="space-y-2">
        {webhooks.map((hook) => (
          <li
            key={hook.id}
            className="flex items-center justify-between rounded border border-zinc-800 px-3 py-2 text-sm"
          >
            <div>
              <div className="text-zinc-100">{hook.name}</div>
              <div className="text-xs text-zinc-500">
                {hook.url} · {hook.secretPrefix}…
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                className="text-xs text-zinc-400"
                onClick={() => {
                  setFilterHook(hook.id);
                  void loadDeliveries(hook.id).catch((err) => setError(err.message));
                }}
              >
                Logs
              </button>
              <button
                type="button"
                className="text-xs text-red-300"
                onClick={() =>
                  void fetch(`/api/admin/developer/webhooks?id=${hook.id}`, {
                    method: "DELETE",
                  }).then(load)
                }
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-white">Delivery logs</h2>
          <button
            type="button"
            className="text-xs text-zinc-400"
            onClick={() => {
              setFilterHook("");
              void loadDeliveries().catch((err) => setError(err.message));
            }}
          >
            {filterHook ? "Show all" : "Refresh"}
          </button>
        </div>
        <div className="overflow-x-auto rounded border border-zinc-800">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="border-b border-zinc-800 text-zinc-500">
              <tr>
                <th className="px-3 py-2">When</th>
                <th className="px-3 py-2">Event</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Attempts</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {deliveries.slice(0, 50).map((d) => (
                <tr key={d.id} className="border-b border-zinc-900">
                  <td className="whitespace-nowrap px-3 py-2 text-zinc-500">
                    {new Date(d.createdAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-2">{d.event}</td>
                  <td className="px-3 py-2">
                    {d.status}
                    {d.responseStatus ? ` · HTTP ${d.responseStatus}` : ""}
                    {d.error ? (
                      <span className="block text-red-400/80">{d.error}</span>
                    ) : null}
                  </td>
                  <td className="px-3 py-2">{d.attempt}</td>
                  <td className="px-3 py-2 text-right">
                    {d.status !== "delivered" ? (
                      <button
                        type="button"
                        className="text-zinc-400 hover:text-white"
                        onClick={() =>
                          void fetch("/api/admin/developer/webhooks/deliveries", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ deliveryId: d.id }),
                          })
                            .then((res) => res.json())
                            .then(() => loadDeliveries(filterHook || undefined))
                            .catch((err) => setError(err.message))
                        }
                      >
                        Retry
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
              {!deliveries.length ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-zinc-600">
                    No deliveries yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
