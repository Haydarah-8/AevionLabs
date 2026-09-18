"use client";

import { motion } from "framer-motion";
import { PlainHeading, PlainRow } from "@/components/admin/plain";
import { type CountryStat, type DeviceStat } from "@/data/analytics";

/* ── Country list ── */
export function GeoBreakdown({ countries }: { countries: CountryStat[] }) {
  if (!countries || countries.length === 0) {
    return (
      <div className="py-10 text-center text-[0.95rem] text-[#737373]">
        No countries recorded yet.
      </div>
    );
  }

  return (
    <div>
      <PlainHeading note={`${countries.length} countries`}>
        Top countries
      </PlainHeading>
      <ul>
        {countries.map((c) => (
          <PlainRow
            key={c.code}
            primary={c.country}
            secondary={c.code}
            value={`${c.visitors.toLocaleString()} · ${c.percentage}%`}
            bar={c.percentage / 100}
          />
        ))}
      </ul>
    </div>
  );
}

/* ── Device ring chart ── */
export function DeviceBreakdown({ devices }: { devices: DeviceStat[] }) {
  if (!devices || devices.length === 0) {
    return (
      <div className="py-10 text-center text-[0.95rem] text-[#737373]">
        No devices recorded yet.
      </div>
    );
  }

  const colors = ["#111111", "#737373", "#c4c4c4"];
  const size = 140;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const segments = devices.map((d, i) => {
    const len = (d.percentage / 100) * circumference;
    const gap = 4;
    const segmentOffset = devices.slice(0, i).reduce((sum, prevDevice) => {
      return sum + (prevDevice.percentage / 100) * circumference;
    }, 0);
    return {
      ...d,
      color: colors[i],
      dasharray: `${len - gap} ${circumference - len + gap}`,
      offset: segmentOffset
    };
  });

  return (
    <div>
      <PlainHeading>Devices</PlainHeading>

      <div className="flex items-center justify-center gap-8 py-2">
        <svg width={size} height={size} className="shrink-0 -rotate-90">
          {segments.map((s) => (
            <motion.circle
              key={s.device}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={s.dasharray}
              strokeDashoffset={-s.offset}
              strokeLinecap="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          ))}
        </svg>

        <div className="space-y-3">
          {segments.map((s) => (
            <div key={s.device} className="flex items-center gap-2.5 text-sm">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-[#737373]">{s.device}</span>
              <span className="tabular-nums font-medium text-[#111]">
                {s.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
