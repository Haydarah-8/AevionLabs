/**
 * Downloadable Cursor skill package for Aevion Website Factory.
 */
export function buildAevionSkillMarkdown() {
  return `# Aevion Website Factory Skill

Use the Aevion API and MCP to manage websites.

## Auth
- Create a key at /admin/developer/api-keys
- Scopes: websites:read/write, pages:read/write, deployments:*, mcp:use
- Header: Authorization: Bearer ae_live_...

## REST (shipped)
- GET /api/v1/websites
- GET /api/v1/websites/{id}
- PATCH /api/v1/websites/{id}
- GET|POST /api/v1/websites/{id}/pages
- POST /api/v1/websites/{id}/publish
- GET|POST /api/v1/websites/{id}/deploy
- GET /api/v1/websites/{id}/export
- GET /openapi.json

## MCP
- Endpoint: POST /api/mcp
- Body: { "tool": "getWebsite", "arguments": { "id": "..." } }
- Tools: listTools, listWebsites, getWebsite, updateWebsite, publishWebsite,
  createPage, deletePage, listTemplates, applyTemplate, updateBusiness,
  getDeploymentStatus, deployWebsite, scrapeWebsite, getScrapeJob,
  listScrapeJobs, applyScrape

## Rules
- Never invent deploy/GitHub success when credentials are missing
- Prefer typed tools; no shell or raw SQL
- OpenAPI is the source of truth for shipped REST
`;
}
