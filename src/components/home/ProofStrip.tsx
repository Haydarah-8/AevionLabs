"use client";

import { FadeIn } from "@/components/anim/text";

const PROOF = [
  {
    n: "01",
    title: "Prototype first",
    body: "You use the system before the rest of the budget unlocks.",
  },
  {
    n: "02",
    title: "One team",
    body: "Strategy, design, and engineering stay in the same room.",
  },
  {
    n: "03",
    title: "You own it",
    body: "Code, CMS, domain, and hosting sit in your name.",
  },
];

export function ProofStrip() {
  return (
    <section className="border-y border-black/10 bg-[#f6f6f6]">
      <div className="mx-auto grid max-w-[var(--section-max)] px-[var(--section-x)] md:grid-cols-3">
        {PROOF.map((item, index) => (
          <FadeIn
            key={item.n}
            delay={index * 0.1}
            className={`group py-12 md:py-16 ${
              index > 0
                ? "border-t border-black/10 md:border-t-0 md:border-l md:pl-10 lg:pl-14"
                : ""
            } ${index < PROOF.length - 1 ? "md:pr-10 lg:pr-14" : ""}`}
          >
            <p className="m-0 text-[0.6875rem] font-medium tracking-[0.18em] text-[#8a8a8a]">
              ({item.n})
            </p>
            <h3 className="mt-4 text-[1.45rem] font-normal tracking-tight text-[#111] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5">
              {item.title}
            </h3>
            <p className="mt-3 max-w-[28ch] text-[0.98rem] font-light leading-[1.65] text-[#525252]">
              {item.body}
            </p>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
