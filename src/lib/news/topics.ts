import {
  leanBalance,
  leanForOutlet,
  spreadWidth,
  type Lean,
} from "@/lib/news/lean";
import type { NewsroomCluster, NewsroomItem } from "@/lib/news/newsroom";
import { DOMAIN_TERMS } from "@/lib/news/domain-terms";

/**
 * Two levels of grouping sit under this desk:
 *
 *   articles  →  stories   (the same event, already done by the ingest
 *                            pipeline and clusterNewsroomItems)
 *   stories   →  topics    (the same subject, done here)
 *
 * A topic is the subject a set of stories is about — "Ukraine", "tariffs",
 * "Gaza" — derived from the terms that recur across headlines rather than from
 * a fixed taxonomy, so new subjects appear on their own.
 */

const STOPWORDS = new Set([
  "the","a","an","and","or","of","in","on","to","for","with","from","by","at",
  "as","is","are","was","were","be","been","has","have","had","it","its","he",
  "she","they","them","his","her","their","that","this","these","those","after",
  "before","over","under","into","out","up","down","new","says","say","said",
  "will","would","could","should","may","might","can","not","no","but","than",
  "then","there","here","who","what","when","where","why","how","all","more",
  "most","other","some","such","only","own","same","so","too","very","just",
  "about","against","between","during","without","within","amid","how","first",
  "two","three","one","last","next","year","years","day","days","week","time",
  "people","world","news","report","reports","live","updates","video","watch",
  "get","got","put","set","let","see","saw","now","off","per","via","own","use",
  "top","big","old","way","far","yet","due","amid","says","told","adds","calls",
]);

/**
 * Role and event words that are common in headlines but useless as a subject.
 * They are only kept when they actually appear as part of a proper noun —
 * "Minister" alone is filler, "Prime Minister Starmer" is not.
 */
const GENERIC_ROLES = new Set([
  "minister","ministers","president","presidents","government","governments",
  "official","officials","leader","leaders","chief","chiefs","spokesman",
  "killed","dead","death","deaths","dies","died","injured","wounded","hurt",
  "police","court","judge","trial","case","cases","probe","inquiry",
  "party","parties","state","states","nation","nations","country","countries",
  "city","town","north","south","east","west","central","region","regional",
  "shorts","clip","clips","photos","photo","gallery","podcast","opinion",
  "analysis","explainer","briefing","roundup","recap","column",
  "man","woman","men","women","child","children","family","families",
  "plan","plans","deal","deals","talks","meeting","summit","visit",
]);

/**
 * Never a subject on their own, however they are capitalised. Honorifics and
 * weekdays are capitalised inside real names ("President Trump", "Thursday's
 * vote"), so the proper-noun gate alone would let them through.
 */
const NEVER_TOPIC = new Set([
  "president","prime","minister","ministers","secretary","chancellor","mayor",
  "governor","senator","congressman","premier","king","queen","prince","pope",
  "monday","tuesday","wednesday","thursday","friday","saturday","sunday",
  "january","february","march","april","june","july","august","september",
  "october","november","december","today","tonight","yesterday","tomorrow",
  "north","south","east","west","northern","southern","eastern","western",
  "former","latest","exclusive","update","breaking","live",
  // Question words and words that leak in from outlet names in the body text.
  "which","whose","whom","post","times","daily","weekly","journal","tribune",
  "matters","things","thing","reason","reasons","point","points","list",
  // Reporting verbs and feed boilerplate that survive the proper-noun gate.
  "appeared","according","made","make","makes","take","takes","taken","come",
  "comes","coming","going","back","need","needs","want","wants","help","held",
  "found","find","finds","show","shows","shown","given","gives","known",
  // Connectives and adverbs that read like subjects once capitalised.
  "while","through","still","since","until","though","although","because",
  "however","despite","already","again","around","along","across","behind",
  "ahead","among","toward","towards","near","also","every","both","many",
  /**
   * Fragments of longer proper nouns. "United States" and "White House" are
   * subjects; "States" and "House" are the halves left behind once the first
   * word is dropped as a leading capital, and they read as nonsense topics.
   */
  "states","house","force","forces","executive","federal","administration",
  "washington","brussels","westminster","capitol","pentagon",
  "united","white","social","supreme","national","international",
  /**
   * Demonyms, which duplicate the country topic they belong to. "Russian" and
   * "Russia" are the same subject, and keeping both splits its coverage in two
   * so neither reads as significant.
   */
  "american","americans","russian","russians","chinese","israeli","israelis",
  "ukrainian","ukrainians","iranian","iranians","european","europeans",
  "british","german","germans","french","indian","indians","japanese",
  "palestinian","palestinians","african","asian","western","syrian","turkish",
  // Bare quantities, which describe a count and never a subject.
  "hundreds","thousands","dozens","millions","billions","several","dozen",
  // Too broad to be a subject on this desk: nearly every story is one of them.
  "media","press","report","reporting","story","stories","coverage",
]);

