/**
 * Static site health audits (Phase 14).
 * Real checks only — counts and findings, no invented 0–100 scores.
 */

import type { PuckData, PuckNode, ProjectBundle } from "../types";
import { isLegacyHtmlDocument, isPuckData } from "../types";
import {
  isNotFoundPageSlug,
  readPageSeo,
} from "@/features/website-factory/pages/settings";

export type HealthArea = "seo" | "a11y" | "perf" | "content";

export type HealthIssue = {
  id: string;
  severity: "info" | "warn" | "fail";
  area: HealthArea;
  message: string;
  hint: string;
};

export type HealthReport = {
  issues: HealthIssue[];
  summary: string;
  fail: number;
  warn: number;
  byArea: Record<HealthArea, number>;
};

const HEADING_TYPES = new Set(["Heading", "Hero", "PageHero", "MinimalHero"]);

const IMAGE_PROP_KEYS = [
  "imageUrl",
  "url",
  "logoUrl",
  "photoUrl",
  "beforeUrl",
  "afterUrl",
  "src",
] as const;

/** Heuristic: remote images often lack size control in the draft. */
const HEAVY_IMAGE_RE = /\.(jpe?g|png|webp|gif|avif)(\?|$)/i;

const VIDEO_EMBED_RE = /(youtube\.com|youtu\.be|vimeo\.com|player\.vimeo)/i;

export function analyseWebsiteHealth(bundle: ProjectBundle): HealthReport {
  const issues: HealthIssue[] = [];
  const seo = bundle.project.seoConfig;

  if (!seo.title?.trim()) {
    issues.push({
      id: "seo-title",
      severity: "fail",
      area: "seo",
      message: "Missing site SEO title",
      hint: "Set project seoConfig.title from the business name.",
    });
  } else if (seo.title.trim().length > 60) {
    issues.push({
      id: "seo-title-long",
      severity: "warn",
      area: "seo",
      message: "Site SEO title is longer than 60 characters",
      hint: "Shorten the title so search results do not truncate mid-phrase.",
    });
  }

  if (!seo.description?.trim()) {
    issues.push({
      id: "seo-desc",
      severity: "fail",
      area: "seo",
      message: "Missing site meta description",
      hint: "Use the tagline or first sentence of the business description.",
    });
  } else if (seo.description.trim().length > 160) {
    issues.push({
      id: "seo-desc-long",
      severity: "warn",
      area: "seo",
      message: "Meta description is longer than 160 characters",
      hint: "Trim to one clear sentence for snippets.",
    });
  }

  if (!seo.ogImage && !bundle.business.heroUrl) {
    issues.push({
      id: "seo-og",
      severity: "warn",
      area: "seo",
      message: "Missing Open Graph image",
      hint: "Set seoConfig.ogImage or a business hero image.",
    });
  }

  if (!bundle.business.faviconUrl) {
    issues.push({
      id: "favicon",
      severity: "warn",
      area: "seo",
      message: "Missing favicon",
      hint: "Upload a favicon in Assets or business settings.",
    });
  }

  const has404 = bundle.pages.some((page) => isNotFoundPageSlug(page.slug));
  if (!has404) {
    issues.push({
      id: "seo-404-page",
      severity: "info",
      area: "seo",
      message: "No custom 404 page",
      hint: "Add a page with slug 404 so missing URLs stay on-brand.",
    });
  }

  const pageSlugs = new Set(
    bundle.pages.map((page) => (page.slug === "home" ? "/" : `/${page.slug}`)),
  );
  pageSlugs.add("/");

  let siteBlockCount = 0;
  let siteImageCount = 0;

  for (const page of bundle.pages) {
    if (isLegacyHtmlDocument(page.draftData)) {
      if (!page.draftData.native.trim()) {
        issues.push({
          id: `${page.slug}-empty-html`,
          severity: "warn",
          area: "content",
          message: `Legacy HTML page ${page.slug} is empty`,
          hint: "Re-open the page in Aevion Studio and rebuild with components.",
        });
      } else {
        issues.push({
          id: `${page.slug}-legacy-html`,
          severity: "info",
          area: "content",
          message: `Page ${page.slug} still uses legacy HTML storage`,
          hint: "Rebuild in Studio so the page uses Aevion components.",
        });
        // Rough size signal for legacy HTML
        if (page.draftData.native.length > 80_000) {
          issues.push({
            id: `${page.slug}-html-heavy`,
            severity: "warn",
            area: "perf",
            message: `Legacy HTML on ${page.slug} is very large`,
            hint: "Split content into components; large HTML slows first paint.",
          });
        }
      }
      continue;
    }

    if (!isPuckData(page.draftData)) continue;

    const pageSeo = readPageSeo(page.draftData, page.title);
    if (!isNotFoundPageSlug(page.slug)) {
      if (!pageSeo.title?.trim() && !seo.title?.trim()) {
        issues.push({
          id: `${page.slug}-seo-title`,
          severity: "warn",
          area: "seo",
          message: `Page ${page.slug} has no document title`,
          hint: "Set a page title in Page settings or rely on site SEO title.",
        });
      }
      if (pageSeo.description && pageSeo.description.trim().length > 160) {
        issues.push({
          id: `${page.slug}-seo-desc-long`,
          severity: "warn",
          area: "seo",
          message: `Page ${page.slug} meta description is over 160 characters`,
          hint: "Shorten the per-page description in Page settings.",
        });
      }
    }

    const stats = walkPage(page.draftData, page.slug, issues, pageSlugs);
    siteBlockCount += stats.blockCount;
    siteImageCount += stats.imageCount;

    if (stats.blockCount > 40) {
      issues.push({
        id: `${page.slug}-perf-blocks`,
        severity: "warn",
        area: "perf",
        message: `Page ${page.slug} has ${stats.blockCount} blocks`,
        hint: "Split into multiple pages or collapse chrome-heavy sections.",
      });
    }
    if (stats.imageCount > 20) {
      issues.push({
        id: `${page.slug}-perf-images`,
        severity: "warn",
        area: "perf",
        message: `Page ${page.slug} references ${stats.imageCount} images`,
        hint: "Lazy-load galleries or reduce hero/gallery count on this page.",
      });
    }
    if (stats.embedCount > 2) {
      issues.push({
        id: `${page.slug}-perf-embeds`,
        severity: "warn",
        area: "perf",
        message: `Page ${page.slug} has ${stats.embedCount} video embeds`,
        hint: "Limit embeds; each player loads third-party scripts.",
      });
    }
  }

  if (siteBlockCount > 120) {
    issues.push({
      id: "perf-site-blocks",
      severity: "info",
      area: "perf",
      message: `Site draft has ${siteBlockCount} blocks across pages`,
      hint: "Large sites stay editable; watch publish payload size.",
    });
  }
  if (siteImageCount > 60) {
    issues.push({
      id: "perf-site-images",
      severity: "info",
      area: "perf",
      message: `Site draft references ${siteImageCount} images`,
      hint: "Prefer compressed assets in the Assets library.",
    });
  }

  const fail = issues.filter((item) => item.severity === "fail").length;
  const warn = issues.filter((item) => item.severity === "warn").length;
  const byArea: Record<HealthArea, number> = {
    seo: 0,
    a11y: 0,
    perf: 0,
    content: 0,
  };
  for (const issue of issues) byArea[issue.area] += 1;

  return {
    issues,
    summary: `${fail} blocking, ${warn} warnings · ${byArea.seo} SEO · ${byArea.a11y} a11y · ${byArea.perf} perf · ${byArea.content} content`,
    fail,
    warn,
    byArea,
  };
}

