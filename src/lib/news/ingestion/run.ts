import { rememberProviderSuccess } from "@/lib/news/cache";
import { findDuplicate, type ExistingArticle } from "@/lib/news/deduplication";
import { disabledSummariser } from "@/lib/news/media";
import { getProvider, NEWS_PROVIDERS } from "@/lib/news/providers";
import { scoreArticle } from "@/lib/news/scoring";
import { listRecentForDedup } from "@/lib/news/store";
import { isTechRelated } from "@/lib/news/tech";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { NewsProviderId, NormalizedArticle } from "@/lib/news/types";

export type IngestResult = {
  provider: string;
  status: "ok" | "error" | "rate_limited" | "skipped";
  received: number;
  accepted: number;
  duplicates: number;
  error?: string;
  ms: number;
};

async function markProvider(
  id: string,
  patch: {
    last_ok_at?: string;
    last_error?: string | null;
    unhealthy_until?: string | null;
  },
) {
  await getSupabaseAdmin()
    .from("news_providers")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);
}

function hoursAgo(iso: string) {
  return Date.now() - Date.parse(iso) < 2 * 60 * 60 * 1000;
}

export async function ingestProvider(
  providerId: NewsProviderId,
): Promise<IngestResult> {
  const started = Date.now();
  const provider = getProvider(providerId);
  if (!provider?.configured()) {
    return {
      provider: providerId,
      status: "skipped",
      received: 0,
      accepted: 0,
      duplicates: 0,
      error: "not configured",
      ms: 0,
    };
  }

  const admin = getSupabaseAdmin();
  const { data: row } = await admin
    .from("news_providers")
    .select("*")
    .eq("id", providerId)
    .maybeSingle();
  if (row && row.enabled === false) {
    return {
      provider: providerId,
      status: "skipped",
      received: 0,
      accepted: 0,
      duplicates: 0,
      error: "disabled",
      ms: 0,
    };
  }
  if (row?.unhealthy_until && Date.parse(row.unhealthy_until) > Date.now()) {
    return {
      provider: providerId,
      status: "skipped",
      received: 0,
      accepted: 0,
      duplicates: 0,
      error: "temporarily unhealthy",
      ms: 0,
    };
  }

  let received = 0;
  let accepted = 0;
  let duplicates = 0;
  let status: IngestResult["status"] = "ok";
  let errorMessage: string | undefined;
  let articles: NormalizedArticle[] = [];

  try {
    articles = await provider.fetchLatest();
    received = articles.length;
    rememberProviderSuccess(providerId, articles);
  } catch (err) {
    const message = err instanceof Error ? err.message : "fetch failed";
    const rateLimited = message === "rate_limited";
    status = rateLimited ? "rate_limited" : "error";
    errorMessage = message;
    await markProvider(providerId, {
      last_error: message,
      unhealthy_until: new Date(
        Date.now() + (rateLimited ? 30 : 15) * 60 * 1000,
      ).toISOString(),
    });
  }

  if (status === "ok") {
    const existing = (await listRecentForDedup()) as ExistingArticle[];
    const pending: Array<Record<string, unknown>> = [];

    for (const article of articles) {
      if (
        !isTechRelated(
          article.title,
          article.description,
          article.sourceUrl,
          article.category,
        )
      ) {
        continue;
      }
      const match = findDuplicate(
        {
          title: article.title,
          canonicalUrl: article.canonicalUrl,
          sourceUrl: article.sourceUrl,
          externalId: article.externalId,
          provider: article.provider,
          publishedAt: article.publishedAt,
        },
        existing,
      );
      const sameItem =
        match &&
        match.provider === article.provider &&
        match.external_id === article.externalId;
      if (sameItem) {
        duplicates += 1;
        continue;
      }
      const groupId = match?.duplicate_group_id ?? crypto.randomUUID();
      const groupSize =
        1 + existing.filter((row) => row.duplicate_group_id === groupId).length;
      const recentInGroup = existing.filter(
        (row) =>
          row.duplicate_group_id === groupId && hoursAgo(row.published_at),
      ).length;
      const scores = scoreArticle({
        publishedAt: article.publishedAt,
        sourceDomain: article.sourceDomain,
        country: article.country,
        title: article.title,
        description: article.description,
        independentSources: groupSize,
        recentInGroup,
      });
      const summary = disabledSummariser.enabled
        ? await disabledSummariser.summarise(article)
        : null;
      pending.push({
        external_id: article.externalId,
        provider: article.provider,
        source_name: article.sourceName,
        source_domain: article.sourceDomain,
        source_url: article.sourceUrl,
        canonical_url: article.canonicalUrl || null,
        title: article.title,
        description: article.description,
        content: article.content,
        author: article.author || null,
        image_url: article.imageUrl || null,
        video_url: article.videoUrl || null,
        video_type: article.videoType || null,
        video_thumbnail: article.videoThumbnail || null,
        published_at: article.publishedAt,
        category: article.category,
        country: article.country || null,
        language: article.language,
        tags: article.tags,
        keywords: article.keywords,
        is_breaking: scores.isBreaking,
        relevance_score: scores.relevance,
        freshness_score: scores.freshness,
        engagement_score: scores.engagement,
        duplicate_group_id: groupId,
        status: "visible",
        short_summary: summary?.short_summary || null,
        updated_at: new Date().toISOString(),
      });
      existing.unshift({
        id: "pending",
        title: article.title,
        canonical_url: article.canonicalUrl || null,
        source_url: article.sourceUrl,
        external_id: article.externalId,
        provider: article.provider,
        published_at: article.publishedAt,
        duplicate_group_id: groupId,
      });
    }

    if (pending.length) {
      for (const row of pending) {
        const { error } = await admin
          .from("news_articles")
          .upsert(row, { onConflict: "provider,external_id" });
        if (error) {
          if (/canonical|duplicate|unique/i.test(error.message)) {
            duplicates += 1;
            continue;
          }
          status = "error";
          errorMessage = error.message;
          break;
        }
        accepted += 1;
      }
    }

    if (status === "ok") {
      await markProvider(providerId, {
        last_ok_at: new Date().toISOString(),
        last_error: null,
        unhealthy_until: null,
      });
    }
  }

  const ms = Date.now() - started;
  await admin.from("news_ingestion_logs").insert({
    provider: providerId,
    started_at: new Date(started).toISOString(),
    finished_at: new Date().toISOString(),
    response_time_ms: ms,
    status,
    articles_received: received,
    articles_accepted: accepted,
    duplicates_rejected: duplicates,
    error: errorMessage || null,
  });

  return {
    provider: providerId,
    status,
    received,
    accepted,
    duplicates,
    error: errorMessage,
    ms,
  };
}

