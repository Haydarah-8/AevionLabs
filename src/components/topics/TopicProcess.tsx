"use client";

import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { FadeIn, RevealLines } from "@/components/anim/text";
import { useHasHover } from "@/components/anim/useIntro";
import { TalkLinkBtn } from "@/components/site/TalkTrigger";
import { EASE } from "@/lib/utils";
import type { TopicPoint } from "@/data/topics/types";

export function TopicProcess({
  kicker,
  heading,
  body,
  steps,
  talkLabel,
}: {
  kicker: string;
  heading: string;
  body: string;
  steps: TopicPoint[];
  talkLabel: string;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const inView = useInView(listRef, { once: true, margin: "0px 0px -20% 0px" });
  const reduceMotion = useReducedMotion();
  const hasHover = useHasHover();
  const [active, setActive] = useState<number | null>(null);
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 75%", "end 75%"],
  });
  const fillHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      id="engagement"
      className="scroll-mt-24 bg-white"
    >
      <div className="mx-auto grid w-full max-w-[var(--section-max)] gap-12 px-[var(--section-x)] py-[clamp(4.5rem,9vw,7.5rem)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <RevealLines
            className="m-0 text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-[#8a8a8a]"
            staggerLines={0}
          >
            {kicker}
          </RevealLines>
          <RevealLines
            as="h2"
            className="mt-8 max-w-[14ch] text-[clamp(2.15rem,4.8vw,3.85rem)] font-normal leading-[1.08] tracking-[-0.04em] text-[#111]"
          >
            {heading}
          </RevealLines>
          <FadeIn className="site-body mt-8 max-w-[38ch]">{body}</FadeIn>
          <div className="mt-10">
            <TalkLinkBtn>{talkLabel}</TalkLinkBtn>
          </div>
        </div>

        <div ref={listRef} className="relative">
          <span
            className="pointer-events-none absolute top-3 bottom-3 left-[0.7rem] w-px bg-black/10 sm:left-[0.85rem]"
            aria-hidden
          />
          <motion.span
            className="pointer-events-none absolute top-3 left-[0.7rem] w-px origin-top sm:left-[0.85rem]"
            style={{
              height: reduceMotion ? "100%" : fillHeight,
              background: "var(--topic-color, #111)",
            }}
            aria-hidden
          />
          <ol className="relative m-0 list-none p-0">
            {steps.map((step, index) => (
              <motion.li
                key={step.title}
                className="relative grid grid-cols-[1.6rem_minmax(0,1fr)] gap-5 pb-10 last:pb-0 sm:grid-cols-[2rem_minmax(0,1fr)] sm:gap-7 sm:pb-12"
                initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                animate={
                  inView || reduceMotion
                    ? {
                        opacity: active !== null && active !== index ? 0.35 : 1,
                        y: 0,
                      }
                    : undefined
                }
                transition={{
                  duration: 0.7,
                  delay: reduceMotion ? 0 : index * 0.08,
                  ease: EASE.power4out,
                }}
                onPointerEnter={hasHover ? () => setActive(index) : undefined}
                onPointerLeave={hasHover ? () => setActive(null) : undefined}
              >
                  <span className="relative z-[1] mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[0.65rem] font-medium tracking-[0.08em] text-[#111] ring-1 ring-black/15 sm:h-7 sm:w-7">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <h3 className="m-0 text-[1.35rem] font-normal leading-[1.2] tracking-tight text-[#111] sm:text-[1.5rem]">
                    {step.title}
                  </h3>
                  <p className="mt-3 max-w-[42ch] text-[0.98rem] font-light leading-[1.7] text-[#525252]">
                    {step.body}
                  </p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
