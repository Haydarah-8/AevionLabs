import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { SEED_SOURCES, type NewsSourceRow } from "@/lib/news/sources/registry";

export async function ensureNewsSources() {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.from("news_sources").select("id");
  if (error) throw error;

  const seedIds = new Set(SEED_SOURCES.map((source) => source.id));
  const staleIds = (data ?? [])
    .map((row) => String(row.id))
    .filter((id) => !seedIds.has(id));
  if (staleIds.length) {
    await admin
      .from("news_sources")
      .update({ enabled: false, updated_at: new Date().toISOString() })
      .in("id", staleIds);
  }

  const rows = SEED_SOURCES.map((source) => ({
    id: source.id,
    name: source.name,
    domain: source.domain,
    country: source.country,
    language: source.language,
    category: source.category,
    rss_url: source.rss_url,
    homepage_url: source.homepage_url,
    crawl_method: source.crawl_method,
    crawl_interval: source.crawl_interval,
    priority: source.priority,
    trust_score: source.trust_score,
    max_requests_per_minute: source.max_requests_per_minute,
    enabled: true,
    updated_at: new Date().toISOString(),
  }));
  const { error: upsertError } = await admin
    .from("news_sources")
    .upsert(rows, { onConflict: "id" });
  if (upsertError) throw upsertError;
}

export async function listNewsSources(): Promise<NewsSourceRow[]> {
  try {
    await ensureNewsSources();
  } catch {
    /* fall through to seed list */
  }
  const { data, error } = await getSupabaseAdmin()
    .from("news_sources")
    .select("*")
    .order("priority", { ascending: false });
  if (error || !data?.length) {
    return SEED_SOURCES.map((source) => ({
      ...source,
      enabled: true,
      last_crawled_at: null,
      last_success_at: null,
      last_failure_at: null,
      failure_count: 0,
      concurrency: 1,
      timeout_ms: 12000,
      retry_count: 2,
      requires_browser: false,
    }));
  }
  const enabled = (data as NewsSourceRow[]).filter(
    (row) => row.enabled !== false,
  );
  return enabled.length ? enabled : (data as NewsSourceRow[]);
}

export async function updateNewsSource(
  id: string,
  patch: Partial<{
    enabled: boolean;
    crawl_interval: number;
    trust_score: number;
    priority: number;
    requires_browser: boolean;
    max_requests_per_minute: number;
    last_crawled_at: string | null;
    last_success_at: string | null;
    last_failure_at: string | null;
    failure_count: number;
  }>,
) {
  const { error } = await getSupabaseAdmin()
    .from("news_sources")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function listNewsStories(limit = 40) {
  const { data, error } = await getSupabaseAdmin()
    .from("news_stories")
    .select("*")
    .order("last_updated_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function mergeNewsStories(from: string, into: string) {
  const admin = getSupabaseAdmin();
  const { error: articlesError } = await admin
    .from("news_articles")
    .update({ story_id: into, updated_at: new Date().toISOString() })
    .eq("story_id", from);
  if (articlesError) throw articlesError;
  await admin.from("news_stories").delete().eq("id", from);
}

export async function listCrawlJobs(limit = 30) {
  const { data, error } = await getSupabaseAdmin()
    .from("news_crawl_jobs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function logCrawlJob(row: {
  job: string;
  source_id?: string | null;
  status: string;
  error?: string | null;
  items?: number;
  http_status?: number | null;
  duration_ms?: number;
}) {
  await getSupabaseAdmin()
    .from("news_crawl_jobs")
    .insert({
      job: row.job,
      source_id: row.source_id ?? null,
      status: row.status,
      error: row.error ?? null,
      items: row.items ?? 0,
      http_status: row.http_status ?? null,
      duration_ms: row.duration_ms ?? null,
      finished_at: new Date().toISOString(),
    });
}

export async function listDismissedUrls(): Promise<Set<string>> {
  const { data, error } = await getSupabaseAdmin()
    .from("news_feed_dismissals")
    .select("source_url");
  if (error) return new Set();
  return new Set(
    (data ?? []).map((row) => String(row.source_url)).filter(Boolean),
  );
}

export async function dismissFeedUrl(sourceUrl: string) {
  const url = sourceUrl.split("#")[0];
  const admin = getSupabaseAdmin();
  const { error } = await admin
    .from("news_feed_dismissals")
    .upsert({ source_url: url }, { onConflict: "source_url" });
  if (error) throw error;
  await admin
    .from("news_articles")
    .update({ status: "hidden", updated_at: new Date().toISOString() })
    .eq("source_url", url);
}
