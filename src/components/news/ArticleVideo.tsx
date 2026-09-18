"use client";

import { useState } from "react";

/**
 * A video that admits when it cannot play.
 *
 * A `<video>` element pointed at something the browser cannot decode does not
 * fail loudly — it draws a player, a transport, and 00:00, and sits there. The
 * reader is left to work out whether the clip is broken, still loading, or
 * simply silent.
 *
 * The case that pushed this is HLS. Fifty-three clips in the library are
 * `.m3u8` manifests — twenty-six from Deutsche Welle, twenty-two from CBS —
 * and native support for them is uneven: Safari and Edge play them, Chrome and
 * Firefox have no native HLS pipeline and need a JavaScript player. Worse,
 * `canPlayType('application/vnd.apple.mpegurl')` answers "maybe" in Chromium
 * whether or not it can, so asking in advance tells you nothing.
 *
 * So this does not ask in advance. It tries, and when the element reports an
 * error it swaps itself for something honest and useful: what happened, and a
 * link that goes somewhere. That covers a codec the browser lacks, a file the
 * publisher has moved, and a host refusing to serve us — one fallback for all
 * the ways a clip can fail, rather than a feature test for one of them.
 */
export function ArticleVideo({
  src,
  caption,
}: {
  src: string;
  caption?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    const stream = /\.m3u8(\?|$)/i.test(src);
    return (
      <div className="rounded-sm border border-[#e6eaef] bg-[#f9fafb] px-5 py-6 text-center">
        <p className="font-figtree text-[0.95rem] text-[#333333]">
          {stream
            ? "This clip is a live stream this browser cannot play."
            : "This clip could not be loaded."}
        </p>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          // The caption names the clip, so the link says which one it opens
          // rather than making the reader match it to the card above.
          aria-label={caption ? `Open “${caption}” directly` : undefined}
          className="mt-2 inline-block font-figtree text-[0.9rem] font-medium text-[#1e2a5f] underline underline-offset-4"
        >
          Open the video directly
        </a>
        {stream ? (
          <p className="mt-3 font-figtree text-[0.8rem] text-[#64849c]">
            Streams of this kind play in Safari and Edge.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <video
      // A ref callback rather than onError, and this is not a style choice.
      //
      // The element is server-rendered, so the browser has the src and starts
      // fetching it the moment the HTML lands. A clip the browser cannot
      // decode fails in milliseconds — comfortably before hydration attaches
      // any React handler — and `error` does not bubble, so the event is gone
      // by the time onError exists. Measured: the element reached
      // DEMUXER_ERROR_COULD_NOT_PARSE while onError never ran once.
      //
      // So we read the state that persists instead of waiting for the event
      // that has already been missed, and only then listen for a later one.
      ref={(node) => {
        if (!node) return;
        if (node.error) {
          setFailed(true);
          return;
        }
        const onError = () => setFailed(true);
        node.addEventListener("error", onError);
        return () => node.removeEventListener("error", onError);
      }}
      src={src}
      controls
      playsInline
      preload="metadata"
    />
  );
}
