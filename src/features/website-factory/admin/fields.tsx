"use client";

import { useEffect, useRef, useState } from "react";

export function ImageUpload({
  label,
  value,
  owner,
  onChange,
}: {
  label: string;
  value: string;
  owner: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("owner", owner);
      const res = await fetch("/api/admin/uploads", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onChange(String(data.url || ""));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <label className="block text-sm text-zinc-400">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="https://…"
        className="mt-1 w-full border-b border-white/15 bg-transparent py-2 text-white outline-none"
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="mt-2 text-sm text-zinc-300 underline disabled:opacity-40"
      >
        {busy ? "Uploading…" : "Upload"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(event) => {
          void onFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="mt-3 max-h-32 object-cover" />
      ) : null}
      {error ? <p className="mt-1 text-sm text-red-400">{error}</p> : null}
    </label>
  );
}

export function Field({
  label,
  value,
  onChange,
  textarea,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
  type?: string;
}) {
  return (
    <label className="block text-sm text-zinc-400">
      {label}
      {textarea ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          className="mt-1 w-full border-b border-white/15 bg-transparent py-2 text-white outline-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="mt-1 w-full border-b border-white/15 bg-transparent py-2 text-white outline-none"
        />
      )}
    </label>
  );
}

export function useBundle(id: string) {
  const [bundle, setBundle] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/admin/websites/${id}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load");
        if (!cancelled) setBundle(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { bundle, error, loading, setBundle, setError };
}
