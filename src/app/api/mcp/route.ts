import { NextResponse } from "next/server";
import { authenticateApiRequest } from "@/features/website-factory/developer/auth";
import {
  executeMcpTool,
  MCP_TOOLS,
  MCP_RESOURCES,
  mcpClientConfigs,
} from "@/features/website-factory/integrations/mcp-server";
import { factoryErrorMessage } from "@/features/website-factory/services/schemas";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  const auth = await authenticateApiRequest(request, {
    requiredScope: "mcp:use",
  });
  if (auth instanceof Response) return auth;
  const origin = new URL(request.url).origin;
  return NextResponse.json({
    name: "aevion-website-factory",
    endpoint: "/api/mcp",
    tools: MCP_TOOLS,
    resources: MCP_RESOURCES,
    clientConfigs: mcpClientConfigs(origin),
  });
}

export async function POST(request: Request) {
  const auth = await authenticateApiRequest(request, {
    requiredScope: "mcp:use",
    limit: 60,
  });
  if (auth instanceof Response) return auth;
  try {
    const body = (await request.json()) as {
      tool?: string;
      name?: string;
      arguments?: Record<string, unknown>;
    };
    const name = body.tool || body.name;
    if (!name) {
      return NextResponse.json({ error: "tool is required" }, { status: 400 });
    }
    const result = await executeMcpTool({
      name,
      arguments: body.arguments,
      scopes: auth.scopes,
      actorId: auth.actorId,
    });
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    const status =
      err && typeof err === "object" && "status" in err
        ? Number((err as { status: number }).status)
        : 400;
    return NextResponse.json(
      { error: factoryErrorMessage(err, "MCP tool failed") },
      { status },
    );
  }
}
