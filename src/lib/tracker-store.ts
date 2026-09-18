/* ── Visitor record types + Supabase-backed store for live analytics ── */

import { getSupabaseAdmin, hasSupabaseAdmin } from "@/lib/supabase-admin";
import { townFromLocation } from "@/lib/visitors/place";

const MAX_RECORDS = 10_000;

/* ────────────────────────── Types ────────────────────────── */

export type VisitorRecord = {
  /** Unique visit ID (one per page view) */
  id: string;
  /** Persistent visitor ID (cookie/localStorage) */
  visitorId: string;
  /** ISO 8601 timestamp */
  timestamp: string;
  /** new = first-time visitor, returning = seen before */
  type: "new" | "returning";
  /** Which visit number this is for this visitor */
  sessionNumber: number;

  /* ── Request ── */
  ip: string;

  /* ── Page ── */
  page: {
    url: string;
    path: string;
    title: string;
    referrer: string;
    hash: string;
    queryString: string;
  };

  /* ── Browser ── */
  browser: {
    name: string;
    version: string;
    engine: string;
    userAgent: string;
    language: string;
    languages: string[];
    cookiesEnabled: boolean;
    doNotTrack: boolean;
    online: boolean;
    pdfViewerEnabled: boolean;
  };

  /* ── Device ── */
  device: {
    type: string;
    os: string;
    osVersion: string;
    platform: string;
    vendor: string;
    screenWidth: number;
    screenHeight: number;
    viewportWidth: number;
    viewportHeight: number;
    pixelRatio: number;
    colorDepth: number;
    touchPoints: number;
    hardwareConcurrency: number;
    deviceMemory: number | null;
    orientation: string;
  };

  /* ── Network ── */
  network: {
    effectiveType: string;
    downlink: number | null;
    rtt: number | null;
    saveData: boolean;
  };

  /* ── Location ── */
  location: {
    timezone: string;
    timezoneOffset: number;
    locale: string;
    country: string;
    countryCode: string;
    region: string;
    city: string;
    zip: string;
    isp: string;
    org: string;
    lat: number | null;
    lon: number | null;

    /**
     * What the address itself says about the connection.
     *
     * All optional: records written before these were collected simply do not
     * carry them, and a field that is absent is shown as unknown rather than
     * as false — "not a datacentre" and "we never checked" are different
     * claims.
     */
    /** Autonomous system, e.g. "AS15169". */
    asn?: string;
    /** Who runs it, e.g. "GOOGLE". */
    asName?: string;
    /** Reverse DNS for the address, when it resolves. */
    reverse?: string;
    /** A mobile carrier network. */
    mobile?: boolean;
    /** A known VPN, proxy or Tor exit. */
    proxy?: boolean;
    /** A datacentre or hosting provider rather than a consumer connection. */
    hosting?: boolean;
    /** Which service resolved this, so the precision can be judged. */
    source?: "vercel-edge" | "ip-api" | "ipwho.is" | "local" | "device";
    /**
     * Metres of uncertainty around lat/lon, present only for a device fix.
     *
     * An IP-derived position has no meaningful figure to put here — it is a
     * guess at a network, not a measurement — so it stays undefined rather
     * than carrying an invented number.
     */
    accuracyM?: number;

  };

  /* ── Performance ── */
  performance: {
    pageLoadTime: number | null;
    domContentLoaded: number | null;
    firstPaint: number | null;
    dnsLookup: number | null;
    tcpConnection: number | null;
    serverResponse: number | null;
    domInteractive: number | null;
  };
};

export type VisitorStats = {
  totalAll: number;
  totalToday: number;
  newToday: number;
  returningToday: number;
  uniqueVisitors: number;
  topBrowser: string;
  topOS: string;
  topCountry: string;
  topPage: string;
};

/* ── Client payload (sent from the browser) ── */
export type ClientTrackPayload = {
  visitorId: string;
  sessionNumber: number;
  /**
   * A position the browser handed over without being asked.
   *
   * Present only when the reader had already granted location for this site,
   * so its absence is the ordinary case and means nothing beyond "not
   * granted". See TrackerScript — nothing on that path ever raises a prompt.
   */
  precise?: { lat: number; lon: number; accuracyM: number };
  page: VisitorRecord["page"];
  browser: Omit<VisitorRecord["browser"], "name" | "version" | "engine">;
  device: Omit<VisitorRecord["device"], "os" | "osVersion" | "type">;
  network: VisitorRecord["network"];
  timezone: string;
  timezoneOffset: number;
  locale: string;
  performance: VisitorRecord["performance"];
};

/* ────────────────────────── UA Parser ────────────────────────── */

