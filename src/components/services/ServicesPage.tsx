"use client";

import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { SITE_IMAGES } from "@/lib/images";
import { useEffect, useRef, useState } from "react";
import { EASE } from "@/lib/utils";
import { FadeIn, RevealLines } from "@/components/anim/text";
import { SvgReveal } from "@/components/anim/svg";
import { ImageReveal, ParallaxImage } from "@/components/anim/image";
import { LinkBtn } from "@/components/anim/LinkBtn";
import { useContactModal } from "@/components/chrome/ContactModal";
import { useCursorTarget } from "@/components/chrome/Cursor";
import { useIsDesktop } from "@/components/anim/useIntro";
import {
  SvcHeroTopSvg0,
  SvcHeroTopSvg1,
  SvcHeroTopSvgIs1,
  SvcIntroMarqueeSvg0,
  SvcIntroMarqueeSvg1,
  SvcIntroMarqueeSvg2,
  SvcIntroMarqueeSvg3,
  SvcSvcIntoSvg,
} from "@/components/svg/generated";

const SERVICES = [
  {
    name: "Strategy & UX",
    cnt: "01",
    list: [
      "Discovery and stakeholder interviews",
      "Information architecture and user flows",
      "Conversion mapping and success metrics",
    ],
    heading: "Decisions made before code, not during",
    text: "The costly changes are the ones that arrive late. We map the structure, the journeys and the numbers you are trying to move first, so the build is execution, not a series of expensive second thoughts.",
  },
  {
    name: "Design Systems",
    cnt: "02",
    list: [
      "Interface and interaction design",
      "Component libraries and design tokens",
      "Typography, colour and layout rules",
    ],
    heading: "Consistency that survives your roadmap",
    text: "We design in reusable parts rather than one-off pages. Adding a section next year should cost hours, not another project, and it should still look like it belongs.",
  },
  {
    name: "Web Development",
    cnt: "03",
    list: [
      "Next.js and React builds",
      "Headless CMS and API integration",
      "Semantic, accessible markup",
    ],
    heading: "Built to be handed over, not held hostage",
    text: "The same team designs and builds, so nothing is lost between the two. You get clean, documented code on your own repository. Keep us on to extend it, or take it in-house whenever you like.",
  },
  {
    name: "Performance & Care",
    cnt: "04",
    list: [
      "Core Web Vitals and speed tuning",
      "WCAG accessibility audits",
      "Support retainers and feature work",
    ],
    heading: "Fast on day one, fast in a year",
    text: "A site that slows down quietly costs you traffic and conversions you never see. We measure what matters after launch and keep it in shape, with support that is optional rather than a condition of leaving.",
  },
];

const FAQS = [
  {
    q: "What does a website cost?",
    a: "Every project is quoted as one fixed price after the first call, with no hourly billing and no surprise invoices. Tell me the budget you have and I will tell you honestly what is achievable inside it, or say if it is not enough.",
    tag: "Pricing",
  },
  {
    q: "How long does it take?",
    a: "A typical marketing site runs four to eight weeks from first call to launch. The build is rarely the bottleneck. Waiting on copy and photography usually is, so we agree that schedule up front.",
    tag: "Timelines",
  },
  {
    q: "Do I actually own it?",
    a: "Yes. The code lives on your repository, the content in a CMS on your account, the domain and hosting in your name. Nothing is rented back to you and nothing is held to keep you here.",
    tag: "Ownership",
  },
  {
    q: "Why one person and not an agency?",
    a: "Because most of what goes wrong in a web project happens at a handoff. One person doing strategy, design and code means fewer meetings, no telephone game, and the person you brief is the person accountable.",
    tag: "Working together",
  },
  {
    q: "What happens after launch?",
    a: "You get a walkthrough of how to edit everything yourself. Keep me on a retainer for changes and improvements if it is useful, and if it is not, the site runs perfectly well without me.",
    tag: "After launch",
  },
];

