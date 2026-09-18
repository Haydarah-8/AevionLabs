"use client";

import { animate, motion, useInView } from "framer-motion";
import { SITE_IMAGES } from "@/lib/images";
import { useEffect, useRef, useState } from "react";
import { EASE } from "@/lib/utils";
import { FadeIn, FlickerChars, RevealLines, splitLines } from "@/components/anim/text";
import { SvgReveal } from "@/components/anim/svg";
import { ParallaxImage } from "@/components/anim/image";
import { CoverSection } from "@/components/anim/CoverSection";
import { LinkBtn } from "@/components/anim/LinkBtn";
import { useContactModal } from "@/components/chrome/ContactModal";
import { useHasHover } from "@/components/anim/useIntro";
import {
  AboutHeroTopSvg0,
  AboutHeroTopSvg1,
  AboutHeroTopSvg2,
  AbtIntroSvg,
  AbtValuesItemArrowIs1,
  AbtValuesItemArrowIs2,
  AbtValuesItemArrowIs3,
  AbtValuesItemArrowIs4,
  AbtValuesTopSvg,
  SvcAboutItemSvg0,
  SvcAboutItemSvg1,
  SvcAboutItemSvg2,
  SvcAboutItemSvg3,
} from "@/components/svg/generated";

const VALUES = [
  {
    cnt: "(01)",
    name: "You talk to the person building it",
    text: "No account managers, no handoffs, no brief passed down a chain until the intent is gone. The person you scope the project with is the person who designs it and writes the code.",
    Plus: SvcAboutItemSvg0,
    Arrow: AbtValuesItemArrowIs1,
    sep: "is-about",
  },
  {
    cnt: "(02)",
    name: "You own everything",
    text: "Code sits on your repository, content in a CMS you control, domain and hosting in your name. Keep me on because the work is good, not because leaving would be painful.",
    Plus: SvcAboutItemSvg1,
    Arrow: AbtValuesItemArrowIs2,
    sep: "is-about",
  },
  {
    cnt: "(03)",
    name: "Fast is a feature",
    text: "Every second of load time costs conversions. Performance and accessibility are measured before launch and after, not treated as a nice-to-have once the design is signed off.",
    Plus: SvcAboutItemSvg2,
    Arrow: AbtValuesItemArrowIs3,
    sep: "is-about",
  },
  {
    cnt: "(04)",
    name: "Built to be changed",
    text: "Most sites die because updating them is harder than living with them. Yours is built in components, documented, and made so your team can edit it without calling anyone.",
    Plus: SvcAboutItemSvg3,
    Arrow: AbtValuesItemArrowIs4,
    sep: "is-4",
    last: true,
  },
];

const PROCESS = [
  {
    step: "01",
    name: "Discovery",
    text: "A call about what the site has to achieve, who it is for, and what is failing now.",
  },
  {
    step: "02",
    name: "Structure",
    text: "Sitemap, page-by-page content plan and user flows agreed before any visual work.",
  },
  {
    step: "03",
    name: "Design",
    text: "Key pages designed as a reusable system, not one-off mockups. You review as it goes.",
  },
  {
    step: "04",
    name: "Build",
    text: "Built in Next.js on your own repository, with a CMS for anything you will edit.",
  },
  {
    step: "05",
    name: "Launch",
    text: "Testing, performance and accessibility passes, analytics wired, then we go live.",
  },
  {
    step: "06",
    name: "Support",
    text: "Keep me on for changes and improvements, or take the code and run it yourself.",
  },
];

