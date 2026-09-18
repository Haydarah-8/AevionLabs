"use client";

import React, { useState, useEffect, useMemo } from "react";
import { COUNTRIES, type CountryData } from "./countriesData";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { plainHoverTableRow } from "@/components/admin/plain";

interface TimeZoneRow {
  zone: string;
  country: string;
  flag: string;
  offset: string;
  abbreviation: string;
  currentTime: string;
  hasDst: boolean;
  countryDetails: CountryData;
}

interface TimeZonesViewProps {
  expandedZone: string | null;
  onSetExpandedZone: (zone: string | null) => void;
}

export function TimeZonesView({
  expandedZone,
  onSetExpandedZone,
}: TimeZonesViewProps) {
  const [search, setSearch] = useState("");
  const [offsetFilter, setOffsetFilter] = useState("All");
  const [dstFilter, setDstFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof TimeZoneRow>("zone");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [time, setTime] = useState(new Date());

  const itemsPerPage = 12;

  const offsetOptions = useMemo(() => [
    { value: "All", label: "All Offsets" },
    { value: "Plus", label: "Positive Offsets (+)" },
    { value: "Minus", label: "Negative Offsets (-)" },
    { value: "UTC", label: "UTC / GMT" },
  ], []);

  const dstOptions = useMemo(() => [
    { value: "All", label: "All DST Rules" },
    { value: "DST", label: "Observes DST" },
    { value: "No DST", label: "No DST" },
  ], []);

  // Keep time updated
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute timezone rows from COUNTRIES data
  const rows = useMemo<TimeZoneRow[]>(() => {
    const seen = new Set<string>();
    const list: TimeZoneRow[] = [];

    COUNTRIES.forEach((c) => {
      if (seen.has(c.timezone)) return;
      seen.add(c.timezone);

      try {
        const parts = new Intl.DateTimeFormat("en-US", {
          timeZone: c.timezone,
          timeZoneName: "shortOffset",
        }).formatToParts(time);
        
        const offsetVal = parts.find((p) => p.type === "timeZoneName")?.value || "UTC";

        const abbParts = new Intl.DateTimeFormat("en-US", {
          timeZone: c.timezone,
          timeZoneName: "short",
        }).formatToParts(time);
        const abbreviation = abbParts.find((p) => p.type === "timeZoneName")?.value || "UTC";

        const localTime = time.toLocaleTimeString("en-GB", {
          timeZone: c.timezone,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });

        list.push({
          zone: c.timezone,
          country: c.name,
          flag: c.flag,
          offset: offsetVal,
          abbreviation,
          currentTime: localTime,
          hasDst: !c.dstRule.toLowerCase().includes("no dst"),
          countryDetails: c,
        });
      } catch {
        list.push({
          zone: c.timezone,
          country: c.name,
          flag: c.flag,
          offset: "UTC",
          abbreviation: "UTC",
          currentTime: "00:00:00",
          hasDst: false,
          countryDetails: c,
        });
      }
    });

    return list;
  }, [time]);

  // Filtering
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const matchSearch =
        r.zone.toLowerCase().includes(search.toLowerCase()) ||
        r.country.toLowerCase().includes(search.toLowerCase()) ||
        r.abbreviation.toLowerCase().includes(search.toLowerCase());

      const matchDst =
        dstFilter === "All" ||
        (dstFilter === "DST" && r.hasDst) ||
        (dstFilter === "No DST" && !r.hasDst);

      const matchOffset =
        offsetFilter === "All" ||
        (offsetFilter === "Plus" && r.offset.includes("+")) ||
        (offsetFilter === "Minus" && r.offset.includes("-")) ||
        (offsetFilter === "UTC" && (r.offset === "UTC" || r.offset === "GMT"));

      return matchSearch && matchDst && matchOffset;
    });
  }, [rows, search, dstFilter, offsetFilter]);

  // Sorting
  const sortedRows = useMemo(() => {
    const sorted = [...filteredRows];
    sorted.sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];

      if (typeof valA === "string" && typeof valB === "string") {
        return sortDirection === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      } else if (typeof valA === "boolean" && typeof valB === "boolean") {
        return sortDirection === "asc"
          ? (valA ? 1 : 0) - (valB ? 1 : 0)
          : (valB ? 1 : 0) - (valA ? 1 : 0);
      }
      return 0;
    });
    return sorted;
  }, [filteredRows, sortField, sortDirection]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / itemsPerPage));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedRows.slice(start, start + itemsPerPage);
  }, [sortedRows, currentPage]);

  const handleSort = (field: keyof TimeZoneRow) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn bg-transparent border-none p-0">
      {/* Filtering Header (SEAMLESS NO BORDERS) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 border-b border-white/10 pb-6 bg-transparent">
        
        {/* Search Input (No Search Icon) */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search timezone columns..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-2xl border border-white/10 bg-[#0e0e15] py-2.5 px-4 text-xs font-bold text-zinc-200 placeholder-[#5a5a66] outline-none focus:border-white/[0.12] transition-colors"
          />
        </div>

        {/* Filter selects (Styled to match Admin UI) */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="text-[0.65rem] text-white/45 font-bold uppercase tracking-widest">
            Filters:
          </div>

          <CustomSelect
            options={offsetOptions}
            value={offsetFilter}
            onChange={(val) => {
              setOffsetFilter(val);
              setCurrentPage(1);
            }}
            triggerClassName="bg-[#0e0e15] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-300 outline-none cursor-pointer hover:border-white/[0.12] transition-all text-left flex justify-between items-center w-48"
          />

          <CustomSelect
            options={dstOptions}
            value={dstFilter}
            onChange={(val) => {
              setDstFilter(val);
              setCurrentPage(1);
            }}
            triggerClassName="bg-[#0e0e15] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-300 outline-none cursor-pointer hover:border-white/[0.12] transition-all text-left flex justify-between items-center w-48"
          />
        </div>
      </div>

      {/* Table (SEAMLESS NO BORDERS, BLENDED) */}
      <div className="overflow-x-auto bg-transparent border-none p-0">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-transparent text-white/45 font-bold uppercase tracking-wider text-[0.65rem]">
              <th className="py-4 px-6 cursor-pointer hover:text-zinc-300" onClick={() => handleSort("zone")}>
                IANA Zone Name {sortField === "zone" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
              <th className="py-4 px-6 cursor-pointer hover:text-zinc-300" onClick={() => handleSort("country")}>
                Country {sortField === "country" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
              <th className="py-4 px-6 cursor-pointer hover:text-zinc-300 text-center" onClick={() => handleSort("offset")}>
                UTC Offset {sortField === "offset" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
              <th className="py-4 px-6 cursor-pointer hover:text-zinc-300 text-center" onClick={() => handleSort("abbreviation")}>
                Abbrev {sortField === "abbreviation" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
              <th className="py-4 px-6 text-right font-bold tracking-wider">Current Local Time</th>
              <th className="py-4 px-6 text-center cursor-pointer hover:text-zinc-300" onClick={() => handleSort("hasDst")}>
                DST Observer {sortField === "hasDst" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
              <th className="py-4 px-6 w-12 text-center font-bold tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="font-semibold text-zinc-300">
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-white/45 text-xs font-bold uppercase tracking-wider">
                  No matching parameters located.
                </td>
              </tr>
            ) : (
              paginatedRows.map((r) => {
                const isExpanded = expandedZone === r.zone;
                return (
                  <React.Fragment key={r.zone}>
                    <tr
                      onClick={() => onSetExpandedZone(isExpanded ? null : r.zone)}
                      className={`cursor-pointer border-b border-black/[0.06] transition-colors last:border-0 ${plainHoverTableRow} ${
                        isExpanded ? "bg-white/[0.005]" : ""
                      }`}
                    >
                      <td className="py-4 px-6 font-bold text-white font-mono text-xs">{r.zone}</td>
                      <td className="py-4 px-6 text-xs text-white/45">
                        {r.country}
                      </td>
                      <td className="py-4 px-6 text-center font-mono text-xs text-white/45">{r.offset}</td>
                      <td className="py-4 px-6 text-center font-mono text-xs text-white/45">{r.abbreviation}</td>
                      <td className="py-4 px-6 text-right font-mono text-white text-xs">{r.currentTime}</td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`text-[0.6rem] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider ${
                            r.hasDst ? "bg-zinc-400/10 text-zinc-300" : "bg-white text-white/45"
                          }`}
                        >
                          {r.hasDst ? "Observer" : "None"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center text-[0.65rem] font-bold text-white/45 hover:text-white">
                        {isExpanded ? "COLLAPSE" : "EXPAND"}
                      </td>
                    </tr>

                    {/* Seamless Expanded details block */}
                    {isExpanded && (
                      <tr className="bg-transparent border-none">
                        <td colSpan={7} className="px-8 py-6 bg-transparent border-b border-black/[0.06]">
                          <ExpandedCountryDetails
                            country={r.countryDetails}
                            currentTime={r.currentTime}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between border-t border-white/10 pt-6 text-[0.65rem] font-bold text-white/45 uppercase tracking-wider">
        <div>
          Showing <span className="text-white/45">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
          <span className="text-white/45">
            {Math.min(currentPage * itemsPerPage, sortedRows.length)}
          </span>{" "}
          of <span className="text-white/45">{sortedRows.length}</span> timezones
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-xl border border-white/10 bg-[#0e0e15] hover:bg-white/[0.04] disabled:opacity-30 transition-all cursor-pointer text-white/45 hover:text-white"
          >
            PREV
          </button>
          <span className="text-white/45">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded-xl border border-white/10 bg-[#0e0e15] hover:bg-white/[0.04] disabled:opacity-30 transition-all cursor-pointer text-white/45 hover:text-white"
          >
            NEXT
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Expanded details layout sizes increased (BLENDED) ──
interface ExpandedCountryDetailsProps {
  country: CountryData;
  currentTime: string;
}

function ExpandedCountryDetails({
  country,
  currentTime,
}: ExpandedCountryDetailsProps) {
  const weatherSim = useMemo(() => {
    const num = Math.abs(Math.round(country.latitude + country.longitude)) % 5;
    const condList = [
      { text: "Mostly Clear", temp: 22 },
      { text: "Partly Cloudy", temp: 18 },
      { text: "Overcast", temp: 15 },
      { text: "Light Rain", temp: 13 },
      { text: "Scattered Storms", temp: 28 },
    ];
    return condList[num];
  }, [country]);

  const hourOffset = Math.round(country.latitude / 15);
  const sunRiseHr = 6 + (hourOffset > 0 ? -Math.min(2, hourOffset) : Math.max(-2, hourOffset));
  const sunSetHr = 18 + (hourOffset > 0 ? Math.min(3, hourOffset) : -Math.max(-3, hourOffset));
  const sunriseStr = `${String(sunRiseHr).padStart(2, "0")}:15`;
  const sunsetStr = `${String(sunSetHr).padStart(2, "0")}:42`;

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 py-2 text-white/45 bg-transparent border-none">
      
      {/* Col 1: Geopolitics */}
      <DetailCol title="Geopolitics">
        <DetailEntry label="Capital City" value={country.capital} />
        <DetailEntry label="Largest City" value={country.largestCity} />
        <DetailEntry label="Continent" value={country.continent} />
        <DetailEntry label="Region" value={country.region} />
        <DetailEntry label="Subregion" value={country.subregion} />
        <DetailEntry label="Government" value={country.government} />
        <DetailEntry label="Official Languages" value={country.languages.join(", ")} />
      </DetailCol>

      {/* Col 2: Utilities & Demographics */}
      <DetailCol title="Utilities & Metrics">
        <DetailEntry label="Power Plugs" value={country.plugs} />
        <DetailEntry label="Grid Voltage" value={country.voltage} />
        <DetailEntry label="Driving Side" value={`${country.drivingSide} hand`} />
        <DetailEntry label="Currency" value={country.currency} />
        <DetailEntry label="Official TLD" value={country.tld} mono />
        <DetailEntry label="Official ISO" value={country.iso} mono />
        <DetailEntry label="Population" value={country.population} />
        <DetailEntry label="Total Area" value={country.area} />
      </DetailCol>

      {/* Col 3: Time Systems & Weather */}
      <DetailCol title="Astronomical & Weather">
        <DetailEntry label="Local Time" value={currentTime} highlight />
        <DetailEntry label="Time Zone" value={country.timezone} mono />
        <DetailEntry label="DST Rules" value={country.dstRule} />
        <DetailEntry label="Weekend Days" value={country.weekendDays.join(" - ")} />
        <DetailEntry label="Sunrise" value={sunriseStr} />
        <DetailEntry label="Sunset" value={sunsetStr} />
        <DetailEntry label="Weather" value={`${weatherSim.text} (${weatherSim.temp}°C)`} />
      </DetailCol>

    </div>
  );
}

// Layout helper column
function DetailCol({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="mb-3.5 text-[0.65rem] uppercase tracking-widest font-extrabold text-white/45">
        {title}
      </h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

// Layout entry row helper
function DetailEntry({
  label,
  value,
  mono,
  highlight,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-xs border-b border-white/[0.02] pb-1.5 last:border-0 last:pb-0">
      <span className="text-white/45 shrink-0 font-bold uppercase tracking-wider text-[0.6rem]">{label}</span>
      <span
        className={`text-right truncate max-w-[220px] ${
          highlight ? "text-white font-mono text-xs font-black" : "text-white/45 font-semibold"
        } ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
