import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/chrome/Providers";

/**
 * Self-hosted at build time - no runtime request to any font CDN, so nothing
 * external can break the typography. Variable weight covers the 400/500 the
 * design uses.
 */
const sans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AEVION LABS · Creative Studio",
  description:
    "Web design and development studio. We handle strategy, interface and engineering in one team. Sites that load fast, convert better, and stay easy to change after launch.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /* extensions (password managers, recorders) stamp attributes onto <html>
       before React hydrates, which React reports as a mismatch */
    <html lang="en" className={sans.variable} suppressHydrationWarning>
      <head>
        {/* first-screen art: fetch alongside the loader so the reveals never
            play against a still-downloading image */}
        <link rel="preload" as="image" href="/images/hero-1.avif" fetchPriority="high" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