export async function ingestDueProviders(forceAll = false) {
  const admin = getSupabaseAdmin();
  const { data: rows } = await admin.from("news_providers").select("*");
  const results: IngestResult[] = [];
  for (const adapter of NEWS_PROVIDERS) {
    const state = rows?.find((row) => row.id === adapter.id);
    if (!forceAll && state?.last_ok_at) {
      const elapsed = Date.now() - Date.parse(state.last_ok_at);
      if (elapsed < adapter.minIntervalMs) {
        results.push({
          provider: adapter.id,
          status: "skipped",
          received: 0,
          accepted: 0,
          duplicates: 0,
          error: "interval",
          ms: 0,
        });
        continue;
      }
    }
    results.push(await ingestProvider(adapter.id));
  }
  return results;
}

const STALE_MS = 55 * 60 * 1000;
let ingestLock: Promise<{ skipped: boolean; results?: IngestResult[] }> | null =
  null;

export async function ingestIfStale(maxAgeMs = STALE_MS) {
  if (ingestLock) return ingestLock;
  ingestLock = (async () => {
    try {
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return { skipped: true };
      }
      const admin = getSupabaseAdmin();
      const { data } = await admin
        .from("news_providers")
        .select("last_ok_at")
        .not("last_ok_at", "is", null)
        .order("last_ok_at", { ascending: false })
        .limit(1);
      const last = data?.[0]?.last_ok_at as string | undefined;
      if (last && Date.now() - Date.parse(last) < maxAgeMs) {
        return { skipped: true };
      }
      const results = await ingestDueProviders(false);
      return { skipped: false, results };
    } catch (err) {
      console.error("[news/ingest] ingestIfStale:", err);
      return { skipped: true, error: err instanceof Error ? err.message : "ingest failed" };
    } finally {
      ingestLock = null;
    }
  })();
  return ingestLock;
}
