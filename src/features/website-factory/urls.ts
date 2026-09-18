export function factoryPreviewPath(slug: string, pageSlug = "home") {
  const rest = !pageSlug || pageSlug === "home" ? "" : `/${pageSlug}`;
  return `/p/${slug}${rest}`;
}

export function factoryLivePath(slug: string, pageSlug = "home") {
  const rest = !pageSlug || pageSlug === "home" ? "" : `/${pageSlug}`;
  return `/s/${slug}${rest}`;
}

export function factoryDraftPath(slug: string, pageSlug = "home") {
  const rest = !pageSlug || pageSlug === "home" ? "" : `/${pageSlug}`;
  return `/preview/${slug}${rest}`;
}
