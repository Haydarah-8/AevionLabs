"use client";

import { useEffect, useState } from "react";

export function useAdminGuard(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/admin/auth");
        const data = (await res.json()) as { authenticated?: boolean };
        if (!data.authenticated) {
          window.location.href = "/admin/login";
          return;
        }
        setReady(true);
      } catch {
        window.location.href = "/admin/login";
      }
    })();
  }, []);

  return ready;
}

export async function signOutAdmin() {
  try {
    await fetch("/api/admin/auth", { method: "DELETE" });
  } catch {
    /* still leave */
  }
  window.location.href = "/admin/login";
}
