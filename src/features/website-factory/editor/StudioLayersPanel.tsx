"use client";

import { useEffect, useState } from "react";
import { createUsePuck } from "@puckeditor/core";
import {
  getLayerLabel,
  isLayerHidden,
  isLayerLocked,
  STUDIO_PROP,
} from "@/features/website-factory/editor/studio-props";
import {
  getStudioSelection,
  selectStudioOnly,
  setStudioSelection,
  subscribeStudioSelection,
  toggleStudioSelection,
} from "@/features/website-factory/editor/studio-selection";
import { getAevionComponent } from "@/features/website-factory/registry";

const usePuck = createUsePuck();

type LayerRow = {
  id: string;
  type: string;
  index: number;
  zone: string;
  label: string;
  locked: boolean;
  hidden: boolean;
};

export function StudioLayersPanel({
  onNotice,
}: {
  onNotice?: (message: string) => void;
}) {
  const dispatch = usePuck((s) => s.dispatch);
  const data = usePuck((s) => s.appState.data);
  const itemSelector = usePuck((s) => s.appState.ui?.itemSelector);
  const getSelectorForId = usePuck((s) => s.getSelectorForId);
  const [multi, setMulti] = useState<string[]>(() => getStudioSelection());

  useEffect(() => subscribeStudioSelection(setMulti), []);

  const layers: LayerRow[] = (data.content || []).map((node, index) => {
    const id =
      typeof node.props?.id === "string" && node.props.id
        ? node.props.id
        : `idx-${index}`;
    return {
      id,
      type: node.type,
      index,
      zone: "default-zone",
      label: getLayerLabel(node.type, node.props as Record<string, unknown>),
      locked: isLayerLocked(node.props as Record<string, unknown>),
      hidden: isLayerHidden(node.props as Record<string, unknown>),
    };
  });

  const primaryId =
    itemSelector != null
      ? layers.find(
          (layer) =>
            layer.index === itemSelector.index &&
            (itemSelector.zone || "default-zone") === layer.zone,
        )?.id
      : null;

  // Canvas / Outline selection: keep multi-select in sync when primary leaves the set.
  useEffect(() => {
    if (!primaryId) return;
    const current = getStudioSelection();
    if (current.includes(primaryId)) return;
    selectStudioOnly(primaryId);
  }, [primaryId]);

  function selectLayer(layer: LayerRow, additive: boolean) {
    if (additive) {
      toggleStudioSelection(layer.id);
    } else {
      selectStudioOnly(layer.id);
    }
    const selector = getSelectorForId(layer.id) || {
      index: layer.index,
      zone: layer.zone,
    };
    dispatch({ type: "setUi", ui: { itemSelector: selector } });
  }

  function patchLayer(
    layer: LayerRow,
    patch: Record<string, unknown>,
  ) {
    const node = data.content[layer.index];
    if (!node) return;
    dispatch({
      type: "replace",
      destinationIndex: layer.index,
      destinationZone: layer.zone,
      data: {
        ...node,
        props: {
          ...node.props,
          ...patch,
        },
      },
    });
  }

  function renameLayer(layer: LayerRow) {
    const next = window.prompt("Layer name", layer.label);
    if (next == null) return;
    const trimmed = next.trim();
    patchLayer(layer, {
      [STUDIO_PROP.label]: trimmed || undefined,
    });
    onNotice?.(trimmed ? `Renamed to ${trimmed}` : "Label cleared");
  }

  function moveLayer(layer: LayerRow, delta: number) {
    const destination = layer.index + delta;
    if (destination < 0 || destination >= layers.length) return;
    dispatch({
      type: "reorder",
      sourceIndex: layer.index,
      destinationIndex: destination,
      destinationZone: layer.zone,
    });
  }

  function duplicateLayer(layer: LayerRow) {
    dispatch({
      type: "duplicate",
      sourceIndex: layer.index,
      sourceZone: layer.zone,
    });
    onNotice?.("Layer duplicated");
  }

  function deleteLayer(layer: LayerRow) {
    if (layer.locked) {
      onNotice?.("Unlock the layer before deleting");
      return;
    }
    dispatch({
      type: "remove",
      index: layer.index,
      zone: layer.zone,
    });
    setStudioSelection(multi.filter((id) => id !== layer.id));
    onNotice?.("Layer deleted");
  }

  function deleteSelected() {
    const ids = getStudioSelection();
    if (!ids.length) {
      onNotice?.("Select one or more layers");
      return;
    }
    const doomed = layers
      .filter((layer) => ids.includes(layer.id) && !layer.locked)
      .sort((a, b) => b.index - a.index);
    for (const layer of doomed) {
      dispatch({
        type: "remove",
        index: layer.index,
        zone: layer.zone,
      });
    }
    clearOrRefreshSelection();
    onNotice?.(
      doomed.length
        ? `Deleted ${doomed.length} layer${doomed.length === 1 ? "" : "s"}`
        : "No deletable layers (locked?)",
    );
  }

  function clearOrRefreshSelection() {
    setStudioSelection([]);
    dispatch({ type: "setUi", ui: { itemSelector: null } });
  }

  function hideSelected(hidden: boolean) {
    const ids = new Set(getStudioSelection());
    if (primaryId) ids.add(primaryId);
    layers
      .filter((layer) => ids.has(layer.id))
      .forEach((layer) =>
        patchLayer(layer, {
          [STUDIO_PROP.hidden]: hidden,
        }),
      );
    onNotice?.(hidden ? "Hidden selected" : "Shown selected");
  }

  return (
    <div className="ae-layers">
      <p className="ae-note">
        Click to select · Cmd/Ctrl+click multi-select · Double-click rename.
        Lock and hide persist on the page.
      </p>
      <div className="ae-layers-toolbar">
        <button
          type="button"
          className="ae-btn ghost"
          onClick={() => hideSelected(true)}
        >
          Hide
        </button>
        <button
          type="button"
          className="ae-btn ghost"
          onClick={() => hideSelected(false)}
        >
          Show
        </button>
        <button type="button" className="ae-btn ghost" onClick={deleteSelected}>
          Delete
        </button>
        <button
          type="button"
          className="ae-btn ghost"
          onClick={clearOrRefreshSelection}
        >
          Clear
        </button>
      </div>
      {!layers.length ? (
        <p className="ae-empty-inspector">No layers yet. Add a block.</p>
      ) : (
        <ul className="ae-layers-list">
          {layers.map((layer) => {
            const selected =
              multi.includes(layer.id) || primaryId === layer.id;
            const meta = getAevionComponent(layer.type);
            return (
              <li
                key={layer.id}
                className={`ae-layer-row${selected ? " is-on" : ""}${layer.locked ? " is-locked" : ""}${layer.hidden ? " is-hidden" : ""}`}
              >
                <button
                  type="button"
                  className="ae-layer-main"
                  onClick={(event) =>
                    selectLayer(layer, event.metaKey || event.ctrlKey)
                  }
                  onDoubleClick={() => renameLayer(layer)}
                  title={meta?.description || layer.type}
                >
                  <span className="ae-layer-title">{layer.label}</span>
                  <small>{layer.type}</small>
                </button>
                <div className="ae-layer-actions">
                  <button
                    type="button"
                    className="ae-icon-btn"
                    title="Move up"
                    onClick={() => moveLayer(layer, -1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="ae-icon-btn"
                    title="Move down"
                    onClick={() => moveLayer(layer, 1)}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className={`ae-icon-btn${layer.locked ? " is-on" : ""}`}
                    title={layer.locked ? "Unlock" : "Lock"}
                    onClick={() =>
                      patchLayer(layer, {
                        [STUDIO_PROP.locked]: !layer.locked,
                      })
                    }
                  >
                    {layer.locked ? "🔒" : "🔓"}
                  </button>
                  <button
                    type="button"
                    className={`ae-icon-btn${layer.hidden ? " is-on" : ""}`}
                    title={layer.hidden ? "Show" : "Hide"}
                    onClick={() =>
                      patchLayer(layer, {
                        [STUDIO_PROP.hidden]: !layer.hidden,
                      })
                    }
                  >
                    {layer.hidden ? "◌" : "👁"}
                  </button>
                  <button
                    type="button"
                    className="ae-icon-btn"
                    title="Rename"
                    onClick={() => renameLayer(layer)}
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    className="ae-icon-btn"
                    title="Duplicate"
                    disabled={layer.locked}
                    onClick={() => duplicateLayer(layer)}
                  >
                    ⎘
                  </button>
                  <button
                    type="button"
                    className="ae-icon-btn"
                    title="Delete"
                    disabled={layer.locked}
                    onClick={() => deleteLayer(layer)}
                  >
                    ⌫
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
