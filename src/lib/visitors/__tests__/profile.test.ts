import { describe, expect, it } from "vitest";
import {
  buildAllProfiles,
  buildSessions,
  buildVisitorProfile,
  recordsForVisitor,
} from "@/lib/visitors/profile";
import type { VisitorRecord } from "@/lib/tracker-store";

const NOW = Date.parse("2026-08-29T12:00:00.000Z");
const minutesAgo = (n: number) => new Date(NOW - n * 60_000).toISOString();

/**
 * A record with only the fields a test cares about.
 *
 * Nested objects are partial too: a test about paths should not have to invent
 * a url, a hash and a query string to say which page was viewed.
 */
type RecordOverrides = Omit<Partial<VisitorRecord>, "page" | "location"> & {
  timestamp: string;
  page?: Partial<VisitorRecord["page"]>;
  location?: Partial<VisitorRecord["location"]>;
};

function record(over: RecordOverrides): VisitorRecord {
  return {
    id: `${over.timestamp}-${over.visitorId ?? "v1"}-${Math.random()}`,
    visitorId: over.visitorId ?? "v1",
    timestamp: over.timestamp,
    type: over.type ?? "new",
    sessionNumber: over.sessionNumber ?? 1,
    ip: over.ip ?? "1.2.3.4",
    page: {
      url: "https://elijahwgroup.com/",
      path: over.page?.path ?? "/",
      title: over.page?.title ?? "Home",
      referrer: over.page?.referrer ?? "",
      hash: "",
      queryString: "",
    },
    browser: {
      name: "Chrome",
      version: "120",
      engine: "Blink",
      userAgent: "UA",
      language: "en",
      languages: ["en"],
      cookiesEnabled: true,
      doNotTrack: false,
      online: true,
      pdfViewerEnabled: true,
    },
    device: {
      type: over.device?.type ?? "desktop",
      os: "Windows",
      osVersion: "11",
      platform: "Win32",
      vendor: "",
      screenWidth: 1920,
      screenHeight: 1080,
      viewportWidth: 1900,
      viewportHeight: 900,
      pixelRatio: 1,
      colorDepth: 24,
      touchPoints: 0,
      hardwareConcurrency: 8,
      deviceMemory: 8,
      orientation: "landscape",
    },
    network: { effectiveType: "4g", downlink: 10, rtt: 50, saveData: false },
    location: {
      timezone: "Europe/London",
      timezoneOffset: 0,
      locale: "en-GB",
      country: "United Kingdom",
      countryCode: "GB",
      region: "England",
      city: "London",
      zip: "",
      isp: "BT",
      org: "",
      lat: 51.5,
      lon: -0.1,
      // Overrides last, so a test can vary one field of the location.
      ...over.location,
    },
    performance: {
      pageLoadTime: over.performance?.pageLoadTime ?? 400,
      domContentLoaded: null,
      firstPaint: null,
      dnsLookup: null,
      tcpConnection: null,
      serverResponse: null,
      domInteractive: null,
    },
  } as VisitorRecord;
}

describe("buildSessions", () => {
  it("groups views inside the gap into one visit", () => {
    const sessions = buildSessions([
      record({ timestamp: minutesAgo(50) }),
      record({ timestamp: minutesAgo(45) }),
      record({ timestamp: minutesAgo(40) }),
    ]);
    expect(sessions).toHaveLength(1);
    expect(sessions[0].views).toHaveLength(3);
    expect(sessions[0].durationMinutes).toBe(10);
  });

  it("starts a new visit after a gap longer than thirty minutes", () => {
    const sessions = buildSessions([
      record({ timestamp: minutesAgo(200) }),
      record({ timestamp: minutesAgo(10) }),
    ]);
    expect(sessions).toHaveLength(2);
  });

  it("treats exactly thirty minutes as the same visit", () => {
    // The boundary is inclusive; a test at the edge stops the rule drifting.
    const sessions = buildSessions([
      record({ timestamp: minutesAgo(60) }),
      record({ timestamp: minutesAgo(30) }),
    ]);
    expect(sessions).toHaveLength(1);
  });

  it("returns the newest visit first", () => {
    const sessions = buildSessions([
      record({ timestamp: minutesAgo(500), page: { path: "/old" } as never }),
      record({ timestamp: minutesAgo(5), page: { path: "/new" } as never }),
    ]);
    expect(sessions[0].views[0].path).toBe("/new");
  });

  it("ignores an unparseable timestamp rather than throwing", () => {
    const sessions = buildSessions([
      record({ timestamp: "not-a-date" }),
      record({ timestamp: minutesAgo(5) }),
    ]);
    expect(sessions).toHaveLength(1);
  });

  it("returns nothing for no records", () => {
    expect(buildSessions([])).toEqual([]);
  });
});

