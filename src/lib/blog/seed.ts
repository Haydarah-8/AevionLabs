import { legacyArticles } from "@/data/news-articles";
import type { BlogPost } from "@/lib/blog/types";
import { blocksToHtml, legacySectionsToBlocks } from "@/lib/blog/convert";
import { displayDateToIso } from "@/lib/blog/utils";

const LISTING: Record<string, { excerpt: string; featured: boolean }> = {
  "reuters-china-warns-vicious-cycle-middle-east-war": {
    featured: true,
    excerpt:
      "Reuters from Beijing: Chinese officials warn that further escalation of the Iran war could feed a self-reinforcing cycle of retaliation—deepening Gulf and energy risk, straining sea lanes and diplomacy, as Beijing pushes restraint and a political settlement.",
  },
  "reuters-trump-iran-war-oil-shield-cracking": {
    featured: true,
    excerpt:
      "Reuters: Four weeks into the conflict, U.S. oil’s relative insulation is fraying—record crude and product exports, surging pump and diesel prices, and a widening Brent–WTI gap show that domestic abundance does not buy immunity in a connected market.",
  },
  "wsj-food-companies-toxin-concerns-consumers": {
    featured: false,
    excerpt:
      "The Wall Street Journal: Food and restaurant giants brace for mainstream “toxin” anxiety—PFAS, microplastics, heavy metals, and packaging—while citing Pew-style survey data, MAHA-era politics, state laws, and investor risk language from firms including Mondelez, Hershey, Cheesecake Factory, and Texas Roadhouse.",
  },
  "north-yorkshire-bentham-pfas-blood-testing": {
    featured: true,
    excerpt:
      "The Guardian (Martha Elwell and Pippa Neill): Blood testing in Bentham, North Yorkshire—near the UK’s highest recorded groundwater PFAS—finds very high levels of forever chemicals; residents, experts, Angus Fire, and regulators respond on exposure pathways, screening, and the ITV documentary In Our Blood.",
  },
  "wapo-iran-war-global-economic-impact": {
    featured: false,
    excerpt:
      "The Washington Post examines how escalation involving Iran can ripple through energy prices, shipping and insurance, currencies, and broader macro conditions—with second-round effects on inflation, supply chains, and policy responses worldwide.",
  },
  "reuters-central-banks-hawkish-war-inflation": {
    featured: false,
    excerpt:
      "Reuters: As the Fed, BoC, BoJ, BoE, ECB and others hold rates but sound hawkish, policymakers flag energy-driven inflation risks from the Middle East conflict—ECB scenarios, market pricing of hikes, and stagflation worries as Brent whipsaws.",
  },
};

export function getSeedPosts(): BlogPost[] {
  const now = new Date().toISOString();
  return Object.entries(legacyArticles).map(([slug, article]) => {
    const meta = LISTING[slug];
    const publishedAt = displayDateToIso(article.date);
    const content = legacySectionsToBlocks(article.sections);
    return {
      id: `seed-${slug}`,
      slug,
      title: article.title,
      excerpt: meta?.excerpt ?? "",
      category: article.category,
      sub: article.sub,
      date: article.date,
      publishedAt,
      status: "published" as const,
      featured: meta?.featured ?? false,
      seoTitle: article.title,
      seoDescription: meta?.excerpt ?? "",
      author: "Aevion Labs",
      content,
      html: blocksToHtml(content),
      createdAt: `${publishedAt}T12:00:00.000Z`,
      updatedAt: now,
    };
  });
}
