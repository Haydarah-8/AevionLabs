export const NEWS_CATEGORIES = [
  "World",
  "UK",
  "Politics",
  "Business",
  "Technology",
  "AI",
  "Science",
  "Health",
  "Sports",
  "Entertainment",
  "Finance",
  "Climate",
  "Travel",
  "Lifestyle",
] as const;

export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

const KEYWORDS: Array<{ category: NewsCategory; terms: string[] }> = [
  {
    category: "AI",
    terms: [
      "artificial intelligence",
      "chatgpt",
      "openai",
      "llm",
      "generative ai",
    ],
  },
  {
    category: "Climate",
    terms: ["climate", "net zero", "emissions", "wildfire", "flood"],
  },
  {
    category: "Finance",
    terms: [
      "interest rate",
      "inflation",
      "stock",
      "bond",
      "ftse",
      "federal reserve",
    ],
  },
  {
    category: "Business",
    terms: ["merger", "acquisition", "earnings", "ceo", "bankruptcy"],
  },
  {
    category: "Technology",
    terms: ["semiconductor", "cyber", "apple", "google", "microsoft", "chip"],
  },
  {
    category: "Health",
    terms: ["nhs", "vaccine", "outbreak", "who ", "hospital"],
  },
  {
    category: "Science",
    terms: ["nasa", "space", "physics", "genome", "quantum"],
  },
  {
    category: "Sports",
    terms: ["premier league", "fifa", "olympics", "wimbledon", "formula 1"],
  },
  {
    category: "Entertainment",
    terms: ["hollywood", "oscars", "netflix", "box office"],
  },
  { category: "Travel", terms: ["airline", "airport", "tourism", "visa"] },
  { category: "Lifestyle", terms: ["fashion", "food", "recipe", "wellness"] },
  {
    category: "Politics",
    terms: [
      "election",
      "parliament",
      "minister",
      "congress",
      "senate",
      "white house",
    ],
  },
  {
    category: "UK",
    terms: [
      "uk ",
      "britain",
      "british",
      "london",
      "scotland",
      "wales",
      "northern ireland",
    ],
  },
];

export function classifyCategory(
  title: string,
  description: string,
  hint?: string,
): NewsCategory {
  const hay = `${hint || ""} ${title} ${description}`.toLowerCase();
  if (hint) {
    const mapped = mapProviderCategory(hint);
    if (mapped) return mapped;
  }
  for (const row of KEYWORDS) {
    if (row.terms.some((term) => hay.includes(term))) return row.category;
  }
  return "World";
}

export function mapProviderCategory(raw: string): NewsCategory | undefined {
  const value = raw.toLowerCase();
  if (value.includes("uk") || value.includes("britain")) return "UK";
  if (value.includes("politic")) return "Politics";
  if (value.includes("business")) return "Business";
  if (value.includes("tech")) return "Technology";
  if (value.includes("ai") || value.includes("artificial")) return "AI";
  if (value.includes("science")) return "Science";
  if (value.includes("health")) return "Health";
  if (value.includes("sport")) return "Sports";
  if (
    value.includes("entertain") ||
    value.includes("film") ||
    value.includes("tv")
  ) {
    return "Entertainment";
  }
  if (
    value.includes("finance") ||
    value.includes("money") ||
    value.includes("market")
  ) {
    return "Finance";
  }
  if (value.includes("climate") || value.includes("environment"))
    return "Climate";
  if (value.includes("travel")) return "Travel";
  if (value.includes("lifestyle") || value.includes("life and style"))
    return "Lifestyle";
  if (value.includes("world") || value.includes("international"))
    return "World";
  return undefined;
}

export function isNewsCategory(value: string): value is NewsCategory {
  return (NEWS_CATEGORIES as readonly string[]).includes(value);
}
