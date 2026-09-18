import type {
  ArticleSection,
  BlockNoteBlock,
  InlineContent,
} from "@/lib/blog/types";

function newId() {
  return crypto.randomUUID();
}

function cleanText(value: string) {
  return value.replace(/\uFFFC/g, "").replace(/\u00A0/g, " ");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function textContent(text: string, italic = false): InlineContent[] {
  return [
    {
      type: "text",
      text,
      styles: italic ? { italic: true } : {},
    },
  ];
}

function block(
  type: string,
  content: InlineContent[] = [],
  props: Record<string, unknown> = {},
): BlockNoteBlock {
  return {
    id: newId(),
    type,
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
      ...props,
    },
    content,
    children: [],
  };
}

export function emptyDocument(): BlockNoteBlock[] {
  return [block("paragraph")];
}

export function legacySectionsToBlocks(
  sections: ArticleSection[] | undefined | null,
): BlockNoteBlock[] {
  if (!sections?.length) return emptyDocument();
  const blocks: BlockNoteBlock[] = [];

  for (const section of sections) {
    if (section.type === "paragraph") {
      blocks.push(block("paragraph", textContent(section.text || "")));
      continue;
    }
    if (section.type === "h2") {
      blocks.push(
        block("heading", textContent(section.text || ""), { level: 2 }),
      );
      continue;
    }
    if (section.type === "h3") {
      blocks.push(
        block("heading", textContent(section.text || ""), { level: 3 }),
      );
      continue;
    }
    if (section.type === "figure" && section.src) {
      blocks.push({
        id: newId(),
        type: "image",
        props: {
          url: section.src,
          caption: section.caption || section.alt || "",
          name: section.alt || "Image",
          showPreview: true,
          previewWidth: 512,
          textAlignment: "left",
          backgroundColor: "default",
        },
        children: [],
      });
      continue;
    }
    if (section.type === "video" && section.src) {
      blocks.push({
        id: newId(),
        type: "video",
        props: {
          url: section.src,
          caption: section.caption || "",
          name: section.caption || "Video",
          showPreview: true,
          previewWidth: 512,
          textAlignment: "left",
          backgroundColor: "default",
        },
        children: [],
      });
      continue;
    }
    /**
     * An iframe player gets its own block type, because BlockNote's built-in
     * `video` block renders a `<video>` element and a Vimeo or Brightcove
     * player page is a document, not a media file.
     */
    if (section.type === "embed" && section.src) {
      blocks.push({
        id: newId(),
        type: "embed",
        props: {
          url: section.src,
          caption: section.caption || "",
          textAlignment: "left",
          backgroundColor: "default",
        },
        children: [],
      });
      continue;
    }
    if (section.type === "quote") {
      const quote = block("paragraph", textContent(section.text || "", true));
      blocks.push(quote);
      if (section.attribution) {
        blocks.push(
          block("paragraph", textContent(`— ${section.attribution}`, true)),
        );
      }
      continue;
    }
    if (section.type === "list") {
      const kind =
        section.style === "ol" ? "numberedListItem" : "bulletListItem";
      for (const item of section.items.filter(Boolean)) {
        blocks.push(block(kind, textContent(item)));
      }
      continue;
    }
    if (section.type === "link" && section.href) {
      blocks.push(
        block("paragraph", [
          {
            type: "link",
            href: section.href,
            content: textContent(section.label || section.href),
          },
        ]),
      );
      continue;
    }
    if (section.type === "divider") {
      blocks.push(block("paragraph", textContent("")));
    }
  }

  return blocks.length ? blocks : emptyDocument();
}

function isInlineArray(
  nodes: BlockNoteBlock["content"],
): nodes is InlineContent[] {
  return Array.isArray(nodes);
}

function inlineToText(nodes: BlockNoteBlock["content"]): string {
  if (!nodes) return "";
  if (typeof nodes === "string") return cleanText(nodes);
  if (!isInlineArray(nodes)) {
    if (
      nodes &&
      typeof nodes === "object" &&
      "rows" in nodes &&
      Array.isArray((nodes as { rows?: unknown[] }).rows)
    ) {
      return (nodes as { rows: unknown[] }).rows
        .map((row) => cellRowToText(row))
        .join(" ");
    }
    return "";
  }
  return nodes
    .map((node) => {
      if (node.type === "text") return cleanText(node.text);
      if (node.type === "link") return inlineToText(node.content);
      return "";
    })
    .join("");
}

