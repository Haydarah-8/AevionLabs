export type ProjectStatus =
  | "draft"
  | "generating"
  | "ready"
  | "preview"
  | "published"
  | "archived"
  | "deployment_error";

export type Cta = {
  label: string;
  href: string;
};

export type ThemeTokens = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  headingFont: string;
  bodyFont: string;
  radius: string;
};

export type PuckNode = {
  type: string;
  props: Record<string, unknown>;
};

export type PuckData = {
  root: { props?: Record<string, unknown> };
  content: PuckNode[];
  zones?: Record<string, PuckNode[]>;
};

export type SeoConfig = {
  title: string;
  description: string;
  ogImage: string;
  robots: string;
};

export type SiteConfig = {
  stickyHeader: boolean;
  announcement: string;
  navCta: Cta;
  footerNote: string;
};

export type BusinessService = {
  id: string;
  businessId: string;
  name: string;
  description: string;
  imageUrl: string;
  sortOrder: number;
};

export type BusinessReview = {
  id: string;
  businessId: string;
  customerName: string;
  quote: string;
  rating: number;
  source: string;
  sortOrder: number;
};

export type BusinessTeam = {
  id: string;
  businessId: string;
  name: string;
  role: string;
  photoUrl: string;
  bio: string;
  sortOrder: number;
};

export type BusinessMedia = {
  id: string;
  businessId: string;
  kind: string;
  url: string;
  alt: string;
  sortOrder: number;
};

export type Business = {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  industry: string;
  logoUrl: string;
  faviconUrl: string;
  heroUrl: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  postcode: string;
  openingHours: Record<string, string>;
  social: Record<string, string>;
  yearsInBusiness: number | null;
  certifications: string[];
  awards: string[];
  primaryCta: Cta;
  secondaryCta: Cta;
  usps: string[];
  trustIndicators: string[];
  prospectLabel: string;
  createdAt: string;
  updatedAt: string;
  services: BusinessService[];
  team: BusinessTeam[];
  reviews: BusinessReview[];
  media: BusinessMedia[];
};

export type WebsiteTemplate = {
  id: string;
  slug: string;
  name: string;
  industry: string;
  description: string;
  thumbnailUrl: string;
  version: number;
  definitionKey: string;
  pagesCount: number;
  configuration: Record<string, unknown>;
  duplicatedFrom: string | null;
  active: boolean;
};

export type WebsitePage = {
  id: string;
  projectId: string;
  slug: string;
  title: string;
  navLabel: string;
  showInNav: boolean;
  navOrder: number;
  draftData: PuckData;
  previewData: PuckData | null;
  publishedData: PuckData | null;
  updatedAt: string;
};

export type WebsiteProject = {
  id: string;
  businessId: string;
  templateId: string;
  name: string;
  slug: string;
  status: ProjectStatus;
  theme: ThemeTokens;
  siteConfig: SiteConfig;
  seoConfig: SeoConfig;
  subdomain: string | null;
  customDomain: string | null;
  deploymentStatus: string;
  deploymentProvider: string;
  deploymentUrl: string;
  publishedVersionId: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

export type WebsiteVersion = {
  id: string;
  projectId: string;
  versionNumber: number;
  authorId: string | null;
  snapshot: Record<string, unknown>;
  note: string;
  createdAt: string;
};

export type WebsiteDeployment = {
  id: string;
  projectId: string;
  versionId: string | null;
  provider: string;
  status: string;
  url: string;
  error: string;
  createdAt: string;
};

export type WebsiteDomain = {
  id: string;
  projectId: string;
  hostname: string;
  kind: string;
  dnsRecords: Array<{ type: string; name: string; value: string }>;
  status: string;
  sslStatus: string;
  verifiedAt: string | null;
  createdAt: string;
};

export type ProjectBundle = {
  project: WebsiteProject;
  business: Business;
  template: WebsiteTemplate;
  pages: WebsitePage[];
  versions: WebsiteVersion[];
  deployments: WebsiteDeployment[];
  domains: WebsiteDomain[];
};

export const EMPTY_PUCK: PuckData = {
  root: { props: {} },
  content: [],
};

export const DEFAULT_THEME: ThemeTokens = {
  primary: "#111111",
  secondary: "#3f3f3f",
  accent: "#111111",
  background: "#ffffff",
  foreground: "#111111",
  headingFont: "Georgia, 'Times New Roman', serif",
  bodyFont: "Arial, Helvetica, sans-serif",
  radius: "0px",
};

export function emptyPuck(): PuckData {
  return { root: { props: {} }, content: [] };
}

export function isPuckData(value: unknown): value is PuckData {
  if (!value || typeof value !== "object") return false;
  const data = value as PuckData;
  return Array.isArray(data.content);
}
