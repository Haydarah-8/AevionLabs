import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import {
  getProjectBundle,
  updateProject,
} from "@/features/website-factory/services/store";
import { themeSchema } from "@/features/website-factory/services/schemas";
import { z } from "zod";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  name: z.string().trim().min(1).max(160).optional(),
  theme: themeSchema.optional(),
  siteConfig: z
    .object({
      stickyHeader: z.boolean(),
      announcement: z.string(),
      navCta: z.object({ label: z.string(), href: z.string() }),
      footerNote: z.string(),
    })
    .optional(),
  seoConfig: z
    .object({
      title: z.string(),
      description: z.string(),
      ogImage: z.string(),
      robots: z.string(),
    })
    .optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const bundle = await getProjectBundle(id);
    if (!bundle) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(bundle);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load website" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const patch = patchSchema.parse(await request.json());
    await updateProject(id, patch);
    const bundle = await getProjectBundle(id);
    return NextResponse.json(bundle);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update" },
      { status: 400 },
    );
  }
}
