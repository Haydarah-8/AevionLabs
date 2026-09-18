/**
 * Aevion platform pillars — product map for Studio + developer surfaces.
 * Docs and the developer portal should stay aligned with this file.
 */

export type AevionPillar = {
  id:
    | "puck"
    | "core"
    | "api"
    | "mcp"
    | "skills"
    | "connect"
    | "docs";
  name: string;
  tagline: string;
  role: string;
  /** Primary operator / developer URLs */
  surfaces: Array<{ label: string; href: string }>;
  /** Code roots (for humans + agents) */
  code: string[];
};

export const AEVION_PILLARS: AevionPillar[] = [
  {
    id: "puck",
    name: "Puck",
    tagline: "Editor engine",
    role: "Visual page composition inside Aevion Studio (blocks, outline, inspector).",
    surfaces: [
      { label: "Studio editor", href: "/admin/websites" },
    ],
    code: [
      "src/features/website-factory/editor/AevionEditor.tsx",
      "src/features/website-factory/puck/",
      "src/features/website-factory/components/blocks.tsx",
    ],
  },
  {
    id: "core",
    name: "Aevion Core",
    tagline: "Source of truth + business logic",
    role: "Websites, pages, themes, assets, scrape/CMS, deploy, audit, events — application services over Supabase/file persistence.",
    surfaces: [
      { label: "Website hub", href: "/admin/websites" },
      { label: "Audit logs", href: "/admin/developer/audit" },
    ],
    code: [
      "src/features/website-factory/application/",
      "src/features/website-factory/services/",
      "src/features/website-factory/cms/scrape-cms.ts",
    ],
  },
  {
    id: "api",
    name: "Aevion API",
    tagline: "Programmatic interface",
    role: "REST /api/v1 with scoped ae_live_ keys, OpenAPI, SDK, and CLI.",
    surfaces: [
      { label: "API keys", href: "/admin/developer/api-keys" },
      { label: "OpenAPI", href: "/openapi.json" },
    ],
    code: [
      "src/app/api/v1/",
      "src/app/openapi.json/route.ts",
      "src/features/website-factory/sdk/client.ts",
      "scripts/aevion-cli.mjs",
    ],
  },
  {
    id: "mcp",
    name: "Aevion MCP",
    tagline: "AI interface",
    role: "Typed MCP tools + resources over Core — no shell or SQL.",
    surfaces: [
      { label: "MCP console", href: "/admin/developer/mcp" },
      { label: "MCP endpoint", href: "/api/mcp" },
    ],
    code: [
      "src/features/website-factory/integrations/mcp-server.ts",
      "src/app/api/mcp/route.ts",
    ],
  },
  {
    id: "skills",
    name: "Aevion Skills",
    tagline: "Reusable AI instructions / workflows",
    role: "Downloadable skill ZIPs (SKILL.md, schemas, examples) for agents.",
    surfaces: [
      { label: "Skills library", href: "/admin/developer/skills" },
      { label: "Skills API", href: "/api/v1/skills" },
    ],
    code: [
      "src/features/website-factory/developer/skills-packages.ts",
      "src/app/api/admin/developer/skills/",
    ],
  },
  {
    id: "connect",
    name: "Aevion Connect",
    tagline: "External-tool connection",
    role: "One-flow install for Cursor / Claude / Codex MCP, plus GitHub OAuth and Vercel deploy status.",
    surfaces: [
      { label: "Connect", href: "/admin/developer/connect" },
    ],
    code: [
      "src/features/website-factory/developer/connect.ts",
      "src/app/(admin)/admin/developer/connect/page.tsx",
      "src/features/website-factory/application/integrations.ts",
      "src/features/website-factory/deployment/vercel.ts",
    ],
  },
  {
    id: "docs",
    name: "Aevion Docs",
    tagline: "Developer portal",
    role: "Public docs + admin developer portal documenting shipped behavior only.",
    surfaces: [
      { label: "Docs", href: "/docs" },
      { label: "Developer portal", href: "/admin/developer" },
    ],
    code: [
      "src/app/docs/page.tsx",
      "src/app/(admin)/admin/developer/",
    ],
  },
];

export const CONNECT_DEFAULT_SCOPES = [
  "websites:read",
  "websites:write",
  "pages:read",
  "pages:write",
  "assets:read",
  "templates:read",
  "themes:read",
  "themes:write",
  "deployments:read",
  "deployments:write",
  "domains:read",
  "mcp:use",
] as const;
