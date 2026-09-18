"use client";

import { useId } from "react";
import { LEAN_INK } from "@/components/admin/Spectrum";
import { ACCENT } from "@/components/admin/ui";
import { LEAN_LABELS, LEAN_SCALE, type Lean } from "@/lib/news/lean";

/**
 * Chart primitives for the desk.
 *
 * All of them are plain SVG or CSS — no charting library, because every one of
 * these is a few dozen lines and a dependency would cost more than it saves.
 *
 * Two rules hold throughout:
 *
 *   1. Every chart carries its own numbers. A shape the reader cannot resolve
 *      into a value is decoration, so bars, cells and points are all labelled
 *      or titled.
 *   2. Nothing is drawn on an axis that does not start at zero, and no
 *      magnitude is encoded by area. Both flatter small differences into
 *      looking like large ones.
 */

const GRID = "rgba(255,255,255,0.05)";
const MUTED = "#5a5a66";

/* ------------------------------------------------------------------ */
/* Sparkline                                                           */
/* ------------------------------------------------------------------ */

/**
 * Volume over time, drawn small enough to sit inside a row. The filled area is
 * there to make the shape legible at 28px tall, not to encode a second value.
 */
export function Sparkline({
  series,
  width = 120,
  height = 28,
  stroke = ACCENT.base,
  label,
}: {
  series: Array<{ at: number; count: number }>;
  width?: number;
  height?: number;
  stroke?: string;
  label?: string;
}) {
  const gradientId = useId();
  if (series.length < 2) return null;

  const max = Math.max(1, ...series.map((point) => point.count));
  const step = width / (series.length - 1);
  // Baseline sits half a stroke inside the box so a flat zero line is not
  // clipped away to nothing.
  const y = (count: number) => height - 1 - (count / max) * (height - 2);

  const points = series.map((point, index) => [index * step, y(point.count)]);
  const line = points
    .map(([x, py], index) => `${index ? "L" : "M"}${x.toFixed(1)},${py.toFixed(1)}`)
    .join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;

  const total = series.reduce((sum, point) => sum + point.count, 0);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
      role="img"
      aria-label={
        label ?? `${total} articles over ${series.length} intervals, peak ${max}`
      }
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.28} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth={1.25}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Column chart                                                        */
/* ------------------------------------------------------------------ */

