"use client";

import Link from "next/link";
import { FadeIn, RevealLines } from "@/components/anim/text";
import { PROJECT_IMAGES } from "@/lib/images";
import { cn } from "@/lib/utils";
import { WHO_ITS_FOR } from "@/data/copy";

const PRODUCTS = [
  {
    ...WHO_ITS_FOR[0],
    href: "/services#company-sites",
    image: PROJECT_IMAGES.folio.hero,
    tile: "aspect-[5/4] sm:col-span-2 sm:aspect-[16/10] lg:col-span-7 lg:row-span-2 lg:aspect-auto lg:h-full",
  },
  {
    ...WHO_ITS_FOR[1],
    href: "/services#saas",
    image: PROJECT_IMAGES.orbit.hero,
    tile: "aspect-[4/5] lg:col-span-5 lg:aspect-auto lg:h-full",
  },
  {
    ...WHO_ITS_FOR[2],
    href: "/services#ecommerce",
    image: PROJECT_IMAGES.prism.hero,
    tile: "aspect-[4/5] lg:col-span-5 lg:aspect-auto lg:h-full",
  },
  {
    ...WHO_ITS_FOR[3],
    href: "/services#internal-tools",
    image: PROJECT_IMAGES.baseplate.hero,
    tile: "aspect-[5/6] sm:col-span-2 sm:aspect-[2.4/1] lg:col-span-12 lg:aspect-auto lg:min-h-[16rem]",
  },
];

export function WhoItsFor({ kicker = "who it is for" }: { kicker?: string }) {
  return (
    <section id="products" className="bg-white">
      <div className="mx-auto w-full max-w-[var(--section-max)] px-[var(--section-x)] pt-[clamp(4.5rem,9vw,7.5rem)]">
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
          <RevealLines
            className="m-0 text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-[#8a8a8a]"
            staggerLines={0}
          >
            05 · {kicker}
          </RevealLines>
          <RevealLines
            className="m-0 text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-[#8a8a8a]"
            staggerLines={0}
          >
            Four products
          </RevealLines>
        </div>
        <RevealLines
          as="h2"
          className="mt-8 max-w-[16ch] text-[clamp(2.15rem,4.8vw,3.85rem)] font-normal leading-[1.08] tracking-[-0.04em] text-[#111]"
        >
          Name the stall. We take it from there.
        </RevealLines>
      </div>

      <div className="mx-auto mt-12 grid w-full max-w-[var(--section-max)] gap-3 px-[var(--section-x)] pb-[clamp(4.5rem,9vw,7.5rem)] sm:grid-cols-2 lg:mt-16 lg:grid-cols-12 lg:grid-rows-[minmax(17rem,22vw)_minmax(17rem,22vw)_minmax(14rem,18vw)] lg:gap-4">
        {PRODUCTS.map((item, index) => (
          <FadeIn
            key={item.title}
            delay={index * 0.08}
            className={cn("min-h-0", item.tile)}
          >
            <Link
              href={item.href}
              className="group relative block h-full min-h-full overflow-hidden bg-[#111] no-underline"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image.src}
                alt={item.image.alt}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
              <div
                className={cn(
                  "absolute inset-0 bg-black/35 transition-colors duration-500 group-hover:bg-black/55",
                  index === 0 && "bg-black/25",
                )}
              />
              <div className="absolute inset-0 flex flex-col justify-end p-6 text-white sm:p-8">
                <p className="m-0 text-[0.6875rem] font-medium tracking-[0.18em] text-white/55">
                  ({String(index + 1).padStart(2, "0")})
                </p>
                <h3 className="mt-3 text-[clamp(1.6rem,3vw,2.35rem)] font-normal leading-[1.05] tracking-[-0.03em]">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-[32ch] text-[0.95rem] font-light leading-[1.65] text-white/75 max-sm:line-clamp-2 sm:max-h-0 sm:overflow-hidden sm:opacity-0 sm:transition-all sm:duration-500 sm:ease-[cubic-bezier(0.22,1,0.36,1)] sm:group-hover:max-h-32 sm:group-hover:opacity-100">
                  {item.body}
                </p>
              </div>
            </Link>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
