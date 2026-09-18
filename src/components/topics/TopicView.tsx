import Link from "next/link";
import { FadeIn, RevealLines } from "@/components/anim/text";
import { ImageReveal } from "@/components/anim/image";
import { LinkBtn } from "@/components/anim/LinkBtn";
import { PageLead } from "@/components/ui/PageLead";
import { TalkCta } from "@/components/site/TalkCta";
import { TopicCase } from "@/components/topics/TopicCase";
import {
  hrefForTopic,
  kindLabel,
  relatedTopics,
  type Topic,
} from "@/data/topics";
import { imagesForTopic } from "@/lib/topic-images";

export function TopicView({ topic }: { topic: Topic }) {
  if (topic.kind === "service") {
    return <CompactTopicView topic={topic} />;
  }
  return <TopicCase topic={topic} />;
}

function CompactTopicView({ topic }: { topic: Topic }) {
  const images = imagesForTopic(topic.slug);
  const related = relatedTopics(topic);

  return (
    <>
      <PageLead
        kicker={`${kindLabel(topic.kind)} · ${topic.name}`}
        title={topic.headline}
        body={topic.lede}
        image={images.hero.src}
        secondaryLabel="All services"
        secondaryHref="/services"
      />

      <IntroSplit
        kicker="01 · how we use it"
        heading="Built into the product, not bolted on the side."
        image={images.intro}
        paragraphs={[topic.about, topic.how]}
      />

      <UsesRow kicker="02 · where it shows up" uses={topic.uses} />
      <ExampleGrid
        kicker="03 · examples"
        name={topic.name}
        examples={topic.examples}
        images={images.examples}
      />
      <NextSection topic={topic} related={related} />
      <TalkCta />
    </>
  );
}

