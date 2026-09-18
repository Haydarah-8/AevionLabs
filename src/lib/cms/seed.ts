import { practiceAreas } from "@/data/practice-areas";
import {
  AGENCY_VALUES,
  PROCESS_STEPS,
  SERVICE_FAQS,
} from "@/data/engagement";
import {
  AGENCY_HEADING,
  AGENCY_LEFT,
  AGENCY_RIGHT,
  HERO_BODY,
  HERO_CTA_HREF,
  HERO_CTA_LABEL,
  HERO_HEADLINE,
  HOME_CTA_HEADING,
  SERVICES_HEADING,
  SERVICES_INTRO,
} from "@/data/copy";
import { PROJECTS } from "@/lib/projects";
import { DEFAULT_DESCRIPTION, SITE_DEFAULT_TITLE } from "@/lib/site";
import type { CmsPage, CmsProject, CmsSection } from "@/lib/cms/types";

export {
  DEFAULT_SETTINGS,
  FALLBACK_NAV,
  RESERVED_SLUGS,
  SETTINGS_KEY,
  SYSTEM_SLUGS,
} from "@/lib/cms/constants";

function nowIso() {
  return new Date().toISOString();
}

function page(
  partial: Omit<
    CmsPage,
    "sections" | "createdAt" | "updatedAt" | "seoTitle" | "seoDescription"
  > & {
    seoTitle?: string;
    seoDescription?: string;
    sections: Omit<CmsSection, "pageId" | "createdAt">[];
  },
): { page: CmsPage; sections: CmsSection[] } {
  const ts = nowIso();
  const record: CmsPage = {
    id: partial.id,
    slug: partial.slug,
    title: partial.title,
    navLabel: partial.navLabel,
    showInNav: partial.showInNav,
    navOrder: partial.navOrder,
    status: partial.status,
    isSystem: partial.isSystem,
    path: partial.path,
    seoTitle: partial.seoTitle ?? "",
    seoDescription: partial.seoDescription ?? "",
    createdAt: ts,
    updatedAt: ts,
    sections: [],
  };
  const sections = partial.sections.map((section, index) => ({
    id: section.id,
    pageId: record.id,
    type: section.type,
    sortOrder: section.sortOrder ?? index,
    visible: section.visible ?? true,
    data: section.data,
  }));
  return { page: record, sections };
}

