export const API_SCOPES = [
  "websites:read",
  "websites:write",
  "pages:read",
  "pages:write",
  "assets:read",
  "assets:write",
  "templates:read",
  "themes:read",
  "themes:write",
  "businesses:read",
  "webhooks:read",
  "webhooks:write",
  "deployments:read",
  "deployments:write",
  "domains:read",
  "domains:write",
  "mcp:use",
] as const;

export type ApiScope = (typeof API_SCOPES)[number];
