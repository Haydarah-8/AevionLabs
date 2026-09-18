"use client";

import { use } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { PreviewPanel } from "@/features/website-factory/admin/PreviewPanel";

export default function WebsitePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <AdminShell>
      <PreviewPanel id={id} />
    </AdminShell>
  );
}