export function parseUserAgent(ua: string) {
  let browserName = "Unknown";
  let browserVersion = "";
  let engine = "Unknown";
  let os = "Unknown";
  let osVersion = "";
  let deviceType = "desktop";

  // Browser detection (order matters — more specific first)
  if (/Edg\//i.test(ua)) {
    browserName = "Edge";
    browserVersion = ua.match(/Edg\/([\d.]+)/)?.[1] ?? "";
    engine = "Blink";
  } else if (/OPR\//i.test(ua) || /Opera/i.test(ua)) {
    browserName = "Opera";
    browserVersion = ua.match(/(?:OPR|Opera)\/([\d.]+)/)?.[1] ?? "";
    engine = "Blink";
  } else if (/SamsungBrowser/i.test(ua)) {
    browserName = "Samsung Internet";
    browserVersion = ua.match(/SamsungBrowser\/([\d.]+)/)?.[1] ?? "";
    engine = "Blink";
  } else if (/Chrome/i.test(ua) && !/Chromium/i.test(ua)) {
    browserName = "Chrome";
    browserVersion = ua.match(/Chrome\/([\d.]+)/)?.[1] ?? "";
    engine = "Blink";
  } else if (/Firefox/i.test(ua)) {
    browserName = "Firefox";
    browserVersion = ua.match(/Firefox\/([\d.]+)/)?.[1] ?? "";
    engine = "Gecko";
  } else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
    browserName = "Safari";
    browserVersion = ua.match(/Version\/([\d.]+)/)?.[1] ?? "";
    engine = "WebKit";
  }

  // OS detection
  if (/Windows NT 10/i.test(ua)) {
    os = "Windows";
    osVersion = ua.match(/Windows NT ([\d.]+)/)?.[1] === "10.0" ? "10/11" : "10";
  } else if (/Windows NT/i.test(ua)) {
    os = "Windows";
    osVersion = ua.match(/Windows NT ([\d.]+)/)?.[1] ?? "";
  } else if (/Mac OS X/i.test(ua)) {
    os = "macOS";
    osVersion = ua.match(/Mac OS X ([\d_.]+)/)?.[1]?.replace(/_/g, ".") ?? "";
  } else if (/CrOS/i.test(ua)) {
    os = "Chrome OS";
  } else if (/Android/i.test(ua)) {
    os = "Android";
    osVersion = ua.match(/Android ([\d.]+)/)?.[1] ?? "";
  } else if (/iPhone|iPad|iPod/i.test(ua)) {
    os = "iOS";
    osVersion = ua.match(/OS ([\d_]+)/)?.[1]?.replace(/_/g, ".") ?? "";
  } else if (/Linux/i.test(ua)) {
    os = "Linux";
  }

  // Device type
  if (/Mobi|Android.*Mobile|iPhone|iPod/i.test(ua)) {
    deviceType = "mobile";
  } else if (/iPad|Android(?!.*Mobile)|Tablet/i.test(ua)) {
    deviceType = "tablet";
  }

  return { browserName, browserVersion, engine, os, osVersion, deviceType };
}

/* ────────────────────────── IP Geo Lookup ────────────────────────── */

const geoCache = new Map<string, VisitorRecord["location"]>();

const LOCALHOST_IPS = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1", "localhost"]);

/** Geolocation headers Vercel's edge network attaches to every request, resolved
 * from the true client IP server-side. Far more reliable than a third-party
 * IP-geolocation API call, so this is preferred whenever present. */
export type VercelGeoHeaders = {
  city?: string;
  countryCode?: string;
  region?: string;
  latitude?: string;
  longitude?: string;
  timezone?: string;
  postalCode?: string;
};

function countryNameFromCode(code: string): string {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) || code;
  } catch {
    return code;
  }
}

