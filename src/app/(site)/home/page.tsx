import { SheetHome } from "@/components/home/sheet/SheetHome";
import { PageJsonLd } from "@/components/seo/PageJsonLd";
import { buildMetadata } from "@/lib/seo";
import { DEFAULT_DESCRIPTION, SITE_DEFAULT_TITLE } from "@/lib/site";
import {
  freshCopy,
  LEGACY_HERO_BODY,
  LEGACY_HERO_HEADLINE,
  PREV_HERO_BODY,
  PREV_HERO_HEADLINE,
} from "@/data/copy";
import { listPublishedPosts } from "@/lib/blog/store";
import { getPublishedPageBySlug, getSiteSettings } from "@/lib/cms/store";
import type { CmsPage } from "@/lib/cms/types";
import "@/app/site-home.css";

export const dynamic = "force-dynamic";

function section(page: CmsPage | null, type: string) {
  return page?.sections.find((item) => item.visible && item.type === type);
}

function text(data: Record<string, unknown> | undefined, key: string) {
  const value = data?.[key];
  return typeof value === "string" && value.trim() ? value : undefined;
}

export async function generateMetadata() {
  const [page, settings] = await Promise.all([
    getPublishedPageBySlug("home"),
    getSiteSettings(),
  ]);
  return buildMetadata({
    title: page?.seoTitle || settings.tagline || SITE_DEFAULT_TITLE,
    description:
      page?.seoDescription || settings.description || DEFAULT_DESCRIPTION,
    path: "/home",
    keywords: [
      "web design",
      "web development",
      "design agency",
      "Next.js",
      "UX",
      "Aevion Labs",
    ],
  });
}

export default async function SheetHomePage() {
  const [page, posts] = await Promise.all([
    getPublishedPageBySlug("home"),
    listPublishedPosts(),
  ]);
  const hero = section(page, "hero");

  return (
    <main id="main">
      <PageJsonLd
        path="/home"
        pageName={page?.seoTitle || page?.title || SITE_DEFAULT_TITLE}
        description={page?.seoDescription || DEFAULT_DESCRIPTION}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Index", path: "/home" },
        ]}
      />
      <SheetHome
        headline={freshCopy(
          text(hero?.data, "headline"),
          LEGACY_HERO_HEADLINE,
          PREV_HERO_HEADLINE,
        )}
        body={freshCopy(
          text(hero?.data, "body"),
          LEGACY_HERO_BODY,
          PREV_HERO_BODY,
        )}
        ctaLabel={freshCopy(text(hero?.data, "ctaLabel"), "Meet the agency")}
        ctaHref={freshCopy(text(hero?.data, "ctaHref"), "/about")}
        posts={posts}
      />
    </main>
  );
}
