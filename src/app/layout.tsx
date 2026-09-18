import type { Metadata, Viewport } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Geist } from "next/font/google";
import "./globals.css";
import "./marquee.css";
import "./logo-site.css";
import "./topic.css";
import {
  DEFAULT_DESCRIPTION,
  getSiteUrl,
  SITE_DEFAULT_TITLE,
  SITE_NAME,
} from "@/lib/site";

/**
 * Self-hosted at build time — no runtime request to any font CDN.
 */
const sans = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const siteUrl = getSiteUrl();

const googleSiteVerification =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() || "";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE_NAME} · ${SITE_DEFAULT_TITLE}`,
    template: `${SITE_NAME} · %s`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: siteUrl }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "business",
  alternates: {
    canonical: siteUrl,
    languages: { "en-GB": siteUrl },
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml", sizes: "any" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: siteUrl,
    siteName: SITE_NAME,
    title: `${SITE_NAME} · ${SITE_DEFAULT_TITLE}`,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: "/icon.svg",
        width: 512,
        height: 512,
        alt: `${SITE_NAME} logo`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} · ${SITE_DEFAULT_TITLE}`,
    description: DEFAULT_DESCRIPTION,
    images: ["/icon.svg"],
  },
  ...(googleSiteVerification
    ? { verification: { google: googleSiteVerification } }
    : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-GB"
      className={`${sans.variable} h-full max-w-full overflow-x-clip antialiased`}
      suppressHydrationWarning
    >
      <body
        className="flex min-h-full min-w-0 max-w-full flex-col overflow-x-clip antialiased"
        suppressHydrationWarning
      >
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
