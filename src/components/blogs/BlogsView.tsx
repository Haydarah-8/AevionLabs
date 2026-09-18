import Link from "next/link";
import { LinkBtn } from "@/components/anim/LinkBtn";
import { TalkLinkBtn } from "@/components/site/TalkTrigger";
import {
  INSIGHTS_LEAD_BODY,
  INSIGHTS_LEAD_KICKER,
  INSIGHTS_LEAD_TITLE,
} from "@/data/copy";
import type { BlogListItem } from "@/lib/blog/types";
import type { CmsPage } from "@/lib/cms/types";

function section(page: CmsPage | null | undefined, type: string) {
  return page?.sections.find((item) => item.visible && item.type === type);
}

function text(data: Record<string, unknown> | undefined, key: string) {
  const value = data?.[key];
  return typeof value === "string" && value.trim() ? value : undefined;
}

function blurb(post: BlogListItem) {
  return post.excerpt.trim() || post.seoDescription.trim() || post.title;
}

function meta(post: BlogListItem) {
  return [post.category, post.sub, post.date].filter(Boolean).join(" · ");
}

export function BlogsView({
  page,
  posts,
}: {
  page?: CmsPage | null;
  posts: BlogListItem[];
}) {
  const hero = section(page, "page_hero");
  const list = section(page, "blog_list");
  const featured = posts.find((post) => post.featured) ?? posts[0];
  const ordered = featured
    ? [featured, ...posts.filter((post) => post.id !== featured.id)]
    : posts;
  const empty =
    text(list?.data, "empty") || "New notes land here as we publish them.";

  return (
    <>
      <header className="mx-auto w-full max-w-[var(--section-max)] px-[var(--section-x)] pt-32 pb-12 sm:pt-36">
        <p className="site-kicker">
          {text(hero?.data, "kicker") || INSIGHTS_LEAD_KICKER}
        </p>
        <h1 className="site-display m-0 max-w-[16ch] whitespace-pre-line text-[#111]">
          {text(hero?.data, "heading") || INSIGHTS_LEAD_TITLE}
        </h1>
        <p className="site-body mt-6 m-0 max-w-[38rem]">
          {text(hero?.data, "body") || INSIGHTS_LEAD_BODY}
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-8">
          <TalkLinkBtn>Let&apos;s talk</TalkLinkBtn>
          <LinkBtn href="/services">See services →</LinkBtn>
        </div>
      </header>

      <section className="border-t border-black/15 bg-white">
        {ordered.length === 0 ? (
          <div className="mx-auto w-full max-w-[var(--section-max)] px-[var(--section-x)] py-[var(--section-y)]">
            <p className="site-kicker">Notes</p>
            <p className="site-body m-0 max-w-[38rem]">{empty}</p>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-[var(--section-max)] px-[var(--section-x)] pt-16 pb-[var(--section-y)]">
            <p className="site-kicker">Notes</p>
            {ordered.map((post) => (
              <Link
                key={post.id}
                href={`/news/${post.slug}`}
                className="group grid gap-4 border-t border-black/15 py-10 no-underline md:grid-cols-2 md:gap-16 md:py-12 lg:gap-24 lg:py-14"
              >
                <div>
                  {meta(post) ? (
                    <p className="m-0 text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-[#6a6a6a]">
                      {meta(post)}
                    </p>
                  ) : null}
                  <h2 className="mt-3 m-0 max-w-[22ch] text-[clamp(1.25rem,2vw,1.7rem)] font-normal leading-[1.2] tracking-[-0.03em] text-[#111] transition-opacity duration-200 group-hover:opacity-40">
                    {post.title}
                  </h2>
                </div>
                <p className="m-0 max-w-[42ch] text-[0.98rem] font-normal leading-[1.6] text-[#3f3f3f] md:pt-7">
                  {blurb(post)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
