const ALIASES: Record<string, string> = {
  ".NET": "dotnet",
  Tailwind: "tailwind",
  "Tailwind CSS": "tailwind",
  Chrome: "chrome",
  "Google Chrome": "chrome",
  AWS: "aws",
  "Amazon Web Services": "aws",
  CSS3: "css",
  systems: "design-systems",
};

export function topicSlug(name: string) {
  const alias = ALIASES[name];
  if (alias) return alias;

  return name
    .trim()
    .toLowerCase()
    .replace(/^\./, "")
    .replace(/&/g, "and")
    .replace(/[./]/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function withHref(nameOrSlug: string) {
  return `/with/${topicSlug(nameOrSlug)}`;
}

export function serviceHref(nameOrSlug: string) {
  return `/services/${topicSlug(nameOrSlug)}`;
}
