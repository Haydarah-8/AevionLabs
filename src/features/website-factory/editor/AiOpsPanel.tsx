"use client";

import type { RefObject } from "react";
import type { AiPlan } from "@/features/website-factory/ai/tools";
import { describeCall } from "@/features/website-factory/ai/ops";
import { factoryPreviewPath } from "@/features/website-factory/urls";

type Props = {
  command: string;
  onCommandChange: (value: string) => void;
  commandRef?: RefObject<HTMLTextAreaElement | null>;
  plan: AiPlan | null;
  confirmMessage?: string | null;
  busy: boolean;
  projectSlug: string;
  projectId: string;
  versionCount: number;
  pageCount: number;
  mcpTools: Array<{ name: string; description: string }>;
  onPlan: () => void;
  onApply: () => void;
  onReject: () => void;
};

export function AiOpsPanel({
  command,
  onCommandChange,
  commandRef,
  plan,
  confirmMessage,
  busy,
  projectSlug,
  projectId,
  versionCount,
  pageCount,
  mcpTools,
  onPlan,
  onApply,
  onReject,
}: Props) {
  return (
    <div className="ae-ai-ops-panel">
      <p className="ae-section-label">Command</p>
      <p className="ae-note">
        Plans are structured tool calls. Destructive ops (e.g. remove component)
        require an explicit confirm before apply.
      </p>
      <form
        className="ae-side-form"
        onSubmit={(event) => {
          event.preventDefault();
          onPlan();
        }}
      >
        <textarea
          ref={commandRef}
          value={command}
          onChange={(event) => onCommandChange(event.target.value)}
          placeholder="Describe what to change… ⌘K"
          rows={4}
        />
        <div className="ae-actions-row" style={{ padding: 0 }}>
          <button
            type="submit"
            className="ae-btn primary"
            disabled={busy || !command.trim()}
          >
            {busy ? "Planning…" : "Plan"}
          </button>
          {plan ? (
            <button
              type="button"
              className={`ae-btn${plan.destructive ? " ae-btn-danger" : ""}`}
              disabled={busy}
              onClick={onApply}
            >
              {plan.destructive ? "Confirm & apply" : "Apply"}
            </button>
          ) : null}
          {plan ? (
            <button
              type="button"
              className="ae-btn ghost"
              disabled={busy}
              onClick={onReject}
            >
              Reject
            </button>
          ) : null}
        </div>
      </form>

      {plan?.explanation ? (
        <p className={`ae-issue${plan.destructive ? " ae-issue-danger" : ""}`}>
          <strong>{plan.destructive ? "Destructive plan" : "Plan"}</strong>
          {plan.explanation}
          {plan.destructive && confirmMessage
            ? ` · ${confirmMessage}`
            : plan.destructive
              ? " · Confirmation required."
              : ""}
        </p>
      ) : null}

      {plan?.calls?.length ? (
        <>
          <p className="ae-section-label">Structured ops</p>
          <ol className="ae-ai-ops-list">
            {plan.calls.map((call, index) => (
              <li
                key={`${call.name}-${index}`}
                className={
                  call.name === "removeComponent" ? "is-destructive" : ""
                }
              >
                <strong>{describeCall(call)}</strong>
                <span className="ae-note">
                  {" "}
                  · {call.name}
                  {call.name === "removeComponent" ? " · destructive" : ""}
                </span>
              </li>
            ))}
          </ol>
        </>
      ) : null}

      <p className="ae-section-label">Site</p>
      <div className="ae-actions-row" style={{ padding: "0 0 8px" }}>
        <a
          className="ae-btn ghost"
          href={factoryPreviewPath(projectSlug)}
          target="_blank"
          rel="noreferrer"
        >
          Preview
        </a>
        <a
          className="ae-btn ghost"
          href={`/admin/websites/${projectId}/deploy`}
        >
          Deploy
        </a>
      </div>
      <p className="ae-note">
        {versionCount} published versions · {pageCount} pages
      </p>

      {mcpTools.length ? (
        <>
          <p className="ae-section-label">MCP tools</p>
          <ul className="ae-review-list">
            {mcpTools.slice(0, 8).map((tool) => (
              <li key={tool.name}>
                <strong>{tool.name}</strong>
                <span className="ae-note"> {tool.description}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
