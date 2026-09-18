import { getSupabaseAdmin, hasSupabaseAdmin } from "@/lib/supabase-admin";
import { fallbackImage } from "@/lib/news/media";
import type { NewsArticleRow, StoryGroup } from "@/lib/news/types";

export function groupArticles(rows: NewsArticleRow[]): StoryGroup[] {
  const groups = new Map<string, NewsArticleRow[]>();
  for (const row of rows) {
    const list = groups.get(row.duplicate_group_id) ?? [];
    list.push(row);
    groups.set(row.duplicate_group_id, list);
  }
  return [...groups.values()]
    .map((members) => {
      const sorted = [...members].sort((a, b) =>
        b.published_at.localeCompare(a.published_at),
      );
      const primary = sorted[0];
      const sources = sorted.map((row) => ({
        name: row.source_name || row.source_domain || row.provider,
        url: row.source_url,
        domain: row.source_domain,
        provider: row.provider,
      }));
      const uniqueSources = [
        ...new Map(sources.map((source) => [source.url, source])).values(),
      ];
      return {
        id: primary.duplicate_group_id,
        title: primary.title,
        description: primary.description,
        category: primary.category,
        publishedAt: primary.published_at,
        imageUrl: primary.image_url || fallbackImage(primary.category),
        videoUrl: primary.video_url || undefined,
        isBreaking: sorted.some((row) => row.is_breaking),
        isFeatured: sorted.some((row) => row.is_featured),
        hasVideo: sorted.some((row) => Boolean(row.video_url)),
        sourceCount: uniqueSources.length,
        sources: uniqueSources,
        primaryUrl: primary.source_url,
        shortSummary: primary.short_summary || undefined,
      } satisfies StoryGroup;
    })
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function listVisibleArticles(options: {
  category?: string;
  limit?: number;
  before?: string;
}): Promise<NewsArticleRow[]> {
  if (!hasSupabaseAdmin()) return [];
  try {
    const limit = Math.min(options.limit ?? 80, 120);
    let query = getSupabaseAdmin()
      .from("news_articles")
      .select("*")
      .eq("status", "visible")
      .is("source_id", null)
      .order("published_at", { ascending: false })
      .limit(limit);
    if (options.category && options.category !== "All") {
      query = query.eq("category", options.category);
    }
    if (options.before) query = query.lt("published_at", options.before);
    const { data, error } = await query;
    if (error) {
      console.error("[news/store] listVisibleArticles:", error.message);
      return [];
    }
    return (data ?? []) as NewsArticleRow[];
  } catch (err) {
    console.error("[news/store] listVisibleArticles failed:", err);
    return [];
  }
}

export async function listBreaking(limit = 8): Promise<NewsArticleRow[]> {
  if (!hasSupabaseAdmin()) return [];
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("news_articles")
      .select("*")
      .eq("status", "visible")
      .is("source_id", null)
      .eq("is_breaking", true)
      .order("published_at", { ascending: false })
      .limit(limit);
    if (error) {
      console.error("[news/store] listBreaking:", error.message);
      return [];
    }
    return (data ?? []) as NewsArticleRow[];
  } catch (err) {
    console.error("[news/store] listBreaking failed:", err);
    return [];
  }
}

export async function getNewsStats() {
  const admin = getSupabaseAdmin();
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const [
    total,
    todayCount,
    breaking,
    hidden,
    byProvider,
    byCategory,
    health,
    failed,
  ] = await Promise.all([
    admin.from("news_articles").select("id", { count: "exact", head: true }),
    admin
      .from("news_articles")
      .select("id", { count: "exact", head: true })
      .gte("first_seen_at", today.toISOString()),
    admin
      .from("news_articles")
      .select("id", { count: "exact", head: true })
      .eq("is_breaking", true)
      .eq("status", "visible"),
    admin
      .from("news_articles")
      .select("id", { count: "exact", head: true })
      .eq("status", "hidden"),
    admin.from("news_articles").select("provider"),
    admin.from("news_articles").select("category").eq("status", "visible"),
    admin.from("news_providers").select("*").order("id"),
    admin
      .from("news_ingestion_logs")
      .select("*")
      .in("status", ["error", "rate_limited"])
      .order("started_at", { ascending: false })
      .limit(20),
  ]);

  const providerCounts: Record<string, number> = {};
  for (const row of byProvider.data ?? []) {
    const id = (row as { provider: string }).provider;
    providerCounts[id] = (providerCounts[id] || 0) + 1;
  }
  const categoryCounts: Record<string, number> = {};
  for (const row of byCategory.data ?? []) {
    const id = (row as { category: string }).category;
    categoryCounts[id] = (categoryCounts[id] || 0) + 1;
  }

  const { data: groups } = await admin
    .from("news_articles")
    .select("duplicate_group_id")
    .eq("status", "visible");
  const uniqueGroups = new Set(
    (groups ?? []).map(
      (row) => (row as { duplicate_group_id: string }).duplicate_group_id,
    ),
  );

  const { data: recent } = await admin
    .from("news_articles")
    .select(
      "id, title, provider, source_name, category, status, is_breaking, is_featured, duplicate_group_id, published_at, source_url, description, excerpt, image_url, discovered_at",
    )
    .order("published_at", { ascending: false })
    .limit(80);

  return {
    total: total.count ?? 0,
    today: todayCount.count ?? 0,
    breaking: breaking.count ?? 0,
    hidden: hidden.count ?? 0,
    duplicateGroups: uniqueGroups.size,
    byProvider: providerCounts,
    byCategory: categoryCounts,
    providers: health.data ?? [],
    failedJobs: failed.data ?? [],
    recent: recent ?? [],
  };
}

