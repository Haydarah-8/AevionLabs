"use client";

import { useMemo, useState } from "react";
import {
  STUDIO_TOOL_CATEGORIES,
  STUDIO_TOOLS,
  STUDIO_TOOL_COUNT,
  type StudioTool,
  type StudioToolCategory,
} from "./studio-tools";

export function StudioToolsPanel({
  onRun,
}: {
  onRun: (tool: StudioTool) => void;
}) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<StudioToolCategory | "all">("all");

  const tools = useMemo(() => {
    const q = query.trim().toLowerCase();
    return STUDIO_TOOLS.filter((tool) => {
      if (cat !== "all" && tool.category !== cat) return false;
      if (!q) return true;
      return `${tool.label} ${tool.hint || ""} ${tool.id}`
        .toLowerCase()
        .includes(q);
    });
  }, [query, cat]);

  return (
    <div className="ae-tools-panel">
      <p className="ae-section-label">
        Builder tools · {STUDIO_TOOL_COUNT}{" "}
        <span style={{ opacity: 0.55 }}>(Vvveb-inspired)</span>
      </p>
      <input
        className="ae-search ae-add-search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search tools…"
        aria-label="Search tools"
      />
      <div className="ae-tools-cats">
        <button
          type="button"
          className={`ae-preset-chip${cat === "all" ? " is-on" : ""}`}
          onClick={() => setCat("all")}
        >
          All
        </button>
        {STUDIO_TOOL_CATEGORIES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`ae-preset-chip${cat === item.id ? " is-on" : ""}`}
            onClick={() => setCat(item.id)}
          >
            {item.title}
          </button>
        ))}
      </div>
      <div className="ae-tools-list">
        {tools.map((tool) => (
          <button
            key={tool.id}
            type="button"
            className="ae-tool-row"
            onClick={() => onRun(tool)}
            title={tool.hint || tool.label}
          >
            <span>{tool.label}</span>
            <small>{tool.category}</small>
          </button>
        ))}
        {!tools.length ? (
          <p className="ae-empty-inspector">No tools match.</p>
        ) : null}
      </div>
    </div>
  );
}