export function ServicesPage() {
  const { openModal } = useContactModal();
  const marqueeRef = useRef<HTMLDivElement>(null);

  return (
    <div className="main_wrap">
      {/* --- hero --- */}
      <div className="svc_hero_container u-container" data-hero="">
        <div className="svc_hero_top_wrap">
          <div className="svc_hero_top_line_wrap grid-col-12">
            <div className="u-svg-wrap" style={{ overflow: "hidden" }}>
              <SvgReveal trigger="intro" mode="slide" perPathStagger={0}>
                <SvcHeroTopSvgIs1 />
              </SvgReveal>
            </div>
          </div>
          <div className="svc_hero_bottom_line_wrap grid-col-12">
            <div className="u-svg-wrap" style={{ overflow: "hidden" }}>
              <SvgReveal trigger="intro" mode="slide" perPathStagger={0} delay={0.1}>
                <SvcHeroTopSvg0 />
              </SvgReveal>
            </div>
            <div className="u-svg-wrap" style={{ overflow: "hidden" }}>
              <SvgReveal trigger="intro" mode="slide" perPathStagger={0} delay={0.2}>
                <SvcHeroTopSvg1 />
              </SvgReveal>
            </div>
          </div>
          <div className="svc_hero_main_wrap grid-col-12 is-1">
            <div className="svc_hero_main_text_wrap">
              <div className="svc_hero_main_text">
                <RevealLines as="p" className="svc_hero_paragraph u-text-md" trigger="intro" delay={0.375}>
                  We design and build websites end to end, so strategy, interface and code
                  never get lost between three different suppliers.
                </RevealLines>
                <RevealLines className="svc_hero_cpt u-text-sm" trigger="intro" staggerLines={0} delay={0.5}>
                  Scroll
                </RevealLines>
              </div>
            </div>
          </div>
        </div>
        <div className="svc_hero_image_wrap grid-col-12">
          <ImageReveal
            className="svc_hero_inner_wrap"
            imgClassName="svc_hero_image"
            src={SITE_IMAGES.servicesHero.src}
            alt={SITE_IMAGES.servicesHero.alt}
            from="top"
            trigger="intro"
            parallax
            settleScale={1.05}
          />
        </div>
        <div className="svc_hero_main_wrap grid-col-12 is-2">
          <div className="svc_hero_main_text_wrap">
            <p className="svc_hero_paragraph u-text-base">
              We design and build websites end to end, so strategy, interface and code
              never get lost between three different suppliers.
            </p>
            <div className="svc_hero_cpt_wrap">
              <div className="svc_hero_cpt u-text-sm">Built to scale, not just launch.</div>
              <div className="svc_hero_cpt u-text-sm">[Scroll]</div>
            </div>
          </div>
        </div>
        <div className="svc_hero_bottom_wrap grid-col-12">
          <div className="svc_hero_bottom_text_wrap">
            <div className="svc_hero_bottom_top_wrap">
              <RevealLines className="svc_hero_bottom_top_cpt u-text-sm" staggerLines={0}>
                01 · what we do
              </RevealLines>
              <RevealLines className="svc_hero_bottom_text u-text-lg">
                A deliberate creative practice.
              </RevealLines>
            </div>
          </div>
        </div>
      </div>

      {/* --- intro --- */}
      <div className="svc_intro_container grid-col-12 u-container">
        <div className="svc_hero_bottom_wrap grid-col-12 is-2">
          <div className="svc_hero_bottom_text_wrap">
            <div className="svc_hero_bottom_top_wrap">
              <div className="svc_hero_bottom_top_cpt u-text-sm">[SYS&gt;INTRO]</div>
              <div className="svc_hero_bottom_text u-text-lg is-top">A complete approach</div>
            </div>
            <RevealLines className="svc_hero_bottom_text u-text-lg">
              A deliberate creative practice.
            </RevealLines>
          </div>
        </div>
        <ImageReveal
          className="svc_intro_left_wrap"
          imgClassName="svc_intro_image"
          src={SITE_IMAGES.servicesIntro.src}
          alt={SITE_IMAGES.servicesIntro.alt}
          parallax
        />
        <div className="svc_intro_right_wrap grid-col-12">
          <h3 className="svc_intro_right_heading u-text-md">
            Most sites are slow, hard to update, or quietly losing you customers. Usually
            all three, and usually because design and build never spoke to each other.
          </h3>
          <div className="svc_intro_left_text_wrap">
            <FadeIn as="p" className="svc_intro_right_text u-text-base">
              One team takes it from first conversation to launch and beyond. Fewer handoffs,
              fewer things lost in translation, one person accountable for the result.
            </FadeIn>
          </div>
          <div className="svc_intro_right_text_wrap">
            <RevealLines as="p" className="svc_intro_right_text u-text-sm" staggerLines={0}>
              Built to scale
            </RevealLines>
            <FadeIn className="svc_intro_btn_wrap">
              <LinkBtn onClick={openModal}>Get in touch →</LinkBtn>
            </FadeIn>
          </div>
        </div>
      </div>

      {/* --- marquee --- */}
      <Marquee innerRef={marqueeRef} />

      {/* --- stacked service cards --- */}
      <ServiceCards marqueeRef={marqueeRef} />

      {/* --- testimonials --- */}
      <Testimonials />
    </div>
  );
}

