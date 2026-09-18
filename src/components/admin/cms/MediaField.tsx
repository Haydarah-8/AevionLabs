"use client";

import { useRef, useState } from "react";

export function MediaField({
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
    <label className="block">
      <span className="text-[0.8rem] text-white/45">{label}</span>
      <div className="mt-1.5 flex flex-col gap-2">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="/images/… or https://…"
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[0.9rem] text-white outline-none focus:border-white/25"
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="rounded-full border border-white/15 px-3 py-1.5 text-[0.82rem] text-white/70 hover:bg-white/[0.06] disabled:opacity-50"
          >
            {busy ? "Uploading…" : "Upload image"}
          </button>
          {value ? (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-[0.82rem] text-white/45 hover:text-white"
            >
              Remove
            </button>
          ) : null}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/mp4,video/webm"
          className="hidden"
          onChange={(event) => {
            void onFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            className="max-h-36 w-full rounded-md object-cover grayscale"
          />
        ) : null}
        {error ? <p className="text-[0.8rem] text-red-400">{error}</p> : null}
      </div>
    </label>
  );
}
