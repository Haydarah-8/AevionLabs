"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { SettingsEditor } from "@/components/admin/cms/SettingsEditor";

export default function AdminSettingsPage() {
  return (
    <AdminShell>
      <SettingsEditor />
    </AdminShell>
  );
}
