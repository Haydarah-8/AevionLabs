import { BlogsView } from "@/components/blogs/BlogsView";
import { PageJsonLd } from "@/components/seo/PageJsonLd";
import { buildMetadata } from "@/lib/seo";
import { listPublishedPosts } from "@/lib/blog/store";
import { getPublishedPageBySlug } from "@/lib/cms/store";

export const dynamic = "force-dynamic";

const PAGE_DESCRIPTION =
  "Insights from Aevion Labs on shipping software: AI features, apps, code, and products that have to earn their keep.";

export async function generateMetadata() {
  const page = await getPublishedPageBySlug("news");
  return buildMetadata({
    title:
      page?.seoTitle && page.seoTitle.toLowerCase() !== "blogs"
        ? page.seoTitle
        : "Insights",
    description: page?.seoDescription || PAGE_DESCRIPTION,
    path: "/news",
    keywords: ["insights", "AI", "apps", "engineering", "Aevion Labs"],
  });
}

export default async function NewsPage() {
  const [page, posts] = await Promise.all([
    getPublishedPageBySlug("news"),
    listPublishedPosts(),
  ]);

  return (
    <main id="main" className="flex-1 bg-white">
      <PageJsonLd
        path="/news"
        pageName={page?.title || "Insights"}
        description={page?.seoDescription || PAGE_DESCRIPTION}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Insights", path: "/news" },
        ]}
      />
      <BlogsView page={page} posts={posts} />
    </main>
  );
}
