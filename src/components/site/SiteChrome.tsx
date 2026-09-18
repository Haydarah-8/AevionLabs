"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { useEffect, type ReactNode } from "react";
import { ContactModalProvider } from "@/components/chrome/ContactModal";
import { CursorProvider } from "@/components/chrome/Cursor";
import { ErrorNetWatch } from "@/components/site/ErrorNetWatch";

function LayoutSync() {
  const lenis = useLenis();

  useEffect(() => {
    document.documentElement.classList.add("lenis-site");
    return () => {
      document.documentElement.classList.remove("lenis-site");
    };
  }, []);

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

export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={{ duration: 1.05, smoothWheel: true }}>
      <ContactModalProvider>
        <LayoutSync />
        <ErrorNetWatch />
        <CursorProvider>{children}</CursorProvider>
      </ContactModalProvider>
    </ReactLenis>
  );
}
