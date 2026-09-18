"use client";

import {
  motion,
  useInView,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";
import { EASE, cn } from "@/lib/utils";
import { useIntroEffect } from "./useIntro";
import { animate } from "framer-motion";

const VIEW_MARGIN = "0px 0px -20% 0px" as const;

/**
 * Clip reveal: wrapper un-clips (direction-aware) while the image settles from scale 1.25.
 */
export function ImageReveal({
  className,
  imgClassName,
  src,
  alt,
  from = "bottom",
  trigger = "view",
  parallax = false,
  settleScale = 1,
}: {
  className?: string;
  imgClassName?: string;
  src: string;
  alt: string;
  from?: "bottom" | "top";
  trigger?: "view" | "intro";
  parallax?: boolean;
  settleScale?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const inView = useInView(ref, { once: true, margin: VIEW_MARGIN });
  const played = useRef(false);

  const closed = from === "bottom" ? "inset(0 0 100% 0)" : "inset(100% 0 0 0)";
  const open = from === "bottom" ? "inset(0 0 0% 0)" : "inset(0% 0 0 0)";

  const play = () => {
    if (played.current || !ref.current || !imgRef.current) return;
    played.current = true;
    animate(
      ref.current,
      { clipPath: [closed, open] },
      {
        duration: 1.25,
        ease: from === "bottom" ? EASE.power4inOut : EASE.power4out,
      },
    );
    animate(
      imgRef.current,
      { scale: [1.25, settleScale] },
      {
        duration: 1.75,
        ease: EASE.power3out,
      },
    );
  };

  useIntroEffect(() => {
    if (trigger === "intro") play();
  });

  useEffect(() => {
    if (trigger === "view" && inView) play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, trigger]);

  return (
    <div
      ref={ref}
      className={cn("relative", className)}
      style={{ clipPath: closed }}
    >
      <ParallaxOrPlain
        parallax={parallax}
        containerRef={ref}
        imgRef={imgRef}
        className={imgClassName}
        src={src}
        alt={alt}
      />
    </div>
  );
}

function ParallaxOrPlain({
  parallax,
  containerRef,
  imgRef,
  className,
  src,
  alt,
}: {
  parallax: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  imgRef: React.RefObject<HTMLImageElement | null>;
  className?: string;
  src: string;
  alt: string;
}) {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-20%", "0%"]);

  if (!parallax) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        ref={imgRef}
        className={className}
        src={src}
        alt={alt}
        loading="eager"
        decoding="async"
      />
    );
  }
  return (
    <motion.img
      ref={imgRef}
      className={className}
      src={src}
      alt={alt}
      loading="eager"
      decoding="async"
      style={{ y, willChange: "transform" }}
    />
  );
}

/**
 * Scroll parallax: image drifts from -20% to 0 while its wrapper crosses the viewport.
 * Wrapper should have overflow hidden + the image sized ~125% tall (matches original CSS).
 */
export function ParallaxImage({
  className,
  imgClassName,
  src,
  alt,
  children,
}: {
  className?: string;
  imgClassName?: string;
  src: string;
  alt: string;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-20%", "0%"]);

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.img
        className={imgClassName}
        src={src}
        alt={alt}
        loading="eager"
        decoding="async"
        style={{ y, willChange: "transform" }}
      />
      {children}
    </div>
  );
}

export function useSectionProgress(
  ref: React.RefObject<HTMLElement | null>,
  offset: [string, string] = ["start end", "start start"],
): MotionValue<number> {
  const { scrollYProgress } = useScroll({
    target: ref,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    offset: offset as any,
  });
  return scrollYProgress;
}
