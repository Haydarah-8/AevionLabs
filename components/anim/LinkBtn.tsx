"use client";

import { animate, motion } from "framer-motion";
import { useEffect, type ReactNode, type RefObject } from "react";
import { cn, EASE } from "@/lib/utils";
import { TransitionLink } from "@/components/chrome/PageTransition";

/**
 * Imperative underline hover-swap for buttons whose lines are also driven by
 * reveal animations (hero / CTA): line 1 wipes out right, line 2 wipes in left.
 */
export function useBtnLinesHover(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const line1 = el.querySelector<HTMLElement>(".link_btn_line:not(.is-2)");
    const line2 = el.querySelector<HTMLElement>(".link_btn_line.is-2");
    if (!line1 || !line2) return;

    const onEnter = () => {
      animate(line1, { clipPath: "inset(0 0 0 100%)" }, { duration: 0.5, ease: EASE.power3inOut });
      animate(
        line2,
        { clipPath: ["inset(0 100% 0 0)", "inset(0 0% 0 0)"] },
        { duration: 0.5, ease: EASE.power3inOut, delay: 0.465 }
      );
    };
    const onLeave = () => {
      animate(line2, { clipPath: "inset(0 100% 0 0)" }, { duration: 0.5, ease: EASE.power3inOut });
      animate(
        line1,
        { clipPath: "inset(0 0 0 0%)" },
        { duration: 0.5, ease: EASE.power3inOut, delay: 0.465 }
      );
    };

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [ref]);
}

/**
 * The site's underline button: two stacked lines, on hover line 1 wipes out to
 * the right while line 2 wipes in from the left (and back on leave).
 */
const line1Variants = {
  rest: {
    clipPath: "inset(0 0 0 0%)",
    transition: { duration: 0.5, ease: EASE.power3inOut, delay: 0.465 },
  },
  hover: {
    clipPath: "inset(0 0 0 100%)",
    transition: { duration: 0.5, ease: EASE.power3inOut },
  },
};

const line2Variants = {
  rest: {
    clipPath: "inset(0 100% 0 0)",
    transition: { duration: 0.5, ease: EASE.power3inOut },
  },
  hover: {
    clipPath: "inset(0 0% 0 0)",
    transition: { duration: 0.5, ease: EASE.power3inOut, delay: 0.465 },
  },
};

export function BtnLines({ lineClassName }: { lineClassName?: string }) {
  return (
    <>
      <motion.div
        className={cn("link_btn_line", lineClassName)}
        variants={line1Variants}
      />
      <motion.div
        className={cn("link_btn_line is-2", lineClassName)}
        variants={line2Variants}
      />
    </>
  );
}

export function LinkBtn({
  href,
  onClick,
  className,
  textClassName,
  lineClassName,
  children,
}: {
  href?: string;
  onClick?: () => void;
  className?: string;
  textClassName?: string;
  lineClassName?: string;
  children: ReactNode;
}) {
  const inner = (
    <>
      <div className={cn("link_btn_text u-text-base", textClassName)}>{children}</div>
      <BtnLines lineClassName={lineClassName} />
    </>
  );

  if (href && href.startsWith("/")) {
    return (
      <motion.span initial="rest" whileHover="hover" animate="rest" className="contents">
        <TransitionLink href={href} className={cn("link_btn w-inline-block", className)}>
          {inner}
        </TransitionLink>
      </motion.span>
    );
  }
  if (href) {
    return (
      <motion.a
        href={href}
        className={cn("btn_btn w-inline-block", className)}
        initial="rest"
        whileHover="hover"
        animate="rest"
      >
        {inner}
      </motion.a>
    );
  }
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={cn("btn_btn", className)}
      initial="rest"
      whileHover="hover"
      animate="rest"
    >
      {inner}
    </motion.button>
  );
}
