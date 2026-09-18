import Link from "next/link";
import { SectionFrame } from "@/components/ui/SectionFrame";

export type NewsPreviewArticle = {
  href: string;
  category: string;
  sub: string;
  date: string;
  title: string;
  excerpt: string;
};

export function NewsPreview({
  articles,
  kicker = "Insights",
  heading = "From the desk",
  ctaLabel = "All insights",
  ctaHref = "/news",
}: {
  articles: NewsPreviewArticle[];
  kicker?: string;
  heading?: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  if (!articles.length) return null;

  const label = ctaLabel.replace(/\s*→\s*$/, "").trim() || "All insights";

  return (
    <SectionFrame tone="stone">
      <div className="mb-12 flex items-end justify-between gap-6 sm:mb-16">
        <div>
          <p className="site-kicker">{kicker}</p>
          <h2 className="site-display">{heading}</h2>
        </div>
        <Link
          href={ctaHref}
          className="site-link-arrow hidden text-black sm:inline-flex"
        >
          {label}
        </Link>
      </div>
      <ul className="grid gap-0 divide-y divide-black/10 border-y border-black/10 sm:grid-cols-2 sm:gap-px sm:divide-y-0 sm:border-0 sm:bg-[#e4e4e4] lg:grid-cols-3">
        {articles.map((article) => (
          <li key={article.href} className="bg-[#f6f6f6] sm:bg-transparent">
            <Link
              href={article.href}
              className="group flex h-full flex-col bg-[#f6f6f6] py-8 transition-colors duration-300 hover:bg-white sm:px-7 sm:py-8"
            >
              <p className="text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-[#8a8a8a]">
                {article.category}
                {article.sub ? ` · ${article.sub}` : ""}
              </p>
              <h3 className="mt-4 text-[1.4rem] font-normal leading-[1.25] tracking-tight text-black">
                {article.title}
              </h3>
              <p className="mt-3 line-clamp-3 flex-1 text-[0.975rem] font-light leading-[1.7] text-[#525252]">
                {article.excerpt}
              </p>
              <p className="mt-6 text-[0.75rem] tracking-[0.08em] text-[#8a8a8a]">
                {article.date}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href={ctaHref}
        className="site-link-arrow mt-10 text-black sm:hidden"
      >
        {label}
      </Link>
    </SectionFrame>
  );
}
