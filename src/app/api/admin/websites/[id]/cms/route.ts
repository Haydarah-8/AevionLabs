import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import {
  archiveScrapeImport,
  getScrapeImport,
  listScrapeImports,
} from "@/features/website-factory/cms/scrape-cms";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const importId = new URL(request.url).searchParams.get("importId");
  if (importId) {
    const record = await getScrapeImport(importId);
    if (!record) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ import: record });
  }
  const imports = await listScrapeImports(id);
  return NextResponse.json({ imports });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await params;
  const importId = new URL(request.url).searchParams.get("importId");
  if (!importId) {
    return NextResponse.json({ error: "importId required" }, { status: 400 });
  }
  await archiveScrapeImport(importId);
  return NextResponse.json({ ok: true });
}
