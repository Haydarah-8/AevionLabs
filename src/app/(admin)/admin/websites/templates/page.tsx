"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { TemplateList } from "@/features/website-factory/admin/TemplateList";

export default function WebsiteTemplatesPage() {
  return (
    <AdminShell>
      <TemplateList />
    </AdminShell>
  );
}
