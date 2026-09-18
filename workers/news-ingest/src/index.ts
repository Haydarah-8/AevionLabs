import {
  calculateBreakingScores,
  classifyArticles,
  cleanupOldData,
  clusterStories,
  crawlSources,
  deduplicateArticles,
  discoverFeeds,
  extractArticles,
  normaliseArticles,
} from "./jobs";

const JOBS: Record<string, () => Promise<unknown>> = {
  discoverFeeds,
  crawlSources,
  extractArticles,
  normaliseArticles,
  deduplicateArticles,
  clusterStories,
  classifyArticles,
  calculateBreakingScores,
  cleanupOldData,
};

async function main() {
  const name = process.argv[2] || "discoverFeeds";
  const job = JOBS[name];
  if (!job) {
    console.error(`Unknown job ${name}. Try: ${Object.keys(JOBS).join(", ")}`);
    process.exit(1);
  }
  const result = await job();
  console.log(JSON.stringify({ job: name, result }, null, 2));
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
