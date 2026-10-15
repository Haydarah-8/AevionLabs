"use client";

import { useMemo, useState } from "react";
import type {
  HealthArea,
  HealthIssue,
  HealthReport,
} from "@/features/website-factory/services/health";
import { groupIssuesByArea } from "@/features/website-factory/services/health";
import {
  factoryLivePath,
  factoryPreviewPath,
} from "@/features/website-factory/urls";

type Props = {
  health: HealthReport | null;
  busy?: boolean;
  projectSlug: string;
  seoTitle: string;
  seoDescription: string;
  /** When set, only show this area (e.g. SEO tab). */
  focusArea?: HealthArea | null;
  onRun: () => void;
};

const AREA_LABEL: Record<HealthArea, string> = {
  seo: "SEO",
  a11y: "Accessibility",
  perf: "Performance",
  content: "Content",
};

const AREAS: HealthArea[] = ["seo", "a11y", "perf", "content"];

export function AuditsPanel({
  health,
  busy,
  projectSlug,
  seoTitle,
  seoDescription,
  focusArea = null,
  onRun,
}: Props) {
  const [filter, setFilter] = useState<HealthArea | "all">(focusArea || "all");
  const groups = useMemo(
    () => (health ? groupIssuesByArea(health.issues) : null),
    [health],
  );
  const activeFilter = focusArea || filter;

  const visibleIssues: HealthIssue[] = useMemo(() => {
    if (!health) return [];
    if (activeFilter === "all") return health.issues;
    return health.issues.filter((issue) => issue.area === activeFilter);
  }, [health, activeFilter]);

  return (
    <div className="ae-audits-panel">
      <p className="ae-section-label">
        {focusArea ? AREA_LABEL[focusArea] : "Audits"}
      </p>
      <p className="ae-note">
        Static checks on the draft bundle — real findings only, no invented
        scores. Re-run after edits.
      </p>

      {!focusArea ? (
        <div className="ae-issue" style={{ marginBottom: 10 }}>
          <strong>{seoTitle || "No site title"}</strong>
          {seoDescription || "No site description"}
          <p className="ae-note" style={{ marginTop: 8 }}>
            Live {factoryLivePath(projectSlug)} · Preview{" "}
            {factoryPreviewPath(projectSlug)}
          </p>
        </div>
      ) : (
        <div className="ae-issue" style={{ marginBottom: 10 }}>
          <strong>{seoTitle || "No site title"}</strong>
          {seoDescription || "No site description"}
          <p className="ae-note" style={{ marginTop: 8 }}>
            Canonical {factoryLivePath(projectSlug)}
          </p>
        </div>
      )}

      <div className="ae-actions-row" style={{ padding: 0 }}>
        <button
          type="button"
          className="ae-btn primary"
          disabled={Boolean(busy)}
          onClick={onRun}
        >
          {busy ? "Running…" : health ? "Re-run audit" : "Run audit"}
        </button>
      </div>

      {health ? (
        <>
          <p className="ae-note" style={{ marginTop: 10 }}>
            {health.summary}
          </p>
          {!focusArea ? (
            <div className="ae-audit-filters">
              <button
                type="button"
                className={activeFilter === "all" ? "is-on" : ""}
                onClick={() => setFilter("all")}
              >
                All ({health.issues.length})
              </button>
              {AREAS.map((area) => (
                <button
                  type="button"
                  key={area}
                  className={activeFilter === area ? "is-on" : ""}
                  onClick={() => setFilter(area)}
                >
                  {AREA_LABEL[area]} ({groups?.[area].length ?? 0})
                </button>
              ))}
            </div>
          ) : null}

          {!visibleIssues.length ? (
            <p className="ae-empty-inspector">
              No{" "}
              {activeFilter === "all"
                ? ""
                : `${AREA_LABEL[activeFilter as HealthArea]} `}
              issues in this draft.
            </p>
          ) : (
            <ul className="ae-audit-list">
              {visibleIssues.map((issue) => (
                <li
                  key={issue.id}
                  className={`ae-audit-item severity-${issue.severity}`}
                >
                  <div className="ae-audit-item-head">
                    <span className="ae-audit-badge">{issue.severity}</span>
                    <span className="ae-audit-area">
                      {AREA_LABEL[issue.area]}
                    </span>
                  </div>
                  <strong>{issue.message}</strong>
                  <p className="ae-note">{issue.hint}</p>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <p className="ae-empty-inspector" style={{ marginTop: 12 }}>
          Run the audit to list SEO, accessibility, performance, and content
          findings.
        </p>
      )}
    </div>
  );
}
