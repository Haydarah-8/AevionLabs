import { notFound } from "next/navigation";
import { PageJsonLd } from "@/components/seo/PageJsonLd";
import { TopicView } from "@/components/topics/TopicView";
import { SERVICE_TOPICS, getServiceTopic } from "@/data/topics";
import { buildMetadata } from "@/lib/seo";
import { imagesForTopic } from "@/lib/topic-images";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICE_TOPICS.map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const topic = getServiceTopic(slug);
  if (!topic) {
    return { title: "Service", robots: { index: false, follow: false } };
  }

  return buildMetadata({
    title: topic.name,
    description: topic.lede,
    path: `/services/${topic.slug}`,
    keywords: [topic.name, topic.kicker, "services", "Aevion Labs"],
    ogImage: imagesForTopic(topic.slug).hero.src,
  });
}

export default async function ServiceTopicPage({ params }: Props) {
  const { slug } = await params;
  const topic = getServiceTopic(slug);
  if (!topic) notFound();

  return (
    <main id="main" className="flex-1 bg-white">
      <PageJsonLd
        path={`/services/${topic.slug}`}
        pageName={topic.name}
        description={topic.lede}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: topic.name, path: `/services/${topic.slug}` },
        ]}
      />
      <TopicView topic={topic} />
    </main>
  );
}
