"use client";

import Link from "next/link";
import { FadeIn, RevealLines } from "@/components/anim/text";
import { LinkBtn } from "@/components/anim/LinkBtn";
import { ImageReveal } from "@/components/anim/image";
import { PROJECT_IMAGES, SITE_IMAGES } from "@/lib/images";
import type { BlogListItem } from "@/lib/blog/types";

const STILLS = [
  SITE_IMAGES.servicesIntro,
  PROJECT_IMAGES.orbit.one,
  PROJECT_IMAGES.folio.hero,
];

export function InsightsPreview({ posts }: { posts: BlogListItem[] }) {
  const shown = posts.slice(0, 3);
  if (!shown.length) return null;
  const featured = shown[0];
  const rest = shown.slice(1);
  const featuredStill = STILLS[0];

  return (
    <section id="insights-preview" className="bg-[#111] text-white">
      <div className="mx-auto w-full max-w-[var(--section-max)] px-[var(--section-x)] py-[clamp(4.5rem,9vw,7.5rem)]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <RevealLines
              className="m-0 text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-white/45"
              staggerLines={0}
            >
              06 · insights
            </RevealLines>
            <RevealLines
              as="h2"
              className="mt-6 max-w-[14ch] text-[clamp(2.15rem,4.8vw,3.85rem)] font-normal leading-[1.08] tracking-[-0.04em]"
            >
              From the desk.
            </RevealLines>
          </div>
          <LinkBtn href="/news" lineClassName="navbar">
            All insights →
          </LinkBtn>
        </div>

        <div className="mt-14 grid items-start gap-10 lg:mt-20 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16">
          <FadeIn>
            <Link
              href={`/news/${featured.slug}`}
              className="group block no-underline"
            >
              <div className="relative">
                <ImageReveal
                  className="aspect-[16/10] w-full overflow-hidden bg-[#1c1c1c]"
                  imgClassName="h-[125%] w-full object-cover"
                  src={featuredStill.src}
                  alt={featuredStill.alt}
                  parallax
                />
                <span className="pointer-events-none absolute left-5 top-5 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-white/80 mix-blend-difference">
                  Featured
                </span>
              </div>
              <p className="mt-6 m-0 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-white/45">
                {featured.category}
                {featured.date ? ` · ${featured.date}` : ""}
              </p>
              <h3 className="mt-4 max-w-[18ch] text-[clamp(1.7rem,3.4vw,2.7rem)] font-normal leading-[1.08] tracking-[-0.035em] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1">
                {featured.title}
              </h3>
              <p className="mt-4 max-w-[38ch] text-[1.02rem] font-light leading-[1.7] text-white/60">
                {featured.excerpt || featured.seoDescription}
              </p>
            </Link>
          </FadeIn>

          <ol className="m-0 list-none border-t border-white/10 p-0">
            {rest.map((post, index) => {
              const still = STILLS[index + 1] ?? STILLS[0];
              return (
                <FadeIn
                  as="li"
                  key={post.id}
                  delay={0.1 + index * 0.08}
                  className="border-b border-white/10"
                >
                  <Link
                    href={`/news/${post.slug}`}
                    className="group grid gap-5 py-8 no-underline sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:items-center"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={still.src}
                      alt=""
                      className="aspect-[4/3] w-full object-cover sm:aspect-square"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="min-w-0">
                      <p className="m-0 text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-white/40">
                        ({String(index + 2).padStart(2, "0")}) · {post.category}
                      </p>
                      <h3 className="mt-3 text-[clamp(1.2rem,2vw,1.65rem)] font-normal leading-[1.2] tracking-tight transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5">
                        {post.title}
                      </h3>
                    </div>
                  </Link>
                </FadeIn>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
