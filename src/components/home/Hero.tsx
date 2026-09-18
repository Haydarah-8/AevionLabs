"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion, type MotionValue } from "framer-motion";
import { LogoMarquee } from "@/components/home/ClientLogos";
import { TalkTrigger } from "@/components/site/TalkTrigger";
import { EASE } from "@/lib/utils";
import {
  HERO_BODY,
  HERO_CTA_HREF,
  HERO_CTA_LABEL,
  HERO_HEADLINE,
  HERO_KICKER,
  HERO_SECONDARY_HREF,
  HERO_SECONDARY_LABEL,
  HERO_SLIDES,
} from "@/data/copy";

const HOLD_MS = 6400;
const BLEND = {
  duration: 1.45,
  ease: EASE.power2inOut,
};

const headlineClass =
  "text-[clamp(2.15rem,8.2vw,6rem)] font-normal leading-[1.05] tracking-[-0.04em]";
const bodyClass =
  "mx-auto mt-6 max-w-[36rem] text-[1rem] font-light leading-[1.7] text-white/80 sm:mt-10 sm:text-[1.1875rem]";

function isTalkHref(href?: string) {
  return !href || href === "#talk" || href === "/about";
}

function linesOf(headline: string) {
  return headline.split("\n").filter(Boolean);
}

function HeroCopy({ headline, body }: { headline: string; body: string }) {
  const reduceMotion = useReducedMotion();
  const inDeck = HERO_SLIDES.some((slide) => slide.headline === headline);
  const slides = inDeck ? HERO_SLIDES : [{ headline, body: body || HERO_BODY }];
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const rotating = slides.length > 1 && !reduceMotion;
  const current = slides[index] ?? slides[0];

  useEffect(() => {
    if (!rotating || paused) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      setIndex((value) => (value + 1) % slides.length);
    }, HOLD_MS);
    return () => window.clearInterval(id);
  }, [index, paused, rotating, slides.length]);

  return (
    <div
      className={`hero-copy w-full${paused ? " is-paused" : ""}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setPaused(false);
        }
      }}
    >
      <h1 className="sr-only">{current.headline.replace(/\n/g, " ")}</h1>

      <div className="relative isolate grid w-full" aria-hidden>
        {slides.map((item) => (
          <div
            key={`sizer-${item.headline}`}
            className="invisible col-start-1 row-start-1"
          >
            <div className={headlineClass}>
              {linesOf(item.headline).map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </div>
            <p className={bodyClass}>{item.body}</p>
          </div>
        ))}

        {slides.map((item, itemIndex) => {
          const on = itemIndex === index;
          return (
            <motion.div
              key={item.headline}
              className="hero-copy-layer col-start-1 row-start-1"
              style={{
                zIndex: on ? 2 : 1,
                pointerEvents: on ? "auto" : "none",
              }}
            >
              <div className={headlineClass}>
                {linesOf(item.headline).map((line, lineIndex) => (
                  <motion.span
                    key={line}
                    className="block will-change-[filter,opacity]"
                    initial={false}
                    animate={{
                      filter: reduceMotion || on ? "blur(0px)" : "blur(18px)",
                      opacity: on ? 1 : 0,
                    }}
                    transition={{
                      ...BLEND,
                      delay: rotating && on ? lineIndex * 0.08 : 0,
                    }}
                  >
                    {line}
                  </motion.span>
                ))}
              </div>
              <motion.p
                className={`${bodyClass} will-change-[filter,opacity]`}
                initial={false}
                animate={{
                  opacity: on ? 1 : 0,
                  filter: reduceMotion || on ? "blur(0px)" : "blur(12px)",
                }}
                transition={{
                  ...BLEND,
                  delay: rotating && on ? 0.14 : 0,
                }}
              >
                {item.body}
              </motion.p>
            </motion.div>
          );
        })}
      </div>

      {rotating ? (
        <div className="mt-10 flex items-center justify-center gap-2">
          {slides.map((item, itemIndex) => (
            <button
              key={item.headline}
              type="button"
              aria-label={`Show line ${itemIndex + 1}`}
              aria-current={itemIndex === index ? "true" : undefined}
              className="h-3 w-9 bg-transparent p-0"
              onClick={() => setIndex(itemIndex)}
            >
              <span
                className={`hero-copy-tick${itemIndex === index ? " is-on" : ""}`}
              >
                <span className="hero-copy-tick-fill" />
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function Hero({
  headline = HERO_HEADLINE,
  body = HERO_BODY,
  ctaLabel = HERO_CTA_LABEL,
  ctaHref = HERO_CTA_HREF,
  image = "/images/hero-1.jpg",
  overlayOpacity,
}: {
  headline?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  image?: string;
  overlayOpacity?: MotionValue<number>;
}) {
  const reduceMotion = useReducedMotion();
  const talk = isTalkHref(ctaHref);

  return (
    <section
      id="site-hero"
      className="relative flex min-h-screen flex-col overflow-hidden bg-black text-white"
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${image}')` }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-black/55" aria-hidden />
      {overlayOpacity ? (
        <motion.div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
          aria-hidden
        />
      ) : null}

      <div className="relative z-10 mx-auto flex w-full max-w-[var(--section-max)] flex-1 flex-col items-center justify-center px-[var(--section-x)] pt-[max(6.5rem,env(safe-area-inset-top))] pb-16 text-center sm:pt-32">
        <motion.p
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-5 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-white/55 sm:mb-7 sm:text-[0.6875rem] sm:tracking-[0.22em]"
        >
          {HERO_KICKER}
        </motion.p>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.1, ease: EASE.power2out }}
          className="w-full"
        >
          <HeroCopy headline={headline} body={body} />
        </motion.div>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mt-10 flex w-full max-w-md flex-col items-stretch justify-center gap-3 sm:mt-12 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center"
        >
          {talk ? (
            <TalkTrigger className="site-btn site-btn-light">
              {ctaLabel}
            </TalkTrigger>
          ) : (
            <Link href={ctaHref} className="site-btn site-btn-light text-white">
              {ctaLabel}
            </Link>
          )}
          <Link
            href={HERO_SECONDARY_HREF}
            className="site-btn site-btn-light text-white"
          >
            {HERO_SECONDARY_LABEL}
          </Link>
        </motion.div>
      </div>

      <div className="hero-logo-band relative z-10 w-full">
        <LogoMarquee tone="hero" />
      </div>
    </section>
  );
}
