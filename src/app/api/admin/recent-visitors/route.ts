import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { readVisitors } from "@/lib/tracker-store";
import { buildAllProfiles, type VisitorProfile } from "@/lib/visitors/profile";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * How far back the panel reads.
 *
 * Profiles are built from raw page views, so this is a view budget rather than
 * a visitor count — a handful of returning readers can account for hundreds of
 * rows. Bounded because this is a glance, not the Audit Stream.
 */
const RECORD_LIMIT = 4000;
const PROFILE_LIMIT = 60;

const CACHE_TTL_MS = 30 * 1000;
let CACHE: { at: number; payload: RecentVisitorsPayload } | null = null;

export type RecentVisitorsPayload = {
  generatedAt: string;
  /** Whole profiles, most recently seen first. */
  visitors: VisitorProfile[];
  totals: {
    visitors: number;
    views: number;
    returning: number;
    /** Seen within the last hour. */
    active: number;
    countries: number;
  };
};

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
    const all = await readVisitors();
    // The tail is the recent end: records are appended as they arrive.
    const recent = all.slice(-RECORD_LIMIT);

    const profiles = buildAllProfiles(recent)
      .sort((a, b) => b.lastSeen.localeCompare(a.lastSeen))
      .slice(0, PROFILE_LIMIT);

    const hourAgo = Date.now() - 60 * 60 * 1000;
    const countries = new Set<string>();
    for (const profile of profiles) {
      const country = profile.latest.location?.country;
      if (country) countries.add(country);
    }

    const payload: RecentVisitorsPayload = {
      generatedAt: new Date().toISOString(),
      visitors: profiles,
      totals: {
        visitors: profiles.length,
        views: profiles.reduce((sum, profile) => sum + profile.views, 0),
        returning: profiles.filter((profile) => profile.returns > 0).length,
        active: profiles.filter(
          (profile) => Date.parse(profile.lastSeen) >= hourAgo,
        ).length,
        countries: countries.size,
      },
    };

    CACHE = { at: Date.now(), payload };
    return NextResponse.json(payload);
  } catch (err) {
    console.error("[admin/recent-visitors]", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to read visitors",
      },
      { status: 500 },
    );
  }
}
