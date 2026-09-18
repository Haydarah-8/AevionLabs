import { NextRequest, NextResponse } from "next/server";
import { allowedFrameUrl, headersBlockFraming } from "@/lib/frame-check";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function readHeaders(url: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const head = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; AevionPreview/1.0; +https://theaevionlabs.com)",
      },
    });
    if (
      head.ok ||
      head.headers.get("x-frame-options") ||
      head.headers.get("content-security-policy")
    ) {
      return head.headers;
    }
    const get = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        Accept: "text/html",
        "User-Agent":
          "Mozilla/5.0 (compatible; AevionPreview/1.0; +https://theaevionlabs.com)",
      },
    });
    return get.headers;
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("url")?.trim() || "";
  const allowed = allowedFrameUrl(raw);
  if (!allowed) {
    return NextResponse.json(
      { error: "This address is not available." },
      { status: 400 },
    );
  }

  try {
    const headers = await readHeaders(allowed.href);
    return NextResponse.json({ blocked: headersBlockFraming(headers) });
  } catch {
    return NextResponse.json({ blocked: null });
  }
}
