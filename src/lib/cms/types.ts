export type CmsStatus = "draft" | "published";

export type CmsPage = {
  id: string;
  slug: string;
  title: string;
  navLabel: string;
  showInNav: boolean;
  navOrder: number;
  status: CmsStatus;
  isSystem: boolean;
  path: string;
  seoTitle: string;
  seoDescription: string;
  createdAt: string;
  updatedAt: string;
  sections: CmsSection[];
};

export type CmsPageSummary = Omit<CmsPage, "sections">;

export type CmsSection = {
  id: string;
  pageId: string;
  type: string;
  sortOrder: number;
  visible: boolean;
  data: Record<string, unknown>;
};

export type CmsProjectRow = {
  cpt: string;
  text: string;
  imgSrc?: string;
  imgAlt?: string;
};

export type CmsProject = {
  id: string;
  slug: string;
  client: string;
  overview: string;
  services: string[];
  year: string;
  heroSrc: string;
  heroAlt: string;
  rows: CmsProjectRow[];
  resultCpt: string;
  resultText: string;
  status: CmsStatus;
  featured: boolean;
  sortOrder: number;
  seoTitle: string;
  seoDescription: string;
  createdAt: string;
  updatedAt: string;
};

export type SiteSettings = {
  siteName: string;
  tagline: string;
  description: string;
  contactEmail: string;
  generalEmail: string;
  contactEmailDisplay: string;
  location: string;
  prefooterHeading: string;
  prefooterCtaLabel: string;
  prefooterCtaHref: string;
  prefooterImage: string;
  footerCopyright: string;
  footerDecoration: string;
};

export type NavItem = {
  href: string;
  label: string;
  children?: { href: string; label: string }[];
};

export type CmsPageInput = {
  slug?: string;
  title?: string;
  navLabel?: string;
  showInNav?: boolean;
  navOrder?: number;
  status?: CmsStatus;
  path?: string;
  seoTitle?: string;
  seoDescription?: string;
};

export type CmsSectionInput = {
  type?: string;
  sortOrder?: number;
  visible?: boolean;
  data?: Record<string, unknown>;
};

export type CmsProjectInput = {
  slug?: string;
  client?: string;
  overview?: string;
  services?: string[];
  year?: string;
  heroSrc?: string;
  heroAlt?: string;
  rows?: CmsProjectRow[];
  resultCpt?: string;
  resultText?: string;
  status?: CmsStatus;
  featured?: boolean;
  sortOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
};
