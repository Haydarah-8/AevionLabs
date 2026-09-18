import { NextResponse } from "next/server";
import {
  exchangeGithubCode,
  upsertIntegration,
} from "@/features/website-factory/application/integrations";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3005";
  const redirectBase = `${site.replace(/\/$/, "")}/admin/developer/integrations`;

  if (error) {
    return NextResponse.redirect(
      `${redirectBase}?error=${encodeURIComponent(error)}`,
    );
  }
  if (!code) {
    return NextResponse.redirect(
      `${redirectBase}?error=${encodeURIComponent("missing_code")}`,
    );
  }

  try {
    const { token, login } = await exchangeGithubCode(code);
    await upsertIntegration({
      provider: "github",
      status: "connected",
      accountLabel: login,
      credentials: token,
      meta: { login },
    });
    return NextResponse.redirect(`${redirectBase}?connected=github`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "oauth_failed";
    return NextResponse.redirect(
      `${redirectBase}?error=${encodeURIComponent(message)}`,
    );
  }
}
