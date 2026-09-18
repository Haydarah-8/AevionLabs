"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLenis } from "lenis/react";
import { TalkTrigger } from "@/components/site/TalkTrigger";
import { TypeGame } from "./TypeGame";
import { LostChars, NotFoundMark } from "./LostMark";
import { PAGES, type ErrorKind } from "./copy";
import { DEFAULT_SETTINGS } from "./settings";
import { EASE } from "@/lib/utils";
import "@/app/lost.css";

function reload(kind: ErrorKind) {
  if (kind === "offline") {
    window.location.reload();
    return;
  }
  if (kind === "timeout" && document.referrer) {
    window.location.href = document.referrer;
    return;
  }
  window.location.href = "/";
}

function rise(reduce: boolean | null, delay: number) {
  if (reduce) {
    return {
      initial: { opacity: 1, y: 0 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0 },
    };
  }
  return {
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay, ease: EASE.power4out },
  };
}

const linkItem = {
  hidden: { opacity: 0, y: 12, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: EASE.power3out },
  },
};

export function ChromeError({
  kind,
  talk = false,
}: {
  kind: ErrorKind;
  talk?: boolean;
}) {
  const page = PAGES[kind];
  const is404 = kind === "not-found";
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const lenis = useLenis();

  useEffect(() => {
    document.title = page.documentTitle;
  }, [page.documentTitle]);

  useEffect(() => {
    if (!is404) return;
    const footer = document.getElementById("site-footer");
    if (!footer) return;
    footer.setAttribute("inert", "");
    footer.setAttribute("aria-hidden", "true");
    return () => {
      footer.removeAttribute("inert");
      footer.removeAttribute("aria-hidden");
    };
  }, [is404]);

  useEffect(() => {
    document.documentElement.classList.toggle("is-lost-pop", open);
    if (!open) {
      lenis?.start();
      document.documentElement.style.overflow = "";
      return;
    }
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.classList.remove("is-lost-pop");
      lenis?.start();
      document.documentElement.style.overflow = "";
    };
  }, [lenis, open]);

  return (
    <main id="main" className={is404 ? "lost-page lost-404" : "lost-page"}>
      {is404 ? (
        <NotFoundMark reduce={reduce} />
      ) : (
        <p className="site-kicker">{page.kicker}</p>
      )}
      {is404 ? (
        <LostChars
          text={page.title}
          reduce={reduce}
          delay={2.05}
          className="site-display"
        />
      ) : (
        <motion.h1 className="site-display" {...rise(reduce, 0)}>
          {page.title}
        </motion.h1>
      )}
      <motion.p className="lost-lede" {...rise(reduce, is404 ? 2.48 : 0.08)}>
        {page.body}
      </motion.p>
      <motion.nav
        className="lost-links"
        aria-label="Leave"
        {...(is404 && !reduce
          ? {
              initial: "hidden" as const,
              animate: "show" as const,
              variants: {
                hidden: {},
                show: {
                  transition: { staggerChildren: 0.1, delayChildren: 2.62 },
                },
              },
            }
          : rise(reduce, 0.16))}
      >
        {kind === "offline" || kind === "timeout" || kind === "error" ? (
          <button type="button" onClick={() => reload(kind)}>
            Reload
          </button>
        ) : null}
        <motion.span variants={is404 && !reduce ? linkItem : undefined}>
          <Link href="/">Home</Link>
        </motion.span>
        <motion.span variants={is404 && !reduce ? linkItem : undefined}>
          {talk ? (
            <TalkTrigger>Let&apos;s talk</TalkTrigger>
          ) : (
            <Link href="/talk">Let&apos;s talk</Link>
          )}
        </motion.span>
        {is404 ? (
          <motion.span variants={reduce ? undefined : linkItem}>
            <button type="button" onClick={() => setOpen(true)}>
              Play
            </button>
          </motion.span>
        ) : null}
      </motion.nav>

      {is404 ? (
        <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
          <AnimatePresence>
            {open ? (
              <DialogPrimitive.Portal forceMount>
                <DialogPrimitive.Overlay asChild forceMount>
                  <motion.div
                    className="lost-pop-overlay"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: 1,
                      transition: { duration: 0.375, ease: EASE.power2out },
                    }}
                    exit={{
                      opacity: 0,
                      transition: { duration: 0.3, ease: EASE.power2in },
                    }}
                    onClick={() => setOpen(false)}
                  >
                    <DialogPrimitive.Content
                      asChild
                      forceMount
                      onClick={(event) => event.stopPropagation()}
                    >
                      <motion.div
                        className="lost-pop"
                        initial={{ y: "4%", opacity: 0 }}
                        animate={{
                          y: "0%",
                          opacity: 1,
                          transition: { duration: 0.5, ease: EASE.power4out },
                        }}
                        exit={{
                          y: "4%",
                          opacity: 0,
                          transition: { duration: 0.3, ease: EASE.power2in },
                        }}
                      >
                        <div className="lost-pop-bar">
                          <DialogPrimitive.Title asChild>
                            <p>Type</p>
                          </DialogPrimitive.Title>
                          <DialogPrimitive.Description className="sr-only">
                            Type the sentence before the timer runs out.
                          </DialogPrimitive.Description>
                          <DialogPrimitive.Close asChild>
                            <button type="button">Close</button>
                          </DialogPrimitive.Close>
                        </div>
                        <div className="lost-pop-stage">
                          <TypeGame
                            settings={{ ...DEFAULT_SETTINGS, game: "type" }}
                            ink="#111111"
                            paper="#ffffff"
                            autoStart
                          />
                        </div>
                      </motion.div>
                    </DialogPrimitive.Content>
                  </motion.div>
                </DialogPrimitive.Overlay>
              </DialogPrimitive.Portal>
            ) : null}
          </AnimatePresence>
        </DialogPrimitive.Root>
      ) : null}
    </main>
  );
}

export function LostArcade() {
  return <ChromeError kind="not-found" />;
}
