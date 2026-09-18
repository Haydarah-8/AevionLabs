"use client";

import { useState } from "react";
import {
  BreakdownModalBody,
  type BreakdownRow,
} from "@/components/admin/BreakdownModal";
import { ExplainProvider } from "@/components/admin/Explain";
import { Modal } from "@/components/admin/Modal";
import { PlainFigure, PlainHeading, PlainRow } from "@/components/admin/plain";
import { TrafficChart } from "@/components/admin/TrafficChart";
import { TopPages } from "@/components/admin/TopPages";
import { GlobalTimeConverter } from "@/components/admin/GlobalTimeConverter";
import { GeoBreakdown, DeviceBreakdown } from "@/components/admin/GeoDevices";
import { HourlyChart } from "@/components/admin/HourlyChart";
import type { AggregatedData } from "@/lib/analytics-aggregator";

export function OverviewDashboard({
  data,
  uniqueIPs,
  totalEvents,
  topReferrers,
  topBrowsers,
}: {
  data: AggregatedData;
  uniqueIPs: number;
  totalEvents: number;
  topReferrers: { source: string; count: number }[];
  topBrowsers: { browser: string; count: number }[];
}) {
  const {
    overviewStats,
    dailyTraffic,
    topPages,
    topCountries,
    deviceBreakdown,
    hourlyDistribution,
  } = data;

  /**
   * Which full breakdown is open.
   *
   * Every panel on this page is a top-five; the modal is where the rest of the
   * list lives, so nothing is silently truncated away.
   */
  const [open, setOpen] = useState<null | {
    title: string;
    unit: string;
    note?: string;
    rows: BreakdownRow[];
  }>(null);

  const openPages = () =>
    setOpen({
      title: "Every page",
      unit: "views",
      note: "Paths as reported by the browser, so a page reached with different query strings is counted once under its path.",
      rows: topPages.map((page) => ({
        id: page.path,
        label: page.path,
        sub: page.title || undefined,
        value: page.views,
      })),
    });

  const openReferrers = () =>
    setOpen({
      title: "Every acquisition channel",
      unit: "arrivals",
      note: "Referrers are sent by the browser and are routinely stripped — a large direct share usually means missing referrers rather than typed-in addresses.",
      rows: topReferrers.map((entry) => ({
        id: entry.source,
        label: entry.source,
        value: entry.count,
      })),
    });

  const openBrowsers = () =>
    setOpen({
      title: "Every browser",
      unit: "views",
      note: "Parsed from the user-agent string, which can be spoofed and is increasingly frozen by browsers themselves.",
      rows: topBrowsers.map((entry) => ({
        id: entry.browser,
        label: entry.browser,
        value: entry.count,
      })),
    });

  const openCountries = () =>
    setOpen({
      title: "Every country",
      unit: "visitors",
      note: "Derived from the IP address. A VPN or corporate proxy reports where the exit node is, not where the reader is.",
      rows: topCountries.map((entry) => ({
        id: entry.country,
        label: entry.country,
        sub: entry.code,
        value: entry.visitors,
      })),
    });

  const openDevices = () =>
    setOpen({
      title: "Every device type",
      // The aggregator only keeps a share for devices, never a count, so this
      // is a percentage. Labelling it "views" would be a number that does not
      // exist.
      unit: "per cent",
      note: "Device type is inferred from the user-agent string. Only the share is recorded, not the underlying count.",
      rows: deviceBreakdown.map((entry) => ({
        id: entry.device,
        label: entry.device,
        value: entry.percentage,
      })),
    });

  return (
    <ExplainProvider>
    <div className="space-y-16">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <PlainFigure
          label="Visitors"
          value={overviewStats.totalVisitors}
          note={changeNote(overviewStats.visitorsChange)}
        />
        <PlainFigure
          label="Page views"
          value={overviewStats.totalPageViews}
          note={changeNote(overviewStats.pageViewsChange)}
        />
        <PlainFigure label="Unique addresses" value={uniqueIPs} />
        <PlainFigure label="Events" value={totalEvents} />
        <PlainFigure
          label="Average visit"
          value={overviewStats.avgSessionDuration}
        />
        <PlainFigure
          label="Left straight away"
          value={`${overviewStats.bounceRate}%`}
        />
      </div>

      <div className="border-t border-white/10 pt-10">
        <TrafficChart
          dailyData={dailyTraffic}
          hourlyData={hourlyDistribution}
        />
      </div>

      <div className="grid grid-cols-1 gap-12 border-t border-white/10 pt-10 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <button
            type="button"
            onClick={openPages}
            className="w-full text-left transition-opacity hover:opacity-75"
          >
            <TopPages pages={topPages} />
          </button>
        </div>
        <div className="lg:col-span-2">
          <GlobalTimeConverter />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12 border-t border-white/10 pt-10 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <button
            type="button"
            onClick={openReferrers}
            className="w-full text-left transition-opacity hover:opacity-75"
          >
            <TopReferrers referrers={topReferrers} />
          </button>
        </div>
        <div className="lg:col-span-2">
          <button
            type="button"
            onClick={openBrowsers}
            className="w-full text-left transition-opacity hover:opacity-75"
          >
            <BrowserBreakdown browsers={topBrowsers} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12 border-t border-white/10 pt-10 md:grid-cols-2 lg:grid-cols-3">
        <button type="button" onClick={openCountries} className="text-left transition-opacity hover:opacity-75">
          <GeoBreakdown countries={topCountries} />
        </button>
        <button type="button" onClick={openDevices} className="text-left transition-opacity hover:opacity-75">
          <DeviceBreakdown devices={deviceBreakdown} />
        </button>
        <HourlyChart data={hourlyDistribution} />
      </div>

      <Modal
        open={Boolean(open)}
        onClose={() => setOpen(null)}
        eyebrow={open ? <span>{open.rows.length} entries</span> : null}
        title={open?.title ?? ""}
      >
        {open ? (
          <BreakdownModalBody
            rows={open.rows}
            unit={open.unit}
            note={open.note}
          />
        ) : null}
      </Modal>
    </div>
    </ExplainProvider>
  );
}

