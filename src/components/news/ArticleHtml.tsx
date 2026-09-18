import type { ReactNode } from "react";
import { ArticleVideo } from "@/components/news/ArticleVideo";
import { blocksToHtml } from "@/lib/blog/convert";
import type { BlockNoteBlock, InlineContent } from "@/lib/blog/types";

const WRAP =
  "article-html min-w-0 max-w-full space-y-6 overflow-x-hidden break-words sm:space-y-8 xl:space-y-10 [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-4 [&_audio]:w-full [&_blockquote]:border-l-2 [&_blockquote]:border-black [&_blockquote]:pl-5 [&_blockquote]:italic [&_code]:rounded [&_code]:bg-[#f4f5f7] [&_code]:px-1 [&_details]:rounded-sm [&_details]:border [&_details]:border-[#e6eaef] [&_details]:p-4 [&_figcaption]:mt-3 [&_figcaption]:text-[0.875rem] [&_figcaption]:text-[#434343] [&_figure]:my-8 [&_figure]:overflow-hidden [&_figure]:rounded-sm [&_h2]:text-[1.75rem] [&_h2]:leading-[1.3] [&_h2]:text-black [&_h3]:text-[1.45rem] [&_h3]:text-black [&_iframe]:aspect-video [&_iframe]:h-auto [&_iframe]:w-full [&_img]:block [&_img]:h-auto [&_img]:w-full [&_li]:text-[1.125rem] [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:text-[1.125rem] [&_p]:font-light [&_p]:leading-[1.85] [&_p]:text-[#333333] [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-[#f4f5f7] [&_pre]:p-4 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-[#e6eaef] [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-[#e6eaef] [&_th]:bg-[#f4f5f7] [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_ul]:list-disc [&_ul]:pl-6 [&_video]:h-auto [&_video]:w-full";

function cleanText(value: string) {
  return value.replace(/\uFFFC/g, "").replace(/\u00A0/g, " ");
}

function sanitizeStoredHtml(html: string) {
  return html
    .replace(/\uFFFC/g, "")
    .replace(/\s(?:data-name|data-url)="[^"]*"/gi, "")
    .replace(
      /\salt="[^"]*\.(?:jpe?g|png|gif|webp|svg|avif)(?:\?[^"]*)?"/gi,
      ' alt="Image"',
    )
    .replace(/<p>\s*<\/p>/gi, "")
    .replace(/<img\b([^>]*)>/gi, "<figure><img$1></figure>");
}

function isInlineArray(value: unknown): value is InlineContent[] {
  return Array.isArray(value);
}

function youtubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/,
  );
  return match?.[1] ?? null;
}

function vimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match?.[1] ?? null;
}

