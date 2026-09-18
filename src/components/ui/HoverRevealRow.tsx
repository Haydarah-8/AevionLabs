"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { EASE } from "@/lib/utils";
import { useHasHover } from "@/components/anim/useIntro";

export type HoverRowItem = {
  id: string;
  title: string;
  tag?: string;
  body: string;
  points?: string[];
  href?: string;
};

function ArrowMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-8 w-8">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        d="M5 12h14M13 6l6 6-6 6"
      />
    </svg>
  );
}

export function HoverRevealRow({
  item,
  index,
  last = false,
}: {
  item: HoverRowItem;
  index: number;
  last?: boolean;
}) {
  const reduceMotionPref = useReducedMotion();
  const href = item.href;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  const inner = (
    <RowInner
      item={item}
      index={index}
      reduceMotion={ready ? Boolean(reduceMotionPref) : false}
      hoverEnabled={ready}
    />
  );

  return (
    <div
      id={item.id}
      className={
        last
          ? "group scroll-mt-24"
          : "group scroll-mt-24 border-b border-black/10"
      }
    >
      {href ? (
        <Link href={href} className="group block no-underline">
          {inner}
        </Link>
      ) : (
        inner
      )}
    </div>
  );
}

function RowInner({
  item,
  index,
  reduceMotion,
  hoverEnabled,
}: {
  item: HoverRowItem;
  index: number;
  reduceMotion: boolean;
  hoverEnabled: boolean;
}) {
  const hasHover = useHasHover();

  return (
    <motion.article
      className="relative isolate overflow-hidden px-0 py-10 sm:py-12 lg:py-14"
      initial="rest"
      whileHover={hoverEnabled && hasHover ? "hover" : undefined}
      animate="rest"
    >
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 bg-[#111]"
        style={{ originY: 1 }}
        variants={{
          rest: { scaleY: 0 },
          hover: { scaleY: 1 },
        }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 0.7, ease: EASE.power4out }
        }
      />

      <motion.div
        className="relative z-10 mx-auto grid max-w-[var(--section-max)] items-start gap-4 px-[var(--section-x)] sm:grid-cols-[5.5rem_minmax(0,1fr)_3rem] lg:gap-8"
        variants={{
          rest: { color: "#111111" },
          hover: { color: "#ffffff" },
        }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 0.35, ease: EASE.power2out }
        }
      >
        <p className="m-0 text-[0.8rem] font-medium tracking-[0.14em] opacity-50">
          ({String(index + 1).padStart(2, "0")})
        </p>

        <div className="min-w-0">
          <motion.h3
            className="m-0 text-[clamp(2.15rem,5.4vw,4.75rem)] font-medium leading-[0.92] tracking-[-0.035em]"
            variants={{
              rest: { scale: 1 },
              hover: { scale: 0.985 },
            }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.7, ease: EASE.power4out }
            }
          >
            {item.title}
          </motion.h3>

          <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:grid-rows-[1fr] group-focus-within:grid-rows-[1fr]">
            <div className="overflow-hidden">
              <div className="grid gap-6 pt-6 lg:grid-cols-[8rem_minmax(0,1fr)_minmax(0,0.9fr)]">
                {item.tag ? (
                  <p className="m-0 text-[0.6875rem] font-medium uppercase tracking-[0.18em] opacity-55">
                    {item.tag}
                  </p>
                ) : (
                  <span />
                )}
                <p className="m-0 max-w-xl text-[1.02rem] font-light leading-[1.7] opacity-80">
                  {item.body}
                </p>
                {item.points?.length ? (
                  <ul className="m-0 grid list-none gap-1 p-0 text-[0.8rem] font-medium uppercase tracking-[0.12em] opacity-70">
                    {item.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="relative hidden h-8 w-8 overflow-hidden sm:block">
          <motion.span
            className="absolute inset-0 flex"
            variants={{
              rest: { x: "0%" },
              hover: { x: "120%" },
            }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.5, ease: EASE.power4out }
            }
          >
            <ArrowMark />
          </motion.span>
          <motion.span
            className="absolute inset-0 flex"
            variants={{
              rest: { x: "-120%", y: "120%", rotate: -45 },
              hover: { x: "0%", y: "0%", rotate: -45 },
            }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.5, delay: 0.12, ease: EASE.power4out }
            }
          >
            <ArrowMark />
          </motion.span>
        </div>
      </motion.div>
    </motion.article>
  );
}
