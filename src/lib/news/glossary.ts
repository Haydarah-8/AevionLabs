/**
 * What every number on the desk actually means.
 *
 * The admin is full of derived measures — spread, balance, exclusivity, loaded
 * share, reach — and a figure whose derivation the reader has to guess at is
 * worse than no figure, because it still gets acted on. Each entry here says
 * what the measure is, how it is computed, and where it stops being reliable.
 *
 * The `caveat` field is not optional padding. Every measure on this desk is a
 * description of one corpus over one window, and most of them are routinely
 * mistaken for a verdict on an outlet. If a term cannot be given an honest
 * caveat it probably should not be on screen.
 */

export type GlossaryEntry = {
  id: string;
  term: string;
  /** One line, for a tooltip or a subtitle. */
  short: string;
  /** How the number is actually produced. */
  method: string;
  /** Where it misleads, and what it cannot tell you. */
  caveat: string;
  /** Related entries, by id. */
  seeAlso?: string[];
  /** Where the logic lives, for anyone who wants to check it. */
  source?: string;
};

export const GLOSSARY: GlossaryEntry[] = [
  /* ---------------------------------------------------------------- */
  /* The unit of news                                                  */
  /* ---------------------------------------------------------------- */
  {
    id: "article",
    term: "Article",
    short: "One piece published by one outlet.",
    method:
      "One row per URL, after tracking parameters are stripped so the same piece linked two ways is not counted twice.",
    caveat:
      "An outlet that files three updates on one event contributes three articles. Article counts measure output, not events.",
    seeAlso: ["story", "outlet"],
    source: "src/lib/news/newsroom.ts",
  },
  {
    id: "story",
    term: "Story",
    short: "One event, with every outlet that covered it folded in.",
    method:
      "Articles are grouped by the id the ingest pipeline assigned, then those groups are merged when their headlines are similar enough within an 18-hour window.",
    caveat:
      "Grouping is done on headlines alone. Two outlets covering the same event in very different words may stay separate, and most stories in this corpus are still carried by a single outlet.",
    seeAlso: ["similarity", "article", "contested"],
    source: "src/lib/news/newsroom.ts",
  },
  {
    id: "similarity",
    term: "Headline similarity",
    short: "How the desk decides two headlines are the same story.",
    method:
      "Words are stemmed, numbers folded (“six” and “6” agree), then compared as vectors weighted by inverse document frequency, so a shared rare word counts for far more than a shared common one. Above 0.52 the two are treated as one story.",
    caveat:
      "The threshold was tuned by reading every scoring pair in a real 600-article corpus, not derived from theory. It will drift as the mix of sources changes, and it cannot read meaning — only vocabulary.",
    seeAlso: ["story"],
    source: "src/lib/news/similarity.ts",
  },
  {
    id: "outlet",
    term: "Outlet",
    short: "One publishing organisation.",
    method:
      "Keyed on the article's domain, then collapsed by masthead so one organisation publishing across several domains counts once.",
    caveat:
      "Social posts are keyed by publisher name rather than host, because the host is the platform. Wire copy republished by a subscriber is attributed to the republisher.",
    seeAlso: ["article", "state-controlled"],
    source: "src/lib/news/outlet.ts",
  },

  /* ---------------------------------------------------------------- */
  /* The scale                                                         */
  /* ---------------------------------------------------------------- */
  {
    id: "lean",
    term: "Lean",
    short: "Where an outlet sits on a seven-point left–right scale.",
    method:
      "Assigned per outlet from published media-bias ratings, keyed on domain with a publisher-name fallback for social posts.",
    caveat:
      "These ratings are contested and describe an outlet's typical editorial framing, not the accuracy of any single article. They are editable in src/lib/news/lean.ts — treat them as this desk's working assumption, not a fact.",
    seeAlso: ["spread", "balance", "unrated", "state-controlled"],
    source: "src/lib/news/lean.ts",
  },
  {
    id: "spectrum-bar",
    term: "Spectrum bar",
    short: "The split of coverage across the scale, as one hairline.",
    method:
      "Each segment's width is that position's share of the articles in view. Blue is left, red is right, grey is centre.",
    caveat:
      "Blue-left and red-right follow the media-bias convention rather than any country's party colours, which invert between the US and the UK.",
    seeAlso: ["lean", "spread"],
    source: "src/components/admin/Spectrum.tsx",
  },
  {
    id: "spread",
    term: "Spread",
    short: "How many of the seven positions carried it, out of 7.",
    method: "A count of distinct scale positions with at least one article.",
    caveat:
      "A count, not a balance. Seven out of seven with one article on the left and ninety on the right still reads 7/7.",
    seeAlso: ["balance", "contested", "lean"],
  },
  {
    id: "balance",
    term: "Balance",
    short: "The centre of gravity of coverage, from −3 to +3.",
    method:
      "Each article scores by its outlet's position (−3 far left to +3 far right); the balance is their mean. Unrated and state outlets are excluded.",
    caveat:
      "A mean hides its own shape: a topic covered only at the two extremes averages to zero, exactly like one covered only from the centre.",
    seeAlso: ["spread", "lean"],
  },
  {
    id: "unrated",
    term: "Unrated",
    short: "An outlet this desk has no position for.",
    method: "Any outlet with no entry in the lean table.",
    caveat:
      "Unrated means unassessed, not neutral. It is kept off the left–right scale rather than parked in the centre.",
    seeAlso: ["lean"],
  },
  {
    id: "state-controlled",
    term: "State-controlled",
    short: "An outlet under direct state editorial control.",
    method: "Flagged per outlet in the lean table.",
    caveat:
      "Counted off the left–right scale entirely: a state broadcaster's position follows its government, so placing it on a domestic political axis would say nothing.",
    seeAlso: ["lean", "unrated"],
  },

  /* ---------------------------------------------------------------- */
  /* Subjects                                                          */
  /* ---------------------------------------------------------------- */
  {
    id: "topic",
    term: "Topic",
    short: "A specific subject, found in the corpus rather than predefined.",
    method:
      "Terms recurring across headlines are ranked, and each story joins the highest-ranked term it mentions. A term qualifies only if it reads as a name or is a recognised subject word.",
    caveat:
      "Emergent, so topics shift day to day and are not comparable week to week. Subject areas exist for that.",
    seeAlso: ["domain", "reach", "contested"],
    source: "src/lib/news/topics.ts",
  },
  {
    id: "domain",
    term: "Subject area",
    short: "One of twelve fixed areas that topics roll up into.",
    method:
      "Each story votes for the area its own headline scores highest against a fixed vocabulary; the topic takes the majority. Confidence is the share of stories that agreed.",
    caveat:
      "A topic named after a person or country genuinely spans several areas, which is why those show low confidence — the number is reporting real ambiguity rather than a failure.",
    seeAlso: ["topic", "domain-confidence"],
    source: "src/lib/news/taxonomy.ts",
  },
  {
    id: "domain-confidence",
    term: "Area confidence",
    short: "How much of a topic's coverage agreed on its subject area.",
    method:
      "The winning area's share of the stories that voted. 0.8 means four headlines in five pointed the same way.",
    caveat:
      "Below about 0.4 the assignment is close to arbitrary, and the interface dims it for that reason.",
    seeAlso: ["domain"],
  },
  {
    id: "reach",
    term: "Reach",
    short: "How widely a topic is being carried: mainstream, emerging or niche.",
    method:
      "Banded on the share of currently active outlets that carried it, not on raw article counts.",
    caveat:
      "Measured against outlets that published anything at all, so a quiet news day does not silently promote everything to mainstream.",
    seeAlso: ["topic", "outlet"],
  },
  {
    id: "contested",
    term: "Contested",
    short: "A topic covered from three or more points on the scale.",
    method: "Topics whose spread is 3 or more.",
    caveat:
      "Contested means widely carried, not disputed. Outlets can agree completely and still be spread across the scale.",
    seeAlso: ["spread", "topic"],
  },

  /* ---------------------------------------------------------------- */
  /* Language and omission                                             */
  /* ---------------------------------------------------------------- */
  {
    id: "framing",
    term: "Framing",
    short: "Where outlets chose different words for the same thing.",
    method:
      "Headlines are matched against sets of interchangeable words split into plainer and more loaded — protesters/rioters, government/regime, said/slammed. A difference is reported only when two outlets made opposite choices.",
    caveat:
      "Lexical, not semantic. It cannot read tone, irony or context, and a loaded word inside a quotation counts the same as the outlet's own voice. A difference is a prompt to read both, never a verdict on either.",
    seeAlso: ["loaded-share", "story"],
    source: "src/lib/news/framing.ts",
  },
  {
    id: "loaded-share",
    term: "Loaded",
    short: "How often an outlet reached for the loaded word over the plain one.",
    method:
      "Of all the framing vocabulary an outlet used, the share that was the loaded choice.",
    caveat:
      "Word counting, not judgement. A week covering a war raises it honestly. A dash means the outlet used no framing vocabulary at all, which is not the same as scoring zero.",
    seeAlso: ["framing"],
    source: "src/lib/news/press.ts",
  },
  {
    id: "omission",
    term: "Not covering it",
    short: "Outlets that were publishing, but not about this.",
    method:
      "An outlet counts as silent only if it published at least two other things in the same window and nothing on this topic.",
    caveat:
      "An outlet that published nothing at all has a broken feed, not an editorial position, and is excluded for that reason.",
    seeAlso: ["one-sided", "outlet"],
    source: "src/lib/news/omission.ts",
  },
  {
    id: "one-sided",
    term: "One-sided",
    short: "One half of the scale carried it and the other ran nothing.",
    method:
      "True when left-leaning outlets covered a topic and right-leaning ones did not, or the reverse, and active outlets exist on the silent side.",
    caveat:
      "Describes this corpus over this window. A topic can be one-sided simply because the other side had not published yet.",
    seeAlso: ["omission", "balance"],
  },

  /* ---------------------------------------------------------------- */
  /* The press                                                         */
  /* ---------------------------------------------------------------- */
  {
    id: "exclusivity",
    term: "Alone",
    short: "The share of an outlet's stories nobody else ran.",
    method:
      "Stories where this outlet was the only one present, over all its stories. Counted once per story, so three updates to one scoop is one exclusive.",
    caveat:
      "High exclusivity is neither a virtue nor a fault — it is a scoop, a specialist beat, or a claim nobody else would print. It also reads high across the board while most stories are still carried by a single outlet.",
    seeAlso: ["story", "co-coverage"],
    source: "src/lib/news/press.ts",
  },
  {
    id: "cadence",
    term: "Cadence",
    short: "The median gap between an outlet's articles.",
    method: "Median rather than mean, so one overnight pause does not dominate.",
    caveat:
      "Reflects what reached this desk, not what the outlet published. A feed carrying only its top stories will look slower than the newsroom is.",
    seeAlso: ["outlet", "publishing-clock"],
  },
  {
    id: "co-coverage",
    term: "Who moves together",
    short: "Outlets that keep landing on the same stories.",
    method:
      "Every pair of outlets appearing in the same story is counted; the arc's thickness is how many stories they share.",
    caveat:
      "Node order is fixed so the same data always draws the same picture. Overlap is sparse here because most stories are still single-outlet.",
    seeAlso: ["story", "exclusivity"],
  },
  {
    id: "publishing-clock",
    term: "Publishing clock",
    short: "When in the day an outlet actually files.",
    method:
      "Articles counted by hour of publication in UTC, over the last week. The centre shows the peak hour.",
    caveat:
      "UTC, not local time — a global wire has no single midnight, and converting would make the same corpus peak differently for two people at one screen. Outlets peaking twelve hours apart are in different time zones, not disagreeing.",
    seeAlso: ["cadence"],
  },
  {
    id: "waffle",
    term: "Composition",
    short: "Each square is one per cent of the articles in view.",
    method:
      "Squares are allocated by largest remainder, so they always total exactly one hundred rather than drifting from rounding.",
    caveat:
      "Proportions of this corpus, which is shaped by which feeds the desk subscribes to. It is not a picture of the press at large.",
    seeAlso: ["lean", "article"],
  },

  /* ---------------------------------------------------------------- */
  /* Pipeline                                                          */
  /* ---------------------------------------------------------------- */
  {
    id: "undrafted",
    term: "Undrafted",
    short: "Articles nothing has been written from yet.",
    method: "Articles with no matching draft or published post.",
    caveat:
      "Matched on source URL and title, so a post written from an article without linking it will still count as undrafted.",
  },
  {
    id: "feed-health",
    term: "Feed health",
    short: "Whether a source is fetching, and what it produced.",
    method:
      "Healthy is a success inside the last day; stale is over a day; failing is three consecutive failures or three days silent.",
    caveat:
      "A feed can be perfectly healthy and contribute nothing, which is its own kind of problem — the article count is the other half of the answer.",
    seeAlso: ["outlet"],
  },
];

const BY_ID = new Map(GLOSSARY.map((entry) => [entry.id, entry]));

export function glossaryEntry(id: string): GlossaryEntry | undefined {
  return BY_ID.get(id);
}

/** Every id referenced by a `seeAlso`, for validation. */
export function glossaryReferences(): string[] {
  return GLOSSARY.flatMap((entry) => entry.seeAlso ?? []);
}
