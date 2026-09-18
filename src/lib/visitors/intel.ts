import type { VisitorRecord } from "@/lib/tracker-store";
import type { VisitorProfile } from "@/lib/visitors/profile";

/**
 * Reading what an address and a browser actually tell you.
 *
 * The pin on a map is the least reliable thing here. An address resolves to
 * how a network routes it — a carrier gateway, a VPN exit, a datacentre rack —
 * so the city is a region at best and often the wrong one. What the address
 * *is* survives that: a mobile carrier, a hosting provider and a consumer line
 * are distinguishable with high confidence, and that answers the question the
 * map was being asked to answer, which is whether this is a person at all.
 */

export type ConnectionKind =
  | "mobile"
  | "datacentre"
  | "anonymised"
  | "broadband"
  | "unknown";

export const CONNECTION_LABEL: Record<ConnectionKind, string> = {
  mobile: "Mobile network",
  datacentre: "Datacentre",
  anonymised: "VPN or proxy",
  broadband: "Home or office line",
  unknown: "Unknown",
};

/**
 * What kind of connection the address belongs to.
 *
 * Order matters: an anonymiser running inside a datacentre is reported as an
 * anonymiser, because that is the more specific fact about it. Where the flags
 * were never collected the answer is "unknown" rather than "broadband" — an
 * old record is not evidence of a home connection.
 */
export function connectionKind(
  location: VisitorRecord["location"] | undefined,
): ConnectionKind {
  if (!location) return "unknown";
  if (location.proxy) return "anonymised";
  if (location.hosting) return "datacentre";
  if (location.mobile) return "mobile";
  if (
    location.proxy === false &&
    location.hosting === false &&
    location.mobile === false
  ) {
    return "broadband";
  }
  return "unknown";
}

/** Crawlers that announce themselves in the user-agent string. */
const KNOWN_BOTS: Array<{ pattern: RegExp; name: string }> = [
  { pattern: /googlebot/i, name: "Googlebot" },
  { pattern: /bingbot/i, name: "Bingbot" },
  { pattern: /yandex(bot)?/i, name: "YandexBot" },
  { pattern: /duckduckbot/i, name: "DuckDuckBot" },
  { pattern: /baiduspider/i, name: "Baidu Spider" },
  { pattern: /slurp/i, name: "Yahoo Slurp" },
  { pattern: /ahrefsbot/i, name: "AhrefsBot" },
  { pattern: /semrushbot/i, name: "SemrushBot" },
  { pattern: /mj12bot/i, name: "Majestic" },
  { pattern: /dotbot/i, name: "DotBot" },
  { pattern: /petalbot/i, name: "PetalBot" },
  { pattern: /applebot/i, name: "Applebot" },
  { pattern: /facebookexternalhit|meta-externalagent/i, name: "Meta crawler" },
  { pattern: /twitterbot/i, name: "Twitterbot" },
  { pattern: /linkedinbot/i, name: "LinkedInBot" },
  { pattern: /discordbot/i, name: "Discordbot" },
  { pattern: /telegrambot/i, name: "TelegramBot" },
  { pattern: /whatsapp/i, name: "WhatsApp" },
  { pattern: /headlesschrome/i, name: "Headless Chrome" },
  { pattern: /phantomjs|puppeteer|playwright|selenium/i, name: "Automation" },
  { pattern: /python-requests|curl\/|wget|go-http-client|axios/i, name: "Script" },
  { pattern: /\bbot\b|crawler|spider|scraper/i, name: "Unidentified bot" },
];

/** The crawler behind a user-agent string, when it names itself. */
export function botFromUserAgent(userAgent?: string): string | null {
  if (!userAgent) return null;
  for (const { pattern, name } of KNOWN_BOTS) {
    if (pattern.test(userAgent)) return name;
  }
  return null;
}

