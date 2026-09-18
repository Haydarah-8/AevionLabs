import { leanForOutlet, type Lean } from "@/lib/news/lean";
import type { NewsroomCluster, NewsroomItem } from "@/lib/news/newsroom";

/**
 * Framing analysis.
 *
 * Two outlets can report the same event and describe it completely
 * differently — "protesters" or "rioters", "government" or "regime", "said" or
 * "blasted". Where they diverge is the story about the story.
 *
 * This is a LEXICAL analysis, not a semantic one: it detects which of several
 * interchangeable-but-loaded words an outlet reached for. It cannot read tone,
 * irony, or context, and a word appearing inside a quotation is counted the
 * same as the outlet's own voice. Treat a divergence as a prompt to read both,
 * never as a verdict on either.
 */

export type FramingAxis = {
  id: string;
  /** What the competing words are describing. */
  label: string;
  /** The plainer, more descriptive choice. */
  neutral: string[];
  /** The more loaded choice, in either direction. */
  loaded: string[];
};

/**
 * Each axis is a set of words outlets use for the same referent. The split is
 * "plainer" versus "more loaded", not left versus right — both sides of the
 * spectrum reach for loaded language, just about different subjects.
 */
export const FRAMING_AXES: FramingAxis[] = [
  {
    id: "protest",
    label: "Public assembly",
    neutral: ["protest", "protests", "protester", "protesters", "demonstration", "demonstrators", "rally", "march"],
    loaded: ["riot", "riots", "rioters", "mob", "unrest", "chaos", "anarchy", "thugs"],
  },
  {
    id: "combatant",
    label: "Armed actors",
    neutral: ["fighter", "fighters", "combatant", "combatants", "armed group", "gunmen"],
    loaded: ["terrorist", "terrorists", "jihadist", "jihadists", "extremist", "extremists", "militant", "militants", "insurgent", "insurgents"],
  },
  {
    id: "government",
    label: "The state",
    neutral: ["government", "administration", "authorities", "officials", "leadership"],
    loaded: ["regime", "junta", "dictatorship", "strongman", "autocrat"],
  },
  {
    id: "migration",
    label: "People moving",
    neutral: ["migrant", "migrants", "refugee", "refugees", "asylum seeker", "asylum seekers", "arrivals"],
    loaded: ["illegal", "illegals", "alien", "aliens", "invasion", "flood", "swarm", "surge", "influx"],
  },
  {
    id: "speech",
    label: "How speech is reported",
    neutral: ["said", "stated", "told", "wrote", "announced", "argued"],
    loaded: ["slammed", "blasted", "savaged", "ripped", "lashed", "erupted", "raged", "torched", "shamed"],
  },
  {
    id: "enforcement",
    label: "State action",
    neutral: ["operation", "raid", "arrests", "policing", "enforcement", "response"],
    loaded: ["crackdown", "purge", "roundup", "sweep", "clampdown"],
  },
  {
    id: "casualty",
    label: "Deaths",
    neutral: ["killed", "died", "deaths", "casualties", "dead"],
    loaded: ["massacre", "slaughter", "butchered", "atrocity", "carnage", "bloodbath"],
  },
  {
    id: "certainty",
    label: "How firmly it is asserted",
    neutral: ["confirmed", "reported", "found", "showed"],
    loaded: ["claimed", "alleged", "so-called", "purported", "supposedly", "reportedly"],
  },
];

export type FramingHit = {
  axis: string;
  label: string;
  term: string;
  tone: "neutral" | "loaded";
};

