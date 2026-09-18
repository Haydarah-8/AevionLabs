/**
 * Production MCP tool registry over application services.
 * No shell, SQL, or unrestricted network tools.
 */

import {
  addPage,
  createWebsiteFromWizard,
  deletePage,
  getWebsite,
  listTemplates,
  listWebsites,
  publishWebsiteLive,
  publishWebsitePreview,
  regenerateWebsite,
  updateWebsite,
  updateWebsiteBusiness,
} from "../application";
import {
  getDeploymentStatus,
  deployWebsite,
  exportWebsiteZip,
} from "../application/deployment";
import {
  getWebsiteScrapeJob,
  listWebsiteScrapeJobs,
  startWebsiteScrape,
} from "../application/scrape";
import { applyWebsiteImport } from "../application/ai";
import { getTheme, updateTheme } from "../application/theme";
import { listProjectAssets } from "../application/asset";
import {
  addPageComponent,
  listComponentSchemas,
  listPageComponents,
  movePageComponent,
  removePageComponent,
  updatePageComponent,
} from "../application/components";
import { emitFactoryEvent } from "../application/events";
import { assertPublicHttpUrl } from "../intelligence/ssrf";
import { COMPONENT_META } from "../puck/meta";

export const MCP_TOOLS = [
  {
    name: "listTools",
    description: "List available Aevion MCP tools",
    inputSchema: { type: "object", properties: {} },
    scopes: ["mcp:use"],
  },
  {
    name: "listResources",
    description: "List read-only MCP resources (schemas, tokens, OpenAPI summary)",
    inputSchema: { type: "object", properties: {} },
    scopes: ["mcp:use"],
  },
  {
    name: "readResource",
    description: "Read an MCP resource by uri",
    inputSchema: {
      type: "object",
      properties: { uri: { type: "string" } },
      required: ["uri"],
    },
    scopes: ["mcp:use"],
  },
  {
    name: "listWebsites",
    description: "List website projects",
    inputSchema: { type: "object", properties: {} },
    scopes: ["websites:read", "mcp:use"],
  },
  {
    name: "createWebsite",
    description: "Create a website from wizard fields (name, templateId, businessName…)",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        templateId: { type: "string" },
        businessName: { type: "string" },
        wizard: { type: "object" },
      },
    },
    scopes: ["websites:write", "mcp:use"],
  },
  {
    name: "getWebsite",
    description: "Get a full project bundle by id",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
    },
    scopes: ["websites:read", "mcp:use"],
  },
  {
    name: "updateWebsite",
    description: "Update project name or theme",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        theme: { type: "object" },
      },
      required: ["id"],
    },
    scopes: ["websites:write", "mcp:use"],
  },
  {
    name: "exportWebsite",
    description: "Build export file map + ZIP metadata for a website",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
    },
    scopes: ["websites:read", "mcp:use"],
  },
  {
    name: "publishWebsite",
    description: "Publish preview or live (mode = preview|live)",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
        mode: { type: "string", enum: ["preview", "live"] },
      },
      required: ["id"],
    },
    scopes: ["websites:write", "mcp:use"],
  },
  {
    name: "createPage",
    description: "Create a page on a project",
    inputSchema: {
      type: "object",
      properties: {
        projectId: { type: "string" },
        title: { type: "string" },
        slug: { type: "string" },
      },
      required: ["projectId", "title"],
    },
    scopes: ["pages:write", "mcp:use"],
  },
  {
    name: "deletePage",
    description: "Delete a page by pageId",
    inputSchema: {
      type: "object",
      properties: { pageId: { type: "string" } },
      required: ["pageId"],
    },
    scopes: ["pages:write", "mcp:use"],
  },
  {
    name: "listTemplates",
    description: "List website templates",
    inputSchema: { type: "object", properties: {} },
    scopes: ["templates:read", "mcp:use"],
  },
  {
    name: "applyTemplate",
    description: "Rebuild pages from the current business model",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
        mode: { type: "string", enum: ["preserve", "rebuild", "rewrite"] },
      },
      required: ["id"],
    },
    scopes: ["websites:write", "mcp:use"],
  },
  {
    name: "updateBusiness",
    description: "Patch business fields",
    inputSchema: {
      type: "object",
      properties: {
        businessId: { type: "string" },
        name: { type: "string" },
      },
      required: ["businessId", "name"],
    },
    scopes: ["websites:write", "mcp:use"],
  },
  {
    name: "getTheme",
    description: "Get theme tokens for a website",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
    },
    scopes: ["themes:read", "mcp:use"],
  },
  {
    name: "updateTheme",
    description: "Update theme tokens for a website",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
        theme: { type: "object" },
      },
      required: ["id", "theme"],
    },
    scopes: ["themes:write", "mcp:use"],
  },
  {
    name: "listAssets",
    description: "List media assets for a website",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
    },
    scopes: ["assets:read", "mcp:use"],
  },
  {
    name: "listComponents",
    description: "List components on a page (defaults to home)",
    inputSchema: {
      type: "object",
      properties: {
        projectId: { type: "string" },
        pageId: { type: "string" },
      },
      required: ["projectId"],
    },
    scopes: ["pages:read", "mcp:use"],
  },
  {
    name: "addComponent",
    description: "Add a Puck component to a page",
    inputSchema: {
      type: "object",
      properties: {
        projectId: { type: "string" },
        pageId: { type: "string" },
        type: { type: "string" },
        props: { type: "object" },
        index: { type: "number" },
      },
      required: ["projectId", "type"],
    },
    scopes: ["pages:write", "mcp:use"],
  },
  {
    name: "updateComponent",
    description: "Update a component by index",
    inputSchema: {
      type: "object",
      properties: {
        projectId: { type: "string" },
        pageId: { type: "string" },
        index: { type: "number" },
        props: { type: "object" },
        type: { type: "string" },
      },
      required: ["projectId", "index"],
    },
    scopes: ["pages:write", "mcp:use"],
  },
  {
    name: "removeComponent",
    description: "Remove a component by index",
    inputSchema: {
      type: "object",
      properties: {
        projectId: { type: "string" },
        pageId: { type: "string" },
        index: { type: "number" },
      },
      required: ["projectId", "index"],
    },
    scopes: ["pages:write", "mcp:use"],
  },
  {
    name: "moveComponent",
    description: "Move a component between indexes",
    inputSchema: {
      type: "object",
      properties: {
        projectId: { type: "string" },
        pageId: { type: "string" },
        fromIndex: { type: "number" },
        toIndex: { type: "number" },
      },
      required: ["projectId", "fromIndex", "toIndex"],
    },
    scopes: ["pages:write", "mcp:use"],
  },
  {
    name: "getDeploymentStatus",
    description: "Read deployment provider configuration status",
    inputSchema: { type: "object", properties: {} },
    scopes: ["deployments:read", "mcp:use"],
  },
  {
    name: "deployWebsite",
    description: "Deploy via configured Vercel provider",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
    },
    scopes: ["deployments:write", "mcp:use"],
  },
  {
    name: "scrapeWebsite",
    description: "Start an OSS scrape (Readability + linkedom)",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string" },
        projectId: { type: "string" },
        sync: { type: "boolean" },
      },
      required: ["url"],
    },
    scopes: ["websites:write", "mcp:use"],
  },
  {
    name: "getScrapeJob",
    description: "Poll a scrape job by jobId",
    inputSchema: {
      type: "object",
      properties: { jobId: { type: "string" } },
      required: ["jobId"],
    },
    scopes: ["websites:read", "mcp:use"],
  },
  {
    name: "listScrapeJobs",
    description: "List recent scrape jobs",
    inputSchema: {
      type: "object",
      properties: { projectId: { type: "string" } },
    },
    scopes: ["websites:read", "mcp:use"],
  },
  {
    name: "applyScrape",
    description: "Apply a completed scrape result onto a project",
    inputSchema: {
      type: "object",
      properties: {
        projectId: { type: "string" },
        result: { type: "object" },
        rebuildPages: { type: "boolean" },
      },
      required: ["projectId", "result"],
    },
    scopes: ["websites:write", "mcp:use"],
  },
  {
    name: "approveImport",
    description: "Alias of applyScrape — approve scraped import into draft pages",
    inputSchema: {
      type: "object",
      properties: {
        projectId: { type: "string" },
        result: { type: "object" },
        rebuildPages: { type: "boolean" },
      },
      required: ["projectId", "result"],
    },
    scopes: ["websites:write", "mcp:use"],
  },
] as const;

