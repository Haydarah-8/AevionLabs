import type { PuckData, ProjectBundle } from "../types";

export type HealthIssue = {
  id: string;
  severity: "info" | "warn" | "fail";
  area: "seo" | "a11y" | "content";
  message: string;
  hint: string;
};

export function analyseWebsiteHealth(bundle: ProjectBundle) {
  const issues: HealthIssue[] = [];
  const seo = bundle.project.seoConfig;
  if (!seo.title) {
    issues.push({
      id: "seo-title",
      severity: "fail",
      area: "seo",
      message: "Missing SEO title",
      hint: "Set a document title from the business name.",
    });
  }
  if (!seo.description) {
    issues.push({
      id: "seo-desc",
      severity: "fail",
      area: "seo",
      message: "Missing meta description",
      hint: "Use the tagline or first sentence of the description.",
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

  const pageSlugs = new Set(bundle.pages.map((page) => `/${page.slug}`));
  pageSlugs.add("/");

  for (const page of bundle.pages) {
    walk(page.draftData, page.slug, issues, pageSlugs);
  }

  const fail = issues.filter((item) => item.severity === "fail").length;
  const warn = issues.filter((item) => item.severity === "warn").length;
  return {
    issues,
    summary: `${fail} blocking, ${warn} warnings across ${bundle.pages.length} pages`,
    fail,
    warn,
  };
}

function walk(
  data: PuckData,
  pageSlug: string,
  issues: HealthIssue[],
  pageSlugs: Set<string>,
) {
  let headingCount = 0;
  for (const node of data.content) {
    const props = node.props || {};
    const heading = String(props.heading || props.text || "");
    if (
      (node.type === "Heading" ||
        node.type === "Hero" ||
        node.type === "PageHero" ||
        node.type === "MinimalHero") &&
      !heading.trim()
    ) {
      issues.push({
        id: `${pageSlug}-empty-heading-${String(props.id || node.type)}`,
        severity: "warn",
        area: "content",
        message: `Empty heading on ${pageSlug}`,
        hint: "Write the heading from the business, not a placeholder.",
      });
    }
    if (
      node.type === "Heading" ||
      node.type === "Hero" ||
      node.type === "PageHero" ||
      node.type === "MinimalHero"
    ) {
      headingCount += 1;
    }
    const image = String(props.imageUrl || props.url || props.logoUrl || "");
    const alt = String(props.imageAlt || props.alt || "");
    if (image && !alt && node.type !== "Navbar") {
      issues.push({
        id: `${pageSlug}-alt-${String(props.id || image)}`,
        severity: "warn",
        area: "a11y",
        message: `Image on ${pageSlug} has no alt text`,
        hint: "Describe the photograph in one short clause.",
      });
    }
    if (node.type === "CTA" && !props.label && !props.href) {
      issues.push({
        id: `${pageSlug}-cta`,
        severity: "info",
        area: "content",
        message: `CTA on ${pageSlug} has no label`,
        hint: "Use the business primary call to action.",
      });
    }
    for (const key of ["href", "primaryHref", "secondaryHref", "ctaHref"]) {
      const href = String(props[key] || "");
      if (!href || !href.startsWith("/") || href.startsWith("//")) continue;
      const path = href.split("?")[0] || href;
      if (!pageSlugs.has(path) && path !== `/${pageSlug}`) {
        issues.push({
          id: `${pageSlug}-link-${key}-${path}`,
          severity: "warn",
          area: "content",
          message: `Internal link ${path} on ${pageSlug} has no matching page`,
          hint: "Point the link at an existing page slug or add the page.",
        });
      }
    }
  }
  if (headingCount === 0) {
    issues.push({
      id: `${pageSlug}-no-heading`,
      severity: "info",
      area: "a11y",
      message: `No primary heading on ${pageSlug}`,
      hint: "Add a Hero or Heading so assistive tech can outline the page.",
    });
  }
}
