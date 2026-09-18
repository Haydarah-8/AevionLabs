import { LinkBtn } from "@/components/anim/LinkBtn";
import { PROCESS_STEPS, parseTitledItems } from "@/data/engagement";

export function ServiceOfferings({
  kicker = "How we work",
  heading = "You do not buy the full build until you have seen the system.",
  body = "A working prototype or design system comes first. The remaining budget unlocks after you approve it. Then we build on a repository you own.",
  items,
}: {
  kicker?: string;
  heading?: string;
  body?: string;
  items?: string[];
  image?: string;
}) {
  const steps = parseTitledItems(items, PROCESS_STEPS);

  return (
    <section
      id="how-we-work"
      className="scroll-mt-24 border-t border-black/15 bg-white"
    >
      <div className="mx-auto w-full max-w-[var(--section-max)] px-[var(--section-x)] pt-[var(--section-y)]">
        <p className="site-kicker">{kicker}</p>
        <h2 className="site-display m-0 max-w-[16ch] text-[#111]">{heading}</h2>
        {body ? (
          <p className="site-body mt-8 m-0 max-w-[42rem]">{body}</p>
        ) : null}
        <div className="mt-10">
          <LinkBtn href="/services">See services →</LinkBtn>
        </div>
      </div>

      <ol className="mx-auto mt-16 m-0 w-full max-w-[var(--section-max)] list-none px-[var(--section-x)] pb-[var(--section-y)] lg:mt-20">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="grid gap-3 border-t border-black/15 py-12 lg:grid-cols-[4.75rem_minmax(0,0.9fr)_minmax(0,1.2fr)] lg:items-start lg:gap-12 lg:py-16"
          >
            <p className="m-0 text-[0.75rem] font-medium tracking-[0.16em] text-[#6a6a6a]">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h3 className="m-0 max-w-[18ch] text-[clamp(1.4rem,2.4vw,1.9rem)] font-normal leading-[1.15] tracking-[-0.03em] text-[#111]">
              {step.title}
            </h3>
            <p className="m-0 max-w-[42ch] text-[0.98rem] font-normal leading-[1.6] text-[#3f3f3f] lg:pt-1">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