const WORD_SPLIT = /[^a-z'-]+/;

/** Which framing words a piece of text reaches for. */
export function analyseFraming(text: string): FramingHit[] {
  const lower = ` ${text.toLowerCase()} `;
  const words = new Set(lower.split(WORD_SPLIT).filter(Boolean));
  const hits: FramingHit[] = [];

  for (const axis of FRAMING_AXES) {
    for (const tone of ["neutral", "loaded"] as const) {
      for (const term of axis[tone]) {
        const found = term.includes(" ")
          ? lower.includes(` ${term} `)
          : words.has(term);
        if (!found) continue;
        hits.push({ axis: axis.id, label: axis.label, term, tone });
      }
    }
  }
  return hits;
}

export type AxisSide = {
  lean: Lean;
  outlet: string;
  term: string;
  tone: "neutral" | "loaded";
  title: string;
  url: string;
};

export type FramingDivergence = {
  axis: string;
  label: string;
  /** Distinct words used for the same thing, with who used each. */
  sides: AxisSide[];
  /** Distinct terms in play — 2 or more is what makes it a divergence. */
  termCount: number;
  /** True when some outlets chose plain words and others loaded ones. */
  mixedTone: boolean;
};

/**
 * Where a cluster's outlets described the same thing with different words.
 *
 * Only axes where at least two distinct terms appear are returned — one shared
 * word is agreement, not divergence.
 */
export function clusterFraming(
  cluster: Pick<NewsroomCluster, "items">,
): FramingDivergence[] {
  const byAxis = new Map<string, AxisSide[]>();

  for (const item of cluster.items) {
    const rating = leanForOutlet(item);
    const hits = analyseFraming(`${item.title} ${item.snippet}`);
    for (const hit of hits) {
      const side: AxisSide = {
        lean: rating.lean,
        outlet: item.source,
        term: hit.term,
        tone: hit.tone,
        title: item.title,
        url: item.sourceUrl,
      };
      const list = byAxis.get(hit.axis);
      if (list) list.push(side);
      else byAxis.set(hit.axis, [side]);
    }
  }

  const out: FramingDivergence[] = [];
  for (const [axisId, sides] of byAxis) {
    const terms = new Set(sides.map((side) => side.term));
    if (terms.size < 2) continue;

    /**
     * Two outlets must have made *opposite* choices: one reached for a word
     * the other did not, and the other reached for a word the first did not.
     *
     * Weaker rules both fail on real headlines. Distinct terms alone counts
     * "Trump election fraud crackdown lands first arrest" — one outlet using
     * two words in one sentence — as a disagreement; on the live corpus that
     * accounted for every apparent divergence. Merely requiring two outlets
     * still counts the case where both said "crackdown" and only one added
     * "arrests", which is one outlet saying more, not two disagreeing.
     */
    const byOutlet = new Map<string, Set<string>>();
    for (const side of sides) {
      const found = byOutlet.get(side.outlet);
      if (found) found.add(side.term);
      else byOutlet.set(side.outlet, new Set([side.term]));
    }
    const voices = [...byOutlet.entries()];
    const substituted = voices.some(([, mine], i) =>
      voices.some(
        ([, theirs], j) =>
          i !== j &&
          [...mine].some((term) => !theirs.has(term)) &&
          [...theirs].some((term) => !mine.has(term)),
      ),
    );
    if (!substituted) continue;

    const tones = new Set(sides.map((side) => side.tone));
    out.push({
      axis: axisId,
      label: FRAMING_AXES.find((a) => a.id === axisId)?.label ?? axisId,
      sides,
      termCount: terms.size,
      mixedTone: tones.size > 1,
    });
  }

  // Mixed-tone divergences first: those are the ones worth reading twice.
  return out.sort(
    (a, b) =>
      Number(b.mixedTone) - Number(a.mixedTone) || b.termCount - a.termCount,
  );
}

/** A one-line count of loaded versus plain language, per article. */
export function framingTone(item: NewsroomItem): {
  loaded: number;
  neutral: number;
} {
  const hits = analyseFraming(`${item.title} ${item.snippet}`);
  return {
    loaded: hits.filter((hit) => hit.tone === "loaded").length,
    neutral: hits.filter((hit) => hit.tone === "neutral").length,
  };
}
