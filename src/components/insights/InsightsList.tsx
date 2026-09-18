"use client";

import { FadeIn, RevealLines } from "@/components/anim/text";
import { LinkBtn } from "@/components/anim/LinkBtn";
import { TransitionLink } from "@/components/chrome/PageTransition";
import { CtaSection } from "@/components/chrome/CtaSection";
import { Footer } from "@/components/chrome/Footer";

export type InsightCard = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  sub: string;
  date: string;
  image?: string | null;
};

export function InsightsList({ posts }: { posts: InsightCard[] }) {
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div className="main_wrap">
      <div className="hero_container u-container" data-hero="" style={{ minHeight: "auto" }}>
        <div className="hero_top_wrap grid-col-12" style={{ paddingTop: "8em", paddingBottom: "4em" }}>
          <div className="u-text-sm" style={{ marginBottom: "1.5em" }}>
            01 · INSIGHTS
          </div>
          <RevealLines as="h1" className="hero_heading u-text-lg" trigger="intro" delay={0.2}>
            Notes on making websites that last.
          </RevealLines>
          <FadeIn className="u-text-base" trigger="intro" delay={0.5}>
            Writing from the agency on design systems, performance, and the
            work of shipping.
          </FadeIn>
        </div>
      </div>

      <section className="u-container" style={{ paddingBottom: "6em" }}>
        {posts.length === 0 ? (
          <p className="u-text-base" style={{ color: "var(--color-gray)" }}>
            No articles have been published yet.
          </p>
        ) : (
          <div className="grid-col-12" style={{ rowGap: "4em" }}>
            {featured ? (
              <TransitionLink
                href={`/news/${featured.slug}`}
                className="w-inline-block"
                style={{ gridColumn: "1 / -1", display: "block" }}
              >
                <p className="u-text-sm" style={{ marginBottom: "1em" }}>
                  {featured.category}
                  {featured.sub ? ` · ${featured.sub}` : ""}
                </p>
                <h2 className="u-text-md" style={{ maxWidth: "28ch" }}>
                  {featured.title}
                </h2>
                <p
                  className="u-text-base"
                  style={{
                    marginTop: "1em",
                    maxWidth: "48ch",
                    color: "var(--color-gray)",
                  }}
                >
                  {featured.excerpt}
                </p>
                <p className="u-text-sm" style={{ marginTop: "1.25em" }}>
                  {featured.date}
                </p>
              </TransitionLink>
            ) : null}

            {rest.map((post) => (
              <TransitionLink
                key={post.slug}
                href={`/news/${post.slug}`}
                className="w-inline-block"
                style={{ display: "block" }}
              >
                <p className="u-text-sm" style={{ marginBottom: "0.75em" }}>
                  {post.category}
                </p>
                <h3 className="u-text-md">{post.title}</h3>
                <p
                  className="u-text-base"
                  style={{
                    marginTop: "0.75em",
                    color: "var(--color-gray)",
                  }}
                >
                  {post.excerpt}
                </p>
                <p className="u-text-sm" style={{ marginTop: "1em" }}>
                  {post.date}
                </p>
              </TransitionLink>
            ))}
          </div>
        )}

        <div style={{ marginTop: "4em" }}>
          <LinkBtn href="/">← Back to home</LinkBtn>
        </div>
      </section>

      <CtaSection />
      <Footer />
    </div>
  );
}
