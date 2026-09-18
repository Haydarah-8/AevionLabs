"use client";

import { motionValue, useTransform, type MotionValue } from "framer-motion";
import { useState } from "react";
import { HomeHero } from "@/components/home/StudioHero";
import { HomeIntro } from "@/components/home/StudioIntro";
import { WorkSlider } from "@/components/home/WorkSlider";
import { HomeServices } from "@/components/home/ServicesList";
import { HomeAbout } from "@/components/home/AboutSection";
import { ImageBand } from "@/components/home/ImageBand";
import { LinkBtn } from "@/components/anim/LinkBtn";
import { RevealLines } from "@/components/anim/text";
import { TransitionLink } from "@/components/chrome/PageTransition";

const zero = motionValue(0);

export type StudioInsight = {
  href: string;
  category: string;
  date: string;
  title: string;
  excerpt: string;
};

export function StudioHome({ insights }: { insights: StudioInsight[] }) {
  const [introProgress, setIntroProgress] = useState<MotionValue<number>>(zero);
  const [svcProgress, setSvcProgress] = useState<MotionValue<number>>(zero);

  const heroOverlay = useTransform(introProgress, [0, 1], [0, 1]);
  const workOverlay = useTransform(svcProgress, [0, 1], [0, 1]);

  return (
    <div className="main_wrap" id="main">
      <HomeHero overlayOpacity={heroOverlay} />
      <HomeIntro onProgress={setIntroProgress} />
      <WorkSlider workOverlayOpacity={workOverlay} />
      <HomeServices onProgress={setSvcProgress} />
      <HomeAbout />
      <ImageBand />
      {insights.length ? (
        <section className="insight_container u-container" aria-labelledby="studio-insights">
          <div className="about_top_wrap grid-col-12">
            <RevealLines as="h2" className="about_top_heading_text u-text-xl" staggerLines={0}>
              from the studio
            </RevealLines>
          </div>
          <div className="insight_list">
            {insights.map((item, index) => (
              <TransitionLink
                key={item.href}
                href={item.href}
                className="insight_row w-inline-block"
              >
                <p className="insight_row_meta u-text-sm">
                  {String(index + 1).padStart(2, "0")} · {item.category} · {item.date}
                </p>
                <h3 className="insight_row_title u-text-md">{item.title}</h3>
                <p className="insight_row_excerpt u-text-base">{item.excerpt}</p>
              </TransitionLink>
            ))}
          </div>
          <div className="insight_footer">
            <LinkBtn href="/news">All insights →</LinkBtn>
          </div>
        </section>
      ) : null}
    </div>
  );
}
