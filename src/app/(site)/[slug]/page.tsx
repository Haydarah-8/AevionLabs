import { notFound } from "next/navigation";
import { CmsSections } from "@/components/cms/CmsSections";
import { PageJsonLd } from "@/components/seo/PageJsonLd";
import { buildMetadata } from "@/lib/seo";
import { RESERVED_SLUGS, SYSTEM_SLUGS } from "@/lib/cms/constants";
import { getPublishedPageBySlug } from "@/lib/cms/store";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (SYSTEM_SLUGS.has(slug) || RESERVED_SLUGS.has(slug)) return {};
  const page = await getPublishedPageBySlug(slug);
  if (!page) return {};
  return buildMetadata({
    title: page.seoTitle || page.title,
    description: page.seoDescription || page.title,
    path: page.path,
  });
}

export default async function CmsCustomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (SYSTEM_SLUGS.has(slug) || RESERVED_SLUGS.has(slug)) notFound();
  const page = await getPublishedPageBySlug(slug);
  if (!page?.sections.length) notFound();

  return (
    <main id="main" className="flex-1 bg-white">
      <PageJsonLd
        path={page.path}
        pageName={page.title}
        description={page.seoDescription || page.title}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: page.title, path: page.path },
        ]}
      />
      <CmsSections page={page} />
    </main>
  );
}
