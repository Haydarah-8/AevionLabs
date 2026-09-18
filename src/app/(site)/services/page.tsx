import { ServicesView } from "@/components/services/ServicesView";
import { PageJsonLd } from "@/components/seo/PageJsonLd";
import { buildMetadata } from "@/lib/seo";
import { getPublishedPageBySlug } from "@/lib/cms/store";

const DESCRIPTION =
  "Company sites, SaaS products, ecommerce, internal tools, and the systems that keep them fast to change. You see a working prototype first.";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const page = await getPublishedPageBySlug("services");
  return buildMetadata({
    title: page?.seoTitle || "Services",
    description: page?.seoDescription || DESCRIPTION,
    path: "/services",
    keywords: [
      "web design services",
      "SaaS",
      "ecommerce",
      "internal tools",
      "Aevion Labs",
    ],
  });
}

export default async function ServicesPage() {
  const page = await getPublishedPageBySlug("services");

  return (
    <main id="main" className="flex-1 bg-white">
      <PageJsonLd
        path="/services"
        pageName={page?.title || "Services"}
        description={page?.seoDescription || DESCRIPTION}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
        ]}
      />
      <ServicesView page={page} />
    </main>
  );
}
