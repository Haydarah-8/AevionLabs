import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import {
  buildGallery,
  galleryPlatforms,
  galleryTotals,
  type GalleryTile,
} from "@/lib/news/gallery";
import {
  newsroomKey,
  newsroomMedia,
  type NewsroomItem,
} from "@/lib/news/newsroom";
import { socialPlatformFromUrl } from "@/lib/news/social";
import { shouldExcludeFromAdminFeed } from "@/lib/news/sources/registry";
import { listImportedSourceUrls } from "@/lib/blog/store";
import { listAdminRecentArticles } from "@/lib/news/store";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const STORED_LIMIT = 900;
const CACHE_TTL_MS = 60 * 1000;
let CACHE: { at: number; payload: GalleryPayload } | null = null;

export type GalleryPayload = {
  generatedAt: string;
  tiles: GalleryTile[];
  totals: ReturnType<typeof galleryTotals>;
  platforms: ReturnType<typeof galleryPlatforms>;
  /** Outlets present on the wall, for the filter. */
  outlets: string[];
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

/**
 * The picture wall reads only stored articles — no live feed fetching. Media
 * arrives with the article, so pulling seventy feeds first would add seconds
 * without adding a single tile.
 */
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
    const [rows, importedUrls] = await Promise.all([
      listAdminRecentArticles(STORED_LIMIT).catch(() => [] as StoredRow[]),
      listImportedSourceUrls().catch(() => [] as string[]),
    ]);
    const imported = new Set(importedUrls.map(newsroomKey));
    // The same exclusion the newsroom applies. Without it the wall carries
    // paywalled hosts the rest of the desk deliberately drops — and those are
    // exactly the ones that refuse hotlinks, so most of the tiles were being
    // fetched only to be thrown away by the browser.
    const tiles = buildGallery(
      (rows as StoredRow[])
        .filter((row) => !shouldExcludeFromAdminFeed(row.source_url))
        .map((row) => {
          const item = toItem(row);
          return { ...item, imported: imported.has(item.key) };
        }),
    );

    const payload: GalleryPayload = {
      generatedAt: new Date().toISOString(),
      tiles,
      totals: galleryTotals(tiles),
      platforms: galleryPlatforms(tiles),
      outlets: [...new Set(tiles.map((tile) => tile.source))].sort(),
    };

    CACHE = { at: Date.now(), payload };
    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to build gallery" },
      { status: 500 },
    );
  }
}
