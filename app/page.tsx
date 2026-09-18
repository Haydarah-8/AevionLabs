"use client";

import { motionValue, useTransform, type MotionValue } from "framer-motion";
import { useState } from "react";
import { HomeHero } from "@/components/home/Hero";
import { HomeIntro } from "@/components/home/Intro";
import { WorkSlider } from "@/components/home/WorkSlider";
import { HomeServices } from "@/components/home/ServicesList";
import { HomeAbout } from "@/components/home/AboutSection";
import { ImageBand } from "@/components/home/ImageBand";
import { CtaSection } from "@/components/chrome/CtaSection";
import { Footer } from "@/components/chrome/Footer";

const zero = motionValue(0);

export default function HomePage() {
  /* intro-section progress darkens the hero; services progress darkens work */
  const [introProgress, setIntroProgress] = useState<MotionValue<number>>(zero);
  const [svcProgress, setSvcProgress] = useState<MotionValue<number>>(zero);

  const heroOverlay = useTransform(introProgress, [0, 1], [0, 1]);
  const workOverlay = useTransform(svcProgress, [0, 1], [0, 1]);

  return (
    <div className="main_wrap">
      <HomeHero overlayOpacity={heroOverlay} />
      <HomeIntro onProgress={setIntroProgress} />
      <WorkSlider workOverlayOpacity={workOverlay} />
      <HomeServices onProgress={setSvcProgress} />
      <HomeAbout />
      <ImageBand />
      <CtaSection />
      <Footer />
    </div>
  );
}
