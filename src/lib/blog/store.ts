import { getAgencyInsightPosts } from "@/lib/blog/agency-posts";
import type {
  ArticleSection,
  BlogListItem,
  BlogPost,
  BlogPostInput,
  BlockNoteBlock,
} from "@/lib/blog/types";
import {
  blocksToHtml,
  emptyDocument,
  isBlockNoteContent,
  legacySectionsToBlocks,
  snapshotBlocks,
} from "@/lib/blog/convert";
import {
  displayDateToIso,
  excerptFromPost,
  isoToDisplayDate,
  newId,
  slugify,
  withHtml,
} from "@/lib/blog/utils";


/**
 * Posts live in Supabase and nowhere else.
 *
 * There used to be a parallel copy in data/blog-posts.json, written on every
 * save. It read back first whenever the database was unavailable, which meant
 * two stores that could disagree with no way to tell which was right — and on
 * a deployed server the file was never there at all, so the behaviour differed
 * between a developer's machine and production.
 */
const MISSING_DB =
  "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set: posts are stored in the database.";

function hasSupabase(): boolean {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

function toListItem(post: BlogPost): BlogListItem {
  const { content: _content, html: _html, ...rest } = post;
  return rest;
}

function contentFromRaw(raw: Record<string, unknown>): BlockNoteBlock[] {
  if (isBlockNoteContent(raw.content) && raw.content.length > 0) {
    return snapshotBlocks(raw.content);
  }
  if (Array.isArray(raw.sections)) {
    return legacySectionsToBlocks(raw.sections as ArticleSection[]);
  }
  return emptyDocument();
}

function normalizePost(raw: Record<string, unknown> | BlogPost): BlogPost {
  const record = raw as Record<string, unknown>;
  const publishedAt =
    String(record.publishedAt || "") ||
    displayDateToIso(String(record.date || ""));
  const { content, html } = withHtml(contentFromRaw(record));
  return {
    id: String(record.id || newId()),
    slug:
      slugify(String(record.slug || record.title || "")) || String(record.id),
    title: String(record.title || "Untitled post"),
    excerpt: String(record.excerpt ?? ""),
    category: String(record.category || "Insights"),
    sub: String(record.sub ?? ""),
    date: String(record.date || isoToDisplayDate(publishedAt)),
    publishedAt: publishedAt.slice(0, 10),
    status: record.status === "published" ? "published" : "draft",
    featured: Boolean(record.featured),
    seoTitle: String(record.seoTitle ?? ""),
    seoDescription: String(record.seoDescription ?? ""),
    author: String(record.author || "Aevion Labs"),
    content,
    html,
    sourceUrl: String(record.sourceUrl || "").trim() || undefined,
    createdAt: String(record.createdAt || new Date().toISOString()),
    updatedAt: String(record.updatedAt || new Date().toISOString()),
  };
}

function sortPosts(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((a, b) => {
    if (a.publishedAt !== b.publishedAt)
      return b.publishedAt.localeCompare(a.publishedAt);
    return b.updatedAt.localeCompare(a.updatedAt);
  });
}

type BlogRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  sub: string;
  date: string;
  published_at: string;
  status: "draft" | "published";
  featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
  author: string | null;
  content?: BlockNoteBlock[] | null;
  html?: string | null;
  source_url?: string | null;
  sections?: ArticleSection[] | null;
  created_at: string;
  updated_at: string;
};

function rowToPost(row: BlogRow): BlogPost {
  return normalizePost({
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? "",
    category: row.category,
    sub: row.sub ?? "",
    date: row.date,
    publishedAt: row.published_at,
    status: row.status,
    featured: row.featured,
    seoTitle: row.seo_title ?? "",
    seoDescription: row.seo_description ?? "",
    author: row.author ?? "Aevion Labs",
    content: row.content ?? [],
    html: row.html ?? "",
    sourceUrl: row.source_url ?? "",
    sections: row.sections ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

function postToRow(post: BlogPost) {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    category: post.category,
    sub: post.sub,
    date: post.date,
    published_at: String(post.publishedAt || "").slice(0, 10),
    status: post.status,
    featured: post.featured,
    seo_title: post.seoTitle,
    seo_description: post.seoDescription,
    author: post.author,
    content: post.content,
    html: post.html,
    source_url: post.sourceUrl || null,
    sections: [],
    created_at: post.createdAt,
    updated_at: post.updatedAt,
  };
}

async function readSupabase(): Promise<BlogPost[] | null> {
  if (!hasSupabase()) return null;
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin");
    const { data, error } = await getSupabaseAdmin()
      .from("blog_posts")
      .select("*")
      .order("published_at", { ascending: false });

    if (error) {
      console.error("[blog-store] supabase read:", error.message);
      return null;
    }
    if (!data || data.length === 0) return [];
    return sortPosts((data as BlogRow[]).map(rowToPost));
  } catch (err) {
    console.error("[blog-store] supabase read failed:", err);
    return null;
  }
}

async function writeSupabaseOne(post: BlogPost): Promise<boolean> {
  if (!hasSupabase()) return false;
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin");
    const row = postToRow(post);
    const { error } = await getSupabaseAdmin()
      .from("blog_posts")
      .upsert(row, { onConflict: "id" })
      .select("id")
      .single();
    if (error) {
      console.error("[blog-store] supabase upsert:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[blog-store] supabase write failed:", err);
    return false;
  }
}

async function deleteSupabase(id: string): Promise<void> {
  if (!hasSupabase()) return;
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin");
    const { error } = await getSupabaseAdmin()
      .from("blog_posts")
      .delete()
      .eq("id", id);
    if (error) console.error("[blog-store] supabase delete:", error.message);
  } catch (err) {
    console.error("[blog-store] supabase delete failed:", err);
  }
}

