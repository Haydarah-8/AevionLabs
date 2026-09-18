import { normalizeOutletName, outletKey } from "@/lib/news/outlet";

/**
 * Editorial lean ratings for outlets.
 *
 * IMPORTANT: these are *assigned ratings*, not facts. They follow the broad
 * consensus of published media-bias rating services (AllSides, Media Bias /
 * Fact Check) as of 2026, which themselves disagree at the margins and are
 * contested by the outlets they rate. They describe an outlet's typical
 * editorial framing, NOT the accuracy of any individual article.
 *
 * Treat a spread across this scale as "who is covering this and from where",
 * never as a truth score. Edit this table freely — it is deliberately one
 * plain file so the desk can own its own judgments.
 */
export type Lean =
  | "far-left"
  | "left"
  | "centre-left"
  | "centre"
  | "centre-right"
  | "right"
  | "far-right"
  | "unrated";

/** Ordered left→right for charting. "unrated" is deliberately excluded. */
export const LEAN_SCALE: Lean[] = [
  "far-left",
  "left",
  "centre-left",
  "centre",
  "centre-right",
  "right",
  "far-right",
];

export const LEAN_LABELS: Record<Lean, string> = {
  "far-left": "Far left",
  left: "Left",
  "centre-left": "Centre left",
  centre: "Centre",
  "centre-right": "Centre right",
  right: "Right",
  "far-right": "Far right",
  unrated: "Unrated",
};

/** Short label for narrow columns. */
export const LEAN_SHORT: Record<Lean, string> = {
  "far-left": "FL",
  left: "L",
  "centre-left": "CL",
  centre: "C",
  "centre-right": "CR",
  right: "R",
  "far-right": "FR",
  unrated: "—",
};

/**
 * State-influenced outlets sit on a separate axis: a state broadcaster is not
 * meaningfully "left" or "right", and collapsing it onto that scale would
 * misrepresent it. Flagged separately so the desk can see it plainly.
 */
export const STATE_CONTROLLED = new Set([
  "tass.com",
  "english.news.cn", // Xinhua
  "news.cn",
  "rt.com",
  "presstv.ir",
  "aa.com.tr", // Anadolu Agency
]);

/**
 * Keyed by hostname suffix, matched longest-first. Domains are unambiguous;
 * deriving a "masthead" is not — abcnews.go.com reduces to "go" and
 * news.sky.com to "sky", which no single rule gets right for both.
 */
const RATINGS: Record<string, Lean> = {
  // Wires and public broadcasters generally rated centre
  "reuters.com": "centre",
  "apnews.com": "centre",
  "bbc.co.uk": "centre",
  "japantimes.co.jp": "centre",
  "al-monitor.com": "centre",
  "foreignpolicy.com": "centre",
  "timesofindia.indiatimes.com": "centre",
  "bbc.com": "centre",
  "pbs.org": "centre",
  "csmonitor.com": "centre",
  "axios.com": "centre",
  "thehill.com": "centre",
  "newsweek.com": "centre",
  "euronews.com": "centre",
  "france24.com": "centre",
  "dw.com": "centre",
  "channelnewsasia.com": "centre",
  "news.un.org": "centre",
  "eia.gov": "centre",
  "scmp.com": "centre",
  "lowyinstitute.org": "centre",
  "ecfr.eu": "centre",
  "atlanticcouncil.org": "centre",
  "csis.org": "centre",
  "warontherocks.com": "centre",
  "thediplomat.com": "centre",
  "defensenews.com": "centre",
  "defenseone.com": "centre",
  "breakingdefense.com": "centre",
  "oilprice.com": "centre",
  "strategical.org.uk": "centre",

  // Centre-left
  "nbcnews.com": "centre-left",
  "cbsnews.com": "centre-left",
  "cnn.com": "centre-left",
  "npr.org": "centre-left",
  "abcnews.go.com": "centre-left",
  "abcnews.com": "centre-left",
  "aljazeera.com": "centre-left",
  "politico.eu": "centre-left",
  "theguardian.com": "centre-left",
  "abc.net.au": "centre-left",
  "politico.com": "centre-left",
  "themoscowtimes.com": "centre-left",
  "cnbc.com": "centre-left",
  "news.sky.com": "centre-left",
  "skynews.com": "centre-left",

  // Left
  "vox.com": "left",
  "huffpost.com": "left",
  "motherjones.com": "left",
  "salon.com": "left",
  "thenation.com": "left",

  // Far left
  "jacobin.com": "far-left",
  "commondreams.org": "far-left",
  "democracynow.org": "far-left",
  "theintercept.com": "far-left",

  // Centre-right
  "washingtonexaminer.com": "centre-right",
  "nationalreview.com": "centre-right",
  "washingtontimes.com": "centre-right",
  "jpost.com": "centre-right",

  // Right
  "foxnews.com": "right",
  "nypost.com": "right",
  "dailymail.co.uk": "right",
  "gbnews.com": "right",

  // Far right
  "breitbart.com": "far-right",
  "dailywire.com": "far-right",
  "newsmax.com": "far-right",
};