export async function lookupGeo(
  ip: string,
  clientTz: string,
  clientTzOffset: number,
  clientLocale: string,
  vercelGeo?: VercelGeoHeaders,
  /** A position the browser volunteered, when permission already stood. */
  precise?: { lat: number; lon: number; accuracyM: number },
): Promise<VisitorRecord["location"]> {
  const base: VisitorRecord["location"] = {
    timezone: clientTz || "",
    timezoneOffset: clientTzOffset ?? 0,
    locale: clientLocale || "",
    country: "",
    countryCode: "",
    region: "",
    city: "",
    zip: "",
    isp: "",
    org: "",
    lat: null,
    lon: null,
  };

  if (LOCALHOST_IPS.has(ip) || ip.startsWith("192.168.") || ip.startsWith("10.")) {
    return {
      ...base,
      country: "Local Network",
      countryCode: "LO",
      city: "localhost",
      source: "local",
    };
  }

  if (geoCache.has(ip) && !precise) {
    const cached = geoCache.get(ip)!;
    return {
      ...cached,
      timezone: clientTz || cached.timezone,
      timezoneOffset: clientTzOffset,
      locale: clientLocale,
    };
  }

  /**
   * Two lookups, and neither of them can tell you where somebody is.
   *
   * An address resolves to how a network routes it, which is the provider's
   * point of presence — a city at best, and frequently the wrong one: a mobile
   * connection lands wherever the carrier's gateway is, and a VPN reports its
   * exit node. Treat the city as a region and the coordinates as its centre.
   *
   * The genuinely reliable part is what the address *is*. `hosting`, `proxy`
   * and `mobile` say whether this is a datacentre, an anonymiser or a phone,
   * and the AS says who runs the network. That answers "is this a person"
   * far better than a pin on a map does.
   *
   * ip-api is asked first for those fields. ipwho.is is the fallback: also
   * free and unauthenticated, and over HTTPS, though it carries no proxy or
   * hosting flags — so a record from it leaves them undefined rather than
   * claiming false.
   */
  const enrich = async (): Promise<VisitorRecord["location"] | null> => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(
        `http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,zip,lat,lon,timezone,isp,org,as,asname,reverse,mobile,proxy,hosting`,
        { signal: controller.signal },
      );
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        if (data.status === "success") {
          return {
            timezone: data.timezone || clientTz,
            timezoneOffset: clientTzOffset,
            locale: clientLocale,
            country: data.country || "",
            countryCode: data.countryCode || "",
            region: data.regionName || "",
            city: townFromLocation({
              city: data.city,
              zip: data.zip,
              countryCode: data.countryCode,
            }),
            zip: data.zip || "",
            isp: data.isp || "",
            org: data.org || "",
            lat: data.lat ?? null,
            lon: data.lon ?? null,
            asn: typeof data.as === "string" ? data.as.split(" ")[0] : undefined,
            asName: data.asname || undefined,
            reverse: data.reverse || undefined,
            mobile: typeof data.mobile === "boolean" ? data.mobile : undefined,
            proxy: typeof data.proxy === "boolean" ? data.proxy : undefined,
            hosting:
              typeof data.hosting === "boolean" ? data.hosting : undefined,
            source: "ip-api",
          };
        }
      }
    } catch {
      /* fall through to the second provider */
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`https://ipwho.is/${ip}`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        if (data.success !== false) {
          return {
            timezone: data.timezone?.id || clientTz,
            timezoneOffset: clientTzOffset,
            locale: clientLocale,
            country: data.country || "",
            countryCode: data.country_code || "",
            region: data.region || "",
            city: townFromLocation({
              city: data.city,
              zip: data.postal,
              countryCode: data.country_code,
            }),
            zip: data.postal || "",
            isp: data.connection?.isp || "",
            org: data.connection?.org || "",
            lat: typeof data.latitude === "number" ? data.latitude : null,
            lon: typeof data.longitude === "number" ? data.longitude : null,
            asn: data.connection?.asn ? `AS${data.connection.asn}` : undefined,
            asName: data.connection?.org || undefined,
            source: "ipwho.is",
          };
        }
      }
    } catch {
      /* both providers unavailable */
    }
    return null;
  };

  /**
   * Vercel's edge geolocation is the better *place*, the lookup is the better
   * *network*, so when both are available they are merged rather than one
   * winning: the edge resolved the real connection IP server-side, and only
   * the lookup knows whether that IP is a datacentre.
   */
  const edge =
    vercelGeo?.city && vercelGeo?.countryCode
      ? ({
          timezone: vercelGeo.timezone || clientTz || "",
          timezoneOffset: clientTzOffset ?? 0,
          locale: clientLocale || "",
          country: countryNameFromCode(vercelGeo.countryCode),
          countryCode: vercelGeo.countryCode,
          region: vercelGeo.region || "",
          city: townFromLocation({
            city: decodeURIComponent(vercelGeo.city),
            zip: vercelGeo.postalCode,
            countryCode: vercelGeo.countryCode,
          }),
          zip: vercelGeo.postalCode || "",
          isp: "",
          org: "",
          lat: vercelGeo.latitude ? Number(vercelGeo.latitude) : null,
          lon: vercelGeo.longitude ? Number(vercelGeo.longitude) : null,
          source: "vercel-edge",
        } satisfies VisitorRecord["location"])
      : null;

  const looked = await enrich();

  /**
   * A device fix outranks every lookup, and it is the only thing that does.
   *
   * The reader's own browser knows where the reader is; an address only knows
   * how the network routes it. So when a granted position is present it
   * replaces the coordinates and the source, while the network facts — ISP,
   * AS, whether this is a datacentre — stay from the lookup, because those are
   * about the connection and remain true.
   *
   * The city is deliberately left as the lookup found it. Turning coordinates
   * into a town name needs a reverse-geocode, which is another request to
   * another service on every page view; the coordinates are exact and shown
   * as such, which is what was actually asked for.
   */
  const withPrecise = (base: VisitorRecord["location"]) =>
    precise
      ? ({
          ...base,
          lat: precise.lat,
          lon: precise.lon,
          accuracyM: precise.accuracyM,
          source: "device" as const,
        } satisfies VisitorRecord["location"])
      : base;

  if (edge && looked) {
    const merged: VisitorRecord["location"] = {
      ...edge,
      isp: looked.isp || "",
      org: looked.org || "",
      asn: looked.asn,
      asName: looked.asName,
      reverse: looked.reverse,
      mobile: looked.mobile,
      proxy: looked.proxy,
      hosting: looked.hosting,
    };
    geoCache.set(ip, merged);
    return withPrecise(merged);
  }

  if (looked) {
    geoCache.set(ip, looked);
    return withPrecise(looked);
  }
  if (edge) {
    geoCache.set(ip, edge);
    return withPrecise(edge);
  }

  return base;
}

