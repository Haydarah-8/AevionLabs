"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { safeVideoPlayback } from "@/lib/news/media";

/**
 * Whether this browser can play an HLS playlist by itself.
 *
 * Safari can; Chrome and Firefox cannot without a JavaScript player. Rather
 * than ship one, an unplayable stream is offered as a link — a dead player
 * with a spinning wheel is worse than an honest button.
 *
 * Probed once and cached: it cannot change while the page is open, and
 * creating an element per render to ask the same question would be waste.
 */
let hlsCapability: boolean | undefined;

function canPlayHlsNatively(): boolean {
  if (typeof document === "undefined") return false;
  if (hlsCapability === undefined) {
    const probe = document.createElement("video");
    hlsCapability = Boolean(
      probe.canPlayType("application/vnd.apple.mpegurl") ||
        probe.canPlayType("application/x-mpegURL"),
    );
  }
  return hlsCapability;
}

/** Never fires: the answer is fixed for the life of the page. */
const subscribeToNothing = () => () => {};

export function AdminVideo({
  url,
  className = "",
  /** Shown behind the video until it can paint a frame. */
  poster,
}: {
  url?: string | null;
  className?: string;
  poster?: string;
}) {
  const playback = safeVideoPlayback(url);
  const [failed, setFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  /**
   * A browser capability the server cannot know.
   *
   * useSyncExternalStore rather than an effect: the server snapshot is false,
   * so the first paint matches on both sides and React swaps in the real
   * answer without a cascading render.
   */
  const hlsNative = useSyncExternalStore(
    subscribeToNothing,
    canPlayHlsNatively,
    () => false,
  );

  if (!playback) return null;

  const frame = `aspect-video w-full overflow-hidden bg-black ${className}`;

  if (playback.type === "embed") {
    return (
      <div className={frame} onClick={(event) => event.stopPropagation()}>
        <iframe
          src={playback.src}
          title="Video"
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  const unplayable = failed || (playback.type === "hls" && !hlsNative);

  if (unplayable) {
    return (
      <div
        className={`${frame} flex flex-col items-center justify-center gap-3 px-6 text-center`}
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-[0.7rem] text-[#737373]">
          {playback.type === "hls"
            ? "This outlet streams over HLS, which this browser cannot play"
            : "This video could not be loaded"}
        </p>
        <a
          href={playback.src}
          target="_blank"
          rel="noreferrer"
          className="text-[0.7rem] font-semibold text-[#ffffff] transition-colors hover:text-black"
        >
          Open the stream →
        </a>
      </div>
    );
  }

  return (
    <div className={frame} onClick={(event) => event.stopPropagation()}>
      <video
        ref={videoRef}
        src={playback.src}
        poster={poster}
        controls
        playsInline
        preload="metadata"
        onError={() => setFailed(true)}
        className="h-full w-full"
      />
    </div>
  );
}
