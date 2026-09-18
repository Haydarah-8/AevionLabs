"use client";

import { FadeIn, RevealLines } from "@/components/anim/text";
import { LinkBtn } from "@/components/anim/LinkBtn";
import { TalkLinkBtn } from "@/components/site/TalkTrigger";
import { HERO_CTA_LABEL, HERO_SECONDARY_HREF, HERO_SECONDARY_LABEL } from "@/data/copy";

export function PageLead({
  kicker,
  title,
  body,
  image = "/images/home-about.jpg",
  ctaLabel = HERO_CTA_LABEL,
  secondaryLabel = HERO_SECONDARY_LABEL,
  secondaryHref = HERO_SECONDARY_HREF,
}: {
  kicker: string;
  title: string;
  body: string;
  image?: string;
  ctaLabel?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}) {
  return (
    <section className="relative flex min-h-[72vh] flex-col justify-end overflow-hidden bg-black px-[var(--section-x)] pt-32 pb-16 text-white sm:min-h-[78vh] sm:pt-36 sm:pb-24">
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-cover bg-center opacity-50"
        style={{ backgroundImage: `url('${image}')` }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[2] bg-black/60"
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-[var(--section-max)]">
        <RevealLines
          className="site-kicker is-light mb-6"
          staggerLines={0}
        >
          {kicker}
        </RevealLines>
        <RevealLines
          as="h1"
          className="max-w-[16ch] whitespace-pre-line text-[clamp(2.6rem,6.2vw,5.1rem)] font-normal leading-[1.05] tracking-[-0.04em]"
        >
          {title}
        </RevealLines>
        <FadeIn
          delay={0.15}
          className="mt-8 max-w-[36rem] text-[1.0625rem] font-light leading-[1.75] text-white/75 sm:text-[1.1875rem]"
        >
          {body}
        </FadeIn>
        <FadeIn delay={0.28} className="mt-10 flex flex-wrap items-center gap-8">
          <TalkLinkBtn lineClassName="navbar">{ctaLabel}</TalkLinkBtn>
          {secondaryLabel ? (
            <LinkBtn href={secondaryHref} lineClassName="navbar">
              {secondaryLabel}
            </LinkBtn>
          ) : null}
        </FadeIn>
      </div>
    </section>
  );
}
