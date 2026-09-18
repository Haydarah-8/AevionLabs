"use client";

import { motion, useReducedMotion } from "framer-motion";

interface PageHeroProps {
  title: string;
  highlight?: string;
  heading?: "h1" | "h2";
  image?: string;
}

export function PageHero({
  title,
  highlight,
  heading = "h1",
  image = "/images/home-about.jpg",
}: PageHeroProps) {
  const HeadingTag = heading === "h2" ? "h2" : "h1";
  const reduceMotion = useReducedMotion();
  const enter = reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 };
  const transition = reduceMotion
    ? { duration: 0 }
    : {
        duration: 1,
        delay: 0.1,
        ease: [0.21, 0.47, 0.32, 0.98] as [number, number, number, number],
      };
  const transitionHighlight = reduceMotion
    ? { duration: 0 }
    : {
        duration: 1,
        delay: 0.3,
        ease: [0.21, 0.47, 0.32, 0.98] as [number, number, number, number],
      };

  return (
    <section className="relative flex min-h-[40vh] flex-col items-center justify-end overflow-hidden bg-black px-[var(--section-x)] pt-28 pb-16 text-white sm:min-h-[46vh] sm:pt-32 sm:pb-20 lg:pb-24">
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-cover bg-center opacity-55"
        style={{ backgroundImage: `url('${image}')` }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[2] bg-black/55"
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-[var(--section-max)] pb-1 text-center sm:pb-2">
        <HeadingTag className="text-[clamp(2.4rem,5.8vw,4.75rem)] font-normal leading-[1.08] tracking-[-0.035em] text-white">
          <motion.span
            initial={enter}
            animate={{ opacity: 1, y: 0 }}
            transition={transition}
            className="inline-block"
          >
            {title}
          </motion.span>
          {highlight && (
            <>
              {" "}
              <motion.span
                initial={enter}
                animate={{ opacity: 1, y: 0 }}
                transition={transitionHighlight}
                className="inline-block text-white/55"
              >
                {highlight}
              </motion.span>
            </>
          )}
        </HeadingTag>
      </div>
    </section>
  );
}
