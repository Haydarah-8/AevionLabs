"use client";

import React, { useState, useEffect, useMemo } from "react";
import { COUNTRIES, type CountryData } from "./countriesData";
import { generateSmartInsight, generateShareText, isBusinessHours, calculateMeetingScore } from "../../../lib/timeEngine";
import { CustomSelect } from "@/components/ui/CustomSelect";

export function TimeConverterView() {
  const [timeFormat, setTimeFormat] = useState<12 | 24>(12);
  const [showSeconds, setShowSeconds] = useState(true);
  const [timeMode, setTimeMode] = useState<"live" | "custom">("live");
  
  const [sourceCountry, setSourceCountry] = useState<CountryData>(() => COUNTRIES.find((c) => c.iso.includes("GB")) || COUNTRIES[0]);
  const [targetCountry, setTargetCountry] = useState<CountryData>(() => COUNTRIES.find((c) => c.iso.includes("US")) || COUNTRIES[1]);

  const [liveDate, setLiveDate] = useState<Date>(new Date());
  const [customDate, setCustomDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [customTime, setCustomTime] = useState<string>(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(Math.floor(now.getMinutes()/5)*5).padStart(2, '0')}`;
  });

  const [hoveredHour, setHoveredHour] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setLiveDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSwap = () => {
    setSourceCountry(targetCountry);
    setTargetCountry(sourceCountry);
  };

  const activeLocations = useMemo(() => {
    const uk = COUNTRIES.find((c) => c.iso.includes("GB")) || COUNTRIES[0];
    const utc = COUNTRIES.find((c) => c.name === "Coordinated Universal Time" || c.timezone === "UTC") || COUNTRIES[0];
    const locations = [sourceCountry, targetCountry];
    if (!locations.find(l => l.timezone === uk.timezone)) locations.push(uk);
    if (!locations.find(l => l.timezone === utc.timezone)) locations.push(utc);
    return locations;
  }, [sourceCountry, targetCountry]);

  const { baseDate, targetDateObj, diffText, sourceOffset, targetOffset, dayDiff, smartInsight, meetingScore } = useMemo(() => {
    try {
      let activeDateStr = customDate;
      let activeHour = 0, activeMinute = 0, activeSecond = 0;

      if (timeMode === "custom") {
        const [hr, min] = customTime.split(":").map(Number);
        activeHour = hr || 0;
        activeMinute = min || 0;
      } else {
        activeDateStr = liveDate.toISOString().split("T")[0];
        activeHour = liveDate.getHours();
        activeMinute = liveDate.getMinutes();
        activeSecond = liveDate.getSeconds();
      }

      const bDate = new Date(activeDateStr);
      bDate.setHours(activeHour, activeMinute, activeSecond, 0);

      const sourceStr = bDate.toLocaleString("en-US", { timeZone: sourceCountry.timezone });
      const sourceDate = new Date(sourceStr);

      const targetStr = bDate.toLocaleString("en-US", { timeZone: targetCountry.timezone });
      const targetDate = new Date(targetStr);

      const hDiff = Math.round((targetDate.getTime() - sourceDate.getTime()) / 3600000);
      const convertedDateObject = new Date(bDate.getTime() + hDiff * 3600000);
      
      const sOffset = new Intl.DateTimeFormat("en-US", { timeZone: sourceCountry.timezone, timeZoneName: "shortOffset" })
        .formatToParts(bDate).find((p) => p.type === "timeZoneName")?.value || "UTC";
      const tOffset = new Intl.DateTimeFormat("en-US", { timeZone: targetCountry.timezone, timeZoneName: "shortOffset" })
        .formatToParts(bDate).find((p) => p.type === "timeZoneName")?.value || "UTC";

      const absDiff = Math.abs(hDiff);
      const text = hDiff === 0 ? "Synchronized" : `${absDiff}h ${hDiff > 0 ? "Ahead" : "Behind"}`;

      let dDiff = 0;
      if (convertedDateObject.getDate() > bDate.getDate()) dDiff = 1;
      if (convertedDateObject.getDate() < bDate.getDate()) dDiff = -1;

      const smartInsight = generateSmartInsight(sourceCountry.timezone, targetCountry.timezone, bDate);
      const meetingScore = calculateMeetingScore(sourceCountry.timezone, targetCountry.timezone, bDate);

      return {
        baseDate: bDate,
        targetDateObj: convertedDateObject,
        hourDiff: hDiff,
        diffText: text,
        sourceOffset: sOffset,
        targetOffset: tOffset,
        dayDiff: dDiff,
        smartInsight,
        meetingScore
      };
    } catch {
      return {
        baseDate: new Date(), targetDateObj: new Date(), hourDiff: 0, diffText: "Sync", sourceOffset: "UTC", targetOffset: "UTC", dayDiff: 0, smartInsight: "Syncing...", meetingScore: 0
      };
    }
  }, [timeMode, liveDate, customDate, customTime, sourceCountry, targetCountry]);

  const handleShare = () => {
    const sTime = baseDate.toLocaleString("en-US", { timeZone: sourceCountry.timezone, timeStyle: "short", dateStyle: "short" });
    const tTime = targetDateObj.toLocaleString("en-US", { timeZone: targetCountry.timezone, timeStyle: "short", dateStyle: "short" });
    const text = generateShareText(sourceCountry.name, sTime, targetCountry.name, tTime);
    navigator.clipboard.writeText(text);
    alert("Conversion copied to clipboard!");
  };

  const originOptions = useMemo(() => {
    return COUNTRIES.map((c) => ({
      value: c.name,
      label: `${c.capital}, ${c.name}`
    }));
  }, []);

  const destOptions = useMemo(() => {
    return COUNTRIES.map((c) => ({
      value: c.name,
      label: `${c.name}, ${c.capital}`
    }));
  }, []);

  return (
    <div className="flex flex-col animate-fadeIn w-full max-w-full space-y-12">
      
      {/* Settings Bar */}
      <div className="flex items-center justify-between gap-6 bg-white/[0.01] px-6 py-4 rounded-2xl shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]">
        <div className="flex items-center gap-3">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-white">Temporal Command</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 text-[0.65rem] uppercase tracking-widest font-black text-white/45">
            Format
            <div className="flex gap-1 ml-1">
              <button onClick={() => setTimeFormat(12)} className={`px-3 py-1.5 rounded-lg transition-colors ${timeFormat === 12 ? 'bg-white/[0.08] text-white shadow-sm' : 'hover:bg-white/[0.04]'}`}>12h</button>
              <button onClick={() => setTimeFormat(24)} className={`px-3 py-1.5 rounded-lg transition-colors ${timeFormat === 24 ? 'bg-white/[0.08] text-white shadow-sm' : 'hover:bg-white/[0.04]'}`}>24h</button>
            </div>
          </div>
          <div className="h-4 w-px bg-white/[0.04]"></div>
          <div className="flex items-center gap-3 text-[0.65rem] uppercase tracking-widest font-black text-white/45">
            Precision
            <button onClick={() => setShowSeconds(!showSeconds)} className={`px-4 py-1.5 rounded-lg transition-colors ${showSeconds ? 'bg-[#111111]/10 text-white' : 'hover:bg-white/[0.04]'}`}>
              {showSeconds ? "Milliseconds Active" : "Standard"}
            </button>
          </div>
        </div>
      </div>

      {/* SMART INSIGHTS BANNER */}
      <div className="w-full flex items-center gap-4 bg-[#111111]/5 border border-[#111111]/10 rounded-2xl p-4 animate-fadeIn">
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-sm font-medium text-white"><span className="font-bold text-white mr-2">SMART INSIGHT:</span>{smartInsight}</p>
          <div className="flex items-center gap-2">
            <span className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-white/45">Meeting Score:</span>
            <div className={`px-2 py-1 rounded-md text-xs font-black ${meetingScore >= 80 ? 'bg-emerald-500/20 text-emerald-400' : meetingScore >= 50 ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'}`}>
              {meetingScore}/100
            </div>
          </div>
        </div>
      </div>

      {/* ── COMMAND CENTER PANELS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 lg:gap-10">
        
        {/* ORIGIN PANEL */}
        <div className="lg:col-span-3 flex flex-col space-y-6">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <h3 className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-white/45">Origin System</h3>
          </div>
          
          <CustomSelect
            options={originOptions}
            value={sourceCountry.name}
            onChange={(val) => {
              const matched = COUNTRIES.find((c) => c.name === val);
              if (matched) setSourceCountry(matched);
            }}
            triggerClassName="w-full bg-transparent text-3xl font-black text-white hover:text-white transition-colors text-left focus:outline-none"
            className="w-full"
          />

          <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-6 bg-white/[0.01] rounded-[2rem] p-6 sm:p-8 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]">
            <div className="shrink-0 flex items-center justify-center">
              <AnalogClock date={baseDate} highlightColor="#10b981" />
            </div>
            
            <div className="flex flex-col justify-center flex-1 space-y-4">
              <DigitalClock date={baseDate} format={timeFormat} showSeconds={showSeconds} />
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <DataReadout label="Offset" value={sourceOffset} />
                <DataReadout label="DST Rule" value={sourceCountry.dstRule.split(" ")[0]} />
                <DataReadout label="Date" value={baseDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} />
                <DataReadout label="Voltage" value={sourceCountry.voltage} />
              </div>
            </div>
          </div>
        </div>

      {/* MIDDLE CONTROLS */}
        <div className="lg:col-span-1 flex flex-col items-center justify-center gap-8 py-8 lg:py-0">
           
           <div className="flex flex-col items-center gap-2">
              <span className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-white/45">Sync Path</span>
              <button onClick={handleSwap} className="px-4 py-2.5 rounded-xl bg-white hover:bg-black/[0.06] text-[0.65rem] font-bold text-white/45 hover:text-white transition-all hover:scale-105 active:scale-95 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)] cursor-pointer">
                 SWAP DIRECTIONS
              </button>
           </div>
           
           <div className="flex flex-col items-center text-center gap-1">
             <span className="text-xl font-black text-white">{diffText}</span>
             <span className="text-[0.6rem] uppercase tracking-widest font-bold text-white">
               {dayDiff === 0 ? "Same Day" : dayDiff > 0 ? "+1 Day Shift" : "-1 Day Shift"}
             </span>
           </div>

           <div className="flex flex-col items-center w-full gap-3 pt-6 border-t border-white/10">
             <span className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-white/45">Override</span>
             <button
               onClick={() => setTimeMode(timeMode === "live" ? "custom" : "live")}
               className={`w-full py-3 rounded-xl text-xs font-bold transition-all tracking-[0.1em] uppercase cursor-pointer ${
                 timeMode === "custom" ? "bg-[#111111]/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]" : "bg-white text-white/45 hover:text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]"
               }`}
             >
               {timeMode === "live" ? "Lock Custom" : "Return Live"}
             </button>
             
             {timeMode === "custom" && (
               <div className="flex flex-col w-full gap-2 animate-fadeIn">
                 <input
                   type="date"
                   value={customDate}
                   onChange={(e) => setCustomDate(e.target.value)}
                   className="w-full bg-black/[0.2] border border-white/10 rounded-lg py-2 px-3 text-xs font-mono text-white outline-none [color-scheme:dark]"
                 />
                 <input
                   type="time"
                   value={customTime}
                   onChange={(e) => setCustomTime(e.target.value)}
                   className="w-full bg-black/[0.2] border border-white/10 rounded-lg py-2 px-3 text-xs font-mono text-white outline-none [color-scheme:dark]"
                 />
               </div>
             )}
           </div>

           <div className="flex flex-col gap-2 w-full pt-6">
             <button onClick={handleShare} className="w-full text-center text-[0.65rem] font-black uppercase tracking-[0.1em] text-white/45 hover:text-white transition-colors py-2 px-3 bg-white hover:bg-black/[0.05] rounded-xl cursor-pointer">
               Share Conversion
             </button>
             <button onClick={() => { navigator.clipboard.writeText(baseDate.toISOString()); alert("ISO Timestamp copied!"); }} className="w-full text-center text-[0.65rem] font-black uppercase tracking-[0.1em] text-white/45 hover:text-white transition-colors py-2 px-3 bg-white hover:bg-black/[0.05] rounded-xl cursor-pointer">
               Copy ISO Timestamp
             </button>
           </div>
        </div>

        {/* DESTINATION PANEL */}
        <div className="lg:col-span-3 flex flex-col space-y-6">
          <div className="flex items-center justify-end gap-2 text-right">
            <h3 className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-white/45">Destination Target</h3>
            <span className="h-2 w-2 rounded-full bg-[#111111] shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          </div>
          
          <CustomSelect
            options={destOptions}
            value={targetCountry.name}
            onChange={(val) => {
              const matched = COUNTRIES.find((c) => c.name === val);
              if (matched) setTargetCountry(matched);
            }}
            triggerClassName="w-full bg-transparent text-3xl font-black text-white hover:text-white transition-colors text-right focus:outline-none"
            className="w-full"
            align="right"
          />

          <div className="flex flex-col sm:flex-row-reverse items-center sm:items-stretch gap-6 bg-white/[0.01] rounded-[2rem] p-6 sm:p-8 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]">
            <div className="shrink-0 flex items-center justify-center">
              <AnalogClock date={targetDateObj} highlightColor="#111111" />
            </div>
            
            <div className="flex flex-col justify-center flex-1 space-y-4 text-right">
              <div className="flex justify-end">
                 <DigitalClock date={targetDateObj} format={timeFormat} showSeconds={showSeconds} align="right" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <DataReadout label="DST Rule" value={targetCountry.dstRule.split(" ")[0]} align="right" />
                <DataReadout label="Offset" value={targetOffset} align="right" />
                <DataReadout label="Currency" value={targetCountry.currency} align="right" />
                <DataReadout label="Date" value={targetDateObj.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} align="right" />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── ADVANCED MATRIX ── */}
      <div className="w-full flex flex-col space-y-4 pt-6">
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <h3 className="text-sm font-black tracking-widest text-white/45 uppercase">
            Matrix Synchronization Grid
          </h3>
        </div>

        <div className="relative w-full overflow-hidden bg-transparent">
          <div className="overflow-x-auto pb-4 dark-scroll">
            <div className="min-w-[1000px] flex flex-col gap-1 relative">
              
              {activeLocations.map((location, rowIndex) => {
                
                const locStr = baseDate.toLocaleString("en-US", { timeZone: location.timezone });
                const locDate = new Date(locStr);
                
                let exactTimeString = "";
                const eHrs = locDate.getHours();
                const eMins = String(locDate.getMinutes()).padStart(2, "0");
                const ampm = eHrs >= 12 ? "PM" : "AM";
                const displayHr = timeFormat === 24 ? String(eHrs).padStart(2, "0") : String(eHrs % 12 || 12).padStart(2, "0");
                exactTimeString = `${displayHr}:${eMins}`;
                if (timeFormat === 12) exactTimeString += ` ${ampm}`;

                const offset = new Intl.DateTimeFormat("en-US", { timeZone: location.timezone, timeZoneName: "shortOffset" })
                  .formatToParts(baseDate).find((p) => p.type === "timeZoneName")?.value || "UTC";

                return (
                  <div key={`${location.name}-${rowIndex}`} className="flex items-stretch bg-transparent relative group py-1">
                    
                    {/* Left Info Panel */}
                    <div className="w-[280px] pr-5 flex items-center justify-between shrink-0 bg-transparent relative z-10 border-r border-white/10">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm truncate max-w-[180px] tracking-tight">{location.capital}</span>
                        </div>
                        <div className="text-[0.6rem] text-white/45 font-bold mt-1 uppercase tracking-[0.1em]">
                          {location.iso} • {offset}
                        </div>
                      </div>
                      
                      <div className="text-lg font-black font-mono text-white tracking-tighter text-right">
                        {exactTimeString}
                      </div>
                    </div>

                    {/* 24-Hour Grid */}
                    <div className="flex-1 flex text-center relative overflow-hidden bg-transparent pl-4">
                      {Array.from({ length: 24 }).map((_, i) => {
                        const sourceLocalBase = new Date(baseDate.toLocaleString("en-US", { timeZone: sourceCountry.timezone }));
                        sourceLocalBase.setHours(0, 0, 0, 0);
                        sourceLocalBase.setHours(i);
                        
                        const sStr = sourceLocalBase.toLocaleString("en-US", { timeZone: sourceCountry.timezone });
                        const lStr = sourceLocalBase.toLocaleString("en-US", { timeZone: location.timezone });
                        
                        const sD = new Date(sStr);
                        const lD = new Date(lStr);
                        
                        const diffHours = Math.round((lD.getTime() - sD.getTime()) / 3600000);
                        const cellHour = (i + diffHours + 48) % 24; 
                        
                        // Pass a dummy date object mapped to this cell's hour to timeEngine
                        const cellDateForBizCheck = new Date();
                        cellDateForBizCheck.setHours(cellHour);
                        const isBusiness = isBusinessHours(cellDateForBizCheck);
                        
                        let bgClass = "bg-transparent transition-all duration-300 ease-out";
                        let textClass = "text-white/45";
                        let glowClass = "";

                        if (isBusiness) {
                          bgClass = "bg-white";
                          textClass = "text-white font-bold";
                        } 

                        const isHovered = hoveredHour === i;
                        if (isHovered) {
                          bgClass = "bg-[#111111]/10 rounded-lg";
                          textClass = "text-white font-black drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]";
                          glowClass = "after:content-[''] after:absolute after:-inset-y-4 after:inset-x-0 after:bg-gradient-to-b after:from-[#111111]/10 after:to-transparent after:pointer-events-none";
                        }

                        const displayHr24 = String(cellHour).padStart(2, "0");
                        const displayHr12 = cellHour % 12 || 12;

                        return (
                          <div 
                            key={i} 
                            className={`flex-1 min-w-[36px] flex flex-col justify-center items-center cursor-crosshair relative ${bgClass} py-1`}
                            onMouseEnter={() => setHoveredHour(i)}
                            onMouseLeave={() => setHoveredHour(null)}
                          >
                            {isHovered && <div className={glowClass} />}
                            {timeFormat === 24 ? (
                              <span className={`text-[0.65rem] font-mono tracking-tighter ${textClass}`}>{displayHr24}</span>
                            ) : (
                              <span className={`text-[0.65rem] font-mono tracking-tighter ${textClass}`}>{displayHr12}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

// ── SUBCOMPONENTS ──

function DataReadout({ label, value, align = "left" }: { label: string, value: string, align?: "left" | "right" }) {
  return (
    <div className={`flex flex-col gap-1 ${align === "right" ? "items-end text-right" : "items-start text-left"}`}>
      <span className="text-[0.55rem] font-black uppercase tracking-[0.15em] text-white/45">{label}</span>
      <span className="text-xs font-bold text-white truncate">{value}</span>
    </div>
  );
}

function DigitalClock({ date, format, showSeconds, align = "left" }: { date: Date, format: 12 | 24, showSeconds: boolean, align?: "left" | "right" }) {
  const hrs = date.getHours();
  const mins = String(date.getMinutes()).padStart(2, "0");
  const secs = String(date.getSeconds()).padStart(2, "0");
  
  const displayHr = format === 24 ? String(hrs).padStart(2, "0") : String(hrs % 12 || 12).padStart(2, "0");
  const ampm = hrs >= 12 ? "PM" : "AM";

  return (
    <div className={`flex items-baseline gap-1 ${align === "right" ? "justify-end" : "justify-start"}`}>
      <div className="text-4xl sm:text-5xl font-black font-mono tracking-tighter text-white drop-shadow-md">
        {displayHr}:{mins}{showSeconds ? `:${secs}` : ""}
      </div>
      {format === 12 && (
        <span className="text-lg font-bold text-black/30 ml-1">{ampm}</span>
      )}
    </div>
  );
}

function AnalogClock({ date, highlightColor }: { date: Date, highlightColor: string }) {
  const seconds = date.getSeconds();
  const minutes = date.getMinutes();
  const hours = date.getHours() % 12;

  const secondDegrees = (seconds / 60) * 360;
  const minuteDegrees = ((minutes + seconds / 60) / 60) * 360;
  const hourDegrees = ((hours + minutes / 60) / 12) * 360;

  return (
    <div className="relative w-32 h-32 rounded-full border border-white/[0.08] bg-black/[0.4] shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] flex items-center justify-center">
      {/* Markers */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="absolute w-full h-full pointer-events-none" style={{ transform: `rotate(${i * 30}deg)` }}>
          <div className={`mx-auto w-1 rounded-full mt-1 ${i % 3 === 0 ? "h-3 bg-white/[0.4]" : "h-1.5 bg-white/[0.15]"}`} />
        </div>
      ))}
      
      {/* Hour Hand */}
      <div 
        className="absolute w-1.5 h-7 bg-white rounded-full origin-bottom bottom-1/2 z-10 transition-transform duration-200"
        style={{ transform: `rotate(${hourDegrees}deg)` }}
      />
      
      {/* Minute Hand */}
      <div 
        className="absolute w-1 h-11 bg-white/[0.8] rounded-full origin-bottom bottom-1/2 z-20 transition-transform duration-200"
        style={{ transform: `rotate(${minuteDegrees}deg)` }}
      />
      
      {/* Second Hand */}
      <div 
        className="absolute w-[2px] h-12 origin-bottom bottom-1/2 z-30 transition-transform duration-200 ease-linear"
        style={{ transform: `rotate(${secondDegrees}deg)`, backgroundColor: highlightColor }}
      />
      
      {/* Center cap */}
      <div className="w-2.5 h-2.5 rounded-full absolute z-40 border-2 border-black" style={{ backgroundColor: highlightColor }} />
    </div>
  );
}