type WalkStats = {
  blockCount: number;
  imageCount: number;
  embedCount: number;
  headingCount: number;
};

function walkPage(
  data: PuckData,
  pageSlug: string,
  issues: HealthIssue[],
  pageSlugs: Set<string>,
): WalkStats {
  const stats: WalkStats = {
    blockCount: 0,
    imageCount: 0,
    embedCount: 0,
    headingCount: 0,
  };
  const nodes = collectNodes(data);
  for (const node of nodes) {
    inspectNode(node, pageSlug, issues, pageSlugs, stats);
  }
  if (stats.headingCount === 0 && !isNotFoundPageSlug(pageSlug)) {
    issues.push({
      id: `${pageSlug}-no-heading`,
      severity: "info",
      area: "a11y",
      message: `No primary heading on ${pageSlug}`,
      hint: "Add a Hero or Heading so assistive tech can outline the page.",
    });
  }
  return stats;
}

/** Flatten top-level content, zones, and slot arrays on props. */
export function collectNodes(data: PuckData): PuckNode[] {
  const out: PuckNode[] = [];
  const visit = (nodes: PuckNode[] | undefined) => {
    if (!Array.isArray(nodes)) return;
    for (const node of nodes) {
      if (!node || typeof node !== "object") continue;
      out.push(node);
      const props = node.props || {};
      for (const value of Object.values(props)) {
        if (Array.isArray(value) && value[0]?.type) {
          visit(value as PuckNode[]);
        }
      }
    }
  };
  visit(data.content);
  if (data.zones) {
    for (const zone of Object.values(data.zones)) {
      visit(zone);
    }
  }
  return out;
}

