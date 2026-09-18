"use client";

import { use } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { DocumentEditor } from "@/components/admin/DocumentEditor";

export default function BlogEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <AdminShell fullBleed>
      <DocumentEditor postId={id} />
    </AdminShell>
  );
}
