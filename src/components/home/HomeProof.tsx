"use client";

import { motion } from "framer-motion";
import { FadeIn, RevealLines } from "@/components/anim/text";
import { LinkBtn } from "@/components/anim/LinkBtn";
import { EASE } from "@/lib/utils";
import { useHasHover } from "@/components/anim/useIntro";
import { PROOF } from "@/data/copy";
import { useState } from "react";

export function HomeProof() {
  const hasHover = useHasHover();
  const [active, setActive] = useState<number | null>(null);

  return (
    <section id="terms" className="bg-white">
      <div className="mx-auto w-full max-w-[var(--section-max)] px-[var(--section-x)] pt-[clamp(4.5rem,9vw,7.5rem)]">
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
          <RevealLines
            className="m-0 text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-[#8a8a8a]"
            staggerLines={0}
          >
            03 · the terms
          </RevealLines>
          <RevealLines
            className="m-0 text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-[#8a8a8a]"
            staggerLines={0}
          >
            Before the spend
          </RevealLines>
        </div>
        <RevealLines
          as="h2"
          className="mt-8 max-w-[16ch] text-[clamp(2.15rem,4.8vw,3.85rem)] font-normal leading-[1.08] tracking-[-0.04em] text-[#111]"
        >
          The risk comes out before the money does.
        </RevealLines>
      </div>

      <div className="mx-auto mt-12 w-full max-w-[var(--section-max)] px-[var(--section-x)] pb-[clamp(4.5rem,9vw,7.5rem)] lg:mt-16">
        {PROOF.map((item, index) => (
          <FadeIn key={item.n} delay={index * 0.08}>
            <motion.article
              className="group grid items-end gap-4 border-t border-black/10 py-8 sm:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] sm:gap-10 sm:py-10 lg:py-12"
              onPointerEnter={hasHover ? () => setActive(index) : undefined}
              onPointerLeave={hasHover ? () => setActive(null) : undefined}
              animate={{
                opacity: active !== null && active !== index ? 0.28 : 1,
              }}
              transition={{ duration: 0.4, ease: EASE.power2out }}
            >
              <p className="m-0 text-[clamp(4.5rem,12vw,9.5rem)] font-medium leading-[0.78] tracking-[-0.07em] text-[#111]">
                {item.n}
              </p>
              <div className="min-w-0 sm:flex sm:items-end sm:justify-between sm:gap-8 sm:pb-3">
                <div className="min-w-0">
                  <h3 className="m-0 text-[clamp(1.6rem,3vw,2.4rem)] font-normal leading-[1.1] tracking-[-0.03em] text-[#111]">
                    {item.title}
                  </h3>
                  <p className="mt-4 max-w-[34ch] text-[1.05rem] font-light leading-[1.7] text-[#525252]">
                    {item.body}
                  </p>
                </div>
                <p
                  className="mt-4 m-0 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[#8a8a8a] tabular-nums sm:mt-0 sm:mb-1"
                  style={{
                    opacity: active === index ? 1 : 0,
                    transition: "opacity 0.35s ease",
                  }}
                >
                  {item.n} / {String(PROOF.length).padStart(2, "0")}
                </p>
              </div>
            </motion.article>
          </FadeIn>
        ))}
        <div className="flex flex-wrap items-center justify-between gap-6 border-t border-black/10 py-10">
          <p className="m-0 max-w-[28ch] text-[clamp(1.35rem,2.4vw,1.85rem)] font-normal leading-[1.2] tracking-[-0.03em] text-[#111]">
            The rest of the spend waits.
          </p>
          <LinkBtn href="#how-we-work">See the process →</LinkBtn>
        </div>
      </div>
    </section>
  );
}
