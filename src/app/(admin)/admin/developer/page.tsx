import Link from "next/link";
import { DeveloperNav } from "@/features/website-factory/developer/DeveloperNav";
import { AEVION_PILLARS } from "@/features/website-factory/platform/pillars";

export default function DeveloperHomePage() {
  return (
    <div className="space-y-10">
      <DeveloperNav />
      <div>
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-white/40">
          Platform
        </p>
        <h1 className="mt-2 text-[clamp(1.75rem,3vw,2.5rem)] font-normal tracking-[-0.035em] text-white">
          Developer portal
        </h1>
        <p className="mt-3 max-w-xl text-[1rem] font-light leading-relaxed text-white/50">
          Seven product pillars — editor, core services, API, MCP, skills,
          connect, and docs.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {AEVION_PILLARS.map((pillar) => {
          const primary = pillar.surfaces[0];
          return (
            <Link
              key={pillar.id}
              href={primary.href}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition hover:border-white/20 hover:bg-white/[0.05]"
            >
              <p className="text-[0.65rem] uppercase tracking-[0.16em] text-white/40">
                {pillar.tagline}
              </p>
              <h2 className="mt-2 text-lg tracking-[-0.02em] text-white">
                {pillar.name}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/50">
                {pillar.role}
              </p>
              <p className="mt-4 text-xs text-white/35">
                {pillar.surfaces.map((s) => s.label).join(" · ")}
              </p>
            </Link>
          );
        })}
      </div>

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 text-sm text-white/50">
        <h2 className="text-white">Quick links</h2>
        <ul className="mt-3 space-y-2">
          <li>
            <Link
              className="text-white/70 underline-offset-2 hover:text-white hover:underline"
              href="/openapi.json"
            >
              OpenAPI
            </Link>
          </li>
          <li>
            <Link
              className="text-white/70 underline-offset-2 hover:text-white hover:underline"
              href="/docs"
            >
              Docs
            </Link>
          </li>
          <li>
            <Link
              className="text-white/70 underline-offset-2 hover:text-white hover:underline"
              href="/admin/developer/connect"
            >
              Aevion Connect
            </Link>
          </li>
          <li>
            <Link
              className="text-white/70 underline-offset-2 hover:text-white hover:underline"
              href="/admin/websites"
            >
              Studio editor
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
