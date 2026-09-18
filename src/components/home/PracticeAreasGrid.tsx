import Link from "next/link";
import { LinkBtn } from "@/components/anim/LinkBtn";
import { practiceAreas } from "@/data/practice-areas";
import { SERVICES_HEADING, SERVICES_INTRO } from "@/data/copy";
import { serviceHref } from "@/lib/topic-slug";

type CardItem = {
  id: string;
  title: string;
  excerpt: string;
  heroImage?: string;
  href?: string;
};

const TAGS: Record<string, string> = {
  "strategy-ux": "Foundation",
  "visual-design": "Interface",
  "web-development": "Engineering",
  "design-systems": "Structure",
  performance: "Momentum",
  care: "Aftercare",
};

function defaultCards(): CardItem[] {
  return practiceAreas.map((area) => ({
    id: area.id,
    title: area.title,
    excerpt: area.excerpt,
    href: serviceHref(area.id),
  }));
}

export function PracticeAreasGrid({
  id = "services",
  kicker = "Services",
  heading = SERVICES_HEADING,
  intro = SERVICES_INTRO,
  ctaLabel = "All services",
  ctaHref = "/services",
  items,
}: {
  id?: string;
  kicker?: string;
  heading?: string;
  intro?: string;
  ctaLabel?: string;
  ctaHref?: string;
  items?: CardItem[];
}) {
  const cards = items?.length ? items : defaultCards();

  return (
    <section id={id} className="scroll-mt-24 border-t border-black/15 bg-white">
      <div className="mx-auto w-full max-w-[var(--section-max)] px-[var(--section-x)] pt-[var(--section-y)]">
        <p className="site-kicker">{kicker}</p>
        <h2 className="site-display m-0 max-w-[16ch] whitespace-pre-line text-[#111]">
          {heading}
        </h2>
        {intro ? (
          <p className="site-body mt-6 m-0 max-w-[38rem]">{intro}</p>
        ) : null}
      </div>

      <div className="mx-auto mt-12 grid w-full max-w-[var(--section-max)] px-[var(--section-x)] sm:grid-cols-2 lg:mt-16">
        {cards.map((area) => (
          <Link
            key={area.id}
            id={area.id}
            href={area.href || serviceHref(area.id)}
            className="group scroll-mt-24 block border-t border-black/15 py-8 no-underline sm:px-8 sm:odd:pl-0 sm:even:border-l sm:even:pr-0 lg:py-10"
          >
            {TAGS[area.id] ? (
              <p className="m-0 text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-[#6a6a6a]">
                {TAGS[area.id]}
              </p>
            ) : null}
            <h3 className="mt-3 m-0 text-[clamp(1.35rem,2.2vw,1.75rem)] font-normal leading-[1.15] tracking-[-0.03em] text-[#111] transition-opacity duration-200 group-hover:opacity-40">
              {area.title}
            </h3>
            {area.excerpt ? (
              <p className="mt-3 m-0 max-w-[34ch] text-[0.98rem] font-normal leading-[1.55] text-[#3f3f3f]">
                {area.excerpt}
              </p>
            ) : null}
          </Link>
        ))}
      </div>

      {ctaLabel ? (
        <div className="mx-auto flex max-w-[var(--section-max)] border-t border-black/15 px-[var(--section-x)] py-10">
          <LinkBtn href={ctaHref}>{ctaLabel} →</LinkBtn>
        </div>
      ) : null}
    </section>
  );
}
