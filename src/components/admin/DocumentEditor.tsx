"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { en } from "@blocknote/core/locales";
import "@blocknote/shadcn/style.css";
import { editorSchema } from "@/components/admin/EmbedBlock";
import type { BlogPost, BlogPostInput } from "@/lib/blog/types";
import { blocksToHtml, snapshotBlocks } from "@/lib/blog/convert";
import { wordCount } from "@/lib/blog/utils";

export function DocumentEditor({ postId }: { postId: string }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(`/api/admin/posts/${postId}`);
        const data = (await res.json()) as { post?: BlogPost; error?: string };
        if (!res.ok) throw new Error(data.error || "Failed to load");
        if (!cancelled) setPost(data.post ?? null);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [postId]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-[0.88rem] text-[#737373]">
        Opening manuscript…
      </div>
    );
  }
  if (error || !post) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-[0.88rem] text-rose-300">{error || "Not found"}</p>
        <Link href="/admin/blog" className="text-[0.8rem] text-[#737373]">
          Back to editorial
        </Link>
      </div>
    );
  }

  return <EditorCanvas key={post.id} post={post} />;
}

function EditorCanvas({ post }: { post: BlogPost }) {
  const router = useRouter();
  const [title, setTitle] = useState(post.title);
  const [meta, setMeta] = useState({
    slug: post.slug,
    excerpt: post.excerpt,
    category: post.category,
    sub: post.sub,
    author: post.author,
    featured: post.featured,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    publishedAt: post.publishedAt.slice(0, 10),
    status: post.status,
  });
  const [inspector, setInspector] = useState(true);
  const [focus, setFocus] = useState(false);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "dirty">(
    "saved",
  );
  const [error, setError] = useState("");
  const timer = useRef<number | null>(null);
  const titleRef = useRef(title);
  const metaRef = useRef(meta);
  const contentRef = useRef(post.content);
  const uploads = useRef(0);
  const skipFirstChange = useRef(true);
  titleRef.current = title;
  metaRef.current = meta;

  const editor = useCreateBlockNote({
    schema: editorSchema,
    dictionary: {
      ...en,
      placeholders: {
        ...en.placeholders,
        default: "Write, or type '/' for commands",
        heading: "Headline",
        emptyDocument: "Begin the briefing",
      },
    },
    trailingBlock: true,
    initialContent: (post.content.length
      ? post.content
      : [
          { type: "paragraph", content: "" },
        ]) as (typeof editorSchema)["PartialBlock"][],
    uploadFile: async (file) => {
      const signRes = await fetch("/api/admin/uploads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: post.id,
          filename: file.name,
          contentType: file.type,
          size: file.size,
        }),
      });
      const signed = (await signRes.json()) as {
        url?: string;
        signedUrl?: string;
        contentType?: string;
        error?: string;
      };
      if (signRes.ok && signed.signedUrl && signed.url) {
        const put = await fetch(signed.signedUrl, {
          method: "PUT",
          headers: {
            "Content-Type":
              signed.contentType || file.type || "application/octet-stream",
          },
          body: file,
        });
        if (put.ok) return signed.url;
      }

      const form = new FormData();
      form.append("file", file);
      form.append("postId", post.id);
      const res = await fetch("/api/admin/uploads", {
        method: "POST",
        body: form,
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(signed.error || data.error || "Upload failed");
      }
      return data.url;
    },
  });

  const persist = useCallback(
    async (status?: "draft" | "published") => {
      if (status) {
        metaRef.current = { ...metaRef.current, status };
      }
      if (uploads.current > 0) {
        await new Promise<void>((resolve) => {
          const started = Date.now();
          const timerId = window.setInterval(() => {
            if (uploads.current === 0 || Date.now() - started > 30000) {
              window.clearInterval(timerId);
              resolve();
            }
          }, 150);
        });
      }
      setSaveState("saving");
      setError("");
      const content = snapshotBlocks(contentRef.current ?? editor.document);
      const payload: BlogPostInput = {
        title: titleRef.current,
        ...metaRef.current,
        publishedAt: String(metaRef.current.publishedAt || "").slice(0, 10),
        status: status ?? metaRef.current.status,
        content,
        html: blocksToHtml(content),
      };
      try {
        const res = await fetch(`/api/admin/posts/${post.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = (await res.json()) as { post?: BlogPost; error?: string };
        if (!res.ok) throw new Error(data.error || "Save failed");
        if (data.post) {
          setMeta((current) => ({
            ...current,
            slug: data.post!.slug,
            status: data.post!.status,
            publishedAt: data.post!.publishedAt.slice(0, 10),
          }));
        }
        setSaveState("saved");
      } catch (err) {
        setSaveState("dirty");
        setError(err instanceof Error ? err.message : "Save failed");
      }
    },
    [editor, post.id],
  );

  const scheduleSave = useCallback(() => {
    setSaveState("dirty");
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      void persist();
    }, 1800);
  }, [persist]);

  useEffect(() => {
    const stopStart = editor.onUploadStart(() => {
      uploads.current += 1;
    });
    const stopEnd = editor.onUploadEnd(() => {
      uploads.current = Math.max(0, uploads.current - 1);
      scheduleSave();
    });
    return () => {
      stopStart();
      stopEnd();
    };
  }, [editor, scheduleSave]);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
      void persist();
    };
  }, [persist]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (timer.current) window.clearTimeout(timer.current);
        void persist();
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === ".") {
        event.preventDefault();
        setInspector((value) => !value);
      }
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "\\"
      ) {
        event.preventDefault();
        setFocus((value) => !value);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [persist]);

  const counts = useMemo(
    () =>
      wordCount({
        ...post,
        title,
        excerpt: meta.excerpt,
        content: snapshotBlocks(editor.document),
      }),
    [editor.document, meta.excerpt, post, title],
  );

  const showInspector = inspector && !focus;

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#0a0a0f]">
      {focus ? null : (
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-black/10 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin/blog")}
              className="text-[0.8rem] text-[#737373] hover:text-black"
            >
              Blog
            </button>
            <span className="text-[#a3a3a3]">/</span>
            <span className="truncate text-[0.8rem] text-[#111]">
              {saveState === "saving"
                ? "Saving"
                : saveState === "dirty"
                  ? "Unsaved"
                  : "Saved"}
            </span>
            <span className="hidden text-[0.8rem] text-[#737373] sm:inline">
              {counts.toLocaleString()} words
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {meta.status === "published" && meta.slug ? (
              <a
                href={`/news/${meta.slug}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg px-3 py-2 text-[0.8rem] text-[#737373] hover:bg-black/[0.05] hover:text-black"
              >
                View
              </a>
            ) : null}
            <button
              type="button"
              onClick={() => setFocus(true)}
              className="rounded-lg px-3 py-2 text-[0.8rem] text-[#737373] hover:bg-black/[0.05] hover:text-black"
            >
              Focus
            </button>
            <button
              type="button"
              onClick={() => setInspector((value) => !value)}
              className="rounded-lg px-3 py-2 text-[0.8rem] text-[#737373] hover:bg-black/[0.05] hover:text-black"
            >
              Inspector
            </button>
            <button
              type="button"
              onClick={() => void persist()}
              className="rounded-lg px-3 py-2 text-[0.8rem] text-[#111] hover:bg-black/[0.05]"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                const next =
                  meta.status === "published" ? "draft" : "published";
                if (timer.current) window.clearTimeout(timer.current);
                setMeta((current) => ({ ...current, status: next }));
                void persist(next);
              }}
              className={`rounded-lg px-3 py-2 text-[0.8rem] ${
                meta.status === "published"
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "bg-[#f6f6f6] text-[#111]"
              }`}
            >
              {meta.status === "published" ? "Unpublish" : "Publish"}
            </button>
          </div>
        </header>
      )}
      {error ? (
        <p className="border-b border-rose-500/20 bg-rose-500/10 px-4 py-2 text-[0.8rem] text-rose-300">
          {error}
        </p>
      ) : null}
      <div className="flex min-h-0 flex-1">
        <div className="min-w-0 flex-1 overflow-y-auto">
          <div
            className={`mx-auto px-6 py-10 ${focus ? "max-w-[760px] pt-16" : "max-w-[820px]"}`}
          >
            {focus ? (
              <button
                type="button"
                onClick={() => setFocus(false)}
                className="mb-8 text-[0.8rem] text-[#737373] hover:text-black"
              >
                Exit focus
              </button>
            ) : (
              <p className="mb-6 text-[0.8rem] text-[#a3a3a3]">
                / blocks · ⌘S save · ⌘. inspector · ⌘\ focus
              </p>
            )}
            <input
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                scheduleSave();
              }}
              placeholder="Untitled"
              className="mb-8 w-full bg-transparent text-4xl font-medium text-[#111] outline-none placeholder:text-[#a3a3a3] sm:text-5xl"
            />
            <BlockNoteView
              editor={editor}
              theme="dark"
              onChange={(ed) => {
                contentRef.current = snapshotBlocks(ed.document);
                if (skipFirstChange.current) {
                  skipFirstChange.current = false;
                  return;
                }
                scheduleSave();
              }}
              className="bn-ewg min-h-[60vh]"
              formattingToolbar
              slashMenu
              sideMenu
              filePanel
              tableHandles
              emojiPicker
            />
          </div>
        </div>
        {showInspector ? (
          <aside className="hidden w-[20rem] shrink-0 overflow-y-auto border-l border-black/10 bg-white p-5 lg:block">
            <p className="text-[0.8rem] text-[#737373]">Document</p>
            <Field label="Slug">
              <input
                value={meta.slug}
                onChange={(event) => {
                  setMeta((current) => ({
                    ...current,
                    slug: event.target.value,
                  }));
                  scheduleSave();
                }}
                className="field"
              />
            </Field>
            <Field label="Category">
              <input
                value={meta.category}
                onChange={(event) => {
                  setMeta((current) => ({
                    ...current,
                    category: event.target.value,
                  }));
                  scheduleSave();
                }}
                className="field"
              />
            </Field>
            <Field label="Desk">
              <input
                value={meta.sub}
                onChange={(event) => {
                  setMeta((current) => ({
                    ...current,
                    sub: event.target.value,
                  }));
                  scheduleSave();
                }}
                className="field"
              />
            </Field>
            <Field label="Author">
              <input
                value={meta.author}
                onChange={(event) => {
                  setMeta((current) => ({
                    ...current,
                    author: event.target.value,
                  }));
                  scheduleSave();
                }}
                className="field"
              />
            </Field>
            <Field label="Publish date">
              <input
                type="date"
                value={meta.publishedAt}
                onChange={(event) => {
                  setMeta((current) => ({
                    ...current,
                    publishedAt: event.target.value,
                  }));
                  scheduleSave();
                }}
                className="field"
              />
            </Field>
            <label className="mt-4 flex items-center justify-between text-[0.7rem] text-[#404040]">
              Featured
              <input
                type="checkbox"
                checked={meta.featured}
                onChange={(event) => {
                  setMeta((current) => ({
                    ...current,
                    featured: event.target.checked,
                  }));
                  scheduleSave();
                }}
                className="accent-[#111]"
              />
            </label>
            <p className="mt-6 text-[0.8rem] text-[#737373]">SEO</p>
            <Field label="SEO title">
              <input
                value={meta.seoTitle}
                onChange={(event) => {
                  setMeta((current) => ({
                    ...current,
                    seoTitle: event.target.value,
                  }));
                  scheduleSave();
                }}
                className="field"
              />
            </Field>
            <Field label="SEO description">
              <textarea
                value={meta.seoDescription}
                onChange={(event) => {
                  setMeta((current) => ({
                    ...current,
                    seoDescription: event.target.value,
                  }));
                  scheduleSave();
                }}
                rows={4}
                className="field resize-none"
              />
            </Field>
            <Field label="Excerpt">
              <textarea
                value={meta.excerpt}
                onChange={(event) => {
                  setMeta((current) => ({
                    ...current,
                    excerpt: event.target.value,
                  }));
                  scheduleSave();
                }}
                rows={4}
                className="field resize-none"
              />
            </Field>
            <p className="mt-6 text-[0.65rem] text-[#737373]">
              {counts.toLocaleString()} words
            </p>
          </aside>
        ) : null}
      </div>
      <style jsx global>{`
        .field {
          margin-top: 0.35rem;
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(17, 17, 17, 0.12);
          background: #ffffff;
          padding: 0.55rem 0.75rem;
          font-size: 0.8rem;
          color: #111;
          outline: none;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="mt-4 block text-[0.8rem] text-[#737373]">
      {label}
      {children}
    </label>
  );
}
