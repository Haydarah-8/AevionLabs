"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LivePulse } from "@/components/admin/LivePulse";
import { signOutAdmin, useAdminGuard } from "@/components/admin/useAdminGuard";
import { useVisitorFeedContext } from "@/components/admin/VisitorFeedProvider";
import { VisitorsLauncher } from "@/components/admin/VisitorsLauncher";

const NAV = [
  { href: "/admin", label: "Overview", match: "exact" as const },
  { href: "/admin/websites", label: "Editor", match: "prefix" as const },
  {
    href: "/admin/websites/templates",
    label: "Templates",
    match: "exact" as const,
  },
  { href: "/admin/developer", label: "Platform", match: "prefix" as const },
  { href: "/admin/blog", label: "Insights", match: "prefix" as const },
  { href: "/admin/gallery", label: "Gallery", match: "prefix" as const },
  { href: "/admin/settings", label: "Settings", match: "prefix" as const },
];

const DESCRIPTIONS: Record<string, string> = {
  "/admin": "Traffic, audit stream, and time — one control surface",
  "/admin/websites": "Create, edit, and publish client websites in Studio",
  "/admin/websites/templates": "Starter templates — use as a base, then edit",
  "/admin/developer": "API, MCP, Skills, Connect, and Core audit",
  "/admin/blog": "Write and publish insights",
  "/admin/gallery": "Visual feed of coverage and media",
  "/admin/settings": "Agency name, emails, footer, and shared images",
};

function isActive(
  pathname: string,
  item: (typeof NAV)[number],
) {
  if (item.href === "/admin/websites/templates") {
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  }
  if (item.href === "/admin/websites") {
    if (pathname.startsWith("/admin/websites/templates")) return false;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  }
  if (item.match === "exact") return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function AdminShell({
  children,
  fullBleed = false,
  studio = false,
  subtitle,
}: {
  children: ReactNode;
  fullBleed?: boolean;
  studio?: boolean;
  subtitle?: string;
}) {
  const ready = useAdminGuard();
  const pathname = usePathname();
  const { liveCount } = useVisitorFeedContext();

  const description =
    subtitle ??
    DESCRIPTIONS[
      Object.keys(DESCRIPTIONS)
        .sort((a, b) => b.length - a.length)
        .find((key) =>
          key === "/admin" ? pathname === "/admin" : pathname.startsWith(key),
        ) ?? "/admin"
    ];

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f] text-[0.95rem] text-white/50">
        Loading…
      </div>
    );
  }

  if (studio) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#0c0c0e] text-zinc-100 antialiased">
        <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="admin-shell flex h-full min-h-0 flex-col overflow-hidden bg-[#0a0a0f] text-zinc-100 antialiased">
      <header className="sticky top-0 z-50 shrink-0 border-b border-white/[0.07] bg-[#0a0a0f]/92 backdrop-blur-xl select-none">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-6 py-5 sm:px-10">
          <div className="flex min-w-0 items-center gap-10">
            <Link href="/admin" className="shrink-0 group">
              <p className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-white/45 group-hover:text-white/70">
                Aevion Labs
              </p>
              <h1 className="mt-1 text-[1.15rem] font-normal leading-none tracking-[-0.03em] text-white">
                Control
              </h1>
            </Link>
            <nav className="hidden items-center gap-1 overflow-x-auto md:flex">
              {NAV.map((item) => {
                const active = isActive(pathname, item);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`whitespace-nowrap rounded-full px-3.5 py-2 text-[0.9rem] tracking-[-0.01em] transition-colors ${
                      active
                        ? "bg-white text-[#0d1730]"
                        : "text-white/55 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <LivePulse count={liveCount} />
            <motion.button
              onClick={() => void signOutAdmin()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="cursor-pointer rounded-full border border-white/10 px-4 py-2 text-[0.85rem] text-white/55 transition-colors hover:border-white/25 hover:text-white"
            >
              Sign out
            </motion.button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-white/[0.06] px-4 py-2 md:hidden">
          {NAV.map((item) => {
            const active = isActive(pathname, item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[0.85rem] ${
                  active ? "bg-white text-[#0d1730]" : "text-white/50"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {fullBleed ? (
        <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </main>
      ) : (
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex max-w-[1400px] flex-col px-6 py-10 sm:px-10 sm:py-12">
            {description ? (
              <p className="mb-8 max-w-2xl text-[0.95rem] font-light leading-relaxed text-white/45">
                {description}
              </p>
            ) : null}
            <div className="min-h-[560px]">{children}</div>
            <footer className="mt-16 border-t border-white/[0.06] pt-8 text-center text-[0.75rem] uppercase tracking-[0.16em] text-white/30">
              Aevion Labs
            </footer>
          </div>
        </main>
      )}

      <VisitorsLauncher />
    </div>
  );
}
