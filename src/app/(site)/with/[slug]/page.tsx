import { notFound } from "next/navigation";
import { PageJsonLd } from "@/components/seo/PageJsonLd";
import { TopicView } from "@/components/topics/TopicView";
import { PLATFORM_TOPICS, getPlatformTopic } from "@/data/topics";
import { buildMetadata } from "@/lib/seo";
import { imagesForTopic } from "@/lib/topic-images";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return PLATFORM_TOPICS.map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const topic = getPlatformTopic(slug);
  if (!topic) {
    return { title: "Platform", robots: { index: false, follow: false } };
  }

  return buildMetadata({
    title: topic.name,
    description: topic.lede,
    path: `/with/${topic.slug}`,
    keywords: [topic.name, topic.kicker, "Aevion Labs"],
    ogImage: imagesForTopic(topic.slug).hero.src,
  });
}

export default async function PlatformTopicPage({ params }: Props) {
  const { slug } = await params;
  const topic = getPlatformTopic(slug);
  if (!topic) notFound();

  return (
    <main id="main" className="flex-1 bg-white">
      <PageJsonLd
        path={`/with/${topic.slug}`}
        pageName={topic.name}
        description={topic.lede}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Platforms", path: "/with" },
          { name: topic.name, path: `/with/${topic.slug}` },
        ]}
      />
      <TopicView topic={topic} />
    </main>
  );
}
