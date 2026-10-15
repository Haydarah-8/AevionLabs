/** UUID v4-ish ids used by website_projects (and placeholders like "<id>"). */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isWebsiteProjectId(id: string | null | undefined): boolean {
  return Boolean(id && UUID_RE.test(id.trim()));
}

export function invalidWebsiteIdMessage(id: string) {
  return `Invalid website id "${id}". Open a site from /admin/websites — do not use a placeholder like <id>.`;
}