/**
 * Fallback keyed by masthead name, for articles whose URL does not identify
 * the publisher — chiefly YouTube and X posts, where the host is the platform.
 * Keys are normalizeOutletName output ("Sky News" → "sky").
 */
const NAME_RATINGS: Record<string, Lean> = {
  reuters: "centre",
  associatedpress: "centre",
  bbc: "centre",
  pbs: "centre",
  axios: "centre",
  euronews: "centre",
  france: "centre",
  deutschewelle: "centre",
  cna: "centre",
  cnn: "centre-left",
  sky: "centre-left",
  npr: "centre-left",
  abc: "centre-left",
  aljazeera: "centre-left",
  nbc: "centre-left",
  cbs: "centre-left",
  guardian: "centre-left",
  theguardian: "centre-left",
  vox: "left",
  huffpost: "left",
  motherjones: "left",
  salon: "left",
  thenation: "left",
  jacobin: "far-left",
  commondreams: "far-left",
  democracy: "far-left",
  theintercept: "far-left",
  nationalreview: "centre-right",
  washingtonexaminer: "centre-right",
  washingtontimes: "centre-right",
  jerusalempost: "centre-right",
  fox: "right",
  newyorkpost: "right",
  dailymail: "right",
  gb: "right",
  breitbart: "far-right",
  dailywire: "far-right",
  newsmax: "far-right",
};

/** Publisher names that are state outlets regardless of where they posted. */
const STATE_NAMES = new Set(["tass", "xinhua", "rt", "presstv", "anadoluagency"]);

export type OutletRating = {
  outlet: string;
  lean: Lean;
  stateControlled: boolean;
};

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

/** Longest matching domain wins, so news.sky.com beats a bare sky.com. */
function matchDomain(host: string, table: Iterable<string>): string | null {
  let best: string | null = null;
  for (const domain of table) {
    if (host === domain || host.endsWith(`.${domain}`)) {
      if (!best || domain.length > best.length) best = domain;
    }
  }
  return best;
}

export function leanForOutlet(item: {
  source: string;
  sourceUrl: string;
  platform?: "youtube" | "tiktok" | "instagram" | "x";
}): OutletRating {
  const host = hostnameOf(item.sourceUrl);
  const rated = host ? matchDomain(host, Object.keys(RATINGS)) : null;
  const state = host ? matchDomain(host, STATE_CONTROLLED) : null;

  // A YouTube or X post is published by an outlet, not by the platform, so
  // fall back to the masthead name when the host identifies neither.
  const masthead = normalizeOutletName(item.source);
  const byName = NAME_RATINGS[masthead];

  return {
    // outletKey still supplies the grouping identity used for outlet counts.
    outlet: outletKey(item),
    lean: rated ? RATINGS[rated] : (byName ?? "unrated"),
    stateControlled: Boolean(state) || STATE_NAMES.has(masthead),
  };
}

/** How many distinct points on the scale are represented. */
export function spreadWidth(counts: Partial<Record<Lean, number>>): number {
  return LEAN_SCALE.filter((lean) => (counts[lean] ?? 0) > 0).length;
}

/**
 * Centre of gravity on a -3..+3 axis, or null when nothing is rated. Negative
 * is left-leaning coverage, positive right-leaning.
 */
export function leanBalance(
  counts: Partial<Record<Lean, number>>,
): number | null {
  let total = 0;
  let sum = 0;
  LEAN_SCALE.forEach((lean, index) => {
    const n = counts[lean] ?? 0;
    if (!n) return;
    total += n;
    sum += n * (index - 3);
  });
  if (!total) return null;
  return Number((sum / total).toFixed(2));
}
