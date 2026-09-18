export type ArticleSection =
  | { id?: string; type: "paragraph"; text: string }
  | { id?: string; type: "h2"; text: string }
  | { id?: string; type: "h3"; text: string }
  | {
      id?: string;
      type: "figure";
      src: string;
      alt: string;
      caption: string;
      fit?: "cover" | "contain";
    }
  /** A media file the browser can play directly: mp4, webm, an HLS manifest. */
  | { id?: string; type: "video"; src: string; caption?: string }
  /**
   * A player that only exists inside an iframe — Vimeo, Brightcove.
   *
   * Separate from `video` because the difference is not cosmetic: a `<video>`
   * element pointed at a Vimeo player page downloads HTML, fails to decode it
   * and renders an empty transport showing 0:00. Of 705 stored videos, 593 are
   * this kind, so folding them into `video` meant most footage in the library
   * arrived in the editor as a dead player.
   */
  | { id?: string; type: "embed"; src: string; caption?: string }
  | { id?: string; type: "link"; href: string; label: string }
  | { id?: string; type: "quote"; text: string; attribution?: string }
  | { id?: string; type: "list"; style: "ul" | "ol"; items: string[] }
  | { id?: string; type: "divider" }
  | { id?: string; type: "page-break" };

export type InlineContent =
  | { type: "text"; text: string; styles?: Record<string, boolean | string> }
  | { type: "link"; href: string; content: InlineContent[] };

export type BlockNoteBlock = {
  id?: string;
  type: string;
  props?: Record<string, unknown>;
  content?: unknown;
  children?: BlockNoteBlock[];
};

export type BlogStatus = "draft" | "published";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  sub: string;
  /** Site display date, e.g. `03.23.2026` */
  date: string;
  /** ISO calendar date `YYYY-MM-DD` */
  publishedAt: string;
  status: BlogStatus;
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
  author: string;
  content: BlockNoteBlock[];
  html: string;
  sourceUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type BlogPostInput = {
  slug?: string;
  title?: string;
  excerpt?: string;
  category?: string;
  sub?: string;
  date?: string;
  publishedAt?: string;
  status?: BlogStatus;
  featured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  author?: string;
  content?: BlockNoteBlock[];
  html?: string;
  sourceUrl?: string;
};

export type BlogListItem = Omit<BlogPost, "content" | "html">;
