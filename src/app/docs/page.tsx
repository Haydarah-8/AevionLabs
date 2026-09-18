import Link from "next/link";
import { MCP_TOOLS } from "@/features/website-factory/integrations/mcp-server";
import { SKILL_PACKAGES } from "@/features/website-factory/developer/skills-packages";
import { AEVION_PILLARS } from "@/features/website-factory/platform/pillars";

export const metadata = {
  title: "Aevion Docs — Developer portal",
};

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "platform", label: "Platform pillars" },
  { id: "auth", label: "Authentication" },
  { id: "api", label: "Aevion API" },
  { id: "mcp", label: "Aevion MCP" },
  { id: "connect", label: "Aevion Connect" },
  { id: "skills", label: "Aevion Skills" },
  { id: "console", label: "Developer console" },
] as const;

const API_ROUTES = [
  ["GET/POST", "/api/v1/websites"],
  ["GET/PATCH", "/api/v1/websites/:id"],
  ["GET/POST", "/api/v1/websites/:id/pages"],
  ["POST", "/api/v1/websites/:id/publish"],
  ["GET/POST", "/api/v1/websites/:id/deploy"],
  ["GET", "/api/v1/websites/:id/export"],
  ["GET/POST", "/api/v1/websites/:id/domains"],
  ["POST", "/api/v1/websites/:id/domains/verify"],
  ["GET/PATCH", "/api/v1/websites/:id/theme"],
  ["GET", "/api/v1/websites/:id/assets"],
  ["GET", "/api/v1/templates"],
  ["GET", "/api/v1/businesses"],
  ["GET/POST", "/api/v1/webhooks"],
  ["GET", "/api/v1/skills"],
  ["GET/POST/DELETE", "/api/v1/api-keys"],
  ["GET", "/api/v1/integrations"],
  ["GET", "/openapi.json"],
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto flex max-w-6xl gap-10 px-6 py-12">
        <aside className="hidden w-52 shrink-0 md:block">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Aevion Docs
          </p>
          <nav className="mt-4 space-y-1 text-sm">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="block rounded px-2 py-1.5 text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900"
              >
                {s.label}
              </a>
            ))}
            <Link
              href="/openapi.json"
              className="mt-4 block rounded px-2 py-1.5 text-zinc-600 hover:bg-zinc-200/60"
            >
              OpenAPI JSON
            </Link>
            <Link
              href="/admin/developer"
              className="block rounded px-2 py-1.5 text-zinc-600 hover:bg-zinc-200/60"
            >
              Developer portal
            </Link>
          </nav>
        </aside>

        <main className="min-w-0 flex-1 space-y-12">
          <header id="overview">
            <p className="text-sm text-zinc-500">Aevion Website Factory</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              Developer portal
            </h1>
            <p className="mt-3 max-w-2xl text-zinc-600">
              Aevion Docs documents shipped behavior only. OpenAPI, MCP tools,
              Skills, and Connect stay aligned with live code.
            </p>
          </header>

          <section id="platform" className="space-y-4">
            <h2 className="text-xl font-medium">Platform pillars</h2>
            <div className="space-y-4">
              {AEVION_PILLARS.map((pillar) => (
                <div key={pillar.id} className="border-t border-zinc-200 pt-4">
                  <h3 className="font-medium">
                    {pillar.name}{" "}
                    <span className="font-normal text-zinc-500">
                      — {pillar.tagline}
                    </span>
                  </h3>
                  <p className="mt-1 text-sm text-zinc-600">{pillar.role}</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                    {pillar.surfaces.map((s) => (
                      <li key={s.href}>
                        <Link className="underline" href={s.href}>
                          {s.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 font-mono text-xs text-zinc-500">
                    {pillar.code.join(" · ")}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section id="auth" className="space-y-2">
            <h2 className="text-xl font-medium">Authentication</h2>
            <p className="text-sm text-zinc-600">
              Use <code>Authorization: Bearer ae_live_…</code> (API key) or an
              admin session cookie. Responses use{" "}
              <code>{`{ data, meta }`}</code> or{" "}
              <code>{`{ error: { code, message, details } }`}</code>.
            </p>
          </section>

          <section id="api" className="space-y-3">
            <h2 className="text-xl font-medium">Aevion API</h2>
            <p className="text-sm text-zinc-600">
              Source of truth:{" "}
              <Link className="underline" href="/openapi.json">
                /openapi.json
              </Link>
              . SDK: <code>src/features/website-factory/sdk/client.ts</code>.
              CLI: <code>npm run aevion</code>.
            </p>
            <ul className="space-y-1 font-mono text-sm text-zinc-700">
              {API_ROUTES.map(([method, path]) => (
                <li key={path}>
                  <span className="text-zinc-400">{method}</span> {path}
                </li>
              ))}
            </ul>
          </section>

          <section id="mcp" className="space-y-3">
            <h2 className="text-xl font-medium">Aevion MCP</h2>
            <p className="text-sm text-zinc-600">
              Endpoint <code>POST /api/mcp</code> — requires scope{" "}
              <code>mcp:use</code> plus resource scopes. Typed tools + resources
              only; no shell or SQL. Prefer{" "}
              <Link className="underline" href="/admin/developer/connect">
                Aevion Connect
              </Link>{" "}
              for install.
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {MCP_TOOLS.map((tool) => (
                <li key={tool.name}>
                  <strong>{tool.name}</strong> — {tool.description}
                </li>
              ))}
            </ul>
          </section>

          <section id="connect" className="space-y-2">
            <h2 className="text-xl font-medium">Aevion Connect</h2>
            <p className="text-sm text-zinc-600">
              <Link className="underline" href="/admin/developer/connect">
                /admin/developer/connect
              </Link>{" "}
              mints a scoped key and installs MCP:
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700">
              <li>
                <strong>Cursor</strong> — one-click <code>cursor://</code>{" "}
                deeplink + web install link
              </li>
              <li>
                <strong>Claude / Codex</strong> — copyable MCP JSON in one flow
              </li>
              <li>
                <strong>GitHub</strong> — OAuth when client id/secret are set
              </li>
              <li>
                <strong>Vercel</strong> — live when <code>VERCEL_TOKEN</code> is
                set; otherwise setup message only
              </li>
            </ul>
          </section>

          <section id="skills" className="space-y-2">
            <h2 className="text-xl font-medium">Aevion Skills</h2>
            <p className="text-sm text-zinc-600">
              Download ZIPs from{" "}
              <Link className="underline" href="/admin/developer/skills">
                Skills
              </Link>
              :
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {SKILL_PACKAGES.map((pkg) => (
                <li key={pkg.id}>
                  <strong>{pkg.name}</strong> — {pkg.description}
                </li>
              ))}
            </ul>
          </section>

          <section id="console" className="space-y-2">
            <h2 className="text-xl font-medium">Developer console</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              <li>
                <Link href="/admin/developer">Platform overview</Link>
              </li>
              <li>
                <Link href="/admin/developer/connect">Connect</Link>
              </li>
              <li>
                <Link href="/admin/developer/api-keys">API keys</Link>
              </li>
              <li>
                <Link href="/admin/developer/mcp">MCP</Link>
              </li>
              <li>
                <Link href="/admin/developer/skills">Skills</Link>
              </li>
              <li>
                <Link href="/admin/developer/webhooks">Webhooks</Link>
              </li>
              <li>
                <Link href="/admin/developer/audit">Core audit</Link>
              </li>
              <li>
                <Link href="/admin/websites">Studio (Puck)</Link>
              </li>
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
}
