import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getSiteSettings, revalidateCms, updateSiteSettings } from "@/lib/cms/store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const settings = await getSiteSettings();
    return NextResponse.json({ settings });
  } catch (err) {
    console.error("[admin/cms/settings]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load settings" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json().catch(() => ({}));
    const settings = await updateSiteSettings(body ?? {});
    revalidateCms();
    return NextResponse.json({ settings });
  } catch (err) {
    console.error("[admin/cms/settings] update:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save settings" },
      { status: 500 },
    );
  }
}
