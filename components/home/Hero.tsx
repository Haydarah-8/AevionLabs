"use client";

import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { EASE } from "@/lib/utils";
import { RevealLines } from "@/components/anim/text";
import { SvgReveal } from "@/components/anim/svg";
import { useIntroEffect, useIntroToken } from "@/components/anim/useIntro";
import { useContactModal } from "@/components/chrome/ContactModal";
import { splitLines } from "@/components/anim/text";
import { useFontsReady } from "@/components/anim/useIntro";
import { useBtnLinesHover } from "@/components/anim/LinkBtn";
import { HERO_IMAGES } from "@/lib/images";
import { HeroSvg0, HeroSvg1, HeroSvg2 } from "@/components/svg/generated";


/**
 * Home hero: the AEVION LABS wordmark slides in piece by piece, the stacked image
 * follows the mouse across the hero and cycles on click, and the heading,
 * button and "scroll" caption reveal after.
 */
export function HomeHero({ overlayOpacity }: { overlayOpacity: MotionValue<number> }) {
  const { openModal } = useContactModal();
  const heroRef = useRef<HTMLDivElement>(null);
  const imgWrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const fontsReady = useFontsReady();
  const introToken = useIntroToken();
  const [btnPrepared, setBtnPrepared] = useState(false);
  const btnPlayed = useRef(false);
  useBtnLinesHover(btnRef);
  const [zOrder, setZOrder] = useState<number[]>(HERO_IMAGES.map((_, i) => (i === 0 ? 1 : 0)));
  const currentIndex = useRef(0);
  const zCounter = useRef(1);

  /* centered via motion values so mouse-follow x and intro scale compose
     with the -50%/-50% translate instead of overwriting it; the follow is a
     spring retargeted per mousemove (no per-event tween allocation) */
  const followTarget = useMotionValue(0);
  const followX = useSpring(followTarget, { stiffness: 90, damping: 22, mass: 1 });
  const wrapScale = useMotionValue(0);
  const wrapTransform = useMotionTemplate`translate(calc(-50% + ${followX}px), -50%) scale(${wrapScale})`;

  /* --- mouse-follow image stack --- */
  useEffect(() => {
    const hero = heroRef.current;
    const wrap = imgWrapRef.current;
    if (!hero || !wrap) return;

    let maxTravel = 0;
    const recalc = () => {
      const rect = hero.getBoundingClientRect();
      if (!rect.width) return;
      const paddingPx = parseFloat(getComputedStyle(hero).fontSize) * 1.25;
      maxTravel = Math.max(0, (rect.width - wrap.offsetWidth) / 2 - paddingPx);
    };
    recalc();
    const ro = new ResizeObserver(recalc);
    ro.observe(hero);

    const onMove = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const normalized = (e.clientX - centerX) / (rect.width / 2);
      const x = Math.max(-maxTravel, Math.min(maxTravel, normalized * maxTravel));
      followTarget.set(x);
    };
    hero.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      hero.removeEventListener("mousemove", onMove);
      ro.disconnect();
    };
  }, [followTarget]);

  const cycleImage = () => {
    const next = (currentIndex.current + 1) % HERO_IMAGES.length;
    zCounter.current += 1;
    currentIndex.current = next;
    setZOrder((prev) => {
      const copy = [...prev];
      copy[next] = zCounter.current;
      return copy;
    });
    const wrap = imgWrapRef.current;
    const img = wrap?.querySelectorAll<HTMLElement>(".hero_bg_img")[next];
    if (img) {
      animate(
        img,
        { scale: [0, 1.01], opacity: 1 },
        { duration: 0.5, ease: EASE.power3out }
      );
    }
  };

  /* --- hero button prep + intro reveal --- */
  useEffect(() => {
    const btn = btnRef.current;
    if (!btn || !fontsReady || btnPrepared) return;
    btn.querySelectorAll<HTMLElement>(".link_btn_text").forEach((t) => {
      splitLines(t);
      t.querySelectorAll<HTMLElement>(".split-line").forEach(
        (l) => (l.style.transform = "translateY(120%)")
      );
      t.style.visibility = "visible";
    });
    setBtnPrepared(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontsReady]);

  /* image pops in as soon as the intro fires */
  useIntroEffect(() => {
    animate(wrapScale, 1, { duration: 1, delay: 1.2, ease: EASE.power2out });
  });

  /* button waits for BOTH the intro and the line-split, in either order */
  useEffect(() => {
    const btn = btnRef.current;
    if (!btn || !introToken || !btnPrepared || btnPlayed.current) return;
    btnPlayed.current = true;
    const lines = btn.querySelectorAll<HTMLElement>(".split-line");
    const btnLines = btn.querySelectorAll<HTMLElement>(".link_btn_line");
    if (lines.length) {
      animate(
        lines,
        { transform: ["translateY(120%)", "translateY(0%)"] },
        { duration: 1, delay: 1.1, ease: EASE.power4out }
      );
    }
    if (btnLines.length) {
      animate(
        btnLines,
        { clipPath: ["inset(0 100% 0 0)", "inset(0 0% 0 0)"] },
        { duration: 1, delay: 1.2, ease: EASE.power4inOut }
      );
    }
  }, [introToken, btnPrepared]);

  return (
    <div ref={heroRef} className="hero_container u-container" data-hero="">
      <div className="hero_heading_wrap">
        <motion.div
          ref={imgWrapRef}
          className="hero_bg_img_wrap"
          data-hero-img=""
          onClick={cycleImage}
          style={{ transform: wrapTransform, willChange: "transform" }}
        >
          {HERO_IMAGES.map((img, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={img.src}
              className="hero_bg_img"
              src={img.src}
              alt={img.alt}
              draggable={false}
              style={{ zIndex: zOrder[i], userSelect: "none" }}
            />
          ))}
        </motion.div>
        <div className="hero_svg_wrap grid-col-12">
          <div className="hero_text_wrap desktop" style={{ overflow: "hidden" }}>
            <SvgReveal trigger="intro" mode="slide" perPathStagger={0}>
              <HeroSvg0 />
            </SvgReveal>
          </div>
          <div className="hero_text_wrap desktop" style={{ overflow: "hidden" }}>
            <SvgReveal trigger="intro" mode="slide" perPathStagger={0} delay={0.4}>
              <HeroSvg1 />
            </SvgReveal>
          </div>
          <div className="hero_text_wrap desktop" style={{ overflow: "hidden" }}>
            <SvgReveal trigger="intro" mode="slide" perPathStagger={0} delay={0.8}>
              <HeroSvg2 />
            </SvgReveal>
          </div>
        </div>
      </div>
      <div className="hero_top_wrap grid-col-12">
        <RevealLines
          as="h1"
          className="hero_heading u-text-md"
          trigger="intro"
          delay={1.2}
        >
          We design and build websites that load fast, convert better, and stay easy to
          change long after launch.
        </RevealLines>
        <div className="hero_btn_wrap">
          <motion.button
            ref={btnRef}
            type="button"
            className="btn_btn hero"
            onClick={openModal}
            initial="rest"
            whileHover="hover"
            animate="rest"
          >
            <div className="link_btn_text u-text-md" style={{ visibility: "hidden" }}>
              Start a project
            </div>
            <div className="link_btn_text u-text-md" style={{ visibility: "hidden" }}>
              →
            </div>
            <div className="link_btn_line hero" style={{ clipPath: "inset(0 100% 0 0)" }} />
            <div className="link_btn_line is-2 hero" />
          </motion.button>
        </div>
        <RevealLines
          className="hero_top_cpt u-text-sm"
          trigger="intro"
          delay={1.2}
          staggerLines={0}
        >
          scroll ↓
        </RevealLines>
      </div>
      <motion.div className="hero_overlay" style={{ opacity: overlayOpacity }} />
    </div>
  );
}
