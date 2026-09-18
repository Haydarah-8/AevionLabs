"use client";

import { motion } from "framer-motion";
import { PlainHeading } from "@/components/admin/plain";

type HourData = { hour?: string; date: string; visitors: number };

export function HourlyChart({ data }: { data: HourData[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="py-10 text-center text-[0.95rem] text-[#737373]">
        Nothing logged today yet.
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.visitors)) || 1;

  return (
    <div className="flex flex-col bg-transparent border-none p-0">
      <PlainHeading note="Today">Visitors by hour</PlainHeading>

      <div className="flex items-end gap-[3px] flex-1 min-h-[140px] py-1">
        {data.map((d, i) => {
          const pct = Math.max(4, (d.visitors / max) * 100);
          return (
            <div
              key={d.date}
              className="group relative flex-1 flex flex-col items-stretch justify-end h-full"
            >
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.5, delay: i * 0.015, ease: "easeOut" }}
                className="rounded-t-sm bg-[#111]/50 transition-colors group-hover:bg-[#111]"
                style={{ height: `${pct}%`, transformOrigin: "bottom" }}
              />

              {/* Tooltip on hover */}
              <div className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 z-10 rounded-md bg-[#18181f] border border-black/10 px-2 py-1 text-[0.65rem] text-[#111] opacity-0 shadow-lg transition-opacity group-hover:opacity-100 whitespace-nowrap">
                {d.date} — {d.visitors}
              </div>
            </div>
          );
        })}
      </div>

      {/* X labels */}
      <div className="mt-3 flex justify-between text-[0.78rem] text-[#737373]">
        <span>Midnight</span>
        <span>Six</span>
        <span>Noon</span>
        <span>Six</span>
        <span>Midnight</span>
      </div>
    </div>
  );
}
