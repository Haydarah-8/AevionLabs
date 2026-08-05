"use client";

import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { SITE_IMAGES } from "@/lib/images";
import { useEffect, useRef, useState } from "react";
import { FadeIn, RevealLines } from "@/components/anim/text";
import { ImageReveal } from "@/components/anim/image";
import { LinkBtn } from "@/components/anim/LinkBtn";
import { useIsDesktop } from "@/components/anim/useIntro";
import { IntroMainSvg } from "@/components/svg/generated";

function SvgDrift({ y }: { y: MotionValue<string> }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const svg = ref.current?.querySelector("svg");
    if (!svg) return;
    const unsub = y.on("change", (v) => {
      svg.style.translate = `0 ${v}`;
    });
    return unsub;
  }, [y]);
  return (
    <span ref={ref} style={{ display: "contents" }}>
      <IntroMainSvg />
    </span>
  );
}

/**
 * "Meet AEVION LABS" section. It covers the hero (slides to -30% with a negative
 * bottom margin) while the hero overlay darkens behind it.
 */
export function HomeIntro({
  onProgress,
}: {
  onProgress?: (mv: MotionValue<number>) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isDesktop = useIsDesktop();
  const [marginBottom, setMarginBottom] = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", isDesktop ? "-30%" : "0%"]);

  /* slow drift of the background monogram while the section scrolls through */
  const { scrollYProgress: drift } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const svgY = useTransform(drift, [0, 1], ["0%", "-35%"]);

  useEffect(() => {
    onProgress?.(scrollYProgress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollYProgress]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !isDesktop) {
      setMarginBottom(0);
      return;
    }
    const ro = new ResizeObserver(() => setMarginBottom(-(el.offsetHeight * 0.3)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [isDesktop]);

  return (
    <motion.div
      ref={ref}
      className="intro_container u-container"
      style={{ y, marginBottom: isDesktop ? marginBottom : undefined, position: "relative", zIndex: 2 }}
    >
      <div className="intro_main_wrap grid-col-12">
        <div className="intro_main_text_wrap">
          <div className="intro_main_heading_wrap">
            <RevealLines as="h2" className="intro_main_heading u-text-lg is-2">
              One team for strategy, design and code, because handoffs are where projects go wrong.
            </RevealLines>
            <RevealLines className="intro_main_bottom_cpt u-text-sm is-d" staggerLines={0}>
              01 · meet AEVION LABS
            </RevealLines>
          </div>
          <div className="intro_main_bottom_wrap">
            <RevealLines className="intro_main_bottom_cpt u-text-sm is-m" staggerLines={0}>
              01 · meet AEVION LABS
            </RevealLines>
            <ImageReveal
              className="intro_main_img_wrap"
              imgClassName="intro_main_img"
              src={SITE_IMAGES.homeIntro.src}
              alt={SITE_IMAGES.homeIntro.alt}
              parallax
            />
            <FadeIn className="intro_main_bottom_text_wrap">
              <div className="intro_main_bottom_text_top">
                <p className="intro_main_bottom_text u-text-base">
                  Most sites fail quietly. They load slowly, nobody can update them without a
                  developer, and the traffic you pay for leaves before it converts. Rarely
                  because of one bad decision. Usually a dozen small ones.
                </p>
                <p className="intro_main_bottom_text u-text-base">
                  We handle the strategy, the design and the engineering ourselves, so there is
                  no gap between what was planned and what ships, and one team
                  accountable when you need something changed.
                </p>
              </div>
              <LinkBtn href="/about">Get to know us →</LinkBtn>
            </FadeIn>
          </div>
        </div>
        <SvgDrift y={svgY} />
      </div>
      <div className="u-separator intro" />
    </motion.div>
  );
}
