export type ClassifyInput = {
  title: string;
  description?: string;
};

export type ClassifyResult = {
  category: string;
  subcategory?: string;
  entities: string[];
  topics: string[];
  summary?: string;
};

export type AIProvider = {
  id: string;
  classify(input: ClassifyInput): Promise<ClassifyResult>;
  summarize(input: ClassifyInput): Promise<string>;
  extractEntities(input: ClassifyInput): Promise<string[]>;
  calculateSimilarity(a: string, b: string): Promise<number>;
};

const ENTITY_TERMS = [
  "NATO",
  "UN",
  "EU",
  "UK",
  "US",
  "China",
  "Russia",
  "Ukraine",
  "Israel",
  "Iran",
  "OPEC",
];

function hay(input: ClassifyInput) {
  return `${input.title} ${input.description || ""}`;
}

export const ruleBasedProvider: AIProvider = {
  id: "rules",
  async classify(input) {
    const text = hay(input).toLowerCase();
    const category =
      text.includes("oil") || text.includes("energy")
        ? "Climate"
        : text.includes("election") || text.includes("parliament")
          ? "Politics"
          : text.includes("market") || text.includes("bank")
            ? "Finance"
            : "World";
    return {
      category,
      entities: await this.extractEntities(input),
      topics: category === "World" ? ["geopolitics"] : [category.toLowerCase()],
      summary: input.description?.slice(0, 220) || input.title,
    };
  },
  async summarize(input) {
    return (input.description || input.title).slice(0, 220);
  },
  async extractEntities(input) {
    const text = hay(input);
    return ENTITY_TERMS.filter((term) =>
      new RegExp(`\\b${term}\\b`, "i").test(text),
    ).slice(0, 8);
  },
  async calculateSimilarity() {
    return 0;
  },
};

export const localModelProvider: AIProvider = {
  id: "local",
  classify: ruleBasedProvider.classify,
  summarize: ruleBasedProvider.summarize,
  extractEntities: ruleBasedProvider.extractEntities,
  calculateSimilarity: ruleBasedProvider.calculateSimilarity,
};

export const externalAIProvider: AIProvider = {
  id: "external",
  classify: ruleBasedProvider.classify,
  summarize: ruleBasedProvider.summarize,
  extractEntities: ruleBasedProvider.extractEntities,
  calculateSimilarity: ruleBasedProvider.calculateSimilarity,
};

export function getAIProvider(): AIProvider {
  const name = (process.env.AI_PROVIDER || "rules").toLowerCase();
  if (name === "local") return localModelProvider;
  if (name === "external") return externalAIProvider;
  return ruleBasedProvider;
}