function inlineToHtml(nodes: BlockNoteBlock["content"]): string {
  if (!nodes) return "";
  if (typeof nodes === "string") return escapeHtml(cleanText(nodes));
  if (!isInlineArray(nodes)) return "";
  return nodes
    .map((node) => {
      if (node.type === "text") {
        let html = escapeHtml(cleanText(node.text));
        const styles = node.styles || {};
        if (styles.bold) html = `<strong>${html}</strong>`;
        if (styles.italic) html = `<em>${html}</em>`;
        if (styles.underline) html = `<u>${html}</u>`;
        if (styles.strike) html = `<s>${html}</s>`;
        if (styles.code) html = `<code>${html}</code>`;
        return html;
      }
      if (node.type === "link") {
        const href = escapeHtml(node.href);
        return `<a href="${href}" target="_blank" rel="noopener noreferrer">${inlineToHtml(node.content)}</a>`;
      }
      return "";
    })
    .join("");
}

function cellRowToText(row: unknown): string {
  if (!row || typeof row !== "object") return "";
  const cells = (row as { cells?: unknown[] }).cells;
  if (!Array.isArray(cells)) return "";
  return cells.map((cell) => cellToText(cell)).join(" ");
}

function cellToText(cell: unknown): string {
  if (typeof cell === "string") return cleanText(cell);
  if (Array.isArray(cell)) return inlineToText(cell as InlineContent[]);
  if (cell && typeof cell === "object") {
    const record = cell as Record<string, unknown>;
    if ("content" in record)
      return inlineToText(record.content as BlockNoteBlock["content"]);
    if ("text" in record) return String(record.text || "");
  }
  return "";
}

function cellToHtml(cell: unknown): string {
  if (typeof cell === "string") return escapeHtml(cleanText(cell));
  if (Array.isArray(cell)) {
    if (
      cell.length &&
      typeof cell[0] === "object" &&
      cell[0] &&
      "type" in cell[0]
    ) {
      const first = cell[0] as { type?: string };
      if (first.type && first.type !== "text" && first.type !== "link") {
        return blocksToHtml(cell as BlockNoteBlock[]);
      }
    }
    return inlineToHtml(cell as InlineContent[]);
  }
  if (cell && typeof cell === "object") {
    const record = cell as Record<string, unknown>;
    if (Array.isArray(record.content)) return cellToHtml(record.content);
    if (typeof record.text === "string")
      return escapeHtml(cleanText(record.text));
  }
  return "";
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

function figureHtml(inner: string, caption?: string) {
  const cap = caption?.trim()
    ? `<figcaption>${escapeHtml(caption.trim())}</figcaption>`
    : "";
  return `<figure>${inner}${cap}</figure>`;
}

function mediaToHtml(type: string, props: Record<string, unknown> | undefined) {
  const url = String(props?.url || "");
  if (!url) return "";
  const caption = String(props?.caption || "").trim();
  const alt = escapeHtml(caption || "Image");
  const src = escapeHtml(url);

  if (type === "image") {
    return figureHtml(`<img src="${src}" alt="${alt}" />`, caption);
  }
  if (type === "video") {
    const yt = youtubeId(url);
    if (yt) {
      return figureHtml(
        `<iframe src="https://www.youtube.com/embed/${escapeHtml(yt)}" title="${alt}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`,
        caption,
      );
    }
    const vimeo = vimeoId(url);
    if (vimeo) {
      return figureHtml(
        `<iframe src="https://player.vimeo.com/video/${escapeHtml(vimeo)}" title="${alt}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`,
        caption,
      );
    }
    return figureHtml(
      `<video src="${src}" controls playsinline></video>`,
      caption,
    );
  }
  /**
   * An embed is already a resolved player url — the draft builder ran it
   * through `safeVideoPlayback` before storing it — so it goes straight into
   * an iframe rather than being sniffed for a provider all over again.
   */
  if (type === "embed") {
    return figureHtml(
      `<iframe src="${src}" title="${alt}" loading="lazy" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen></iframe>`,
      caption,
    );
  }
  if (type === "audio") {
    return figureHtml(`<audio src="${src}" controls></audio>`, caption);
  }
  const label = escapeHtml(caption || "Download file");
  return `<p><a href="${src}" target="_blank" rel="noopener noreferrer">${label}</a></p>`;
}

function tableToHtml(item: BlockNoteBlock): string {
  const content = item.content;
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    return "";
  }
  const rows = Array.isArray((content as { rows?: unknown[] }).rows)
    ? (content as { rows: unknown[] }).rows
    : [];
  if (!rows.length) return "";
  const body = rows
    .map((row, index) => {
      const cells = (row as { cells?: unknown[] })?.cells;
      if (!Array.isArray(cells)) return "";
      const tag = index === 0 ? "th" : "td";
      return `<tr>${cells
        .map((cell) => `<${tag}>${cellToHtml(cell)}</${tag}>`)
        .join("")}</tr>`;
    })
    .join("");
  return `<table>${body}</table>`;
}

