import { describe, expect, it } from "vitest";
import {
  assess,
  botFromUserAgent,
  connectionKind,
} from "@/lib/visitors/intel";
import type { VisitorRecord } from "@/lib/tracker-store";
import type { VisitorProfile } from "@/lib/visitors/profile";

type Loc = VisitorRecord["location"];

const loc = (over: Partial<Loc> = {}): Loc =>
  ({
    timezone: "Europe/London",
    timezoneOffset: 0,
    locale: "en-GB",
    country: "United Kingdom",
    countryCode: "GB",
    region: "England",
    city: "London",
    zip: "",
    isp: "Example",
    org: "",
    lat: 51.5,
    lon: -0.1,
    ...over,
  }) as Loc;

function profile(over: {
  location?: Loc;
  userAgent?: string;
  sessions?: number;
  views?: number;
  returns?: number;
  minutes?: number;
}): VisitorProfile {
  return {
    visitorId: "v1",
    ips: ["1.2.3.4"],
    firstSeen: "2026-08-01T00:00:00.000Z",
    lastSeen: "2026-08-02T00:00:00.000Z",
    views: over.views ?? 1,
    sessions: Array.from({ length: over.sessions ?? 1 }, () => ({
      startedAt: "2026-08-01T00:00:00.000Z",
      endedAt: "2026-08-01T00:00:00.000Z",
      durationMinutes: 0,
      views: [],
    })),
    returns: over.returns ?? 0,
    pages: [],
    referrers: [],
    medianLoadMs: null,
    devices: [],
    engagement: {
      totalMinutes: over.minutes ?? 0,
      averageVisitMinutes: 0,
      longestVisitMinutes: 0,
      pagesPerVisit: 1,
      singlePageVisits: 1,
    },
    cadence: {
      averageGapHours: null,
      longestGapHours: null,
      knownForHours: 0,
      byHour: new Array(24).fill(0),
    },
    entryPages: [],
    exitPages: [],
    latest: {
      location: over.location ?? loc(),
      browser: { userAgent: over.userAgent ?? "Mozilla/5.0 Chrome/120" },
    } as VisitorRecord,
  } as VisitorProfile;
}

describe("what the address says about the connection", () => {
  it("names a datacentre", () => {
    expect(connectionKind(loc({ hosting: true }))).toBe("datacentre");
  });

  it("prefers the more specific fact when a proxy runs in a datacentre", () => {
    expect(connectionKind(loc({ hosting: true, proxy: true }))).toBe(
      "anonymised",
    );
  });

  it("names a mobile carrier", () => {
    expect(
      connectionKind(loc({ mobile: true, hosting: false, proxy: false })),
    ).toBe("mobile");
  });

  it("calls it a home line only when all three were checked and false", () => {
    expect(
      connectionKind(loc({ mobile: false, hosting: false, proxy: false })),
    ).toBe("broadband");
  });

  /**
   * An old record carries none of these flags. Absent is not false: saying
   * "home connection" about a row we never checked would invent a fact.
   */
  it("says unknown when the flags were never collected", () => {
    expect(connectionKind(loc())).toBe("unknown");
    expect(connectionKind(undefined)).toBe("unknown");
  });
});

describe("crawlers that name themselves", () => {
  it("finds the common search engines", () => {
    expect(botFromUserAgent("Mozilla/5.0 (compatible; Googlebot/2.1)")).toBe(
      "Googlebot",
    );
    expect(botFromUserAgent("Mozilla/5.0 (compatible; bingbot/2.0)")).toBe(
      "Bingbot",
    );
  });

  it("finds headless browsers and scripts", () => {
    expect(botFromUserAgent("HeadlessChrome/120")).toBe("Headless Chrome");
    expect(botFromUserAgent("python-requests/2.31")).toBe("Script");
    expect(botFromUserAgent("curl/8.4.0")).toBe("Script");
  });

  it("falls back to a generic match", () => {
    expect(botFromUserAgent("SomeRandomCrawler/1.0")).toBe("Unidentified bot");
  });

  it("leaves an ordinary browser alone", () => {
    expect(
      botFromUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15",
      ),
    ).toBeNull();
  });

  it("has nothing to say about a missing user agent", () => {
    expect(botFromUserAgent(undefined)).toBeNull();
  });
});

describe("whether this is a reader or a machine", () => {
  it("calls a self-identified crawler automated", () => {
    const result = assess(profile({ userAgent: "Googlebot/2.1" }));
    expect(result.verdict).toBe("automated");
    expect(result.headline).toContain("Googlebot");
  });

  it("calls a one-page datacentre hit automated", () => {
    const result = assess(profile({ location: loc({ hosting: true }) }));
    expect(result.verdict).toBe("automated");
    expect(result.reasons.join(" ")).toContain("hosting provider");
  });

  it("softens to likely when a datacentre address keeps coming back", () => {
    const result = assess(
      profile({
        location: loc({ hosting: true }),
        sessions: 4,
        views: 12,
        returns: 3,
        minutes: 20,
      }),
    );
    expect(result.verdict).toBe("likely-automated");
  });

  it("treats a mobile reader as a person", () => {
    const result = assess(
      profile({
        location: loc({ mobile: true, hosting: false, proxy: false }),
        sessions: 3,
        views: 9,
        returns: 2,
        minutes: 15,
      }),
    );
    expect(result.verdict).toBe("person");
    expect(result.headline).toBe("A returning reader");
  });

  it("declines to guess when nothing was collected", () => {
    const result = assess(profile({}));
    expect(result.verdict).toBe("unknown");
    expect(result.reasons.join(" ")).toContain("before network checks");
  });

  it("always shows its reasoning", () => {
    const result = assess(profile({ location: loc({ proxy: true }) }));
    expect(result.reasons.length).toBeGreaterThan(0);
  });
});

describe("filtering machines out of the figures", () => {
  const rec = (over: { location?: Loc; userAgent?: string }) => ({
    location: over.location ?? loc(),
    browser: { userAgent: over.userAgent ?? "Mozilla/5.0 Chrome/120" },
  });

  it("counts a datacentre address as automated", async () => {
    const { isAutomated } = await import("@/lib/visitors/intel");
    expect(isAutomated(rec({ location: loc({ hosting: true }) }))).toBe(true);
  });

  it("counts an anonymiser as automated", async () => {
    const { isAutomated } = await import("@/lib/visitors/intel");
    expect(isAutomated(rec({ location: loc({ proxy: true }) }))).toBe(true);
  });

  it("counts a self-identified crawler as automated", async () => {
    const { isAutomated } = await import("@/lib/visitors/intel");
    expect(isAutomated(rec({ userAgent: "Googlebot/2.1" }))).toBe(true);
  });

  it("leaves a mobile reader alone", async () => {
    const { isAutomated } = await import("@/lib/visitors/intel");
    expect(
      isAutomated(
        rec({ location: loc({ mobile: true, hosting: false, proxy: false }) }),
      ),
    ).toBe(false);
  });

  /**
   * A person who read one page and left looks identical to a crawler by
   * behaviour. Excluding them would quietly delete real readers, so behaviour
   * is never grounds on its own.
   */
  it("does not exclude someone merely for bouncing", async () => {
    const { isAutomated } = await import("@/lib/visitors/intel");
    expect(
      isAutomated(
        rec({ location: loc({ mobile: false, hosting: false, proxy: false }) }),
      ),
    ).toBe(false);
  });

  it("keeps an unchecked record rather than assuming the worst", async () => {
    const { isAutomated } = await import("@/lib/visitors/intel");
    expect(isAutomated(rec({ location: loc() }))).toBe(false);
  });
});
