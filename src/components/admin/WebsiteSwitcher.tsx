"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

type SiteRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  editorEngine?: string;
};

/**
 * Global website switcher for admin — switches Aevion project context only.
 * Does not introduce a second site model.
 */
export function WebsiteSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [sites, setSites] = useState<SiteRow[]>([]);
  const [current, setCurrent] = useState<SiteRow | null>(null);

  const match = pathname.match(/^\/admin\/websites\/([^/]+)/);
  const projectId =
    match && match[1] !== "new" && match[1] !== "templates" && match[1] !== "test"
      ? match[1]
      : null;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/admin/websites");
        const data = await res.json();
        if (!res.ok || cancelled) return;
        const rows = (data.projects ?? []) as SiteRow[];
        setSites(rows);
        if (projectId) {
          setCurrent(rows.find((r) => r.id === projectId) ?? null);
        } else {
          setCurrent(null);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  if (!pathname.startsWith("/admin/websites")) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex max-w-[14rem] items-center gap-1.5 truncate rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 text-xs text-white/75 hover:text-white"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="truncate">
          {current?.name || "All websites"}
        </span>
        <ChevronDown size={14} className="shrink-0 opacity-60" />
      </button>
      {open ? (
        <div
          className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-white/12 bg-[#121218] shadow-xl"
          role="listbox"
        >
          <Link
            href="/admin/websites"
            className="block border-b border-white/8 px-3 py-2.5 text-xs text-white/55 hover:bg-white/[0.04] hover:text-white"
            onClick={() => setOpen(false)}
          >
            All websites
          </Link>
          <div className="max-h-64 overflow-y-auto">
            {sites.map((site) => (
              <button
                key={site.id}
                type="button"
                role="option"
                aria-selected={site.id === current?.id}
                className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-xs text-white/80 hover:bg-white/[0.06]"
                onClick={() => {
                  setOpen(false);
                  router.push(`/admin/websites/${site.id}`);
                }}
              >
                <span className="truncate">{site.name}</span>
                <span className="shrink-0 text-[0.65rem] uppercase tracking-wide text-white/35">
                  {site.status}
                </span>
              </button>
            ))}
          </div>
          <Link
            href="/admin/websites/new"
            className="block border-t border-white/8 px-3 py-2.5 text-xs text-white/70 hover:bg-white/[0.04] hover:text-white"
            onClick={() => setOpen(false)}
          >
            + Create website
          </Link>
        </div>
      ) : null}
    </div>
  );
}
