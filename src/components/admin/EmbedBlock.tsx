"use client";

import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";

/**
 * A video that lives inside somebody else's player.
 *
 * BlockNote ships a `video` block and it renders a `<video>` element, which is
 * right for an mp4 and useless for everything else. Most outlet footage is a
 * Vimeo or Brightcove *page*: point a `<video>` at one and the browser
 * downloads HTML, fails to find a media stream in it, and draws an empty
 * transport stuck at 0:00. That is what the desk was seeing — two dead players
 * on a Breaking Defense draft whose Vimeo clips were both perfectly playable.
 *
 * So embeds get their own block, rendering the iframe the player actually
 * needs. The url stored here has already been resolved by `safeVideoPlayback`,
 * so this component does no provider-sniffing of its own; it renders what it
 * is given, or says plainly that it cannot.
 */
export const EmbedBlock = createReactBlockSpec(
  {
    type: "embed",
    propSchema: {
      url: { default: "" as string },
      caption: { default: "" as string },
      textAlignment: {
        default: "left" as const,
        values: ["left", "center", "right", "justify"] as const,
      },
      backgroundColor: { default: "default" as string },
    },
    content: "none",
  },
  {
    render: ({ block }) => {
      const url = String(block.props.url || "");
      const caption = String(block.props.caption || "");

      if (!url) {
        return (
          <div
            className="my-3 rounded-lg border border-dashed border-white/15 px-4 py-6 text-center text-[0.85rem] text-[#737373]"
            data-embed-empty
          >
            No player address on this embed.
          </div>
        );
      }

      return (
        <figure className="my-3" data-embed-url={url}>
          <div className="relative w-full overflow-hidden rounded-lg bg-black/40 pt-[56.25%]">
            <iframe
              src={url}
              title={caption || "Embedded video"}
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              allowFullScreen
            />
          </div>
          {caption ? (
            <figcaption className="mt-2 text-[0.82rem] text-[#737373]">
              {caption}
            </figcaption>
          ) : null}
        </figure>
      );
    },
    /**
     * What lands in the published article. Kept in step with `mediaToHtml`,
     * which produces the same markup when the document is saved.
     */
    toExternalHTML: ({ block }) => {
      const url = String(block.props.url || "");
      const caption = String(block.props.caption || "");
      if (!url) return <figure />;
      return (
        <figure>
          <iframe
            src={url}
            title={caption || "Embedded video"}
            loading="lazy"
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
          />
          {caption ? <figcaption>{caption}</figcaption> : null}
        </figure>
      );
    },
  },
);

/**
 * The editor's schema: everything BlockNote gives us, plus the embed.
 *
 * Defined once and shared, because a document written under one schema and
 * opened under another loses the blocks the second one does not know about.
 */
export const editorSchema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    // createReactBlockSpec returns a factory; the schema wants the spec.
    embed: EmbedBlock(),
  },
});
