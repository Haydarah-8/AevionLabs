"use client";

import React, { useState, useEffect, useMemo } from "react";
import { COUNTRIES, type CountryData } from "./time-intelligence/countriesData";
import { toZonedTime } from "date-fns-tz";
import { CustomSelect } from "@/components/ui/CustomSelect";
import {
  plainHoverTableRow,
} from "@/components/admin/plain";

export function GlobalTimeConverter() {
  const [selectedCountry, setSelectedCountry] = useState<CountryData>(() => 
    COUNTRIES.find((c) => c.iso.includes("US")) || COUNTRIES[0]
  );
  const [liveDate, setLiveDate] = useState<Date>(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setLiveDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const localTimezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC";
    }
  }, []);

  const countryOptions = useMemo(() => {
    return COUNTRIES.map((c) => ({
      value: c.name,
      label: `${c.name} (${c.capital})`,
    }));
  }, []);

  const tableData = useMemo(() => {
    const zones = [
      { id: "selected", name: selectedCountry.capital + ", " + selectedCountry.name, tz: selectedCountry.timezone },
      { id: "local", name: "Local Time (You)", tz: localTimezone },
      { id: "uk", name: "London, United Kingdom", tz: "Europe/London" },
      { id: "utc", name: "Coordinated Universal Time", tz: "UTC" }
    ];

    return zones.map((zone) => {
      try {
        const zoned = toZonedTime(liveDate, zone.tz);
        
        // Calculate difference relative to local time
        const localZoned = toZonedTime(liveDate, localTimezone);
        const diffMs = zoned.getTime() - localZoned.getTime();
        const diffHours = Math.round(diffMs / 3600000);
        
        const formatTime = (d: Date) => {
          const hrs = d.getHours();
          const mins = String(d.getMinutes()).padStart(2, "0");
          const secs = String(d.getSeconds()).padStart(2, "0");
          const isPm = hrs >= 12;
          const displayHr = hrs % 12 || 12;
          return `${String(displayHr).padStart(2, "0")}:${mins}:${secs} ${isPm ? "PM" : "AM"}`;
        };

        const absDiff = Math.abs(diffHours);
        const diffText = diffHours === 0 ? "Local" : `${absDiff}h ${diffHours > 0 ? "ahead" : "behind"}`;

        let dayShiftText = "Same Day";
        if (zoned.getDate() > localZoned.getDate()) dayShiftText = "+1 Day";
        if (zoned.getDate() < localZoned.getDate()) dayShiftText = "-1 Day";

        return {
          ...zone,
          timeString: formatTime(zoned),
          difference: diffText,
          dayShift: dayShiftText,
          offset: new Intl.DateTimeFormat("en-US", { timeZone: zone.tz, timeZoneName: "shortOffset" })
            .formatToParts(liveDate).find((p) => p.type === "timeZoneName")?.value || "UTC"
        };
      } catch {
        return {
          ...zone,
          timeString: "--:--:--",
          difference: "-",
          dayShift: "-",
          offset: "UTC"
        };
      }
    });
  }, [liveDate, selectedCountry, localTimezone]);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-transparent bg-transparent overflow-hidden relative">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-[1.05rem] font-medium text-[#111]">World clock</h3>
        </div>
        
        {/* Country Selector with custom styling */}
        <CustomSelect
          options={countryOptions}
          value={selectedCountry.name}
          onChange={(val) => {
            const matched = COUNTRIES.find((c) => c.name === val);
            if (matched) setSelectedCountry(matched);
          }}
          triggerClassName="flex w-full cursor-pointer items-center justify-between rounded-lg border border-black/10 bg-white px-4 py-2 text-left text-[0.9rem] text-[#111] outline-none transition-colors hover:border-black/25"
          className="w-full sm:w-64"
        />
      </div>

      <div className="overflow-x-auto dark-scroll">
        <table className="w-full text-left text-sm text-[#737373]">
          <thead className="border-b border-black/10 text-[0.85rem] text-[#737373]">
            <tr>
              <th className="w-1/3 px-4 py-3 font-normal">Place</th>
              <th className="px-4 py-3 font-normal">Offset</th>
              <th className="px-4 py-3 font-normal">Their time</th>
              <th className="px-4 py-3 font-normal">Difference</th>
              <th className="px-4 py-3 text-right font-normal">Day</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {tableData.map((row) => (
              <tr key={row.id} className={` transition-colors ${plainHoverTableRow}`}>
                <td className="py-4 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-[#111]">{row.name}</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-[0.88rem] tabular-nums text-[#737373]">
                  {row.offset}
                </td>
                <td className="whitespace-nowrap px-4 py-4 font-medium tabular-nums text-[#111]">
                  {row.timeString}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-[#b8b8c0]">
                  {row.difference}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-right text-[#111]">
                  {row.dayShift}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
