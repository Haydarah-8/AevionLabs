"use client";

import { motionValue, useTransform, type MotionValue } from "framer-motion";
import { useState } from "react";
import { Hero } from "@/components/home/Hero";
import { HomeIntro } from "@/components/home/StudioIntro";

const zero = motionValue(0);

export function HomeMotionShell({
  headline,
  body,
  ctaLabel,
  ctaHref,
  image,
}: {
  headline?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  image?: string;
}) {
  const [introProgress, setIntroProgress] = useState<MotionValue<number>>(zero);
  const overlayOpacity = useTransform(introProgress, [0, 1], [0, 1]);

  return (
    <>
      <Hero
        headline={headline}
        body={body}
        ctaLabel={ctaLabel}
        ctaHref={ctaHref}
        image={image}
        overlayOpacity={overlayOpacity}
      />
      <HomeIntro onProgress={setIntroProgress} />
    </>
  );
}