export function blocksToPlainText(blocks: BlockNoteBlock[]): string {
  const parts: string[] = [];
  for (const item of blocks) {
    if (
      item.type === "image" ||
      item.type === "video" ||
      item.type === "embed" ||
      item.type === "audio" ||
      item.type === "file"
    ) {
      parts.push(String(item.props?.caption || ""));
      continue;
    }
    parts.push(inlineToText(item.content));
    if (item.children?.length) parts.push(blocksToPlainText(item.children));
  }
  return parts.filter(Boolean).join(" ");
}

export function firstImageFromContent(
  blocks: BlockNoteBlock[],
): string | undefined {
  for (const item of blocks) {
    if (item.type === "image") {
      const url = String(item.props?.url || "");
      if (url) return url;
    }
    if (item.children?.length) {
      const nested = firstImageFromContent(item.children);
      if (nested) return nested;
    }
  }
  return undefined;
}

export function blocksToHtml(blocks: BlockNoteBlock[]): string {
  const html: string[] = [];
  let listBuffer: { kind: "ul" | "ol"; items: string[] } | null = null;

  const flushList = () => {
    if (!listBuffer) return;
    const tag = listBuffer.kind;
    html.push(
      `<${tag}>${listBuffer.items.map((item) => `<li>${item}</li>`).join("")}</${tag}>`,
    );
    listBuffer = null;
  };

  for (const item of blocks) {
    const isBullet = item.type === "bulletListItem";
    const isNumbered = item.type === "numberedListItem";
    const isCheck = item.type === "checkListItem";
    if (isBullet || isNumbered || isCheck) {
      const kind = isNumbered ? "ol" : "ul";
      if (!listBuffer || listBuffer.kind !== kind) {
        flushList();
        listBuffer = { kind, items: [] };
      }
      const prefix = isCheck ? (item.props?.checked ? "[x] " : "[ ] ") : "";
      listBuffer.items.push(`${prefix}${inlineToHtml(item.content)}`);
      continue;
    }
    flushList();

    if (item.type === "heading") {
      const inner = inlineToHtml(item.content);
      if (!inner.trim()) continue;
      const level = Math.min(Math.max(Number(item.props?.level || 2), 1), 6);
      html.push(`<h${level}>${inner}</h${level}>`);
      continue;
    }
    if (item.type === "quote") {
      html.push(`<blockquote>${inlineToHtml(item.content)}</blockquote>`);
      if (item.children?.length) html.push(blocksToHtml(item.children));
      continue;
    }
    if (item.type === "toggleListItem") {
      html.push(
        `<details><summary>${inlineToHtml(item.content)}</summary>${
          item.children?.length ? blocksToHtml(item.children) : ""
        }</details>`,
      );
      continue;
    }
    if (
      item.type === "image" ||
      item.type === "video" ||
      item.type === "embed" ||
      item.type === "audio" ||
      item.type === "file"
    ) {
      html.push(mediaToHtml(item.type, item.props));
      continue;
    }
    if (item.type === "table") {
      html.push(tableToHtml(item));
      continue;
    }
    if (item.type === "codeBlock") {
      html.push(`<pre><code>${inlineToHtml(item.content)}</code></pre>`);
      continue;
    }
    if (item.type === "divider" || item.type === "pageBreak") {
      html.push("<hr />");
      continue;
    }
    const inner = inlineToHtml(item.content);
    if (inner.trim()) html.push(`<p>${inner}</p>`);
    if (item.children?.length) html.push(blocksToHtml(item.children));
  }
  flushList();
  return html.join("");
}

export function isBlockNoteContent(value: unknown): value is BlockNoteBlock[] {
  return (
    Array.isArray(value) &&
    (value.length === 0 ||
      (typeof value[0] === "object" && value[0] !== null && "type" in value[0]))
  );
}

export function snapshotBlocks(value: unknown): BlockNoteBlock[] {
  try {
    const cloned = JSON.parse(JSON.stringify(value)) as unknown;
    if (isBlockNoteContent(cloned) && cloned.length > 0) {
      return cloned;
    }
  } catch {
    /* ignore malformed editor snapshots */
  }
  return emptyDocument();
}
