"use client";

import {
  motion,
  useAnimationControls,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { useEffect, useRef, useState, type ElementType } from "react";
import { EASE } from "@/lib/utils";

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function Reel({
  to,
  delay,
  loops,
  reduce,
}: {
  to: number;
  delay: number;
  loops: number;
  reduce: boolean | null;
}) {
  const index = loops * 10 + to;
  const items = Array.from({ length: index + 6 }, (_, i) => i % 10);

  return (
    <span className="lost-reel">
      <motion.span
        className="lost-reel-strip"
        initial={{ y: "0em" }}
        animate={{ y: `${-index * 0.88}em` }}
        transition={
          reduce
            ? { duration: 0 }
            : {
                delay,
                type: "spring",
                stiffness: 58,
                damping: 15.5,
                mass: 1.2,
              }
        }
      >
        {items.map((n, i) => (
          <span className="lost-reel-n" key={i}>
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

function SadFace({ reduce }: { reduce: boolean | null }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const eyeX = useMotionValue(0);
  const eyeY = useMotionValue(0);
  const x = useSpring(eyeX, { stiffness: 160, damping: 18, mass: 0.35 });
  const y = useSpring(eyeY, { stiffness: 160, damping: 18, mass: 0.35 });
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    if (reduce) return;
    const onMove = (event: MouseEvent) => {
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const nx =
        (event.clientX - (rect.left + rect.width / 2)) /
        (window.innerWidth * 0.5);
      const ny =
        (event.clientY - (rect.top + rect.height / 2)) /
        (window.innerHeight * 0.5);
      eyeX.set(Math.max(-1, Math.min(1, nx)) * 3.4);
      eyeY.set(Math.max(-1, Math.min(1, ny)) * 2.6);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [eyeX, eyeY, reduce]);

  useEffect(() => {
    if (reduce) return;
    let cancelled = false;
    (async () => {
      await wait(1800);
      while (!cancelled) {
        setBlink(true);
        await wait(90);
        if (cancelled) return;
        setBlink(false);
        if (Math.random() > 0.55) {
          await wait(80);
          if (cancelled) return;
          setBlink(true);
          await wait(80);
          if (cancelled) return;
          setBlink(false);
        }
        await wait(3000 + Math.random() * 2600);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reduce]);

  return (
    <motion.div
      ref={wrapRef}
      className="lost-face-wrap"
      initial={reduce ? false : { opacity: 0, y: 18, scale: 0.84 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={
        reduce ? { duration: 0 } : { duration: 0.95, ease: EASE.power4out }
      }
    >
      <motion.svg
        className={`lost-face${blink ? " is-blink" : ""}`}
        viewBox="0 0 100 100"
        aria-hidden
        animate={reduce ? undefined : { y: [0, -8, 0] }}
        transition={
          reduce
            ? { duration: 0 }
            : { duration: 5.6, delay: 1.2, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <motion.circle
          className="lost-face-ring"
          cx="50"
          cy="50"
          r="36"
          initial={reduce ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={
            reduce ? { duration: 0 } : { duration: 1.2, ease: EASE.power2out }
          }
        />
        <motion.g className="lost-eyes" style={{ x, y }}>
          <motion.circle
            className="lost-eye"
            cx="38"
            cy="46"
            r="3.15"
            initial={reduce ? false : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={
              reduce
                ? { duration: 0 }
                : { type: "spring", stiffness: 420, damping: 14, delay: 0.42 }
            }
          />
          <motion.circle
            className="lost-eye"
            cx="62"
            cy="46"
            r="3.15"
            initial={reduce ? false : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={
              reduce
                ? { duration: 0 }
                : { type: "spring", stiffness: 420, damping: 14, delay: 0.54 }
            }
          />
        </motion.g>
        <motion.path
          className="lost-face-mouth"
          d="M37 68 Q50 58 63 68"
          initial={reduce ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={
            reduce
              ? { duration: 0 }
              : { duration: 0.75, delay: 0.64, ease: EASE.power3out }
          }
        />
      </motion.svg>
    </motion.div>
  );
}

export function LostChars({
  text,
  reduce,
  delay = 0,
  as: Tag = "h1",
  className,
}: {
  text: string;
  reduce: boolean | null;
  delay?: number;
  as?: ElementType;
  className?: string;
}) {
  if (reduce) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <Tag className={className} aria-label={text}>
      {Array.from(text).map((ch, i) => (
        <motion.span
          key={`${ch}-${i}`}
          aria-hidden
          className="lost-char"
          initial={{ y: "0.6em", opacity: 0, filter: "blur(12px)" }}
          animate={{ y: "0em", opacity: 1, filter: "blur(0px)" }}
          transition={{
            delay: delay + i * 0.03,
            duration: 0.68,
            ease: EASE.power4out,
          }}
        >
          {ch === " " ? "\u00a0" : ch}
        </motion.span>
      ))}
    </Tag>
  );
}

export function NotFoundMark({ reduce }: { reduce: boolean | null }) {
  const [glitch, setGlitch] = useState(false);
  const codeControls = useAnimationControls();

  useEffect(() => {
    if (reduce) {
      void codeControls.start({ opacity: 1, y: 0, scale: 1 });
      return;
    }
    void codeControls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, delay: 0.08, ease: EASE.power4out },
    });
    const hit = window.setTimeout(() => {
      void codeControls.start({
        scale: [1, 1.045, 1],
        transition: { duration: 0.55, ease: EASE.power2out },
      });
      setGlitch(true);
    }, 1980);
    const clear = window.setTimeout(() => setGlitch(false), 2440);
    return () => {
      window.clearTimeout(hit);
      window.clearTimeout(clear);
    };
  }, [codeControls, reduce]);

  return (
    <div className="lost-hero" aria-hidden>
      <SadFace reduce={reduce} />
      <motion.p
        className="lost-code"
        initial={reduce ? false : { opacity: 0, y: 22, scale: 1 }}
        animate={codeControls}
      >
        <span
          className={`lost-code-spin${glitch ? " is-glitch" : ""}`}
          aria-hidden
        >
          <Reel to={4} delay={0.18} loops={2} reduce={reduce} />
          <Reel to={0} delay={0.34} loops={3} reduce={reduce} />
          <Reel to={4} delay={0.5} loops={2} reduce={reduce} />
        </span>
      </motion.p>
      <motion.span
        className="lost-rule"
        initial={reduce ? false : { scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={
          reduce
            ? { duration: 0 }
            : { duration: 0.7, delay: 1.85, ease: EASE.power4out }
        }
      />
    </div>
  );
}
