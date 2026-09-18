"use client";

import { animate, stagger } from "framer-motion";
import { useContext, useEffect, useRef } from "react";
import { EASE } from "@/lib/utils";
import { IntroContext } from "@/components/anim/useIntro";
import { WordmarkLetters } from "@/components/brand/Wordmark";
import { BrandMark } from "@/components/brand/BrandMark";
import { useLenis } from "lenis/react";

/**
 * First-load overlay: logo paths rise in while the percentage counts
 * 0 → 77 → (fonts ready) → 100, then the loader fades and the page intro fires.
 */
let loaderStarted = false;
let loaderDone = false;

export function Loader() {
  const { fireIntro } = useContext(IntroContext);
  const ref = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;

  useEffect(() => {
    if (loaderStarted) {
      /* run already in flight (React strict-mode double effect) - let it finish.
         Only skip ahead when a prior run fully completed (e.g. HMR remount). */
      if (loaderDone) {
        const loader = ref.current;
        if (loader) {
          loader.style.display = "none";
          loader.setAttribute("aria-hidden", "true");
        }
        fireIntro();
      }
      return;
    }
    loaderStarted = true;

    const loader = ref.current!;
    const percentEl = percentRef.current!;
    const barFill = barRef.current!;
    const logoPaths = loader.querySelectorAll<HTMLElement>(".wordmark_letter");

    loader.style.display = "block";
    loader.style.opacity = "1";
    /* opaque from the start - the original only slides the letterforms up
       (its tween holds autoAlpha at 1), so the mark reads together with the
       percentage rather than fading in behind it */
    logoPaths.forEach((p) => {
      p.style.opacity = "1";
      p.style.transform = "translateY(160%)";
    });

    const setProgress = (v: number) => {
      percentEl.textContent = `${Math.round(v)}%`;
      barFill.style.clipPath = `inset(0 ${100 - v}% 0 0)`;
    };
    setProgress(0);
    lenisRef.current?.stop();
    document.documentElement.style.overflow = "hidden";

    /* Must run exactly once, and must run even if the animation chain stalls
       (rAF is throttled in background tabs) - otherwise the scroll lock is
       never lifted and the page looks frozen. */
    const finish = () => {
      if (loaderDone) return;
      loaderDone = true;
      loader.style.display = "none";
      loader.setAttribute("aria-hidden", "true");
      document.documentElement.style.overflow = "";
      window.scrollTo(0, 0);
      lenisRef.current?.scrollTo(0, { immediate: true, force: true });
      lenisRef.current?.start();
      fireIntro();
    };
    const failsafe = setTimeout(finish, 8000);

    const run = async () => {
      await new Promise((r) => setTimeout(r, 200));

      if (logoPaths.length) animate(
        logoPaths,
        { transform: ["translateY(160%)", "translateY(0%)"] },
        { duration: 1, delay: stagger(1 / logoPaths.length), ease: EASE.power4out }
      );

      await animate(0, 77, {
        duration: 1.2,
        ease: EASE.power2out,
        onUpdate: setProgress,
      });
      await (document.fonts?.ready ?? Promise.resolve());

      await animate(77, 100, {
        duration: 0.675,
        ease: EASE.power2inOut,
        onUpdate: setProgress,
      });
      await new Promise((r) => setTimeout(r, 150));
      await animate(loader, { opacity: [1, 0] }, { duration: 0.35, ease: EASE.power2out });

      clearTimeout(failsafe);
      finish();
    };

    run().catch((e) => console.error("loader failed:", e));
  }, [fireIntro]);

  return (
    <div ref={ref} id="loader" className="loader_wrap" style={{ display: "block", opacity: 1, background: "var(--color-white)" }}>
      <div className="loader_main_wrap">
        <div className="loader_main_top">
          <div className="loader_cpt u-text-sm">Connecting</div>
        </div>
        <div className="loader_main_mid grid-col-12" style={{ display: "flex", alignItems: "center", gap: "0.6em" }}>
          <BrandMark className="loader_svg_logo" />
          <WordmarkLetters className="loader_svg_logo" />
        </div>
        <div className="loader_main_bottom grid-col-12">
          <div className="loader_percent_wrap">
            <div ref={percentRef} className="loader_main_percent u-text-md" data-loader-percent="">
              0%
            </div>
          </div>
          <div className="loader_bar_wrap">
            <div ref={barRef} className="loader_bar_front" data-loader-bar-fill="" />
          </div>
        </div>
      </div>
    </div>
  );
}
