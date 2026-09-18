"use client";

import { animate, useInView } from "framer-motion";
import { SITE_IMAGES } from "@/lib/images";
import { useEffect, useLayoutEffect, useRef } from "react";
import { EASE } from "@/lib/utils";
import { FadeIn, RevealLines } from "@/components/anim/text";
import { ImageReveal } from "@/components/anim/image";
import { LinkBtn } from "@/components/anim/LinkBtn";
import { AboutTopSvg } from "@/components/svg/generated";

/**
 * "From vision to reality" block: the asterisk mark drops in, the display
 * headline reveals, then the image un-clips beside the studio copy.
 */
export function HomeAbout() {
  const asteriskRef = useRef<HTMLDivElement>(null);
  const asteriskInView = useInView(asteriskRef, {
    once: true,
    margin: "0px 0px -40% 0px",
  });
  const played = useRef(false);

  /* park it above the mask BEFORE first paint, otherwise it shows, snaps
     out of view, then animates back in */
  useLayoutEffect(() => {
    const svg = asteriskRef.current?.querySelector("svg");
    if (svg) svg.style.transform = "translateY(-120%)";
  }, []);

  useEffect(() => {
    const wrap = asteriskRef.current;
    if (!wrap || !asteriskInView || played.current) return;
    played.current = true;
    const svg = wrap.querySelector("svg");
    if (!svg) return;
    animate(
      svg,
      { transform: ["translateY(-120%)", "translateY(0%)"] },
      { duration: 1, delay: 0.5, ease: EASE.power4out }
    );
  }, [asteriskInView]);

  return (
    <div className="about_container u-container">
      {/* the two .about_top_heading_svg wordmarks the original ships here are
          `display: none` at every breakpoint - the live headline is the text
          below, so they're omitted rather than shipped and animated unseen */}
      <div className="about_top_wrap grid-col-12">
        <div ref={asteriskRef} className="about_top_svg_wrap" style={{ overflow: "hidden" }}>
          <AboutTopSvg />
        </div>
        <RevealLines className="about_top_heading_text u-text-xl" staggerLines={0}>
          from vision to reality
        </RevealLines>
      </div>
      <div className="about_main_wrap grid-col-12">
        <ImageReveal
          className="about_main_img_wrap"
          imgClassName="about_main_img"
          src={SITE_IMAGES.homeAbout.src}
          alt={SITE_IMAGES.homeAbout.alt}
          parallax
        />
        <div className="about_main_content_wrap">
          <RevealLines as="h2" className="about_main_content_heading u-text-lg">
            Good sites are engineering, not decoration.
          </RevealLines>
          <div className="about_main_text_wrap">
            <RevealLines className="about_main_content_cpt u-text-sm" staggerLines={0}>
              04 · about us
            </RevealLines>
            <FadeIn className="about_main_right_wrap">
              <div className="about_main_paragraph_wrap">
                <p className="about_main_paragraph u-text-base">
                  AEVION LABS is a small creative studio built on the belief that visual
                  identity is never superficial. It&apos;s the first and most persistent
                  thing a brand communicates.
                </p>
                <p className="about_main_paragraph u-text-base">
                  We work slowly and selectively. We ask difficult questions before we
                  make anything, and we build visual systems that hold their conviction
                  after the project end.
                </p>
              </div>
              <LinkBtn href="/about">Learn more about us →</LinkBtn>
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  );
}
