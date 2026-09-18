"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "", label: "Overview" },
  { href: "/editor", label: "Editor" },
  { href: "/content", label: "Content" },
  { href: "/cms", label: "CMS" },
  { href: "/settings", label: "Settings" },
  { href: "/preview", label: "Preview" },
  { href: "/deploy", label: "Deploy" },
];

export function ProjectNav({ id }: { id: string }) {
  const pathname = usePathname();
  const base = `/admin/websites/${id}`;
  return (
    <nav className="mb-8 flex flex-wrap gap-2 border-b border-white/10 pb-4">
      {LINKS.map((item) => {
        const href = `${base}${item.href}`;
        const active =
          item.href === "" ? pathname === base : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`rounded-full px-3 py-1.5 text-sm ${
              active ? "bg-white text-black" : "text-zinc-400 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
      <Link
        href="/admin/developer"
        className="rounded-full px-3 py-1.5 text-sm text-zinc-400 hover:text-white"
      >
        Platform
      </Link>
      <Link
        href="/admin/developer/connect"
        className="rounded-full px-3 py-1.5 text-sm text-zinc-400 hover:text-white"
      >
        Connect
      </Link>
    </nav>
  );
}