function Inline({ nodes }: { nodes: unknown }) {
  if (!nodes) return null;
  if (typeof nodes === "string") return <>{cleanText(nodes)}</>;
  if (!isInlineArray(nodes)) return null;
  return (
    <>
      {nodes.map((node, index) => {
        if (node.type === "text") {
          const text = cleanText(node.text || "");
          if (!text) return null;
          const styles = node.styles || {};
          let inner: ReactNode = text;
          if (styles.code) inner = <code>{inner}</code>;
          if (styles.bold) inner = <strong>{inner}</strong>;
          if (styles.italic) inner = <em>{inner}</em>;
          if (styles.underline) inner = <u>{inner}</u>;
          if (styles.strike) inner = <s>{inner}</s>;
          return <span key={index}>{inner}</span>;
        }
        if (node.type === "link") {
          return (
            <a
              key={index}
              href={node.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Inline nodes={node.content} />
            </a>
          );
        }
        return null;
      })}
    </>
  );
}

function hasVisibleText(nodes: unknown): boolean {
  if (!nodes) return false;
  if (typeof nodes === "string") return Boolean(cleanText(nodes).trim());
  if (!isInlineArray(nodes)) return false;
  return nodes.some((node) => {
    if (node.type === "text") return Boolean(cleanText(node.text || "").trim());
    if (node.type === "link") return hasVisibleText(node.content);
    return false;
  });
}

function Media({
  type,
  props,
}: {
  type: string;
  props?: Record<string, unknown>;
}) {
  const url = String(props?.url || "");
  if (!url) return null;
  const caption = String(props?.caption || "").trim();
  const alt = caption || "Image";

  let media: ReactNode = null;
  if (type === "image") {
    media = (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt={alt} loading="lazy" decoding="async" />
    );
  } else if (type === "video") {
    const yt = youtubeId(url);
    const vimeo = vimeoId(url);
    if (yt) {
      media = (
        <iframe
          src={`https://www.youtube.com/embed/${yt}`}
          title={alt}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    } else if (vimeo) {
      media = (
        <iframe
          src={`https://player.vimeo.com/video/${vimeo}`}
          title={alt}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      );
    } else {
      // Not a plain <video>: a clip the browser cannot decode has to say so
      // rather than sit at 00:00 looking like it is still thinking.
      media = <ArticleVideo src={url} caption={caption} />;
    }
  } else if (type === "embed") {
    /**
     * Already a resolved player url — the draft builder ran it through
     * `safeVideoPlayback` — so it goes straight into the frame rather than
     * being sniffed for a provider a second time.
     */
    media = (
      <iframe
        src={url}
        title={alt}
        loading="lazy"
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        allowFullScreen
      />
    );
  } else if (type === "audio") {
    media = <audio src={url} controls />;
  } else {
    media = (
      <a href={url} target="_blank" rel="noopener noreferrer">
        {caption || "Download file"}
      </a>
    );
  }

  return (
    <figure>
      {media}
      {caption && type !== "file" ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

function cellText(cell: unknown): ReactNode {
  if (typeof cell === "string") return cleanText(cell);
  if (Array.isArray(cell)) {
    if (
      cell[0] &&
      typeof cell[0] === "object" &&
      "type" in cell[0] &&
      (cell[0] as { type?: string }).type !== "text" &&
      (cell[0] as { type?: string }).type !== "link"
    ) {
      return <Blocks blocks={cell as BlockNoteBlock[]} />;
    }
    return <Inline nodes={cell} />;
  }
  if (cell && typeof cell === "object" && "content" in cell) {
    return cellText((cell as { content: unknown }).content);
  }
  return null;
}

function TableBlock({ block }: { block: BlockNoteBlock }) {
  const content = block.content;
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    return null;
  }
  const rows = Array.isArray((content as { rows?: unknown[] }).rows)
    ? (content as { rows: unknown[] }).rows
    : [];
  if (!rows.length) return null;
  return (
    <table>
      <tbody>
        {rows.map((row, rowIndex) => {
          const cells = (row as { cells?: unknown[] })?.cells ?? [];
          const Tag = rowIndex === 0 ? "th" : "td";
          return (
            <tr key={rowIndex}>
              {cells.map((cell, cellIndex) => (
                <Tag key={cellIndex}>{cellText(cell)}</Tag>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function SingleBlock({ block }: { block: BlockNoteBlock }) {
  if (
    block.type === "image" ||
    block.type === "video" ||
    block.type === "embed" ||
    block.type === "audio" ||
    block.type === "file"
  ) {
    return <Media type={block.type} props={block.props} />;
  }
  if (block.type === "heading") {
    const level = Math.min(Math.max(Number(block.props?.level || 2), 1), 6);
    const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    if (!hasVisibleText(block.content)) return null;
    return (
      <Tag>
        <Inline nodes={block.content} />
      </Tag>
    );
  }
  if (block.type === "quote") {
    return (
      <>
        <blockquote>
          <Inline nodes={block.content} />
        </blockquote>
        {block.children?.length ? <Blocks blocks={block.children} /> : null}
      </>
    );
  }
  if (block.type === "toggleListItem") {
    return (
      <details>
        <summary>
          <Inline nodes={block.content} />
        </summary>
        {block.children?.length ? <Blocks blocks={block.children} /> : null}
      </details>
    );
  }
  if (block.type === "table") return <TableBlock block={block} />;
  if (block.type === "codeBlock") {
    return (
      <pre>
        <code>
          <Inline nodes={block.content} />
        </code>
      </pre>
    );
  }
  if (block.type === "divider" || block.type === "pageBreak") return <hr />;
  if (!hasVisibleText(block.content) && !block.children?.length) return null;
  return (
    <>
      {hasVisibleText(block.content) ? (
        <p>
          <Inline nodes={block.content} />
        </p>
      ) : null}
      {block.children?.length ? <Blocks blocks={block.children} /> : null}
    </>
  );
}

function Blocks({ blocks }: { blocks: BlockNoteBlock[] }) {
  const nodes: ReactNode[] = [];
  let list: BlockNoteBlock[] = [];
  let listKind: "ul" | "ol" | null = null;

  const flushList = () => {
    if (!list.length || !listKind) return;
    const Tag = listKind;
    const items = list;
    nodes.push(
      <Tag key={`list-${nodes.length}`}>
        {items.map((item, index) => (
          <li key={item.id || index}>
            {item.type === "checkListItem"
              ? `${item.props?.checked ? "☑ " : "☐ "}`
              : null}
            <Inline nodes={item.content} />
            {item.children?.length ? <Blocks blocks={item.children} /> : null}
          </li>
        ))}
      </Tag>,
    );
    list = [];
    listKind = null;
  };

  blocks.forEach((block, index) => {
    const isBullet = block.type === "bulletListItem";
    const isNumbered = block.type === "numberedListItem";
    const isCheck = block.type === "checkListItem";
    if (isBullet || isNumbered || isCheck) {
      const kind = isNumbered ? "ol" : "ul";
      if (listKind && listKind !== kind) flushList();
      listKind = kind;
      list.push(block);
      return;
    }
    flushList();
    nodes.push(<SingleBlock key={block.id || index} block={block} />);
  });
  flushList();
  return <>{nodes}</>;
}

export function ArticleHtml({
  html,
  content,
}: {
  html?: string;
  content?: BlockNoteBlock[];
}) {
  if (content?.length) {
    return (
      <div className={WRAP}>
        <Blocks blocks={content} />
      </div>
    );
  }

  const markup = sanitizeStoredHtml(html?.trim() || "");
  if (!markup) return null;
  return <div className={WRAP} dangerouslySetInnerHTML={{ __html: markup }} />;
}

export function articleHtmlString(content?: BlockNoteBlock[], html?: string) {
  return content?.length ? blocksToHtml(content) : html?.trim() || "";
}
