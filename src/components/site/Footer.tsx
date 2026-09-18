"use client";

import Link from "next/link";
import { WordmarkSvg } from "@/components/brand/Wordmark";
import { TalkTrigger } from "@/components/site/TalkTrigger";
import { DEFAULT_SETTINGS, FALLBACK_NAV } from "@/lib/cms/constants";
import type { NavItem, SiteSettings } from "@/lib/cms/types";

function displayLabel(label: string) {
  const value = label.trim();
  if (/^blogs?$/i.test(value)) return "Insights";
  return value
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

const WORK = [
  { href: "/services", label: "What we build" },
  { href: "/with", label: "What we use" },
];

export function Footer({
  settings,
  items,
}: {
  settings?: SiteSettings;
  items?: NavItem[];
}) {
  const year = new Date().getFullYear();
  const s = settings ?? DEFAULT_SETTINGS;
  const copyright = s.footerCopyright.replace("{year}", String(year));
  const nav = items?.length ? items : FALLBACK_NAV;

  return (
    <footer id="site-footer" className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-top">
          <p className="site-footer-kicker">Start a project</p>
          <div className="site-footer-headline">
            <h2 className="site-footer-heading">Let&apos;s talk.</h2>
            <TalkTrigger className="site-footer-visit">
              Let&apos;s talk
            </TalkTrigger>
          </div>
          <p className="site-footer-lede">
            Manchester. Sites, SaaS, ecommerce, and tools. You see a working
            prototype first.
          </p>
        </div>

        <div className="site-footer-dir">
          <nav aria-label="Footer" className="site-footer-col">
            <p className="site-footer-kicker">Studio</p>
            <FooterLink href="/" label="Home" />
            {nav.map((item) => (
              <FooterLink
                key={item.href}
                href={item.href}
                label={displayLabel(item.label)}
              />
            ))}
          </nav>

          <nav aria-label="Work" className="site-footer-col">
            <p className="site-footer-kicker">Work</p>
            {WORK.map((item) => (
              <FooterLink key={item.href} href={item.href} label={item.label} />
            ))}
          </nav>

          <div className="site-footer-col">
            <p className="site-footer-kicker">Contact</p>
            <TalkTrigger className="site-footer-email">
              {s.contactEmailDisplay}
            </TalkTrigger>
            <p className="site-footer-place">{s.location}</p>
          </div>
        </div>

        <div className="site-footer-end">
          <WordmarkSvg className="site-footer-mark" />
          <div className="site-footer-bar">
            <p>{copyright}</p>
            <p>{s.location}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="site-footer-link">
      {label}
    </Link>
  );
}