export type McpToolName = (typeof MCP_TOOLS)[number]["name"];

export const MCP_RESOURCES = [
  {
    uri: "aevion://components",
    name: "Component schemas",
    description: "Registered Puck component metadata",
    mimeType: "application/json",
  },
  {
    uri: "aevion://tools",
    name: "Tool list",
    description: "MCP tools available on this server",
    mimeType: "application/json",
  },
  {
    uri: "aevion://openapi",
    name: "OpenAPI summary",
    description: "Shipped REST path summary",
    mimeType: "application/json",
  },
  {
    uri: "aevion://tokens",
    name: "Theme token keys",
    description: "ThemeTokens field names used by Studio",
    mimeType: "application/json",
  },
] as const;

function hasScope(scopes: Set<string>, needed: string[]) {
  const resourceScopes = needed.filter((scope) => scope !== "mcp:use");
  if (!resourceScopes.length) return scopes.has("mcp:use") || needed.some((s) => scopes.has(s));
  return resourceScopes.some((scope) => scopes.has(scope));
}

async function readMcpResource(uri: string) {
  switch (uri) {
    case "aevion://components":
      return listComponentSchemas();
    case "aevion://tools":
      return MCP_TOOLS.map(({ name, description, inputSchema }) => ({
        name,
        description,
        inputSchema,
      }));
    case "aevion://openapi":
      return {
        note: "Full schema at GET /openapi.json",
        paths: [
          "/api/v1/websites",
          "/api/v1/websites/{id}",
          "/api/v1/websites/{id}/pages",
          "/api/v1/websites/{id}/publish",
          "/api/v1/websites/{id}/deploy",
          "/api/v1/websites/{id}/export",
          "/api/v1/websites/{id}/theme",
          "/api/v1/websites/{id}/assets",
          "/api/v1/websites/{id}/domains",
          "/api/v1/templates",
          "/api/v1/businesses",
          "/api/v1/webhooks",
          "/api/v1/skills",
          "/api/mcp",
        ],
      };
    case "aevion://tokens":
      return {
        keys: [
          "primary",
          "secondary",
          "accent",
          "background",
          "foreground",
          "muted",
          "fontSans",
          "fontDisplay",
          "radius",
          "buttonRadius",
        ],
        componentTypes: Object.keys(COMPONENT_META),
      };
    default:
      throw new Error(`Unknown resource: ${uri}`);
  }
}

