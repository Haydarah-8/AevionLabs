"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

export interface CustomSelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: CustomSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  align?: "left" | "right";
  triggerClassName?: string;
  className?: string;
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  align = "left",
  triggerClassName = "",
  className = "",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const menuVariants: Variants = {
    hidden: {
      opacity: 0,
      y: -8,
      transition: {
        duration: 0.15,
        ease: "easeOut",
      },
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block text-left ${className}`}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`inline-flex items-center justify-between gap-2 focus:outline-none transition-all cursor-pointer ${triggerClassName}`}
      >
        {selectedOption ? selectedOption.label : placeholder}
        <span className="ml-2 text-[0.7rem] opacity-40" aria-hidden>
          ▾
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className={`absolute z-[100] mt-2 max-h-72 w-72 overflow-y-auto rounded-xl bg-zinc-950/95 py-2 text-zinc-300 shadow-2xl backdrop-blur-md dark-scroll border-none focus:outline-none origin-top ${
              align === "right" ? "right-0" : "left-0"
            }`}
          >
            {options.length === 0 ? (
              <div className="px-4 py-3 text-xs text-zinc-600 uppercase tracking-wider font-semibold">
                No Options
              </div>
            ) : (
              options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`block w-full px-5 py-3 text-left text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-white/[0.05] text-white"
                        : "bg-transparent text-zinc-400 hover:bg-white/[0.02] hover:text-white"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
