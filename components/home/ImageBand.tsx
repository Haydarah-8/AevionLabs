"use client";

import {
  motion,
  useMotionTemplate,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { useRef } from "react";
import { BAND_IMAGES } from "@/lib/images";
import { CoverSection } from "@/components/anim/CoverSection";
import { RevealLines } from "@/components/anim/text";

/**
 * A full-bleed strip of work that scrubs sideways off the page's own scroll -
 * reversible, unlike a ticking marquee - and leans into how hard you are
 * scrolling, with the one line of copy punched through it in `difference` blend
 * so the letters invert against whatever slides beneath.
 *
 * Still a CoverSection, so it slides up over the About block the way the white
 * services block covers the dark work slider.
 */
export function ImageBand() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  /* Sprung rather than read straight off the scrollbar. Bound 1:1 the strip
     inherits every stutter in the wheel or trackpad; through a spring it glides
     and settles, and it still ends up exactly where the scroll says it should.
     Kept numeric and re-unitised at the end - useSpring interpolates numbers. */
  const rawPercent = useTransform(scrollYProgress, [0, 1], [-3, -18]);
  const percent = useSpring(rawPercent, {
    stiffness: 90,
    damping: 30,
    mass: 0.6,
  });
  const x = useMotionTemplate`${percent}%`;

  /* scroll hard and the strip leans; coast and it stands back up */
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    stiffness: 260,
    damping: 45,
    mass: 0.4,
  });
  const skew = useTransform(smoothVelocity, [-3000, 0, 3000], [3.5, 0, -3.5], {
    clamp: true,
  });

  return (
    <CoverSection className="band_container" zIndex={12}>
      <div ref={ref} className="band_viewport">
        <motion.div className="band_track" style={{ x, skewX: skew }}>
          {/* doubled so the strip still covers the viewport at either end of the scrub */}
          {[...BAND_IMAGES, ...BAND_IMAGES].map((img, i) => (
            <div key={i} className="band_cell">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="band_img"
                src={img.src}
                alt={i < BAND_IMAGES.length ? img.alt : ""}
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
        </motion.div>
      </div>
      <div className="band_overlay" />
      <div className="band_text_wrap">
        <RevealLines className="band_text u-text-xl" staggerLines={0}>
          fine is expensive
        </RevealLines>
      </div>
    </CoverSection>
  );
}
