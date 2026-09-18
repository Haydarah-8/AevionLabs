import { AboutView } from "@/components/about/AboutView";
import { PageJsonLd } from "@/components/seo/PageJsonLd";
import { buildMetadata } from "@/lib/seo";
import { getPublishedPageBySlug } from "@/lib/cms/store";

const DESCRIPTION =
  "Manchester studio for company sites, SaaS, ecommerce, and internal tools. You see a working prototype before the rest of the budget unlocks.";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const page = await getPublishedPageBySlug("about");
  return buildMetadata({
    title: page?.seoTitle || page?.title || "About",
    description: page?.seoDescription || DESCRIPTION,
    path: "/about",
    keywords: ["about", "tech studio", "SaaS", "Aevion Labs"],
  });
}

export default async function AboutPage() {
  const page = await getPublishedPageBySlug("about");

  return (
    <main id="main" className="flex-1 bg-white">
      <PageJsonLd
        path="/about"
        pageName={page?.title || "About"}
        description={page?.seoDescription || DESCRIPTION}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ]}
      />
      <AboutView page={page} />
    </main>
  );
}
