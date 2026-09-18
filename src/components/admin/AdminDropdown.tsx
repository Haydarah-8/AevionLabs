"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";

const menuVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.15, ease: "easeOut" },
  },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
};

export const adminSelectTrigger =
  "min-w-[12rem] rounded-xl border border-black/10 bg-white/[0.03] px-4 py-2.5 text-[0.8rem] text-[#111] hover:border-white/[0.14]";

export function AdminDropdown({
  label,
  children,
  align = "left",
}: {
  label: string;
  children: ReactNode;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`inline-flex items-center justify-between gap-2 ${adminSelectTrigger}`}
      >
        {label}
        <span className="text-[0.7rem] opacity-40" aria-hidden>
          ▾
        </span>
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className={`absolute z-[100] mt-2 max-h-80 w-72 overflow-y-auto rounded-xl border border-black/10 bg-[#0c0c12]/95 py-2 shadow-2xl backdrop-blur-md ${
              align === "right" ? "right-0" : "left-0"
            }`}
          >
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
