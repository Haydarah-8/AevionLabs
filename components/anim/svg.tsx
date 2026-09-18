"use client";

import { animate, stagger, useInView } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { EASE } from "@/lib/utils";
import { useIntroToken } from "./useIntro";

const VIEW_MARGIN = "0px 0px -20% 0px" as const;

type Trigger = "view" | "intro";
type Mode = "slide" | "flicker" | "blink";

/**
 * Animates the child SVG's paths:
 *  - "slide": paths rise from 120% (hero wordmarks), stagger per path
 *  - "flicker": paths rise from 160%, stagger spread across `spread` seconds
 *  - "blink": opacity blink reveal
 */
export function SvgReveal({
  children,
  className,
  trigger = "view",
  mode = "flicker",
  spread = 1,
  perPathStagger = 0.1,
  delay = 0,
  style,
}: {
  children: ReactNode;
  className?: string;
  trigger?: Trigger;
  mode?: Mode;
  spread?: number;
  perPathStagger?: number;
  delay?: number;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const introToken = useIntroToken();
  const inView = useInView(ref, { once: true, margin: VIEW_MARGIN });
  const played = useRef(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const paths = el.querySelectorAll<SVGPathElement>(
      "svg path, svg rect, svg polygon, svg circle"
    );
    paths.forEach((p) => {
      if (mode === "blink") p.style.opacity = "1";
      else p.style.transform = mode === "slide" ? "translateY(120%)" : "translateY(160%)";
    });
  }, [mode]);

  const armed = trigger === "view" ? inView : introToken > 0;

  useEffect(() => {
    const el = ref.current;
    if (!el || !armed || played.current) return;
    played.current = true;
    const paths = el.querySelectorAll<SVGPathElement>(
      "svg path, svg rect, svg polygon, svg circle"
    );
    if (!paths.length) return;

    if (mode === "blink") {
      animate(paths, { opacity: [1, 0] }, { duration: 0.05, delay: stagger(0.03, { startDelay: delay }) });
      animate(paths, { opacity: [0, 1] }, { duration: 0.1, delay: stagger(0.03, { startDelay: delay + 0.1 }) });
      return;
    }

    const from = mode === "slide" ? "translateY(120%)" : "translateY(160%)";
    animate(
      paths,
      { transform: [from, "translateY(0%)"] },
      {
        duration: 1,
        delay:
          mode === "slide"
            ? stagger(perPathStagger, { startDelay: delay })
            : stagger(spread / paths.length, { startDelay: delay }),
        ease: EASE.power4out,
      }
    );
  }, [armed, delay, mode, perPathStagger, spread]);

  return (
    <div ref={ref} className={className} style={{ display: "contents", ...style }}>
      {children}
    </div>
  );
}
