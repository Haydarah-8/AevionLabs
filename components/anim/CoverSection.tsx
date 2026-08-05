"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useIsDesktop } from "./useIntro";

/**
 * The site's signature "cover" effect: the section overlaps the previous one by
 * 30% of its own height (negative bottom margin) and slides from 0 to -30% while
 * it scrolls into view - so it appears to cover the section before it.
 */
export function CoverSection({
  className,
  children,
  yPercent = -30,
  zIndex = 2,
  as = "div",
  onProgress,
}: {
  className?: string;
  children: ReactNode;
  yPercent?: number;
  zIndex?: number;
  as?: "div" | "section";
  /** Receives the cover progress MotionValue (0 → fully covered). */
  onProgress?: (mv: import("framer-motion").MotionValue<number>) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isDesktop = useIsDesktop();
  const [marginBottom, setMarginBottom] = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start start"],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", isDesktop ? `${yPercent}%` : "0%"]
  );

  useEffect(() => {
    onProgress?.(scrollYProgress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollYProgress]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !isDesktop) {
      setMarginBottom(0);
      return;
    }
    const ro = new ResizeObserver(() => {
      setMarginBottom(-(el.offsetHeight * (Math.abs(yPercent) / 100)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [isDesktop, yPercent]);

  const Tag = motion[as];

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        y,
        marginBottom: isDesktop ? marginBottom : undefined,
        position: "relative",
        zIndex,
        willChange: "transform",
      }}
    >
      {children}
    </Tag>
  );
}