function Marquee({ innerRef }: { innerRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div
      ref={innerRef}
      className="svc_intro_marquee"
      data-svc-last-section=""
      style={{ overflow: "hidden", display: "flex" }}
    >
      {[0, 1].map((copy) => (
        <motion.div
          key={copy}
          className="svc_intro_marquee_item"
          animate={{ x: ["0%", "-100%"] }}
          transition={{ duration: 25, ease: "linear", repeat: Infinity }}
          style={{ flexShrink: 0 }}
        >
          <SvcIntroMarqueeSvg0 />
          <div className="svc_intro_marquee_separator" />
          <SvcIntroMarqueeSvg1 />
          <div className="svc_intro_marquee_separator" />
          <SvcIntroMarqueeSvg2 />
          <div className="svc_intro_marquee_separator" />
          <SvcIntroMarqueeSvg3 />
          <div className="svc_intro_marquee_separator" />
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Pinned card stack: each next card slides up over the previous one while the
 * previous card scales to 0.87, tilts 3°, and dims under its overlay.
 */
function ServiceCards({
  marqueeRef,
}: {
  marqueeRef: React.RefObject<HTMLDivElement | null>;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const isDesktop = useIsDesktop();

  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ["start start", "end end"],
  });

  /* cover-in: driven by the logo marquee leaving the viewport (the original's
     [data-svc-last-section] trigger, bottom-bottom → bottom-top), so the card
     stack rises from -30% and its dark wash clears as it covers the marquee */
  const { scrollYProgress: approach } = useScroll({
    target: marqueeRef,
    offset: ["end end", "end start"],
  });
  const coverY = useTransform(approach, [0, 1], isDesktop ? ["-30%", "0%"] : ["0%", "0%"]);
  const coverOverlay = useTransform(approach, [0, 1], isDesktop ? [0.6, 0] : [0, 0]);

  /* timeline: 0.25 pause + 3 × (1 slide + 0.25 pause), total 4 units */
  const T = 4;
  const windows = [1, 2, 3].map((i) => {
    const start = (0.25 + (i - 1) * 1.25) / T;
    return [start, start + 1 / T] as [number, number];
  });

  return (
    <div className="svc_svc_container" style={{ position: "relative", zIndex: 1 }}>
      <div className="svc_svc_intro_wrap grid-col-12 u-container">
        <RevealLines className="svc_svc_intro_cpt u-text-sm" staggerLines={0}>
          [sys&gt;services]
        </RevealLines>
        <FadeIn as="p" className="svc_svc_intro_text u-text-base">
          Four stages of one process. Take the whole thing, or the part you are missing.
        </FadeIn>
        <SvgReveal mode="flicker" spread={1}>
          <SvcSvcIntoSvg />
        </SvgReveal>
      </div>
      <div
        ref={outerRef}
        style={isDesktop ? { height: "500vh", position: "relative" } : undefined}
      >
        <motion.div
          className="svc_svc_main_wrap"
          style={
            isDesktop
              ? {
                  position: "sticky",
                  top: 0,
                  height: "100vh",
                  overflow: "hidden",
                  y: coverY,
                  willChange: "transform",
                }
              : { height: "auto" }
          }
        >
          {SERVICES.map((s, i) => (
            <ServiceCard
              key={s.cnt}
              service={s}
              index={i}
              progress={scrollYProgress}
              windows={windows}
              isDesktop={isDesktop}
            />
          ))}
          <motion.div
            className="svc_overlay"
            style={{
              opacity: coverOverlay,
              position: "absolute",
              inset: 0,
              background: "#000",
              pointerEvents: "none",
              zIndex: 20,
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}

function ServiceCard({
  service,
  index,
  progress,
  windows,
  isDesktop,
}: {
  service: (typeof SERVICES)[number];
  index: number;
  progress: MotionValue<number>;
  windows: [number, number][];
  isDesktop: boolean;
}) {
  /* this card slides in during windows[index-1]; scales away during windows[index] */
  const slideWin = index > 0 ? windows[index - 1] : null;
  const scaleWin = index < 3 ? windows[index] : null;

  const y = useTransform(
    progress,
    slideWin ?? [0, 1],
    slideWin ? ["100%", "0%"] : ["0%", "0%"]
  );
  const scale = useTransform(
    progress,
    scaleWin ?? [0, 1],
    scaleWin ? [1, 0.87] : [1, 1]
  );
  const rotate = useTransform(
    progress,
    scaleWin ?? [0, 1],
    scaleWin ? [0, 3] : [0, 0]
  );
  /* overlay dims while the next card slides over, clears once fully covered */
  const overlayOpacity = useTransform(
    progress,
    scaleWin
      ? [scaleWin[0], scaleWin[1], Math.min(scaleWin[1] + 0.0625, 1)]
      : [0, 0.5, 1],
    scaleWin ? [0, 0.5, 0] : [0, 0, 0]
  );

  /* per-card progress bar fill */
  const barScale = useTransform(
    progress,
    [index / 4, (index + 1) / 4],
    [0, 1]
  );

  return (
    <motion.div
      className={`svc_svc_item_wrap${index > 0 ? ` is-${index + 1}` : ""}`}
      style={
        isDesktop
          ? { y, zIndex: index + 1, position: "absolute", inset: 0 }
          : { position: "relative" }
      }
    >
      <motion.div
        className={`svc_svc_item u-container is-${index + 1}`}
        style={isDesktop ? { scale, rotate, transformOrigin: "center bottom" } : undefined}
      >
        <div className="svc_svc_item_top grid-col-12">
          <div className={`svc_svc_item_name_text u-text-xl${index === 2 ? " is-3" : ""}`}>
            {service.name}
          </div>
        </div>
        <div className="svc_svc_item_list" data-svc-features="">
          {service.list.map((item, li) => (
            <div key={item} className="svc_svc_list_item">
              <div className="svc_svc_item_list_text u-text-sm is-1">{`(0${li + 1})`}</div>
              <div className="svc_svc_item_list_text u-text-sm">{item}</div>
            </div>
          ))}
        </div>
        <div className={`svc_svc_item_bottom grid-col-12${index === 3 ? " is-last" : ""}`}>
          <div className="svc_svc_bottom_left">
            <h3 className={`svc_svc_bottom_heading u-text-md${index > 0 ? ` is-${index + 1}` : ""}`}>
              {service.heading}
            </h3>
            <p className="svc_svc_bottom_paragraph u-text-base">{service.text}</p>
          </div>
          <div className="svc_svc_item_progress_wrap is-1">
            <div className="svc_svc_bg_bar" />
            <motion.div
              className="svc_svc_front_bar"
              style={{ scaleX: isDesktop ? barScale : 1, transformOrigin: "left center" }}
            />
            <div className="svc_svc_breakpoints">
              <div className="svc_svc_bp_wrap">
                <div className="svc_svc_breakpoint is-1" />
                <div className="svc_svc_breakpoint" />
                <div className="svc_svc_breakpoint" />
                <div className="svc_svc_breakpoint" />
                <div className="svc_svc_breakpoint is-last" />
              </div>
            </div>
          </div>
          <div className="svc_svc_item_cnt u-text-xl">{service.cnt}</div>
        </div>
        <div className={`u-separator svc-m${index === 3 ? " is-last" : ""}`} />
      </motion.div>
      {index < 3 && (
        <motion.div
          className="svc_item_overlay services"
          style={{ opacity: isDesktop ? overlayOpacity : 0, position: "absolute", inset: 0, background: "#000", pointerEvents: "none" }}
        />
      )}
    </motion.div>
  );
}

function Testimonials() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const boundsRef = useRef<HTMLDivElement>(null);
  const [dragLimit, setDragLimit] = useState(0);
  useCursorTarget(wrapRef, { text: "Drag", hideOnClick: false });

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const update = () => {
      const parent = wrap.parentElement;
      if (!parent) return;
      setDragLimit(Math.max(0, wrap.scrollWidth - parent.offsetWidth));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="svc_tst_container u-container">
      <div className="svc_tst_top_wrap grid-col-12">
        <RevealLines className="svc_tst_top_text u-text-xl">
          Questions I get asked first
        </RevealLines>
        <div className="svc_tst_top_text_wrap">
          <RevealLines className="svc_tst_top_cpt u-text-sm" staggerLines={0}>
            02 · before you ask
          </RevealLines>
        </div>
      </div>
      <div ref={boundsRef} className="svc_tst_bottom_wrap" style={{ overflow: "hidden" }}>
        <motion.div
          ref={wrapRef}
          className="svc_tst_items_wrap"
          drag="x"
          dragConstraints={{ left: -dragLimit, right: 0 }}
          dragElastic={0.1}
          dragTransition={{ power: 0.4, timeConstant: 200 }}
        >
          {FAQS.map((f, i) => (
            <div key={i} className="svc_tst_item">
              <div className="svc_tst_item_top">
                <p className="svc_tst_item_text u-text-md">{f.q}</p>
                <p className="svc_tst_faq_answer u-text-base">{f.a}</p>
              </div>
              <div className="svc_tst_item_bottom">
                <div className="svc_tst_item_bottom_left">
                  <div className="svc_tst_item_bottom_text">
                    <div className="svc_item_tst_cpt u-text-sm is-2">{f.tag}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