/**
 * Stored articles for the desk, newest first.
 *
 * `offset` reaches past the newest page into what came before it, so a story
 * stops vanishing the moment enough new ones arrive.
 *
 * It is an offset into this same ordering rather than a published_at cursor,
 * which is what it was first written as. Some stored rows carry a publication
 * date years off — a feed that reports its archive date, or a parse that fell
 * back to something odd — and one of those in the first page dragged the
 * cursor back to 2016 immediately, so the second request asked for anything
 * older than that and the archive ended after a single page. Position in a
 * fixed order cannot be thrown by one bad date.
 */
export async function listAdminRecentArticles(
  limit = 200,
  options: { offset?: number } = {},
) {
  const offset = Math.max(0, options.offset ?? 0);
  const { data, error } = await getSupabaseAdmin()
    .from("news_articles")
    .select(
      "id, title, provider, source_name, category, status, is_breaking, is_featured, duplicate_group_id, published_at, source_url, description, excerpt, image_url, video_url, discovered_at, source_id",
    )
    .not("source_id", "is", null)
    .eq("status", "visible")
    .order("discovered_at", { ascending: false, nullsFirst: false })
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return data ?? [];
}

export async function updateArticle(
  id: string,
  patch: Partial<{
    status: "visible" | "hidden";
    is_featured: boolean;
    is_breaking: boolean;
    category: string;
  }>,
) {
  const { error } = await getSupabaseAdmin()
    .from("news_articles")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function mergeDuplicateGroups(from: string, into: string) {
  const { error } = await getSupabaseAdmin()
    .from("news_articles")
    .update({ duplicate_group_id: into, updated_at: new Date().toISOString() })
    .eq("duplicate_group_id", from);
  if (error) throw error;
}

export async function setProviderEnabled(id: string, enabled: boolean) {
  const { error } = await getSupabaseAdmin()
    .from("news_providers")
    .update({ enabled, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function listRecentForDedup(): Promise<
  Array<{
    id: string;
    title: string;
    canonical_url: string | null;
    source_url: string;
    external_id: string;
    provider: string;
    published_at: string;
    duplicate_group_id: string;
  }>
> {
  const since = new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString();
  const { data, error } = await getSupabaseAdmin()
    .from("news_articles")
    .select(
      "id, title, canonical_url, source_url, external_id, provider, published_at, duplicate_group_id",
    )
    .gte("published_at", since)
    .limit(400);
  if (error) throw error;
  return data ?? [];
}

/**
 * Article text already pulled from a publisher, keyed by source url.
 *
 * Extraction is the slow, rate-limited part of the desk, and the same articles
 * are opened repeatedly. Storing the text once means later reads never touch
 * the publisher again.
 */
export async function getStoredArticleText(
  urls: string[],
): Promise<
  Map<
    string,
    {
      title: string;
      content: string;
      excerpt: string | null;
      imageUrl: string | null;
      source: string;
      publishedAt: string;
      canonicalUrl: string | null;
      author: string | null;
      /**
       * The playable source found when the page was read.
       *
       * Without this the cache loses it: an outlet video page carries no
       * video_url in its feed, so a cached article would come back with text
       * and no video, and the player would silently never appear.
       */
      videoUrl: string | null;
    }
  >
> {
  const found = new Map<
    string,
    {
      title: string;
      content: string;
      excerpt: string | null;
      imageUrl: string | null;
      source: string;
      publishedAt: string;
      canonicalUrl: string | null;
      author: string | null;
      videoUrl: string | null;
    }
  >();
  if (!urls.length) return found;

  const { data, error } = await getSupabaseAdmin()
    .from("news_articles")
    .select(
      "source_url, title, content, excerpt, image_url, video_url, source_name, published_at, canonical_url, author",
    )
    .in("source_url", urls.slice(0, 200))
    // Unextracted rows hold an empty string rather than null, so both have to
    // be excluded or every row comes back only to be dropped below.
    .not("content", "is", null)
    .neq("content", "");
  if (error) return found;

  for (const row of data ?? []) {
    const content = String(row.content ?? "").trim();
    if (content.length < 120) continue; // too short to be a usable read
    found.set(String(row.source_url), {
      title: String(row.title ?? ""),
      content,
      excerpt: (row.excerpt as string | null) ?? null,
      imageUrl: (row.image_url as string | null) ?? null,
      source: String(row.source_name ?? ""),
      publishedAt: String(row.published_at ?? new Date().toISOString()),
      canonicalUrl: (row.canonical_url as string | null) ?? null,
      author: (row.author as string | null) ?? null,
      videoUrl: (row.video_url as string | null) ?? null,
    });
  }
  return found;
}

/** Persist freshly extracted text against the stored article, if we have one. */
export async function saveArticleText(
  entries: Array<{
    sourceUrl: string;
    paragraphs: string[];
    excerpt?: string;
    imageUrl?: string;
    author?: string;
    /** Resolved from the page; the feed rarely carries one. */
    videoUrl?: string;
  }>,
): Promise<number> {
  let saved = 0;
  for (const entry of entries) {
    const content = entry.paragraphs.join("\n\n").trim();
    if (content.length < 120) continue;
    const patch: Record<string, string> = { content };
    if (entry.excerpt) patch.excerpt = entry.excerpt;
    if (entry.imageUrl) patch.image_url = entry.imageUrl;
    if (entry.author) patch.author = entry.author;
    if (entry.videoUrl) patch.video_url = entry.videoUrl;
    const { error } = await getSupabaseAdmin()
      .from("news_articles")
      .update(patch)
      .eq("source_url", entry.sourceUrl);
    if (!error) saved += 1;
  }
  return saved;
}
