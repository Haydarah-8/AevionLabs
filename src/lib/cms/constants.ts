import {
  CONTACT_EMAIL,
  DEFAULT_DESCRIPTION,
  GENERAL_EMAIL,
  SITE_DEFAULT_TITLE,
  SITE_EMAIL_INFO_DISPLAY,
  SITE_NAME,
} from "@/lib/site";
import type { NavItem, SiteSettings } from "@/lib/cms/types";

export const SETTINGS_KEY = "site";

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: SITE_NAME,
  tagline: SITE_DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  contactEmail: CONTACT_EMAIL,
  generalEmail: GENERAL_EMAIL,
  contactEmailDisplay: SITE_EMAIL_INFO_DISPLAY,
  location: "Manchester, UK",
  prefooterHeading: "Stop funding work you cannot see yet.",
  prefooterCtaLabel: "See services",
  prefooterCtaHref: "/services",
  prefooterImage: "/images/pre-footer-background.jpg",
  footerCopyright: "© {year} Aevion Labs. All rights reserved.",
  footerDecoration: "/images/footer-decoration.svg",
};

export const FALLBACK_NAV: NavItem[] = [
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/news", label: "Insights" },
];

export const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "login",
  "live",
  "sitemap",
  "talk",
  "offline",
  "timeout",
  "practice-areas",
  "preview",
  "p",
  "s",
  "websites",
  "_next",
  "favicon.ico",
]);

export const SYSTEM_SLUGS = new Set([
  "home",
  "about",
  "services",
  "work",
  "news",
  "talk",
  "offline",
  "timeout",
]);