function inspectNode(
  node: PuckNode,
  pageSlug: string,
  issues: HealthIssue[],
  pageSlugs: Set<string>,
  stats: WalkStats,
) {
  stats.blockCount += 1;
  const props = node.props || {};
  const id = String(props.id || node.type);

  if (HEADING_TYPES.has(node.type)) {
    stats.headingCount += 1;
    const heading = String(props.heading || props.text || "");
    if (!heading.trim()) {
      issues.push({
        id: `${pageSlug}-empty-heading-${id}`,
        severity: "warn",
        area: "content",
        message: `Empty heading on ${pageSlug}`,
        hint: "Write the heading from the business, not a placeholder.",
      });
    }
  }

  for (const key of IMAGE_PROP_KEYS) {
    const image = String(props[key] || "");
    if (!image || !HEAVY_IMAGE_RE.test(image)) continue;
    stats.imageCount += 1;
    const alt = String(props.imageAlt || props.alt || props.logoAlt || "");
    if (!alt && node.type !== "Navbar") {
      issues.push({
        id: `${pageSlug}-alt-${id}-${key}`,
        severity: "warn",
        area: "a11y",
        message: `Image on ${pageSlug} (${node.type}) has no alt text`,
        hint: "Describe the photograph in one short clause.",
      });
    }
  }

  // Gallery items
  const items = props.items;
  if (Array.isArray(items)) {
    for (const [index, item] of items.entries()) {
      if (!item || typeof item !== "object") continue;
      const rec = item as Record<string, unknown>;
      const url = String(rec.url || rec.imageUrl || rec.photoUrl || "");
      if (url && HEAVY_IMAGE_RE.test(url)) {
        stats.imageCount += 1;
        const alt = String(rec.alt || rec.imageAlt || "");
        if (!alt) {
          issues.push({
            id: `${pageSlug}-alt-item-${id}-${index}`,
            severity: "warn",
            area: "a11y",
            message: `Gallery/list image on ${pageSlug} has no alt`,
            hint: "Add alt on each media item.",
          });
        }
      }
    }
  }

  for (const key of [
    "href",
    "primaryHref",
    "secondaryHref",
    "ctaHref",
    "homeHref",
  ]) {
    const href = String(props[key] || "");
    if (VIDEO_EMBED_RE.test(href)) stats.embedCount += 1;
    if (!href || !href.startsWith("/") || href.startsWith("//")) continue;
    const path = href.split("?")[0] || href;
    const normalized =
      path === "/home"
        ? "/"
        : path.length > 1 && path.endsWith("/")
          ? path.slice(0, -1)
          : path;
    if (!pageSlugs.has(normalized) && normalized !== `/${pageSlug}`) {
      issues.push({
        id: `${pageSlug}-link-${key}-${normalized}`,
        severity: "warn",
        area: "content",
        message: `Internal link ${normalized} on ${pageSlug} has no matching page`,
        hint: "Point the link at an existing page slug or add the page.",
      });
    }
  }

  if (node.type === "CTA" || node.type === "Button") {
    const label = String(props.label || props.text || "");
    const href = String(props.href || props.ctaHref || "");
    if (!label.trim()) {
      issues.push({
        id: `${pageSlug}-cta-label-${id}`,
        severity: "warn",
        area: "a11y",
        message: `${node.type} on ${pageSlug} has no accessible label`,
        hint: "Use the business primary call to action wording.",
      });
    }
    if (label.trim() && !href.trim()) {
      issues.push({
        id: `${pageSlug}-cta-href-${id}`,
        severity: "info",
        area: "content",
        message: `${node.type} on ${pageSlug} has a label but no href`,
        hint: "Link it to contact, booking, or a real page.",
      });
    }
  }

  if (node.type === "Video" || node.type === "Embed") {
    const src = String(props.src || props.url || props.href || "");
    if (VIDEO_EMBED_RE.test(src) || src) stats.embedCount += 1;
  }

  // Hidden blocks still ship in draft — note for a11y when many are hidden
  if (props._hidden === true) {
    issues.push({
      id: `${pageSlug}-hidden-${id}`,
      severity: "info",
      area: "a11y",
      message: `Hidden block ${node.type} on ${pageSlug}`,
      hint: "Hidden in Studio; confirm it should stay out of the live page.",
    });
  }
}

export function groupIssuesByArea(
  issues: HealthIssue[],
): Record<HealthArea, HealthIssue[]> {
  const groups: Record<HealthArea, HealthIssue[]> = {
    seo: [],
    a11y: [],
    perf: [],
    content: [],
  };
  for (const issue of issues) groups[issue.area].push(issue);
  return groups;
}
