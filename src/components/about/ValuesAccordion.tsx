import { AGENCY_VALUES, parseTitledItems } from "@/data/engagement";

export function ValuesAccordion({
  kicker = "How we work",
  heading = "Four commitments before anyone writes a line of code.",
  items,
}: {
  kicker?: string;
  heading?: string;
  items?: string[];
}) {
  const values = parseTitledItems(items, AGENCY_VALUES);

  return (
    <section className="border-t border-black/15 bg-white">
      <div className="mx-auto w-full max-w-[var(--section-max)] px-[var(--section-x)] pt-[var(--section-y)]">
        <p className="site-kicker">{kicker}</p>
        <h2 className="site-display m-0 max-w-[18ch] text-[#111]">{heading}</h2>
      </div>

      <div className="mx-auto mt-12 grid w-full max-w-[var(--section-max)] px-[var(--section-x)] pb-[var(--section-y)] sm:grid-cols-2 lg:mt-16">
        {values.map((value, index) => (
          <article
            key={value.title}
            className="border-t border-black/15 py-8 sm:px-8 sm:odd:pl-0 sm:even:border-l sm:even:pr-0 lg:py-10"
          >
            <p className="m-0 text-[0.6875rem] font-medium tracking-[0.16em] text-[#6a6a6a]">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h3 className="mt-3 m-0 text-[clamp(1.25rem,2vw,1.55rem)] font-normal leading-[1.2] tracking-[-0.03em] text-[#111]">
              {value.title}
            </h3>
            {value.body ? (
              <p className="mt-3 m-0 max-w-[36ch] text-[0.98rem] font-normal leading-[1.55] text-[#3f3f3f]">
                {value.body}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
