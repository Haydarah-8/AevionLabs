"use client";

import { useMemo } from "react";
import { ACCENT } from "@/components/admin/ui";

/**
 * The less common chart types.
 *
 * Each one exists because a bar chart genuinely could not answer the question:
 * a radial clock shows a cycle, an arc diagram shows which things co-occur,
 * and a waffle asks the eye to count rather than to compare angles. Where a
 * bar would do, the plain primitives in charts.tsx are used instead.
 *
 * The rules from charts.tsx still hold — every mark carries its number, and
 * magnitude is encoded by length or position rather than by area. The radial
 * clock is the one partial exception and says so at its definition.
 */

const GRID = "rgba(255,255,255,0.05)";

/* ------------------------------------------------------------------ */
/* Radial clock                                                        */
/* ------------------------------------------------------------------ */

/**
 * Volume around the 24-hour clock.
 *
 * A cycle belongs on a circle: the gap between 23:00 and 01:00 is one hour,
 * and a bar chart draws it as the full width of the page. This is the one
 * chart here where the eye can be misled — a wedge further from the centre
 * covers more area for the same value — so the radius is strictly linear in
 * the value, the peak hour is labelled, and every wedge carries its count in
 * the tooltip.
 */
export function RadialClock({
  hours,
  size = 260,
  label,
}: {
  /** Exactly 24 counts, index 0 = 00:00. The caller decides the timezone. */
  hours: number[];
  size?: number;
  label?: string;
}) {
  const max = Math.max(1, ...hours);
  const cx = size / 2;
  const cy = size / 2;
  const inner = size * 0.17;
  const outer = size * 0.46;

  const peak = hours.indexOf(max);
  const total = hours.reduce((sum, n) => sum + n, 0);

  const wedge = (index: number, value: number) => {
    const start = (index / 24) * Math.PI * 2 - Math.PI / 2;
    const end = ((index + 0.86) / 24) * Math.PI * 2 - Math.PI / 2;
    const r = inner + (value / max) * (outer - inner);
    const x1 = cx + Math.cos(start) * inner;
    const y1 = cy + Math.sin(start) * inner;
    const x2 = cx + Math.cos(start) * r;
    const y2 = cy + Math.sin(start) * r;
    const x3 = cx + Math.cos(end) * r;
    const y3 = cy + Math.sin(end) * r;
    const x4 = cx + Math.cos(end) * inner;
    const y4 = cy + Math.sin(end) * inner;
    return `M${x1},${y1} L${x2},${y2} A${r},${r} 0 0 1 ${x3},${y3} L${x4},${y4} A${inner},${inner} 0 0 0 ${x1},${y1} Z`;
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={
        label ??
        `${total} articles by hour of day, busiest at ${String(peak).padStart(2, "0")}:00`
      }
    >
      {[0.25, 0.5, 0.75, 1].map((ring) => (
        <circle
          key={ring}
          cx={cx}
          cy={cy}
          r={inner + ring * (outer - inner)}
          fill="none"
          stroke={GRID}
        />
      ))}

      {hours.map((value, index) => (
        <path
          key={index}
          d={wedge(index, value)}
          fill={index === peak ? ACCENT.bright : ACCENT.base}
          opacity={value ? (index === peak ? 0.95 : 0.55) : 0.12}
        >
          <title>{`${String(index).padStart(2, "0")}:00 — ${value} articles`}</title>
        </path>
      ))}

      {[0, 6, 12, 18].map((hour) => {
        const angle = (hour / 24) * Math.PI * 2 - Math.PI / 2;
        return (
          <text
            key={hour}
            x={cx + Math.cos(angle) * (outer + 12)}
            y={cy + Math.sin(angle) * (outer + 12)}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fill="#8b8b96"
          >
            {String(hour).padStart(2, "0")}
          </text>
        );
      })}

      <text
        x={cx}
        y={cy - 5}
        textAnchor="middle"
        fontSize="16"
        fontWeight="500"
        fill="#f4f4f5"
      >
        {String(peak).padStart(2, "0")}
      </text>
      <text
        x={cx}
        y={cy + 8}
        textAnchor="middle"
        fontSize="9"
        fill="#8b8b96"
      >
        peak
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Arc diagram                                                         */
/* ------------------------------------------------------------------ */

export type ArcNode = { id: string; label: string; value: number; ink?: string };
export type ArcLink = { source: string; target: string; value: number };

/**
 * Who co-occurs with whom.
 *
 * An arc diagram rather than a force-directed graph: node order is fixed and
 * meaningful (here, position on the political scale), so the same data always
 * draws the same picture. A force layout looks more impressive and is worse —
 * it settles somewhere different on every render, and the distance between two
 * nodes carries no meaning at all.
 */
export function ArcDiagram({
  nodes,
  links,
  width = 720,
  height = 190,
  onSelect,
}: {
  nodes: ArcNode[];
  links: ArcLink[];
  width?: number;
  height?: number;
  onSelect?: (id: string) => void;
}) {
  const positions = useMemo(() => {
    const map = new Map<string, number>();
    const span = width - 60;
    nodes.forEach((node, index) => {
      const x =
        nodes.length === 1
          ? width / 2
          : 30 + (index / (nodes.length - 1)) * span;
      map.set(node.id, x);
    });
    return map;
  }, [nodes, width]);

  if (!nodes.length) return null;

  const baseline = height - 42;
  const maxLink = Math.max(1, ...links.map((l) => l.value));
  const maxNode = Math.max(1, ...nodes.map((n) => n.value));

  return (
    <div className="overflow-x-auto">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="min-w-[600px]"
        role="img"
        aria-label={`${nodes.length} outlets, ${links.length} shared-story links`}
      >
        <line
          x1={20}
          y1={baseline}
          x2={width - 20}
          y2={baseline}
          stroke={GRID}
        />

        {links.map((link) => {
          const x1 = positions.get(link.source);
          const x2 = positions.get(link.target);
          if (x1 === undefined || x2 === undefined) return null;
          const gap = Math.abs(x2 - x1);
          // Semicircle above the axis; taller arcs simply mean further apart.
          const r = gap / 2;
          const mid = (x1 + x2) / 2;
          const lift = Math.min(r, baseline - 12);
          return (
            <path
              key={`${link.source}-${link.target}`}
              d={`M${x1},${baseline} Q${mid},${baseline - lift * 1.6} ${x2},${baseline}`}
              fill="none"
              stroke={ACCENT.base}
              strokeWidth={0.6 + (link.value / maxLink) * 2.6}
              opacity={0.18 + (link.value / maxLink) * 0.5}
            >
              <title>{`${link.source} and ${link.target} — ${link.value} shared stories`}</title>
            </path>
          );
        })}

        {nodes.map((node) => {
          const x = positions.get(node.id) ?? 0;
          const r = 2.5 + (node.value / maxNode) * 4.5;
          return (
            <g
              key={node.id}
              style={{ cursor: onSelect ? "pointer" : "default" }}
              onClick={onSelect ? () => onSelect(node.id) : undefined}
            >
              <circle
                cx={x}
                cy={baseline}
                r={r}
                fill={node.ink ?? ACCENT.base}
              >
                <title>{`${node.label} — ${node.value} stories`}</title>
              </circle>
              <text
                x={x}
                y={baseline + 14}
                transform={`rotate(38 ${x} ${baseline + 14})`}
                fontSize="9.5"
                fill="#8b8b96"
              >
                {node.label.length > 16
                  ? `${node.label.slice(0, 15)}…`
                  : node.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Waffle                                                              */
/* ------------------------------------------------------------------ */

export type WaffleSlice = { id: string; label: string; value: number; ink: string };

/**
 * Composition as counted squares.
 *
 * A pie chart asks the eye to compare angles, which it does badly. A waffle
 * asks it to count, which it does well — and the count is the actual quantity
 * rather than a proportion of an unstated whole.
 */
export function WaffleChart({
  slices,
  columns = 25,
  cells = 100,
  onSelect,
}: {
  slices: WaffleSlice[];
  columns?: number;
  cells?: number;
  onSelect?: (id: string) => void;
}) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  if (!total) return null;

  // Largest-remainder allocation, so the squares always sum to `cells` rather
  // than drifting one or two short from rounding each slice independently.
  const exact = slices.map((s) => (s.value / total) * cells);
  const base = exact.map((n) => Math.floor(n));
  let left = cells - base.reduce((a, b) => a + b, 0);
  const order = exact
    .map((n, i) => ({ i, frac: n - Math.floor(n) }))
    .sort((a, b) => b.frac - a.frac);
  for (const { i } of order) {
    if (left <= 0) break;
    base[i] += 1;
    left -= 1;
  }

  const squares: Array<{ ink: string; id: string; label: string }> = [];
  slices.forEach((slice, i) => {
    for (let n = 0; n < base[i]; n += 1) {
      squares.push({ ink: slice.ink, id: slice.id, label: slice.label });
    }
  });

  return (
    <div>
      <div
        className="grid gap-[3px]"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {squares.map((square, index) => (
          <span
            key={index}
            title={`${square.label} — ${Math.round((base[slices.findIndex((s) => s.id === square.id)] / cells) * 100)}%`}
            onClick={onSelect ? () => onSelect(square.id) : undefined}
            className="aspect-square w-full"
            style={{
              backgroundColor: square.ink,
              cursor: onSelect ? "pointer" : "default",
            }}
          />
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
        {slices.map((slice, i) => (
          <span key={slice.id} className="flex items-baseline gap-2">
            <span
              aria-hidden
              className="h-2 w-2 shrink-0 translate-y-[-1px]"
              style={{ backgroundColor: slice.ink }}
            />
            <span className="text-[0.62rem] text-[#737373]">
              {slice.label}
            </span>
            <span className="text-[0.78rem] text-[#737373]">
              {slice.value}
            </span>
            <span className="text-[0.78rem] text-[#a3a3a3]">
              {base[i]}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
