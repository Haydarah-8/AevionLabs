import type { CmsCollection } from "./cms/types";

export type ProjectStatus =
  | "draft"
  | "generating"
  | "ready"
  | "preview"
  | "published"
  | "archived"
  | "deployment_error";

/** Active editors. Legacy `"vvveb"` / `"grapesjs"` HTML docs may still exist in stored pages. */
export type EditorEngineKind = "puck";

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
  /** Custom project design variables (Phase 7). */
  variables?: DesignVariable[];
};

/** User-defined design token stored on the project theme. */
export type DesignVariable = {
  id: string;
  /** Human label */
  name: string;
  /** CSS key fragment → --wf-var-{key} */
  key: string;
  value: string;
  type: "color" | "size" | "font" | "string";
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

/**
 * Legacy HTML page envelope (formerly Vvveb). Kept for read/render of old rows.
 * New pages must not be created in this shape.
 */
export type LegacyHtmlPageDocument = {
  version: 1;
  engine: "vvveb" | "html";
  native: string;
  tree?: Array<{
    id: string;
    type: string;
    props: Record<string, unknown>;
  }>;
  title?: string;
  updatedAt?: string;
};

/** @deprecated Use LegacyHtmlPageDocument */
export type VvvebPageDocument = LegacyHtmlPageDocument;

/** @deprecated GrapesJS was never production — kept only for reading accidental rows. */
export type GrapesPageDocument = {
  version: 1;
  engine: "grapesjs";
  native: {
    project: Record<string, unknown>;
    html: string;
    css: string;
  };
  tree?: Array<{
    id: string;
    type: string;
    props: Record<string, unknown>;
  }>;
  title?: string;
  updatedAt?: string;
};

export type PageDocument = PuckData | LegacyHtmlPageDocument | GrapesPageDocument;

export type SeoConfig = {
  title: string;
  description: string;
  ogImage: string;
  robots: string;
};

/** Site-level path redirect (Phase 11). Stored on siteConfig.redirects. */
export type SiteRedirect = {
  id: string;
  from: string;
  to: string;
  permanent?: boolean;
};

export type SiteConfig = {
  stickyHeader: boolean;
  announcement: string;
  navCta: Cta;
  footerNote: string;
  /** Factory CMS collections (Phase 9). */
  collections?: CmsCollection[];
  /** Path redirects checked before page lookup (Phase 11). */
  redirects?: SiteRedirect[];
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
  draftData: PageDocument;
  previewData: PageDocument | null;
  publishedData: PageDocument | null;
  updatedAt: string;
};

export type WebsiteProject = {
  id: string;
  businessId: string;
  templateId: string;
  name: string;
  slug: string;
  status: ProjectStatus;
  editorEngine: EditorEngineKind;
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

export function isLegacyHtmlDocument(
  value: unknown,
): value is LegacyHtmlPageDocument {
  if (!value || typeof value !== "object") return false;
  const data = value as LegacyHtmlPageDocument;
  return (
    (data.engine === "vvveb" || data.engine === "html") &&
    typeof data.native === "string"
  );
}

export function isGrapesDocument(value: unknown): value is GrapesPageDocument {
  if (!value || typeof value !== "object") return false;
  const data = value as GrapesPageDocument;
  return (
    data.engine === "grapesjs" &&
    !!data.native &&
    typeof data.native === "object" &&
    typeof data.native.html === "string"
  );
}

/** @deprecated Use isLegacyHtmlDocument */
export function isVvvebDocument(
  value: unknown,
): value is LegacyHtmlPageDocument {
  return isLegacyHtmlDocument(value);
}

export function isPageDocument(value: unknown): value is PageDocument {
  return isPuckData(value) || isLegacyHtmlDocument(value) || isGrapesDocument(value);
}

/** @deprecated Do not create Grapes documents — returns a legacy-shaped stub for tests only. */
export function emptyGrapesDocument(title = "Home"): GrapesPageDocument {
  return {
    version: 1,
    engine: "grapesjs",
    title,
    updatedAt: new Date().toISOString(),
    native: {
      project: {},
      html: `<section style="padding:48px 24px;font-family:system-ui,sans-serif"><h1>${title.replace(/</g, "")}</h1><p>Edit this page in Aevion Studio.</p></section>`,
      css: "",
    },
  };
}

export function asPuckData(value: PageDocument | null | undefined): PuckData | null {
  return value && isPuckData(value) ? value : null;
}

export function asLegacyHtml(
  value: PageDocument | null | undefined,
): string | null {
  return value && isLegacyHtmlDocument(value) ? value.native : null;
}

/** @deprecated Use asLegacyHtml */
export function asVvvebHtml(value: PageDocument | null | undefined): string | null {
  return asLegacyHtml(value);
}
