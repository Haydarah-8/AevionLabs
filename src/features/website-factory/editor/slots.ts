import { factoryConfig } from "@/features/website-factory/puck/config";

/**
 * Slot formalization — discover Puck `type: "slot"` fields from live config.
 */

export type SlotFieldInfo = {
  componentType: string;
  slotKey: string;
  label: string;
};

function fieldLabel(key: string, field: Record<string, unknown>): string {
  if (typeof field.label === "string" && field.label.trim()) return field.label;
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

export function listSlotFieldsForType(type: string): SlotFieldInfo[] {
  const components = factoryConfig.components as Record<
    string,
    { fields?: Record<string, Record<string, unknown>> }
  >;
  const fields = components[type]?.fields;
  if (!fields) return [];
  return Object.entries(fields)
    .filter(([, field]) => field?.type === "slot")
    .map(([slotKey, field]) => ({
      componentType: type,
      slotKey,
      label: fieldLabel(slotKey, field),
    }));
}

export function isSlotContainer(type: string): boolean {
  return listSlotFieldsForType(type).length > 0;
}

export function listSlotContainers(): Array<{
  type: string;
  slots: SlotFieldInfo[];
}> {
  const components = factoryConfig.components as Record<string, unknown>;
  return Object.keys(components)
    .map((type) => ({ type, slots: listSlotFieldsForType(type) }))
    .filter((item) => item.slots.length > 0)
    .sort((a, b) => a.type.localeCompare(b.type));
}

/**
 * Walk Puck node props and set `_locked` on nested slot children.
 * Slot values in stored data are typically arrays of `{ type, props }`.
 */
export function mapSlotChildren(
  props: Record<string, unknown>,
  slotKeys: string[],
  mapNode: (node: { type: string; props: Record<string, unknown> }) => {
    type: string;
    props: Record<string, unknown>;
  },
): Record<string, unknown> {
  const next = { ...props };
  for (const key of slotKeys) {
    const value = next[key];
    if (!Array.isArray(value)) continue;
    next[key] = value.map((item) => {
      if (!item || typeof item !== "object") return item;
      const node = item as { type?: string; props?: Record<string, unknown> };
      if (typeof node.type !== "string") return item;
      const mapped = mapNode({
        type: node.type,
        props: { ...(node.props || {}) },
      });
      // Recurse into nested slots
      const nestedSlots = listSlotFieldsForType(mapped.type).map(
        (s) => s.slotKey,
      );
      return {
        type: mapped.type,
        props: mapSlotChildren(mapped.props, nestedSlots, mapNode),
      };
    });
  }
  return next;
}

export function setLockedOnSlotTree(
  props: Record<string, unknown>,
  componentType: string,
  locked: boolean,
): Record<string, unknown> {
  const slotKeys = listSlotFieldsForType(componentType).map((s) => s.slotKey);
  return mapSlotChildren(props, slotKeys, (node) => {
    const nextProps = { ...node.props };
    if (locked) nextProps._locked = true;
    else delete nextProps._locked;
    return { type: node.type, props: nextProps };
  });
}
