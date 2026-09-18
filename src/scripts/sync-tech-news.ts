import { readFileSync } from "node:fs";
import { ingestRegistryRss } from "@/lib/news/ingestion/registry";
import { ingestProvider } from "@/lib/news/ingestion/run";
import { ensureNewsSources } from "@/lib/news/store-admin";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function loadDotEnv() {
  try {
    for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    /* env already provided */
  }
}

async function main() {
  loadDotEnv();
  await ensureNewsSources();
  const admin = getSupabaseAdmin();
  const { count: enabled } = await admin
    .from("news_sources")
    .select("id", { count: "exact", head: true })
    .eq("enabled", true);
  const { count: disabled } = await admin
    .from("news_sources")
    .select("id", { count: "exact", head: true })
    .eq("enabled", false);
  console.log("sources enabled", enabled, "disabled", disabled);

  const registry = await ingestRegistryRss({ limit: 40, videoLookups: 0 });
  console.log("registry", {
    received: registry.received,
    accepted: registry.accepted,
    created: registry.created,
    crawled: registry.crawled,
    enabled: registry.enabled,
    sample: registry.newItems.slice(0, 8).map((item) => item.title),
  });

  const rss = await ingestProvider("rss");
  console.log("rss provider", {
    status: rss.status,
    received: rss.received,
    accepted: rss.accepted,
    duplicates: rss.duplicates,
    error: rss.error,
  });

  const gdelt = await ingestProvider("gdelt");
  console.log("gdelt", {
    status: gdelt.status,
    received: gdelt.received,
    accepted: gdelt.accepted,
    duplicates: gdelt.duplicates,
    error: gdelt.error,
  });

  const { data: recent } = await admin
    .from("news_articles")
    .select("title, category, source_name, source_url")
    .order("discovered_at", { ascending: false })
    .limit(12);
  console.log("recent", recent);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