function IntroSplit({
  kicker,
  heading,
  image,
  paragraphs,
}: {
  kicker: string;
  heading: string;
  image: { src: string; alt: string };
  paragraphs: string[];
}) {
  return (
    <section className="bg-white">
      <div className="mx-auto grid w-full max-w-[var(--section-max)] items-start gap-10 px-[var(--section-x)] py-[clamp(4.5rem,9vw,7.5rem)] md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] md:gap-16">
        <ImageReveal
          className="aspect-[4/5] w-full overflow-hidden bg-[#f4f4f4]"
          imgClassName="h-[125%] w-full object-cover"
          src={image.src}
          alt={image.alt}
          parallax
        />
        <div className="min-w-0 md:pt-4">
          <RevealLines
            className="m-0 text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-[#8a8a8a]"
            staggerLines={0}
          >
            {kicker}
          </RevealLines>
          <RevealLines
            as="h2"
            className="mt-8 max-w-[16ch] text-[clamp(2.15rem,4.4vw,3.6rem)] font-normal leading-[1.06] tracking-[-0.04em] text-[#111]"
          >
            {heading}
          </RevealLines>
          {paragraphs.map((paragraph) => (
            <FadeIn
              key={paragraph.slice(0, 24)}
              className="site-body mt-8 max-w-[42ch]"
            >
              {paragraph}
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function UsesRow({ kicker, uses }: { kicker: string; uses: string[] }) {
  return (
    <section className="bg-[#f6f6f6]">
      <div className="mx-auto w-full max-w-[var(--section-max)] px-[var(--section-x)] py-[clamp(4.5rem,9vw,7.5rem)]">
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
          <RevealLines
            className="m-0 text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-[#8a8a8a]"
            staggerLines={0}
          >
            {kicker}
          </RevealLines>
          <RevealLines
            className="m-0 text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-[#8a8a8a]"
            staggerLines={0}
          >
            {String(uses.length).padStart(2, "0")} uses
          </RevealLines>
        </div>
        <ul className="mt-14 m-0 grid list-none gap-0 border-t border-black/10 p-0 md:grid-cols-3">
          {uses.map((use, index) => (
            <li
              key={use}
              className="min-w-0 border-b border-black/10 py-8 md:border-b-0 md:px-8 md:py-10 md:first:pl-0 md:last:pr-0 md:[&:not(:last-child)]:border-r"
            >
              <p className="m-0 text-[0.6875rem] font-medium tracking-[0.18em] text-[#8a8a8a]">
                {String(index + 1).padStart(2, "0")}
              </p>
              <p className="mt-5 text-[1.15rem] font-normal leading-[1.4] tracking-[-0.03em] text-[#111]">
                {use}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ExampleGrid({
  kicker,
  name,
  examples,
  images,
}: {
  kicker: string;
  name: string;
  examples: { title: string; body: string }[];
  images: readonly { src: string; alt: string }[];
}) {
  return (
    <section className="bg-white">
      <div className="mx-auto w-full max-w-[var(--section-max)] px-[var(--section-x)] py-[clamp(4.5rem,9vw,7.5rem)]">
        <RevealLines
          className="m-0 text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-[#8a8a8a]"
          staggerLines={0}
        >
          {kicker}
        </RevealLines>
        <RevealLines
          as="h2"
          className="mt-8 max-w-[16ch] text-[clamp(2.15rem,4.8vw,3.85rem)] font-normal leading-[1.08] tracking-[-0.04em] text-[#111]"
        >
          How this looks in a build.
        </RevealLines>
        <ul className="mt-14 m-0 grid list-none gap-10 p-0 lg:grid-cols-3 lg:gap-8">
          {examples.map((example, index) => {
            const image = images[index] ?? images[0];
            return (
              <li key={example.title} className="min-w-0">
                <ImageReveal
                  className="aspect-[4/3] w-full overflow-hidden bg-[#f4f4f4]"
                  imgClassName="h-[125%] w-full object-cover"
                  src={image.src}
                  alt={image.alt}
                />
                <p className="mt-5 text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-[#8a8a8a]">
                  {name}
                </p>
                <h3 className="mt-3 text-[1.35rem] font-normal leading-[1.2] tracking-tight text-[#111]">
                  {example.title}
                </h3>
                <p className="mt-3 text-[0.98rem] font-light leading-[1.7] text-[#525252]">
                  {example.body}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function NextSection({ topic, related }: { topic: Topic; related: Topic[] }) {
  const indexHref = topic.kind === "service" ? "/services" : "/with";
  const indexLabel =
    topic.kind === "service" ? "All services" : "All platforms";

  return (
    <section className="bg-[#f6f6f6]">
      <div className="mx-auto w-full max-w-[var(--section-max)] px-[var(--section-x)] py-[clamp(4.5rem,9vw,7.5rem)]">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-black/10 pb-8">
          <div>
            <RevealLines
              className="m-0 text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-[#8a8a8a]"
              staggerLines={0}
            >
              Next
            </RevealLines>
            <RevealLines
              as="h2"
              className="mt-6 max-w-[14ch] text-[clamp(2rem,4vw,3.2rem)] font-normal leading-[1.08] tracking-[-0.04em] text-[#111]"
            >
              Keep reading, or start the brief.
            </RevealLines>
          </div>
          <LinkBtn href={indexHref}>{indexLabel} →</LinkBtn>
        </div>

        {related.length ? (
          <ul className="mt-10 m-0 grid list-none gap-0 p-0 md:grid-cols-2">
            {related.map((item) => (
              <li key={item.slug} className="border-b border-black/10">
                <Link
                  href={hrefForTopic(item)}
                  className="group flex items-baseline justify-between gap-6 py-6 text-[#111] no-underline"
                >
                  <span>
                    <span className="block text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-[#8a8a8a]">
                      {kindLabel(item.kind)}
                    </span>
                    <span className="mt-2 block text-[1.25rem] tracking-tight transition-opacity group-hover:opacity-60">
                      {item.name}
                    </span>
                  </span>
                  <span className="text-[0.9rem] text-[#8a8a8a]">→</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
