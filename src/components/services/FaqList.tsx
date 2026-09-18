import { SERVICE_FAQS, parseTitledItems } from "@/data/engagement";

export function FaqList({
  kicker = "Questions",
  heading = "What companies usually ask before they start.",
  items,
}: {
  kicker?: string;
  heading?: string;
  items?: string[];
}) {
  const faqs = parseTitledItems(
    items,
    SERVICE_FAQS.map((item) => ({ title: item.question, body: item.answer })),
  );

  return (
    <section className="border-t border-black/15 bg-white">
      <div className="mx-auto w-full max-w-[var(--section-max)] px-[var(--section-x)] pt-[var(--section-y)]">
        <p className="site-kicker">{kicker}</p>
        <h2 className="site-display m-0 max-w-[16ch] text-[#111]">{heading}</h2>
      </div>

      <div className="mx-auto mt-12 w-full max-w-[var(--section-max)] px-[var(--section-x)] pb-[var(--section-y)] lg:mt-16">
        {faqs.map((item) => (
          <article
            key={item.title}
            className="grid gap-4 border-t border-black/15 py-10 md:grid-cols-2 md:gap-16 md:py-12 lg:gap-24 lg:py-14"
          >
            <h3 className="m-0 max-w-[22ch] text-[clamp(1.25rem,2vw,1.7rem)] font-normal leading-[1.2] tracking-[-0.03em] text-[#111]">
              {item.title}
            </h3>
            {item.body ? (
              <p className="m-0 max-w-[42ch] text-[0.98rem] font-normal leading-[1.6] text-[#3f3f3f] md:pt-1">
                {item.body}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
