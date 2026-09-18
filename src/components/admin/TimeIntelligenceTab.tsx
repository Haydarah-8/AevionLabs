"use client";

import React, { useState } from "react";
import { COUNTRIES, type CountryData } from "./time-intelligence/countriesData";
import { WorldClockView } from "./time-intelligence/WorldClockView";
import { TimeZonesView } from "./time-intelligence/TimeZonesView";

type SubTab = "world-clock" | "time-zones";

export function TimeIntelligenceTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("world-clock");
  const [expandedZoneInTable, setExpandedZoneInTable] = useState<string | null>(
    null,
  );
  const [trackedZones, setTrackedZones] = useState<CountryData[]>(() => {
    if (typeof window === "undefined") return COUNTRIES.slice(0, 5);
    try {
      const stored = window.localStorage.getItem("ewg_tracked_clocks");
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        const matched = parsed
          .map((name) => COUNTRIES.find((c) => c.name === name))
          .filter((c): c is CountryData => !!c);
        if (matched.length > 0) return matched;
      }
    } catch {
      // fallback
    }
    return COUNTRIES.slice(0, 5);
  });

  // Update tracked zones and persist to localStorage
  const updateTrackedZones = (newZones: CountryData[]) => {
    setTrackedZones(newZones);
    try {
      const names = newZones.map((z) => z.name);
      localStorage.setItem("ewg_tracked_clocks", JSON.stringify(names));
    } catch (e) {
      console.error("Failed to save tracked clocks", e);
    }
  };

  const addTrackedZone = (countryName: string) => {
    const country = COUNTRIES.find((c) => c.name === countryName);
    if (!country) return;
    if (trackedZones.some((z) => z.timezone === country.timezone)) return;
    const newZones = [...trackedZones, country];
    updateTrackedZones(newZones);
  };

  const removeTrackedZone = (timezone: string) => {
    const newZones = trackedZones.filter((z) => z.timezone !== timezone);
    updateTrackedZones(newZones);
  };

  return (
    <div className="w-full text-white bg-transparent">
      <style>{`
        /* Smooth transitions */
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out forwards;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Header border-none and styled to blend in */}
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-6">
        <div>
          <h2 className="flex items-center gap-3 text-[1.3rem] font-medium text-white">
            World Time & Country Intelligence
          </h2>
          <p className="mt-1.5 text-[0.88rem] text-white/45">
            Precision geopolitical parameters registry, daylight savings
            tracker, and world clock matrix.
          </p>
        </div>
      </div>

      {/* Sub-tab Navigation (Iconless) */}
      <div className="mb-10 flex flex-wrap items-center gap-1.5 bg-white/[0.01] border border-white/10 p-1.5 w-fit rounded-2xl">
        <SubNavButton
          active={activeSubTab === "world-clock"}
          onClick={() => {
            setActiveSubTab("world-clock");
            setExpandedZoneInTable(null);
          }}
          label="World Clock"
        />
        <SubNavButton
          active={activeSubTab === "time-zones"}
          onClick={() => setActiveSubTab("time-zones")}
          label="Time Zones"
        />
      </div>

      {/* Views Container */}
      <div className="min-h-[550px] bg-transparent">
        {activeSubTab === "world-clock" && (
          <WorldClockView
            trackedZones={trackedZones}
            onAddTrackedZone={addTrackedZone}
            onRemoveTrackedZone={removeTrackedZone}
            onUpdateTrackedZones={updateTrackedZones}
          />
        )}

        {activeSubTab === "time-zones" && (
          <TimeZonesView
            expandedZone={expandedZoneInTable}
            onSetExpandedZone={setExpandedZoneInTable}
          />
        )}
      </div>
    </div>
  );
}

// Sub Nav Item matching visitors tab switcher buttons
function SubNavButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex cursor-pointer items-center gap-2.5 rounded-full px-4 py-2 text-[0.88rem] transition-colors ${
        active
          ? "bg-white text-[#0d1730] border border-transparent"
          : "text-white/50 hover:text-white hover:bg-white/[0.06] border border-transparent"
      }`}
    >
      {label}
    </button>
  );
}
