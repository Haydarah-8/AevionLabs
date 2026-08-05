"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";
import { cn, EASE } from "@/lib/utils";

/**
 * Hover treatment used on nav links / footer links / logo:
 * the label slides up and scales down while a clone slides in from below.
 */
const enter = { duration: 0.45, ease: EASE.power4out };
const leave = { duration: 0.3, ease: EASE.power3out };

const origVariants = {
  rest: { y: "0%", scale: 1, transition: leave },
  hover: { y: "-100%", scale: 0.8, transition: enter },
};

const cloneVariants = {
  rest: { y: "0%", scale: 0.8, transition: leave },
  hover: { y: "-100%", scale: 1, transition: enter },
};

export function SlideUpHover({
  children,
  clone,
  className,
  asChild = false,
}: {
  children: ReactNode;
  /** Optional different content for the incoming clone (e.g. Menu → Close). */
  clone?: ReactNode;
  className?: string;
  asChild?: boolean;
}) {
  return (
    <span
      className={cn("inline-block overflow-hidden relative align-top", className)}
      style={{ display: asChild ? "block" : undefined }}
    >
      <motion.span
        className="block will-change-transform origin-center"
        variants={origVariants}
      >
        {children}
      </motion.span>
      <motion.span
        className="block absolute top-full left-0 w-full will-change-transform origin-center"
        variants={cloneVariants}
      >
        {clone ?? children}
      </motion.span>
    </span>
  );
}

/** Wrapper that owns the hover state; use around one or more SlideUpHover children. */
export function HoverGroup({
  children,
  className,
  hovered,
}: {
  children: ReactNode;
  className?: string;
  /** Controlled hover state (e.g. menu open button). */
  hovered?: boolean;
}) {
  if (hovered !== undefined) {
    return (
      <motion.span className={cn("contents", className)} animate={hovered ? "hover" : "rest"} initial="rest">
        {children}
      </motion.span>
    );
  }
  return (
    <motion.span
      className={cn("contents", className)}
      initial="rest"
      whileHover="hover"
      animate="rest"
    >
      {children}
    </motion.span>
  );
}
