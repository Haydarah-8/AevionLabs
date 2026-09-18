# News ingest worker (not Vercel)

Long-running discovery and crawl process. Do not deploy this package to Vercel serverless.

```bash
cd workers/news-ingest
npm install
npx tsx --env-file=../../.env src/index.ts discoverFeeds
```

Jobs (each independently executable):

- `discoverFeeds` — official RSS, then GDELT URLs
- `crawlSources` — Crawlee HTTP/Cheerio; Playwright only if a source requires it or HTTP fails
- `extractArticles` — JSON-LD, then Python Trafilatura sidecar, then Readability
- `normaliseArticles`
- `deduplicateArticles`
- `clusterStories`
- `classifyArticles`
- `calculateBreakingScores`
- `cleanupOldData`

Optional Python extract sidecar: `workers/news-extract` on `NEWS_EXTRACT_URL` (default `http://127.0.0.1:8788`).
