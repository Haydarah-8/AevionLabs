"use client";

import { useMemo } from "react";
import { formatDuration } from "@/lib/visitors/format";
import { assess, CONNECTION_LABEL } from "@/lib/visitors/intel";
import type { VisitorProfile } from "@/lib/visitors/profile";
import { describePlace, placeConfidence } from "@/lib/visitors/place";

/**
 * One visitor, in full.
 *
 * Rebuilt in plain type. The rest of the admin sets its labels in small
 * uppercase with wide letter-spacing and its numbers in monospace; this panel
 * does neither. It is the densest screen in the product — a hundred-odd
 * separate facts about one person — and that treatment made every one of them
 * shout at the same volume, which is the same as none of them being emphasised
 * at all.
 *
 * Hierarchy comes from weight, size and space instead: section titles are
 * heavier and larger, labels are quieter than their values, and groups are
 * separated by rules and generous vertical space. Sentence case throughout,
 * because it is simply easier to read.
 *
 * The charts are drawn here rather than taken from the shared chart library,
 * which sets its own axes in monospace and is used by pages this rebuild is
 * not meant to touch.
 */

const CARD = "rounded-lg border border-black/10 bg-[#f6f6f6]";

function when(iso: string) {
  const at = Date.parse(iso);
  if (Number.isNaN(at)) return "—";
  return new Date(at).toLocaleString([], {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ago(iso: string) {
  const at = Date.parse(iso);
  if (Number.isNaN(at)) return "";
  const diff = Date.now() - at;
  if (diff < 60_000) return "just now";
  if (diff < 3600_000) return `${Math.round(diff / 60_000)} minutes ago`;
  if (diff < 86_400_000) return `${Math.round(diff / 3600_000)} hours ago`;
  return `${Math.round(diff / 86_400_000)} days ago`;
}

/**
 * Yes, no, or nothing at all.
 *
 * An unchecked flag reads as a dash rather than "No", because "we did not
 * look" and "we looked and it is not" are different answers.
 */
function yesNo(value: boolean | undefined) {
  if (value === undefined) return "";
  return value ? "Yes" : "No";
}

/** Milliseconds, or nothing when the browser did not report the timing. */
function ms(value: number | null | undefined) {
  return typeof value === "number" ? `${Math.round(value)} ms` : "";
}

export function VisitorModalBody({ profile }: { profile: VisitorProfile }) {
  const { latest, engagement, cadence } = profile;
  const intel = assess(profile);

  /**
   * Visits per day over the fortnight ending at their last visit.
   *
   * The window ends at the visitor rather than at the current moment: reading
   * the clock during render is impure, and anchoring on them is also the
   * better chart, since someone who last came a month ago would otherwise get
   * fourteen empty columns.
   */
  const daily = useMemo(() => {
    const days = 14;
    const dayMs = 86_400_000;
    const end = Date.parse(profile.lastSeen);
    const start = end - (days - 1) * dayMs;
    const buckets = Array.from({ length: days }, (_, index) => ({
      at: start + index * dayMs,
      count: 0,
    }));
    for (const session of profile.sessions) {
      const at = Date.parse(session.startedAt);
      if (!Number.isFinite(at) || at < start) continue;
      const index = Math.min(days - 1, Math.floor((at - start) / dayMs));
      if (index >= 0) buckets[index].count += 1;
    }
    return buckets;
  }, [profile.lastSeen, profile.sessions]);

  /**
   * The place, worded to match what the address can support.
   *
   * On a mobile connection this reads "Walsall, England, United Kingdom
   * (carrier gateway, not the handset)" rather than asserting a town the
   * packet does not carry.
   */
  const place = describePlace(
    [latest.location?.city, latest.location?.region, latest.location?.country],
    placeConfidence(latest.location),
  );

  return (
    <div className="space-y-12 pb-4">
      {/* The five things you want before anything else. */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <Headline label="Visits" value={String(profile.sessions.length)} />
        <Headline label="Pages read" value={String(profile.views)} />
        <Headline
          label="Time on site"
          value={formatDuration(engagement.totalMinutes)}
        />
        <Headline
          label="First seen"
          value={when(profile.firstSeen)}
          small
        />
        <Headline
          label="Last seen"
          value={when(profile.lastSeen)}
          note={ago(profile.lastSeen)}
          small
        />
      </section>

      {/* The first question about any row on this desk is whether it is a
          person at all, and for a great many of them it is not. */}
      <section
        className="rounded-lg border px-5 py-4"
        style={{
          borderColor:
            intel.verdict === "person"
              ? "rgba(90,200,168,0.35)"
              : intel.verdict === "unknown"
                ? "rgba(255,255,255,0.08)"
                : "rgba(201,150,63,0.35)",
          backgroundColor:
            intel.verdict === "person"
              ? "rgba(90,200,168,0.05)"
              : intel.verdict === "unknown"
                ? "rgba(255,255,255,0.015)"
                : "rgba(201,150,63,0.05)",
        }}
      >
        <p
          className="text-[1.05rem] font-medium"
          style={{
            color:
              intel.verdict === "person"
                ? "#5ac8a8"
                : intel.verdict === "unknown"
                  ? "#8b8b96"
                  : "#c9963f",
          }}
        >
          {intel.headline}
        </p>
        <ul className="mt-2 space-y-1">
          {intel.reasons.map((reason) => (
            <li key={reason} className="text-[0.88rem] text-[#737373]">
              {reason}
            </li>
          ))}
        </ul>
      </section>

      <Group title="Activity">
        <div className="grid gap-8 lg:grid-cols-2">
          <Panel
            title="Visits per day"
            note="The fortnight ending at their last visit"
          >
            <DayBars series={daily} />
          </Panel>
          <Panel
            title="Reading hours"
            note={latest.location?.timezone || "Timezone unknown"}
          >
            <HourBars hours={cadence.byHour} />
          </Panel>
        </div>
      </Group>

      <Group title="Behaviour">
        <div className="grid grid-cols-2 gap-x-8 gap-y-7 sm:grid-cols-4">
          <Field label="Average visit" value={formatDuration(engagement.averageVisitMinutes)} />
          <Field label="Longest visit" value={formatDuration(engagement.longestVisitMinutes)} />
          <Field label="Pages per visit" value={String(engagement.pagesPerVisit)} />
          <Field
            label="One-page visits"
            value={`${engagement.singlePageVisits} of ${profile.sessions.length}`}
          />
          <Field
            label="Typical gap between visits"
            value={
              cadence.averageGapHours === null
                ? "Only one visit"
                : formatDuration(Math.round(cadence.averageGapHours * 60))
            }
          />
          <Field
            label="Longest gap"
            value={
              cadence.longestGapHours === null
                ? ""
                : formatDuration(Math.round(cadence.longestGapHours * 60))
            }
          />
          <Field
            label="Known for"
            value={formatDuration(Math.round(cadence.knownForHours * 60))}
          />
          <Field
            label="Median page load"
            value={profile.medianLoadMs !== null ? `${profile.medianLoadMs} ms` : ""}
          />
        </div>
      </Group>

      <Group title="What they read">
        <div className="grid gap-8 lg:grid-cols-2">
          <Panel title={`Pages · ${profile.pages.length}`}>
            <ul className="mt-1">
              {profile.pages.map((page) => (
                <Line
                  key={page.path}
                  primary={page.path}
                  secondary={page.title}
                  count={page.views}
                />
              ))}
            </ul>
          </Panel>

          <div className="space-y-8">
            {profile.entryPages.length ? (
              <Panel title="Arrived on" note="First page of each visit">
                <ul className="mt-1">
                  {profile.entryPages.slice(0, 5).map((row) => (
                    <Line key={row.path} primary={row.path} count={row.count} />
                  ))}
                </ul>
              </Panel>
            ) : null}

            {profile.exitPages.length ? (
              <Panel title="Left from" note="Last page of each visit">
                <ul className="mt-1">
                  {profile.exitPages.slice(0, 5).map((row) => (
                    <Line key={row.path} primary={row.path} count={row.count} />
                  ))}
                </ul>
              </Panel>
            ) : null}

            {profile.referrers.length ? (
              <Panel title="Came from">
                <ul className="mt-1">
                  {profile.referrers.map((entry) => (
                    <Line
                      key={entry.referrer}
                      primary={entry.referrer}
                      count={entry.count}
                    />
                  ))}
                </ul>
              </Panel>
            ) : null}
          </div>
        </div>
      </Group>

      <Group title="Who and where">
        <div className="grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-3">
          <Field
            label={profile.ips.length > 1 ? "Addresses" : "Address"}
            value={profile.ips.join(", ")}
          />
          <Field label="Location" value={place} />
          <Field
            label="Network"
            value={latest.location?.isp || latest.location?.org}
          />
          <Field
            label="Organisation"
            value={
              latest.location?.org && latest.location.org !== latest.location.isp
                ? latest.location.org
                : ""
            }
          />
          <Field label="Postcode" value={latest.location?.zip} />
          <Field label="Timezone" value={latest.location?.timezone} />
          <Field label="Locale" value={latest.location?.locale} />
          <Field
            label="Coordinates"
            value={
              typeof latest.location?.lat === "number" &&
              typeof latest.location?.lon === "number" ? (
                <a
                  href={`https://www.openstreetmap.org/?mlat=${latest.location.lat}&mlon=${latest.location.lon}#map=10/${latest.location.lat}/${latest.location.lon}`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-white/25 underline-offset-4 transition-colors hover:text-black"
                >
                  {latest.location.lat.toFixed(3)}, {latest.location.lon.toFixed(3)}
                </a>
              ) : (
                ""
              )
            }
          />
          <Field label="Visitor id" value={profile.visitorId} wrap />
        </div>
        {profile.ips.length > 1 ? (
          <Note>
            More than one address for the same visitor is normal — a phone
            moving between wifi and mobile data changes IP without changing
            person. The visitor id is what ties the visits together.
          </Note>
        ) : null}
      </Group>

      <Group title="The network behind the address">
        <div className="grid grid-cols-2 gap-x-8 gap-y-7 sm:grid-cols-4">
          <Field
            label="Connection"
            value={CONNECTION_LABEL[intel.connection]}
          />
          <Field label="Autonomous system" value={latest.location?.asn} />
          <Field label="Operator" value={latest.location?.asName} />
          <Field label="Reverse DNS" value={latest.location?.reverse} wrap />
          <Field
            label="Datacentre"
            value={yesNo(latest.location?.hosting)}
          />
          <Field label="VPN or proxy" value={yesNo(latest.location?.proxy)} />
          <Field label="Mobile carrier" value={yesNo(latest.location?.mobile)} />
          <Field
            label="Resolved by"
            value={
              latest.location?.source === "vercel-edge"
                ? "Edge network"
                : latest.location?.source
            }
          />
        </div>

        <Note>
          This is where the network routes the address, not where the person
          is. A mobile connection lands at the carrier&rsquo;s gateway, a VPN at
          its exit node, and a datacentre wherever the rack is — so read the
          city as a region, and the connection type above as the more reliable
          fact. One Vodafone handset in this log has been placed in nineteen
          different towns.
        </Note>
      </Group>

      <Group title="What they used">
        <div className="grid grid-cols-2 gap-x-8 gap-y-7 sm:grid-cols-4">
          <Field
            label="Device"
            value={
              profile.devices.length > 1
                ? profile.devices.join(", ")
                : latest.device?.type
            }
          />
          <Field
            label="Operating system"
            value={[latest.device?.os, latest.device?.osVersion]
              .filter(Boolean)
              .join(" ")}
          />
          <Field
            label="Browser"
            value={[latest.browser?.name, latest.browser?.version]
              .filter(Boolean)
              .join(" ")}
          />
          <Field label="Engine" value={latest.browser?.engine} />
          <Field
            label="Screen"
            value={
              latest.device?.screenWidth
                ? `${latest.device.screenWidth} × ${latest.device.screenHeight}`
                : ""
            }
          />
          <Field
            label="Viewport"
            value={
              latest.device?.viewportWidth
                ? `${latest.device.viewportWidth} × ${latest.device.viewportHeight}`
                : ""
            }
          />
          <Field
            label="Pixel ratio"
            value={latest.device?.pixelRatio ? `${latest.device.pixelRatio}×` : ""}
          />
          <Field
            label="Colour depth"
            value={latest.device?.colorDepth ? `${latest.device.colorDepth}-bit` : ""}
          />
          <Field label="Platform" value={latest.device?.platform} />
          <Field label="Vendor" value={latest.device?.vendor} />
          <Field
            label="Processor cores"
            value={
              latest.device?.hardwareConcurrency
                ? String(latest.device.hardwareConcurrency)
                : ""
            }
          />
          <Field
            label="Memory"
            value={latest.device?.deviceMemory ? `${latest.device.deviceMemory} GB` : ""}
          />
          <Field
            label="Touch points"
            value={
              typeof latest.device?.touchPoints === "number"
                ? String(latest.device.touchPoints)
                : ""
            }
          />
          <Field label="Orientation" value={latest.device?.orientation} />
          <Field
            label="Connection"
            value={
              latest.network?.effectiveType
                ? latest.network.effectiveType.toUpperCase()
                : ""
            }
          />
          <Field
            label="Downlink"
            value={latest.network?.downlink ? `${latest.network.downlink} Mbps` : ""}
          />
          <Field
            label="Round trip"
            value={latest.network?.rtt ? `${latest.network.rtt} ms` : ""}
          />
          <Field
            label="Data saver"
            value={latest.network?.saveData ? "On" : "Off"}
          />
          <Field
            label="Languages"
            value={
              latest.browser?.languages?.length
                ? latest.browser.languages.join(", ")
                : latest.browser?.language
            }
          />
          <Field
            label="Cookies"
            value={latest.browser?.cookiesEnabled ? "Enabled" : "Blocked"}
          />
          <Field
            label="Do not track"
            value={latest.browser?.doNotTrack ? "Requested" : "Not set"}
          />
        </div>

        {latest.browser?.userAgent ? (
          <div className="mt-8">
            <p className="text-[0.8rem] text-[#737373]">User agent</p>
            <p className="mt-1.5 break-all text-[0.85rem] leading-relaxed text-[#b8b8c0]">
              {latest.browser.userAgent}
            </p>
          </div>
        ) : null}

        <Note>
          Everything here is reported by the browser itself and can be spoofed
          or blocked. It describes what was sent, not what is certainly true.
        </Note>
      </Group>

      {latest.performance ? (
        <Group title="Their last page load" note="One sample, not an average">
          <div className="grid grid-cols-2 gap-x-8 gap-y-7 sm:grid-cols-4">
            <Field label="DNS lookup" value={ms(latest.performance.dnsLookup)} />
            <Field label="Connection" value={ms(latest.performance.tcpConnection)} />
            <Field label="Server response" value={ms(latest.performance.serverResponse)} />
            <Field label="First paint" value={ms(latest.performance.firstPaint)} />
            <Field label="Interactive" value={ms(latest.performance.domInteractive)} />
            <Field label="Content loaded" value={ms(latest.performance.domContentLoaded)} />
            <Field label="Fully loaded" value={ms(latest.performance.pageLoadTime)} />
          </div>
          <Note>
            These are the timings of their single most recent view. Averaging
            them across visits would blend a cold cache with a warm one.
          </Note>
        </Group>
      ) : null}

      <Group title="Every visit" note="Newest first">
        <ol className="space-y-9">
          {profile.sessions.map((session, index) => (
            <li key={session.startedAt}>
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="text-[0.95rem] font-medium text-[#111]">
                  {when(session.startedAt)}
                </span>
                <span className="text-[0.8rem] text-[#737373]">
                  {session.views.length}{" "}
                  {session.views.length === 1 ? "page" : "pages"}
                </span>
                <span className="text-[0.8rem] text-[#737373]">
                  {session.durationMinutes
                    ? formatDuration(session.durationMinutes)
                    : "Single page"}
                </span>
                <span className="ml-auto text-[0.8rem] text-[#737373]">
                  Visit {profile.sessions.length - index}
                </span>
              </div>

              <ol className="mt-3 border-l border-black/10 pl-5">
                {session.views.map((view, viewIndex) => (
                  <li key={`${view.at}-${viewIndex}`} className="relative py-2">
                    <span
                      aria-hidden
                      className="absolute -left-[1.4rem] top-[0.95rem] h-1.5 w-1.5 rounded-full bg-[#3e3e49]"
                    />
                    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                      <span className="min-w-0 flex-1 truncate text-[0.9rem] text-[#404040]">
                        {view.title || view.path}
                      </span>
                      <span className="shrink-0 text-[0.82rem] tabular-nums text-[#737373]">
                        {new Date(view.at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {view.loadMs ? ` · ${view.loadMs} ms` : ""}
                      </span>
                    </div>
                    {view.title ? (
                      <p className="mt-0.5 truncate text-[0.8rem] text-[#737373]">
                        {view.path}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ol>
      </Group>
    </div>
  );
}

/* ── Pieces ──────────────────────────────────────────────────────────────── */

/** One of the five figures across the top. */
function Headline({
  label,
  value,
  note,
  small,
}: {
  label: string;
  value: string;
  note?: string;
  small?: boolean;
}) {
  return (
    <div className={`${CARD} px-4 py-3.5`}>
      <p className="text-[0.8rem] text-[#737373]">{label}</p>
      <p
        className={`mt-1 font-medium leading-snug text-[#111] ${
          small ? "text-[0.95rem]" : "text-[1.35rem]"
        }`}
      >
        {value}
      </p>
      {note ? (
        <p className="mt-1 text-[0.78rem] text-[#737373]">{note}</p>
      ) : null}
    </div>
  );
}

/** A titled band of the panel. */
function Group({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-5 flex flex-wrap items-baseline gap-x-4 border-b border-black/10 pb-2.5">
        <h3 className="text-[1.05rem] font-medium text-[#111]">{title}</h3>
        {note ? (
          <span className="text-[0.82rem] text-[#737373]">{note}</span>
        ) : null}
      </div>
      {children}
    </section>
  );
}

/** A titled block inside a band. */
function Panel({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h4 className="text-[0.9rem] font-medium text-[#404040]">{title}</h4>
        {note ? (
          <span className="text-[0.8rem] text-[#737373]">{note}</span>
        ) : null}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

/** A labelled value. Dashes rather than blanks, so a gap reads as measured. */
function Field({
  label,
  value,
  wrap,
}: {
  label: string;
  value: React.ReactNode;
  wrap?: boolean;
}) {
  const empty = value === "" || value === null || value === undefined;
  return (
    <div>
      <p className="text-[0.8rem] leading-snug text-[#737373]">{label}</p>
      <p
        className={`mt-1 text-[0.95rem] leading-snug text-[#111] ${
          wrap ? "break-all" : ""
        }`}
      >
        {empty ? <span className="text-[#a3a3a3]">—</span> : value}
      </p>
    </div>
  );
}

/** A path or referrer with its count. */
function Line({
  primary,
  secondary,
  count,
}: {
  primary: string;
  secondary?: string;
  count: number;
}) {
  return (
    <li className="flex items-baseline justify-between gap-6 border-b border-black/10 py-2.5 last:border-0">
      <span className="min-w-0">
        <span className="block truncate text-[0.9rem] text-[#404040]">
          {primary}
        </span>
        {secondary ? (
          <span className="mt-0.5 block truncate text-[0.8rem] text-[#737373]">
            {secondary}
          </span>
        ) : null}
      </span>
      <span className="shrink-0 text-[0.9rem] tabular-nums text-[#737373]">
        {count}
      </span>
    </li>
  );
}

/** A caveat, set quietly. */
function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-6 max-w-2xl text-[0.82rem] leading-relaxed text-[#737373]">
      {children}
    </p>
  );
}

/** Visits per day, one column per day. */
function DayBars({ series }: { series: Array<{ at: number; count: number }> }) {
  const max = Math.max(1, ...series.map((point) => point.count));
  const label = (at: number) =>
    new Date(at).toLocaleDateString([], { day: "numeric", month: "short" });
  return (
    <div>
      <div className="flex h-20 items-end gap-1.5">
        {series.map((point) => (
          <div
            key={point.at}
            className="flex-1 rounded-sm transition-colors"
            title={`${label(point.at)} — ${point.count} ${point.count === 1 ? "visit" : "visits"}`}
            style={{
              height: `${Math.max(point.count ? 10 : 3, (point.count / max) * 100)}%`,
              backgroundColor: point.count ? "#ffffff" : "rgba(255,255,255,0.06)",
            }}
          />
        ))}
      </div>
      {/* No clock fallback here: reading the time during render is impure, and
          an empty series has no dates to label rather than today's. */}
      <div className="mt-2 flex justify-between text-[0.78rem] text-[#737373]">
        <span>{series.length ? label(series[0].at) : ""}</span>
        <span>
          {series.length ? label(series[series.length - 1].at) : ""}
        </span>
      </div>
    </div>
  );
}

/**
 * Views by hour of day, in the visitor's own time.
 *
 * Bars rather than a line: these are discrete buckets, and a line drawn
 * between 03:00 and 04:00 would imply a continuity hourly counts do not have.
 */
function HourBars({ hours }: { hours: number[] }) {
  const max = Math.max(1, ...hours);
  return (
    <div>
      <div className="flex h-20 items-end gap-[3px]">
        {hours.map((count, hour) => (
          <div
            key={hour}
            className="flex-1 rounded-sm"
            title={`${String(hour).padStart(2, "0")}:00 — ${count} ${count === 1 ? "view" : "views"}`}
            style={{
              height: `${Math.max(count ? 10 : 3, (count / max) * 100)}%`,
              backgroundColor: count ? "#ffffff" : "rgba(255,255,255,0.06)",
            }}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[0.78rem] text-[#737373]">
        <span>Midnight</span>
        <span>Noon</span>
        <span>Midnight</span>
      </div>
    </div>
  );
}
