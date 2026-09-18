const FALLBACK_SITE_ORIGIN = "https://theaevionlabs.com";

/**
 * Preferred origin for canonicals, OG, JSON-LD, and sitemap (apex, no `www`).
 *
 * Set `NEXT_PUBLIC_SITE_URL=https://theaevionlabs.com` in Vercel.
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const candidate =
    raw && /^https?:\/\//i.test(raw)
      ? raw.replace(/\/+$/, "")
      : FALLBACK_SITE_ORIGIN;
  try {
    const u = new URL(candidate);
    u.protocol = "https:";
    if (u.hostname.startsWith("www.")) {
      u.hostname = u.hostname.slice(4);
    }
    return u.origin;
  } catch {
    return FALLBACK_SITE_ORIGIN;
  }
}

export const SITE_NAME = "Aevion Labs";

/** New-business enquiries — the address every CTA points at. */
export const CONTACT_EMAIL = "hello@theaevionlabs.com";

/** Everything else: invoices, suppliers, general post. */
export const GENERAL_EMAIL = "contact@theaevionlabs.com";

export const SITE_EMAIL_INFO = CONTACT_EMAIL;
export const SITE_EMAIL_MEDIA = GENERAL_EMAIL;
export const SITE_EMAIL_INFO_DISPLAY = "Hello@theaevionlabs.com";

export const SITE_DEFAULT_TITLE = "Sites, SaaS, and tools";

export const DEFAULT_DESCRIPTION =
  "Manchester studio for company sites, SaaS products, ecommerce, and internal tools. You see a working prototype before the rest of the budget unlocks.";

/**
 * Social profiles. Empty until the accounts exist — the footer hides the column
 * rather than rendering links that go nowhere.
 */
export const SOCIAL_LINKS: { label: string; href: string }[] = [];
