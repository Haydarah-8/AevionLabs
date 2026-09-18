import Link from "next/link";
import { LinkBtn } from "@/components/anim/LinkBtn";
import { SOLUTIONS } from "@/data/solutions";

export function WhatWeShip({
  kicker = "What we ship",
  heading = "If people have to use it in a browser, we can build it.",
}: {
  kicker?: string;
  heading?: string;
}) {
  const shipped = SOLUTIONS.slice(0, 4);

  return (
    <section className="border-t border-black/15 bg-white">
      <div className="mx-auto w-full max-w-[var(--section-max)] px-[var(--section-x)] pt-[var(--section-y)]">
        <p className="site-kicker">{kicker}</p>
        <h2 className="site-display m-0 max-w-[16ch] text-[#111]">{heading}</h2>
      </div>

      <div className="mx-auto mt-12 grid w-full max-w-[var(--section-max)] px-[var(--section-x)] sm:grid-cols-2 lg:mt-16">
        {shipped.map((item) => (
          <Link
            key={item.id}
            id={item.id}
            href={`/services#${item.id}`}
            className="group scroll-mt-24 block border-t border-black/15 py-8 no-underline sm:px-8 sm:odd:pl-0 sm:even:border-l sm:even:pr-0 lg:py-10"
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

      <div className="mx-auto flex max-w-[var(--section-max)] border-t border-black/15 px-[var(--section-x)] py-10">
        <LinkBtn href="/services">All services →</LinkBtn>
      </div>
    </section>
  );
}
