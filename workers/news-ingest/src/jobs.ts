import { getAIProvider } from "../../../src/lib/news/ai/providers";
import { findDuplicate } from "../../../src/lib/news/deduplication";
import { ingestRegistryRss } from "../../../src/lib/news/ingestion/registry";
import { canonicalUrl } from "../../../src/lib/news/normalizer/sanitize";
import { breakingScore } from "../../../src/lib/news/scoring/breaking";
import { crawlUrlsWithCrawlee, fetchPage } from "./crawler";
import { loadSources } from "./discover";
import { extractJsonLd, extractViaPython, mergeMeta } from "./extract";
import { db } from "./supabase";

async function logJob(
  job: string,
  status: string,
  items: number,
  started: number,
  error?: string,
  sourceId?: string,
) {
  await db()
    .from("news_crawl_jobs")
    .insert({
      job,
      source_id: sourceId ?? null,
      status,
      items,
      error: error ?? null,
      duration_ms: Date.now() - started,
      finished_at: new Date().toISOString(),
    });
}

export async function discoverFeeds() {
  const started = Date.now();
  try {
    const result = await ingestRegistryRss();
    await logJob("discoverFeeds", "ok", result.accepted, started);
    return result;
  } catch (err) {
    await logJob(
      "discoverFeeds",
      "error",
      0,
      started,
      err instanceof Error ? err.message : "failed",
    );
    throw err;
  }
}

