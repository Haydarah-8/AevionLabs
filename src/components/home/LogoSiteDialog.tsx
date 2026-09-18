"use client";

// Kept for a later in-page preview. Public logos and cards now route to /with and /services.

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "lenis/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import { EASE } from "@/lib/utils";
import { knownFrameBlock } from "@/lib/frame-check";
import { ModalBtnSvg } from "@/components/svg/generated";

export type LogoSite = {
  name: string;
  url: string;
};

type LogoSiteContextValue = {
  openSite: (site: LogoSite) => void;
};

const LogoSiteContext = createContext<LogoSiteContextValue>({
  openSite: () => {},
});

export function useLogoSite() {
  return useContext(LogoSiteContext);
}

function hostLabel(url: string) {
  try {
    return new URL(url).href.replace(/^https?:\/\//, "");
  } catch {
    return url.replace(/^https?:\/\//, "");
  }
}

function inspectFrame(iframe: HTMLIFrameElement) {
  try {
    const href = iframe.contentWindow?.location.href ?? "";
    if (
      !href ||
      href === "about:blank" ||
      href.startsWith(window.location.origin)
    ) {
      return "blocked" as const;
    }
    return "live" as const;
  } catch {
    return "unknown" as const;
  }
}

function shotSrc(url: string) {
  return `/api/site-preview/shot?url=${encodeURIComponent(url)}`;
}

export function LogoSiteProvider({ children }: { children: ReactNode }) {
  const [site, setSite] = useState<LogoSite | null>(null);
  const [frameKey, setFrameKey] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const [live, setLive] = useState(false);
  const [shotFailed, setShotFailed] = useState(false);
  const open = Boolean(site);
  const lenis = useLenis();

  const openSite = useCallback((next: LogoSite) => {
    setLive(false);
    setShotFailed(false);
    setBlocked(knownFrameBlock(next.url));
    setFrameKey((key) => key + 1);
    setSite(next);
  }, []);

  const onFrameLoad = useCallback(
    (event: SyntheticEvent<HTMLIFrameElement>) => {
      const look = inspectFrame(event.currentTarget);
      if (look === "blocked") {
        setBlocked(true);
        return;
      }
      if (look === "live") {
        setLive(true);
        setBlocked(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!site || live || blocked) return;
    const timer = window.setTimeout(() => {
      if (!live) setBlocked(true);
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [site, frameKey, live, blocked]);

  useEffect(() => {
    if (!site || knownFrameBlock(site.url)) return;
    const controller = new AbortController();
    fetch(`/api/site-frame?url=${encodeURIComponent(site.url)}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        const data = (await res.json()) as { blocked?: boolean | null };
        if (controller.signal.aborted || data.blocked == null) return;
        if (data.blocked) setBlocked(true);
        else {
          setLive(true);
          setBlocked(false);
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, [site, frameKey]);

  useEffect(() => {
    if (open) {
      lenis?.stop();
      document.documentElement.style.overflow = "hidden";
    } else {
      lenis?.start();
      document.documentElement.style.overflow = "";
    }
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = "";
    };
  }, [open, lenis]);

  const showShot = Boolean(site && blocked && !live);

  return (
    <LogoSiteContext.Provider value={{ openSite }}>
      {children}
      <DialogPrimitive.Root
        open={open}
        onOpenChange={(next) => {
          if (!next) setSite(null);
        }}
      >
        <AnimatePresence>
          {site && (
            <DialogPrimitive.Portal forceMount>
              <DialogPrimitive.Overlay asChild forceMount>
                <motion.div
                  className="logo-site-overlay"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    transition: { duration: 0.35, ease: EASE.power2out },
                  }}
                  exit={{
                    opacity: 0,
                    transition: { duration: 0.28, ease: EASE.power2in },
                  }}
                  onClick={() => setSite(null)}
                >
                  <DialogPrimitive.Content
                    asChild
                    forceMount
                    onClick={(event) => event.stopPropagation()}
                  >
                    <motion.div
                      className="logo-site-wrap"
                      initial={{ y: "3%", opacity: 0 }}
                      animate={{
                        y: "0%",
                        opacity: 1,
                        transition: { duration: 0.45, ease: EASE.power4out },
                      }}
                      exit={{
                        y: "3%",
                        opacity: 0,
                        transition: { duration: 0.28, ease: EASE.power2in },
                      }}
                    >
                      <div className="logo-site">
                        <div className="logo-site-bar">
                          <div className="logo-site-meta">
                            <DialogPrimitive.Title className="logo-site-name">
                              {site.name}
                            </DialogPrimitive.Title>
                            <DialogPrimitive.Description className="logo-site-url">
                              {hostLabel(site.url)}
                            </DialogPrimitive.Description>
                          </div>
                          <a
                            className="logo-site-open"
                            href={site.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Open official site
                          </a>
                          <DialogPrimitive.Close asChild>
                            <button
                              type="button"
                              className="logo-site-close"
                              aria-label="Close"
                            >
                              <ModalBtnSvg />
                            </button>
                          </DialogPrimitive.Close>
                        </div>
                        <div className="logo-site-frame">
                          {!showShot ? (
                            <iframe
                              key={`${site.url}-${frameKey}`}
                              className="logo-site-iframe"
                              src={site.url}
                              title={`${site.name} official site`}
                              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox"
                              referrerPolicy="no-referrer-when-downgrade"
                              onLoad={onFrameLoad}
                            />
                          ) : null}
                          {showShot ? (
                            <div className="logo-site-placeholder">
                              {!shotFailed ? (
                                // External site shots; next/image would need every host allowlisted.
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  className="logo-site-shot"
                                  src={shotSrc(site.url)}
                                  alt={`${site.name} site`}
                                  onError={() => setShotFailed(true)}
                                />
                              ) : null}
                              <p className="logo-site-shot-label">
                                {site.name}
                              </p>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </motion.div>
                  </DialogPrimitive.Content>
                </motion.div>
              </DialogPrimitive.Overlay>
            </DialogPrimitive.Portal>
          )}
        </AnimatePresence>
      </DialogPrimitive.Root>
    </LogoSiteContext.Provider>
  );
}
