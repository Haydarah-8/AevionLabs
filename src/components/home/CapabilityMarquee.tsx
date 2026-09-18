"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LOGOS,
  hoverColor,
  logoFlatMark,
  type HeroLogo,
} from "@/components/home/ClientLogos";
import { LinkBtn } from "@/components/anim/LinkBtn";
import {
  TOOL_CARDS,
  STACK_BODY,
  STACK_HEADING,
  STACK_KICKER,
} from "@/data/copy";
import { SITE_IMAGES } from "@/lib/images";
import { getPlatformTopic } from "@/data/topics";
import { topicSlug, withHref } from "@/lib/topic-slug";

const PRESETS = new Map<string, (typeof TOOL_CARDS)[number]>(
  TOOL_CARDS.map((card) => [card.name, card]),
);
const tailwindCopy = PRESETS.get("Tailwind");
if (tailwindCopy) PRESETS.set("Tailwind CSS", tailwindCopy);

function cardCopy(name: string) {
  const preset = PRESETS.get(name);
  const topic = getPlatformTopic(topicSlug(name));
  return preset?.use ?? topic?.uses[0] ?? topic?.headline ?? "";
}

function Card({ logo, use }: { logo: HeroLogo; use: string }) {
  const Paint = logo.Paint;
  return (
    <Link
      href={withHref(logo.name)}
      className={`tool-card${logo.painted ? " is-painted" : ""}`}
      style={{ "--logo-color": hoverColor(logo.color) } as CSSProperties}
    >
      <span className="tool-card-logo">
        {logo.painted && Paint ? (
          <>
            <span className="tool-card-paint" aria-hidden>
              <Paint />
            </span>
            <span className="tool-card-flat">{logoFlatMark(logo)}</span>
          </>
        ) : (
          (logo.mark ?? logo.svg)
        )}
      </span>
      <span className="tool-card-copy">
        <span className="tool-card-name">{logo.name}</span>
        {use ? <span className="tool-card-use">{use}</span> : null}
      </span>
    </Link>
  );
}

function Track({ staticList = false }: { staticList?: boolean }) {
  const row = staticList ? [...LOGOS] : [...LOGOS, ...LOGOS];
  return (
    <div
      className={`capability-marquee-track is-cards${staticList ? " is-static" : ""}`}
    >
      {row.map((logo, index) => (
        <Card
          key={`${logo.name}-${index}`}
          logo={logo}
          use={cardCopy(logo.name)}
        />
      ))}
    </div>
  );
}

export function CapabilityMarquee() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return (
    <section
      className="capability-marquee is-tools"
      aria-label="Tools we ship with"
    >
      <div
        className="capability-marquee-bg"
        style={{ backgroundImage: `url('${SITE_IMAGES.homeIntro.src}')` }}
        aria-hidden
      />
      <div className="capability-marquee-shade" aria-hidden />

      <header className="relative z-10 mx-auto w-full max-w-[var(--section-max)] px-[var(--section-x)] pt-[var(--section-y)] pb-12 lg:pb-16">
        <p className="site-kicker is-light">{STACK_KICKER}</p>
        <h2
          className="site-display m-0 text-white"
          style={{ maxWidth: "24ch" }}
        >
          {STACK_HEADING}
        </h2>
        <p className="mt-6 m-0 max-w-[38rem] text-[1.05rem] font-light leading-[1.75] text-white/70">
          {STACK_BODY}
        </p>
      </header>

      <div className="capability-marquee-stage relative z-10">
        <Track staticList={reduceMotion} />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[var(--section-max)] px-[var(--section-x)] pt-14 pb-[var(--section-y)]">
        <LinkBtn href="/with">What we use →</LinkBtn>
      </div>
    </section>
  );
}
