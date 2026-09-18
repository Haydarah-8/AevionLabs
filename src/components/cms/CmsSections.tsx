import Image from "next/image";
import Link from "next/link";
import { AboutCta } from "@/components/home/AboutCta";
import { ClientLogos } from "@/components/home/ClientLogos";
import { Hero } from "@/components/home/Hero";
import { Intro } from "@/components/home/Intro";
import { PracticeAreasGrid } from "@/components/home/PracticeAreasGrid";
import { ServiceOfferings } from "@/components/home/ServiceOfferings";
import { PrototypeBand } from "@/components/about/PrototypeBand";
import { ValuesAccordion } from "@/components/about/ValuesAccordion";
import { FaqList } from "@/components/services/FaqList";
import { WorkIndex } from "@/components/work/WorkIndex";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { PageHero } from "@/components/ui/PageHero";
import { excerptFromPost } from "@/lib/blog/utils";
import { listPublishedPosts } from "@/lib/blog/store";
import { listPublishedProjects } from "@/lib/cms/store";
import type { CmsPage, CmsSection } from "@/lib/cms/types";
import {
  HERO_BODY,
  HERO_CTA_HREF,
  HERO_CTA_LABEL,
  HERO_HEADLINE,
  LEGACY_HERO_BODY,
  LEGACY_HERO_HEADLINE,
  PREV_HERO_BODY,
  PREV_HERO_HEADLINE,
  freshCopy,
} from "@/data/copy";

function text(data: Record<string, unknown>, key: string, fallback = "") {
  const value = data[key];
  return typeof value === "string" ? value : fallback;
}

function paragraphs(value: string) {
  return value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function itemsOf(data: Record<string, unknown>, key = "items") {
  return Array.isArray(data[key]) ? data[key] : [];
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function safeHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+=/gi, " ");
}

