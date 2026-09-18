"use client";

import { use } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { ContentForm } from "@/features/website-factory/admin/ContentForm";

export default function WebsiteContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <AdminShell>
      <ContentForm id={id} />
    </AdminShell>
  );
}
