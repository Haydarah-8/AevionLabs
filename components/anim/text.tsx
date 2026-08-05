"use client";

import { animate, stagger, useInView } from "framer-motion";
import {
  createElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";
import SplitType from "split-type";
import { EASE, cn } from "@/lib/utils";
import { useFontsReady, useIntroToken } from "./useIntro";

const VIEW_MARGIN = "0px 0px -20% 0px" as const; // ≈ ScrollTrigger "top 80%"

type Trigger = "view" | "intro";

function wrapLinesInMask(el: HTMLElement) {
  el.querySelectorAll<HTMLElement>(".split-line").forEach((line) => {
    if (line.parentElement?.classList.contains("split-line-mask")) return;
    const mask = document.createElement("div");
    mask.className = "split-line-mask";
    line.parentElement?.insertBefore(mask, line);
    mask.appendChild(line);
  });
}

export function splitLines(el: HTMLElement) {
  const split = new SplitType(el, { types: "lines", lineClass: "split-line" });
  wrapLinesInMask(el);
  return split;
}

export function splitChars(el: HTMLElement) {
  return new SplitType(el, {
    types: "lines,words,chars",
    lineClass: "split-line",
    wordClass: "split-word",
    charClass: "split-char",
  });
}

/**
 * Masked line reveal - lines slide up from 120%.
 * `staggerLines` 0.1 for headings ("text-md"), 0 for single-line captions ("cpt").
 */
export function RevealLines({
  as = "div",
  className,
  children,
  trigger = "view",
  staggerLines = 0.1,
  delay = 0,
  duration = 1,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  trigger?: Trigger;
  staggerLines?: number;
  delay?: number;
  duration?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const fontsReady = useFontsReady();
  const introToken = useIntroToken();
  const inView = useInView(ref, { once: true, margin: VIEW_MARGIN });
  const [prepared, setPrepared] = useState(false);
  const played = useRef(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !fontsReady || prepared) return;
    splitLines(el);
    el.querySelectorAll<HTMLElement>(".split-line").forEach((l) => {
      l.style.transform = "translateY(120%)";
    });
    el.style.visibility = "visible";
    setPrepared(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontsReady]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !prepared || played.current) return;
    const armed = trigger === "view" ? inView : introToken > 0;
    if (!armed) return;
    played.current = true;
    const lines = el.querySelectorAll<HTMLElement>(".split-line");
    if (!lines.length) return;
    animate(
      lines,
      { transform: ["translateY(120%)", "translateY(0%)"] },
      {
        duration,
        delay: staggerLines > 0 ? stagger(staggerLines, { startDelay: delay }) : delay,
        ease: EASE.power4out,
      }
    );
  }, [prepared, inView, introToken, trigger, delay, duration, staggerLines]);

  return createElement(
    as,
    { ref, className, style: { visibility: "hidden" } },
    children
  );
}

/** Fade + rise reveal used for paragraphs ("text-base"). */
export function FadeIn({
  as = "div",
  className,
  children,
  trigger = "view",
  delay = 0,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  trigger?: Trigger;
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const introToken = useIntroToken();
  const inView = useInView(ref, { once: true, margin: VIEW_MARGIN });
  const played = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || played.current) return;
    const armed = trigger === "view" ? inView : introToken > 0;
    if (!armed) return;
    played.current = true;
    animate(
      el,
      { opacity: [0, 1], transform: ["translateY(0.5em)", "translateY(0em)"] },
      { duration: 1, delay, ease: EASE.power4out }
    );
  }, [inView, introToken, trigger, delay]);

  return createElement(
    as,
    { ref, className, style: { opacity: 0 } },
    children
  );
}

/**
 * Char-level slide reveal used on XL display text -
 * chars rise from 160% with the stagger spread across `spread` seconds.
 */
export function FlickerChars({
  as = "div",
  className,
  children,
  trigger = "view",
  spread = 1,
  delay = 0,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  trigger?: Trigger;
  spread?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const fontsReady = useFontsReady();
  const introToken = useIntroToken();
  const inView = useInView(ref, { once: true, margin: VIEW_MARGIN });
  const [prepared, setPrepared] = useState(false);
  const played = useRef(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !fontsReady || prepared) return;
    splitChars(el);
    wrapLinesInMask(el);
    el.querySelectorAll<HTMLElement>(".split-char").forEach((c) => {
      c.style.transform = "translateY(160%)";
    });
    el.style.visibility = "visible";
    setPrepared(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontsReady]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !prepared || played.current) return;
    const armed = trigger === "view" ? inView : introToken > 0;
    if (!armed) return;
    played.current = true;
    const chars = el.querySelectorAll<HTMLElement>(".split-char");
    if (!chars.length) return;
    animate(
      chars,
      { transform: ["translateY(160%)", "translateY(0%)"] },
      {
        duration: 1,
        delay: stagger(spread / chars.length, { startDelay: delay }),
        ease: EASE.power4out,
      }
    );
  }, [prepared, inView, introToken, trigger, delay, spread]);

  return createElement(
    as,
    { ref, className: cn(className), style: { visibility: "hidden" } },
    children
  );
}
