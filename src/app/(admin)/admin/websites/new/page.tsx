"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";

export default function NewWebsitePage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function create() {
      try {
        const template = new URLSearchParams(window.location.search).get(
          "template",
        );
        const res = await fetch("/api/admin/websites/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            blank: true,
            ...(template ? { templateId: template } : {}),
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || "Could not create blank site");
        }
        const id = data.project?.id || data.bundle?.project?.id;
        if (!id) throw new Error("Create did not return a website id");
        if (!cancelled) router.replace(`/admin/websites/${id}/editor`);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Create failed");
        }
      }
    }
    void create();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <AdminShell>
      <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
        {error ? (
          <>
            <p className="text-red-400">{error}</p>
            <button
              type="button"
              className="mt-4 rounded-full bg-white px-5 py-2.5 text-sm text-[#0d1730]"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </>
        ) : (
          <>
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-white/40">
              Studio
            </p>
            <h2 className="mt-2 text-2xl tracking-[-0.03em] text-white">
              Opening blank canvas…
            </h2>
            <p className="mt-3 max-w-md text-sm text-white/45">
              Fill business details anytime from the Site panel in the editor
              sidebar.
            </p>
          </>
        )}
      </div>
    </AdminShell>
  );
}
