"use client";

import React, { useState, useEffect, useMemo } from "react";
import { COUNTRIES, type CountryData } from "./countriesData";
import { CustomSelect } from "@/components/ui/CustomSelect";

interface WorldClockViewProps {
  trackedZones: CountryData[];
  onAddTrackedZone: (countryName: string) => void;
  onRemoveTrackedZone: (timezone: string) => void;
  onUpdateTrackedZones: (zones: CountryData[]) => void;
}

export function WorldClockView({
  trackedZones,
  onAddTrackedZone,
  onRemoveTrackedZone,
  onUpdateTrackedZones,
}: WorldClockViewProps) {
  const [time, setTime] = useState(new Date());
  const [showSeconds, setShowSeconds] = useState(true);
  const [showMilliseconds, setShowMilliseconds] = useState(false);
  const [use24Hour, setUse24Hour] = useState(true);

  const countryOptions = useMemo(() => {
    return COUNTRIES.map((c) => ({
      value: c.name,
      label: `${c.name} (${c.capital})`,
    }));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, showMilliseconds ? 50 : 1000);
    return () => clearInterval(timer);
  }, [showMilliseconds]);

  const moveZone = (index: number, direction: "up" | "down") => {
    const newZones = [...trackedZones];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newZones.length) return;

    const temp = newZones[index];
    newZones[index] = newZones[targetIndex];
    newZones[targetIndex] = temp;

    onUpdateTrackedZones(newZones);
  };

  const getZoneTimeDetails = (timezone: string) => {
    try {
      const zTime = new Date(time.toLocaleString("en-US", { timeZone: timezone }));
      const ms = time.getMilliseconds();
      const seconds = zTime.getSeconds();
      const minutes = zTime.getMinutes();
      const hours = zTime.getHours();

      const secAngle = seconds * 6 + (showMilliseconds ? ms * 0.006 : 0);
      const minAngle = minutes * 6 + seconds * 0.1;
      const hrAngle = (hours % 12) * 30 + minutes * 0.5;

      let timeStr = "";
      if (use24Hour) {
        const hh = String(hours).padStart(2, "0");
        const mm = String(minutes).padStart(2, "0");
        timeStr = `${hh}:${mm}`;
        if (showSeconds) {
          timeStr += `:${String(seconds).padStart(2, "0")}`;
        }
      } else {
        const ampm = hours >= 12 ? "PM" : "AM";
        const displayHr = hours % 12 || 12;
        const hh = String(displayHr).padStart(2, "0");
        const mm = String(minutes).padStart(2, "0");
        timeStr = `${hh}:${mm}`;
        if (showSeconds) {
          timeStr += `:${String(seconds).padStart(2, "0")}`;
        }
        timeStr += ` ${ampm}`;
      }

      if (showMilliseconds) {
        timeStr += `.${String(Math.floor(ms / 10)).padStart(2, "0")}`;
      }

      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        timeZoneName: "shortOffset",
      });
      const parts = formatter.formatToParts(time);
      const offsetPart = parts.find((p) => p.type === "timeZoneName")?.value || "UTC";

      const abbParts = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        timeZoneName: "short",
      }).formatToParts(time);
      const abbreviation = abbParts.find((p) => p.type === "timeZoneName")?.value || "UTC";

      const localFormatter = new Intl.DateTimeFormat("en-US", {
        timeZoneName: "shortOffset",
      });
      const localParts = localFormatter.formatToParts(time);
      const localOffset = localParts.find((p) => p.type === "timeZoneName")?.value || "UTC";

      const getOffsetMinutes = (offsetStr: string) => {
        if (offsetStr === "GMT" || offsetStr === "UTC") return 0;
        const clean = offsetStr.replace("GMT", "").replace("UTC", "");
        if (!clean.includes("+") && !clean.includes("-")) return 0;
        const sign = clean.startsWith("-") ? -1 : 1;
        const value = clean.substring(1);
        if (value.includes(":")) {
          const [h, m] = value.split(":").map(Number);
          return sign * (h * 60 + m);
        } else {
          return sign * (Number(value) * 60);
        }
      };

      const zoneMinutes = getOffsetMinutes(offsetPart);
      const localMinutes = getOffsetMinutes(localOffset);
      const diffMins = zoneMinutes - localMinutes;
      const diffHrs = diffMins / 60;
      let diffStr = "";
      if (diffHrs === 0) {
        diffStr = "Same time";
      } else {
        const sign = diffHrs > 0 ? "+" : "";
        diffStr = `${sign}${diffHrs}h vs local`;
      }

      return {
        timeStr,
        offsetPart,
        abbreviation,
        diffStr,
        secAngle,
        minAngle,
        hrAngle,
        isNextDay: zTime.getDate() !== time.getDate(),
      };
    } catch {
      return {
        timeStr: "--:--:--",
        offsetPart: "UTC",
        abbreviation: "UTC",
        diffStr: "Same time",
        secAngle: 0,
        minAngle: 0,
        hrAngle: 0,
        isNextDay: false,
      };
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn bg-transparent">
      {/* Control panel header styling modified */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 border-b border-white/10 pb-6 bg-transparent">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setUse24Hour(!use24Hour)}
            className={`text-[0.65rem] uppercase tracking-widest font-black px-4 py-2.5 rounded-xl border transition-all cursor-pointer ${
              use24Hour
                ? "bg-white/[0.04] border-white/10 text-white"
                : "bg-transparent border-transparent text-white/45 hover:text-white/45"
            }`}
          >
            24H
          </button>
          <button
            onClick={() => setShowSeconds(!showSeconds)}
            className={`text-[0.65rem] uppercase tracking-widest font-black px-4 py-2.5 rounded-xl border transition-all cursor-pointer ${
              showSeconds
                ? "bg-white/[0.04] border-white/10 text-white"
                : "bg-transparent border-transparent text-white/45 hover:text-white/45"
            }`}
          >
            Seconds
          </button>
          <button
            onClick={() => setShowMilliseconds(!showMilliseconds)}
            className={`text-[0.65rem] uppercase tracking-widest font-black px-4 py-2.5 rounded-xl border transition-all cursor-pointer ${
              showMilliseconds
                ? "bg-white/[0.04] border-white/10 text-white"
                : "bg-transparent border-transparent text-white/45 hover:text-white/45"
            }`}
          >
            Milliseconds
          </button>
        </div>

        {/* Dropdown search select styled as transparent dark-grey */}
        <CustomSelect
          options={countryOptions}
          value=""
          onChange={(val) => {
            if (val) onAddTrackedZone(val);
          }}
          placeholder="Add Registry Parameter (200+ Countries)..."
          triggerClassName="w-full rounded-xl border border-white/10 bg-[#0e0e15] py-3.5 px-5 text-xs font-bold text-zinc-300 outline-none cursor-pointer hover:border-white/[0.12] transition-colors text-left flex justify-between items-center"
          className="w-full md:w-96"
        />
      </div>

      {/* Grid of tracked clocks (SQUARE CARDS BLENDED SEAMLESSLY NO BORDERS) */}
      {trackedZones.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-white/10 text-center bg-transparent">
          <p className="text-sm font-extrabold text-zinc-400 uppercase tracking-widest">No Parameters Tracked</p>
          <p className="text-xs text-white/45 mt-2 max-w-[320px] uppercase tracking-wider font-semibold">
            Please append time zones using the registry selector dropdown.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {trackedZones.map((z, idx) => {
            const { timeStr, offsetPart, abbreviation, diffStr, secAngle, minAngle, hrAngle, isNextDay } =
              getZoneTimeDetails(z.timezone);
            return (
              <div
                key={z.timezone}
                className="relative flex flex-col items-center justify-between p-7 sm:p-8 rounded-3xl border-none bg-transparent hover:bg-white/[0.01] transition-all text-center min-h-[380px] sm:min-h-[420px] group"
              >
                {/* 1. Header (Country, Capital) */}
                <div className="w-full flex items-start justify-between gap-3">
                  <div className="text-left min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white truncate block max-w-[160px]" title={z.name}>
                        {z.name}
                      </span>
                    </div>
                    <span className="text-xs text-white/45 font-bold block mt-0.5 truncate max-w-[150px]">
                      {z.capital}
                    </span>
                  </div>

                  {/* Actions (Reorder and Remove - text only) */}
                  <div className="flex items-center gap-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => moveZone(idx, "up")}
                      disabled={idx === 0}
                      className="text-[0.65rem] font-bold text-white/45 hover:text-white/45 disabled:opacity-35"
                      title="Move up"
                    >
                      UP
                    </button>
                    <button
                      onClick={() => moveZone(idx, "down")}
                      disabled={idx === trackedZones.length - 1}
                      className="text-[0.65rem] font-bold text-white/45 hover:text-white/45 disabled:opacity-35"
                      title="Move down"
                    >
                      DN
                    </button>
                    <button
                      onClick={() => onRemoveTrackedZone(z.timezone)}
                      className="text-[0.65rem] font-bold text-white/45 hover:text-zinc-300 transition-colors"
                      title="Remove clock"
                    >
                      RM
                    </button>
                  </div>
                </div>

                {/* 2. SVG Ticking Clock Face (No outer border, transparent dial) */}
                <div className="my-5 select-none flex justify-center items-center relative">
                  <svg width="180" height="180" className="bg-transparent rounded-full">
                    {/* Ring edge */}
                    <circle cx="90" cy="90" r="88" fill="transparent" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="2.5" />
                    
                    {/* 12 dial hour ticks */}
                    {Array.from({ length: 12 }).map((_, i) => {
                      const angle = i * 30;
                      const isMain = i % 3 === 0;
                      return (
                        <line
                          key={i}
                          x1="90"
                          y1="6"
                          x2="90"
                          y2={isMain ? "16" : "12"}
                          stroke={isMain ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.06)"}
                          strokeWidth={isMain ? "2.5" : "1.5"}
                          transform={`rotate(${angle} 90 90)`}
                        />
                      );
                    })}

                    {/* Hour Hand */}
                    <line
                      x1="90"
                      y1="90"
                      x2="90"
                      y2="52"
                      stroke="#111111"
                      strokeWidth="4"
                      strokeLinecap="round"
                      transform={`rotate(${hrAngle} 90 90)`}
                    />

                    {/* Minute Hand */}
                    <line
                      x1="90"
                      y1="90"
                      x2="90"
                      y2="30"
                      stroke="#8b8b96"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      transform={`rotate(${minAngle} 90 90)`}
                    />

                    {/* Seconds Hand */}
                    {showSeconds && (
                      <line
                        x1="90"
                        y1="102"
                        x2="90"
                        y2="18"
                        stroke="#5a5a66"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        transform={`rotate(${secAngle} 90 90)`}
                      />
                    )}

                    {/* Pin cap */}
                    <circle cx="90" cy="90" r="4.5" fill="#5a5a66" />
                  </svg>
                </div>

                {/* 3. Details stacked below the Clock */}
                <div className="w-full space-y-2">
                  <div className="text-2xl sm:text-3xl font-black font-mono text-white leading-none">
                    {timeStr}
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-xs text-white/45 font-bold">
                    <span className="bg-white border border-white/10 px-2 py-0.5 rounded font-mono text-xs text-white">
                      {offsetPart} ({abbreviation})
                    </span>
                    <span>•</span>
                    <span>{diffStr}</span>
                    {isNextDay && (
                      <span className="text-xs text-white/45 bg-white border border-white/10 px-1.5 rounded">
                        +1d
                      </span>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
