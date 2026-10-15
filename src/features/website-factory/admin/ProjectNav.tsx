"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function ProjectNav({ id }: { id: string }) {
  const pathname = usePathname();
  const base = `/admin/websites/${id}`;

  const links: Array<{ href: string; label: string; active: boolean }> = [
    { href: base, label: "Overview", active: pathname === base },
    {
      href: `${base}/editor`,
      label: "Editor",
      active: pathname.startsWith(`${base}/editor`),
    },
    {
      href: `${base}/content`,
      label: "Content",
      active: pathname.startsWith(`${base}/content`),
    },
    {
      href: `${base}/cms`,
      label: "Imports",
      active: pathname.startsWith(`${base}/cms`),
    },
    {
      href: `${base}/settings`,
      label: "Settings",
      active: pathname.startsWith(`${base}/settings`),
    },
    {
      href: `${base}/preview`,
      label: "Preview",
      active: pathname.startsWith(`${base}/preview`),
    },
    {
      href: `${base}/deploy`,
      label: "Deploy",
      active: pathname.startsWith(`${base}/deploy`),
    },
  ];

  return (
    <nav className="mb-8 flex flex-wrap gap-2 border-b border-white/10 pb-4">
      {links.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`rounded-full px-3 py-1.5 text-sm ${
            item.active
              ? "bg-white text-black"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          {item.label}
        </Link>
      ))}
      <Link
        href="/admin/developer"
        className="rounded-full px-3 py-1.5 text-sm text-zinc-400 hover:text-white"
      >
        Platform
      </Link>
    </nav>
  );
}
