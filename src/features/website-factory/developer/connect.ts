/**
 * Aevion Connect — generate install payloads for external AI clients.
 * Cursor uses a deeplink; Claude/Codex get downloadable/copyable JSON.
 */

export type ConnectClient = "cursor" | "claude" | "codex";

export function buildMcpServerConfig(host: string, apiKey: string) {
  const base = host.replace(/\/$/, "");
  return {
    url: `${base}/api/mcp`,
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  };
}

export function buildCursorMcpJson(host: string, apiKey: string) {
  return {
    mcpServers: {
      aevion: buildMcpServerConfig(host, apiKey),
    },
  };
}

export function buildClaudeMcpJson(host: string, apiKey: string) {
  return {
    mcpServers: {
      aevion: {
        type: "http",
        ...buildMcpServerConfig(host, apiKey),
      },
    },
  };
}

export function buildCodexMcpJson(host: string, _apiKey: string) {
  return {
    mcp_servers: {
      aevion: {
        url: `${host.replace(/\/$/, "")}/api/mcp`,
        bearer_token_env_var: "AEVION_API_KEY",
      },
    },
  };
}

function toBase64(value: string) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value, "utf8").toString("base64");
  }
  return btoa(unescape(encodeURIComponent(value)));
}

/** Cursor MCP install deeplink (opens Cursor with prefilled server config). */
export function cursorInstallDeeplink(host: string, apiKey: string) {
  const config = buildMcpServerConfig(host, apiKey);
  const encoded = toBase64(JSON.stringify(config));
  return `cursor://anysphere.cursor-deeplink/mcp/install?name=${encodeURIComponent("aevion")}&config=${encodeURIComponent(encoded)}`;
}

export function clientInstallPayload(
  client: ConnectClient,
  host: string,
  apiKey: string,
) {
  switch (client) {
    case "cursor":
      return {
        label: "Cursor",
        json: buildCursorMcpJson(host, apiKey),
        deeplink: cursorInstallDeeplink(host, apiKey),
        steps: [
          "Click Open in Cursor (or copy the JSON into Cursor MCP settings).",
          "Confirm the aevion server appears and restart MCP if prompted.",
          "Call listTools to verify — do not assume install succeeded.",
        ],
      };
    case "claude":
      return {
        label: "Claude",
        json: buildClaudeMcpJson(host, apiKey),
        deeplink: null as string | null,
        steps: [
          "Copy the JSON into Claude Desktop / Claude Code MCP settings.",
          "Replace nothing if the key is already embedded.",
          "Call listTools to verify.",
        ],
      };
    case "codex":
      return {
        label: "Codex",
        json: buildCodexMcpJson(host, apiKey),
        deeplink: null as string | null,
        steps: [
          "Export AEVION_API_KEY with your ae_live_ secret.",
          "Paste the JSON into Codex MCP config.",
          "Call listTools to verify.",
        ],
      };
  }
}
