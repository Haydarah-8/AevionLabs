"use client";

import { animate } from "framer-motion";
import { useLenis } from "lenis/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { EASE } from "@/lib/utils";
import { IntroContext } from "@/components/anim/useIntro";

type TransitionContextValue = {
  navigate: (href: string) => void;
  transitioning: boolean;
  enabled: boolean;
  panelRef: React.RefObject<HTMLDivElement | null>;
  overlayRef: React.RefObject<HTMLDivElement | null>;
};

const TransitionContext = createContext<TransitionContextValue>({
  navigate: () => {},
  transitioning: false,
  enabled: false,
  panelRef: { current: null },
  overlayRef: { current: null },
});

export function useTransitionNav() {
  return useContext(TransitionContext);
}

export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;

  const panelRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const covering = useRef(false);
  const pendingHref = useRef<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [introToken, setIntroToken] = useState(0);

  const fireIntro = useCallback(() => setIntroToken((t) => t + 1), []);

  /* fresh loads always start at the top (the loader owns the first viewport) */
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  const navigate = useCallback(
    async (href: string) => {
      if (covering.current) return;
      if (href === window.location.pathname) return;
      covering.current = true;
      pendingHref.current = href;
      setTransitioning(true);
      lenisRef.current?.stop();

      const panel = panelRef.current!;
      const overlay = overlayRef.current!;
      panel.style.display = "block";
      overlay.style.display = "block";

      await Promise.all([
        animate(
          panel,
          { transform: ["translateY(100%)", "translateY(0%)"] },
          { duration: 0.625, ease: EASE.power2inOut }
        ),
        animate(overlay, { opacity: [0, 0.8] }, { duration: 0.625, ease: EASE.power2inOut }),
      ]);

      router.push(href);
    },
    [router]
  );

  /* When the new route has rendered beneath the cover, reveal it. */
  useEffect(() => {
    if (!covering.current || pendingHref.current !== pathname) return;
    covering.current = false;
    pendingHref.current = null;

    window.scrollTo(0, 0);
    lenisRef.current?.scrollTo(0, { immediate: true, force: true });

    const panel = panelRef.current!;
    const overlay = overlayRef.current!;
    overlay.style.display = "none";
    overlay.style.opacity = "0";

    const t = setTimeout(() => fireIntro(), 250);

    animate(
      panel,
      { transform: ["translateY(0%)", "translateY(-100%)"] },
      { duration: 0.625, ease: EASE.power2inOut }
    ).then(() => {
      panel.style.display = "none";
      panel.style.transform = "translateY(100%)";
      setTransitioning(false);
      lenisRef.current?.start();
    });

    return () => clearTimeout(t);
  }, [pathname, fireIntro]);

  return (
    <IntroContext.Provider value={{ introToken, fireIntro }}>
      <TransitionContext.Provider
        value={{ navigate, transitioning, enabled: true, panelRef, overlayRef }}
      >
        {children}
      </TransitionContext.Provider>
    </IntroContext.Provider>
  );
}

/**
 * The cover panel + dark wash. Must render INSIDE `.wrapper` (z-index 998),
 * otherwise the page stacks above it and the transition is invisible.
 */
export function TransitionPanels() {
  const { panelRef, overlayRef } = useContext(TransitionContext);
  return (
    <>
      {/* deliberately class-less: the original creates this as an inline-styled
          div at z-index 98. `.overlay` is a different element (z-index 103)
          that belongs to the contact modal. */}
      <div
        ref={overlayRef}
        style={{
          position: "fixed",
          inset: 0,
          background: "#000",
          opacity: 0,
          pointerEvents: "none",
          zIndex: 98,
          display: "none",
        }}
      />
      <div
        ref={panelRef}
        id="page-transition"
        className="page_transition"
        data-page-transition=""
        style={{ display: "none", transform: "translateY(100%)" }}
      />
    </>
  );
}

export function TransitionLink({
  href,
  className,
  children,
  onNavigate,
  ref,
  ...rest
}: {
  href: string;
  className?: string;
  children: ReactNode;
  onNavigate?: () => void;
  ref?: React.Ref<HTMLAnchorElement>;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const { navigate, enabled } = useTransitionNav();
  return (
    <Link
      href={href}
      className={className}
      ref={ref}
      {...rest}
      onClick={(e) => {
        if (!enabled) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        onNavigate?.();
        navigate(href);
      }}
    >
      {children}
    </Link>
  );
}
