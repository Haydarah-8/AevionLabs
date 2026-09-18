"use client";

import { use } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { DeployPanel } from "@/features/website-factory/admin/DeployPanel";

export default function WebsiteDeployPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <AdminShell>
      <DeployPanel id={id} />
    </AdminShell>
  );
}
