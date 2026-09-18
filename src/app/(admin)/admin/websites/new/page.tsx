"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { CreateCanvas } from "@/features/website-factory/admin/CreateCanvas";

export default function NewWebsitePage() {
  return (
    <AdminShell fullBleed studio>
      <CreateCanvas />
    </AdminShell>
  );
}
