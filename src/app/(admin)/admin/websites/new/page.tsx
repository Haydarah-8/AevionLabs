"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { CreateWizard } from "@/features/website-factory/admin/CreateWizard";

export default function NewWebsitePage() {
  return (
    <AdminShell>
      <CreateWizard />
    </AdminShell>
  );
}
