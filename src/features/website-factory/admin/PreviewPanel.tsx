"use client";

import type { ProjectBundle } from "@/features/website-factory/types";
import { factoryDraftPath, factoryPreviewPath } from "@/features/website-factory/urls";
import { ProjectNav } from "./ProjectNav";
import { useBundle } from "./fields";

export function PreviewPanel({ id }: { id: string }) {
  const { bundle, error, loading } = useBundle(id);
  const data = bundle as ProjectBundle | null;
  if (loading) return <p className="text-sm text-zinc-500">Loading…</p>;
  if (!data) return <p className="text-sm text-red-400">{error || "Not found"}</p>;
  const src = factoryDraftPath(data.project.slug);
  return (
    <div className="text-zinc-200">
      <ProjectNav id={id} />
      <h2 className="text-2xl text-white">Preview</h2>
      <p className="mt-2 text-sm text-zinc-500">
        Draft iframe. Client link stays at {factoryPreviewPath(data.project.slug)} until you publish
        preview.
      </p>
      <iframe title="Website preview" src={src} className="mt-6 h-[70vh] w-full bg-white" />
    </div>
  );
}
