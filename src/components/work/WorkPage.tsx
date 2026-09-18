"use client";

import { motion, useMotionValue } from "framer-motion";
import { useEffect, useRef } from "react";
import { FadeIn } from "@/components/anim/text";
import { SvgReveal } from "@/components/anim/svg";
import { TransitionLink } from "@/components/chrome/PageTransition";
import { useIsDesktop } from "@/components/anim/useIntro";
import { ProjectsTopSvg } from "@/components/svg/generated";
import { PROJECT_IMAGES } from "@/lib/images";

const PROJECTS = [
  { slug: "/work/orbit", name: "Orbit", year: "Concept · 2026", image: PROJECT_IMAGES.orbit.hero },
  { slug: "/work/prism", name: "Prism", year: "Concept · 2026", image: PROJECT_IMAGES.prism.hero },
  { slug: "/work/baseplate", name: "Baseplate", year: "Concept · 2026", image: PROJECT_IMAGES.baseplate.hero },
  { slug: "/work/forge", name: "Forge", year: "Concept · 2026", image: PROJECT_IMAGES.forge.hero },
  { slug: "/work/folio", name: "Folio", year: "Concept · 2026", image: PROJECT_IMAGES.folio.hero },
];

/**
 * Work index: big wordmark hero, then the infinite auto-scrolling project rail -
 * draggable, with momentum that eases back to the base drift.
 */
export function WorkPage() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const isDesktop = useIsDesktop();

  useEffect(() => {
    if (!isDesktop) return;
    const wrap = wrapRef.current;
    const list = listRef.current;
    if (!wrap || !list) return;

    let pos = 0;
    const base = -45; // px/second
    let speed = base;
    let dragging = false;
    /* Stays true from the moment a drag starts until the next pointerdown, so
       the click that follows a drag can be suppressed while a plain click on a
       project still reaches its link. */
    let didDrag = false;
    let pointerDown = false;
    let startX = 0;
    const DRAG_THRESHOLD = 5;
    let lastPointerX = 0;
    let raf = 0;
    let last = performance.now();
    let singleWidth = list.scrollWidth / 2;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!dragging) speed += (base - speed) * 0.05;
      pos += speed * dt * (dragging ? 0 : 1);
      if (pos <= -singleWidth) pos += singleWidth;
      if (pos > 0) pos -= singleWidth;
      x.set(pos);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onPointerDown = (e: PointerEvent) => {
      pointerDown = true;
      dragging = false;
      didDrag = false;
      startX = e.clientX;
      lastPointerX = e.clientX;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!pointerDown) return;

      /* Capture only once the pointer has actually travelled. Capturing on
         pointerdown re-targets the follow-up events at the rail, which ate the
         click before it could reach the project link. */
      if (!dragging) {
        if (Math.abs(e.clientX - startX) < DRAG_THRESHOLD) return;
        dragging = true;
        didDrag = true;
        wrap.setPointerCapture(e.pointerId);
        wrap.style.cursor = "grabbing";
      }

      const delta = e.clientX - lastPointerX;
      lastPointerX = e.clientX;
      pos += delta;
      if (pos <= -singleWidth) pos += singleWidth;
      if (pos > 0) pos -= singleWidth;
      speed = delta * 60; // convert to px/s momentum
      x.set(pos);
    };

    const onPointerUp = (e: PointerEvent) => {
      pointerDown = false;
      wrap.style.cursor = "grab";
      if (dragging) {
        try {
          wrap.releasePointerCapture(e.pointerId);
        } catch {}
      }
      dragging = false;
    };

    /* Swallow the click that ends a drag so releasing the pointer over a card
       doesn't navigate; a click without movement passes straight through. */
    const onClickCapture = (e: MouseEvent) => {
      if (!didDrag) return;
      e.preventDefault();
      e.stopPropagation();
    };

    wrap.style.cursor = "grab";
    wrap.addEventListener("pointerdown", onPointerDown);
    wrap.addEventListener("pointermove", onPointerMove);
    wrap.addEventListener("pointerup", onPointerUp);
    wrap.addEventListener("pointercancel", onPointerUp);
    wrap.addEventListener("click", onClickCapture, true);

    const ro = new ResizeObserver(() => {
      singleWidth = list.scrollWidth / 2;
    });
    ro.observe(wrap);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      wrap.removeEventListener("pointerdown", onPointerDown);
      wrap.removeEventListener("pointermove", onPointerMove);
      wrap.removeEventListener("pointerup", onPointerUp);
      wrap.removeEventListener("pointercancel", onPointerUp);
      wrap.removeEventListener("click", onClickCapture, true);
    };
  }, [isDesktop, x]);

  const items = isDesktop ? [...PROJECTS, ...PROJECTS] : PROJECTS;

  return (
    <div className="main_wrap">
      <div className="projects_container" data-hero="">
        <div className="projects_top_wrap grid-col-12 u-container">
          <FadeIn className="projects_top_cpt u-text-base" trigger="intro" delay={0.5}>
            A curated set of projects shaped by our approach.
          </FadeIn>
          <div className="u-svg-wrap" style={{ overflow: "hidden" }}>
            <SvgReveal trigger="intro" mode="slide" perPathStagger={0}>
              <ProjectsTopSvg />
            </SvgReveal>
          </div>
        </div>
        <div className="projects_list_wrap">
          <div ref={wrapRef} className="projects_list_cms_wrap" style={{ overflow: "hidden" }}>
            <motion.div
              ref={listRef}
              className="projects_list_cms_list"
              style={{ x, willChange: "transform" }}
            >
              {items.map((p, i) => (
                <div key={`${p.slug}-${i}`} className="projects_list_cms_item">
                  <div className="projects_list_cms_item_top">
                    <div className="projects_list_item_cpt u-text-sm">{p.name}</div>
                    <div className="projects_list_item_cpt u-text-sm">{p.year}</div>
                  </div>
                  <TransitionLink
                    href={p.slug}
                    className="projects_list_cms_item_wrap w-inline-block"
                    draggable={false}
                  >
                    {/* hover zoom via CSS so the ticking marquee never re-renders */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="projects_list_cms_item_image"
                      src={p.image.src}
                      alt={p.image.alt}
                      draggable={false}
                    />
                  </TransitionLink>
                </div>
              ))}
            </motion.div>
          </div>
          <div className="projects_main_bottom_wrap u-container">
            <div className="projects_main_bottom_cpt u-text-sm">projects (5)</div>
            <div className="projects_main_bottom_cpt u-text-sm">2026</div>
          </div>
        </div>
      </div>
    </div>
  );
}
