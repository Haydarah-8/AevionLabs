/** Tech-only intake. Free public RSS / GDELT / Google News — no paid APIs. */

export const TECH_CATEGORIES = new Set([
  "Technology",
  "AI",
  "Science",
  "Engineering",
]);

const TECH_NEWS =
  /\b(tech|technology|software|hardware|programming|programmer|developer|coding|javascript|typescript|python|rust|golang|react|next\.?js|nodejs|node\.js|kubernetes|docker|linux|windows|macos|ios|android|iphone|ipad|chip|chips|semiconductor|gpu|cpu|nvidia|amd|intel|apple|google|microsoft|openai|anthropic|gemini|chatgpt|llm|gpt-?\d|artificial intelligence|\bai\b|machine learning|cyber|cybersecurity|ransomware|malware|vulnerability|cve-|hackers?|data breach|open source|github|gitlab|cloud|aws|azure|gcp|saas|api|database|postgres|supabase|vercel|startup|silicon valley|browser|chrome|firefox|safari|quantum|robotics|robot|5g|wifi|smartphone|datacent(?:er|re)|devops|ci\/cd|compiler|framework|sdk|app store|play store|wwdc|build 20|ignite|ces |mwc )\b/i;

const SOFT_NEWS =
  /\b(home equity|cash out of your home|refinance|mortgage|personal loan|credit card|recipe|wellness|fashion|lifestyle|shop the|buy this|celebrity|reality tv|premier league|fifa|hollywood gossip)\b/i;

export const TECH_SEARCH_QUERY =
  'technology OR software OR "artificial intelligence" OR cybersecurity OR semiconductor OR "open source" OR startup OR cloud OR programming';

export const GDELT_TECH_QUERY = `sourcelang:eng (${TECH_SEARCH_QUERY})`;

export function isTechRelated(
  title: string,
  snippet = "",
  url = "",
  category = "",
): boolean {
  if (category && TECH_CATEGORIES.has(category)) return true;
  const hay = `${title} ${snippet} ${url}`;
  if (SOFT_NEWS.test(hay)) return false;
  try {
    const path = `${new URL(url).pathname}${new URL(url).search}`.toLowerCase();
    if (
      /\/(sport|sports|entertainment|fashion|lifestyle|travel|food|wellness|politics|world)\b/.test(
        path,
      ) &&
      !/\/(tech|technology|ai|science|software|developer)\b/.test(path)
    ) {
      return false;
    }
  } catch {
    return false;
  }
  return TECH_NEWS.test(hay);
}
