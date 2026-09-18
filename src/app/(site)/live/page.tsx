import { PageHero } from "@/components/ui/PageHero";
import { PageJsonLd } from "@/components/seo/PageJsonLd";
import { LiveFeed } from "@/components/live/LiveFeed";
import { ingestIfStale } from "@/lib/news/ingestion/run";
import { buildMetadata } from "@/lib/seo";
import {
  groupArticles,
  listBreaking,
  listVisibleArticles,
} from "@/lib/news/store";

export const dynamic = "force-dynamic";

const PAGE_DESCRIPTION =
  "Live news aggregation from public sources. Stories update as they are ingested — click through to the original publisher.";

export const metadata = buildMetadata({
  title: "Live",
  description: PAGE_DESCRIPTION,
  path: "/live",
  keywords: ["live", "industry news", "Aevion Labs"],
  noIndex: true,
});

export default async function LiveNewsPage() {
  let groups: ReturnType<typeof groupArticles> = [];
  let breaking: ReturnType<typeof groupArticles> = [];
  let cursor: string | null = null;
  try {
    // Refresh stale feeds in the background — never block the page on ingestion.
    void ingestIfStale().catch((err) =>
      console.error("[live] background ingest:", err),
    );
    const rows = await listVisibleArticles({ limit: 60 });
    groups = groupArticles(rows);
    breaking = groupArticles(await listBreaking(6));
    cursor = rows.length ? rows[rows.length - 1].published_at : null;
  } catch (err) {
    console.error("[live] initial load:", err);
  }

  return (
    <main id="main" className="flex-1 bg-white">
      <PageJsonLd
        path="/live"
        pageName="Live News"
        description={PAGE_DESCRIPTION}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Live News", path: "/live" },
        ]}
      />
      <PageHero title="Live" highlight="News" />
      <p className="mx-auto max-w-[1100px] px-5 pt-8 text-[1.05rem] font-light leading-[1.8] text-[#525252] sm:px-8 lg:px-[52px]">
        Public headlines from open news APIs. This is not a wire service: new
        stories appear when our server ingest runs, then update here without a
        refresh. We do not reproduce full publisher articles.
      </p>
      <LiveFeed
        initialGroups={groups}
        initialBreaking={breaking}
        initialCursor={cursor}
      />
    </main>
  );
}
