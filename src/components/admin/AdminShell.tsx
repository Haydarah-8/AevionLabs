"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LivePulse } from "@/components/admin/LivePulse";
import { signOutAdmin, useAdminGuard } from "@/components/admin/useAdminGuard";
import { useVisitorFeedContext } from "@/components/admin/VisitorFeedProvider";
import { VisitorsLauncher } from "@/components/admin/VisitorsLauncher";

type NavItem = {
  href: string;
  label: string;
  match?: "exact" | "prefix";
};

const GROUPS: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "Desk",
    items: [
      { href: "/admin", label: "Overview", match: "exact" },
      { href: "/admin/websites", label: "Sites", match: "prefix" },
      { href: "/admin/websites/new", label: "Create", match: "exact" },
      { href: "/admin/websites/templates", label: "Templates", match: "exact" },
    ],
  },
  {
    label: "Publish",
    items: [
      { href: "/admin/blog", label: "Insights", match: "prefix" },
      { href: "/admin/gallery", label: "Gallery", match: "prefix" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/developer", label: "Platform", match: "prefix" },
      { href: "/admin/settings", label: "Settings", match: "prefix" },
    ],
  },
];

function isActive(pathname: string, item: NavItem) {
  if (item.href === "/admin/websites/new") {
    return pathname === item.href;
  }
  if (item.href === "/admin/websites/templates") {
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  }
  if (item.href === "/admin/websites") {
    if (
      pathname.startsWith("/admin/websites/templates") ||
      pathname.startsWith("/admin/websites/new")
    ) {
      return false;
    }
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

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b] text-[0.95rem] text-white/45">
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
    <div className="admin-shell flex h-full min-h-0 overflow-hidden bg-[#09090b] text-zinc-100 antialiased">
      <aside className="hidden w-[220px] shrink-0 flex-col border-r border-white/[0.07] bg-[#0b0b0d] md:flex">
        <div className="border-b border-white/[0.07] px-5 py-6">
          <Link href="/admin" className="block group">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-white/40 group-hover:text-white/65">
              Aevion Labs
            </p>
            <p className="mt-2 text-[1.35rem] font-normal leading-none tracking-[-0.04em] text-white">
              Admin
            </p>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {GROUPS.map((group) => (
            <div key={group.label} className="mb-7">
              <p className="mb-2 px-2 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-white/30">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(pathname, item);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`block rounded-lg px-3 py-2 text-[0.92rem] tracking-[-0.015em] transition-colors ${
                          active
                            ? "bg-white text-[#09090b]"
                            : "text-white/55 hover:bg-white/[0.05] hover:text-white"
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/[0.07] px-4 py-4">
          <div className="mb-3 px-1">
            <LivePulse count={liveCount} />
          </div>
          <button
            type="button"
            onClick={() => void signOutAdmin()}
            className="w-full rounded-lg border border-white/10 px-3 py-2 text-left text-[0.85rem] text-white/50 transition-colors hover:border-white/25 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-3 md:hidden">
          <Link href="/admin">
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-white/40">
              Aevion
            </p>
            <p className="text-[1rem] tracking-[-0.03em] text-white">Admin</p>
          </Link>
          <LivePulse count={liveCount} />
        </header>

        <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-white/[0.07] px-3 py-2 md:hidden">
          {GROUPS.flatMap((g) => g.items).map((item) => {
            const active = isActive(pathname, item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[0.8rem] ${
                  active ? "bg-white text-[#09090b]" : "text-white/50"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {fullBleed ? (
          <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
            {children}
          </main>
        ) : (
          <main className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto flex max-w-[1200px] flex-col px-6 py-10 sm:px-10 sm:py-14">
              {subtitle ? (
                <p className="mb-8 max-w-xl text-[0.95rem] font-light leading-relaxed text-white/45">
                  {subtitle}
                </p>
              ) : null}
              <div className="min-h-[520px]">{children}</div>
              <footer className="mt-20 border-t border-white/[0.06] pt-8">
                <p className="text-[0.65rem] uppercase tracking-[0.18em] text-white/25">
                  Aevion Labs
                </p>
              </footer>
            </div>
          </main>
        )}
      </div>

      <VisitorsLauncher />
    </div>
  );
}