describe("buildVisitorProfile", () => {
  it("counts views, visits and returns", () => {
    const profile = buildVisitorProfile([
      record({ timestamp: minutesAgo(500) }),
      record({ timestamp: minutesAgo(200) }),
      record({ timestamp: minutesAgo(195) }),
      record({ timestamp: minutesAgo(5) }),
    ]);
    expect(profile?.views).toBe(4);
    expect(profile?.sessions).toHaveLength(3);
    // Three visits is two returns — the first time is not a return.
    expect(profile?.returns).toBe(2);
  });

  it("ranks pages by how often they were opened", () => {
    const profile = buildVisitorProfile([
      record({ timestamp: minutesAgo(9), page: { path: "/news" } as never }),
      record({ timestamp: minutesAgo(8), page: { path: "/news" } as never }),
      record({ timestamp: minutesAgo(7), page: { path: "/about" } as never }),
    ]);
    expect(profile?.pages[0]).toMatchObject({ path: "/news", views: 2 });
  });

  it("ignores internal navigation when listing referrers", () => {
    const profile = buildVisitorProfile([
      record({
        timestamp: minutesAgo(9),
        page: { referrer: "https://www.elijahwgroup.com/news" } as never,
      }),
      record({
        timestamp: minutesAgo(8),
        page: { referrer: "https://www.google.com/" } as never,
      }),
    ]);
    expect(profile?.referrers).toEqual([
      { referrer: "https://www.google.com/", count: 1 },
    ]);
  });

  it("collects every address the visitor used", () => {
    const profile = buildVisitorProfile([
      record({ timestamp: minutesAgo(9), ip: "1.1.1.1" }),
      record({ timestamp: minutesAgo(8), ip: "2.2.2.2" }),
      record({ timestamp: minutesAgo(7), ip: "1.1.1.1" }),
    ]);
    expect(profile?.ips.sort()).toEqual(["1.1.1.1", "2.2.2.2"]);
  });

  it("takes the median page load, not the mean", () => {
    // One 9-second outlier must not drag the figure with it.
    const profile = buildVisitorProfile([
      record({ timestamp: minutesAgo(9), performance: { pageLoadTime: 300 } as never }),
      record({ timestamp: minutesAgo(8), performance: { pageLoadTime: 400 } as never }),
      record({ timestamp: minutesAgo(7), performance: { pageLoadTime: 9000 } as never }),
    ]);
    expect(profile?.medianLoadMs).toBe(400);
  });

  it("returns null for no records", () => {
    expect(buildVisitorProfile([])).toBeNull();
  });
});

describe("recordsForVisitor", () => {
  const all = [
    record({ timestamp: minutesAgo(9), visitorId: "a", ip: "1.1.1.1" }),
    record({ timestamp: minutesAgo(8), visitorId: "b", ip: "1.1.1.1" }),
    record({ timestamp: minutesAgo(7), visitorId: "a", ip: "2.2.2.2" }),
  ];

  it("follows the visitor id across changing addresses", () => {
    const target = all[0];
    expect(recordsForVisitor(all, target)).toHaveLength(2);
  });

  it("does not merge two people behind one address", () => {
    // A shared router, a corporate NAT or a mobile carrier all put strangers
    // on one IP. Grouping by it would present them as a single person.
    const a = recordsForVisitor(all, all[0]).map((r) => r.visitorId);
    expect(new Set(a)).toEqual(new Set(["a"]));
  });

  it("falls back to the address only when there is no visitor id", () => {
    const legacy = [
      record({ timestamp: minutesAgo(9), visitorId: "", ip: "9.9.9.9" }),
      record({ timestamp: minutesAgo(8), visitorId: "", ip: "9.9.9.9" }),
      record({ timestamp: minutesAgo(7), visitorId: "", ip: "8.8.8.8" }),
    ];
    expect(recordsForVisitor(legacy, legacy[0])).toHaveLength(2);
  });
});

