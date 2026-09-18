"use client";

import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";

export default function DeveloperLayout({ children }: { children: ReactNode }) {
  return (
    <AdminShell subtitle="Aevion platform — API, MCP, Skills, Connect, and Core audit">
      <div className="developer-shell -mt-4">{children}</div>
    </AdminShell>
  );
}