async function SectionView({ section }: { section: CmsSection }) {
  const data = section.data;

  if (section.type === "hero") {
    return (
      <Hero
        headline={
          freshCopy(
            text(data, "headline"),
            LEGACY_HERO_HEADLINE,
            PREV_HERO_HEADLINE,
          ) || HERO_HEADLINE
        }
        body={
          freshCopy(text(data, "body"), LEGACY_HERO_BODY, PREV_HERO_BODY) ||
          HERO_BODY
        }
        ctaLabel={
          freshCopy(text(data, "ctaLabel"), "Meet the agency") || HERO_CTA_LABEL
        }
        ctaHref={freshCopy(text(data, "ctaHref"), "/about") || HERO_CTA_HREF}
        image={text(data, "image", "/images/hero-1.jpg")}
      />
    );
  }

  if (section.type === "page_hero") {
    return (
      <PageHero
        title={text(data, "title", "")}
        highlight={text(data, "highlight") || undefined}
        image={text(data, "image") || undefined}
      />
    );
  }

  if (section.type === "intro") {
    const items = itemsOf(data).filter(
      (item): item is string => typeof item === "string",
    );
    return (
      <Intro
        kicker={text(data, "kicker") || undefined}
        heading={text(data, "heading") || undefined}
        left={text(data, "left") || undefined}
        right={text(data, "right") || undefined}
        location={text(data, "location") || undefined}
        ctaLabel={text(data, "ctaLabel") || undefined}
        ctaHref={text(data, "ctaHref") || undefined}
        points={items}
      />
    );
  }

  if (section.type === "rich_text") {
    return (
      <AnimatedSection className="bg-white">
        <div className="mx-auto max-w-[800px] px-5 py-16 sm:px-8 sm:py-24 lg:px-[52px]">
          {text(data, "kicker") ? (
            <p className="mb-4 text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-[#737373]">
              {text(data, "kicker")}
            </p>
          ) : null}
          {text(data, "heading") ? (
            <h2 className="text-[clamp(1.85rem,4vw,3rem)] font-normal leading-[1.2] tracking-tight text-black">
              {text(data, "heading")}
            </h2>
          ) : null}
          {paragraphs(text(data, "body")).map((p) => (
            <p
              key={p.slice(0, 40)}
              className="mt-5 text-[1.0625rem] font-light leading-[1.8] text-[#404040]"
            >
              {p}
            </p>
          ))}
        </div>
      </AnimatedSection>
    );
  }

  if (section.type === "image" && text(data, "src")) {
    return (
      <AnimatedSection className="bg-white">
        <div className="mx-auto max-w-[1100px] px-5 py-10 sm:px-8 lg:px-[52px] xl:max-w-[1400px]">
          <div className="relative aspect-[16/9] overflow-hidden bg-neutral-200">
            <Image
              src={text(data, "src")}
              alt={text(data, "alt")}
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>
          {text(data, "caption") ? (
            <p className="mt-3 text-sm text-[#737373]">
              {text(data, "caption")}
            </p>
          ) : null}
        </div>
      </AnimatedSection>
    );
  }

  if (section.type === "image_text") {
    const side = text(data, "imageSide", "left");
    const flip = side === "right";
    return (
      <AnimatedSection
        id={text(data, "id") || undefined}
        className="scroll-mt-24 border-b border-[#e5e5e5] last:border-0"
      >
        <div
          className={`mx-auto grid max-w-[1100px] items-center gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-2 lg:gap-16 lg:px-[52px] xl:max-w-[1400px] ${
            flip ? "lg:[&>div:first-child]:order-2" : ""
          }`}
        >
          {text(data, "image") ? (
            <div className="relative aspect-[16/10] overflow-hidden bg-neutral-200">
              <Image
                src={text(data, "image")}
                alt=""
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 45vw, 100vw"
              />
            </div>
          ) : (
            <div />
          )}
          <div>
            {text(data, "kicker") ? (
              <p className="mb-3 text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-[#737373]">
                {text(data, "kicker")}
              </p>
            ) : null}
            <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-normal leading-[1.2] tracking-tight text-black">
              {text(data, "heading")}
            </h2>
            {paragraphs(text(data, "body")).map((p) => (
              <p
                key={p.slice(0, 24)}
                className="mt-5 text-[1.0625rem] font-light leading-[1.8] text-[#404040]"
              >
                {p}
              </p>
            ))}
          </div>
        </div>
      </AnimatedSection>
    );
  }

  if (section.type === "cards") {
    const items = itemsOf(data).map((item, index) => {
      const record = asRecord(item);
      return {
        id: text(record, "id") || `card-${index}`,
        title: text(record, "title"),
        excerpt: text(record, "excerpt"),
        heroImage: text(record, "image"),
        href: text(record, "href").replace(
          "/practice-areas/details",
          "/services",
        ),
      };
    });
    return (
      <PracticeAreasGrid
        kicker={text(data, "kicker") || undefined}
        heading={text(data, "heading") || undefined}
        intro={text(data, "intro") || undefined}
        ctaLabel={text(data, "ctaLabel") || undefined}
        ctaHref={text(data, "ctaHref") || undefined}
        items={items}
      />
    );
  }

  if (section.type === "offerings") {
    return (
      <ServiceOfferings
        kicker={text(data, "kicker") || undefined}
        heading={text(data, "heading") || undefined}
        body={text(data, "body") || undefined}
        items={itemsOf(data)
          .map((item) => String(item))
          .filter(Boolean)}
        image={text(data, "image") || undefined}
      />
    );
  }

  if (section.type === "values") {
    return (
      <ValuesAccordion
        kicker={text(data, "kicker") || undefined}
        heading={text(data, "heading") || undefined}
        items={itemsOf(data)
          .map((item) => String(item))
          .filter(Boolean)}
      />
    );
  }

  if (section.type === "prototype") {
    return (
      <PrototypeBand
        kicker={text(data, "kicker") || undefined}
        heading={text(data, "heading") || undefined}
        body={text(data, "body") || undefined}
      />
    );
  }

  if (section.type === "faq") {
    return (
      <FaqList
        kicker={text(data, "kicker") || undefined}
        heading={text(data, "heading") || undefined}
        items={itemsOf(data)
          .map((item) => String(item))
          .filter(Boolean)}
      />
    );
  }

  if (section.type === "cta") {
    return (
      <AboutCta
        heading={text(data, "heading")}
        ctaLabel={text(data, "ctaLabel")}
        ctaHref={text(data, "ctaHref")}
      />
    );
  }

  if (section.type === "marquee") {
    return (
      <ClientLogos
        kicker={text(data, "kicker", "The stack")}
        names={itemsOf(data).map((item) => String(item))}
      />
    );
  }

  if (section.type === "insights") {
    return null;
  }

  if (section.type === "blog_list") {
    const posts = await listPublishedPosts();
    const featured = posts.find((post) => post.featured) ?? posts[0];
    const rest = posts.filter((post) => post.id !== featured?.id);
    return (
      <AnimatedSection className="mx-auto max-w-[1100px] px-5 py-16 sm:px-8 sm:py-24 lg:px-[52px] lg:py-32 xl:max-w-[1400px]">
        {posts.length === 0 ? (
          <p className="mx-auto max-w-[900px] text-[1.125rem] font-light text-[#525252]">
            {text(data, "empty", "No articles have been published yet.")}
          </p>
        ) : (
          <div className="mx-auto max-w-[1100px] space-y-16">
            {featured ? (
              <Link
                href={`/news/${featured.slug}`}
                className="group grid gap-8 border-b border-[#e5e5e5] pb-16 lg:grid-cols-[1.2fr_0.8fr]"
              >
                <div>
                  <p className="mb-4 text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-[#737373]">
                    {featured.category}
                    {featured.sub ? ` · ${featured.sub}` : ""}
                  </p>
                  <h2 className="text-[clamp(2rem,5vw,3.4rem)] font-normal leading-[1.15] text-black transition-opacity group-hover:opacity-70">
                    {featured.title}
                  </h2>
                  <p className="mt-5 max-w-2xl text-[1.125rem] font-light leading-[1.8] text-[#404040]">
                    {excerptFromPost(featured)}
                  </p>
                  <p className="mt-6 text-sm tracking-wide text-[#737373]">
                    {featured.date}
                  </p>
                </div>
                <div className="min-h-[220px] bg-[#f4f4f4]" />
              </Link>
            ) : null}
            <ul className="grid gap-x-10 gap-y-14 sm:grid-cols-2">
              {rest.map((post) => (
                <li key={post.id}>
                  <Link href={`/news/${post.slug}`} className="group block">
                    <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[#737373]">
                      {post.category}
                    </p>
                    <h3 className="text-[1.65rem] font-normal leading-[1.25] text-black transition-opacity group-hover:opacity-70">
                      {post.title}
                    </h3>
                    <p className="mt-3 line-clamp-3 text-[1rem] font-light leading-[1.7] text-[#525252]">
                      {excerptFromPost(post)}
                    </p>
                    <p className="mt-4 text-sm text-[#737373]">{post.date}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </AnimatedSection>
    );
  }

  if (section.type === "projects") {
    const projects = await listPublishedProjects();
    return (
      <WorkIndex
        projects={projects.map((project) => ({
          slug: project.slug,
          client: project.client,
          overview: project.overview,
          year: project.year,
          services: project.services,
          image: { src: project.heroSrc, alt: project.heroAlt },
        }))}
      />
    );
  }

  if (section.type === "html") {
    return (
      <div
        className="cms-html"
        dangerouslySetInnerHTML={{ __html: safeHtml(text(data, "html")) }}
      />
    );
  }

  return null;
}

export async function CmsSections({ page }: { page: CmsPage }) {
  return (
    <>
      {page.sections
        .filter((section) => section.visible)
        .map((section) => (
          <SectionView key={section.id} section={section} />
        ))}
    </>
  );
}
