"use client";

import { use } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProjectHub } from "@/features/website-factory/admin/ProjectHub";

export default function WebsiteProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <AdminShell>
      <ProjectHub id={id} />
    </AdminShell>
  );
}
