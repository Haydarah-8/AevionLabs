/**
 * Domain vocabulary — data only, no logic.
 *
 * It lives apart from taxonomy.ts because two modules need it and they sit on
 * opposite sides of a dependency: taxonomy.ts classifies topics into these
 * domains, and topics.ts uses the same vocabulary to decide whether a term is
 * a recognised subject at all. Importing one from the other would be a cycle.
 */

export type DomainId =
  | "conflict"
  | "diplomacy"
  | "politics"
  | "economy"
  | "energy"
  | "migration"
  | "justice"
  | "technology"
  | "climate"
  | "health"
  | "rights"
  | "intelligence";

export type Domain = {
  id: DomainId;
  label: string;
  /** What belongs here, in one line, for the reader who is guessing. */
  blurb: string;
  /** Terms that put a topic in this domain. Matched against story text. */
  terms: string[];
};

/**
 * Ordered roughly by how much of a geopolitical desk's output each accounts
 * for. Terms are deliberately concrete: abstract words ("crisis", "issue")
 * match everything and so distinguish nothing.
 */
export const DOMAINS: Domain[] = [
  {
    id: "conflict",
    label: "Conflict & Defence",
    blurb: "Armed conflict, militaries, weapons and ceasefires.",
    terms: [
      "war","warfare","military","troops","soldier","soldiers","army","navy",
      "airstrike","airstrikes","strike","strikes","missile","missiles","drone",
      "drones","shelling","offensive","invasion","frontline","ceasefire","truce",
      "combat","battalion","artillery","bombing","bombed","siege","militia",
      "insurgency","nato","defence","defense","rearmament","conscription",
      "warship","fighter jet","weapons","arms","munitions","casualties",
    ],
  },
  {
    id: "diplomacy",
    label: "Diplomacy & Foreign Policy",
    blurb: "Negotiation, alliances, treaties and sanctions.",
    terms: [
      // Not bare "talks": pay talks, coalition talks, trade talks and peace
      // talks belong to four different domains, so the word on its own
      // identifies none of them. The qualified forms do.
      "peace talks","ceasefire talks","nuclear talks",
      "negotiation","negotiations","summit","treaty","accord","pact",
      "diplomat","diplomatic","diplomacy","embassy","ambassador","envoy",
      "sanction","sanctions","embargo","alliance","bilateral","delegation",
      "foreign minister","state department","united nations","security council",
      "resolution","mediation","normalisation","normalization","recognition",
    ],
  },
  {
    id: "politics",
    label: "Elections & Government",
    blurb: "Campaigns, votes, coalitions and who holds power.",
    terms: [
      "election","elections","vote","votes","voting","ballot","poll","polls",
      "campaign","candidate","primary","referendum","parliament","congress",
      "senate","coalition","cabinet","reshuffle","resign","resignation",
      "impeachment","legislation","bill","budget","filibuster","turnout",
      "constituency","mp","lawmaker","lawmakers","opposition","incumbent",
    ],
  },
  {
    id: "economy",
    label: "Economy & Trade",
    blurb: "Markets, prices, trade terms and industrial policy.",
    terms: [
      "economy","economic","inflation","recession","gdp","growth","interest rate",
      "rates","central bank","federal reserve","tariff","tariffs","trade",
      "export","exports","import","imports","importers","supply chain",
      "trade talks","pay talks","currency","dollar",
      "stocks","markets","investors","unemployment","jobs","wages","debt",
      "deficit","bailout","subsidy","subsidies","manufacturing","shipping",
    ],
  },
  {
    id: "energy",
    label: "Energy & Resources",
    blurb: "Oil, gas, power grids, minerals and nuclear fuel.",
    terms: [
      "oil","gas","lng","pipeline","opec","barrel","crude","refinery","energy",
      "electricity","grid","blackout","power plant","nuclear","uranium","enrich",
      "enrichment","renewable","renewables","solar","wind farm","coal","mining",
      "minerals","lithium","cobalt","rare earth","fuel","petrol","diesel",
    ],
  },
  {
    id: "migration",
    label: "Migration & Borders",
    blurb: "Movement of people, borders and asylum systems.",
    terms: [
      "migrant","migrants","migration","immigration","immigrant","refugee",
      "refugees","asylum","border","borders","deport","deportation","visa",
      "smuggling","trafficking","crossing","crossings","detention","resettle",
      "resettlement","displaced","displacement","citizenship","naturalisation",
    ],
  },
  {
    id: "justice",
    label: "Law & Justice",
    blurb: "Courts, prosecutions, rulings and policing.",
    terms: [
      "court","courts","supreme court","judge","ruling","verdict","trial",
      "prosecutor","prosecution","indictment","indicted","charges","lawsuit",
      "sue","sued","appeal","sentence","sentenced","conviction","convicted",
      "acquitted","tribunal","warrant","investigation","subpoena","plea",
      "extradition","war crimes","icc","litigation",
    ],
  },
  {
    id: "technology",
    label: "Technology & Cyber",
    blurb: "Computing, AI, chips, platforms and cyber operations.",
    terms: [
      "technology","tech","artificial intelligence","chip","chips",
      "semiconductor","semiconductors","software","algorithm","data",
      "cyber","cyberattack","hacking","hackers","ransomware","breach","malware",
      "encryption","surveillance tech","satellite","space","startup","platform",
      "social media","misinformation","disinformation","deepfake","automation",
    ],
  },
  {
    id: "climate",
    label: "Climate & Environment",
    blurb: "Emissions, extreme weather and environmental policy.",
    terms: [
      "climate","emissions","carbon","warming","greenhouse","net zero","cop29",
      "cop30","flood","flooding","flooded","wildfire","wildfires","drought",
      "hurricane","typhoon","cyclone","storm","heatwave","glacier","sea level",
      "deforestation","biodiversity","pollution","environmental","conservation",
    ],
  },
  {
    id: "health",
    label: "Health & Humanitarian",
    blurb: "Disease, health systems, famine and relief operations.",
    terms: [
      "health","hospital","hospitals","patients","doctors","nurses","disease",
      "outbreak","epidemic","pandemic","virus","infection","vaccine",
      "vaccination","famine","starvation","malnutrition","aid","humanitarian",
      "relief","medicine","medical","who","cholera","measles","mortality",
    ],
  },
  {
    id: "rights",
    label: "Rights & Civil Society",
    blurb: "Protest, speech, repression and civil liberties.",
    terms: [
      "protest","protests","protesters","demonstration","rally","strike action",
      "union","unions","rights","human rights","freedom","censorship","censor",
      "crackdown","dissident","activist","activists","jailed","detained",
      "political prisoner","press freedom","journalist","journalists","speech",
      "discrimination","equality","abortion","lgbt",
    ],
  },
  {
    id: "intelligence",
    label: "Intelligence & Security Services",
    blurb: "Espionage, covert action and domestic security agencies.",
    terms: [
      "intelligence","spy","spies","espionage","covert","classified","leak",
      "leaked","whistleblower","surveillance","wiretap","informant","agent",
      "cia","fbi","mi6","mi5","mossad","fsb","gru","nsa","counterterrorism",
      "terror","terrorism","terrorist","plot","assassination","sabotage",
    ],
  },
];

/** Every domain term as one flat set, for membership tests. */
export const DOMAIN_TERMS: Set<string> = new Set(
  DOMAINS.flatMap((domain) =>
    // Multi-word terms are split so a topic term like "asylum" still matches
    // the phrase "asylum seekers" it appears in.
    domain.terms.flatMap((term) => term.split(" ")),
  ),
);
