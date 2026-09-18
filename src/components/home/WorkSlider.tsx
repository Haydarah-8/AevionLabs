"use client";

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { EASE } from "@/lib/utils";
import { RevealLines, FadeIn } from "@/components/anim/text";
import { LinkBtn } from "@/components/anim/LinkBtn";
import { TransitionLink } from "@/components/chrome/PageTransition";
import { useCursorTarget } from "@/components/chrome/Cursor";
import { PROJECT_IMAGES } from "@/lib/images";

const CASES = [
  {
    slug: "/work/prism",
    title: "Prism",
    number: "01",
    desc: "An analytics product with a site that explains the decision, not the feature list.",
    year: "2026",
    services: ["Product & UX", "Design System", "Next.js Build"],
    img: PROJECT_IMAGES.prism.hero,
    bg: PROJECT_IMAGES.prism.bg,
  },
  {
    slug: "/work/forge",
    title: "Forge",
    number: "02",
    desc: "Six thousand products, and a search that finally returns the right part.",
    year: "2026",
    services: ["Information Architecture", "Headless CMS", "Next.js Build"],
    img: PROJECT_IMAGES.forge.hero,
    bg: PROJECT_IMAGES.forge.bg,
  },
  {
    slug: "/work/baseplate",
    title: "Baseplate",
    number: "03",
    desc: "A component library for a team with four products and four different buttons.",
    year: "2026",
    services: ["Design System", "Component Library", "Documentation"],
    img: PROJECT_IMAGES.baseplate.hero,
    bg: PROJECT_IMAGES.baseplate.bg,
  },
];

const CLOSED = "inset(0 50% 0 50%)";
const OPEN = "inset(0 0% 0 0%)";

/**
 * "Selected work" - the section pins for 200% of extra scroll while the center
 * image un-clips through the three case studies; title/number/copy swap as the
 * index crosses 0.5 and 1.0, and the full-bleed background follows.
 */