export function seedPages(): { pages: CmsPage[]; sections: CmsSection[] } {
  const home = page({
    id: "page-home",
    slug: "home",
    title: "Home",
    navLabel: "HOME",
    showInNav: false,
    navOrder: 0,
    status: "published",
    isSystem: true,
    path: "/",
    seoTitle: SITE_DEFAULT_TITLE,
    seoDescription: DEFAULT_DESCRIPTION,
    sections: [
      {
        id: "sec-home-hero",
        type: "hero",
        sortOrder: 0,
        visible: true,
        data: {
          headline: HERO_HEADLINE,
          body: HERO_BODY,
          ctaLabel: HERO_CTA_LABEL,
          ctaHref: HERO_CTA_HREF,
          image: "/images/hero-1.jpg",
        },
      },
      {
        id: "sec-home-intro",
        type: "intro",
        sortOrder: 1,
        visible: true,
        data: {
          kicker: "The agency",
          location: "Manchester",
          heading: AGENCY_HEADING,
          left: AGENCY_LEFT,
          right: AGENCY_RIGHT,
          items: [],
          ctaLabel: "See the studio",
          ctaHref: "/about",
        },
      },
      {
        id: "sec-home-cards",
        type: "cards",
        sortOrder: 2,
        visible: true,
        data: {
          kicker: "Services",
          heading: SERVICES_HEADING,
          intro: SERVICES_INTRO,
          items: practiceAreas.map((area) => ({
            id: area.id,
            title: area.title,
            excerpt: area.excerpt,
            image: area.heroImage,
            href: `/services#${area.id}`,
          })),
          ctaLabel: "All services",
          ctaHref: "/services",
        },
      },
      {
        id: "sec-home-offerings",
        type: "offerings",
        sortOrder: 3,
        visible: true,
        data: {
          kicker: "How we work",
          heading: "You do not buy the full build until you have seen the system.",
          body: "A working prototype or design system comes first. The remaining budget unlocks after you approve it. Then we build on a repository you own.",
          items: PROCESS_STEPS.map((step) => `${step.title}\n${step.body}`),
          image: "/images/service-offerings-panel.png",
        },
      },
      {
        id: "sec-home-cta",
        type: "cta",
        sortOrder: 4,
        visible: true,
        data: {
          heading: HOME_CTA_HEADING,
          ctaLabel: HERO_CTA_LABEL,
          ctaHref: HERO_CTA_HREF,
        },
      },
      {
        id: "sec-home-marquee",
        type: "marquee",
        sortOrder: 5,
        visible: true,
        data: {
          kicker: "The stack",
          items: [
            "Product teams",
            "Publishers",
            "Retail",
            "SaaS",
            "Studios",
            "Founders",
            "Institutions",
            "Agencies",
          ],
        },
      },
      {
        id: "sec-home-insights",
        type: "insights",
        sortOrder: 6,
        visible: false,
        data: {
          kicker: "Insights",
          heading: "From the desk",
          ctaLabel: "All insights →",
          ctaHref: "/news",
        },
      },
    ],
  });

  const about = page({
    id: "page-about",
    slug: "about",
    title: "About",
    navLabel: "ABOUT",
    showInNav: true,
    navOrder: 1,
    status: "published",
    isSystem: true,
    path: "/about",
    seoTitle: "About",
    seoDescription:
      "Manchester studio for company sites, SaaS, ecommerce, and internal tools. You see a working prototype before the rest of the budget unlocks.",
    sections: [
      {
        id: "sec-about-hero",
        type: "page_hero",
        sortOrder: 0,
        visible: true,
        data: {
          title: "About",
          highlight: "",
          heading: "We exist so you stop buying a promise.",
          body: "Most tech projects fail at the handoff. We keep one team on the brief from first sketch to launch.",
          image: "/images/home-about.jpg",
        },
      },
      {
        id: "sec-about-prototype",
        type: "prototype",
        sortOrder: 1,
        visible: true,
        data: {
          kicker: "Value first",
          heading: "A working prototype before the rest of the budget unlocks.",
          body: "Companies should not take the risk of a full build on a deck of slides. You see the system in the browser first. Only then do we unlock the remaining spend and write production code on a repository you own.",
        },
      },
      {
        id: "sec-about-values",
        type: "values",
        sortOrder: 2,
        visible: true,
        data: {
          kicker: "How we work",
          heading: "Four commitments before anyone writes a line of code.",
          items: AGENCY_VALUES.map((value) => `${value.title}\n${value.body}`),
        },
      },
      {
        id: "sec-about-offerings",
        type: "offerings",
        sortOrder: 3,
        visible: true,
        data: {
          kicker: "The process",
          heading: "Five steps. The spend waits until you have seen the work.",
          body: "A brief, a prototype, then the build on a repository you own. Keep us after launch, or take the code and run it yourselves.",
          items: PROCESS_STEPS.map((step) => `${step.title}\n${step.body}`),
        },
      },
    ],
  });

  const services = page({
    id: "page-services",
    slug: "services",
    title: "Services",
    navLabel: "SERVICES",
    showInNav: true,
    navOrder: 2,
    status: "published",
    isSystem: true,
    path: "/services",
    seoTitle: "Services",
    seoDescription:
      "Company sites, SaaS products, ecommerce, internal tools, and the systems that keep them fast to change. You see a working prototype first.",
    sections: [
      {
        id: "sec-services-hero",
        type: "page_hero",
        sortOrder: 0,
        visible: true,
        data: {
          title: "Services",
          highlight: "",
          heading: "Name the product.\nWe will put it in the browser.",
          image: "/images/hero-3.jpg",
        },
      },
      {
        id: "sec-services-faq",
        type: "faq",
        sortOrder: 1,
        visible: true,
        data: {
          kicker: "Questions",
          heading: "What companies usually ask before they start.",
          items: SERVICE_FAQS.map((item) => `${item.question}\n${item.answer}`),
        },
      },
    ],
  });

  const work = page({
    id: "page-work",
    slug: "work",
    title: "Work",
    navLabel: "WORK",
    showInNav: false,
    navOrder: 9,
    status: "published",
    isSystem: true,
    path: "/work",
    seoTitle: "Work",
    seoDescription: "Selected websites, systems, and product work.",
    sections: [
      {
        id: "sec-work-hero",
        type: "page_hero",
        sortOrder: 0,
        visible: true,
        data: {
          title: "Selected",
          highlight: "Work",
          image: "/images/home-about.jpg",
        },
      },
      {
        id: "sec-work-grid",
        type: "projects",
        sortOrder: 1,
        visible: true,
        data: {},
      },
    ],
  });

  const news = page({
    id: "page-news",
    slug: "news",
    title: "Insights",
    navLabel: "INSIGHTS",
    showInNav: true,
    navOrder: 3,
    status: "published",
    isSystem: true,
    path: "/news",
    seoTitle: "Insights",
    seoDescription:
      "Insights from Aevion Labs on shipping software: AI features, apps, code, and products that have to earn their keep.",
    sections: [
      {
        id: "sec-news-hero",
        type: "page_hero",
        sortOrder: 0,
        visible: true,
        data: {
          title: "Insights",
          highlight: "",
          heading: "Notes on shipping software that has to earn its keep.",
          image: "/images/folio-hero.jpg",
        },
      },
      {
        id: "sec-news-list",
        type: "blog_list",
        sortOrder: 1,
        visible: true,
        data: { empty: "No articles have been published yet." },
      },
    ],
  });

  const built = [home, about, services, work, news];
  return {
    pages: built.map((b) => b.page),
    sections: built.flatMap((b) => b.sections),
  };
}

export function seedProjects(): CmsProject[] {
  const ts = nowIso();
  return Object.values(PROJECTS).map((project, index) => ({
    id: `project-${project.slug}`,
    slug: project.slug,
    client: project.client,
    overview: project.overview,
    services: project.services,
    year: project.year,
    heroSrc: project.heroImg.src,
    heroAlt: project.heroImg.alt,
    rows: project.rows.map((row) => ({
      cpt: row.cpt,
      text: row.text,
      imgSrc: row.img?.src,
      imgAlt: row.img?.alt,
    })),
    resultCpt: project.result.cpt,
    resultText: project.result.text,
    status: "published" as const,
    featured: index < 3,
    sortOrder: index,
    seoTitle: project.client,
    seoDescription: project.overview,
    createdAt: ts,
    updatedAt: ts,
  }));
}
