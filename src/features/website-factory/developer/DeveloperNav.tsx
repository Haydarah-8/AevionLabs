"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin/developer", label: "Platform", exact: true },
  { href: "/admin/developer/connect", label: "Connect" },
  { href: "/admin/developer/api-keys", label: "API" },
  { href: "/admin/developer/mcp", label: "MCP" },
  { href: "/admin/developer/skills", label: "Skills" },
  { href: "/admin/developer/webhooks", label: "Webhooks" },
  { href: "/admin/developer/audit", label: "Audit" },
  { href: "/docs", label: "Docs" },
];

export function DeveloperNav() {
  const pathname = usePathname();
  return (
    <nav className="developer-nav sticky top-0 z-20 -mx-1 mb-6 flex flex-wrap gap-2 border-b border-white/[0.08] bg-[#0a0f1c]/95 px-1 py-3 backdrop-blur-md">
      {LINKS.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-full px-3 py-1.5 text-sm ${
              active
                ? "bg-white text-[#0d1730]"
                : "text-white/50 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