/* ────────────────────────── Supabase Store ────────────────────────── */

type VisitorRow = {
  id: string;
  visitor_id: string;
  timestamp: string;
  type: "new" | "returning";
  session_number: number;
  ip: string;
  page: VisitorRecord["page"];
  browser: VisitorRecord["browser"];
  device: VisitorRecord["device"];
  network: VisitorRecord["network"];
  location: VisitorRecord["location"];
  performance: VisitorRecord["performance"];
};

function rowToRecord(row: VisitorRow): VisitorRecord {
  return {
    id: row.id,
    visitorId: row.visitor_id,
    timestamp: row.timestamp,
    type: row.type,
    sessionNumber: row.session_number,
    ip: row.ip,
    page: row.page,
    browser: row.browser,
    device: row.device,
    network: row.network,
    location: row.location,
    performance: row.performance,
  };
}

/** Returns the most recent MAX_RECORDS visitors, oldest first (matches prior file-store order). */
export async function readVisitors(): Promise<VisitorRecord[]> {
  if (!hasSupabaseAdmin()) return [];
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("visitors")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(MAX_RECORDS);

    if (error) {
      console.error("[tracker-store] readVisitors error:", error.message);
      return [];
    }

    return (data as VisitorRow[]).reverse().map(rowToRecord);
  } catch (err) {
    console.error("[tracker-store] readVisitors failed:", err);
    return [];
  }
}

export async function addVisitor(record: VisitorRecord): Promise<void> {
  if (!hasSupabaseAdmin()) return;
  const { error } = await getSupabaseAdmin().from("visitors").insert({
    id: record.id,
    visitor_id: record.visitorId,
    timestamp: record.timestamp,
    type: record.type,
    session_number: record.sessionNumber,
    ip: record.ip,
    page: record.page,
    browser: record.browser,
    device: record.device,
    network: record.network,
    location: record.location,
    performance: record.performance,
  });

  if (error) {
    console.error("[tracker-store] addVisitor failed:", error.message);
    return;
  }
}

/* ────────────────────────── Stats Helpers ────────────────────────── */

function todayStart(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function modeOf(arr: string[]): string {
  const freq: Record<string, number> = {};
  for (const v of arr) {
    if (v) freq[v] = (freq[v] || 0) + 1;
  }
  let max = 0;
  let result = "—";
  for (const [k, c] of Object.entries(freq)) {
    if (c > max) { max = c; result = k; }
  }
  return result;
}

export function computeStats(visitors: VisitorRecord[]): VisitorStats {
  const today = todayStart();
  const todayVisitors = visitors.filter((v) => v.timestamp >= today);
  const uniqueIds = new Set(visitors.map((v) => v.visitorId));

  return {
    totalAll: visitors.length,
    totalToday: todayVisitors.length,
    newToday: todayVisitors.filter((v) => v.type === "new").length,
    returningToday: todayVisitors.filter((v) => v.type === "returning").length,
    uniqueVisitors: uniqueIds.size,
    topBrowser: modeOf(visitors.map((v) => v.browser.name)),
    topOS: modeOf(visitors.map((v) => v.device.os)),
    topCountry: modeOf(visitors.map((v) => v.location.country)),
    topPage: modeOf(visitors.map((v) => v.page.path)),
  };
}

/* ────────────────────────── UUID ────────────────────────── */

export function uuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}