export async function crawlSources() {
  const started = Date.now();
  const sources = await loadSources();
  const due = sources.filter((source) => {
    if (!source.last_crawled_at) return true;
    return (
      Date.now() - Date.parse(source.last_crawled_at) >=
      source.crawl_interval * 1000
    );
  });
  let items = 0;
  for (const source of due) {
    if (!source.rss_url && !source.homepage_url) continue;
    const seed = source.rss_url || source.homepage_url || "";
    try {
      const pages = await crawlUrlsWithCrawlee(
        [seed],
        source.max_requests_per_minute,
      );
      items += pages.size;
      await db()
        .from("news_sources")
        .update({
          last_crawled_at: new Date().toISOString(),
          last_success_at: new Date().toISOString(),
          failure_count: 0,
          updated_at: new Date().toISOString(),
        })
        .eq("id", source.id);
    } catch (err) {
      await db()
        .from("news_sources")
        .update({
          last_failure_at: new Date().toISOString(),
          failure_count: source.failure_count + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", source.id);
      await logJob(
        "crawlSources",
        "error",
        0,
        started,
        err instanceof Error ? err.message : "failed",
        source.id,
      );
    }
  }
  await logJob("crawlSources", "ok", items, started);
  return { sources: due.length, items };
}

export async function extractArticles() {
  const started = Date.now();
  const sources = await loadSources();
  const { data } = await db()
    .from("news_articles")
    .select("id, source_url, source_id, excerpt, title")
    .eq("provider", "rss")
    .or("excerpt.is.null,excerpt.eq.")
    .order("published_at", { ascending: false })
    .limit(20);
  let extracted = 0;
  for (const row of data ?? []) {
    const source =
      sources.find((item) => item.id === row.source_id) || sources[0];
    if (!source) continue;
    try {
      const page = await fetchPage(row.source_url, source, sources);
      const jsonLd = extractJsonLd(page.html);
      const python = await extractViaPython(page.html, page.finalUrl);
      const meta = mergeMeta(python, jsonLd);
      const excerpt = (meta.excerpt || meta.description || "").slice(0, 400);
      await db()
        .from("news_articles")
        .update({
          excerpt,
          author: meta.author || null,
          image_url: meta.imageUrl || null,
          canonical_url: canonicalUrl(meta.canonicalUrl || page.finalUrl),
          updated_at: new Date().toISOString(),
        })
        .eq("id", row.id);
      extracted += 1;
    } catch {
      /* continue other URLs */
    }
  }
  await logJob("extractArticles", "ok", extracted, started);
  return { extracted };
}

export async function normaliseArticles() {
  const started = Date.now();
  const { data } = await db()
    .from("news_articles")
    .select("id, source_url, canonical_url")
    .order("published_at", { ascending: false })
    .limit(200);
  let n = 0;
  for (const row of data ?? []) {
    const next = canonicalUrl(row.canonical_url || row.source_url);
    if (next && next !== row.canonical_url) {
      await db()
        .from("news_articles")
        .update({ canonical_url: next, updated_at: new Date().toISOString() })
        .eq("id", row.id);
      n += 1;
    }
  }
  await logJob("normaliseArticles", "ok", n, started);
  return { updated: n };
}

export async function deduplicateArticles() {
  const started = Date.now();
  const { data } = await db()
    .from("news_articles")
    .select(
      "id, title, canonical_url, source_url, external_id, provider, published_at, duplicate_group_id",
    )
    .order("published_at", { ascending: false })
    .limit(300);
  const rows = data ?? [];
  let merged = 0;
  for (let i = 0; i < rows.length; i += 1) {
    const current = rows[i];
    const match = findDuplicate(
      {
        title: current.title,
        canonicalUrl: current.canonical_url || undefined,
        sourceUrl: current.source_url,
        externalId: current.external_id,
        provider: current.provider,
        publishedAt: current.published_at,
      },
      rows.filter((row) => row.id !== current.id),
    );
    if (match && match.duplicate_group_id !== current.duplicate_group_id) {
      await db()
        .from("news_articles")
        .update({
          duplicate_group_id: match.duplicate_group_id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", current.id);
      merged += 1;
    }
  }
  await logJob("deduplicateArticles", "ok", merged, started);
  return { merged };
}

export async function clusterStories() {
  const started = Date.now();
  const { data } = await db()
    .from("news_articles")
    .select("duplicate_group_id, title, description, category, published_at")
    .eq("status", "visible")
    .order("published_at", { ascending: false })
    .limit(400);
  const groups = new Map<string, typeof data>();
  for (const row of data ?? []) {
    const list = groups.get(row.duplicate_group_id) ?? [];
    list.push(row);
    groups.set(row.duplicate_group_id, list);
  }
  let upserts = 0;
  for (const [id, members] of groups) {
    if (!members?.length) continue;
    const primary = members[0];
    const score = breakingScore({
      freshness: 0.7,
      independentSources: members.length,
      trustScore: 0.8,
      recentInGroup: members.length,
    });
    await db()
      .from("news_stories")
      .upsert({
        id,
        headline: primary.title,
        summary: primary.description || "",
        category: primary.category,
        source_count: members.length,
        breaking_score: score,
        importance_score: score,
        last_updated_at: new Date().toISOString(),
        duplicate_group_id: id,
      });
    upserts += 1;
  }
  await logJob("clusterStories", "ok", upserts, started);
  return { stories: upserts };
}

export async function classifyArticles() {
  const started = Date.now();
  const ai = getAIProvider();
  const { data } = await db()
    .from("news_articles")
    .select("id, title, description")
    .order("published_at", { ascending: false })
    .limit(40);
  let n = 0;
  for (const row of data ?? []) {
    const result = await ai.classify({
      title: row.title,
      description: row.description,
    });
    await db()
      .from("news_articles")
      .update({
        category: result.category,
        ai_topic: result.topics[0] || null,
        entities: result.entities,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);
    n += 1;
  }
  await logJob("classifyArticles", "ok", n, started);
  return { classified: n };
}

export async function calculateBreakingScores() {
  const started = Date.now();
  const { data } = await db().from("news_stories").select("*").limit(200);
  let n = 0;
  for (const row of data ?? []) {
    const score = breakingScore({
      freshness: 0.65,
      independentSources: Number(row.source_count) || 1,
      trustScore: 0.8,
      recentInGroup: Number(row.source_count) || 1,
    });
    await db()
      .from("news_stories")
      .update({
        breaking_score: score,
        last_updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);
    n += 1;
  }
  await logJob("calculateBreakingScores", "ok", n, started);
  return { updated: n };
}

export async function cleanupOldData() {
  const started = Date.now();
  const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const { error, count } = await db()
    .from("news_crawl_jobs")
    .delete({ count: "exact" })
    .lt("started_at", cutoff);
  if (error) throw error;
  await logJob("cleanupOldData", "ok", count ?? 0, started);
  return { deleted: count ?? 0 };
}
