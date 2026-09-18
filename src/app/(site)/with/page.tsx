import Link from "next/link";
import { PageLead } from "@/components/ui/PageLead";
import { PageJsonLd } from "@/components/seo/PageJsonLd";
import { TalkCta } from "@/components/site/TalkCta";
import { PLATFORM_TOPICS, hrefForTopic, kindLabel } from "@/data/topics";
import { buildMetadata } from "@/lib/seo";

const DESCRIPTION =
  "The companies, platforms, and technologies Aevion Labs ships with: from Google and OpenAI through to Next.js, Stripe, and the CMS your team already uses.";

export const dynamic = "force-static";

export const metadata = buildMetadata({
  title: "Platforms and technologies",
  description: DESCRIPTION,
  path: "/with",
  keywords: ["platforms", "technologies", "stack", "Aevion Labs"],
});

const GROUPS = [
  {
    label: "Companies and platforms",
    items: PLATFORM_TOPICS.filter((topic) => topic.kind === "company"),
  },
  {
    label: "Languages and frameworks",
    items: PLATFORM_TOPICS.filter((topic) => topic.kind === "technology"),
  },
] as const;

export default function WithIndexPage() {
  return (
    <main id="main" className="flex-1 bg-white">
      <PageJsonLd
        path="/with"
        pageName="Platforms and technologies"
        description={DESCRIPTION}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Platforms", path: "/with" },
        ]}
      />
      <PageLead
        kicker="Stack"
        title={"The platforms we ship with."}
        body={DESCRIPTION}
        image="/images/home-about.jpg"
        secondaryLabel="What we build"
        secondaryHref="/services"
      />

      {GROUPS.map((group) => (
        <section key={group.label} className="border-t border-black/10 bg-white">
          <div className="mx-auto w-full max-w-[var(--section-max)] px-[var(--section-x)] py-16">
            <p className="m-0 text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-[#8a8a8a]">
              {group.label}
            </p>
            <ul className="mt-8 m-0 grid list-none gap-0 border-t border-black/10 p-0 sm:grid-cols-2">
              {group.items.map((topic) => (
                <li key={topic.slug} className="border-b border-black/10">
                  <Link
                    href={hrefForTopic(topic)}
                    className="group flex items-baseline justify-between gap-6 py-5 text-[#111] no-underline"
                  >
                    <span>
                      <span className="block text-[1.2rem] tracking-tight transition-opacity group-hover:opacity-60">
                        {topic.name}
                      </span>
                      <span className="mt-1 block text-[0.75rem] uppercase tracking-[0.14em] text-[#8a8a8a]">
                        {kindLabel(topic.kind)}
                      </span>
                    </span>
                    <span className="text-[#8a8a8a]">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}

      <TalkCta />
    </main>
  );
}
