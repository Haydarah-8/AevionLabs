"use client";

import { RevealLines } from "@/components/anim/text";
import { LinkBtn } from "@/components/anim/LinkBtn";
import { CtaSection } from "@/components/chrome/CtaSection";
import { Footer } from "@/components/chrome/Footer";
import { ArticleHtml } from "@/components/news/ArticleHtml";
import type { BlogPost } from "@/lib/blog/types";

export function InsightArticle({ post }: { post: BlogPost }) {
  return (
    <div className="main_wrap">
      <div className="hero_container u-container" data-hero="" style={{ minHeight: "auto" }}>
        <div className="hero_top_wrap grid-col-12" style={{ paddingTop: "8em", paddingBottom: "3em" }}>
          <p className="u-text-sm" style={{ marginBottom: "1.5em" }}>
            01 · INSIGHTS
            {post.category ? ` · ${post.category}` : ""}
            {post.sub ? ` · ${post.sub}` : ""}
          </p>
          <RevealLines as="h1" className="hero_heading u-text-lg" trigger="intro" delay={0.15}>
            {post.title}
          </RevealLines>
          <p className="u-text-sm" style={{ marginTop: "1.5em" }}>
            Published {post.date}
          </p>
        </div>
      </div>

      <article className="u-container" style={{ paddingBottom: "5em", maxWidth: "42em" }}>
        <ArticleHtml html={post.html} content={post.content} />
        <div style={{ marginTop: "3em" }}>
          <LinkBtn href="/news">← All insights</LinkBtn>
        </div>
      </article>

      <CtaSection />
      <Footer />
    </div>
  );
}
