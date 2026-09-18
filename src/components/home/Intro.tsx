"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { FadeIn, RevealLines } from "@/components/anim/text";
import { ImageReveal } from "@/components/anim/image";
import { LinkBtn } from "@/components/anim/LinkBtn";
import { IntroMainSvg } from "@/components/svg/generated";
import { SITE_IMAGES } from "@/lib/images";
import {
  AGENCY_HEADING,
  AGENCY_LEFT,
  AGENCY_NOTE,
  AGENCY_RIGHT,
} from "@/data/copy";

type AgencyPoint = { title: string; body: string };

function parsePoints(items?: string[]): AgencyPoint[] {
  if (!items?.length) return [];
  return items
    .map((item) => {
      const [title, ...rest] = item.split("\n");
      return { title: title.trim(), body: rest.join(" ").trim() };
    })
    .filter((point) => point.title);
}

export function Intro({
  kicker = "The agency",
  heading = AGENCY_HEADING,
  left = AGENCY_LEFT,
  right = AGENCY_RIGHT,
  location = "Manchester",
  ctaLabel = "See the studio",
  ctaHref = "/about",
  points,
  note = AGENCY_NOTE,
}: {
  kicker?: string;
  heading?: string;
  left?: string;
  right?: string;
  location?: string;
  ctaLabel?: string;
  ctaHref?: string;
  points?: string[];
  note?: string;
}) {
  const pillars = parsePoints(points);
  const driftRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: driftRef,
    offset: ["start end", "end start"],
  });
  const svgY = useTransform(scrollYProgress, [0, 1], ["8%", "-18%"]);

  return (
    <section
      id="agency"
      ref={driftRef}
      className="relative z-[1] overflow-x-clip bg-white"
    >
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        aria-hidden
        style={{ y: svgY }}
      >
        <div className="absolute top-[18%] right-[-18%] w-[min(58vw,38rem)] opacity-80">
          <IntroMainSvg />
        </div>
      </motion.div>

      <div className="relative z-[1] mx-auto w-full max-w-[var(--section-max)] px-[var(--section-x)] pt-[clamp(4.5rem,9vw,7.5rem)]">
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
          <RevealLines
            className="m-0 text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-[#8a8a8a]"
            staggerLines={0}
          >
            01 · {kicker}
          </RevealLines>
          {location ? (
            <RevealLines
              className="m-0 text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-[#8a8a8a]"
              staggerLines={0}
            >
              {location}
            </RevealLines>
          ) : null}
        </div>
        <RevealLines
          as="h2"
          className="mt-10 max-w-[18ch] whitespace-pre-line text-[clamp(2.7rem,6vw,5.4rem)] font-normal leading-[0.94] tracking-[-0.05em] text-[#111]"
        >
          {heading}
        </RevealLines>
      </div>

      <div className="relative z-[1] mx-auto grid w-full max-w-[var(--section-max)] gap-10 px-[var(--section-x)] pt-[clamp(2.5rem,5vw,4rem)] pb-10 md:grid-cols-2 md:gap-0 lg:pb-14">
        {left ? (
          <FadeIn className="md:pr-12 lg:pr-20">
            <p className="site-body m-0 max-w-[38ch]">{left}</p>
          </FadeIn>
        ) : null}
        <FadeIn
          delay={0.12}
          className="md:border-l md:border-black/10 md:pl-12 lg:pl-20"
        >
          {right ? <p className="site-body m-0 max-w-[38ch]">{right}</p> : null}
          {note ? (
            <p className="mt-8 max-w-[28rem] text-[clamp(1.35rem,2.4vw,2rem)] font-normal leading-[1.2] tracking-[-0.03em] text-[#111] md:hidden">
              {note}
            </p>
          ) : null}
          {ctaLabel ? (
            <div className="mt-8">
              <LinkBtn href={ctaHref}>{ctaLabel} →</LinkBtn>
            </div>
          ) : null}
        </FadeIn>
      </div>

      <div className="relative z-[1] w-full">
        <ImageReveal
          className="aspect-[16/8] w-full overflow-hidden bg-[#f4f4f4] sm:aspect-[2.35/1]"
          imgClassName="h-[125%] w-full object-cover"
          src={SITE_IMAGES.homeIntro.src}
          alt={SITE_IMAGES.homeIntro.alt}
          parallax
        />
        <div className="pointer-events-none absolute inset-x-[var(--section-x)] bottom-6 z-[2] flex items-end justify-between gap-8 lg:bottom-10">
          {note ? (
            <p className="m-0 hidden max-w-[28rem] bg-white px-8 py-7 text-[clamp(1.35rem,2.2vw,1.85rem)] font-normal leading-[1.2] tracking-[-0.03em] text-[#111] md:block">
              {note}
            </p>
          ) : (
            <span />
          )}
          <span className="mb-1 ml-auto text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-white/80 mix-blend-difference">
            Studio still · 01 / 01
          </span>
        </div>
      </div>

      {pillars.length ? (
        <div className="relative z-[1] mx-auto grid w-full max-w-[var(--section-max)] border-t border-black/10 px-[var(--section-x)] md:grid-cols-3">
          {pillars.map((point, index) => (
            <FadeIn
              key={point.title}
              className="min-w-0 border-t border-black/10 py-8 first:border-t-0 md:border-t-0 md:px-8 md:py-12 md:first:pl-0 md:last:pr-0 md:not-first:border-l"
              delay={index * 0.08}
            >
              <span className="text-[0.6875rem] font-medium tracking-[0.18em] text-[#8a8a8a]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-[1.35rem] font-normal leading-none tracking-tight text-[#111]">
                {point.title}
              </h3>
              {point.body ? (
                <p className="mt-4 max-w-[22rem] text-[0.975rem] font-light leading-[1.7] text-[#525252]">
                  {point.body}
                </p>
              ) : null}
            </FadeIn>
          ))}
        </div>
      ) : null}
    </section>
  );
}
