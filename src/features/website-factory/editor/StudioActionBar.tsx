"use client";

import { ActionBar, createUsePuck } from "@puckeditor/core";
import type { ReactNode } from "react";

const usePuck = createUsePuck();

type StyleBox = Record<string, string>;

let styleClipboard: StyleBox | null = null;

export function getStyleClipboard() {
  return styleClipboard;
}

export function setStyleClipboard(styles: StyleBox | null) {
  styleClipboard = styles;
}

/**
 * Vvveb-style mini advanced toolbar shown on hover / selection of any block.
 */
export function StudioActionBar({
  children,
  label,
  parentAction,
}: {
  children: ReactNode;
  label?: string;
  parentAction?: ReactNode;
}) {
  const dispatch = usePuck((s) => s.dispatch);
  const selectedItem = usePuck((s) => s.selectedItem);
  const itemSelector = usePuck((s) => s.appState.ui?.itemSelector);
  const getSelectorForId = usePuck((s) => s.getSelectorForId);
  const getParentById = usePuck((s) => s.getParentById);

  const id =
    selectedItem && typeof selectedItem.props?.id === "string"
      ? (selectedItem.props.id as string)
      : null;

  function patchStyles(patch: StyleBox) {
    if (!selectedItem || !itemSelector) return;
    const current =
      ((selectedItem.props as { styles?: StyleBox }).styles as StyleBox) || {};
    dispatch({
      type: "replace",
      destinationIndex: itemSelector.index,
      destinationZone: itemSelector.zone || "default-zone",
      data: {
        ...selectedItem,
        props: {
          ...selectedItem.props,
          styles: { ...current, ...patch },
        },
      },
    });
  }

  function patchProp(key: string, value: unknown) {
    if (!selectedItem || !itemSelector) return;
    dispatch({
      type: "replace",
      destinationIndex: itemSelector.index,
      destinationZone: itemSelector.zone || "default-zone",
      data: {
        ...selectedItem,
        props: { ...selectedItem.props, [key]: value },
      },
    });
  }

  function move(delta: number) {
    if (!itemSelector) return;
    const next = itemSelector.index + delta;
    if (next < 0) return;
    dispatch({
      type: "reorder",
      sourceIndex: itemSelector.index,
      destinationIndex: next,
      destinationZone: itemSelector.zone || "default-zone",
    });
  }

  function selectParent() {
    if (!id) return;
    const parent = getParentById(id);
    const parentId =
      parent && typeof parent.props?.id === "string"
        ? (parent.props.id as string)
        : null;
    if (!parentId) return;
    const selector = getSelectorForId(parentId);
    if (!selector) return;
    dispatch({ type: "setUi", ui: { itemSelector: selector } });
  }

  const locked = Boolean(
    (selectedItem?.props as { _locked?: boolean } | undefined)?._locked,
  );
  const hidden = Boolean(
    (selectedItem?.props as { _hidden?: boolean } | undefined)?._hidden,
  );

  return (
    <ActionBar label={label || "Block"}>
      <ActionBar.Group>
        {parentAction}
        {label ? <ActionBar.Label label={label} /> : null}
      </ActionBar.Group>

      <ActionBar.Group>
        <ActionBar.Action label="Drag handle" onClick={() => undefined}>
          ⠿
        </ActionBar.Action>
        <ActionBar.Action label="Move up" onClick={() => move(-1)}>
          ↑
        </ActionBar.Action>
        <ActionBar.Action label="Move down" onClick={() => move(1)}>
          ↓
        </ActionBar.Action>
      </ActionBar.Group>

      <ActionBar.Group>{children}</ActionBar.Group>

      <ActionBar.Group>
        <ActionBar.Action label="Select parent" onClick={selectParent}>
          ⬆
        </ActionBar.Action>
        <ActionBar.Action
          label={locked ? "Unlock" : "Lock"}
          active={locked}
          onClick={() => patchProp("_locked", !locked)}
        >
          {locked ? "🔓" : "🔒"}
        </ActionBar.Action>
        <ActionBar.Action
          label={hidden ? "Show" : "Hide"}
          active={hidden}
          onClick={() => patchProp("_hidden", !hidden)}
        >
          {hidden ? "👁" : "◌"}
        </ActionBar.Action>
      </ActionBar.Group>

      <ActionBar.Group>
        <ActionBar.Action
          label="Align left"
          onClick={() => patchStyles({ textAlign: "left" })}
        >
          ⬅
        </ActionBar.Action>
        <ActionBar.Action
          label="Align center"
          onClick={() => patchStyles({ textAlign: "center" })}
        >
          ↔
        </ActionBar.Action>
        <ActionBar.Action
          label="Align right"
          onClick={() => patchStyles({ textAlign: "right" })}
        >
          ➡
        </ActionBar.Action>
        <ActionBar.Action
          label="Full width"
          onClick={() => patchStyles({ width: "100%", maxWidth: "100%" })}
        >
          ⟺
        </ActionBar.Action>
      </ActionBar.Group>

      <ActionBar.Group>
        <ActionBar.Action
          label="Copy styles"
          onClick={() => {
            const styles =
              ((selectedItem?.props as { styles?: StyleBox })?.styles as
                | StyleBox
                | undefined) || {};
            setStyleClipboard({ ...styles });
          }}
        >
          ⎘
        </ActionBar.Action>
        <ActionBar.Action
          label="Paste styles"
          onClick={() => {
            const clip = getStyleClipboard();
            if (clip) patchStyles(clip);
          }}
        >
          ⎗
        </ActionBar.Action>
        <ActionBar.Action
          label="Clear styles"
          onClick={() => {
            if (!selectedItem || !itemSelector) return;
            dispatch({
              type: "replace",
              destinationIndex: itemSelector.index,
              destinationZone: itemSelector.zone || "default-zone",
              data: {
                ...selectedItem,
                props: { ...selectedItem.props, styles: {} },
              },
            });
          }}
        >
          ✕
        </ActionBar.Action>
      </ActionBar.Group>

      <ActionBar.Group>
        <ActionBar.Action
          label="Pad +"
          onClick={() =>
            patchStyles({
              paddingTop: "32",
              paddingBottom: "32",
              paddingLeft: "24",
              paddingRight: "24",
            })
          }
        >
          ▢+
        </ActionBar.Action>
        <ActionBar.Action
          label="Pad −"
          onClick={() =>
            patchStyles({
              paddingTop: "8",
              paddingBottom: "8",
              paddingLeft: "8",
              paddingRight: "8",
            })
          }
        >
          ▢−
        </ActionBar.Action>
        <ActionBar.Action
          label="Shadow"
          onClick={() => patchStyles({ shadow: "md" })}
        >
          ☁
        </ActionBar.Action>
        <ActionBar.Action
          label="Radius"
          onClick={() => patchStyles({ radius: "12px" })}
        >
          ◜
        </ActionBar.Action>
      </ActionBar.Group>
    </ActionBar>
  );
}

export function StudioComponentOverlay({
  children,
  hover,
  isSelected,
  componentType,
}: {
  children: ReactNode;
  hover: boolean;
  isSelected: boolean;
  componentId: string;
  componentType: string;
}) {
  return (
    <div
      className={`ae-overlay${hover ? " is-hover" : ""}${isSelected ? " is-selected" : ""}`}
      data-ae-type={componentType}
    >
      {(hover || isSelected) && (
        <span className="ae-overlay-tag">{componentType}</span>
      )}
      {children}
    </div>
  );
}
