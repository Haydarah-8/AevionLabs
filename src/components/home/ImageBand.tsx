"use client";

import { DragMarquee } from "@/components/home/DragMarquee";
import { BAND_IMAGES } from "@/lib/images";
import { BAND_BODY, BAND_KICKER, BAND_LINE } from "@/data/copy";

export function ImageBand() {
  return (
    <section className="relative isolate overflow-x-clip bg-[#0a0a0a] text-white">
      <header className="mx-auto w-full max-w-[var(--section-max)] px-[var(--section-x)] pt-[var(--section-y)] pb-12 lg:pb-16">
        <p className="site-kicker is-light">{BAND_KICKER}</p>
        <h2 className="site-display m-0 max-w-[12ch] text-white">
          {BAND_LINE}
        </h2>
        <p className="mt-6 m-0 max-w-[36rem] text-[1.05rem] font-light leading-[1.75] text-white/70">
          {BAND_BODY}
        </p>
      </header>

      <DragMarquee
        className="relative overflow-x-clip is-drag"
        trackClassName="flex w-max items-center gap-3 sm:gap-4"
        speed={32}
        style={{
          WebkitMaskImage:
            "linear-gradient(90deg, #0000 0%, #000 7%, #000 93%, #0000 100%)",
          maskImage:
            "linear-gradient(90deg, #0000 0%, #000 7%, #000 93%, #0000 100%)",
        }}
      >
        {[...BAND_IMAGES, ...BAND_IMAGES].map((img, i) => (
          <div
            key={`${img.src}-${i}`}
            className="h-[16rem] w-[20rem] shrink-0 overflow-hidden border border-white/10 sm:h-[20rem] sm:w-[26rem] lg:h-[24rem] lg:w-[32rem]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="h-full w-full object-cover pointer-events-none"
              src={img.src}
              alt={i < BAND_IMAGES.length ? img.alt : ""}
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          </div>
        ))}
      </DragMarquee>

      <p className="mx-auto m-0 max-w-[var(--section-max)] px-[var(--section-x)] py-10 text-[0.98rem] font-normal leading-[1.6] text-white/55 sm:py-12">
        You judge the product in the browser. Then the remaining spend unlocks.
      </p>
    </section>
  );
}
