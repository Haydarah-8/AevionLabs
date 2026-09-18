import { NextResponse } from "next/server";
import { getAdminUser, isAdminRequest } from "@/lib/admin-auth";
import { restoreWebsiteVersion } from "@/features/website-factory/application/website";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const user = await getAdminUser();
    const { versionId } = z
      .object({ versionId: z.string().uuid() })
      .parse(await request.json());
    await restoreWebsiteVersion(id, versionId, user?.id ?? null);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Restore failed" },
      { status: 400 },
    );
  }
}