async function writeSupabaseMany(posts: BlogPost[]): Promise<boolean> {
  if (!hasSupabase()) return false;
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin");
    const { error } = await getSupabaseAdmin()
      .from("blog_posts")
      .upsert(posts.map(postToRow), { onConflict: "id" });
    if (error) {
      console.error("[blog-store] supabase upsert many:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[blog-store] supabase write failed:", err);
    return false;
  }
}

async function persistOne(post: BlogPost): Promise<BlogPost> {
  const normalized = normalizePost(post);
  if (!hasSupabase()) throw new Error(MISSING_DB);
  const ok = await writeSupabaseOne(normalized);
  if (!ok) throw new Error("Failed to save post to the database");
  return normalized;
}

async function persist(posts: BlogPost[]): Promise<void> {
  const normalized = sortPosts(posts.map(normalizePost));
  if (!hasSupabase()) throw new Error(MISSING_DB);
  const ok = await writeSupabaseMany(normalized);
  if (!ok) throw new Error("Failed to save post to the database");
}

async function mergeAgencyPosts(posts: BlogPost[]): Promise<BlogPost[]> {
  const extras = getAgencyInsightPosts();
  const bySlug = new Set(posts.map((post) => post.slug));
  const next = [...posts];
  let changed = false;

  for (const post of extras) {
    if (!bySlug.has(post.slug)) {
      next.push(post);
      changed = true;
    }
  }

  for (const post of next) {
    if (post.id.startsWith("seed-") && post.status === "published") {
      post.status = "draft";
      changed = true;
    }
  }

  if (changed && hasSupabase()) {
    try {
      await persist(next);
    } catch (err) {
      console.error("[blog-store] failed to merge insights:", err);
    }
  }

  return sortPosts(next);
}

async function loadPosts(): Promise<BlogPost[]> {
  const fromSupabase = await readSupabase();
  if (fromSupabase !== null) return mergeAgencyPosts(fromSupabase);

  const seeded = sortPosts(getAgencyInsightPosts());
  try {
    await persist(seeded);
  } catch (err) {
    console.error("[blog-store] failed to persist seed:", err);
  }
  return seeded.filter((post) => !post.id.startsWith("seed-") || post.status === "published");
}

function uniqueSlug(
  base: string,
  posts: { id: string; slug: string }[],
  ignoreId?: string,
): string {
  const root = slugify(base) || "post";
  let candidate = root;
  let i = 2;
  const taken = new Set(
    posts.filter((p) => p.id !== ignoreId).map((p) => p.slug),
  );
  while (taken.has(candidate)) {
    candidate = `${root}-${i}`;
    i += 1;
  }
  return candidate;
}

function applyInput(
  current: BlogPost,
  input: BlogPostInput,
  posts: { id: string; slug: string }[],
): BlogPost {
  const nextContent = snapshotBlocks(input.content ?? current.content);
  const rendered = withHtml(nextContent);
  const next: BlogPost = {
    ...current,
    ...input,
    id: current.id,
    content: rendered.content,
    html: rendered.html,
    updatedAt: new Date().toISOString(),
  };

  if (input.publishedAt) {
    next.publishedAt = String(input.publishedAt).slice(0, 10);
    next.date = isoToDisplayDate(next.publishedAt);
  } else if (input.date) {
    next.date = input.date;
    next.publishedAt = displayDateToIso(input.date);
  }

  const slugSource =
    input.slug ?? (input.title && !current.slug ? input.title : next.slug);
  next.slug = uniqueSlug(
    slugSource || next.title || next.id,
    posts,
    current.id,
  );
  next.excerpt = excerptFromPost(next);
  return normalizePost(next);
}

export async function listPosts(): Promise<BlogPost[]> {
  return loadPosts();
}

