/**
 * Multi-select foundation for Aevion Studio.
 * Puck still uses a single itemSelector; this set tracks additional targets.
 */

type Listener = (ids: string[]) => void;

const listeners = new Set<Listener>();
let selectedIds: string[] = [];

function emit() {
  const snapshot = [...selectedIds];
  listeners.forEach((listener) => {
    try {
      listener(snapshot);
    } catch {
      /* ignore */
    }
  });
}

export function getStudioSelection(): string[] {
  return [...selectedIds];
}

export function subscribeStudioSelection(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setStudioSelection(ids: string[]) {
  const next = [...new Set(ids.filter(Boolean))];
  if (
    next.length === selectedIds.length &&
    next.every((id, i) => id === selectedIds[i])
  ) {
    return;
  }
  selectedIds = next;
  emit();
}

export function clearStudioSelection() {
  setStudioSelection([]);
}

/** Replace selection with one id (normal click). */
export function selectStudioOnly(id: string) {
  setStudioSelection(id ? [id] : []);
}

/** Toggle id in the multi-select set (Cmd/Ctrl click). */
export function toggleStudioSelection(id: string) {
  if (!id) return;
  if (selectedIds.includes(id)) {
    setStudioSelection(selectedIds.filter((item) => item !== id));
  } else {
    setStudioSelection([...selectedIds, id]);
  }
}

export function isStudioSelected(id: string) {
  return selectedIds.includes(id);
}
