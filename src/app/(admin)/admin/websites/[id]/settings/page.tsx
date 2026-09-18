"use client";

import { use } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { SettingsForm } from "@/features/website-factory/admin/SettingsForm";

export default function WebsiteSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <AdminShell>
      <SettingsForm id={id} />
    </AdminShell>
  );
}
