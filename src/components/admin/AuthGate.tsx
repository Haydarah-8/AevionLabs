"use client";

import { useState, type FormEvent } from "react";

export function AuthGate() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email, password }),
      });
      const data = (await response.json()) as {
        success?: boolean;
        error?: string;
      };

      if (response.ok && data.success) {
        window.location.href = "/admin";
        return;
      }

      setPassword("");
      setError(data.error || "Could not sign in.");
      setLoading(false);
    } catch {
      setPassword("");
      setError("Could not reach the sign-in service. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 items-center justify-center bg-[#0a0a0f] px-6 text-zinc-100">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-white">Sign in</h1>
        <p className="mt-1 text-sm text-zinc-500">Aevion Labs admin</p>

        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
          <label className="block">
            <span className="text-sm text-zinc-400">Email</span>
            <input
              type="email"
              autoComplete="username"
              required
              disabled={loading}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#16161d] px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-white/30 disabled:opacity-50"
            />
          </label>
          <label className="block">
            <span className="text-sm text-zinc-400">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              disabled={loading}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#16161d] px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-white/30 disabled:opacity-50"
            />
          </label>
          {error ? <p className="text-sm text-rose-400">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full cursor-pointer rounded-lg bg-white px-3 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
