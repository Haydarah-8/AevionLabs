"use client";

import { motionValue, useTransform, type MotionValue } from "framer-motion";
import { useState } from "react";
import { HomeAbout } from "@/components/home/AboutSection";
import { ClientLogos } from "@/components/home/ClientLogos";
import { Hero } from "@/components/home/Hero";
import { ImageBand } from "@/components/home/ImageBand";
import { NewsPreview, type NewsPreviewArticle } from "@/components/home/NewsPreview";
import { HomeServices } from "@/components/home/ServicesList";
import { HomeIntro } from "@/components/home/StudioIntro";

const zero = motionValue(0);

export function HomeStack({
  headline,
  body,
  ctaLabel,
  ctaHref,
  image,
  logoKicker,
  articles,
}: {
  headline?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  image?: string;
  logoKicker?: string;
  articles: NewsPreviewArticle[];
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
      <HomeServices />
      <HomeAbout />
      <ImageBand />
      <ClientLogos kicker={logoKicker} />
      <NewsPreview articles={articles} />
    </>
  );
}
