"use client";

import { DeveloperNav } from "@/features/website-factory/developer/DeveloperNav";
import { SKILL_PACKAGES } from "@/features/website-factory/developer/skills-packages";
import { buildAevionSkillMarkdown } from "@/features/website-factory/developer/skills";

export default function SkillsPage() {
  const markdown = buildAevionSkillMarkdown();

  function downloadMarkdown() {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "aevion-website-factory-skill.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <DeveloperNav />
      <div>
        <h1 className="text-2xl font-semibold text-white">Skills</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Downloadable ZIP packages with SKILL.md, README, metadata, and examples —
          shipped surfaces only.
        </p>
      </div>
      <ul className="space-y-3">
        {SKILL_PACKAGES.map((pkg) => (
          <li
            key={pkg.id}
            className="flex items-center justify-between rounded border border-zinc-800 px-4 py-3"
          >
            <div>
              <div className="font-medium text-zinc-100">{pkg.name}</div>
              <div className="text-sm text-zinc-500">{pkg.description}</div>
              <div className="mt-1 text-xs text-zinc-600">
                {Object.keys(pkg.files).join(" · ")}
              </div>
            </div>
            <a
              className="rounded bg-white px-3 py-2 text-sm text-black"
              href={`/api/admin/developer/skills/${pkg.id}/zip`}
            >
              Download ZIP
            </a>
          </li>
        ))}
      </ul>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-white">Combined markdown</h2>
          <button
            type="button"
            className="text-sm text-zinc-400 underline"
            onClick={downloadMarkdown}
          >
            Download .md
          </button>
        </div>
        <pre className="max-h-[20rem] overflow-auto rounded border border-zinc-800 bg-zinc-950 p-4 text-xs text-zinc-300 whitespace-pre-wrap">
          {markdown}
        </pre>
      </div>
    </div>
  );
}
