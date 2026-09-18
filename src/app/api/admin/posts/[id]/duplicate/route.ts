import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminRequest } from "@/lib/admin-auth";
import { duplicatePost } from "@/lib/blog/store";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const post = await duplicatePost(id);
    if (!post)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    revalidatePath("/news");
    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    console.error("[admin/posts] duplicate:", err);
    return NextResponse.json(
      { error: "Failed to duplicate post" },
      { status: 500 },
    );
  }
}
