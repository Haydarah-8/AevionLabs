import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isAdminRequest } from "@/lib/admin-auth";
import { deletePost, getPostById, updatePost } from "@/lib/blog/store";

export const dynamic = "force-dynamic";

const inputSchema = z
  .object({
    slug: z.string().optional(),
    title: z.string().optional(),
    excerpt: z.string().optional(),
    category: z.string().optional(),
    sub: z.string().optional(),
    date: z.string().optional(),
    publishedAt: z.string().optional(),
    status: z.enum(["draft", "published"]).optional(),
    featured: z.boolean().optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    author: z.string().optional(),
    content: z.any().optional(),
    html: z.string().optional(),
  })
  .passthrough();

function revalidateBlog(slug?: string) {
  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/news/${slug}`);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ post });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const parsed = inputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const post = await updatePost(id, {
      ...parsed.data,
      content: Array.isArray(parsed.data.content)
        ? parsed.data.content
        : undefined,
    });
    if (!post)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    revalidateBlog(post.slug);
    return NextResponse.json({ post });
  } catch (err) {
    console.error("[admin/posts] update:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to update post",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const existing = await getPostById(id);
  const ok = await deletePost(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  revalidateBlog(existing?.slug);
  return NextResponse.json({ success: true });
}
