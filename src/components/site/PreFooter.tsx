"use client";

import { FadeIn, RevealLines } from "@/components/anim/text";
import { LinkBtn } from "@/components/anim/LinkBtn";
import { TalkLinkBtn } from "@/components/site/TalkTrigger";
import { PREFOOTER_BODY } from "@/data/copy";
import { DEFAULT_SETTINGS } from "@/lib/cms/constants";
import type { SiteSettings } from "@/lib/cms/types";

export function PreFooter({ settings }: { settings?: SiteSettings }) {
  const s = settings ?? DEFAULT_SETTINGS;

  return (
    <section
      className="relative z-10 border-t border-black/10 bg-white"
      aria-label="Start a project"
    >
      <div className="mx-auto flex max-w-[var(--section-max)] flex-col gap-8 px-[var(--section-x)] py-14 sm:flex-row sm:items-end sm:justify-between sm:py-16">
        <div className="min-w-0 max-w-xl">
          <RevealLines
            className="m-0 text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-[#8a8a8a]"
            staggerLines={0}
          >
            Start a project
          </RevealLines>
          <RevealLines
            as="h2"
            className="mt-4 text-[clamp(1.85rem,4vw,2.75rem)] font-normal leading-[1.08] tracking-[-0.04em] text-[#111]"
          >
            Let&apos;s build something.
          </RevealLines>
          <FadeIn
            delay={0.1}
            className="mt-4 max-w-[34rem] text-[1.02rem] font-light leading-[1.7] text-[#525252]"
          >
            {PREFOOTER_BODY}
          </FadeIn>
        </div>
        <div className="flex flex-wrap items-end gap-8">
          <TalkLinkBtn>Let&apos;s talk</TalkLinkBtn>
          <LinkBtn href={s.prefooterCtaHref || "/services"}>
            {s.prefooterCtaLabel || "See services"} →
          </LinkBtn>
        </div>
      </div>
    </section>
  );
}