export async function listPublishedPosts(): Promise<BlogPost[]> {
  return (await loadPosts()).filter((p) => p.status === "published");
}

export async function listPostSummaries(opts?: {
  includeDrafts?: boolean;
}): Promise<BlogListItem[]> {
  const posts = await loadPosts();
  const filtered = opts?.includeDrafts
    ? posts
    : posts.filter((p) => p.status === "published");
  return filtered.map(toListItem);
}

export async function getPostById(id: string): Promise<BlogPost | null> {
  if (hasSupabase()) {
    try {
      const { getSupabaseAdmin } = await import("@/lib/supabase-admin");
      const { data, error } = await getSupabaseAdmin()
        .from("blog_posts")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) {
        console.error("[blog-store] supabase get:", error.message);
      } else if (data) {
        return rowToPost(data as BlogRow);
      }
    } catch (err) {
      console.error("[blog-store] supabase get failed:", err);
    }
  }
  return (await loadPosts()).find((p) => p.id === id) ?? null;
}

export async function getPostBySlug(
  slug: string,
  opts?: { includeDrafts?: boolean },
): Promise<BlogPost | null> {
  const posts = await loadPosts();
  const post = posts.find((p) => p.slug === slug) ?? null;
  if (!post) return null;
  if (!opts?.includeDrafts && post.status !== "published") return null;
  return post;
}

export async function getFeaturedPosts(limit = 3): Promise<BlogPost[]> {
  const published = await listPublishedPosts();
  const featured = published.filter((p) => p.featured);
  const source = featured.length > 0 ? featured : published;
  return source.slice(0, limit);
}

export async function createPost(input: BlogPostInput = {}): Promise<BlogPost> {
  const posts = await loadPosts();
  const now = new Date();
  const publishedAt = input.publishedAt || now.toISOString().slice(0, 10);
  const rendered = withHtml(snapshotBlocks(input.content ?? emptyDocument()));
  const draft: BlogPost = {
    id: newId(),
    slug: "",
    title: input.title?.trim() || "Untitled post",
    excerpt: input.excerpt ?? "",
    category: input.category || "Insights",
    sub: input.sub ?? "",
    date: input.date || isoToDisplayDate(publishedAt),
    publishedAt,
    status: input.status ?? "draft",
    featured: Boolean(input.featured),
    seoTitle: input.seoTitle ?? "",
    seoDescription: input.seoDescription ?? "",
    author: input.author || "Aevion Labs",
    sourceUrl: input.sourceUrl?.trim() || undefined,
    content: rendered.content,
    html: rendered.html,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
  const created = applyInput(draft, input, posts);
  await persistOne(created);
  return created;
}

export async function updatePost(
  id: string,
  input: BlogPostInput,
): Promise<BlogPost | null> {
  const current = await getPostById(id);
  if (!current) return null;
  const posts = await listPostSummaries({ includeDrafts: true });
  const updated = applyInput(current, input, posts);
  return persistOne(updated);
}

export async function deletePost(id: string): Promise<boolean> {
  const posts = await loadPosts();
  const next = posts.filter((p) => p.id !== id);
  if (next.length === posts.length) return false;
  await persist(next);
  await deleteSupabase(id);
  return true;
}

export async function duplicatePost(id: string): Promise<BlogPost | null> {
  const source = await getPostById(id);
  if (!source) return null;
  return createPost({
    title: `${source.title} (copy)`,
    excerpt: source.excerpt,
    category: source.category,
    sub: source.sub,
    date: source.date,
    publishedAt: source.publishedAt,
    status: "draft",
    featured: false,
    seoTitle: source.seoTitle,
    seoDescription: source.seoDescription,
    author: source.author,
    content: snapshotBlocks(source.content).map((block) => ({
      ...block,
      id: newId(),
    })),
  });
}

export async function findPostBySourceUrl(
  sourceUrl: string,
): Promise<BlogPost | null> {
  const url = sourceUrl.trim();
  if (!url) return null;
  if (hasSupabase()) {
    try {
      const { getSupabaseAdmin } = await import("@/lib/supabase-admin");
      const { data, error } = await getSupabaseAdmin()
        .from("blog_posts")
        .select("*")
        .eq("source_url", url)
        .maybeSingle();
      if (!error && data) return rowToPost(data as BlogRow);
    } catch (err) {
      console.error("[blog-store] source_url lookup failed:", err);
    }
  }
  return (await loadPosts()).find((post) => post.sourceUrl === url) ?? null;
}

export async function listImportedSourceUrls(): Promise<string[]> {
  const posts = await listPostSummaries({ includeDrafts: true });
  return posts
    .map((post) => post.sourceUrl)
    .filter((url): url is string => Boolean(url));
}

export { blocksToHtml };