/** Publication volume by time bucket, with hover values. */
export function ColumnChart({
  series,
  height = 90,
  fill = ACCENT.base,
  formatLabel,
  onSelect,
}: {
  series: Array<{ at: number; count: number }>;
  height?: number;
  fill?: string;
  formatLabel?: (at: number) => string;
  /** Opens the articles inside one bucket. */
  onSelect?: (point: { at: number; count: number }) => void;
}) {
  const max = Math.max(1, ...series.map((point) => point.count));
  const fmt =
    formatLabel ??
    ((at: number) =>
      new Date(at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }));

  const first = series[0];
  const last = series[series.length - 1];

  return (
    <div>
      <div className="flex items-end gap-[2px]" style={{ height }}>
        {series.map((point) => (
          <div
            key={point.at}
            className="group relative flex-1"
            style={{
              height: "100%",
              cursor: onSelect && point.count ? "pointer" : "default",
            }}
            onClick={
              onSelect && point.count ? () => onSelect(point) : undefined
            }
            role={onSelect && point.count ? "button" : undefined}
            tabIndex={onSelect && point.count ? 0 : undefined}
            onKeyDown={
              onSelect && point.count
                ? (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelect(point);
                    }
                  }
                : undefined
            }
            aria-label={
              onSelect && point.count
                ? point.count + " articles — open detail"
                : undefined
            }
          >
            <div
              className="absolute bottom-0 w-full transition-opacity group-hover:opacity-100"
              style={{
                // A zero bucket still gets a 1px tick, so an empty hour reads
                // as measured-and-empty rather than as missing data.
                height: `${Math.max(1, (point.count / max) * height)}px`,
                backgroundColor: fill,
                opacity: point.count ? 0.55 : 0.18,
              }}
            />
            <div className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-black/10 bg-[#18181f] px-2 py-1 text-[0.78rem] text-[#111] opacity-0 transition-opacity group-hover:opacity-100">
              {point.count} · {fmt(point.at)}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[0.78rem] text-[#a3a3a3]">
        {/* An empty series gets no axis labels rather than a clock reading —
            reading Date.now() here would also make render impure. */}
        <span>{first ? fmt(first.at) : "—"}</span>
        <span>{last ? fmt(last.at) : "—"}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Bar list                                                            */
/* ------------------------------------------------------------------ */

/**
 * Ranked horizontal bars. Bars are scaled against the largest value rather
 * than the total, so the shape of the ranking survives a long tail.
 */
export function BarList({
  rows,
  max,
  onSelect,
}: {
  rows: Array<{ id: string; label: string; value: number; ink?: string; note?: string }>;
  max?: number;
  onSelect?: (id: string) => void;
}) {
  const top = max ?? Math.max(1, ...rows.map((row) => row.value));

  return (
    <ul className="space-y-2.5">
      {rows.map((row) => {
        const inner = (
          <>
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate text-sm text-[#111]">{row.label}</span>
              <span className="shrink-0 text-[0.82rem] tabular-nums text-[#737373]">
                {row.value.toLocaleString()}
                {row.note ? (
                  <span className="ml-2 text-[#a3a3a3]">{row.note}</span>
                ) : null}
              </span>
            </div>
            <div
              className="mt-1.5 h-[3px] w-full"
              style={{ backgroundColor: GRID }}
            >
              <div
                className="h-full"
                style={{
                  width: `${(row.value / top) * 100}%`,
                  backgroundColor: row.ink ?? ACCENT.base,
                }}
              />
            </div>
          </>
        );

        return (
          <li key={row.id}>
            {onSelect ? (
              <button
                type="button"
                onClick={() => onSelect(row.id)}
                className="w-full text-left transition-opacity hover:opacity-75"
              >
                {inner}
              </button>
            ) : (
              inner
            )}
          </li>
        );
      })}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Balance dot plot                                                    */
/* ------------------------------------------------------------------ */

/**
 * Where each subject sits on the −3..+3 lean axis.
 *
 * A dot plot rather than a bar chart because the value is a position on a
 * scale, not a magnitude — a bar would imply the distance from zero is a
 * quantity of something.
 */
export function BalancePlot({
  rows,
  onSelect,
}: {
  rows: Array<{ id: string; label: string; balance: number | null; weight: number }>;
  onSelect?: (id: string) => void;
}) {
  const plotted = rows.filter((row) => row.balance !== null);
  if (!plotted.length) return null;
  const maxWeight = Math.max(1, ...plotted.map((row) => row.weight));

  // −3..+3 mapped onto 0..100%.
  const x = (balance: number) => ((balance + 3) / 6) * 100;

  return (
    <div>
      <div className="relative h-8">
        <div
          className="absolute inset-x-0 top-1/2 h-px"
          style={{ backgroundColor: GRID }}
        />
        {[-3, -2, -1, 0, 1, 2, 3].map((tick) => (
          <div
            key={tick}
            className="absolute top-0 h-full w-px"
            style={{
              left: `${x(tick)}%`,
              backgroundColor: tick === 0 ? "rgba(255,255,255,0.14)" : GRID,
            }}
          />
        ))}
        {plotted.map((row) => {
          const size = 5 + (row.weight / maxWeight) * 7;
          return (
            <button
              key={row.id}
              type="button"
              onClick={onSelect ? () => onSelect(row.id) : undefined}
              title={`${row.label} — ${row.balance!.toFixed(2)} (${row.weight} articles)`}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform hover:scale-125"
              style={{
                left: `${x(row.balance!)}%`,
                width: size,
                height: size,
                backgroundColor: leanInkForBalance(row.balance!),
                cursor: onSelect ? "pointer" : "default",
              }}
            />
          );
        })}
      </div>
      <div className="mt-1 flex justify-between text-[0.78rem] text-[#a3a3a3]">
        <span>← left</span>
        <span>centre</span>
        <span>right →</span>
      </div>
    </div>
  );
}

function leanInkForBalance(balance: number): string {
  if (balance <= -2) return LEAN_INK["far-left"];
  if (balance <= -1) return LEAN_INK.left;
  if (balance < -0.34) return LEAN_INK["centre-left"];
  if (balance <= 0.34) return LEAN_INK.centre;
  if (balance < 1) return LEAN_INK["centre-right"];
  if (balance < 2) return LEAN_INK.right;
  return LEAN_INK["far-right"];
}

/* ------------------------------------------------------------------ */
/* Heatmap                                                             */
/* ------------------------------------------------------------------ */

export type HeatCell = { row: string; col: string; value: number };

/**
 * A subject × spectrum grid: which parts of the press are carrying what.
 *
 * Cells are shaded by share of that row, not by absolute count, so a small
 * domain's distribution is as readable as a large one's. The count is printed
 * in each cell as well — shade alone is not a value anyone can read off.
 */
export function Heatmap({
  rows,
  cols,
  cells,
  colLabel,
  colInk,
  onSelectRow,
  onSelectCol,
  onSelectCell,
}: {
  rows: Array<{ id: string; label: string }>;
  cols: string[];
  cells: HeatCell[];
  colLabel?: (col: string) => string;
  colInk?: (col: string) => string;
  onSelectRow?: (id: string) => void;
  onSelectCol?: (col: string) => void;
  /** Opens the intersection — the articles in one row from one column. */
  onSelectCell?: (row: string, col: string) => void;
}) {
  const lookup = new Map<string, number>();
  for (const cell of cells) lookup.set(`${cell.row}|${cell.col}`, cell.value);

  const rowTotals = new Map<string, number>();
  for (const row of rows) {
    rowTotals.set(
      row.id,
      cols.reduce((sum, col) => sum + (lookup.get(`${row.id}|${col}`) ?? 0), 0),
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-separate border-spacing-0">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-white pb-3 pr-4 text-left text-[0.8rem] text-[#737373]">
              Domain
            </th>
            {cols.map((col) => (
              <th key={col} className="px-1 pb-3 text-center">
                {onSelectCol ? (
                  <button
                    type="button"
                    onClick={() => onSelectCol(col)}
                    className="flex w-full flex-col items-center gap-1 transition-opacity hover:opacity-70"
                  >
                    <span
                      aria-hidden
                      className="h-1 w-5"
                      style={{ backgroundColor: colInk?.(col) ?? MUTED }}
                    />
                    <span className="text-[0.55rem] font-bold text-[#737373]">
                      {colLabel?.(col) ?? col}
                    </span>
                  </button>
                ) : (
                  <span className="flex flex-col items-center gap-1">
                    <span
                      aria-hidden
                      className="h-1 w-5"
                      style={{ backgroundColor: colInk?.(col) ?? MUTED }}
                    />
                    <span className="text-[0.55rem] font-bold text-[#737373]">
                      {colLabel?.(col) ?? col}
                    </span>
                  </span>
                )}
              </th>
            ))}
            <th className="pb-3 pl-3 text-right text-[0.8rem] text-[#737373]">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const total = rowTotals.get(row.id) ?? 0;
            return (
              <tr key={row.id} className="group">
                <td className="sticky left-0 z-10 border-t border-black/[0.06] bg-white py-2.5 pr-4">
                  {onSelectRow ? (
                    <button
                      type="button"
                      onClick={() => onSelectRow(row.id)}
                      className="text-left text-[0.78rem] text-[#111] transition-colors hover:text-black"
                    >
                      {row.label}
                    </button>
                  ) : (
                    <span className="text-[0.78rem] text-[#111]">
                      {row.label}
                    </span>
                  )}
                </td>
                {cols.map((col) => {
                  const value = lookup.get(`${row.id}|${col}`) ?? 0;
                  const share = total ? value / total : 0;
                  return (
                    <td
                      key={col}
                      className="border-t border-black/[0.06] px-1 py-2.5 text-center"
                      title={`${row.label} · ${colLabel?.(col) ?? col}: ${value} (${Math.round(share * 100)}%)`}
                    >
                      {onSelectCell && value ? (
                        <button
                          type="button"
                          onClick={() => onSelectCell(row.id, col)}
                          className="flex h-7 w-full items-center justify-center text-[0.68rem] tabular-nums transition-opacity hover:opacity-70"
                          style={{
                            backgroundColor: withAlpha(
                              colInk?.(col) ?? MUTED,
                              0.12 + share * 0.62,
                            ),
                            color: "#f4f4f5",
                          }}
                          aria-label={`${row.label}, ${colLabel?.(col) ?? col}: ${value} articles — open detail`}
                        >
                          {value}
                        </button>
                      ) : (
                        <span
                          className="flex h-7 items-center justify-center text-[0.68rem] tabular-nums"
                          style={{
                            backgroundColor: value
                              ? withAlpha(colInk?.(col) ?? MUTED, 0.12 + share * 0.62)
                              : "transparent",
                            color: value ? "#f4f4f5" : "#2e2e36",
                          }}
                        >
                          {value || "·"}
                        </span>
                      )}
                    </td>
                  );
                })}
                <td className="border-t border-black/[0.06] py-2.5 pl-3 text-right text-[0.68rem] tabular-nums text-[#737373]">
                  {total}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Hex → rgba, so one palette drives both solid marks and washes. */
function withAlpha(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean.split("").map((c) => c + c).join("")
      : clean;
  const n = Number.parseInt(full, 16);
  if (Number.isNaN(n)) return hex;
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
}

/** The lean columns every heatmap on this desk uses. */
export const LEAN_COLS: Lean[] = [...LEAN_SCALE];
export const leanColLabel = (col: string) => LEAN_LABELS[col as Lean] ?? col;
export const leanColInk = (col: string) => LEAN_INK[col as Lean] ?? MUTED;
