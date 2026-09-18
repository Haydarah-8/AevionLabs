import { NextRequest, NextResponse } from "next/server";
import {
  addVisitor,
  lookupGeo,
  parseUserAgent,
  uuid,
  type ClientTrackPayload,
  type VisitorRecord,
} from "@/lib/tracker-store";

export const dynamic = "force-dynamic";

/** Extract real IP from proxy headers, falling back to socket address. */
function extractIP(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  // Fallback for local dev
  return "127.0.0.1";
}

/** Vercel's edge network resolves these from the true client IP and attaches
 * them to every request — absent when running outside Vercel (e.g. local dev). */
function extractVercelGeo(req: NextRequest) {
  return {
    city: req.headers.get("x-vercel-ip-city") || undefined,
    countryCode: req.headers.get("x-vercel-ip-country") || undefined,
    region: req.headers.get("x-vercel-ip-country-region") || undefined,
    latitude: req.headers.get("x-vercel-ip-latitude") || undefined,
    longitude: req.headers.get("x-vercel-ip-longitude") || undefined,
    timezone: req.headers.get("x-vercel-ip-timezone") || undefined,
    postalCode: req.headers.get("x-vercel-ip-postal-code") || undefined,
  };
}

// Known automated crawlers/screenshot bots — most notably Vercel's own per-deployment
// preview screenshot bot, which hits every deploy from a datacenter IP and otherwise
// shows up in analytics as a fake "visitor" from wherever that datacenter is.
const BOT_UA_PATTERN =
  /HeadlessChrome|Googlebot|bingbot|Slurp|DuckDuckBot|Baiduspider|YandexBot|facebookexternalhit|Twitterbot|Slackbot|AhrefsBot|SemrushBot|MJ12bot|DotBot|PetalBot|Bytespider/i;

async function readTrackPayload(
  request: NextRequest,
): Promise<ClientTrackPayload> {
  const raw = await request.text();
  if (!raw.trim()) {
    throw new Error("empty body");
  }
  return JSON.parse(raw) as ClientTrackPayload;
}

export async function POST(request: NextRequest) {
  try {
    const body = await readTrackPayload(request);

    const ip = extractIP(request);
    const ua = body.browser?.userAgent || request.headers.get("user-agent") || "";

    if (BOT_UA_PATTERN.test(ua)) {
      return NextResponse.json({ ok: true, skipped: "bot" }, { status: 200 });
    }

    const { browserName, browserVersion, engine, os, osVersion, deviceType } =
      parseUserAgent(ua);

    // Geo lookup (non-blocking failure)
    const location = await lookupGeo(
      ip,
      body.timezone || "",
      body.timezoneOffset ?? 0,
      body.locale || "",
      extractVercelGeo(request),
      body.precise,
    );

    const record: VisitorRecord = {
      id: uuid(),
      visitorId: body.visitorId || uuid(),
      timestamp: new Date().toISOString(),
      type: (body.sessionNumber ?? 1) <= 1 ? "new" : "returning",
      sessionNumber: body.sessionNumber ?? 1,
      ip,
      page: {
        url: body.page?.url || "",
        path: body.page?.path || "",
        title: body.page?.title || "",
        referrer: body.page?.referrer || "",
        hash: body.page?.hash || "",
        queryString: body.page?.queryString || "",
      },
      browser: {
        name: browserName,
        version: browserVersion,
        engine,
        userAgent: ua,
        language: body.browser?.language || "",
        languages: body.browser?.languages || [],
        cookiesEnabled: body.browser?.cookiesEnabled ?? true,
        doNotTrack: body.browser?.doNotTrack ?? false,
        online: body.browser?.online ?? true,
        pdfViewerEnabled: body.browser?.pdfViewerEnabled ?? false,
      },
      device: {
        type: deviceType,
        os,
        osVersion,
        platform: body.device?.platform || "",
        vendor: body.device?.vendor || "",
        screenWidth: body.device?.screenWidth ?? 0,
        screenHeight: body.device?.screenHeight ?? 0,
        viewportWidth: body.device?.viewportWidth ?? 0,
        viewportHeight: body.device?.viewportHeight ?? 0,
        pixelRatio: body.device?.pixelRatio ?? 1,
        colorDepth: body.device?.colorDepth ?? 24,
        touchPoints: body.device?.touchPoints ?? 0,
        hardwareConcurrency: body.device?.hardwareConcurrency ?? 0,
        deviceMemory: body.device?.deviceMemory ?? null,
        orientation: body.device?.orientation || "landscape",
      },
      network: {
        effectiveType: body.network?.effectiveType || "",
        downlink: body.network?.downlink ?? null,
        rtt: body.network?.rtt ?? null,
        saveData: body.network?.saveData ?? false,
      },
      location,
      performance: {
        pageLoadTime: body.performance?.pageLoadTime ?? null,
        domContentLoaded: body.performance?.domContentLoaded ?? null,
        firstPaint: body.performance?.firstPaint ?? null,
        dnsLookup: body.performance?.dnsLookup ?? null,
        tcpConnection: body.performance?.tcpConnection ?? null,
        serverResponse: body.performance?.serverResponse ?? null,
        domInteractive: body.performance?.domInteractive ?? null,
      },
    };

    await addVisitor(record);

    return NextResponse.json({ ok: true, id: record.id }, { status: 200 });
  } catch (err) {
    console.error("[track] Error:", err);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}
