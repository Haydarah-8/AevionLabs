"use client";

import { animate, motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { EASE } from "@/lib/utils";
import { FadeIn, RevealLines, splitLines } from "@/components/anim/text";
import { useBtnLinesHover } from "@/components/anim/LinkBtn";
import { useContactModal } from "@/components/chrome/ContactModal";
import { useFontsReady } from "@/components/anim/useIntro";

/**
 * The pre-footer CTA: headline lines mask in, caption fades, big button reveals
 * (label lines rise + underline wipes in).
 */
export function CtaSection() {
  const { openModal } = useContactModal();
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -20% 0px" });
  const fontsReady = useFontsReady();
  const [prepared, setPrepared] = useState(false);
  const played = useRef(false);
  useBtnLinesHover(btnRef);

  useEffect(() => {
    const btn = btnRef.current;
    if (!btn || !fontsReady || prepared) return;
    btn.querySelectorAll<HTMLElement>(".link_btn_text").forEach((t) => {
      splitLines(t);
      t.querySelectorAll<HTMLElement>(".split-line").forEach(
        (l) => (l.style.transform = "translateY(120%)")
      );
      t.style.visibility = "visible";
    });
    setPrepared(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontsReady]);

  useEffect(() => {
    const btn = btnRef.current;
    if (!btn || !inView || !prepared || played.current) return;
    played.current = true;
    const lines = btn.querySelectorAll<HTMLElement>(".split-line");
    const btnLines = btn.querySelectorAll<HTMLElement>(".link_btn_line");
    if (!lines.length || !btnLines.length) return;
    animate(
      lines,
      { transform: ["translateY(120%)", "translateY(0%)"] },
      { duration: 1, delay: 0.65, ease: EASE.power4out }
    );
    animate(
      btnLines,
      { clipPath: ["inset(0 100% 0 0)", "inset(0 0% 0 0)"] },
      { duration: 1, delay: 0.75, ease: EASE.power4inOut }
    );
  }, [inView, prepared]);

  return (
    <div ref={ref} className="cta_container u-container" data-cta="" data-last-section="">
      <div className="footer_cta_wrap grid-col-12">
        <FadeIn className="footer_cta_right_cpt u-text-base" delay={0.35}>
          Tell us what you&apos;re planning and we&apos;ll reply within two working days with
          honest next steps, including if we think you&apos;d be better served
          elsewhere.
        </FadeIn>
        <div className="footer_cta_right_wrap">
          <motion.button
            ref={btnRef}
            type="button"
            className="btn_btn hero"
            onClick={openModal}
            initial="rest"
            whileHover="hover"
            animate="rest"
          >
            <div className="link_btn_text u-text-md" style={{ visibility: "hidden" }}>
              Start a project
            </div>
            <div className="link_btn_text u-text-md" style={{ visibility: "hidden" }}>
              →
            </div>
            <div className="link_btn_line hero cta" style={{ clipPath: "inset(0 100% 0 0)" }} />
            <div className="link_btn_line is-2 hero cta" />
          </motion.button>
        </div>
        <RevealLines className="footer_cta_text u-text-xl" staggerLines={0}>
          let&apos;s build something.
        </RevealLines>
      </div>
    </div>
  );
}
