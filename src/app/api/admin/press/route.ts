import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import type { Lean } from "@/lib/news/lean";
import {
  clusterNewsroomItems,
  newsroomKey,
  newsroomMedia,
  type NewsroomItem,
} from "@/lib/news/newsroom";
import {
  buildOutletProfiles,
  mostExclusive,
  mostLoaded,
  summariseByLean,
  type LeanBand,
  type OutletProfile,
} from "@/lib/news/press";
import { coCoverage, hourOfDayProfile, type CoCoverage } from "@/lib/news/signals";
import { socialPlatformFromUrl } from "@/lib/news/social";
import { shouldExcludeFromAdminFeed } from "@/lib/news/sources/registry";
import { listAdminRecentArticles } from "@/lib/news/store";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const STORED_LIMIT = 900;
const CACHE_TTL_MS = 60 * 1000;
let CACHE: { at: number; payload: PressPayload } | null = null;

export type PressPayload = {
  generatedAt: string;
  outlets: OutletProfile[];
  bands: LeanBand[];
  exclusive: OutletProfile[];
  loaded: OutletProfile[];
  coCoverage: CoCoverage;
  /** Publishing rhythm per outlet, 24 UTC hours, for the top outlets. */
  clocks: Array<{ key: string; name: string; hours: number[] }>;
  totals: {
    outlets: number;
    articles: number;
    stories: number;
    stateControlled: number;
    unrated: number;
  };
};

type StoredRow = {
  id: string;
  title: string;
  source_name: string;
  source_id?: string | null;
  category: string;
  published_at: string;
  source_url: string;
  description?: string | null;
  excerpt?: string | null;
  image_url?: string | null;
  video_url?: string | null;
  duplicate_group_id?: string | null;
};

function toItem(row: StoredRow): NewsroomItem {
  const imageUrl = row.image_url || undefined;
  const videoUrl = row.video_url || undefined;
  return {
    key: newsroomKey(row.source_url),
    id: row.id,
    title: row.title,
    snippet: row.excerpt || row.description || "",
    source: row.source_name,
    sourceId: row.source_id || "",
    sourceUrl: row.source_url,
    publishedAt: row.published_at,
    category: row.category || "",
    imageUrl,
    videoUrl,
    platform: socialPlatformFromUrl(row.source_url),
    media: newsroomMedia({ imageUrl, videoUrl }),
    origin: "stored",
    imported: false,
    storyId: row.duplicate_group_id || null,
  };
}

export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (
    request.nextUrl.searchParams.get("fresh") !== "1" &&
    CACHE &&
    Date.now() - CACHE.at < CACHE_TTL_MS
  ) {
    return NextResponse.json(CACHE.payload);
  }

  try {
    const rows = await listAdminRecentArticles(STORED_LIMIT).catch(
      () => [] as StoredRow[],
    );
    // Matches the newsroom: an outlet the desk excludes should not appear in
    // its directory of who the desk reads.
    const items = (rows as StoredRow[])
      .filter((row) => !shouldExcludeFromAdminFeed(row.source_url))
      .map(toItem);
    const clusters = clusterNewsroomItems(items);
    const outlets = buildOutletProfiles(clusters);

    const byOutlet = new Map<string, NewsroomItem[]>();
    for (const item of items) {
      const list = byOutlet.get(item.source);
      if (list) list.push(item);
      else byOutlet.set(item.source, [item]);
    }

    const payload: PressPayload = {
      generatedAt: new Date().toISOString(),
      outlets,
      bands: summariseByLean(outlets),
      exclusive: mostExclusive(outlets),
      loaded: mostLoaded(outlets),
      // One shared story is enough here. On Signals the same measure looks for
      // a repeated *pattern* and so demands two, but this page is a directory:
      // the question is who overlaps with whom at all, and the corpus
      // currently holds few enough multi-outlet stories that requiring two
      // would draw almost nothing.
      coCoverage: coCoverage(clusters, { minShared: 1, limit: 24 }),
      clocks: outlets.slice(0, 6).map((profile) => ({
        key: profile.key,
        name: profile.name,
        hours: hourOfDayProfile(byOutlet.get(profile.name) ?? []),
      })),
      totals: {
        outlets: outlets.length,
        articles: items.length,
        stories: clusters.length,
        stateControlled: outlets.filter((o) => o.stateControlled).length,
        unrated: outlets.filter((o) => o.lean === ("unrated" as Lean)).length,
      },
    };

    CACHE = { at: Date.now(), payload };
    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to build press" },
      { status: 500 },
    );
  }
}
