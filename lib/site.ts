/**
 * Single source of truth for details that change when the business does.
 * Update here and every CTA, footer and modal follows.
 */

export const SITE_NAME = "Aevion Labs";

/** New-business enquiries - the address every CTA points at. */
export const CONTACT_EMAIL = "hello@theaevionlabs.com";

/** Everything else: invoices, suppliers, general post. */
export const GENERAL_EMAIL = "contact@theaevionlabs.com";

/**
 * Social profiles. Empty until the accounts exist - the footer hides the column
 * rather than rendering links that go nowhere.
 */
export const SOCIAL_LINKS: { label: string; href: string }[] = [];
