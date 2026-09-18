"use client";

import { FadeIn, RevealLines } from "@/components/anim/text";
import { TalkLinkBtn } from "@/components/site/TalkTrigger";
import { TALK_BODY, TALK_HEADING } from "@/data/copy";
import { SectionFrame } from "@/components/ui/SectionFrame";

export function TalkCta({
  kicker = "Start a project",
  heading = TALK_HEADING,
  body = TALK_BODY,
  label = "Let's talk",
}: {
  kicker?: string;
  heading?: string;
  body?: string;
  label?: string;
}) {
  return (
    <SectionFrame tone="black">
      <div className="flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-end">
        <div>
          <RevealLines className="site-kicker is-light" staggerLines={0}>
            {kicker}
          </RevealLines>
          <RevealLines as="h2" className="site-display max-w-[16ch]">
            {heading}
          </RevealLines>
          {body ? (
            <FadeIn
              delay={0.1}
              className="mt-6 max-w-[32rem] text-[1.05rem] font-light leading-[1.75] text-white/65"
            >
              {body}
            </FadeIn>
          ) : null}
        </div>
        <TalkLinkBtn lineClassName="navbar">{label}</TalkLinkBtn>
      </div>
    </SectionFrame>
  );
}
