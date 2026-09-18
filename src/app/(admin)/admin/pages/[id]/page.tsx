"use client";

import { use } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageEditor } from "@/components/admin/cms/PageEditor";

export default function AdminPageEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <AdminShell>
      <PageEditor pageId={id} />
    </AdminShell>
  );
}
