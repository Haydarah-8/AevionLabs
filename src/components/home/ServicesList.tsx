"use client";

import { motion, type MotionValue } from "framer-motion";
import { useRef, useState } from "react";
import { EASE } from "@/lib/utils";
import { RevealLines } from "@/components/anim/text";
import { CoverSection } from "@/components/anim/CoverSection";
import { useCursorTarget } from "@/components/chrome/Cursor";
import { TransitionLink } from "@/components/chrome/PageTransition";
import { SvcMainItemSvg } from "@/components/svg/generated";

const SERVICES = [
  {
    number: "(01)",
    name: "Strategy & UX",
    cpt: "Foundation",
    text: "The expensive mistakes happen before anyone opens a design tool. We settle them first.",
    list: [
      "Discovery and stakeholder interviews",
      "Information architecture",
      "User flows and wireframes",
      "Conversion mapping",
      "Success metrics agreed up front",
    ],
  },
  {
    number: "(02)",
    name: "Design Systems",
    cpt: "Structure",
    text: "Interfaces built from reusable parts, so your tenth page costs a fraction of your first.",
    list: [
      "Interface and interaction design",
      "Component libraries",
      "Typography and colour systems",
      "Responsive layout rules",
      "Design tokens and developer handoff",
    ],
  },
  {
    number: "(03)",
    name: "Web Development",
    cpt: "Engineering",
    text: "We write the code as well as the design, so nothing is lost in translation between them.",
    list: [
      "Next.js and React builds",
      "Headless CMS your team can actually use",
      "API and third-party integration",
      "Analytics and conversion tracking",
      "Semantic, accessible markup",
    ],
  },
  {
    number: "(04)",
    name: "Performance & Care",
    cpt: "Momentum",
    text: "Launch is the start. We keep the site fast, current, and yours to walk away with.",
    list: [
      "Core Web Vitals tuning",
      "WCAG accessibility audits",
      "Ongoing support and retainers",
      "Content and feature updates",
      "Full handover, no lock-in",
    ],
  },
];

/**
 * Home services rows: hovering a row raises a dark overlay, flips the row to
 * white text, swaps the arrow with a diagonal clone, and reveals the hidden
 * details. The whole block links to /services with the "Learn More" cursor.
 */
export function HomeServices({
  onProgress,
}: {
  onProgress?: (mv: MotionValue<number>) => void;
}) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  useCursorTarget(linkRef, { text: "Learn More" });

  return (
    <CoverSection className="svc_container" zIndex={10} onProgress={onProgress}>
      <div className="svc_top_wrap grid-col-12 u-container">
        <RevealLines className="svc_top_cpt u-text-sm" staggerLines={0}>
          03 · SERVICES
        </RevealLines>
        <RevealLines as="h3" className="svc_top_heading u-text-md">
          Strategy, design and engineering under one roof, so the site that launches is
          the site that was planned.
        </RevealLines>
      </div>
      <TransitionLink ref={linkRef} href="/services" className="svc_main_wrap w-inline-block">
        <div className="u-separator is-1 is-hero" />
        {SERVICES.map((s, i) => (
          <ServiceRow key={s.name} service={s} index={i} />
        ))}
      </TransitionLink>
    </CoverSection>
  );
}

function ServiceRow({
  service,
  index,
}: {
  service: (typeof SERVICES)[number];
  index: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <div
        className="svc_main_item"
        style={{ cursor: "pointer" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <motion.div
          className={`svc_main_item_content_wrap u-container grid-col-12${
            index === 0 ? " is-1" : index === 1 ? " is-2" : ""
          }`}
          animate={{ color: hovered ? "var(--color-white)" : "var(--color-black)" }}
          transition={{ duration: 0.375 }}
        >
          <div className="svc_main_item_cnt u-text-lg">{service.number}</div>
          {/* zIndex 1 on the spans keeps the arrows above the hover overlay -
              their transforms create stacking contexts that would otherwise
              trap the svg's own z-index beneath it */}
          <div className="svc_main_item_svg_wrap" style={{ position: "relative", overflow: "hidden" }}>
            <motion.span
              style={{ display: "inline-flex", position: "relative", zIndex: 1, willChange: "transform" }}
              animate={{ x: hovered ? "120%" : "0%" }}
              transition={{
                duration: hovered ? 0.5 : 0.75,
                ease: EASE.power4out,
                delay: hovered ? 0 : 0.2,
              }}
            >
              <SvcMainItemSvg />
            </motion.span>
            <motion.span
              style={{ position: "absolute", inset: 0, display: "inline-flex", zIndex: 1, willChange: "transform" }}
              initial={{ x: "-120%", y: "120%", rotate: -45 }}
              animate={
                hovered
                  ? { x: "0%", y: "0%", rotate: -45 }
                  : { x: "-120%", y: "120%", rotate: -45 }
              }
              transition={{
                duration: hovered ? 0.5 : 0.75,
                ease: EASE.power4out,
                delay: hovered ? 0.2 : 0,
              }}
            >
              <SvcMainItemSvg />
            </motion.span>
          </div>
          <div className="svc_main_hidden_outer_wrap">
            <div className="svc_main_item_hidden_wrap grid-col-12">
              <div className="svc_hidden_cpt u-text-sm">{service.cpt}</div>
              <p className={`svc_hidden_text u-text-md${index === 1 ? " is-2" : ""}`}>
                {service.text}
              </p>
              <div className="svc_hidden_list">
                {service.list.map((item) => (
                  <div key={item} className="svc_hidden_list_item u-text-sm">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <motion.div
            className="svc_main_item_name_text u-text-xl"
            animate={{ scale: hovered ? 0.98 : 1 }}
            transition={{ duration: hovered ? 1 : 0.375, ease: EASE.power4out }}
          >
            {service.name}
          </motion.div>
          <motion.div
            className="svc_hover_overlay"
            style={{ originY: 1 }}
            animate={{ scaleY: hovered ? 1 : 0 }}
            transition={{ duration: 0.75, ease: EASE.power4out }}
          />
        </motion.div>
      </div>
      <div className="u-separator is-hero" />
    </>
  );
}
