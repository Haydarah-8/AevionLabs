"use client";

import { motion } from "framer-motion";

export function LivePulse({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-2.5 rounded-full border border-[#4ea87a]/20 bg-[#4ea87a]/[0.06] px-4 py-2">
      {/* Was bg-zinc-450 — not a real Tailwind step, so the dot rendered with
          no fill at all and the live indicator was invisible. */}
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4ea87a] opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#4ea87a]" />
      </span>
      <span className="text-sm font-medium text-zinc-100 tabular-nums">
        <motion.span
          key={count}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {count}
        </motion.span>
      </span>
      <span className="text-xs text-[#4ea87a]">live</span>
    </div>
  );
}
