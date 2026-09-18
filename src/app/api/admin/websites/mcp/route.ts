import { NextResponse } from "next/server";
import { isAdminRequest, getAdminUser } from "@/lib/admin-auth";
import {
  executeMcpTool,
  MCP_TOOLS,
  mcpClientConfigs,
} from "@/features/website-factory/integrations/mcp-server";
import { factoryErrorMessage } from "@/features/website-factory/services/schemas";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const ADMIN_SCOPES = new Set([
  "websites:read",
  "websites:write",
  "pages:read",
  "pages:write",
  "assets:read",
  "assets:write",
  "templates:read",
  "deployments:read",
  "deployments:write",
  "domains:read",
  "domains:write",
  "mcp:use",
]);

export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const origin = new URL(request.url).origin;
  return NextResponse.json({
    name: "aevion-website-factory",
    endpoint: "/api/admin/websites/mcp",
    tools: MCP_TOOLS,
    clientConfigs: mcpClientConfigs(origin),
  });
}

export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const user = await getAdminUser();
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
      scopes: ADMIN_SCOPES,
      actorId: user?.id ?? null,
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
