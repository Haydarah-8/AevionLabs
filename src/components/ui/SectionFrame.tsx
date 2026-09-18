"use client";

import type { ReactNode } from "react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";

const TONES = {
  white: "bg-white text-[var(--foreground)]",
  stone: "bg-[#f6f6f6] text-[var(--foreground)]",
  cream: "bg-[var(--cream)] text-[var(--foreground)]",
  sky: "bg-[var(--sky)] text-[var(--foreground)]",
  sage: "bg-[var(--sage)] text-[var(--foreground)]",
  black: "bg-black text-white",
  navy: "bg-[var(--navy)] text-white",
} as const;

export function SectionFrame({
  children,
  tone = "white",
  className = "",
  id,
}: {
  children: ReactNode;
  tone?: keyof typeof TONES;
  className?: string;
  id?: string;
}) {
  return (
    <AnimatedSection id={id} className={`${TONES[tone]} ${className}`.trim()}>
      <div className="mx-auto w-full max-w-[var(--section-max)] px-[var(--section-x)] py-[var(--section-y)]">
        {children}
      </div>
    </AnimatedSection>
  );
}
