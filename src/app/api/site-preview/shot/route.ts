import { NextRequest, NextResponse } from "next/server";
import { allowedFrameUrl } from "@/lib/frame-check";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FETCH_MS = 12_000;

function mshots(target: string) {
  return `https://s.wordpress.com/mshots/v1/${encodeURIComponent(target)}?w=1600&h=1000`;
}

function thum(target: string) {
  return `https://image.thum.io/get/width/1600/crop/1000/noanimate/${target}`;
}

async function fetchShot(href: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_MS);
  try {
    const res = await fetch(href, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        Accept: "image/avif,image/webp,image/*,*/*;q=0.8",
        "User-Agent":
          "Mozilla/5.0 (compatible; AevionPreview/1.0; +https://theaevionlabs.com)",
      },
    });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") || "";
    if (!type.startsWith("image/")) return null;
    const bytes = await res.arrayBuffer();
    if (bytes.byteLength < 800) return null;
    return { bytes, type: type.split(";")[0] };
  } catch {
    return null;
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

  const shot =
    (await fetchShot(mshots(allowed.href))) ||
    (await fetchShot(thum(allowed.href)));

  if (!shot) {
    return NextResponse.json({ error: "No screenshot" }, { status: 404 });
  }

  return new NextResponse(shot.bytes, {
    headers: {
      "Content-Type": shot.type,
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
