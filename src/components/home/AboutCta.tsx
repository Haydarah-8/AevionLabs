import Link from "next/link";
import { SectionFrame } from "@/components/ui/SectionFrame";
import { TalkTrigger } from "@/components/site/TalkTrigger";
import { HOME_CTA_HEADING, HERO_CTA_LABEL } from "@/data/copy";

function isTalkHref(href?: string) {
  return !href || href === "#talk" || href === "/about";
}

export function AboutCta({
  heading = HOME_CTA_HEADING,
  ctaLabel = HERO_CTA_LABEL,
  ctaHref = "#talk",
}: {
  heading?: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  const talk = isTalkHref(ctaHref);

  return (
    <SectionFrame tone="black">
      <div className="flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-end">
        <div>
          <p className="site-kicker is-light">Start a project</p>
          <h2 className="site-display max-w-[16ch]">{heading}</h2>
        </div>
        {talk ? (
          <TalkTrigger className="site-btn site-btn-light shrink-0">
            {ctaLabel}
          </TalkTrigger>
        ) : (
          <Link href={ctaHref} className="site-btn site-btn-light shrink-0">
            {ctaLabel}
          </Link>
        )}
      </div>
    </SectionFrame>
  );
}