export type Assessment = {
  /** Plain verdict, in the order a person would reach it. */
  verdict: "person" | "likely-automated" | "automated" | "unknown";
  headline: string;
  /** Every observation behind the verdict, so it can be argued with. */
  reasons: string[];
  connection: ConnectionKind;
  bot: string | null;
};

/**
 * Whether this looks like a reader or a machine.
 *
 * Stated as a judgement with its reasons attached rather than as a score. The
 * inputs are individually weak — plenty of real people read over a VPN, and
 * plenty of bots present a normal user agent — so the panel shows what was
 * observed and lets the desk disagree, which a number between 0 and 100 does
 * not allow.
 */
export function assess(profile: VisitorProfile): Assessment {
  const location = profile.latest.location;
  const connection = connectionKind(location);
  const bot = botFromUserAgent(profile.latest.browser?.userAgent);
  const reasons: string[] = [];

  if (bot) reasons.push(`The user agent identifies itself as ${bot}.`);
  if (connection === "datacentre") {
    reasons.push(
      "The address belongs to a hosting provider, not a consumer network.",
    );
  }
  if (connection === "anonymised") {
    reasons.push("The address is a known VPN, proxy or Tor exit.");
  }
  if (connection === "mobile") {
    reasons.push("The address belongs to a mobile carrier.");
  }
  if (connection === "unknown") {
    // Said whatever else was observed: a verdict resting on behaviour alone
    // should declare that the network was never examined.
    reasons.push(
      "The address was recorded before network checks were collected, so nothing is known about the connection itself.",
    );
  }

  // One page, once, and gone is the shape of a crawler; it is also the shape
  // of a person who bounced, which is why it only ever supports a verdict the
  // network already suggests.
  const oneAndDone =
    profile.sessions.length === 1 && profile.views === 1;
  if (oneAndDone) reasons.push("A single page view, never returned.");
  if (profile.returns >= 2) {
    reasons.push(`Came back ${profile.returns} times.`);
  }
  if (profile.engagement.totalMinutes >= 2) {
    reasons.push(
      `Spent ${Math.round(profile.engagement.totalMinutes)} minutes reading.`,
    );
  }

  if (bot) {
    return {
      verdict: "automated",
      headline: `${bot}, not a reader`,
      reasons,
      connection,
      bot,
    };
  }

  if (connection === "datacentre") {
    return {
      verdict: oneAndDone ? "automated" : "likely-automated",
      headline: oneAndDone
        ? "Almost certainly automated"
        : "Datacentre address — probably automated",
      reasons,
      connection,
      bot,
    };
  }

  if (connection === "anonymised") {
    return {
      verdict: "likely-automated",
      headline: "Behind a VPN or proxy",
      reasons,
      connection,
      bot,
    };
  }

  if (connection === "mobile" || connection === "broadband") {
    return {
      verdict: "person",
      headline:
        profile.returns > 0
          ? "A returning reader"
          : "Looks like a real reader",
      reasons,
      connection,
      bot,
    };
  }

  return {
    verdict: "unknown",
    headline: "Not enough to say",
    reasons,
    connection,
    bot,
  };
}

/**
 * Whether a single page view came from a machine.
 *
 * Record-level, so the audit stream and the overview can filter their raw rows
 * without first folding them into profiles. Deliberately conservative: only a
 * self-identified crawler, a hosting address or a known anonymiser counts.
 * Behaviour alone — one page and gone — is not enough here, because a person
 * who bounced looks exactly the same and excluding them would quietly delete
 * real readers from the figures.
 */
export function isAutomated(record: {
  location?: VisitorRecord["location"];
  browser?: { userAgent?: string };
}): boolean {
  if (botFromUserAgent(record.browser?.userAgent)) return true;
  const kind = connectionKind(record.location);
  return kind === "datacentre" || kind === "anonymised";
}

/** The opposite, for the "people only" lenses. */
export function isPerson(record: {
  location?: VisitorRecord["location"];
  browser?: { userAgent?: string };
}): boolean {
  return !isAutomated(record);
}
