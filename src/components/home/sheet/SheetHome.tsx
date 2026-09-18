"use client";

import Link from "next/link";
import { TalkTrigger } from "@/components/site/TalkTrigger";
import { LOGOS } from "@/components/home/ClientLogos";
import { practiceAreas } from "@/data/practice-areas";
import {
  AGENCY_HEADING,
  AGENCY_LEFT,
  AGENCY_NOTE,
  AGENCY_RIGHT,
  HERO_BODY,
  HERO_CTA_HREF,
  HERO_CTA_LABEL,
  HERO_HEADLINE,
  HERO_KICKER,
  HERO_SECONDARY_HREF,
  HERO_SECONDARY_LABEL,
  PROOF,
  SERVICES_HEADING,
  SERVICES_INTRO,
  STUDIO_HEADING,
  STUDIO_LEFT,
  STUDIO_RIGHT,
  WHO_ITS_FOR,
} from "@/data/copy";
import { PROCESS_STEPS } from "@/data/engagement";
import { SITE_IMAGES } from "@/lib/images";
import { serviceHref, withHref } from "@/lib/topic-slug";
import type { BlogListItem } from "@/lib/blog/types";

const STUDIO_FACTS = [
  { label: "Base", value: "Manchester" },
  { label: "Model", value: "Prototype first" },
  { label: "Ownership", value: "Your repository" },
];

const PRODUCTS = [
  { ...WHO_ITS_FOR[0], href: "/services#company-sites" },
  { ...WHO_ITS_FOR[1], href: "/services#saas" },
  { ...WHO_ITS_FOR[2], href: "/services#ecommerce" },
  { ...WHO_ITS_FOR[3], href: "/services#internal-tools" },
];

function isTalkHref(href?: string) {
  return !href || href === "#talk" || href === "/about";
}

