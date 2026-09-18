"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { EASE } from "@/lib/utils";
import type { Project } from "@/lib/projects";
import { FadeIn, RevealLines } from "@/components/anim/text";
import { ParallaxImage } from "@/components/anim/image";
import { TransitionLink } from "@/components/chrome/PageTransition";
import { CtaSection } from "@/components/chrome/CtaSection";
import { Footer } from "@/components/chrome/Footer";
import { useIntroEffect } from "@/components/anim/useIntro";
import { animate } from "framer-motion";

/**
 * Case-study template: hero image un-clips from the top, client/overview/
 * services columns reveal, then alternating copy+image rows and the next-project
 * link at the bottom.
 */
export function ProjectPage({ project }: { project: Project }) {
  const heroImgRef = useRef<HTMLDivElement>(null);
  const nextLinkRef = useRef<HTMLAnchorElement>(null);
  const [nextHovered, setNextHovered] = useState(false);

  /* the next-project card parallaxes like the other case images */
  const { scrollYProgress: nextProgress } = useScroll({
    target: nextLinkRef,
    offset: ["start end", "end start"],
  });
  const nextY = useTransform(nextProgress, [0, 1], ["-20%", "0%"]);

  useIntroEffect(() => {
    const wrap = heroImgRef.current;
    if (!wrap) return;
    const img = wrap.querySelector("img");
    animate(
      wrap,
      {
        clipPath: ["inset(0 0 100% 0)", "inset(0 0 0% 0)"],
      },
      { duration: 1.25, ease: EASE.power4inOut }
    );
    if (img) {
      animate(img, { scale: [1.25, 1] }, { duration: 1.75, ease: EASE.power3out });
    }
  });

  return (
    <div className="main_wrap">
      <div className="cms_intro_container u-container" data-hero="">
        <div
          ref={heroImgRef}
          className="cms_intro_image_wrap"
          style={{ clipPath: "inset(0 0 100% 0)", overflow: "hidden" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="cms_intro_image" src={project.heroImg.src} alt={project.heroImg.alt} />
        </div>
        <div className="cms_intro_bottom grid-col-12">
          <div className="cms_intro_bottom_left">
            <RevealLines className="cms_intro_cpt u-text-sm" trigger="intro" staggerLines={0} delay={0.5}>
              Concept project
            </RevealLines>
            <RevealLines as="h2" className="cms_intro_name u-text-lg" trigger="intro" delay={0.375}>
              {project.client}
            </RevealLines>
          </div>
          <div className="cms_intro_bottom_item">
            <RevealLines className="cms_intro_cpt u-text-sm" trigger="intro" staggerLines={0} delay={0.5}>
              OVERVIEW
            </RevealLines>
            <FadeIn as="p" className="cms_intro_l_desc u-text-base" trigger="intro" delay={0.5}>
              {project.overview}
            </FadeIn>
          </div>
          <div className="cms_intro_bottom_item">
            <RevealLines className="cms_intro_cpt u-text-sm" trigger="intro" staggerLines={0} delay={0.5}>
              SERVICES
            </RevealLines>
            {project.services.map((s) => (
              <FadeIn key={s} className="cms_intro_text u-text-base" trigger="intro" delay={0.5}>
                {s}
              </FadeIn>
            ))}
          </div>
          <div className="cms_intro_bottom_item">
            <RevealLines className="cms_intro_cpt u-text-sm" trigger="intro" staggerLines={0} delay={0.5}>
              Year
            </RevealLines>
            <FadeIn className="cms_intro_text u-text-base" trigger="intro" delay={0.5}>
              {project.year}
            </FadeIn>
          </div>
        </div>
      </div>

      <div className="cms_main_container u-container">
        {/* rows 1 & 2: caption + paragraph + image */}
        {project.rows.slice(0, 2).map((row, i) => (
          <div key={i} className="cms_main_row grid-col-12">
            <RevealLines className="cms_main_cpt u-text-sm" staggerLines={0}>
              {row.cpt}
            </RevealLines>
            <FadeIn as="p" className={`cms_main_paragraph is-${i + 1} u-text-base`}>
              {row.text}
            </FadeIn>
            {row.img && (
              <ParallaxImage
                className={`image_wrap${i === 1 ? " work-2" : ""}`}
                imgClassName={`cms_main_image is-${i + 1}`}
                src={row.img.src}
                alt={row.img.alt}
              />
            )}
          </div>
        ))}

        {/* row 3: image first, static lorem copy */}
        <div className="cms_main_row grid-col-12">
          {project.rows[2].img && (
            <ParallaxImage
              className="image_wrap work-3"
              imgClassName="cms_main_image is-3"
              src={project.rows[2].img.src}
              alt={project.rows[2].img.alt}
            />
          )}
          <div className="cms_main_cpt u-text-sm is-3">{project.rows[2].cpt}</div>
          <p className="cms_main_paragraph u-text-base is-3">{project.rows[2].text}</p>
        </div>

        {/* row 4: solution + result */}
        <div className="cms_main_row grid-col-12">
          <RevealLines className="cms_main_cpt u-text-sm is-4" staggerLines={0}>
            {project.rows[3].cpt}
          </RevealLines>
          <FadeIn as="p" className="cms_main_paragraph u-text-base is-4">
            {project.rows[3].text}
          </FadeIn>
          {project.rows[3].img && (
            <ParallaxImage
              className="image_wrap work-4"
              imgClassName="cms_main_image is-4"
              src={project.rows[3].img.src}
              alt={project.rows[3].img.alt}
            />
          )}
          <RevealLines className="cms_main_cpt u-text-sm" staggerLines={0}>
            {project.result.cpt}
          </RevealLines>
          <RevealLines as="p" className="cms_main_paragraph u-text-md is-5">
            {project.result.text}
          </RevealLines>
        </div>

        {/* next project */}
        <div className="cms_main_row grid-col-12 is-next">
          <div className="cms_main_next_top_wrap">
            <RevealLines className="cms_main_cpt u-text-sm" staggerLines={0}>
              Next Project
            </RevealLines>
            <RevealLines className="cms_main_next_name u-text-lg">
              {project.next.name}
            </RevealLines>
          </div>
          {/* The image must be a direct child of .image_wrap: `is-5` is sized
              `height: 135%`, and an intermediate auto-height wrapper leaves
              that percentage with nothing to resolve against, collapsing the
              image to its natural height. .image_wrap already clips. */}
          <TransitionLink
            ref={nextLinkRef}
            href={`/work/${project.next.slug}`}
            className="image_wrap is-link w-inline-block"
            data-project-link=""
            onPointerEnter={() => setNextHovered(true)}
            onPointerLeave={() => setNextHovered(false)}
          >
            <motion.img
              className="cms_main_image is-5"
              src={project.next.img.src}
              alt={project.next.img.alt}
              loading="eager"
              decoding="async"
              style={{ y: nextY, willChange: "transform" }}
              animate={{ scale: nextHovered ? 1.05 : 1 }}
              transition={{ duration: 0.4, ease: EASE.power2out }}
            />
          </TransitionLink>
          <p className="cms_main_paragraph u-text-md is-last">{project.next.desc}</p>
        </div>
      </div>

      <CtaSection />
      <Footer />
    </div>
  );
}
