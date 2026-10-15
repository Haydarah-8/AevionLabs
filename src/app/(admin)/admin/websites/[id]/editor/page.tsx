"use client";

import { Suspense, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { AevionEditor } from "@/features/website-factory/editor/AevionEditor";
import { isWebsiteProjectId } from "@/features/website-factory/ids";

function StudioCanvas({ id }: { id: string }) {
  const router = useRouter();

  useEffect(() => {
    if (!isWebsiteProjectId(id)) {
      router.replace("/admin/websites");
    }
  }, [id, router]);

  if (!isWebsiteProjectId(id)) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-[#0c0c0e] px-6 text-center">
        <p className="text-sm text-red-300">
          Invalid website link. Opening your websites list…
        </p>
        <a
          href="/admin/websites"
          className="rounded-full bg-white px-4 py-2 text-sm text-[#0d1730]"
        >
          Go to Websites
        </a>
      </div>
    );
  }

  return <AevionEditor id={id} />;
}

/** Aevion Studio — Puck editor */
export default function WebsiteEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <AdminShell fullBleed studio>
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center bg-[#0c0c0e] text-sm text-white/45">
            Loading Studio…
          </div>
        }
      >
        <StudioCanvas id={id} />
      </Suspense>
    </AdminShell>
  );
}
