import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * TEMPORARY DIAGNOSTIC — deleted once the cron authorises.
 *
 * Behind a throwaway token this time. The previous version was open, which
 * let anyone enumerate which environment variables exist on the deployment;
 * harmless in itself but not something to leave sitting on a production site.
 * Anything without the token gets a 404, so the route is invisible.
 */
const TOKEN = "0a14119c6baefd8b7f816c22";

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get("k") !== TOKEN) {
    return new NextResponse("Not found", { status: 404 });
  }
  const raw = process.env.CRON_SECRET;
  const trimmed = raw?.trim() ?? "";
  return NextResponse.json({
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "unknown",
    env: process.env.VERCEL_ENV ?? "unknown",
    cronSecretSet: Boolean(raw),
    cronSecretLength: trimmed.length,
    cronSecretQuoted: /^["']|["']$/.test(raw ?? ""),
    cronFingerprint: trimmed
      ? createHash("sha256").update(trimmed).digest("hex").slice(0, 8)
      : null,
    firecrawlSet: Boolean(process.env.FIRECRAWL_API_KEY),
    /**
     * Names only, never values.
     *
     * Distinguishes the two remaining explanations: a variable scoped to the
     * wrong environment simply will not appear here, whereas one saved under a
     * mangled name — a trailing space, a zero-width character, CRONSECRET —
     * will appear looking almost right. JSON.stringify makes stray whitespace
     * visible, which reading the dashboard cannot.
     */
    matchingNames: Object.keys(process.env)
      .filter((k) => /cron|secret|site|url/i.test(k))
      .sort()
      .map((k) => JSON.stringify(k)),
  });
}
