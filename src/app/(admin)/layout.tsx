import type { Metadata } from "next";
import { AdminProviders } from "@/components/admin/AdminProviders";
import "@/app/admin-theme.css";

export const metadata: Metadata = {
  title: "Admin — Aevion Labs",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProviders>
      <div className="admin-panel flex h-dvh min-h-0 flex-col overflow-hidden bg-[#09090b] text-zinc-100 font-sans antialiased">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </AdminProviders>
  );
}
