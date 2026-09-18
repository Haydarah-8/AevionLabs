"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ReadyPreview = {
  sourceUrl: string;
  title: string;
  paragraphs: string[];
  imageUrl?: string;
  /**
   * Resolved from the page during extraction.
   *
   * The article row's own video_url comes from the feed and is usually empty
   * for an outlet video page; the playable source only appears once the page
   * itself has been read. Dropping this field from the type is what stopped
   * outlet video ever reaching the player.
   */
  videoUrl?: string;
  source: string;
  publishedAt: string;
  canonicalUrl: string;
  byline?: string;
};

export type PreviewState =
  | { status: "loading" }
  | { status: "ready"; preview: ReadyPreview }
  | { status: "failed"; reason: string };

/** The preview endpoint accepts 25 urls; smaller batches return sooner. */
const BATCH = 8;

/**
 * Extraction is the slow part of opening a story, so it happens ahead of time
 * rather than on the click. Rows on screen are fetched in small batches in the
 * background and kept in a cache keyed by url, so by the time a story is
 * opened its text is usually already there.
 *
 * Requests are queued one batch at a time — extraction pulls the article from
 * its publisher, and firing every visible row at once would hammer them.
 */
export function usePreviewCache() {
  const cacheRef = useRef(new Map<string, PreviewState>());
  const queueRef = useRef<string[]>([]);
  const runningRef = useRef(false);
  const mountedRef = useRef(true);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const bump = useCallback(() => {
    if (mountedRef.current) setVersion((n) => n + 1);
  }, []);

  const runQueue = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    try {
      while (queueRef.current.length) {
        const batch = queueRef.current.splice(0, BATCH);
        const pending = batch.filter(
          (url) => cacheRef.current.get(url)?.status !== "ready",
        );
        if (!pending.length) continue;

        for (const url of pending) {
          cacheRef.current.set(url, { status: "loading" });
        }
        bump();

        try {
          const res = await fetch("/api/admin/events/preview", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ urls: pending, topic: "all" }),
          });
          const payload = (await res.json()) as {
            ready?: ReadyPreview[];
            failed?: Array<{ url: string; reason: string }>;
            error?: string;
          };
          if (!res.ok) throw new Error(payload.error || "Extraction failed");

          for (const ready of payload.ready ?? []) {
            cacheRef.current.set(ready.sourceUrl, {
              status: "ready",
              preview: ready,
            });
          }
          for (const failure of payload.failed ?? []) {
            cacheRef.current.set(failure.url, {
              status: "failed",
              reason: failure.reason,
            });
          }
          // Anything the endpoint answered for neither way must not be left
          // spinning forever.
          for (const url of pending) {
            if (cacheRef.current.get(url)?.status === "loading") {
              cacheRef.current.set(url, {
                status: "failed",
                reason: "No public text was returned for this article.",
              });
            }
          }
        } catch (err) {
          for (const url of pending) {
            cacheRef.current.set(url, {
              status: "failed",
              reason:
                err instanceof Error ? err.message : "Extraction failed",
            });
          }
        }
        bump();
      }
    } finally {
      runningRef.current = false;
    }
  }, [bump]);

  /** Queue urls for background extraction, nearest-first. */
  const prefetch = useCallback(
    (urls: string[]) => {
      const wanted = urls.filter(
        (url) => url && !cacheRef.current.has(url) && !queueRef.current.includes(url),
      );
      if (!wanted.length) return;
      queueRef.current.push(...wanted);
      void runQueue();
    },
    [runQueue],
  );

  /** Jump a url to the front — used when something is opened before its turn. */
  const prioritise = useCallback(
    (url: string) => {
      if (!url || cacheRef.current.has(url)) return;
      queueRef.current = [url, ...queueRef.current.filter((u) => u !== url)];
      void runQueue();
    },
    [runQueue],
  );

  const get = useCallback(
    (url: string): PreviewState | undefined => cacheRef.current.get(url),
    // version participates so consumers re-read after each batch lands.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version],
  );

  const readyCount = useCallback(() => {
    let n = 0;
    for (const state of cacheRef.current.values()) {
      if (state.status === "ready") n += 1;
    }
    return n;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  return { get, prefetch, prioritise, readyCount, version };
}