describe("buildAllProfiles", () => {
  it("returns one profile per visitor, most recent first", () => {
    const profiles = buildAllProfiles([
      record({ timestamp: minutesAgo(90), visitorId: "old" }),
      record({ timestamp: minutesAgo(2), visitorId: "new" }),
      record({ timestamp: minutesAgo(1), visitorId: "new" }),
    ]);
    expect(profiles).toHaveLength(2);
    expect(profiles[0].visitorId).toBe("new");
    expect(profiles[0].views).toBe(2);
  });

  it("returns nothing for an empty log", () => {
    expect(buildAllProfiles([])).toEqual([]);
  });
});

describe("engagement and cadence", () => {
  it("sums time on site across visits and averages it", () => {
    const profile = buildVisitorProfile([
      // Visit one: 10 minutes across two views.
      record({ timestamp: minutesAgo(600) }),
      record({ timestamp: minutesAgo(590), page: { path: "/live" } }),
      // Visit two, a day later: 4 minutes.
      record({ timestamp: minutesAgo(100) }),
      record({ timestamp: minutesAgo(96), page: { path: "/news" } }),
    ])!;
    expect(profile.sessions).toHaveLength(2);
    expect(profile.engagement.totalMinutes).toBe(14);
    expect(profile.engagement.averageVisitMinutes).toBe(7);
    expect(profile.engagement.longestVisitMinutes).toBe(10);
    expect(profile.engagement.pagesPerVisit).toBe(2);
  });

  it("counts visits that were one page and out", () => {
    const profile = buildVisitorProfile([
      record({ timestamp: minutesAgo(600) }),
      record({ timestamp: minutesAgo(300) }),
      record({ timestamp: minutesAgo(100) }),
      record({ timestamp: minutesAgo(95), page: { path: "/live" } }),
    ])!;
    expect(profile.sessions).toHaveLength(3);
    expect(profile.engagement.singlePageVisits).toBe(2);
  });

  it("measures the gap between visits from start to start", () => {
    const profile = buildVisitorProfile([
      record({ timestamp: minutesAgo(300) }),
      record({ timestamp: minutesAgo(180) }),
      record({ timestamp: minutesAgo(60) }),
    ])!;
    // Two hours between each start.
    expect(profile.cadence.averageGapHours).toBe(2);
    expect(profile.cadence.longestGapHours).toBe(2);
  });

  it("has no gap to report for a single visit", () => {
    const profile = buildVisitorProfile([record({ timestamp: minutesAgo(5) })])!;
    expect(profile.cadence.averageGapHours).toBeNull();
    expect(profile.cadence.longestGapHours).toBeNull();
  });

  it("bins views by the visitor's own clock, not ours", () => {
    // 12:00 UTC. A reader five hours behind sees 07:00.
    const profile = buildVisitorProfile([
      record({
        timestamp: "2026-08-29T12:00:00.000Z",
        location: { timezoneOffset: 300 },
      }),
    ])!;
    expect(profile.cadence.byHour[7]).toBe(1);
    expect(profile.cadence.byHour).toHaveLength(24);
    expect(profile.cadence.byHour.reduce((a, b) => a + b, 0)).toBe(1);
  });

  it("reports where visits start and where they end", () => {
    const profile = buildVisitorProfile([
      record({ timestamp: minutesAgo(600), page: { path: "/" } }),
      record({ timestamp: minutesAgo(595), page: { path: "/live" } }),
      record({ timestamp: minutesAgo(100), page: { path: "/" } }),
      record({ timestamp: minutesAgo(95), page: { path: "/news" } }),
    ])!;
    expect(profile.entryPages[0]).toEqual({ path: "/", count: 2 });
    expect(profile.exitPages.map((e) => e.path).sort()).toEqual([
      "/live",
      "/news",
    ]);
  });
});
