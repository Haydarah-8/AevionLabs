"use client";

import { useMemo, useState } from "react";
import type { ProjectBundle, WebsiteVersion } from "@/features/website-factory/types";
import {
  displayVersionName,
  formatVersionTime,
  isLiveVersion,
  sortVersionsNewestFirst,
  summarizeSnapshot,
} from "@/features/website-factory/history/versions";

type Props = {
  bundle: ProjectBundle;
  busy?: boolean;
  onRestore: (version: WebsiteVersion) => Promise<void>;
  onRename: (version: WebsiteVersion, note: string) => Promise<void>;
  onPublish?: (note: string) => Promise<void>;
};

export function HistoryPanel({
  bundle,
  busy,
  onRestore,
  onRename,
  onPublish,
}: Props) {
  const versions = useMemo(
    () => sortVersionsNewestFirst(bundle.versions),
    [bundle.versions],
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftNote, setDraftNote] = useState("");
  const [publishNote, setPublishNote] = useState("");

  function startRename(version: WebsiteVersion) {
    setEditingId(version.id);
    setDraftNote(displayVersionName(version));
  }

  async function commitRename(version: WebsiteVersion) {
    const next = draftNote.trim();
    setEditingId(null);
    if (!next || next === displayVersionName(version)) return;
    await onRename(version, next);
  }

  return (
    <div className="ae-history-panel">
      <p className="ae-section-label">Publish history</p>
      <p className="ae-note">
        Live publishes create named snapshots on{" "}
        <code>website_versions</code>. Restore loads a snapshot into the editor
        draft — the live site stays until you publish again. Status:{" "}
        <strong>{bundle.project.status}</strong>
        {bundle.project.publishedAt
          ? ` · last live ${formatVersionTime(bundle.project.publishedAt)}`
          : ""}
        .
      </p>

      {onPublish ? (
        <div className="ae-history-publish">
          <label className="ae-custom-field">
            <span>Name this publish (optional)</span>
            <input
              value={publishNote}
              onChange={(e) => setPublishNote(e.target.value)}
              placeholder="e.g. Launch day"
              maxLength={120}
              disabled={Boolean(busy)}
            />
          </label>
          <button
            type="button"
            className="ae-btn"
            disabled={Boolean(busy)}
            onClick={() =>
              void onPublish(publishNote.trim()).then(() => setPublishNote(""))
            }
          >
            Publish live
          </button>
        </div>
      ) : null}

      {!versions.length ? (
        <p className="ae-empty-inspector">
          No published versions yet. Publish live to create the first snapshot.
        </p>
      ) : (
        <ol className="ae-history-timeline">
          {versions.map((version, index) => {
            const live = isLiveVersion(version, bundle.project);
            const summary = summarizeSnapshot(version.snapshot);
            const editing = editingId === version.id;
            return (
              <li
                key={version.id}
                className={`ae-history-item${live ? " is-live" : ""}`}
              >
                <span className="ae-history-rail" aria-hidden>
                  <span className="ae-history-dot" />
                  {index < versions.length - 1 ? (
                    <span className="ae-history-line" />
                  ) : null}
                </span>
                <div className="ae-history-body">
                  <div className="ae-history-head">
                    {editing ? (
                      <input
                        className="ae-history-name-input"
                        value={draftNote}
                        autoFocus
                        maxLength={120}
                        onChange={(e) => setDraftNote(e.target.value)}
                        onBlur={() =>
                          void commitRename(version).catch(() => undefined)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.currentTarget.blur();
                          }
                          if (e.key === "Escape") {
                            setEditingId(null);
                          }
                        }}
                      />
                    ) : (
                      <button
                        type="button"
                        className="ae-history-name"
                        title="Rename version"
                        onClick={() => startRename(version)}
                      >
                        {displayVersionName(version)}
                      </button>
                    )}
                    <span className="ae-history-meta">
                      v{version.versionNumber}
                      {live ? " · Live" : ""}
                    </span>
                  </div>
                  <p className="ae-note">
                    {formatVersionTime(version.createdAt)}
                    {summary.pageCount
                      ? ` · ${summary.pageCount} page${summary.pageCount === 1 ? "" : "s"}`
                      : ""}
                  </p>
                  <div className="ae-actions-row">
                    <button
                      type="button"
                      className="ae-btn ghost"
                      disabled={Boolean(busy)}
                      onClick={() => startRename(version)}
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      className="ae-btn ghost"
                      disabled={Boolean(busy)}
                      onClick={() => {
                        if (
                          !window.confirm(
                            `Restore “${displayVersionName(version)}” into the editor draft? Live site is unchanged until you publish.`,
                          )
                        ) {
                          return;
                        }
                        void onRestore(version);
                      }}
                    >
                      Restore to draft
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
