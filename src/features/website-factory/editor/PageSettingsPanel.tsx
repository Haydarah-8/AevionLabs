"use client";

import type { PuckData, WebsitePage } from "@/features/website-factory/types";
import {
  isNotFoundPageSlug,
  NOT_FOUND_PAGE_SLUG,
  patchPageSeo,
  readPageSeo,
} from "@/features/website-factory/pages/settings";

type Props = {
  page: WebsitePage;
  draftData: PuckData;
  onMetaChange: (patch: {
    title?: string;
    slug?: string;
    navLabel?: string;
    showInNav?: boolean;
  }) => void;
  onDraftChange: (data: PuckData) => void;
};

export function PageSettingsPanel({
  page,
  draftData,
  onMetaChange,
  onDraftChange,
}: Props) {
  const seo = readPageSeo(draftData, page.title);
  const is404 = isNotFoundPageSlug(page.slug);

  return (
    <div className="ae-page-settings-panel">
      <p className="ae-section-label">Page settings</p>
      <p className="ae-note">
        Slug, nav, and per-page SEO. The reserved slug{" "}
        <code>{NOT_FOUND_PAGE_SLUG}</code> is shown when a URL misses.
      </p>

      <label className="ae-custom-field">
        <span>Title</span>
        <input
          value={page.title}
          onChange={(e) => onMetaChange({ title: e.target.value })}
        />
      </label>

      <label className="ae-custom-field">
        <span>URL slug</span>
        <input
          value={page.slug}
          onChange={(e) =>
            onMetaChange({
              slug: e.target.value
                .toLowerCase()
                .replace(/[^a-z0-9-]/g, "-")
                .replace(/-+/g, "-")
                .replace(/^-|-$/g, ""),
            })
          }
        />
        <small>/{page.slug || "…"}</small>
      </label>

      <label className="ae-custom-field">
        <span>Nav label</span>
        <input
          value={page.navLabel}
          onChange={(e) => onMetaChange({ navLabel: e.target.value })}
        />
      </label>

      <label className="ae-custom-field ae-check-row">
        <input
          type="checkbox"
          checked={page.showInNav}
          disabled={is404}
          onChange={(e) => onMetaChange({ showInNav: e.target.checked })}
        />
        <span>Show in navigation{is404 ? " (404 stays hidden)" : ""}</span>
      </label>

      <p className="ae-section-label">Page SEO</p>
      <label className="ae-custom-field">
        <span>Document title</span>
        <input
          value={seo.title}
          onChange={(e) =>
            onDraftChange(patchPageSeo(draftData, { title: e.target.value }))
          }
        />
      </label>
      <label className="ae-custom-field">
        <span>Meta description</span>
        <textarea
          rows={3}
          value={seo.description}
          onChange={(e) =>
            onDraftChange(
              patchPageSeo(draftData, { description: e.target.value }),
            )
          }
        />
      </label>
      <label className="ae-custom-field ae-check-row">
        <input
          type="checkbox"
          checked={seo.noIndex || is404}
          disabled={is404}
          onChange={(e) =>
            onDraftChange(patchPageSeo(draftData, { noIndex: e.target.checked }))
          }
        />
        <span>Noindex this page{is404 ? " (404 always)" : ""}</span>
      </label>

      {!is404 ? (
        <button
          type="button"
          className="ae-btn ghost"
          onClick={() =>
            onMetaChange({
              slug: NOT_FOUND_PAGE_SLUG,
              showInNav: false,
              navLabel: "404",
              title: page.title || "Page not found",
            })
          }
        >
          Use as 404 page
        </button>
      ) : (
        <p className="ae-note">This is the site 404 page.</p>
      )}
    </div>
  );
}
