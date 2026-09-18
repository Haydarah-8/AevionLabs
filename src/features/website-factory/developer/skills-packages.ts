/**
 * Downloadable skill packages (ZIP-ready file maps) for shipped Aevion surfaces only.
 */

export type SkillPackage = {
  id: string;
  name: string;
  description: string;
  files: Record<string, string>;
};

function meta(id: string, name: string, tags: string[]) {
  return JSON.stringify(
    {
      id,
      name,
      version: "1.0.0",
      tags,
      generatedFor: "aevion-studio",
    },
    null,
    2,
  );
}

export const SKILL_PACKAGES: SkillPackage[] = [
  {
    id: "website-builder",
    name: "Website Builder",
    description: "Create, edit, publish, and export websites via REST and Studio.",
    files: {
      "SKILL.md": `# Aevion Website Builder

Manage websites through Studio or the API.

## Auth
- Create a key at /admin/developer/api-keys
- Header: Authorization: Bearer ae_live_...

## Core flows
1. POST /api/v1/websites — create from template
2. PATCH /api/v1/websites/{id} — update name/status
3. GET|POST /api/v1/websites/{id}/pages — pages
4. POST /api/v1/websites/{id}/publish — publish draft
5. GET /api/v1/websites/{id}/export — ZIP download

## Rules
- Prefer Studio for visual edits; API for automation
- Never invent publish success without a 2xx response
`,
      "README.md": `# Website Builder Skill

Use with Cursor or any agent that can call HTTP APIs.

OpenAPI: /openapi.json
`,
      "metadata.json": meta("website-builder", "Website Builder", ["websites", "pages", "publish"]),
      "schemas/create-website.json": JSON.stringify(
        {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string" },
            templateId: { type: "string" },
            businessName: { type: "string" },
          },
        },
        null,
        2,
      ),
      "examples/create.json": JSON.stringify(
        { name: "Acme Roofing", templateId: "service-local", businessName: "Acme Roofing LLC" },
        null,
        2,
      ),
    },
  },
  {
    id: "mcp",
    name: "MCP Tools",
    description: "Typed MCP tools over application services (no shell/SQL).",
    files: {
      "SKILL.md": `# Aevion MCP

Endpoint: POST /api/mcp
Body: { "tool": "<name>", "arguments": { ... } }

## Shipped tools
listTools, listWebsites, getWebsite, updateWebsite, publishWebsite,
createPage, deletePage, listTemplates, applyTemplate, updateBusiness,
getDeploymentStatus, deployWebsite, scrapeWebsite, getScrapeJob,
listScrapeJobs, applyScrape / approveImport

## Config (Cursor)
\`\`\`json
{
  "mcpServers": {
    "aevion": {
      "url": "https://YOUR_HOST/api/mcp",
      "headers": { "Authorization": "Bearer ae_live_..." }
    }
  }
}
\`\`\`

There is no one-click install — paste this config into Cursor/Claude/Codex MCP settings.
`,
      "README.md": "# MCP Skill\n\nTyped tools only. See /admin/developer/mcp for copyable configs.\n",
      "metadata.json": meta("mcp", "MCP Tools", ["mcp", "agents"]),
      "examples/list-tools.json": JSON.stringify({ tool: "listTools", arguments: {} }, null, 2),
    },
  },
  {
    id: "api",
    name: "REST API",
    description: "API key auth, scopes, and OpenAPI-backed routes.",
    files: {
      "SKILL.md": `# Aevion REST API

Base: /api/v1
Auth: Bearer ae_live_...
Scopes: websites:read/write, pages:read/write, deployments:*, mcp:use, assets:*, themes:*, webhooks:*

OpenAPI: GET /openapi.json
`,
      "README.md": "# REST API Skill\n\nUse OpenAPI as the source of truth for shipped routes.\n",
      "metadata.json": meta("api", "REST API", ["openapi", "api-keys"]),
      "examples/list-websites.sh": `curl -s -H "Authorization: Bearer $AEVION_API_KEY" \\\n  "$AEVION_HOST/api/v1/websites"\n`,
    },
  },
  {
    id: "scraper",
    name: "Scraper + CMS",
    description: "Scrape a URL into CMS entities, then apply into Studio pages.",
    files: {
      "SKILL.md": `# Aevion Scraper

1. POST scrape job (admin or MCP scrapeWebsite)
2. Poll getScrapeJob until completed
3. Review /admin/websites/{id}/cms
4. applyScrape / approveImport into draft pages

Sync scrape is the default path; CMS is the system of record for scraped entities.
`,
      "README.md": "# Scraper Skill\n\nRequires network fetch. Never invent scrape completion.\n",
      "metadata.json": meta("scraper", "Scraper + CMS", ["scrape", "cms"]),
    },
  },
  {
    id: "deployment",
    name: "Deployment",
    description: "Vercel deploy + domain verify when credentials exist.",
    files: {
      "SKILL.md": `# Aevion Deployment

- GET/POST /api/v1/websites/{id}/deploy
- Vercel token required for live deploy
- Domain connect/verify is honest — status reflects real checks only
- GitHub export commits full export files when OAuth is connected

Never claim deploy success without provider response.
`,
      "README.md": "# Deployment Skill\n\nSee /admin/developer/integrations for configured vs setup state.\n",
      "metadata.json": meta("deployment", "Deployment", ["vercel", "github", "domains"]),
    },
  },
];

export function getSkillPackage(id: string) {
  return SKILL_PACKAGES.find((p) => p.id === id) || null;
}
