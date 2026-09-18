import { NextRequest, NextResponse } from "next/server";
import { isCronAuthorized } from "@/lib/news/ingestion/auth";
import { ingestProvider } from "@/lib/news/ingestion/run";
import type { NewsProviderId } from "@/lib/news/types";
import { PROVIDER_IDS } from "@/lib/news/providers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> },
) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { provider } = await context.params;
  if (!PROVIDER_IDS.includes(provider as NewsProviderId)) {
    return NextResponse.json({ error: "Unknown provider" }, { status: 404 });
  }
  try {
    const result = await ingestProvider(provider as NewsProviderId);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[cron/news] provider ingest:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Ingest failed" },
      { status: 500 },
    );
  }
}
