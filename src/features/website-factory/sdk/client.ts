export type AevionClientOptions = {
  baseUrl: string;
  apiKey: string;
};

export class AevionClient {
  constructor(private options: AevionClientOptions) {}

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${this.options.baseUrl.replace(/\/$/, "")}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.options.apiKey}`,
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(
        (json as { error?: { message?: string } })?.error?.message ||
          `Request failed (${res.status})`,
      );
    }
    return (json as { data: T }).data;
  }

  listWebsites() {
    return this.request<unknown[]>("/api/v1/websites");
  }

  createWebsite(body: Record<string, unknown>) {
    return this.request<unknown>("/api/v1/websites", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  getWebsite(id: string) {
    return this.request<unknown>(`/api/v1/websites/${id}`);
  }

  updateWebsite(id: string, body: Record<string, unknown>) {
    return this.request<unknown>(`/api/v1/websites/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  publish(id: string, mode: "preview" | "live" = "live") {
    return this.request<unknown>(`/api/v1/websites/${id}/publish`, {
      method: "POST",
      body: JSON.stringify({ mode }),
    });
  }

  deploy(id: string) {
    return this.request<unknown>(`/api/v1/websites/${id}/deploy`, {
      method: "POST",
    });
  }

  export(id: string) {
    return this.request<unknown>(`/api/v1/websites/${id}/export`);
  }

  listPages(id: string) {
    return this.request<unknown[]>(`/api/v1/websites/${id}/pages`);
  }

  createPage(id: string, body: { title: string; slug?: string }) {
    return this.request<unknown>(`/api/v1/websites/${id}/pages`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  getTheme(id: string) {
    return this.request<unknown>(`/api/v1/websites/${id}/theme`);
  }

  updateTheme(id: string, theme: Record<string, unknown>) {
    return this.request<unknown>(`/api/v1/websites/${id}/theme`, {
      method: "PATCH",
      body: JSON.stringify(theme),
    });
  }

  listAssets(id: string) {
    return this.request<unknown[]>(`/api/v1/websites/${id}/assets`);
  }

  listDomains(id: string) {
    return this.request<unknown>(`/api/v1/websites/${id}/domains`);
  }

  addDomain(id: string, hostname: string) {
    return this.request<unknown>(`/api/v1/websites/${id}/domains`, {
      method: "POST",
      body: JSON.stringify({ hostname }),
    });
  }

  verifyDomain(id: string, hostname?: string) {
    return this.request<unknown>(`/api/v1/websites/${id}/domains/verify`, {
      method: "POST",
      body: JSON.stringify({ hostname }),
    });
  }

  listTemplates() {
    return this.request<unknown[]>("/api/v1/templates");
  }

  listBusinesses() {
    return this.request<unknown[]>("/api/v1/businesses");
  }

  listWebhooks() {
    return this.request<unknown>("/api/v1/webhooks");
  }

  listSkills() {
    return this.request<unknown[]>("/api/v1/skills");
  }

  mcp(tool: string, args?: Record<string, unknown>) {
    return this.request<unknown>("/api/mcp", {
      method: "POST",
      body: JSON.stringify({ tool, arguments: args }),
    });
  }
}
