import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SiteChrome } from "@/components/site/SiteChrome";
import { JsonLd } from "@/components/seo/JsonLd";
import { TrackerScript } from "@/components/site/TrackerScript";
import { FALLBACK_NAV } from "@/lib/cms/constants";
import { getNavItems, getSiteSettings } from "@/lib/cms/store";
import "@/app/nav-chrome.css";
import "@/app/talk-modal.css";
import "@/app/site-footer.css";

export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, navItems] = await Promise.all([
    getSiteSettings(),
    getNavItems(),
  ]);

  return (
    <SiteChrome>
      <JsonLd />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-black focus:px-4 focus:py-2 focus:text-sm focus:text-white focus:outline-none"
      >
        Skip to content
      </a>
      <Header items={navItems.length ? navItems : FALLBACK_NAV} />
      <div className="site-shell flex min-h-full min-w-0 w-full max-w-full flex-1 flex-col overflow-x-clip bg-white text-[var(--foreground)]">
        <div className="flex min-w-0 w-full max-w-full flex-1 flex-col overflow-x-clip">
          {children}
        </div>
        <Footer
          settings={settings}
          items={navItems.length ? navItems : FALLBACK_NAV}
        />
        <TrackerScript />
      </div>
    </SiteChrome>
  );
}
