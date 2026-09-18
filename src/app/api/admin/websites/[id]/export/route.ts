import { NextResponse } from "next/server";
import { getAdminUser, isAdminRequest } from "@/lib/admin-auth";
import { exportWebsiteZip } from "@/features/website-factory/application/deployment";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const user = await getAdminUser();
    const { buffer, filename } = await exportWebsiteZip(id, user?.id ?? null);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("[website-factory] export failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Export failed" },
      { status: 500 },
    );
  }
}