export function AboutPage() {
  const { openModal } = useContactModal();
  /* only one value can be expanded at a time */
  const [openValue, setOpenValue] = useState<number | null>(null);

  return (
    <div className="main_wrap">
      {/* --- hero --- */}
      <div className="abt_hero_container u-container" data-hero="">
        <div className="abt_hero_top_wrap grid-col-12">
          <RevealLines className="abt_hero_top_cpt u-text-sm" trigger="intro" staggerLines={0} delay={0.5}>
            ABOUT THE STUDIO
          </RevealLines>
          {[AboutHeroTopSvg0, AboutHeroTopSvg1, AboutHeroTopSvg2].map((Svg, i) => (
            <div key={i} className="u-svg-wrap" style={{ overflow: "hidden" }}>
              <SvgReveal trigger="intro" mode="slide" perPathStagger={0} delay={i * 0.1}>
                <Svg />
              </SvgReveal>
            </div>
          ))}
        </div>
        <div className="abt_hero_bottom_wrap grid-col-12">
          <RevealLines className="abt_hero_bottom_cpt u-text-sm" trigger="intro" staggerLines={0} delay={0.5}>
            SCROLL TO EXPLORE
          </RevealLines>
          <RevealLines as="h2" className="abt_hero_bottom_heading u-text-md" trigger="intro" delay={0.375}>
            One developer who designs and builds the whole thing, because most web projects
            break at the handoff.
          </RevealLines>
        </div>
      </div>

      {/* --- full-bleed image --- */}
      <div className="abt_image_container u-container">
        <ParallaxImage
          className="image_wrap is-about"
          imgClassName="abt_image"
          src={SITE_IMAGES.aboutWide.src}
          alt={SITE_IMAGES.aboutWide.alt}
        />
      </div>

      {/* --- intro --- */}
      <div className="abt_intro_container u-container">
        <div className="abt_intro_top_wrap grid-col-12">
          <RevealLines as="h2" className="abt_intro_heading u-text-lg">
            I started AEVION LABS after watching
          </RevealLines>
          {/* the narrow-screen headline: obscura.css hides the two lines above
              and shows this one instead, so it has to carry the whole sentence */}
          <h2 className="abt_intro_heading u-text-lg is-m">
            I started AEVION LABS after watching too many sites get designed by one team,
            built by another, and launched slower, uglier and harder to edit than anyone
            intended.
          </h2>
          <RevealLines as="h2" className="abt_intro_heading u-text-lg">
            too many sites get designed by one team, built by another, and launched
            slower, uglier and harder to edit than anyone intended.
          </RevealLines>
        </div>
        <div className="abt_intro_bottom_wrap grid-col-12">
          <RevealLines className="abt_intro_bottom_cpt u-text-sm" staggerLines={0}>
            01 · the studio
          </RevealLines>
          <RevealLines className="abt_intro_bottom_cpt u-text-sm is-year" staggerLines={0}>
            EST. 2026
          </RevealLines>
          <FadeIn className="abt_intro_main_wrap">
            <div className="abt_intro_paragraph_wrap">
              <p className="abt_intro_paragraph u-text-base">
                I am a solo developer. That is deliberate: it keeps the work direct, the costs
                honest, and means nothing gets lost between the person who promised it and
                the person who has to build it.
              </p>
              <p className="abt_intro_paragraph u-text-base">
                I take on a small number of projects at a time, mostly for founders and small
                teams who need a site that earns its keep rather than just looking current.
              </p>
            </div>
            <LinkBtn onClick={openModal}>Get in touch →</LinkBtn>
          </FadeIn>
        </div>
        <AbtIntroSvg />
      </div>

      {/* --- values (covers the intro) --- */}
      <CoverSection className="abt_values_container u-container" zIndex={2}>
        <div className="abt_values_top_wrap grid-col-12">
          <RevealLines className="abt_values_top_cpt u-text-sm light" staggerLines={0}>
            02 · how I work
          </RevealLines>
          <RevealLines as="h2" className="abt_values_heading u-text-md">
            Four commitments I make on every project. The things I would want promised to
            me if I were hiring someone to build my site.
          </RevealLines>
        </div>
        <AbtValuesTopSvg />
        <div className="abt_values_bottom_wrap grid-col-12">
          <div className="abt_values_bottom_main_wrap">
            {VALUES.map((v, i) => (
              <ValueRow
                key={v.name}
                value={v}
                index={i}
                open={openValue === i}
                onToggle={() => setOpenValue(openValue === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </CoverSection>

      {/* --- team --- */}
      <ProcessSection />
    </div>
  );
}

function ValueRow({
  value,
  index,
  open,
  onToggle,
}: {
  value: (typeof VALUES)[number];
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const { Plus, Arrow } = value;
  const arrowRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelInnerRef = useRef<HTMLDivElement>(null);
  const firstRun = useRef(true);

  /* Arrow slides IN from the left when opening, OUT to the right when closing
     (it re-enters from the left each time - that jump happens off-screen).
     The stylesheet ships these arrows at `opacity: 0`; the original reveals
     them from the tween's `autoAlpha`, i.e. an inline style, so set it inline
     here too rather than trying to out-specify the class rule. */
  useEffect(() => {
    const el = arrowRef.current;
    if (!el) return;
    const svg = el.querySelector("svg");

    /* the "+" drops its vertical bar to read as "−" while the row is open */
    const bar = el
      .closest(".abt_values_item")
      ?.querySelector<SVGRectElement>(".svc_about_item_svg .rect");
    if (bar) bar.style.opacity = open ? "0" : "1";

    if (firstRun.current) {
      firstRun.current = false;
      if (!open) return;
    }

    if (open) {
      if (svg) svg.style.opacity = "1";
      animate(el, { x: ["-120%", "0%"] }, { duration: 0.6, ease: EASE.power3inOut });
    } else {
      animate(el, { x: "120%" }, { duration: 0.6, ease: EASE.power3inOut });
    }

    /* Animate an explicit pixel height rather than `height: auto` - Framer has
       to re-measure every frame for `auto`, which is what made this stutter.
       Released back to `auto` once open so the panel still reflows on resize. */
    const panel = panelRef.current;
    const inner = panelInnerRef.current;
    if (!panel || !inner) return;

    const from = panel.getBoundingClientRect().height;
    const to = open ? inner.getBoundingClientRect().height : 0;
    panel.style.height = `${from}px`;

    animate(panel, { height: `${to}px` }, {
      duration: 0.6,
      ease: EASE.power3inOut,
    }).then(() => {
      if (open) panel.style.height = "auto";
    });
  }, [open]);

  return (
    <div className="abt_values_item grid-col-12" data-open={open ? "true" : "false"}>
      <div
        className={`abt_values_item_right_wrap grid-col-12${value.last ? " is-last" : ""}`}
        style={{ cursor: "pointer" }}
        data-open={open ? "true" : "false"}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onToggle}
      >
        <div className="abt_values_item_cnt u-text-md">{value.cnt}</div>
        <motion.div
          className="abt_values_item_name u-text-md"
          animate={{ marginLeft: hovered && !open ? "0.5em" : "0em" }}
          transition={{ duration: 0.25, ease: EASE.power2out }}
        >
          {value.name}
        </motion.div>
        {/* the vertical bar of the "+" fades out when open, leaving a "−" */}
        <Plus />
        <div
          ref={panelRef}
          className="abt_values_expanded_outer_wrap"
          style={{ height: 0, overflow: "hidden" }}
        >
          <div ref={panelInnerRef} className="abt_values_explanded_wrap">
            <p className="abt_values_expanded_text u-text-base">{value.text}</p>
          </div>
        </div>
        <div className={`u-separator ${value.sep}`} />
      </div>
      <div className="abt_values_item_arrow_wrap" style={{ overflow: "hidden" }}>
        <span
          ref={arrowRef}
          style={{ display: "inline-flex", transform: "translateX(-120%)" }}
          data-abt-arrow={index}
        >
          <Arrow />
        </span>
      </div>
    </div>
  );
}

function ProcessSection() {
  const gridRef = useRef<HTMLDivElement>(null);
  const gridInView = useInView(gridRef, { once: true, margin: "0px 0px -25% 0px" });
  const revealed = useRef(false);
  const [active, setActive] = useState<number | null>(null);
  const hasHover = useHasHover();

  /* tiles wipe up in sequence, same choreography the photo grid used */
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || !gridInView || revealed.current) return;
    revealed.current = true;
    const tiles = grid.querySelectorAll<HTMLElement>(".process_tile");
    if (!tiles.length) return;
    tiles.forEach((t, i) => {
      animate(
        t,
        { clipPath: ["inset(100% 0 0% 0)", "inset(0% 0 0% 0)"], scale: [1.06, 1] },
        { duration: 1.2, ease: EASE.power4out, delay: i * 0.1 }
      );
    });
  }, [gridInView]);

  return (
    <div className="abt_team_container u-container">
      <div className="abt_team_top_svg_wrap grid-col-12">
        <div className="u-svg-wrap" style={{ overflow: "hidden" }}>
          <FlickerChars className="abt_team_text u-text-xl" spread={0.75}>
            PROCESS
          </FlickerChars>
        </div>
        <div className="u-svg-wrap is-2" style={{ overflow: "hidden" }}>
          <FlickerChars className="abt_team_cnt u-text-xl" spread={0.75}>
            (06)
          </FlickerChars>
        </div>
      </div>
      <div className="abt_team_mid_wrap grid-col-12">
        <RevealLines className="abt_team_mid_cpt u-text-sm" staggerLines={0}>
          03 · the process
        </RevealLines>
        <RevealLines as="p" className="abt_team_mid_paragraph u-text-md">
          Six steps, fixed before we start, so you always know what is happening and what
          it costs.
        </RevealLines>
      </div>
      <div className="abt_team_main_wrap grid-col-12">
        <RevealLines className="abt_team_main_cpt u-text-sm" staggerLines={0}>
          FIRST CALL TO LAUNCH
        </RevealLines>
        <div ref={gridRef} className="abt_team_main_photo_wrap">
          {PROCESS.map((s, i) => (
            <motion.div
              key={s.step}
              className="abt_team_main_member process_tile"
              style={{ clipPath: "inset(100% 0 0% 0)" }}
              onPointerEnter={hasHover ? () => setActive(i) : undefined}
              onPointerLeave={hasHover ? () => setActive(null) : undefined}
              animate={{ opacity: active !== null && active !== i ? 0.4 : 1 }}
              transition={{ duration: 0.375 }}
            >
              <div className="process_tile_inner">
                <div className="process_tile_step u-text-sm">({s.step})</div>
                <div className="process_tile_body">
                  <div className="process_tile_name u-text-md">{s.name}</div>
                  <p className="process_tile_text u-text-base">{s.text}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="hero_overlay" />
    </div>
  );
}
