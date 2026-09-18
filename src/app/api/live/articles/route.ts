import { NextRequest, NextResponse } from "next/server";
import { NEWS_CATEGORIES } from "@/lib/news/categories";
import { ingestIfStale } from "@/lib/news/ingestion/run";
import {
  groupArticles,
  listBreaking,
  listVisibleArticles,
} from "@/lib/news/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category") || "All";
  const before = request.nextUrl.searchParams.get("cursor") || undefined;
  const limit = Number(request.nextUrl.searchParams.get("limit") || "60");
  try {
    if (!before) await ingestIfStale();
    const rows = await listVisibleArticles({
      category: category === "All" ? undefined : category,
      before,
      limit: Number.isFinite(limit) ? limit : 60,
    });
    const groups = groupArticles(rows);
    const breaking =
      category === "All" ? groupArticles(await listBreaking(6)) : [];
    const cursor = rows.length ? rows[rows.length - 1].published_at : null;
    return NextResponse.json({
      groups,
      breaking,
      cursor,
      categories: ["All", ...NEWS_CATEGORIES],
    });
  } catch (err) {
    console.error("[live/articles]", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to load live news",
      },
      { status: 500 },
    );
  }
}
