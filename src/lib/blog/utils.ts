import type { BlogPost, BlockNoteBlock } from "@/lib/blog/types";
import {
  blocksToHtml,
  blocksToPlainText,
  emptyDocument,
  firstImageFromContent,
} from "@/lib/blog/convert";

export function newId(): string {
  return crypto.randomUUID();
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

/** Convert `MM.DD.YYYY` or `DD.MM.YYYY` display dates to ISO `YYYY-MM-DD`. */
export function displayDateToIso(display: string): string {
  const m = display.trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!m) return new Date().toISOString().slice(0, 10);
  const [, a, b, y] = m;
  if (Number(a) > 12) return `${y}-${b}-${a}`;
  return `${y}-${a}-${b}`;
}

export function isoToDisplayDate(iso: string): string {
  const m = iso.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return iso;
  const [, y, month, day] = m;
  return `${month}.${day}.${y}`;
}

export function excerptFromPost(
  post: Pick<
    BlogPost,
    "excerpt" | "seoDescription" | "content" | "title" | "sub" | "category"
  >,
): string {
  if (post.excerpt.trim()) return post.excerpt.trim();
  if (post.seoDescription.trim()) return post.seoDescription.trim();
  const text = blocksToPlainText(post.content).trim();
  if (text) return text.length > 220 ? `${text.slice(0, 217)}…` : text;
  return `${post.title} — ${post.sub}. ${post.category}.`;
}

export function firstFigureSrc(content: BlockNoteBlock[]): string | undefined {
  return firstImageFromContent(content);
}

export function emptyPost(): BlogPost {
  const now = new Date();
  const publishedAt = now.toISOString().slice(0, 10);
  const content = emptyDocument();
  return {
    id: newId(),
    slug: "",
    title: "",
    excerpt: "",
    category: "Insights",
    sub: "",
    date: isoToDisplayDate(publishedAt),
    publishedAt,
    status: "draft",
    featured: false,
    seoTitle: "",
    seoDescription: "",
    author: "Aevion Labs",
    content,
    html: blocksToHtml(content),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

export function wordCount(post: BlogPost): number {
  const bits = [post.title, post.excerpt, blocksToPlainText(post.content)];
  return bits.join(" ").trim().split(/\s+/).filter(Boolean).length;
}

export function withHtml(content: BlockNoteBlock[]): {
  content: BlockNoteBlock[];
  html: string;
} {
  const next = content.length ? content : emptyDocument();
  return { content: next, html: blocksToHtml(next) };
}
