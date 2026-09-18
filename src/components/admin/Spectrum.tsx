"use client";

import { LEAN_LABELS, LEAN_SCALE, LEAN_SHORT, type Lean } from "@/lib/news/lean";

/**
 * A diverging blue–grey–red ramp: the one place in the admin where hue is the
 * data rather than decoration. The previous dark-to-light greyscale put the
 * far left at #3f3f46 against a #0a0a0f page, so the left of every bar was
 * nearly invisible — the ramp is symmetrical now, and both ends read equally.
 *
 * Blue left, red right follows the media-bias convention (AllSides, Ad Fontes)
 * rather than any one country's party colours, which invert between the US and
 * the UK. Saturation is held low to sit inside a deliberately muted interface.
 *
 * Position on the scale is always shown as a written label too — the colour is
 * a shortcut for a reader who already knows the ramp, never the only channel.
 */
export const LEAN_INK: Record<Lean, string> = {
  "far-left": "#3f6fd1",
  left: "#5d8ad9",
  "centre-left": "#8aa9d6",
  centre: "#8b8b96",
  "centre-right": "#d69a9a",
  right: "#d16b6b",
  "far-right": "#c1443f",
  unrated: "#3a3a44",
};

/** State-controlled outlets sit off the left–right scale entirely. */
export const STATE_INK = "#c9963f";

export const ORDER: Lean[] = [...LEAN_SCALE, "unrated"];

export function balanceWord(balance: number | null) {
  if (balance === null) return "unrated";
  if (balance <= -1.5) return "left-dominated";
  if (balance <= -0.5) return "leans left";
  if (balance < 0.5) return "evenly split";
  if (balance < 1.5) return "leans right";
  return "right-dominated";
}

/**
 * A hairline of coverage across the political spectrum. Deliberately thin —
 * it is a rule on the page, not a chart in a box.
 */
export function SpectrumBar({
  counts,
  height = 2,
}: {
  counts: Record<Lean, number>;
  height?: number;
}) {
  const total = ORDER.reduce((sum, lean) => sum + (counts[lean] ?? 0), 0);
  if (!total) return null;
  return (
    <span className="flex w-full overflow-hidden" style={{ height }}>
      {ORDER.map((lean) => {
        const n = counts[lean] ?? 0;
        if (!n) return null;
        return (
          <span
            key={lean}
            style={{
              width: `${(n / total) * 100}%`,
              backgroundColor: LEAN_INK[lean],
            }}
            title={`${LEAN_LABELS[lean]}: ${n}`}
          />
        );
      })}
    </span>
  );
}

/** The scale spelled out, for the one place it needs explaining. */
export function SpectrumKey({ counts }: { counts: Record<Lean, number> }) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      {ORDER.map((lean) => (
        <span key={lean} className="flex items-baseline gap-2">
          <span
            aria-hidden
            className="h-1.5 w-4 shrink-0 translate-y-[-2px]"
            style={{ backgroundColor: LEAN_INK[lean] }}
          />
          <span
            className="text-[0.78rem]"
            style={{ color: counts[lean] ? LEAN_INK[lean] : "#3e3e49" }}
          >
            {LEAN_LABELS[lean]}
          </span>
          <span className="text-[0.58rem] font-bold tabular-nums text-[#737373]">
            {counts[lean] ?? 0}
          </span>
        </span>
      ))}
    </div>
  );
}

/** Per-article lean tag used inline in the stream. */
export function LeanTag({
  lean,
  state,
}: {
  lean: Lean;
  state?: boolean;
}) {
  if (lean === "unrated" && !state) return null;
  const ink = state ? STATE_INK : LEAN_INK[lean];
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span
        aria-hidden
        className="h-1.5 w-1.5 translate-y-[-1px] rounded-full"
        style={{ backgroundColor: ink }}
      />
      <span
        className="text-[0.78rem]"
        style={{ color: ink }}
      >
        {state ? "State" : LEAN_SHORT[lean]}
      </span>
    </span>
  );
}
