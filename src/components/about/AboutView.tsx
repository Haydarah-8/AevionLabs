import { PrototypeBand } from "@/components/about/PrototypeBand";
import { ValuesAccordion } from "@/components/about/ValuesAccordion";
import { WhatWeShip } from "@/components/about/WhatWeShip";
import { ServiceOfferings } from "@/components/home/ServiceOfferings";
import { LinkBtn } from "@/components/anim/LinkBtn";
import { TalkLinkBtn } from "@/components/site/TalkTrigger";
import {
  ABOUT_LEAD_BODY,
  ABOUT_LEAD_KICKER,
  ABOUT_LEAD_TITLE,
  PROOF,
} from "@/data/copy";
import type { CmsPage } from "@/lib/cms/types";

function section(page: CmsPage | null | undefined, type: string) {
  return page?.sections.find((item) => item.visible && item.type === type);
}

function text(data: Record<string, unknown> | undefined, key: string) {
  const value = data?.[key];
  return typeof value === "string" && value.trim() ? value : undefined;
}

function strings(data: Record<string, unknown> | undefined, key = "items") {
  const value = data?.[key];
  return Array.isArray(value)
    ? value.map((item) => String(item)).filter(Boolean)
    : undefined;
}

export function AboutView({ page }: { page?: CmsPage | null }) {
  const hero = section(page, "page_hero");
  const values = section(page, "values");
  const prototype = section(page, "prototype");
  const offerings = section(page, "offerings");

  return (
    <>
      <header className="mx-auto w-full max-w-[var(--section-max)] px-[var(--section-x)] pt-32 pb-12 sm:pt-36">
        <p className="site-kicker">
          {text(hero?.data, "kicker") || ABOUT_LEAD_KICKER}
        </p>
        <h1 className="site-display m-0 max-w-[16ch] whitespace-pre-line text-[#111]">
          {text(hero?.data, "heading") || ABOUT_LEAD_TITLE}
        </h1>
        <p className="site-body mt-6 m-0 max-w-[38rem]">
          {text(hero?.data, "body") || ABOUT_LEAD_BODY}
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-8">
          <TalkLinkBtn>Let&apos;s talk</TalkLinkBtn>
          <LinkBtn href="/services">See services →</LinkBtn>
        </div>
      </header>

      <PrototypeBand
        kicker={text(prototype?.data, "kicker") || "Why this studio"}
        heading={
          text(prototype?.data, "heading") ||
          "Handoffs are where products go wrong. We removed them."
        }
        body={
          text(prototype?.data, "body") ||
          "Companies should not take the risk of a full build on a deck of slides. You see the system in the browser first. Only then do we unlock the remaining spend and write production code on a repository you own."
        }
      />

      <section className="border-t border-black/15 bg-white">
        <div className="mx-auto grid w-full max-w-[var(--section-max)] sm:grid-cols-3">
          {PROOF.map((item) => (
            <div
              key={item.n}
              className="border-t border-black/15 px-[var(--section-x)] py-10 first:border-t-0 sm:border-t-0 sm:border-l sm:first:border-l-0 sm:px-8 sm:first:pl-[var(--section-x)] sm:last:pr-[var(--section-x)] lg:py-12"
            >
              <p className="m-0 text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-[#6a6a6a]">
                {item.title}
              </p>
              <p className="mt-3 m-0 max-w-[28ch] text-[0.98rem] font-normal leading-[1.55] text-[#3f3f3f]">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <WhatWeShip />

      <ValuesAccordion
        kicker={text(values?.data, "kicker") || "How we work"}
        heading={
          text(values?.data, "heading") ||
          "Four commitments before anyone writes a line of code."
        }
        items={strings(values?.data)}
      />

      <div id="process" className="scroll-mt-24">
        <ServiceOfferings
          kicker={text(offerings?.data, "kicker") || "The process"}
          heading={
            text(offerings?.data, "heading") ||
            "Five steps. The spend waits until you have seen the work."
          }
          body={
            text(offerings?.data, "body") ||
            "A brief, a prototype, then the build on a repository you own. Keep us after launch, or take the code and run it yourselves."
          }
          items={strings(offerings?.data)}
        />
      </div>
    </>
  );
}
