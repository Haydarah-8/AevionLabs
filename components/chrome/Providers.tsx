"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { useEffect, type ReactNode } from "react";
import { TransitionPanels, TransitionProvider } from "./PageTransition";
import { ContactModalProvider } from "./ContactModal";
import { CursorProvider } from "./Cursor";
import { Loader } from "./Loader";
import { Navbar } from "./Navbar";

/**
 * Both Lenis and Framer's `useScroll` cache layout measurements taken on mount.
 * The page keeps growing afterwards (fonts swapping, images decoding, text
 * being split into lines), which leaves Lenis with a short scroll limit and
 * every scroll-linked animation mapped to stale positions - parallax that
 * never resolves, sections that feel stuck.
 *
 * Re-measure whenever the document height actually changes. Framer has no
 * public remeasure call, but it re-reads layout on window resize, so a
 * synthetic resize event brings every `useScroll` back in sync at once.
 */
function LayoutSync() {
  const lenis = useLenis();

  useEffect(() => {
    (window as unknown as { __lenis?: unknown }).__lenis = lenis;

    let lastHeight = document.documentElement.scrollHeight;
    let timer: ReturnType<typeof setTimeout>;

    const sync = () => {
      lenis?.resize();
      window.dispatchEvent(new Event("resize"));
    };

    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(sync, 120);
    };

    /* height-gated so re-measuring can't feed back into itself */
    const ro = new ResizeObserver(() => {
      const h = document.documentElement.scrollHeight;
      if (h === lastHeight) return;
      lastHeight = h;
      schedule();
    });
    ro.observe(document.body);

    document.fonts?.ready.then(schedule);
    window.addEventListener("load", schedule);

    return () => {
      ro.disconnect();
      clearTimeout(timer);
      window.removeEventListener("load", schedule);
    };
  }, [lenis]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={{ duration: 1.05, smoothWheel: true }}>
      <LayoutSync />
      <TransitionProvider>
        <ContactModalProvider>
          <CursorProvider>
            <Loader />
            <div className="wrapper">
              {/* the contact modal's dark wash (z-index 103, absolute within
                  .wrapper) - styled entirely by the ported stylesheet */}
              <div className="overlay" />
              <div className="page_wrap">
                <Navbar />
                {children}
                <TransitionPanels />
              </div>
            </div>
          </CursorProvider>
        </ContactModalProvider>
      </TransitionProvider>
    </ReactLenis>
  );
}