export function WorkSlider({
  workOverlayOpacity,
}: {
  workOverlayOpacity: MotionValue<number>;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const imgWrapperRef = useRef<HTMLDivElement>(null);
  const titleLineRef = useRef<HTMLSpanElement>(null);
  const numberLineRef = useRef<HTMLSpanElement>(null);
  const swappedOnce = useRef(false);
  const metaRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [display, setDisplay] = useState(CASES[0]);
  const indexRef = useRef(0);
  const lastProgressRef = useRef(0);
  const [hovered, setHovered] = useState<number | null>(null);

  useCursorTarget(imgWrapperRef, { text: "View Project" });

  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ["start start", "end end"],
  });

  /* Framer re-measures this container as the page settles (fonts, images) and
     can briefly report a progress value from a stale layout. Off-screen that
     tripped a threshold crossing, so the case flipped to another project and
     then corrected itself back to the first card. Only honour progress once the pinned
     section is actually on screen. */
  const pinInView = useInView(outerRef);
  const pinInViewRef = useRef(false);
  pinInViewRef.current = pinInView;

  /* The clips read this gated copy rather than raw progress. Raw progress
     carries the same pre-settle measurement noise that used to flip the text,
     which made images 2 and 3 snap open and shut before the section was ever
     reached. */
  const gatedProgress = useMotionValue(0);

  /* Both layers wipe upward from the bottom edge - `inset(100% 0 0 0)` is a
     zero-height sliver at the bottom, opening to full - matching the
     stylesheet's own `clip-path` on .is-2/.is-3. Image 2 takes the first half
     of the pin, image 3 the second, both linear, so each step reads the same. */
  const clip2 = useTransform(gatedProgress, [0, 0.5], ["inset(100% 0 0 0)", "inset(0% 0 0 0)"]);
  const clip3 = useTransform(gatedProgress, [0.5, 1], ["inset(100% 0 0 0)", "inset(0% 0 0 0)"]);

  /* Threshold *crossings*, not a plain range test. Scrolling up, the original
     holds case 3 until progress falls back through 0.5 and case 1 until 0.001,
     so the transitions are symmetrical with the way down. A range test flipped
     out of case 3 the instant progress left 0.999, which made the last step
     behave unlike the two before it. */
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const last = lastProgressRef.current;
    /* track progress even while off-screen so the first real crossing is
       computed against the right previous value */
    lastProgressRef.current = p;
    if (!pinInViewRef.current) return;
    gatedProgress.set(p);

    const goingDown = p > last;
    const crossed = (t: number) =>
      goingDown ? last < t && p >= t : last >= t && p < t;

    let next = indexRef.current;
    if (goingDown) {
      if (crossed(0.5)) next = 1;
      if (crossed(0.999)) next = 2;
    } else {
      if (crossed(0.5)) next = 1;
      if (crossed(0.001)) next = 0;
    }

    if (next !== indexRef.current) {
      indexRef.current = next;
      setIndex(next);
    }
  });

  /* old copy rises out, then the new case is committed */
  useEffect(() => {
    const lines = [titleLineRef.current, numberLineRef.current].filter(
      (l): l is HTMLSpanElement => !!l
    );
    const fadeEls = sectionRef.current?.querySelectorAll<HTMLElement>("[data-work-fade]");

    /* Already showing this case - which also covers a swap that was cancelled
       part-way (scrolled back across the threshold). Settle whatever the
       cancelled exit left behind instead of stranding the copy off-screen. */
    if (display === CASES[index]) {
      if (lines.length) {
        animate(
          lines,
          { transform: "translateY(0%)" },
          { duration: 0.7, ease: EASE.power4out }
        );
      }
      if (fadeEls?.length) animate(fadeEls, { opacity: 1 }, { duration: 0.25 });
      return;
    }

    if (fadeEls?.length) animate(fadeEls, { opacity: 0 }, { duration: 0.25 });
    if (lines.length) {
      animate(
        lines,
        { transform: "translateY(-120%)" },
        { duration: 0.7, ease: EASE.power4out }
      );
    }

    const t = setTimeout(() => setDisplay(CASES[index]), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  /* new copy drops back in under the mask */
  useEffect(() => {
    const lines = [titleLineRef.current, numberLineRef.current].filter(
      (l): l is HTMLSpanElement => !!l
    );
    const fadeEls = sectionRef.current?.querySelectorAll<HTMLElement>("[data-work-fade]");
    if (fadeEls?.length) animate(fadeEls, { opacity: 1 }, { duration: 0.25 });
    if (!lines.length) return;

    /* first paint starts settled - only swaps animate */
    if (!swappedOnce.current) {
      swappedOnce.current = true;
      lines.forEach((l) => (l.style.transform = "translateY(0%)"));
      return;
    }

    lines.forEach((l) => (l.style.transform = "translateY(120%)"));
    animate(
      lines,
      { transform: ["translateY(120%)", "translateY(0%)"] },
      { duration: 0.7, ease: EASE.power4out }
    );
  }, [display]);

  return (
    <div ref={sectionRef} className="work_container">
      <div className="work_top_wrap grid-col-12 u-container">
        <div className="work_top_text_wrap">
          <RevealLines className="work_top_cpt u-text-sm" staggerLines={0}>
            02 · featured projects
          </RevealLines>
          <FadeIn className="work_top_paragraph u-text-base">
            Each project begins with a different question and ends in the same place:
            something that couldn&apos;t look any other way.
          </FadeIn>
        </div>
        <RevealLines className="work_top_text u-text-xl" staggerLines={0} delay={0.5}>
          selected work
        </RevealLines>
      </div>

      {/* pinned for +200% */}
      <div ref={outerRef} style={{ height: "300vh", position: "relative" }}>
        <div className="work_main_wrap" style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
          <div className="work_main_content_wrap u-container">
            <div className="work_main_mid_wrap">
              <div className="work_main_mid_inner_wrap grid-col-12">
                <div className="work_main_mid_content_wrap">
                  <div className="work_main_img_cpt u-text-sm">(Case Study)</div>
                  <div ref={imgWrapperRef} className="work_main_img_wrapper">
                    {CASES.map((c, i) => {
                      const clip = i === 1 ? clip2 : i === 2 ? clip3 : undefined;
                      return (
                        <motion.div
                          key={c.slug}
                          className={`work_collection_list_wrap is-${i + 1}`}
                          /* z-index comes from .is-2 / .is-3 in the stylesheet
                             (2 and 3) - hardcoding 2 on both left image 3
                             relying on DOM order to stack over image 2 */
                          style={
                            clip
                              ? { clipPath: clip, scale: 1.01, willChange: "clip-path" }
                              : undefined
                          }
                          onPointerEnter={() => setHovered(i)}
                          onPointerLeave={() => setHovered(null)}
                        >
                          <TransitionLink
                            href={c.slug}
                            className={`work_main_img_link is-${i + 1} w-inline-block`}
                          >
                            <motion.img
                              className={`work_main_img${i > 0 ? ` is-${i + 1}` : ""}`}
                              src={c.img.src}
                              alt={c.img.alt}
                              animate={{
                                scale: hovered === null ? 1 : hovered === i ? 1.1 : 1.01,
                              }}
                              transition={{ duration: 0.25, ease: EASE.power2out }}
                            />
                            <motion.div
                              className={`work_img_overlay is-${i + 1}`}
                              animate={{
                                opacity: hovered === null ? 0 : hovered === i ? 0 : 0.75,
                              }}
                              transition={{ duration: 0.25 }}
                            />
                          </TransitionLink>
                        </motion.div>
                      );
                    })}
                  </div>
                  <p className="work_main_mid_desc u-text-base" data-work-fade="" data-work-desc="">
                    {display.desc}
                  </p>
                </div>
                {/* Masked by hand instead of via SplitType. SplitType.revert()
                    restores the markup captured at split time, which clobbered
                    React's new text and snapped the title back to the first card on
                    every swap. React owns the text; we only move the inner
                    span. */}
                <div className="work_main_mid_text u-text-lg" data-work-title="">
                  <span className="split-line-mask">
                    <span ref={titleLineRef} className="split-line" style={{ display: "block" }}>
                      {display.title}
                    </span>
                  </span>
                </div>
                <div className="work_main_mid_cnt u-text-lg" data-work-number="">
                  <span className="split-line-mask">
                    <span ref={numberLineRef} className="split-line" style={{ display: "block" }}>
                      {display.number}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <div ref={metaRef} className="work_main_bottom_wrap grid-col-12">
              <div className="work_main_bottom_list">
                {display.services.map((s) => (
                  <div key={s} className="work_main_bottom_list_cpt u-text-sm" data-work-fade="">
                    {s}
                  </div>
                ))}
              </div>
              <div className="work_main_btn_wrap">
                <LinkBtn href="/work" lineClassName="work">
                  See more →
                </LinkBtn>
              </div>
              <div className="work_main_bottom_cpt u-text-base" data-work-fade="" data-work-year="">
                {display.year}
              </div>
            </div>
          </div>

          {CASES.map((c, i) => (
            <motion.div
              key={c.slug}
              className={`work_main_bg is-${i + 1}`}
              style={{ zIndex: i, willChange: "clip-path" }}
              initial={false}
              animate={{ clipPath: i === 0 ? OPEN : index >= i ? OPEN : CLOSED }}
              transition={{ duration: 0.75, ease: index >= i ? EASE.power3out : EASE.power3inOut }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={`work_main_bg_img is-${i + 1}`} src={c.bg.src} alt={c.bg.alt} />
            </motion.div>
          ))}
          <div className="work_main_bg_overlay" />
        </div>
      </div>
      <motion.div className="work_overlay" style={{ opacity: workOverlayOpacity }} />
    </div>
  );
}
