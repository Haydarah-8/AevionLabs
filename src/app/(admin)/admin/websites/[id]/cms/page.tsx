"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type CmsImport = {
  id: string;
  title: string;
  sourceUrl: string;
  status: string;
  pageCount: number;
  assetCount: number;
  serviceCount: number;
  summary: string;
  createdAt: string;
  result?: {
    pages: Array<{ title: string; url: string; type: string; excerpt: string }>;
    images: Array<{ url: string; alt: string; kind: string }>;
    services: Array<{ name: string; description: string }>;
    provenance: Array<{ sourcePage: string; contentType: string; importedAt: string }>;
  };
};

export default function WebsiteCmsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [imports, setImports] = useState<CmsImport[]>([]);
  const [selected, setSelected] = useState<CmsImport | null>(null);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch(`/api/admin/websites/${id}/cms`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to load CMS");
    setImports(json.imports || []);
  }

  useEffect(() => {
    void load().catch((err) => setError(err.message));
  }, [id]);

  async function openImport(importId: string) {
    const res = await fetch(
      `/api/admin/websites/${id}/cms?importId=${importId}`,
    );
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to load import");
    setSelected(json.import);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 overflow-auto p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Scraped CMS</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Durable store of scraped pages, media, services, and provenance for
            this website.
          </p>
        </div>
        <Link
          className="rounded border border-zinc-700 px-3 py-2 text-sm text-zinc-200"
          href={`/admin/websites/${id}/editor`}
        >
          Open Studio
        </Link>
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <ul className="space-y-2">
          {imports.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="w-full rounded border border-zinc-800 bg-zinc-950/50 px-3 py-3 text-left hover:border-zinc-600"
                onClick={() =>
                  void openImport(item.id).catch((err) => setError(err.message))
                }
              >
                <div className="font-medium text-zinc-100">{item.title}</div>
                <div className="mt-1 text-xs text-zinc-500">
                  {item.status} · {item.pageCount} pages · {item.assetCount}{" "}
                  assets · {item.serviceCount} services
                </div>
                <div className="mt-1 truncate text-xs text-zinc-500">
                  {item.sourceUrl}
                </div>
              </button>
            </li>
          ))}
          {!imports.length ? (
            <li className="text-sm text-zinc-500">
              No scraped imports yet. Use Studio → Import.
            </li>
          ) : null}
        </ul>
        <div className="rounded border border-zinc-800 p-4">
          {!selected ? (
            <p className="text-sm text-zinc-500">Select an import to inspect.</p>
          ) : (
            <div className="space-y-4 text-sm text-zinc-300">
              <div>
                <h2 className="text-lg font-medium text-white">
                  {selected.title}
                </h2>
                <p className="text-zinc-500">{selected.summary}</p>
              </div>
              <section>
                <h3 className="mb-2 font-medium text-zinc-100">Pages</h3>
                <ul className="space-y-2">
                  {(selected.result?.pages || []).map((page) => (
                    <li key={page.url} className="rounded bg-zinc-900/60 p-2">
                      <div className="font-medium">{page.title}</div>
                      <div className="text-xs text-zinc-500">
                        {page.type} · {page.url}
                      </div>
                      <p className="mt-1 text-xs text-zinc-400">{page.excerpt}</p>
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <h3 className="mb-2 font-medium text-zinc-100">Services</h3>
                <ul className="space-y-1">
                  {(selected.result?.services || []).map((service) => (
                    <li key={service.name}>
                      <strong>{service.name}</strong>
                      <span className="text-zinc-500">
                        {" "}
                        — {service.description.slice(0, 120)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <h3 className="mb-2 font-medium text-zinc-100">Media</h3>
                <div className="grid grid-cols-3 gap-2">
                  {(selected.result?.images || []).slice(0, 12).map((image) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={image.url}
                      src={image.url}
                      alt={image.alt}
                      className="h-20 w-full rounded object-cover"
                    />
                  ))}
                </div>
              </section>
              <section>
                <h3 className="mb-2 font-medium text-zinc-100">Provenance</h3>
                <ul className="space-y-1 text-xs text-zinc-500">
                  {(selected.result?.provenance || []).map((item, index) => (
                    <li key={`${item.sourcePage}-${index}`}>
                      {item.contentType} · {item.sourcePage} ·{" "}
                      {new Date(item.importedAt).toLocaleString()}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
