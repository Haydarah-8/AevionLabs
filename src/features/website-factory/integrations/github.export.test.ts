import { describe, expect, it, vi, afterEach } from "vitest";

/**
 * GitHub full-file commit uses Contents API per export path.
 * Mock fetch to assert we PUT more than README-only.
 */
describe("GitHub full export commits", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("commits every file from the export map", async () => {
    const puts: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string | URL, init?: RequestInit) => {
        const u = String(url);
        if (u.includes("/git/ref/heads/")) {
          return Response.json({ object: { sha: "abc123" } });
        }
        if (u.includes("/git/refs") && init?.method === "POST") {
          return new Response(null, { status: 201 });
        }
        if (u.includes("/contents/") && init?.method === "PUT") {
          puts.push(u);
          return new Response(null, { status: 201 });
        }
        if (u.includes("/pulls") && init?.method === "POST") {
          return Response.json({
            html_url: "https://github.com/o/r/pull/1",
            number: 1,
          });
        }
        return new Response("unexpected", { status: 500 });
      }),
    );

    vi.doMock("../application/integrations", () => ({
      getIntegration: async () => ({
        provider: "github",
        status: "connected",
      }),
    }));
    vi.doMock("../application/deployment", () => ({
      exportWebsiteZip: async () => ({
        filename: "site.zip",
        buffer: Buffer.from("x"),
        files: {
          "package.json": "{}",
          "README.md": "# hi",
          "app/page.tsx": "export default function Page(){return null}",
        },
      }),
    }));
    vi.doMock("../application/events", () => ({
      emitFactoryEvent: async () => undefined,
    }));

    process.env.GITHUB_TOKEN = "test-token";
    const { exportToGithubPullRequest } =
      await import("../integrations/github");
    const result = await exportToGithubPullRequest({
      projectId: "proj-1",
      owner: "acme",
      repo: "site",
    });

    expect(result.files).toBe(3);
    expect(puts.length).toBe(3);
    expect(puts.some((u) => u.includes("package.json"))).toBe(true);
    expect(puts.some((u) => u.includes("app/page.tsx"))).toBe(true);
  });
});
