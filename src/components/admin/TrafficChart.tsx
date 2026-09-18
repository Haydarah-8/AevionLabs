"use client";

import { motion } from "framer-motion";
import { type DailyTraffic } from "@/data/analytics";
import { useState } from "react";

type Metric = "visitors" | "pageViews" | "sessions";
type Range = "24h" | "7d" | "30d";

const metricLabels: Record<Metric, string> = {
  visitors: "Visitors",
  pageViews: "Page Views",
  sessions: "Sessions",
};

/**
 * Three series need three hues. On the old greyscale ramp the sessions line sat
 * at #3e3e49 against a #0a0a0f page and was effectively unreadable; separating
 * by hue rather than by brightness lets all three sit at a legible lightness.
 * Each is also labelled in the legend, so the colours identify rather than
 * carry meaning on their own.
 */
const metricColors: Record<Metric, string> = {
  visitors: "#111111",
  pageViews: "#5d8ad9",
  sessions: "#4ea87a",
};

interface TrafficChartProps {
  dailyData: DailyTraffic[];
  hourlyData: DailyTraffic[];
}

export function TrafficChart({ dailyData, hourlyData }: TrafficChartProps) {
  const [activeMetrics, setActiveMetrics] = useState<Metric[]>(["visitors", "pageViews"]);
  const [range, setRange] = useState<Range>("30d");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // 1. Get raw dataset based on range filter
  let fullDataset: DailyTraffic[] = [];
  if (range === "24h") {
    fullDataset = hourlyData;
  } else if (range === "7d") {
    fullDataset = dailyData.slice(-7);
  } else {
    fullDataset = dailyData;
  }

  // 2. State for brush window indices
  const [prevRange, setPrevRange] = useState(range);
  const [brushStart, setBrushStart] = useState(0);
  const [brushEnd, setBrushEnd] = useState(fullDataset.length - 1);

  if (range !== prevRange) {
    setPrevRange(range);
    setBrushStart(0);
    setBrushEnd(fullDataset.length - 1);
  }

  if (!fullDataset || fullDataset.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-[#737373]">
        No traffic logs available.
      </div>
    );
  }

  // Ensure index boundary safety
  const safeStart = Math.min(Math.max(0, brushStart), fullDataset.length - 2);
  const safeEnd = Math.min(Math.max(safeStart + 1, brushEnd), fullDataset.length - 1);

  // Slice dataset to selection window
  const activeDataset = fullDataset.slice(safeStart, safeEnd + 1);

  // Find max value across active metrics in sliced view to scale Y axis
  let max = 1;
  activeMetrics.forEach((m) => {
    const vals = activeDataset.map((d) => d[m]);
    const mMax = Math.max(...vals);
    if (mMax > max) max = mMax;
  });

  const w = 900;
  const h = 280;
  const padX = 0;
  const padY = 20;
  const chartW = w - padX * 2;
  const chartH = h - padY * 2;

  function buildPath(pts: { x: number; y: number }[]): string {
    if (pts.length < 2) return "";
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cpx = (prev.x + curr.x) / 2;
      d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return d;
  }

  const toggleMetric = (m: Metric) => {
    setActiveMetrics((prev) => {
      if (prev.includes(m)) {
        if (prev.length === 1) return prev;
        return prev.filter((item) => item !== m);
      }
      return [...prev, m];
    });
  };

  // Mini chart paths for brush background selector (aggregate active metrics)
  const miniH = 32;

  return (
    <div className="flex flex-col bg-transparent border-none p-0">
      <style>{`
        input[type=range]::-webkit-slider-thumb {
          pointer-events: auto;
          appearance: none;
          width: 10px;
          height: 40px;
          background: #111111;
          cursor: ew-resize;
          border-radius: 4px;
          border: 1.5px solid #ffffff;
        }
        input[type=range]::-moz-range-thumb {
          pointer-events: auto;
          width: 10px;
          height: 40px;
          background: #111111;
          cursor: ew-resize;
          border-radius: 4px;
          border: 1.5px solid #ffffff;
        }
      `}</style>

      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-[1.05rem] font-medium text-[#111]">Traffic</h3>
          <span className="flex items-center gap-2 text-[0.85rem] text-[#5ac8a8]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#5ac8a8]" />
            Updating live
          </span>
        </div>

        {/* Filters Group (Right Side) */}
        <div className="flex flex-wrap items-center gap-4 self-start md:self-auto">
          {/* Time range switch */}
          <div className="flex rounded-xl bg-white/[0.04] p-1">
            {(["24h", "7d", "30d"] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`rounded-lg px-3 py-1.5 text-[0.88rem] transition-colors ${
                  range === r
                    ? "bg-[#111] font-medium text-white"
                    : "text-[#737373] hover:text-black"
                }`}
              >
                {r === "24h" ? "24 hours" : r === "7d" ? "7 days" : "30 days"}
              </button>
            ))}
          </div>

          {/* Metric switch */}
          <div className="flex rounded-xl bg-white/[0.04] p-1">
            {(Object.keys(metricLabels) as Metric[]).map((m) => {
              const isActive = activeMetrics.includes(m);
              const color = metricColors[m];
              return (
                <button
                  key={m}
                  onClick={() => toggleMetric(m)}
                  className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                    isActive
                      ? "bg-white/[0.08] text-[#111]"
                      : "text-[#737373] hover:text-[#737373]"
                  }`}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: isActive ? color : "#3e3e49" }}
                  />
                  {metricLabels[m]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Chart SVG */}
      <div className="relative">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="w-full overflow-visible"
          preserveAspectRatio="none"
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <defs>
            {activeMetrics.map((m) => (
              <linearGradient id={`grad-${m}-${range}`} x1="0" y1="0" x2="0" y2="1" key={m}>
                <stop offset="0%" stopColor={metricColors[m]} stopOpacity="0.16" />
                <stop offset="100%" stopColor={metricColors[m]} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((frac) => {
            const y = padY + chartH * (1 - frac);
            return (
              <line
                key={frac}
                x1={padX}
                y1={y}
                x2={padX + chartW}
                y2={y}
                stroke="rgba(255,255,255,0.03)"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Render active metric areas and lines */}
          {activeMetrics.map((m) => {
            const values = activeDataset.map((d) => d[m]);
            const points = values.map((v, i) => ({
              x: padX + (i / (values.length - 1)) * chartW,
              y: padY + chartH - (v / max) * chartH,
            }));

            const linePath = buildPath(points);
            const areaPath = points.length >= 2 ? `${linePath} L ${points[points.length - 1].x} ${h} L ${points[0].x} ${h} Z` : "";
            const color = metricColors[m];

            return (
              <g key={m}>
                <motion.path
                  d={areaPath}
                  fill={`url(#grad-${m}-${range})`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                />
                <motion.path
                  d={linePath}
                  fill="none"
                  stroke={color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6 }}
                />
              </g>
            );
          })}

          {/* Hover bounds selector */}
          {activeDataset.map((_, i) => {
            const stepW = chartW / (activeDataset.length - 1);
            const x = padX + i * stepW;
            return (
              <rect
                key={i}
                x={x - stepW / 2}
                y={0}
                width={stepW}
                height={h}
                fill="transparent"
                onMouseEnter={() => setHoveredIdx(i)}
              />
            );
          })}

          {/* Vertical alignment line on hover */}
          {hoveredIdx !== null && activeDataset.length >= 2 && (
            <line
              x1={padX + (hoveredIdx / (activeDataset.length - 1)) * chartW}
              y1={padY}
              x2={padX + (hoveredIdx / (activeDataset.length - 1)) * chartW}
              y2={h}
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray="3 3"
            />
          )}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIdx !== null && activeDataset[hoveredIdx] && (
          <div
            className="pointer-events-none absolute rounded-xl bg-[#121218] border border-black/10 p-4 text-xs shadow-2xl z-20 w-52"
            style={{
              left: `${Math.min(85, Math.max(15, (hoveredIdx / (activeDataset.length - 1)) * 100))}%`,
              top: `10%`,
              transform: "translateX(-50%)",
            }}
          >
            <div className="mb-2 text-[0.82rem] text-[#737373]">
              {activeDataset[hoveredIdx].date}
            </div>
            <div className="space-y-2">
              {activeMetrics.map((m) => (
                <div key={m} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-[#737373] text-xs">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: metricColors[m] }} />
                    {metricLabels[m]}
                  </span>
                  <span className="text-[0.85rem] font-medium tabular-nums text-[#111]">
                    {activeDataset[hoveredIdx][m].toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Axis labels */}
      <div className="mt-3 flex justify-between px-0 text-[0.8rem] text-[#737373]">
        <span>{activeDataset[0]?.date}</span>
        <span>{activeDataset[Math.floor(activeDataset.length / 2)]?.date}</span>
        <span>{activeDataset[activeDataset.length - 1]?.date}</span>
      </div>

      {/* ── Interactive Timeline Slider (Brush) at bottom ── */}
      <div className="mt-6 border-t border-white/[0.02] pt-6">
        <div className="mb-2 text-[0.85rem] text-[#737373]">
          Drag either end to narrow the range
        </div>
        <div className="relative h-10 w-full rounded-xl bg-white/[0.01] border border-black/10 overflow-hidden">
          {/* Mini Wave SVG background of active metric paths */}
          <svg className="absolute inset-0 h-full w-full opacity-5 pointer-events-none" preserveAspectRatio="none">
            {activeMetrics.map((m) => {
              const miniValues = fullDataset.map((d) => d[m]);
              const miniMax = Math.max(...miniValues) || 1;
              const miniMin = Math.min(...miniValues);
              const miniYRange = miniMax - miniMin || 1;
              const miniPoints = miniValues.map((v, i) => ({
                x: (i / (miniValues.length - 1)) * 900,
                y: 2 + miniH - 4 - ((v - miniMin) / miniYRange) * (miniH - 4),
              }));
              const miniPath = buildPath(miniPoints);

              return (
                <path
                  key={m}
                  d={miniPath}
                  fill="none"
                  stroke={metricColors[m]}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              );
            })}
          </svg>

          {/* Selection zone highlights */}
          <div
            className="absolute top-0 bottom-0 bg-white/[0.04] border-l border-r border-white/[0.12]"
            style={{
              left: `${(safeStart / (fullDataset.length - 1)) * 100}%`,
              right: `${100 - (safeEnd / (fullDataset.length - 1)) * 100}%`,
            }}
          />

          {/* Layered brush inputs */}
          <input
            type="range"
            min={0}
            max={fullDataset.length - 1}
            value={safeStart}
            onChange={(e) => setBrushStart(Math.min(Number(e.target.value), safeEnd - 1))}
            className="absolute inset-0 w-full h-full appearance-none bg-transparent pointer-events-none focus:outline-none z-10"
          />
          <input
            type="range"
            min={0}
            max={fullDataset.length - 1}
            value={safeEnd}
            onChange={(e) => setBrushEnd(Math.max(Number(e.target.value), safeStart + 1))}
            className="absolute inset-0 w-full h-full appearance-none bg-transparent pointer-events-none focus:outline-none z-20"
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[0.8rem] text-[#737373]">
          <span>{fullDataset[0].date}</span>
          <span>{fullDataset.length} intervals</span>
          <span>{fullDataset[fullDataset.length - 1].date}</span>
        </div>
      </div>
    </div>
  );
}
