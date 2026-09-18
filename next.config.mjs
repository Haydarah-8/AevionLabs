import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@blocknote/core",
    "@blocknote/react",
    "@blocknote/shadcn",
    "@puckeditor/core",
  ],
  serverExternalPackages: ["linkedom", "@mozilla/readability"],
  // Explicit absolute root avoids wrong lockfile / workspace detection (incl. OneDrive paths).
  turbopack: {
    root: path.resolve(__dirname),
  },
  experimental: {
    proxyClientMaxBodySize: "100mb",
  },
  async redirects() {
    return [
      { source: "/work", destination: "/news", permanent: true },
      { source: "/work/:path*", destination: "/news", permanent: true },
      { source: "/insights", destination: "/news", permanent: false },
      { source: "/insights/:path*", destination: "/news/:path*", permanent: false },
      { source: "/blogs", destination: "/news", permanent: false },
      { source: "/blogs/:path*", destination: "/news/:path*", permanent: false },
    ];
  },
  images: {
    // Remote SVGs (e.g. Simple Icons, bgsdc icons) need this or `unoptimized` on <Image />.
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bgsdc.com",
        pathname: "/wp-content/**",
      },
      {
        protocol: "https",
        hostname: "cdn.simpleicons.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "static.wixstatic.com",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.reuters.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "fingfx.thomsonreuters.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.guim.co.uk",
        pathname: "/img/media/**",
      },
      {
        protocol: "https",
        hostname: "ichef.bbci.co.uk",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media.guim.co.uk",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.wsj.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/wikipedia/**",
      },
      {
        protocol: "https",
        hostname: "vdyvunmzvgizsiqrfyav.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "utxsrxhzdmvyrulnxehq.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
