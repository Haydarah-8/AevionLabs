import { describe, expect, it } from "vitest";
import { AEVION_PILLARS, CONNECT_DEFAULT_SCOPES } from "./pillars";
import {
  buildCursorMcpJson,
  clientInstallPayload,
  cursorInstallDeeplink,
} from "../developer/connect";

describe("Aevion platform pillars", () => {
  it("exposes all seven product pillars", () => {
    expect(AEVION_PILLARS.map((p) => p.id)).toEqual([
      "puck",
      "core",
      "api",
      "mcp",
      "skills",
      "connect",
      "docs",
    ]);
  });

  it("points Connect at /admin/developer/connect", () => {
    const connect = AEVION_PILLARS.find((p) => p.id === "connect");
    expect(connect?.surfaces[0].href).toBe("/admin/developer/connect");
  });
});

describe("Aevion Connect install payloads", () => {
  it("builds cursor deeplink with base64 config", () => {
    const link = cursorInstallDeeplink("https://app.example", "ae_live_test");
    expect(
      link.startsWith("cursor://anysphere.cursor-deeplink/mcp/install?"),
    ).toBe(true);
    expect(link).toContain("name=aevion");
    expect(link).toContain("config=");
  });

  it("embeds bearer key in cursor json", () => {
    const json = buildCursorMcpJson("https://app.example", "ae_live_test");
    expect(json.mcpServers.aevion.headers.Authorization).toBe(
      "Bearer ae_live_test",
    );
  });

  it("returns install steps for each client", () => {
    for (const client of ["cursor", "claude", "codex"] as const) {
      const payload = clientInstallPayload(
        client,
        "https://app.example",
        "ae_live_x",
      );
      expect(payload.steps.length).toBeGreaterThan(0);
      expect(payload.json).toBeTruthy();
    }
  });

  it("uses mcp:use in default connect scopes", () => {
    expect(CONNECT_DEFAULT_SCOPES).toContain("mcp:use");
  });
});
