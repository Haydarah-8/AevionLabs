import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleHtml } from "@/components/news/ArticleHtml";
import { LinkBtn } from "@/components/anim/LinkBtn";
import { TalkLinkBtn } from "@/components/site/TalkTrigger";
import { buildMetadata } from "@/lib/seo";
import { getSiteUrl, SITE_NAME } from "@/lib/site";
import { getPostBySlug, listPublishedPosts } from "@/lib/blog/store";
import { excerptFromPost, firstFigureSrc } from "@/lib/blog/utils";
import type { BlogPost } from "@/lib/blog/types";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

function NewsArticleJsonLd({
  article,
  slug,
}: {
  article: BlogPost;
  slug: string;
}) {
  const base = getSiteUrl();
  const url = `${base}/news/${slug}`;
  const datePublished = article.publishedAt
    ? `${article.publishedAt}T12:00:00.000Z`
    : undefined;

  const newsArticle = {
    "@type": "Article",
    headline: article.title,
    description: excerptFromPost(article),
    articleSection: article.category,
    inLanguage: "en-GB",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    ...(datePublished
      ? { datePublished, dateModified: article.updatedAt }
      : {}),
    author: {
      "@type": "Organization",
      name: article.author || SITE_NAME,
      url: base,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${base}/icon.svg` },
    },
  };

  const breadcrumbs = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      {
        "@type": "ListItem",
        position: 2,
        name: "Insights",
        item: `${base}/news`,
      },
      { "@type": "ListItem", position: 3, name: article.title, item: url },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [newsArticle, breadcrumbs],
        }),
      }}
    />
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = await getPostBySlug(slug);
  if (!a) {
    return { title: "Article", robots: { index: false, follow: false } };
  }

  return buildMetadata({
    title: a.seoTitle || a.title,
    description: a.seoDescription || excerptFromPost(a),
    path: `/news/${slug}`,
    keywords: [a.category, a.sub, "insights", "Aevion Labs"],
    ogImage: firstFigureSrc(a.content),
    ogType: "article",
    publishedTime: a.publishedAt,
    modifiedTime: a.updatedAt.slice(0, 10),
  });
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;
  const a = await getPostBySlug(slug);
  if (!a) notFound();
  const related = (await listPublishedPosts())
    .filter((post) => post.slug !== a.slug)
    .slice(0, 3);

  const kicker = ["Insights", a.category, a.sub].filter(Boolean).join(" · ");

  return (
    <main id="main" className="min-w-0 w-full max-w-full flex-1 overflow-x-hidden bg-white">
      <NewsArticleJsonLd article={a} slug={slug} />

      <article className="mx-auto w-full max-w-[var(--section-max)] px-[var(--section-x)] pt-32 pb-4 sm:pt-36">
        <p className="site-kicker">{kicker}</p>
        <h1 className="site-display m-0 max-w-[18ch] text-[#111]">{a.title}</h1>
        <p className="site-body mt-6 m-0 max-w-[38rem]">{excerptFromPost(a)}</p>
        <p className="mt-8 m-0 text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-[#6a6a6a]">
          {[a.date, a.author || SITE_NAME].filter(Boolean).join(" · ")}
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-8">
          <TalkLinkBtn>Let&apos;s talk</TalkLinkBtn>
          <LinkBtn href="/news">All insights →</LinkBtn>
        </div>
      </article>

      <div className="mx-auto mt-12 w-full max-w-[var(--section-max)] border-t border-black/15 px-[var(--section-x)] pt-12 pb-[var(--section-y)] lg:mt-16">
        <ArticleHtml html={a.html} content={a.content} />
      </div>

      {related.length ? (
        <section className="border-t border-black/15 bg-white">
          <div className="mx-auto w-full max-w-[var(--section-max)] px-[var(--section-x)] pt-16">
            <p className="site-kicker">More notes</p>
          </div>
          <div className="mx-auto w-full max-w-[var(--section-max)] px-[var(--section-x)] pb-[var(--section-y)]">
            {related.map((post) => (
              <Link
                key={post.id}
                href={`/news/${post.slug}`}
                className="group grid gap-3 border-t border-black/15 py-10 no-underline md:grid-cols-2 md:gap-16 md:py-12"
              >
                <div>
                  <p className="m-0 text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-[#6a6a6a]">
                    {[post.category, post.date].filter(Boolean).join(" · ")}
                  </p>
                  <h2 className="mt-3 m-0 max-w-[22ch] text-[clamp(1.25rem,2vw,1.7rem)] font-normal leading-[1.2] tracking-[-0.03em] text-[#111] transition-opacity duration-200 group-hover:opacity-40">
                    {post.title}
                  </h2>
                </div>
                <p className="m-0 max-w-[42ch] text-[0.98rem] font-normal leading-[1.6] text-[#3f3f3f] md:pt-7">
                  {post.excerpt || post.seoDescription}
                </p>
              </Link>
            ))}
            <div className="border-t border-black/15 py-10">
              <LinkBtn href="/news">All insights →</LinkBtn>
            </div>
          </div>
        </section>
      ) : (
        <div className="border-t border-black/15 px-[var(--section-x)] py-10">
          <div className="mx-auto max-w-[var(--section-max)]">
            <LinkBtn href="/news">All insights →</LinkBtn>
          </div>
        </div>
      )}
    </main>
  );
}
