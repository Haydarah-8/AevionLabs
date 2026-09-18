import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { createPost, listPostSummaries } from "@/lib/blog/store";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

function revalidateBlog() {
  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/sitemap.xml");
}

export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const posts = await listPostSummaries({ includeDrafts: true });
  return NextResponse.json({ posts });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json().catch(() => ({}));
    const post = await createPost(body ?? {});
    revalidateBlog();
    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    console.error("[admin/posts] create:", err);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 },
    );
  }
}
