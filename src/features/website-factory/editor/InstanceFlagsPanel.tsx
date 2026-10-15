"use client";

import {
  getInstanceVariant,
  getLayerLabel,
  isLayerHidden,
  isLayerLocked,
  locksChildren,
  patchInstanceFlags,
  STUDIO_PROP,
} from "@/features/website-factory/editor/studio-props";
import {
  isSlotContainer,
  listSlotFieldsForType,
  setLockedOnSlotTree,
} from "@/features/website-factory/editor/slots";
import {
  applyVariantToProps,
  listVariantsForType,
} from "@/features/website-factory/editor/variants";
import { FieldBindsPanel } from "@/features/website-factory/editor/FieldBindsPanel";
import { InteractionsPanel } from "@/features/website-factory/editor/InteractionsPanel";
import type { SiteConfig } from "@/features/website-factory/types";

type Props = {
  componentType: string;
  props: Record<string, unknown>;
  onChange: (nextProps: Record<string, unknown>) => void;
  siteConfig?: SiteConfig | null;
};

export function InstanceFlagsPanel({
  componentType,
  props,
  onChange,
  siteConfig,
}: Props) {
  const locked = isLayerLocked(props);
  const hidden = isLayerHidden(props);
  const lockKids = locksChildren(props);
  const label = getLayerLabel(componentType, props);
  const variant = getInstanceVariant(props);
  const slots = listSlotFieldsForType(componentType);
  const variants = listVariantsForType(componentType);
  const hasSlots = isSlotContainer(componentType);

  function commit(next: Record<string, unknown>) {
    onChange(next);
  }

  function setFlags(patch: Parameters<typeof patchInstanceFlags>[1]) {
    let next = patchInstanceFlags(props, patch);
    // Cascade lock into slot tree when locking and lock-children is on
    if ("_locked" in patch && locksChildren(next) && hasSlots) {
      next = setLockedOnSlotTree(next, componentType, Boolean(patch._locked));
    }
    commit(next);
  }

  function setLockChildren(enabled: boolean) {
    let next = patchInstanceFlags(props, { _lockChildren: enabled });
    if (hasSlots) {
      // Enabling while locked → cascade; disabling → unlock children
      if (enabled && isLayerLocked(next)) {
        next = setLockedOnSlotTree(next, componentType, true);
      } else if (!enabled) {
        next = setLockedOnSlotTree(next, componentType, false);
      }
    }
    commit(next);
  }

  return (
    <div className="ae-instance-flags">
      <p className="ae-section-label">Instance</p>
      <p className="ae-note">
        Aevion flags on this block (<code>_label</code>, <code>_locked</code>,{" "}
        <code>_hidden</code>, <code>_variant</code>). Persist with the page.
      </p>

      <label className="ae-custom-field">
        <span>Layer name</span>
        <input
          type="text"
          value={
            typeof props[STUDIO_PROP.label] === "string"
              ? (props[STUDIO_PROP.label] as string)
              : ""
          }
          placeholder={label}
          onChange={(e) => setFlags({ _label: e.target.value })}
        />
      </label>

      <div className="ae-instance-toggles">
        <label className="ae-check">
          <input
            type="checkbox"
            checked={locked}
            onChange={(e) => setFlags({ _locked: e.target.checked })}
          />
          Lock (no drag / delete / edit)
        </label>
        <label className="ae-check">
          <input
            type="checkbox"
            checked={hidden}
            onChange={(e) => setFlags({ _hidden: e.target.checked })}
          />
          Hide (ghost in editor, omit live)
        </label>
        {hasSlots ? (
          <label className="ae-check">
            <input
              type="checkbox"
              checked={lockKids}
              onChange={(e) => setLockChildren(e.target.checked)}
            />
            Lock children in slots
          </label>
        ) : null}
      </div>

      {hasSlots ? (
        <div className="ae-instance-slots">
          <p className="ae-section-label">Slots</p>
          <ul className="ae-review-list">
            {slots.map((slot) => (
              <li key={slot.slotKey}>
                <code>{slot.slotKey}</code>
                <span className="ae-note"> {slot.label}</span>
              </li>
            ))}
          </ul>
          <p className="ae-note">
            Drop nested blocks into these slots on the canvas.
          </p>
        </div>
      ) : null}

      {variants.length ? (
        <div className="ae-instance-variants">
          <p className="ae-section-label">Variant</p>
          <div className="ae-style-presets">
            {variants.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`ae-preset-chip${variant === item.id ? " is-on" : ""}${item.applyable ? "" : " is-docs"}`}
                title={
                  item.applyable
                    ? `Apply ${item.label}`
                    : `${item.label} (documented)`
                }
                onClick={() => {
                  if (item.applyable) {
                    commit(applyVariantToProps(componentType, item.id, props));
                  } else {
                    setFlags({ _variant: item.id });
                  }
                }}
              >
                {item.label}
                {!item.applyable ? " · docs" : ""}
              </button>
            ))}
          </div>
          {variant ? (
            <p className="ae-note">
              Active: <code>{variant}</code>{" "}
              <button
                type="button"
                className="ae-btn ghost"
                onClick={() => setFlags({ _variant: "" })}
              >
                Clear
              </button>
            </p>
          ) : null}
        </div>
      ) : null}

      <InteractionsPanel props={props} onChange={onChange} />

      <FieldBindsPanel
        props={props}
        siteConfig={siteConfig}
        onChange={onChange}
      />
    </div>
  );
}
