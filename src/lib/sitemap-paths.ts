export const SITEMAP_STATIC_PATHS: Array<{
  path: string;
  changefreq: string;
  priority: string;
}> = [
  { path: "", changefreq: "weekly", priority: "1" },
  { path: "/about", changefreq: "monthly", priority: "0.9" },
  { path: "/services", changefreq: "monthly", priority: "0.92" },
  { path: "/with", changefreq: "monthly", priority: "0.7" },
  { path: "/news", changefreq: "weekly", priority: "0.85" },
  { path: "/talk", changefreq: "monthly", priority: "0.8" },
  { path: "/sitemap", changefreq: "monthly", priority: "0.35" },
];
