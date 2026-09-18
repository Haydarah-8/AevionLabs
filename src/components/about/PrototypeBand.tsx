import { TalkLinkBtn } from "@/components/site/TalkTrigger";
import { SITE_IMAGES } from "@/lib/images";

export function PrototypeBand({
  kicker = "Why this studio",
  heading = "Handoffs are where products go wrong. We removed them.",
  body = "Companies should not take the risk of a full build on a deck of slides. You see the system in the browser first. Only then do we unlock the remaining spend and write production code on a repository you own.",
  aside = "We started Aevion Labs after watching too many sites, stores, and internal tools get designed by one team, built by another, and launched slower and harder to change than anyone intended. One brief. One team. Manchester.",
  note = "Keep us because the work is good, not because leaving would be painful.",
  year = "Est. 2026",
  ctaLabel = "Let's talk",
}: {
  kicker?: string;
  heading?: string;
  body?: string;
  aside?: string;
  note?: string;
  year?: string;
  ctaLabel?: string;
}) {
  return (
    <section className="bg-white">
      <div className="mx-auto w-full max-w-[var(--section-max)] px-[var(--section-x)] pt-[var(--section-y)]">
        <p className="site-kicker">
          {kicker}
          {year ? ` · ${year}` : ""}
        </p>
        <h2 className="site-display m-0 max-w-[18ch] text-[#111]">{heading}</h2>
      </div>

      <div className="mx-auto mt-12 w-full max-w-[var(--section-max)] px-[var(--section-x)] lg:mt-16">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="aspect-[16/8] w-full object-cover bg-[#f4f4f4] sm:aspect-[2.2/1]"
          src={SITE_IMAGES.aboutWide.src}
          alt={SITE_IMAGES.aboutWide.alt}
        />
      </div>

      <div className="mx-auto grid w-full max-w-[var(--section-max)] gap-10 px-[var(--section-x)] py-[clamp(3.5rem,7vw,5.5rem)] md:grid-cols-2 md:gap-16">
        {body ? <p className="site-body m-0 max-w-[38ch]">{body}</p> : null}
        <div>
          {aside ? <p className="site-body m-0 max-w-[38ch]">{aside}</p> : null}
          {note ? (
            <p className="mt-8 m-0 max-w-[32rem] text-[1.05rem] font-normal leading-[1.45] tracking-[-0.02em] text-[#111]">
              {note}
            </p>
          ) : null}
          {ctaLabel ? (
            <div className="mt-8">
              <TalkLinkBtn>{ctaLabel} →</TalkLinkBtn>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
