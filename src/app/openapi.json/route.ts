export const dynamic = "force-dynamic";

const paths: Record<string, Record<string, unknown>> = {
  "/api/v1/websites": {
    get: {
      summary: "List websites",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Website list",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { type: "array", items: { type: "object" } },
                  meta: { type: "object" },
                },
              },
            },
          },
        },
      },
    },
    post: {
      summary: "Create website",
      security: [{ bearerAuth: [] }],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string" },
                templateId: { type: "string" },
                businessId: { type: "string" },
                wizard: { type: "object" },
              },
            },
          },
        },
      },
      responses: { "201": { description: "Created" } },
    },
  },
  "/api/v1/websites/{id}": {
    get: {
      summary: "Get website bundle",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { "200": { description: "Bundle" } },
    },
    patch: {
      summary: "Update website",
      security: [{ bearerAuth: [] }],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string" },
                theme: { type: "object" },
                status: { type: "string" },
              },
            },
          },
        },
      },
      responses: { "200": { description: "Updated" } },
    },
  },
  "/api/v1/websites/{id}/pages": {
    get: { summary: "List pages", security: [{ bearerAuth: [] }], responses: { "200": { description: "Pages" } } },
    post: {
      summary: "Create page",
      security: [{ bearerAuth: [] }],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["title"],
              properties: {
                title: { type: "string" },
                slug: { type: "string" },
              },
            },
          },
        },
      },
      responses: { "201": { description: "Created" } },
    },
  },
  "/api/v1/websites/{id}/publish": {
    post: {
      summary: "Publish preview or live",
      security: [{ bearerAuth: [] }],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: { mode: { type: "string", enum: ["preview", "live"] } },
            },
          },
        },
      },
      responses: { "200": { description: "Published" } },
    },
  },
  "/api/v1/websites/{id}/deploy": {
    get: { summary: "Deployment status", security: [{ bearerAuth: [] }], responses: { "200": { description: "Status" } } },
    post: { summary: "Deploy to Vercel", security: [{ bearerAuth: [] }], responses: { "200": { description: "Deployed" } } },
  },
  "/api/v1/websites/{id}/export": {
    get: { summary: "Export ZIP", security: [{ bearerAuth: [] }], responses: { "200": { description: "application/zip" } } },
  },
  "/api/v1/websites/{id}/theme": {
    get: { summary: "Get theme tokens", security: [{ bearerAuth: [] }], responses: { "200": { description: "Theme" } } },
    patch: {
      summary: "Update theme tokens",
      security: [{ bearerAuth: [] }],
      requestBody: {
        content: {
          "application/json": {
            schema: { type: "object", additionalProperties: true },
          },
        },
      },
      responses: { "200": { description: "Updated" } },
    },
  },
  "/api/v1/websites/{id}/assets": {
    get: { summary: "List project assets", security: [{ bearerAuth: [] }], responses: { "200": { description: "Assets" } } },
  },
  "/api/v1/websites/{id}/domains": {
    get: { summary: "List domains + expected DNS", security: [{ bearerAuth: [] }], responses: { "200": { description: "Domains" } } },
    post: {
      summary: "Connect domain",
      security: [{ bearerAuth: [] }],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["hostname"],
              properties: { hostname: { type: "string" } },
            },
          },
        },
      },
      responses: { "201": { description: "Connected" } },
    },
  },
  "/api/v1/websites/{id}/domains/verify": {
    post: {
      summary: "Verify domain DNS (honest)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: { hostname: { type: "string" } },
            },
          },
        },
      },
      responses: { "200": { description: "Verification result" } },
    },
  },
  "/api/v1/templates": {
    get: { summary: "List templates", security: [{ bearerAuth: [] }], responses: { "200": { description: "Templates" } } },
  },
  "/api/v1/businesses": {
    get: { summary: "List businesses", security: [{ bearerAuth: [] }], responses: { "200": { description: "Businesses" } } },
  },
  "/api/v1/webhooks": {
    get: { summary: "List webhooks", security: [{ bearerAuth: [] }], responses: { "200": { description: "Webhooks" } } },
    post: { summary: "Create webhook", security: [{ bearerAuth: [] }], responses: { "201": { description: "Created" } } },
    delete: { summary: "Delete webhook", security: [{ bearerAuth: [] }], responses: { "200": { description: "Deleted" } } },
  },
  "/api/v1/skills": {
    get: { summary: "List skill packages", security: [{ bearerAuth: [] }], responses: { "200": { description: "Skills" } } },
  },
  "/api/v1/api-keys": {
    get: { summary: "List API keys (admin)", security: [{ bearerAuth: [] }], responses: { "200": { description: "Keys" } } },
    post: { summary: "Create API key (admin)", security: [{ bearerAuth: [] }], responses: { "201": { description: "Key + secret once" } } },
    delete: { summary: "Revoke API key", security: [{ bearerAuth: [] }], responses: { "200": { description: "Revoked" } } },
  },
  "/api/v1/integrations": {
    get: { summary: "List integrations", security: [{ bearerAuth: [] }], responses: { "200": { description: "Integrations" } } },
  },
  "/api/v1/integrations/github/start": {
    post: { summary: "Start GitHub OAuth", security: [{ bearerAuth: [] }], responses: { "200": { description: "Authorize URL" } } },
  },
  "/api/mcp": {
    get: { summary: "List MCP tools + resources", security: [{ bearerAuth: [] }], responses: { "200": { description: "Tools" } } },
    post: {
      summary: "Execute MCP tool",
      security: [{ bearerAuth: [] }],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["tool"],
              properties: {
                tool: { type: "string" },
                arguments: { type: "object" },
              },
            },
          },
        },
      },
      responses: { "200": { description: "Result" } },
    },
  },
};

export async function GET() {
  return Response.json({
    openapi: "3.1.0",
    info: {
      title: "Aevion Website Factory API",
      version: "1.0.0",
      description:
        "Shipped endpoints for the Aevion Website Factory. Authenticate with Bearer ae_live_* API keys or an admin session cookie.",
    },
    servers: [{ url: "/" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "ae_live_*",
        },
      },
      schemas: {
        ApiOk: {
          type: "object",
          properties: {
            data: {},
            meta: { type: "object" },
          },
        },
        ApiError: {
          type: "object",
          properties: {
            error: {
              type: "object",
              properties: {
                code: { type: "string" },
                message: { type: "string" },
                details: { type: "array" },
              },
            },
          },
        },
      },
    },
    paths,
  });
}