export function SheetHome({
  headline = HERO_HEADLINE,
  body = HERO_BODY,
  ctaLabel = HERO_CTA_LABEL,
  ctaHref = HERO_CTA_HREF,
  posts,
}: {
  headline?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  posts: BlogListItem[];
}) {
  const talk = isTalkHref(ctaHref);
  const insights = posts.slice(0, 3);

  return (
    <article className="home-page">
      <header id="site-hero" className="home-shell is-hero">
        <div className="topic-row is-hero">
          <p className="topic-kicker">{HERO_KICKER}</p>
          <div className="topic-copy">
            <h1 className="home-hero-name">{headline}</h1>
            <p className="topic-hero-lede">{body}</p>
            <div className="home-actions">
              {talk ? (
                <TalkTrigger className="home-visit">{ctaLabel}</TalkTrigger>
              ) : (
                <Link href={ctaHref} className="home-visit">
                  {ctaLabel}
                </Link>
              )}
              <Link href={HERO_SECONDARY_HREF} className="home-visit">
                {HERO_SECONDARY_LABEL}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section id="agency" className="home-shell">
        <div className="topic-row">
          <h2 className="topic-kicker">The agency · Manchester</h2>
          <div className="topic-copy">
            <p className="topic-lead">{AGENCY_HEADING}</p>
            <p className="topic-p">{AGENCY_LEFT}</p>
            <p className="topic-p">{AGENCY_RIGHT}</p>
            <p className="topic-p">{AGENCY_NOTE}</p>
            <Link href="/about" className="home-visit">
              See the studio
            </Link>
          </div>
        </div>
      </section>

      <section id="studio" className="home-shell">
        <div className="topic-row">
          <h2 className="topic-kicker">The studio</h2>
          <div className="topic-copy">
            <p className="topic-lead">{STUDIO_HEADING}</p>
            <p className="topic-p">{STUDIO_LEFT}</p>
            <p className="topic-p">{STUDIO_RIGHT}</p>
            <dl className="home-facts">
              {STUDIO_FACTS.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
            <Link href="/about" className="home-visit">
              Get to know us
            </Link>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="home-still"
          src={SITE_IMAGES.homeAbout.src}
          alt={SITE_IMAGES.homeAbout.alt}
        />
      </section>

      <section id="terms" className="home-shell">
        <div className="topic-row">
          <h2 className="topic-kicker">The terms</h2>
          <div className="topic-copy">
            <p className="topic-lead">
              The risk comes out before the money does.
            </p>
            <ul className="topic-built">
              {PROOF.map((item) => (
                <li key={item.n}>
                  <p>{item.title}</p>
                  <p>{item.body}</p>
                </li>
              ))}
            </ul>
            <Link href="#how-we-work" className="home-visit">
              See the process
            </Link>
          </div>
        </div>
      </section>

      <section className="home-shell" aria-label="Tools we ship with">
        <div className="topic-row">
          <h2 className="topic-kicker">What we use</h2>
          <div className="topic-copy home-tools-copy">
            <p className="topic-p">
              The platforms, languages, and products we ship on, from Google and
              OpenAI through to the CMS your team already uses.
            </p>
            <div className="home-marks">
              {LOGOS.map((logo) => (
                <Link
                  key={logo.name}
                  href={withHref(logo.name)}
                  className="home-mark"
                  title={logo.name}
                >
                  <span className="sr-only">{logo.name}</span>
                  {logo.mark ?? logo.svg}
                </Link>
              ))}
            </div>
            <Link href="/with" className="home-visit">
              All platforms
            </Link>
          </div>
        </div>
      </section>

      <section id="services" className="home-shell scroll-mt-24">
        <div className="topic-row">
          <h2 className="topic-kicker">Services</h2>
          <div className="topic-copy">
            <p className="topic-lead home-lead-wrap">{SERVICES_HEADING}</p>
            <p className="topic-p">{SERVICES_INTRO}</p>
            <ul className="topic-built">
              {practiceAreas.map((area) => (
                <li key={area.id} id={area.id}>
                  <Link href={serviceHref(area.id)} className="home-item">
                    <p className="home-item-name">{area.title}</p>
                    <p className="home-item-note">{area.excerpt}</p>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/services" className="home-visit">
              All services
            </Link>
          </div>
        </div>
      </section>

      <section id="products" className="home-shell">
        <div className="topic-row">
          <h2 className="topic-kicker">Who it is for</h2>
          <div className="topic-copy">
            <p className="topic-lead">Name the stall. We take it from there.</p>
            <ul className="topic-built">
              {PRODUCTS.map((item) => (
                <li key={item.title}>
                  <Link href={item.href} className="home-item">
                    <p className="home-item-name">{item.title}</p>
                    <p className="home-item-note">{item.body}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {insights.length ? (
        <section id="insights-preview" className="home-shell">
          <div className="topic-row">
            <h2 className="topic-kicker">Insights</h2>
            <div className="topic-copy">
              <p className="topic-lead">From the desk.</p>
              <ul className="topic-built">
                {insights.map((post) => (
                  <li key={post.id}>
                    <Link href={`/news/${post.slug}`} className="home-item">
                      <p className="home-item-meta">
                        {post.category}
                        {post.date ? ` · ${post.date}` : ""}
                      </p>
                      <p className="home-item-name">{post.title}</p>
                      {post.excerpt || post.seoDescription ? (
                        <p className="home-item-note">
                          {post.excerpt || post.seoDescription}
                        </p>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/news" className="home-visit">
                All insights
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section id="how-we-work" className="home-shell scroll-mt-24">
        <div className="topic-row">
          <h2 className="topic-kicker">How we work</h2>
          <div className="topic-copy">
            <p className="topic-lead">
              You do not buy the full build until you have seen the system.
            </p>
            <p className="topic-p">
              A working prototype or design system comes first. The remaining
              budget unlocks after you approve it. Then we build on a repository
              you own.
            </p>
            <ol className="topic-built">
              {PROCESS_STEPS.map((step) => (
                <li key={step.title}>
                  <p>{step.title}</p>
                  <p>{step.body}</p>
                </li>
              ))}
            </ol>
            <Link href="/services" className="home-visit">
              See services
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
