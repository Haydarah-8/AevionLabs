import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Sitemap",
  description: "HTML sitemap of Aevion Labs pages.",
  path: "/sitemap",
  noIndex: true,
});

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/with", label: "Platforms and technologies" },
  { href: "/news", label: "Insights" },
  { href: "/talk", label: "Let's talk" },
];

export default function SitemapPage() {
  return (
    <main id="main" className="flex-1 bg-white">
      <PageHero title="Sitemap" />
      <div className="mx-auto max-w-[var(--section-max)] px-[var(--section-x)] py-16">
        <p className="m-0 text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-[#8a8a8a]">
          Pages
        </p>
        <ul className="mt-8 m-0 grid list-none gap-0 border-t border-black/10 p-0 sm:grid-cols-2">
          {links.map((l) => (
            <li key={l.href} className="border-b border-black/10">
              <Link
                href={l.href}
                className="flex items-baseline justify-between gap-6 py-5 text-[#111] no-underline transition-opacity hover:opacity-60"
              >
                <span className="text-[1.25rem]">{l.label}</span>
                <span className="text-[0.8rem] text-[#8a8a8a]">{l.href}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