export type TopicOutlet = {
  name: string;
  lean: Lean;
  stateControlled: boolean;
  articles: number;
};

export type TopicSummary = {
  id: string;
  /** Display term, e.g. "Ukraine". */
  label: string;
  storyCount: number;
  articleCount: number;
  outletCount: number;
  latestAt: string;
  /** Articles per point on the lean scale. */
  leanCounts: Record<Lean, number>;
  /** Distinct points on the scale that covered it. */
  spread: number;
  /** −3 (left) .. +3 (right), or null when nothing is rated. */
  balance: number | null;
  stateCount: number;
  videoCount: number;
  imageCount: number;
  outlets: TopicOutlet[];
  /** Stories under this topic, most corroborated first. */
  stories: NewsroomCluster[];
};

function emptyLeanCounts(): Record<Lean, number> {
  return {
    "far-left": 0,
    left: 0,
    "centre-left": 0,
    centre: 0,
    "centre-right": 0,
    right: 0,
    "far-right": 0,
    unrated: 0,
  };
}

/** Significant terms in a headline, lowercased and de-duplicated. */
export function topicTerms(text: string): string[] {
  const words = text
    .toLowerCase()
    // Strip HTML entities first, or "&rsquo;" becomes the topic "Rsquo".
    .replace(/&[a-z]+;|&#\d+;/g, " ")
    // WordPress feeds append "The post <title> appeared first on <outlet>",
    // which otherwise makes "appeared" one of the biggest topics on the desk.
    .replace(/the post .*?appeared first on.*$/g, " ")
    .replace(/continue reading.*$/g, " ")
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .map((word) => word.replace(/^['-]+|['-]+$/g, ""))
    // Fold possessives into the plain noun, or "Trump" and "Trump's" become
    // two separate topics competing for the same coverage.
    .map((word) => word.replace(/'s$/, ""))
    // Three letters is the floor, not four: "aid", "war", "oil", "gas" and
    // "tax" are among the most important terms on this desk.
    .filter(
      (word) => word.length >= 3 && !STOPWORDS.has(word) && !/^\d+$/.test(word),
    );
  return [...new Set(words)];
}

/** Terms that appear capitalised somewhere other than the opening word. */
export function properNouns(text: string): Set<string> {
  const found = new Set<string>();
  // Split on sentence-ish boundaries so a leading capital does not count.
  for (const sentence of text.split(/(?<=[.!?:])\s+|\n+/)) {
    const words = sentence.trim().split(/\s+/);
    words.forEach((raw, index) => {
      if (index === 0) return;
      const word = raw.replace(/[^A-Za-z0-9'-]/g, "");
      if (word.length < 3) return;
      if (word[0] !== word[0].toUpperCase()) return;
      if (word === word.toUpperCase() && word.length > 4) return;
      found.add(word.toLowerCase());
    });
  }
  return found;
}

/**
 * Groups stories into topics around the terms that recur most across the
 * corpus. A story joins the highest-ranked topic term it mentions, so each
 * story lands in exactly one topic and the list stays readable.
 */
export function buildTopics(
  clusters: NewsroomCluster[],
  options: { minStories?: number; limit?: number } = {},
): TopicSummary[] {
  const minStories = options.minStories ?? 2;
  const limit = options.limit ?? 40;

  // Count how many stories mention each term, and how often that term appears
  // capitalised mid-headline — the signal that separates a named subject
  // ("Ukraine", "Farage") from a generic role word ("minister", "killed").
  const termStories = new Map<string, NewsroomCluster[]>();
  const termCapitalised = new Map<string, number>();
  /**
   * Corpus-wide case evidence, counting every position including the first
   * word.
   *
   * The mid-sentence test below cannot see a subject that always leads its
   * headline, and headlines lead with their subject constantly — "Ukraine
   * strikes…", "Russia says…". Judged on that signal alone those terms look
   * like sentence-initial capitals and are thrown away.
   *
   * Case consistency catches them: a name is essentially never written in
   * lowercase, while a common word that happens to open a headline appears
   * lowercase somewhere else almost immediately.
   */
  const seenUpper = new Map<string, number>();
  const seenLower = new Map<string, number>();

  for (const cluster of clusters) {
    const text = `${cluster.lead.title} ${cluster.lead.snippet}`;
    const terms = topicTerms(text);
    const capitalised = properNouns(text);
    for (const term of terms) {
      const list = termStories.get(term);
      if (list) list.push(cluster);
      else termStories.set(term, [cluster]);
      if (capitalised.has(term)) {
        termCapitalised.set(term, (termCapitalised.get(term) ?? 0) + 1);
      }
    }

    for (const raw of text.split(/\s+/)) {
      const word = raw.replace(/[^A-Za-z'-]/g, "").replace(/'s$/i, "");
      if (word.length < 3) continue;
      const key = word.toLowerCase();
      const tally = /^[A-Z]/.test(word) ? seenUpper : seenLower;
      tally.set(key, (tally.get(key) ?? 0) + 1);
    }
  }

  /** A term written as a capital every time it appears anywhere. */
  const alwaysCapitalised = (term: string) =>
    (seenUpper.get(term) ?? 0) >= 2 && (seenLower.get(term) ?? 0) === 0;

  const ranked = [...termStories.entries()]
    .filter(([term, list]) => {
      if (list.length < minStories) return false;
      if (NEVER_TOPIC.has(term)) return false;

      const capRatio = (termCapitalised.get(term) ?? 0) / list.length;
      const named = capRatio >= 0.6 || alwaysCapitalised(term);
      // A role word survives only if it reads as part of a name.
      if (GENERIC_ROLES.has(term)) return named;

      /**
       * Everything else must be a subject of some kind, and there are only two
       * ways to qualify: a name, or a word this desk recognises as a subject.
       *
       * A blocklist alone could not hold this line. "Including", "Even",
       * "Six", "Billion", "Our" and "White" all reached the topic list as
       * top-level subjects, and each new corpus produces more of them — the
       * list of words that are not subjects is open-ended, while the two ways
       * a word can be one are not.
       */
      return named || DOMAIN_TERMS.has(term);
    })
    .sort((a, b) => b[1].length - a[1].length);

  const claimed = new Set<string>();
  const topics: TopicSummary[] = [];

  for (const [term, list] of ranked) {
    if (topics.length >= limit) break;
    const mine = list.filter((cluster) => !claimed.has(cluster.key));
    if (mine.length < minStories) continue;
    for (const cluster of mine) claimed.add(cluster.key);
    topics.push(summarizeTopic(term, mine));
  }

  return topics.sort(
    (a, b) =>
      b.articleCount - a.articleCount ||
      Date.parse(b.latestAt) - Date.parse(a.latestAt),
  );
}

function summarizeTopic(
  term: string,
  clusters: NewsroomCluster[],
): TopicSummary {
  const leanCounts = emptyLeanCounts();
  const outlets = new Map<string, TopicOutlet>();
  let articleCount = 0;
  let stateCount = 0;
  let videoCount = 0;
  let imageCount = 0;
  let latestAt = clusters[0]?.latestAt ?? new Date().toISOString();

  for (const cluster of clusters) {
    if (Date.parse(cluster.latestAt) > Date.parse(latestAt)) {
      latestAt = cluster.latestAt;
    }
    for (const item of cluster.items) {
      articleCount += 1;
      if (item.media === "video") videoCount += 1;
      if (item.media === "image") imageCount += 1;

      const rating = leanForOutlet(item);
      leanCounts[rating.lean] += 1;
      if (rating.stateControlled) stateCount += 1;

      const existing = outlets.get(rating.outlet);
      if (existing) existing.articles += 1;
      else {
        outlets.set(rating.outlet, {
          name: item.source,
          lean: rating.lean,
          stateControlled: rating.stateControlled,
          articles: 1,
        });
      }
    }
  }

  const ordered = [...clusters].sort(
    (a, b) =>
      b.sourceCount - a.sourceCount ||
      Date.parse(b.latestAt) - Date.parse(a.latestAt),
  );

  return {
    id: term,
    label: term.charAt(0).toUpperCase() + term.slice(1),
    storyCount: clusters.length,
    articleCount,
    outletCount: outlets.size,
    latestAt,
    leanCounts,
    spread: spreadWidth(leanCounts),
    balance: leanBalance(leanCounts),
    stateCount,
    videoCount,
    imageCount,
    outlets: [...outlets.values()].sort((a, b) => b.articles - a.articles),
    stories: ordered,
  };
}

/** Every article under a topic, newest first — the topic detail list. */
export function topicArticles(topic: TopicSummary): NewsroomItem[] {
  return topic.stories
    .flatMap((cluster) => cluster.items)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}
