"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { OverviewDashboard } from "@/components/admin/OverviewDashboard";
import { VisitorsTab } from "@/components/admin/VisitorsTab";
import { TimeIntelligenceTab } from "@/components/admin/TimeIntelligenceTab";
import { useVisitorFeedContext } from "@/components/admin/VisitorFeedProvider";
import { aggregateVisitorData } from "@/lib/analytics-aggregator";
import { isAutomated } from "@/lib/visitors/intel";

type Panel = "overview" | "audit" | "time";

const TABS: Array<{ id: Panel; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "audit", label: "Audit stream" },
  { id: "time", label: "Time matrix" },
];

export default function AdminOverviewPage() {
  const [panel, setPanel] = useState<Panel>("overview");

  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get("tab");
    if (tab === "audit" || tab === "time" || tab === "overview") {
      setPanel(tab);
    }
  }, []);

  const {
    visitors: allVisitors,
    aggregated: allAggregated,
    loading,
    fetchData,
  } = useVisitorFeedContext();

  const [peopleOnly, setPeopleOnly] = useState(true);

  const visitors = useMemo(
    () =>
      peopleOnly ? allVisitors.filter((v) => !isAutomated(v)) : allVisitors,
    [allVisitors, peopleOnly],
  );

  const aggregated = useMemo(
    () => (peopleOnly ? aggregateVisitorData(visitors) : allAggregated),
    [peopleOnly, visitors, allAggregated],
  );

  const uniqueIPs = useMemo(
    () => new Set(visitors.map((v) => v.ip)).size,
    [visitors],
  );
  const totalEvents = visitors.length;

  const { topReferrers, topBrowsers } = useMemo(() => {
    const refCounts = new Map<string, number>();
    visitors.forEach((v) => {
      let ref = "direct";
      if (v.page.referrer) {
        try {
          ref = new URL(v.page.referrer).hostname.replace("www.", "");
        } catch {
          ref = v.page.referrer;
        }
      }
      refCounts.set(ref, (refCounts.get(ref) || 0) + 1);
    });
    const referrers = Array.from(refCounts.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const browserCounts = new Map<string, number>();
    visitors.forEach((v) => {
      const b = v.browser.name || "Unknown";
      browserCounts.set(b, (browserCounts.get(b) || 0) + 1);
    });
    const browsers = Array.from(browserCounts.entries())
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return { topReferrers: referrers, topBrowsers: browsers };
  }, [visitors]);

  function selectPanel(next: Panel) {
    setPanel(next);
    const url = new URL(window.location.href);
    if (next === "overview") url.searchParams.delete("tab");
    else url.searchParams.set("tab", next);
    window.history.replaceState({}, "", url.toString());
  }

  return (
    <AdminShell>
      <div className="mb-10">
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-white/40">
          Control
        </p>
        <h2 className="mt-2 text-[clamp(1.75rem,3vw,2.5rem)] font-normal tracking-[-0.035em] text-white">
          Overview
        </h2>
        <p className="mt-3 max-w-xl text-[1rem] font-light leading-relaxed text-white/50">
          Audience, live audit, and time intelligence on one page.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-2 border-b border-white/[0.08] pb-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => selectPanel(tab.id)}
            className={`rounded-full px-4 py-2 text-sm transition-colors ${
              panel === tab.id
                ? "bg-white text-[#0d1730]"
                : "text-white/55 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
        {panel === "overview" ? (
          <button
            type="button"
            onClick={() => setPeopleOnly((current) => !current)}
            className="ml-auto flex items-center gap-2 text-[0.85rem] text-white/45 transition-colors hover:text-white"
          >
            <span
              aria-hidden
              className={`h-1.5 w-1.5 rounded-full ${
                peopleOnly ? "bg-[#5ac8a8]" : "bg-white/25"
              }`}
            />
            {peopleOnly ? "People only" : "Including machines"}
          </button>
        ) : null}
      </div>

      {panel === "overview" ? (
        loading || !aggregated ? (
          <p className="text-[0.95rem] text-white/45">Reading the log…</p>
        ) : (
          <OverviewDashboard
            data={aggregated}
            uniqueIPs={uniqueIPs}
            totalEvents={totalEvents}
            topReferrers={topReferrers}
            topBrowsers={topBrowsers}
          />
        )
      ) : null}

      {panel === "audit" ? (
        <VisitorsTab
          visitors={allVisitors}
          loading={loading}
          onRefresh={fetchData}
        />
      ) : null}

      {panel === "time" ? <TimeIntelligenceTab /> : null}
    </AdminShell>
  );
}
