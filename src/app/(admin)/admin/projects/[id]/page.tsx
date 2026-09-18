"use client";

import { use } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProjectEditor } from "@/components/admin/cms/ProjectEditor";

export default function AdminProjectEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <AdminShell>
      <ProjectEditor projectId={id} />
    </AdminShell>
  );
}
