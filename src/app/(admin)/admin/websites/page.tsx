"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { WebsiteList } from "@/features/website-factory/admin/WebsiteList";

export default function AdminWebsitesPage() {
  return (
    <AdminShell>
      <WebsiteList />
    </AdminShell>
  );
}
