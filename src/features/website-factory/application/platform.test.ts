import { describe, expect, it } from "vitest";
import { hashApiKey } from "../application/api-keys";
import { rateLimit } from "../application/rate-limit";
import { apiError, apiOk, statusForCode } from "../application/http";
import { signWebhookPayload } from "../application/webhooks";
import { MCP_TOOLS } from "../integrations/mcp-server";

describe("api key hashing", () => {
  it("hashes deterministically", () => {
    const a = hashApiKey("ae_live_test");
    const b = hashApiKey("ae_live_test");
    expect(a).toBe(b);
    expect(a).toHaveLength(64);
  });
});

describe("rateLimit", () => {
  it("allows then blocks", () => {
    const key = `test-${Date.now()}-${Math.random()}`;
    expect(rateLimit({ key, limit: 2, windowMs: 60_000 }).ok).toBe(true);
    expect(rateLimit({ key, limit: 2, windowMs: 60_000 }).ok).toBe(true);
    expect(rateLimit({ key, limit: 2, windowMs: 60_000 }).ok).toBe(false);
  });
});

describe("http helpers", () => {
  it("returns ok envelope", async () => {
    const res = apiOk({ id: "1" }, { count: 1 });
    const json = await res.json();
    expect(json).toEqual({ data: { id: "1" }, meta: { count: 1 } });
  });

  it("returns error envelope", async () => {
    const res = apiError("NOT_FOUND", "missing", [], 404);
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error.code).toBe("NOT_FOUND");
  });

  it("maps status codes", () => {
    expect(statusForCode("UNAUTHORIZED")).toBe(401);
    expect(statusForCode("RATE_LIMITED")).toBe(429);
  });
});

describe("webhook signatures", () => {
  it("signs payloads", () => {
    const sig = signWebhookPayload("secret", '{"a":1}');
    expect(sig).toHaveLength(64);
  });
});

describe("MCP tools", () => {
  it("exposes typed tools without shell/sql", () => {
    const names = MCP_TOOLS.map((tool) => tool.name);
    expect(names).toContain("getWebsite");
    expect(names).toContain("scrapeWebsite");
    expect(names.join(" ")).not.toMatch(/shell|sql|exec/i);
  });
});
