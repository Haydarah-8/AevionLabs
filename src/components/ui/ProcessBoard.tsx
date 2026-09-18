"use client";

import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { FadeIn, RevealLines } from "@/components/anim/text";
import { EASE } from "@/lib/utils";
import { useHasHover } from "@/components/anim/useIntro";

export type ProcessTile = {
  title: string;
  body: string;
};

export function ProcessBoard({
  kicker = "How we work",
  countLabel,
  heading,
  body,
  steps,
  tone = "light",
  cta,
}: {
  kicker?: string;
  countLabel?: string;
  heading: string;
  body?: string;
  steps: ProcessTile[];
  tone?: "light" | "dark";
  cta?: ReactNode;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const inView = useInView(gridRef, { once: true, margin: "0px 0px -20% 0px" });
  const revealed = useRef(false);
  const [active, setActive] = useState<number | null>(null);
  const hasHover = useHasHover();
  const reduceMotion = useReducedMotion();
  const dark = tone === "dark";

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || !inView || revealed.current) return;
    revealed.current = true;
    const tiles = grid.querySelectorAll<HTMLElement>("[data-process-tile]");
    if (reduceMotion) {
      tiles.forEach((tile) => {
        tile.style.clipPath = "inset(0% 0 0% 0)";
      });
      return;
    }
    tiles.forEach((tile, i) => {
      animate(
        tile,
        { clipPath: ["inset(100% 0 0% 0)", "inset(0% 0 0% 0)"], scale: [1.04, 1] },
        { duration: 1.1, ease: EASE.power4out, delay: i * 0.08 },
      );
    });
  }, [inView, reduceMotion]);

  return (
    <section className={dark ? "bg-black text-white" : "bg-white text-[#111]"}>
      <div className="mx-auto w-full max-w-[var(--section-max)] px-[var(--section-x)] py-[var(--section-y)]">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-current/10 pb-8">
          <div>
            <RevealLines
              className={`m-0 text-[0.6875rem] font-medium uppercase tracking-[0.22em] ${
                dark ? "text-white/45" : "text-[#8a8a8a]"
              }`}
              staggerLines={0}
            >
              {kicker}
            </RevealLines>
            <RevealLines
              as="h2"
              className="mt-6 max-w-[16ch] text-[clamp(2.15rem,4.8vw,3.85rem)] font-normal leading-[1.08] tracking-[-0.04em]"
            >
              {heading}
            </RevealLines>
          </div>
          <p
            className={`m-0 text-[clamp(3rem,8vw,6.5rem)] font-normal leading-none tracking-[-0.06em] ${
              dark ? "text-white/20" : "text-black/10"
            }`}
          >
            {countLabel || `(${String(steps.length).padStart(2, "0")})`}
          </p>
        </div>

        {body ? (
          <FadeIn
            className={`mt-8 max-w-xl text-[1.05rem] font-light leading-[1.75] ${
              dark ? "text-white/65" : "text-[#525252]"
            }`}
          >
            {body}
          </FadeIn>
        ) : null}

        <div
          ref={gridRef}
          className="mt-14 grid gap-3 sm:grid-cols-2 lg:mt-20 lg:grid-cols-5"
        >
          {steps.map((step, index) => (
            <motion.article
              key={step.title}
              data-process-tile
              className={`flex min-h-[18rem] flex-col justify-between overflow-hidden p-6 sm:min-h-[22rem] sm:p-7 ${
                dark ? "bg-white/[0.06]" : "bg-[#f4f4f4]"
              }`}
              style={{ clipPath: reduceMotion ? undefined : "inset(100% 0 0% 0)" }}
              onPointerEnter={hasHover ? () => setActive(index) : undefined}
              onPointerLeave={hasHover ? () => setActive(null) : undefined}
              animate={{
                opacity:
                  active !== null && active !== index ? 0.38 : 1,
              }}
              transition={{ duration: 0.35, ease: EASE.power2out }}
            >
              <p
                className={`m-0 text-[0.6875rem] font-medium tracking-[0.18em] ${
                  dark ? "text-white/45" : "text-[#8a8a8a]"
                }`}
              >
                {String(index + 1).padStart(2, "0")}
              </p>
              <div>
                <h3 className="m-0 text-[1.25rem] font-normal leading-[1.2] tracking-tight">
                  {step.title}
                </h3>
                <p
                  className={`mt-4 text-[0.92rem] font-light leading-[1.65] ${
                    dark ? "text-white/55" : "text-[#525252]"
                  }`}
                >
                  {step.body}
                </p>
              </div>
            </motion.article>
          ))}
        </div>

        {cta ? (
          <div
            className={`mt-10 border-t pt-8 lg:mt-14 lg:pt-10 ${
              dark ? "border-white/15" : "border-black/10"
            }`}
          >
            {cta}
          </div>
        ) : null}
      </div>
    </section>
  );
}
