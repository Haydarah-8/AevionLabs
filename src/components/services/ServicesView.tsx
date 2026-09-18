import { FaqList } from "@/components/services/FaqList";
import { PracticeAreasGrid } from "@/components/home/PracticeAreasGrid";
import { LinkBtn } from "@/components/anim/LinkBtn";
import { TalkLinkBtn } from "@/components/site/TalkTrigger";
import {
  PROOF,
  SERVICES_LEAD_BODY,
  SERVICES_LEAD_KICKER,
  SERVICES_LEAD_TITLE,
} from "@/data/copy";
import { SOLUTIONS } from "@/data/solutions";
import { SITE_IMAGES } from "@/lib/images";
import { serviceHref } from "@/lib/topic-slug";
import type { CmsPage } from "@/lib/cms/types";
import Link from "next/link";

const TAKE = [
  {
    n: "01",
    title: "Name the stall",
    body: "Who it is for, what they must do, and which numbers matter after launch. Settled before anyone opens a design file.",
  },
  {
    n: "02",
    title: "Use the prototype",
    body: "You click through the product in the browser. If the path is wrong, you know before the full build starts.",
  },
  {
    n: "03",
    title: "Unlock the rest",
    body: "Only then does the remaining spend open. Same team writes the production code on a repository you own.",
  },
];

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

export function ServicesView({ page }: { page?: CmsPage | null }) {
  const hero = section(page, "page_hero");
  const faq = section(page, "faq");

  return (
    <>
      <header className="mx-auto w-full max-w-[var(--section-max)] px-[var(--section-x)] pt-32 pb-12 sm:pt-36">
        <p className="site-kicker">
          {text(hero?.data, "kicker") || SERVICES_LEAD_KICKER}
        </p>
        <h1 className="site-display m-0 max-w-[16ch] whitespace-pre-line text-[#111]">
          {text(hero?.data, "heading") || SERVICES_LEAD_TITLE}
        </h1>
        <p className="site-body mt-6 m-0 max-w-[38rem]">
          {text(hero?.data, "body") || SERVICES_LEAD_BODY}
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-8">
          <TalkLinkBtn>Let&apos;s talk</TalkLinkBtn>
          <LinkBtn href="/about">Read the studio →</LinkBtn>
        </div>
      </header>

      <section className="border-t border-black/15 bg-white">
        <div className="mx-auto w-full max-w-[var(--section-max)] px-[var(--section-x)] pt-[var(--section-y)]">
          <p className="site-kicker">How we take work</p>
          <h2 className="site-display m-0 max-w-[16ch] text-[#111]">
            The spend waits until you have used it.
          </h2>
        </div>
        <div className="mx-auto mt-12 w-full max-w-[var(--section-max)] px-[var(--section-x)] pb-4 lg:mt-16">
          {TAKE.map((step) => (
            <article
              key={step.n}
              className="grid gap-4 border-t border-black/15 py-12 lg:grid-cols-[4.75rem_minmax(0,0.9fr)_minmax(0,1.2fr)] lg:gap-10 lg:py-16"
            >
              <p className="m-0 text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-[#6a6a6a]">
                {step.n}
              </p>
              <h3 className="m-0 max-w-[18ch] text-[clamp(1.45rem,2.4vw,2rem)] font-normal leading-[1.15] tracking-[-0.03em] text-[#111]">
                {step.title}
              </h3>
              <p className="m-0 max-w-[42ch] text-[0.98rem] font-normal leading-[1.6] text-[#3f3f3f]">
                {step.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-[#0a0a0a] text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="absolute inset-0 h-full w-full object-cover opacity-40"
          src={SITE_IMAGES.servicesIntro.src}
          alt=""
        />
        <div className="absolute inset-0 bg-black/50" aria-hidden />
        <div className="relative mx-auto w-full max-w-[var(--section-max)] px-[var(--section-x)] py-[var(--section-y)]">
          <p className="site-kicker is-light">The rule</p>
          <h2 className="site-display m-0 max-w-[14ch] text-white">
            You do not buy a full build on a deck.
          </h2>
          <p className="mt-6 m-0 max-w-[36rem] text-[1.05rem] font-light leading-[1.75] text-white/70">
            Take the whole product, or bring us in for the piece that is
            stalling. Strategy, design, and engineering stay in the same team.
          </p>
        </div>
      </section>

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

      <section className="border-t border-black/15 bg-white">
        <div className="mx-auto w-full max-w-[var(--section-max)] px-[var(--section-x)] pt-[var(--section-y)]">
          <p className="site-kicker">Products</p>
          <h2 className="site-display m-0 max-w-[16ch] text-[#111]">
            If people have to use it in a browser, we can build it.
          </h2>
        </div>

        <div className="mx-auto mt-12 grid w-full max-w-[var(--section-max)] px-[var(--section-x)] pb-[var(--section-y)] sm:grid-cols-2 lg:mt-16">
          {SOLUTIONS.map((item) => (
            <Link
              key={item.id}
              id={item.id}
              href={serviceHref(item.id)}
              className="group scroll-mt-24 block border-t border-black/15 py-10 no-underline sm:px-8 sm:odd:pl-0 sm:even:border-l sm:even:pr-0 lg:py-12"
            >
              <p className="m-0 text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-[#6a6a6a]">
                {item.tag}
              </p>
              <h3 className="mt-3 m-0 text-[clamp(1.35rem,2.2vw,1.75rem)] font-normal leading-[1.15] tracking-[-0.03em] text-[#111] transition-opacity duration-200 group-hover:opacity-40">
                {item.title}
              </h3>
              <p className="mt-3 m-0 max-w-[34ch] text-[0.98rem] font-normal leading-[1.55] text-[#3f3f3f]">
                {item.excerpt}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <PracticeAreasGrid
        id="practices"
        kicker="Practices"
        heading="Strategy, design, and engineering in the same team."
        intro=""
        ctaLabel="How the studio works"
        ctaHref="/about"
      />

      <FaqList
        kicker={text(faq?.data, "kicker")}
        heading={text(faq?.data, "heading")}
        items={strings(faq?.data)}
      />
    </>
  );
}
