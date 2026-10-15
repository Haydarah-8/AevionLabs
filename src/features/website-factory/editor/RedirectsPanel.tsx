"use client";

import type { SiteConfig } from "@/features/website-factory/types";
import {
  createRedirect,
  listRedirects,
  removeRedirect,
  upsertRedirect,
  type SiteRedirect,
} from "@/features/website-factory/pages/settings";

type Props = {
  siteConfig: SiteConfig;
  onSiteConfigChange: (siteConfig: SiteConfig) => void;
};

export function RedirectsPanel({ siteConfig, onSiteConfigChange }: Props) {
  const redirects = listRedirects(siteConfig);

  function save(next: SiteConfig) {
    onSiteConfigChange(next);
  }

  function update(redirect: SiteRedirect, patch: Partial<SiteRedirect>) {
    save(upsertRedirect(siteConfig, { ...redirect, ...patch }));
  }

  return (
    <div className="ae-redirects-panel">
      <p className="ae-section-label">Redirects</p>
      <p className="ae-note">
        Checked before page lookup on draft, preview, and live. Use site paths
        like <code>/old-about</code> → <code>/about</code>, or an absolute URL.
      </p>
      <div className="ae-actions-row">
        <button
          type="button"
          className="ae-btn ghost"
          onClick={() => save(upsertRedirect(siteConfig, createRedirect()))}
        >
          Add redirect
        </button>
      </div>

      {!redirects.length ? (
        <p className="ae-empty-inspector">No redirects yet.</p>
      ) : (
        <ul className="ae-list ae-redirect-list">
          {redirects.map((item) => (
            <li key={item.id} className="ae-redirect-row">
              <label className="ae-custom-field">
                <span>From</span>
                <input
                  value={item.from}
                  onChange={(e) => update(item, { from: e.target.value })}
                  placeholder="/old-path"
                />
              </label>
              <label className="ae-custom-field">
                <span>To</span>
                <input
                  value={item.to}
                  onChange={(e) => update(item, { to: e.target.value })}
                  placeholder="/new-path"
                />
              </label>
              <label className="ae-custom-field ae-check-row">
                <input
                  type="checkbox"
                  checked={Boolean(item.permanent)}
                  onChange={(e) =>
                    update(item, { permanent: e.target.checked })
                  }
                />
                <span>Permanent (301)</span>
              </label>
              <button
                type="button"
                className="ae-btn ghost"
                onClick={() => save(removeRedirect(siteConfig, item.id))}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
