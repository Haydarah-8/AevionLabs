"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import { HoverGroup, SlideUpHover } from "@/components/anim/SlideUpHover";
import { LinkBtn } from "@/components/anim/LinkBtn";
import { TransitionLink } from "@/components/chrome/PageTransition";
import { useContactModal } from "@/components/chrome/ContactModal";
import { useIsDesktop } from "@/components/anim/useIntro";
import { WordmarkSvg } from "@/components/brand/Wordmark";
import { CONTACT_EMAIL, SOCIAL_LINKS } from "@/lib/site";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/news", label: "Insights" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
];

/** Shown until the social accounts exist - also better for search than four
 *  links that go nowhere. Kept short: this column is ~190px wide, and the full
 *  service names overflow it into the navigation column beside it. */
const SERVICE_LINKS = ["Strategy", "Design", "Build", "Support"];

/**
 * Footer with the parallax settle: it starts 10% high behind the last section
 * and settles to 0 while a dark overlay fades out.
 */
export function Footer() {
  const { openModal } = useContactModal();
  const ref = useRef<HTMLDivElement>(null);
  const isDesktop = useIsDesktop();

  /* Measured directly off the untransformed wrapper each frame.
     `useScroll` is wrong for this one: it caches layout from mount (so it goes
     stale as images/fonts grow the page) and reading the element we're moving
     would feed its own transform back into the measurement.
     Range matches the original ("bottom bottom → bottom 30%"): the footer is
     fully settled well before the page bottom, so no dead strip is left under
     it. */
  const progress = useMotionValue(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;

    const measure = () => {
      raf = 0;
      const vh = window.innerHeight;
      const top = el.getBoundingClientRect().top;
      const span = vh - vh * 0.3;
      progress.set(Math.min(1, Math.max(0, (vh - top) / span)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [progress]);

  const y = useTransform(
    progress,
    [0, 1],
    isDesktop ? ["-10%", "0%"] : ["0%", "0%"],
  );
  const overlayOpacity = useTransform(
    progress,
    [0, 1],
    isDesktop ? [0.375, 0] : [0, 0],
  );

  return (
    <div ref={ref}>
      <motion.div className="footer_container div-block-2" style={{ y }}>
        <div className="footer_wrap u-container">
          <div className="footer_main_wrap grid-col-12">
            <div className="footer_top_wrap grid-col-12">
              <div className="footer_links_wrap">
                <div className="footer_link_cpt u-text-sm">navigation</div>
                {NAV.map((l) => (
                  <TransitionLink
                    key={l.href}
                    href={l.href}
                    className="footer_link w-inline-block"
                  >
                    <HoverGroup>
                      <SlideUpHover>
                        <span className="footer_link_text u-text-md">
                          {l.label}
                        </span>
                      </SlideUpHover>
                    </HoverGroup>
                  </TransitionLink>
                ))}
              </div>
              <div className="footer_links_wrap">
                <div className="footer_link_cpt u-text-sm">
                  {SOCIAL_LINKS.length ? "SOCIALS" : "WHAT WE DO"}
                </div>
                {SOCIAL_LINKS.length
                  ? SOCIAL_LINKS.map((s) => (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noreferrer"
                        className="footer_link w-inline-block"
                      >
                        <HoverGroup>
                          <SlideUpHover>
                            <span className="footer_link_text u-text-md">
                              {s.label}
                            </span>
                          </SlideUpHover>
                        </HoverGroup>
                      </a>
                    ))
                  : SERVICE_LINKS.map((s) => (
                      <TransitionLink
                        key={s}
                        href="/services"
                        className="footer_link w-inline-block"
                      >
                        <HoverGroup>
                          <SlideUpHover>
                            <span className="footer_link_text u-text-md">
                              {s}
                            </span>
                          </SlideUpHover>
                        </HoverGroup>
                      </TransitionLink>
                    ))}
              </div>
              <div className="footer_email_wrap">
                <div className="footer_email_text u-text-md">
                  AEVION LABS designs and builds company sites, SaaS products,
                  ecommerce, and tools for teams: strategy, interface and
                  engineering handled by one studio, start to launch.
                </div>
                <div className="footer_link_cpt u-text-sm is-left">
                  Contact us
                </div>
                <LinkBtn
                  onClick={openModal}
                  className="footer"
                  textClassName="footer_cta"
                  lineClassName="dark footer_cta"
                >
                  {CONTACT_EMAIL}
                </LinkBtn>
              </div>
            </div>
            <div className="footer_bottom_wrap grid-col-12">
              <WordmarkSvg className="footer_bottom_svg" />
              {/* mobile */}
              <div className="footer_bottom_text_wrap_m">
                <div className="footer_bottom_lines_wrap">
                  <p className="footer_bottom_lines_paragraph u-text-base">
                    Web design and development for teams
                  </p>
                  <p className="footer_bottom_lines_paragraph u-text-base">
                    who care how it works, not just how
                  </p>
                  <div className="footer_bottom_cta_line_wrap">
                    <p className="footer_bottom_lines_paragraph u-text-base">
                      it looks. Start a project:
                    </p>
                    <LinkBtn
                      href={`mailto:${CONTACT_EMAIL}`}
                      textClassName="m"
                      lineClassName="dark"
                    >
                      {CONTACT_EMAIL}
                    </LinkBtn>
                  </div>
                </div>
              </div>
              {/* desktop */}
              <div className="footer_bottom_text_wrap">
                <p className="footer_bottom_text u-text-base">
                  Web design and development for teams who care how it works,
                  not just how it looks. Start a project:
                </p>
                <LinkBtn
                  href={`mailto:${CONTACT_EMAIL}`}
                  textClassName="footer"
                  lineClassName="dark footer"
                >
                  {CONTACT_EMAIL}
                </LinkBtn>
              </div>
              <div className="footer_bottom_year u-text-base">
                © 2026 Aevion Labs
              </div>
            </div>
          </div>
        </div>
        <motion.div
          className="footer_overlay"
          style={{ opacity: overlayOpacity }}
        />
      </motion.div>
    </div>
  );
}
