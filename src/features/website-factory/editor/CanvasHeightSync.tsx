"use client";

import { useEffect } from "react";

/**
 * Size the Puck preview iframe to page content, but never shorter than the
 * visible canvas — so the artboard reads as a full frame, not a thin strip.
 * Also locks iframe width to the active device breakpoint for media queries.
 */
export function CanvasHeightSync({ width }: { width?: number }) {
  useEffect(() => {
    const sync = () => {
      const canvas = document.querySelector<HTMLElement>(".ae-canvas");
      const site = document.querySelector<HTMLElement>(".ae-canvas-site");
      const frame = document.querySelector<HTMLIFrameElement>(
        ".ae-canvas-site #preview-frame, .ae-canvas-site iframe[data-rfd-iframe], .ae-canvas-site iframe",
      );
      if (!frame || !site || !canvas) return;

      const deviceWidth =
        width ||
        Number(site.dataset.aeDeviceWidth) ||
        site.getBoundingClientRect().width ||
        1280;

      frame.style.width = `${deviceWidth}px`;
      frame.style.maxWidth = `${deviceWidth}px`;
      frame.setAttribute("width", String(deviceWidth));

      const canvasH = Math.max(canvas.clientHeight - 48, 520);
      let contentH = 0;
      try {
        const doc = frame.contentDocument;
        if (doc?.body) {
          contentH = Math.max(
            doc.body.scrollHeight,
            doc.documentElement?.scrollHeight || 0,
            doc.body.offsetHeight || 0,
          );
        }
      } catch {
        /* not ready */
      }

      const height = Math.max(contentH, canvasH, 520);
      const next = `${height}px`;
      if (frame.style.height !== next) frame.style.height = next;
      if (site.style.minHeight !== next) site.style.minHeight = next;

      const preview = site.querySelector<HTMLElement>("[data-puck-preview]");
      if (preview) {
        if (preview.style.minHeight !== next) preview.style.minHeight = next;
        preview.style.width = `${deviceWidth}px`;
        preview.style.maxWidth = `${deviceWidth}px`;
      }
    };

    sync();
    const timer = window.setInterval(sync, 400);
    window.addEventListener("resize", sync);
    const ro = new ResizeObserver(sync);
    const canvas = document.querySelector(".ae-canvas");
    if (canvas) ro.observe(canvas);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("resize", sync);
      ro.disconnect();
    };
  }, [width]);

  return null;
}
