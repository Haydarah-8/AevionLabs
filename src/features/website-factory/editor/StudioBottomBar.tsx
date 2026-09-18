"use client";

import {
  Activity,
  Boxes,
  Clock3,
  Globe,
  Image as ImageIcon,
  Layers,
  Sparkles,
} from "lucide-react";

export type BottomUtility =
  | "ai"
  | "assets"
  | "layers"
  | "history"
  | "health"
  | "deploy";

const ITEMS: Array<{
  id: BottomUtility;
  label: string;
  Icon: typeof Sparkles;
}> = [
  { id: "ai", label: "AI", Icon: Sparkles },
  { id: "assets", label: "Assets", Icon: ImageIcon },
  { id: "layers", label: "Layers", Icon: Layers },
  { id: "history", label: "History", Icon: Clock3 },
  { id: "health", label: "Health", Icon: Activity },
  { id: "deploy", label: "Deploy", Icon: Globe },
];

export function StudioBottomBar({
  active,
  onSelect,
  onOpenComponents,
}: {
  active?: BottomUtility | null;
  onSelect: (id: BottomUtility) => void;
  onOpenComponents?: () => void;
}) {
  return (
    <footer className="ae-bottom" role="toolbar" aria-label="Studio utilities">
      {ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`ae-bottom-btn${active === item.id ? " is-on" : ""}`}
          onClick={() => onSelect(item.id)}
        >
          <item.Icon size={14} />
          {item.label}
        </button>
      ))}
      {onOpenComponents ? (
        <button
          type="button"
          className="ae-bottom-btn"
          onClick={onOpenComponents}
        >
          <Boxes size={14} />
          Components
        </button>
      ) : null}
      <span className="ae-bottom-space" />
      <span className="ae-bottom-hint">⌘/Ctrl+K commands · ? shortcuts</span>
    </footer>
  );
}
