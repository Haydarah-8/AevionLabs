import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { readVisitors, computeStats } from "@/lib/tracker-store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit") || "500"), 10000);

    const all = await readVisitors();

    // Return most recent visitors (reversed so latest first)
    const latest = all.slice(-limit).reverse();
    const stats = computeStats(all);

    return NextResponse.json({ visitors: latest, stats }, { status: 200 });
  } catch (err) {
    console.error("[visitors] Error:", err);
    return NextResponse.json(
      { visitors: [], stats: null, error: "Failed to read data" },
      { status: 500 }
    );
  }
}