export async function executeMcpTool(input: {
  name: string;
  arguments?: Record<string, unknown>;
  scopes: Set<string>;
  actorId?: string | null;
}) {
  const tool = MCP_TOOLS.find((item) => item.name === input.name);
  if (!tool) throw new Error(`Unknown tool: ${input.name}`);
  if (!hasScope(input.scopes, [...tool.scopes])) {
    throw Object.assign(new Error(`Missing scope for ${tool.name}`), {
      status: 403,
    });
  }

  const args = input.arguments || {};
  let result: unknown;

  switch (tool.name as McpToolName) {
    case "listTools":
      result = MCP_TOOLS.map(({ name, description, inputSchema }) => ({
        name,
        description,
        inputSchema,
      }));
      break;
    case "listResources":
      result = MCP_RESOURCES;
      break;
    case "readResource":
      result = await readMcpResource(String(args.uri || ""));
      break;
    case "listWebsites":
      result = await listWebsites();
      break;
    case "createWebsite": {
      const wizard =
        (args.wizard as Record<string, unknown>) ||
        ({
          businessName: args.businessName || args.name || "New business",
          templateId: args.templateId || "service-local",
          name: args.name,
        } as Record<string, unknown>);
      result = await createWebsiteFromWizard(wizard as never, input.actorId);
      break;
    }
    case "getWebsite":
      result = await getWebsite(String(args.id || ""));
      break;
    case "updateWebsite":
      result = await updateWebsite(
        String(args.id || ""),
        {
          ...(typeof args.name === "string" ? { name: args.name } : {}),
          ...(args.theme && typeof args.theme === "object"
            ? { theme: args.theme as never }
            : {}),
        },
        input.actorId,
      );
      break;
    case "exportWebsite": {
      const zip = await exportWebsiteZip(String(args.id || ""), input.actorId);
      result = {
        filename: zip.filename,
        fileCount: Object.keys(zip.files || {}).length,
        files: Object.keys(zip.files || {}),
      };
      break;
    }
    case "publishWebsite":
      result =
        args.mode === "preview"
          ? await publishWebsitePreview(String(args.id || ""), input.actorId)
          : await publishWebsiteLive(String(args.id || ""), input.actorId);
      break;
    case "createPage":
      result = await addPage(String(args.projectId || ""), {
        title: String(args.title || "Page"),
        slug: typeof args.slug === "string" ? args.slug : undefined,
      });
      break;
    case "deletePage":
      await deletePage(String(args.pageId || ""));
      result = { ok: true };
      break;
    case "listTemplates":
      result = await listTemplates();
      break;
    case "applyTemplate":
      result = await regenerateWebsite(
        String(args.id || ""),
        (args.mode as "preserve" | "rebuild" | "rewrite") || "rebuild",
        input.actorId,
      );
      break;
    case "updateBusiness":
      result = await updateWebsiteBusiness(
        String(args.businessId || ""),
        { name: String(args.name || "") } as never,
        input.actorId,
      );
      break;
    case "getTheme":
      result = await getTheme(String(args.id || ""));
      break;
    case "updateTheme":
      result = await updateTheme(
        String(args.id || ""),
        (args.theme || {}) as never,
        input.actorId,
      );
      break;
    case "listAssets":
      result = await listProjectAssets(String(args.id || ""));
      break;
    case "listComponents":
      result = await listPageComponents(
        String(args.projectId || ""),
        typeof args.pageId === "string" ? args.pageId : undefined,
      );
      break;
    case "addComponent":
      result = await addPageComponent({
        projectId: String(args.projectId || ""),
        pageId: typeof args.pageId === "string" ? args.pageId : undefined,
        type: String(args.type || ""),
        props: (args.props as Record<string, unknown>) || undefined,
        index: typeof args.index === "number" ? args.index : undefined,
      });
      break;
    case "updateComponent":
      result = await updatePageComponent({
        projectId: String(args.projectId || ""),
        pageId: typeof args.pageId === "string" ? args.pageId : undefined,
        index: Number(args.index),
        props: (args.props as Record<string, unknown>) || undefined,
        type: typeof args.type === "string" ? args.type : undefined,
      });
      break;
    case "removeComponent":
      result = await removePageComponent({
        projectId: String(args.projectId || ""),
        pageId: typeof args.pageId === "string" ? args.pageId : undefined,
        index: Number(args.index),
      });
      break;
    case "moveComponent":
      result = await movePageComponent({
        projectId: String(args.projectId || ""),
        pageId: typeof args.pageId === "string" ? args.pageId : undefined,
        fromIndex: Number(args.fromIndex),
        toIndex: Number(args.toIndex),
      });
      break;
    case "getDeploymentStatus":
      result = await getDeploymentStatus();
      break;
    case "deployWebsite":
      result = await deployWebsite(String(args.id || ""), input.actorId);
      break;
    case "scrapeWebsite": {
      const url = String(args.url || "");
      await assertPublicHttpUrl(url);
      result = await startWebsiteScrape({
        url,
        projectId:
          typeof args.projectId === "string" ? args.projectId : undefined,
        actorId: input.actorId,
        sync: args.sync !== false,
      });
      break;
    }
    case "getScrapeJob":
      result = await getWebsiteScrapeJob(String(args.jobId || ""));
      break;
    case "listScrapeJobs":
      result = await listWebsiteScrapeJobs(
        typeof args.projectId === "string" ? args.projectId : undefined,
      );
      break;
    case "applyScrape":
    case "approveImport":
      result = await applyWebsiteImport({
        projectId: String(args.projectId || ""),
        result: args.result as never,
        rebuildPages: args.rebuildPages !== false,
        actorId: input.actorId,
      });
      break;
    default:
      throw new Error(`Unhandled tool: ${input.name}`);
  }

  await emitFactoryEvent({
    name: "mcp.tool_executed",
    resourceType: "mcp",
    resourceId: tool.name,
    actorId: input.actorId,
    actorType: "mcp",
    meta: { tool: tool.name },
  });

  return result;
}

export function mcpClientConfigs(baseUrl: string) {
  const endpoint = `${baseUrl.replace(/\/$/, "")}/api/mcp`;
  return {
    cursor: {
      mcpServers: {
        aevion: {
          url: endpoint,
          headers: {
            Authorization: "Bearer ae_live_YOUR_KEY",
          },
        },
      },
    },
    claude: {
      mcpServers: {
        aevion: {
          type: "http",
          url: endpoint,
          headers: {
            Authorization: "Bearer ae_live_YOUR_KEY",
          },
        },
      },
    },
    codex: {
      mcp_servers: {
        aevion: {
          url: endpoint,
          bearer_token_env_var: "AEVION_API_KEY",
        },
      },
    },
  };
}
