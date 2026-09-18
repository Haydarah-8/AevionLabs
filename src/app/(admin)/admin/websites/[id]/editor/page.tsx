"use client";

import { use } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { WebsiteEditor } from "@/features/website-factory/admin/WebsiteEditor";

export default function WebsiteEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <AdminShell fullBleed studio>
      <WebsiteEditor id={id} />
    </AdminShell>
  );
}
