export const NEWS_TOPICS = [
  {
    id: "all",
    label: "All tech",
    query:
      'technology OR software OR "artificial intelligence" OR cybersecurity OR semiconductor OR startup',
    sub: "Technology",
  },
  {
    id: "ai",
    label: "AI & models",
    query:
      '"artificial intelligence" OR LLM OR ChatGPT OR OpenAI OR Anthropic OR Gemini',
    sub: "AI",
  },
  {
    id: "engineering",
    label: "Engineering",
    query:
      "programming OR javascript OR python OR rust OR kubernetes OR linux OR github",
    sub: "Engineering",
  },
  {
    id: "security",
    label: "Security",
    query: "cybersecurity OR ransomware OR vulnerability OR CVE OR breach",
    sub: "Security",
  },
  {
    id: "cloud",
    label: "Cloud & infra",
    query: "cloud OR AWS OR Azure OR GCP OR kubernetes OR devops OR datacenter",
    sub: "Cloud",
  },
  {
    id: "startups",
    label: "Startups & product",
    query: "startup OR SaaS OR funding OR launch OR product",
    sub: "Startups",
  },
] as const;

export type NewsTopicId = (typeof NEWS_TOPICS)[number]["id"];

export type NewsItem = {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  snippet: string;
  imageUrl?: string;
  videoUrl?: string;
  topic: NewsTopicId;
  provider: string;
};

export type NewsFeedResult = {
  items: NewsItem[];
  fetchedAt: string;
  sources: string[];
  errors: string[];
};
