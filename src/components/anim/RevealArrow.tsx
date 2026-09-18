"use client";

import { motion } from "framer-motion";
import { EASE } from "@/lib/utils";

export function ArrowMark({ className = "h-5 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 114 94"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M70.6389 0L113.78 46.5967L70.6389 93.1953L60.5947 83.4804L88.5868 53.677H0V39.5163H88.5868L60.5947 9.71297L70.6389 0Z" />
    </svg>
  );
}

export function RevealArrow({
  hovered,
  className = "h-5 w-6",
}: {
  hovered: boolean;
  className?: string;
}) {
  return (
    <span className="relative inline-flex h-5 w-6 overflow-hidden">
      <motion.span
        className="inline-flex will-change-transform"
        animate={{ x: hovered ? "120%" : "0%" }}
        transition={{
          duration: hovered ? 0.5 : 0.75,
          ease: EASE.power4out,
          delay: hovered ? 0 : 0.2,
        }}
      >
        <ArrowMark className={className} />
      </motion.span>
      <motion.span
        className="absolute inset-0 inline-flex will-change-transform"
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
        <ArrowMark className={className} />
      </motion.span>
    </span>
  );
}
