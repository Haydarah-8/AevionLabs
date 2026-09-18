"use client";

import { animate, useInView } from "framer-motion";
import { useEffect, useLayoutEffect, useRef } from "react";
import { EASE } from "@/lib/utils";
import { FadeIn, FlickerChars, RevealLines } from "@/components/anim/text";
import { ImageReveal } from "@/components/anim/image";
import { LinkBtn } from "@/components/anim/LinkBtn";
import { AboutTopSvg } from "@/components/svg/generated";
import { SITE_IMAGES } from "@/lib/images";
import {
  STUDIO_DISPLAY,
  STUDIO_HEADING,
  STUDIO_LEFT,
  STUDIO_RIGHT,
} from "@/data/copy";

const STUDIO_FACTS = [
  { label: "Base", value: "Manchester" },
  { label: "Model", value: "Prototype first" },
  { label: "Ownership", value: "Your repository" },
];

export function HomeAbout() {
  const asteriskRef = useRef<HTMLDivElement>(null);
  const inView = useInView(asteriskRef, {
    once: true,
    margin: "0px 0px -40% 0px",
  });
  const played = useRef(false);

  useLayoutEffect(() => {
    const svg = asteriskRef.current?.querySelector("svg");
    if (svg) svg.style.transform = "translateY(-120%)";
  }, []);

  useEffect(() => {
    const wrap = asteriskRef.current;
    if (!wrap || !inView || played.current) return;
    played.current = true;
    const svg = wrap.querySelector("svg");
    if (!svg) return;
    animate(
      svg,
      { transform: ["translateY(-120%)", "translateY(0%)"] },
      { duration: 1, delay: 0.35, ease: EASE.power4out },
    );
  }, [inView]);

  return (
    <section
      id="studio"
      className="relative z-[2] overflow-x-clip bg-[#f6f6f6]"
    >
      <div className="mx-auto w-full max-w-[var(--section-max)] px-[var(--section-x)] pt-[clamp(4.5rem,9vw,7.5rem)]">
        <RevealLines
          className="m-0 text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-[#8a8a8a]"
          staggerLines={0}
        >
          02 · the studio
        </RevealLines>
        <div className="mt-8 flex items-end gap-5 sm:gap-8">
          <div
            ref={asteriskRef}
            className="mb-1 h-[clamp(2.75rem,6vw,5.5rem)] w-[clamp(2.2rem,4.8vw,4.4rem)] shrink-0 overflow-hidden text-[#111] [&_svg]:h-full [&_svg]:w-full"
          >
            <AboutTopSvg />
          </div>
          <FlickerChars
            className="m-0 text-[clamp(2.6rem,8vw,6.4rem)] font-medium leading-[0.88] tracking-[-0.04em] text-[#111]"
            spread={1.15}
          >
            {STUDIO_DISPLAY}
          </FlickerChars>
        </div>
        <FadeIn className="mt-12 grid max-w-[44rem] grid-cols-2 gap-x-8 gap-y-6 border-t border-black/10 pt-8 sm:grid-cols-3">
          {STUDIO_FACTS.map((fact) => (
            <div key={fact.label}>
              <p className="m-0 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[#8a8a8a]">
                {fact.label}
              </p>
              <p className="mt-2 m-0 text-[1.05rem] font-normal tracking-tight text-[#111]">
                {fact.value}
              </p>
            </div>
          ))}
        </FadeIn>
      </div>

      <div className="mx-auto grid w-full max-w-[var(--section-max)] items-end gap-10 px-[var(--section-x)] pt-[clamp(2.5rem,5vw,4rem)] pb-[clamp(4.5rem,9vw,7.5rem)] lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-16">
        <div className="min-w-0 lg:pb-10">
          <RevealLines
            as="h2"
            className="max-w-[13ch] text-[clamp(2.15rem,4.4vw,3.6rem)] font-normal leading-[1.06] tracking-[-0.04em] text-[#111]"
          >
            {STUDIO_HEADING}
          </RevealLines>
          <FadeIn className="mt-10">
            <p className="site-body m-0 max-w-[38ch]">{STUDIO_LEFT}</p>
            <p className="site-body mt-6 max-w-[38ch]">{STUDIO_RIGHT}</p>
            <div className="mt-10">
              <LinkBtn href="/about">Get to know us →</LinkBtn>
            </div>
          </FadeIn>
        </div>

        <ImageReveal
          className="aspect-[4/5] w-full overflow-hidden bg-[#ececec] lg:-mt-24 lg:aspect-[4/5]"
          imgClassName="h-[125%] w-full object-cover"
          src={SITE_IMAGES.homeAbout.src}
          alt={SITE_IMAGES.homeAbout.alt}
          parallax
        />
      </div>
    </section>
  );
}
