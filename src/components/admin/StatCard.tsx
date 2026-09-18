"use client";

import { motion } from "framer-motion";
import { STATUS } from "@/components/admin/ui";

export function StatCard({
  label,
  value,
  change,
  delay = 0,
}: {
  label: string;
  value: string | number;
  change?: number;
  delay?: number;
}) {
  const isPositive = change !== undefined && change >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className="flex flex-col bg-transparent border-none p-0"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[0.8rem] text-[#737373]">
          {label}
        </span>
      </div>

      <div className="text-[1.6rem] font-medium leading-none tabular-nums text-[#111] sm:text-[1.9rem]">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>

      {change !== undefined && (
        <div className="mt-2.5 flex items-center gap-1.5 text-[0.82rem]">
          {/* The arrow carries direction on its own; colour only reinforces it. */}
          <span style={{ color: isPositive ? STATUS.live : STATUS.fail }}>
            {isPositive ? "↑" : "↓"} {Math.abs(change)}%
          </span>
          <span className="text-[#a3a3a3]">vs last 30d</span>
        </div>
      )}
    </motion.div>
  );
}
