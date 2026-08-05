"use client";

import { FadeIn, RevealLines } from "@/components/anim/text";
import { LinkBtn } from "@/components/anim/LinkBtn";
import { Footer } from "@/components/chrome/Footer";
import { CtaSection } from "@/components/chrome/CtaSection";

export default function NotFound() {
  return (
    <div className="main_wrap">
      <div className="hero_container u-container" data-hero="" style={{ minHeight: "70vh" }}>
        <div className="hero_top_wrap grid-col-12" style={{ paddingTop: "8em" }}>
          <RevealLines as="h1" className="hero_heading u-text-lg" trigger="intro" delay={0.2}>
            404 · this page doesn&apos;t exist.
          </RevealLines>
          <FadeIn className="u-text-base" trigger="intro" delay={0.5}>
            The page you&apos;re looking for has been moved, removed, or never existed at
            all.
          </FadeIn>
          <div className="hero_btn_wrap" style={{ marginTop: "2em" }}>
            <LinkBtn href="/">Back to home →</LinkBtn>
          </div>
        </div>
      </div>
      <CtaSection />
      <Footer />
    </div>
  );
}