function TopReferrers({
  referrers,
}: {
  referrers: { source: string; count: number }[];
}) {
  const most = Math.max(...referrers.map((entry) => entry.count), 1);
  return (
    <div>
      <PlainHeading note={`${referrers.length} sources`}>
        Where they came from
      </PlainHeading>
      <ul>
        {referrers.map((ref) => (
          <PlainRow
            key={ref.source}
            primary={ref.source}
            value={ref.count.toLocaleString()}
            bar={ref.count / most}
          />
        ))}
      </ul>
    </div>
  );
}

function BrowserBreakdown({
  browsers,
}: {
  browsers: { browser: string; count: number }[];
}) {
  const total = browsers.reduce((sum, b) => sum + b.count, 0) || 1;
  return (
    <div>
      <PlainHeading>Browsers</PlainHeading>
      <div className="space-y-4">
        {browsers.map((b) => {
          const pct = Math.round((b.count / total) * 100);
          return (
            <div key={b.browser} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[0.9rem] text-white/75">{b.browser}</span>
                <span className="text-[0.9rem] tabular-nums text-white/45">
                  {pct}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full border border-white/10 bg-white/[0.01]">
                <div
                  className="h-full rounded-full bg-[#ffffff]"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * A change against the previous period, in words.
 *
 * The arrow carries the direction on its own, so colour is not doing the work
 * alone — and "no change" is said rather than shown as a bare zero.
 */
function changeNote(change: number | undefined) {
  if (change === undefined) return undefined;
  if (change === 0) return "level with last month";
  return `${change > 0 ? "↑" : "↓"} ${Math.abs(change)}% on last month`;
}
