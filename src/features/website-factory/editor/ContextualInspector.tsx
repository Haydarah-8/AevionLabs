"use client";

import {
  APPEARANCE_STYLE_KEYS,
  ADVANCED_STYLE_KEYS,
  LAYOUT_STYLE_KEYS,
  RESPONSIVE_STYLE_KEYS,
  TYPOGRAPHY_STYLE_KEYS,
  type InspectorTab,
} from "./inspector-tabs";
import { LayoutControls } from "./LayoutControls";
import { InstanceFlagsPanel } from "./InstanceFlagsPanel";
import type { StyleBox } from "@/features/website-factory/puck/styles";
import {
  inheritStyleKey,
  isOverriddenAt,
  overrideKeysAt,
  resetBreakpointOverrides,
  type StudioBreakpoint,
} from "@/features/website-factory/puck/responsive";

type Props = {
  tab: InspectorTab;
  selectedLabel: string;
  /** Resolved styles for the active breakpoint (what the fields show). */
  selectedStyles: Record<string, string>;
  /** Raw style bag including responsive overrides. */
  rawStyles?: StyleBox;
  /** Selected component type (for instance flags / variants). */
  componentType?: string | null;
  /** Full selected props for instance flags. */
  selectedProps?: Record<string, unknown> | null;
  onPropsReplace?: (props: Record<string, unknown>) => void;
  siteConfig?: import("@/features/website-factory/types").SiteConfig | null;
  breakpoint: StudioBreakpoint;
  onBreakpointChange: (breakpoint: StudioBreakpoint) => void;
  onStylePatch: (patch: Record<string, string>) => void;
  onStylesReplace: (styles: StyleBox) => void;
  fieldsSlot: React.ReactNode;
  zoom: number;
};

function StyleEditors({
  keys,
  values,
  overridden,
  breakpoint,
  onChange,
  onInherit,
}: {
  keys: readonly string[];
  values: Record<string, string>;
  overridden: Set<string>;
  breakpoint: StudioBreakpoint;
  onChange: (key: string, value: string) => void;
  onInherit?: (key: string) => void;
}) {
  return (
    <div className="ae-style-editors">
      {keys.map((key) => {
        const isOverride = overridden.has(key);
        return (
          <label key={key} className="ae-custom-field">
            <span className="ae-style-key-row">
              {key}
              {isOverride ? (
                <span
                  className="ae-override-badge"
                  title="Override at this breakpoint"
                >
                  override
                </span>
              ) : breakpoint !== "desktop" ? (
                <span
                  className="ae-inherit-badge"
                  title="Inherited from larger breakpoint"
                >
                  inherit
                </span>
              ) : null}
            </span>
            {key === "background" ||
            key === "color" ||
            key === "borderColor" ? (
              <input
                type="color"
                value={
                  /^#[0-9a-fA-F]{6}$/.test(values[key] || "")
                    ? values[key]
                    : "#111111"
                }
                onChange={(event) => onChange(key, event.target.value)}
              />
            ) : null}
            <div className="ae-style-value-row">
              <input
                type="text"
                value={values[key] || ""}
                onChange={(event) => onChange(key, event.target.value)}
                placeholder={
                  breakpoint === "desktop" ? key : `inherit · ${key}`
                }
              />
              {isOverride && onInherit ? (
                <button
                  type="button"
                  className="ae-btn ghost ae-inherit-btn"
                  title="Clear override (inherit)"
                  onClick={() => onInherit(key)}
                >
                  Inherit
                </button>
              ) : null}
            </div>
          </label>
        );
      })}
    </div>
  );
}

const BP_LABEL: Record<StudioBreakpoint, string> = {
  desktop: "Desktop",
  tablet: "Tablet",
  mobile: "Mobile",
};

