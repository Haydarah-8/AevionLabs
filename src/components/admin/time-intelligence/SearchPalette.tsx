"use client";

import React, { useState, useEffect, useRef } from "react";
import { COUNTRIES, type CountryData } from "./countriesData";

interface SearchPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCountry: (country: CountryData) => void;
  onTrackTimezone: (country: CountryData) => void;
}

export function SearchPalette({
  isOpen,
  onClose,
  onSelectCountry,
  onTrackTimezone,
}: SearchPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset query and index when isOpen changes using render-time check
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setQuery("");
      setActiveIndex(0);
    }
  }

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Key shortcuts
  const filtered = React.useMemo(() => {
    if (!query) return COUNTRIES.slice(0, 8);
    const q = query.toLowerCase();
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.officialName.toLowerCase().includes(q) ||
        c.capital.toLowerCase().includes(q) ||
        c.timezone.toLowerCase().includes(q) ||
        c.iso.toLowerCase().includes(q)
    );
  }, [query]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[activeIndex]) {
          if (e.shiftKey) {
            onTrackTimezone(filtered[activeIndex]);
          } else {
            onSelectCountry(filtered[activeIndex]);
          }
          onClose();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filtered, activeIndex, onSelectCountry, onTrackTimezone, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-[15vh] px-4 backdrop-blur-xs">
      <div
        ref={containerRef}
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl transition-all"
      >
        {/* Search Input */}
        <div className="relative flex items-center border-b border-zinc-900 px-4">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search countries, capitals, timezones, or ISO codes..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            className="w-full bg-transparent py-4 pl-1.5 pr-4 text-sm text-zinc-100 placeholder-zinc-500 outline-none"
          />
          <div className="flex items-center gap-1 text-[0.65rem] text-zinc-600 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-md font-mono shrink-0">
            <span>ESC</span>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-[360px] overflow-y-auto p-2 dark-scroll space-y-1">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-zinc-500">
              <span className="text-xl">⚠️</span>
              <p className="mt-2 text-xs font-semibold">No countries or timezones matched &quot;{query}&quot;</p>
            </div>
          ) : (
            filtered.map((c, idx) => {
              const isSelected = activeIndex === idx;
              return (
                <div
                  key={c.name}
                  onClick={() => {
                    onSelectCountry(c);
                    onClose();
                  }}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-3 cursor-pointer transition-all ${
                    isSelected
                      ? "bg-zinc-900/60 border border-zinc-800 text-zinc-100"
                      : "border border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/20"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="truncate pl-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-zinc-200">{c.name}</span>
                        <span className="text-[0.65rem] text-zinc-500 font-mono">({c.capital})</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[0.65rem] text-zinc-500">
                        <span>
                          {c.timezone}
                        </span>
                        <span>•</span>
                        <span>
                          {c.continent}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions badge */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isSelected && (
                      <div className="hidden sm:flex items-center gap-1 text-[0.55rem] text-zinc-500 font-mono">
                        <kbd className="bg-zinc-800 border border-zinc-700 px-1 py-0.5 rounded">Enter</kbd>
                        <span>to inspect</span>
                        <span className="mx-0.5">|</span>
                        <kbd className="bg-zinc-800 border border-zinc-700 px-1 py-0.5 rounded">Shift+Enter</kbd>
                        <span>to track</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTrackTimezone(c);
                        onClose();
                      }}
                      className="text-[0.65rem] font-bold bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 text-zinc-300 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
                    >
                      Track Clock
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="flex items-center justify-between border-t border-zinc-900 bg-zinc-950 px-4 py-2.5 text-[0.6rem] text-zinc-500">
          <div className="flex items-center gap-3">
            <span>
              Use Arrow keys to navigate
            </span>
          </div>
          <div>
            <span>Global search palette</span>
          </div>
        </div>
      </div>
    </div>
  );
}
