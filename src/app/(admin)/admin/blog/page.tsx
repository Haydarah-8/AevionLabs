"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { EditorialList } from "@/components/admin/EditorialList";

export default function AdminBlogPage() {
  return (
    <AdminShell>
      <EditorialList />
    </AdminShell>
  );
}