export function ContextualInspector({
  tab,
  selectedLabel,
  selectedStyles,
  rawStyles,
  componentType,
  selectedProps,
  onPropsReplace,
  siteConfig,
  breakpoint,
  onBreakpointChange,
  onStylePatch,
  onStylesReplace,
  fieldsSlot,
  zoom,
}: Props) {
  const overridden = new Set(overrideKeysAt(rawStyles, breakpoint));

  function setKey(key: string, value: string) {
    onStylePatch({ [key]: value });
  }

  function inheritKey(key: string) {
    onStylesReplace(inheritStyleKey(rawStyles, breakpoint, key));
  }

  function BreakpointBar() {
    return (
      <div className="ae-bp-bar">
        {(["desktop", "tablet", "mobile"] as const).map((bp) => (
          <button
            key={bp}
            type="button"
            className={`ae-btn ghost${breakpoint === bp ? " is-on" : ""}`}
            onClick={() => onBreakpointChange(bp)}
          >
            {BP_LABEL[bp]}
            {bp !== "desktop" && overrideKeysAt(rawStyles, bp).length > 0
              ? ` · ${overrideKeysAt(rawStyles, bp).length}`
              : ""}
          </button>
        ))}
      </div>
    );
  }

  if (tab === "content") {
    return (
      <div className="ae-panel-scroll ae-pane">
        <p className="ae-note" style={{ marginBottom: 10 }}>
          Content for <strong>{selectedLabel}</strong>
        </p>
        {fieldsSlot}
      </div>
    );
  }

  if (tab === "layout") {
    return (
      <div className="ae-panel-scroll ae-pane">
        <p className="ae-note" style={{ marginBottom: 10 }}>
          Layout for <strong>{selectedLabel}</strong> · {BP_LABEL[breakpoint]}
        </p>
        <BreakpointBar />
        <LayoutControls
          values={selectedStyles}
          onChange={onStylePatch}
          advancedSlot={
            <StyleEditors
              keys={LAYOUT_STYLE_KEYS}
              values={selectedStyles}
              overridden={overridden}
              breakpoint={breakpoint}
              onChange={setKey}
              onInherit={inheritKey}
            />
          }
        />
        {fieldsSlot}
      </div>
    );
  }

  if (tab === "typography") {
    return (
      <div className="ae-panel-scroll ae-pane">
        <p className="ae-note" style={{ marginBottom: 10 }}>
          Typography for <strong>{selectedLabel}</strong> ·{" "}
          {BP_LABEL[breakpoint]}
        </p>
        <BreakpointBar />
        <StyleEditors
          keys={TYPOGRAPHY_STYLE_KEYS}
          values={selectedStyles}
          overridden={overridden}
          breakpoint={breakpoint}
          onChange={setKey}
          onInherit={inheritKey}
        />
      </div>
    );
  }

  if (tab === "appearance") {
    return (
      <div className="ae-panel-scroll ae-pane">
        <p className="ae-note" style={{ marginBottom: 10 }}>
          Appearance for <strong>{selectedLabel}</strong> ·{" "}
          {BP_LABEL[breakpoint]}
        </p>
        <BreakpointBar />
        <StyleEditors
          keys={APPEARANCE_STYLE_KEYS}
          values={selectedStyles}
          overridden={overridden}
          breakpoint={breakpoint}
          onChange={setKey}
          onInherit={inheritKey}
        />
      </div>
    );
  }

  if (tab === "responsive") {
    const overrideCount = overrideKeysAt(rawStyles, breakpoint).length;
    return (
      <div className="ae-panel-scroll ae-pane">
        <p className="ae-note" style={{ marginBottom: 10 }}>
          Responsive · <strong>{BP_LABEL[breakpoint]}</strong> · canvas zoom{" "}
          {zoom}%
        </p>
        <BreakpointBar />
        <p className="ae-note">
          Edits apply to the active breakpoint. Tablet/mobile values override
          desktop; clear a field or use Inherit to fall back.
        </p>
        <div className="ae-actions-row" style={{ padding: "0 0 10px" }}>
          {breakpoint !== "desktop" ? (
            <button
              type="button"
              className="ae-btn ghost"
              disabled={overrideCount === 0}
              onClick={() =>
                onStylesReplace(resetBreakpointOverrides(rawStyles, breakpoint))
              }
            >
              Reset {BP_LABEL[breakpoint]} overrides
            </button>
          ) : (
            <span className="ae-note">Desktop is the base style layer.</span>
          )}
        </div>
        {breakpoint !== "desktop" && overrideCount > 0 ? (
          <ul className="ae-review-list ae-override-list">
            {overrideKeysAt(rawStyles, breakpoint).map((key) => (
              <li key={key}>
                <code>{key}</code>
                <button
                  type="button"
                  className="ae-btn ghost"
                  onClick={() => inheritKey(key)}
                >
                  Inherit
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <StyleEditors
          keys={RESPONSIVE_STYLE_KEYS}
          values={selectedStyles}
          overridden={overridden}
          breakpoint={breakpoint}
          onChange={setKey}
          onInherit={inheritKey}
        />
      </div>
    );
  }

  if (tab === "advanced") {
    return (
      <div className="ae-panel-scroll ae-pane">
        <p className="ae-note" style={{ marginBottom: 10 }}>
          Advanced for <strong>{selectedLabel}</strong> · {BP_LABEL[breakpoint]}
        </p>
        <BreakpointBar />
        {componentType && selectedProps && onPropsReplace ? (
          <InstanceFlagsPanel
            componentType={componentType}
            props={selectedProps}
            onChange={onPropsReplace}
            siteConfig={siteConfig}
          />
        ) : (
          <p className="ae-empty-inspector">
            Select a block to edit instance flags.
          </p>
        )}
        <StyleEditors
          keys={ADVANCED_STYLE_KEYS}
          values={selectedStyles}
          overridden={overridden}
          breakpoint={breakpoint}
          onChange={setKey}
          onInherit={inheritKey}
        />
        {fieldsSlot}
      </div>
    );
  }

  return null;
}

// re-export helper used by tests / callers
export { isOverriddenAt };
