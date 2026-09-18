import type { VisitorRecord, VisitorStats } from "@/lib/tracker-store";
import type {
  DailyTraffic,
  PageStat,
  SourceStat,
  CountryStat,
  DeviceStat,
} from "@/data/analytics";

export type AggregatedData = {
  overviewStats: {
    totalVisitors: number;
    totalPageViews: number;
    avgSessionDuration: string;
    bounceRate: number;
    liveVisitors: number;
    visitorsChange: number;
    pageViewsChange: number;
    sessionChange: number;
    bounceChange: number;
  };
  dailyTraffic: DailyTraffic[];
  topPages: PageStat[];
  trafficSources: SourceStat[];
  topCountries: CountryStat[];
  deviceBreakdown: DeviceStat[];
  hourlyDistribution: DailyTraffic[];
};

function todayStart(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export function aggregateVisitorData(
  visitors: VisitorRecord[],
): AggregatedData {
  if (!visitors || visitors.length === 0) {
    return {
      overviewStats: {
        totalVisitors: 0,
        totalPageViews: 0,
        avgSessionDuration: "—",
        bounceRate: 0,
        liveVisitors: 0,
        visitorsChange: 0,
        pageViewsChange: 0,
        sessionChange: 0,
        bounceChange: 0,
      },
      dailyTraffic: [],
      topPages: [],
      trafficSources: [],
      topCountries: [],
      deviceBreakdown: [],
      hourlyDistribution: Array.from({ length: 24 }, (_, i) => ({
        date: `${String(i).padStart(2, "0")}:00`,
        visitors: 0,
        pageViews: 0,
        sessions: 0,
      })),
    };
  }

  // 1. Session maps
  const sessionsMap = new Map<string, number[]>(); // key: visitorId_sessionNumber, value: timestamps
  const sessionsPages = new Map<string, string[]>(); // key: sessionNumber, value: pathnames visited

  visitors.forEach((v) => {
    const key = `${v.visitorId}_${v.sessionNumber}`;
    const ms = new Date(v.timestamp).getTime();
    if (!sessionsMap.has(key)) {
      sessionsMap.set(key, []);
      sessionsPages.set(key, []);
    }
    sessionsMap.get(key)!.push(ms);
    sessionsPages.get(key)!.push(v.page.path || "/");
  });

  // Calculate session duration and bounces
  let totalDurationMs = 0;
  let sessionCount = 0;
  let bounces = 0;

  sessionsMap.forEach((times) => {
    sessionCount++;
    if (times.length > 1) {
      const min = Math.min(...times);
      const max = Math.max(...times);
      totalDurationMs += max - min;
    } else {
      totalDurationMs += 30000; // Assume 30 seconds average for single pageview session
      bounces++;
    }
  });

  const avgMs = sessionCount > 0 ? totalDurationMs / sessionCount : 0;
  const avgSeconds = Math.round(avgMs / 1000);
  const minutes = Math.floor(avgSeconds / 60);
  const seconds = avgSeconds % 60;
  const avgSessionDuration = avgSeconds > 0 ? `${minutes}m ${seconds}s` : "—";
  const overallBounceRate =
    sessionCount > 0 ? Math.round((bounces / sessionCount) * 1000) / 10 : 0;

  // Live visitors (last 5 minutes)
  const fiveMinsAgo = Date.now() - 5 * 60 * 1000;
  const liveVisitors = new Set(
    visitors
      .filter((v) => new Date(v.timestamp).getTime() >= fiveMinsAgo)
      .map((v) => v.visitorId),
  ).size;

  // Periods comparison for changes
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const sixtyDaysAgo = Date.now() - 60 * 24 * 60 * 60 * 1000;

  const currentPeriod = visitors.filter(
    (v) => new Date(v.timestamp).getTime() >= thirtyDaysAgo,
  );
  const previousPeriod = visitors.filter((v) => {
    const time = new Date(v.timestamp).getTime();
    return time >= sixtyDaysAgo && time < thirtyDaysAgo;
  });

  const currentVis = new Set(currentPeriod.map((r) => r.visitorId)).size;
  const prevVis = new Set(previousPeriod.map((r) => r.visitorId)).size;
  const visitorsChange =
    prevVis > 0
      ? Math.round(((currentVis - prevVis) / prevVis) * 1000) / 10
      : 0;

  const currentPV = currentPeriod.length;
  const prevPV = previousPeriod.length;
  const pageViewsChange =
    prevPV > 0 ? Math.round(((currentPV - prevPV) / prevPV) * 1000) / 10 : 0;

  // 2. Daily Traffic (30-day timeline)
  const dailyTraffic: DailyTraffic[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dateLabel = d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });

    const dayRecords = visitors.filter((v) => {
      const recordDate = new Date(v.timestamp);
      return (
        recordDate.getDate() === d.getDate() &&
        recordDate.getMonth() === d.getMonth() &&
        recordDate.getFullYear() === d.getFullYear()
      );
    });

    const dayVisitors = new Set(dayRecords.map((r) => r.visitorId)).size;
    const dayPV = dayRecords.length;
    const daySessions = new Set(
      dayRecords.map((r) => `${r.visitorId}_${r.sessionNumber}`),
    ).size;

    dailyTraffic.push({
      date: dateLabel,
      visitors: dayVisitors,
      pageViews: dayPV,
      sessions: daySessions,
    });
  }

  // 3. Top Pages
  const pagesMap = new Map<
    string,
    { title: string; views: number; bounceCount: number; sessions: Set<string> }
  >();
  visitors.forEach((v) => {
    const path = v.page.path || "/";
    const title = v.page.title || "Untitled";
    if (!pagesMap.has(path)) {
      pagesMap.set(path, {
        title,
        views: 0,
        bounceCount: 0,
        sessions: new Set(),
      });
    }
    const item = pagesMap.get(path)!;
    item.views++;
    const sessionKey = `${v.visitorId}_${v.sessionNumber}`;
    item.sessions.add(sessionKey);
  });

  // Calculate bounces per page
  sessionsMap.forEach((times, sessionKey) => {
    if (times.length === 1) {
      const record = visitors.find(
        (v) => `${v.visitorId}_${v.sessionNumber}` === sessionKey,
      );
      if (record) {
        const item = pagesMap.get(record.page.path || "/");
        if (item) item.bounceCount++;
      }
    }
  });

  const topPages: PageStat[] = Array.from(pagesMap.entries())
    .map(([path, data]) => {
      const bounceRate =
        data.sessions.size > 0
          ? Math.round((data.bounceCount / data.sessions.size) * 1000) / 10
          : 0;
      return {
        path,
        title: data.title,
        views: data.views,
        avgTime: "1m 45s", // Simplified static placeholder since we don't have exit intent/exact time-on-page yet
        bounceRate,
      };
    })
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  // 4. Traffic Sources
  const sourcesMap = new Map<string, number>();
  visitors.forEach((v) => {
    let source = "Direct";
    const ref = v.page.referrer;
    if (ref) {
      try {
        const url = new URL(ref);
        const host = url.hostname.toLowerCase();
        if (host.includes("google.")) source = "Organic Search";
        else if (
          host.includes("bing.") ||
          host.includes("yahoo.") ||
          host.includes("duckduckgo.")
        )
          source = "Organic Search";
        else if (host.includes("linkedin.")) source = "LinkedIn";
        else if (
          host.includes("twitter.com") ||
          host.includes("t.co") ||
          host.includes("x.com")
        )
          source = "Twitter / X";
        else if (host.includes("facebook.") || host.includes("instagram."))
          source = "Social Media";
        else if (
          host.includes("localhost") ||
          host.includes("theaevionlabs.com")
        )
          source = "Direct";
        else source = "Referral";
      } catch {
        source = "Referral";
      }
    }
    sourcesMap.set(source, (sourcesMap.get(source) || 0) + 1);
  });

  const totalSources = Array.from(sourcesMap.values()).reduce(
    (a, b) => a + b,
    0,
  );
  const trafficSources: SourceStat[] = Array.from(sourcesMap.entries())
    .map(([source, count]) => ({
      source,
      visitors: count,
      percentage:
        totalSources > 0 ? Math.round((count / totalSources) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.visitors - a.visitors);

  // 5. Top Countries
  const countriesMap = new Map<string, { code: string; count: number }>();
  visitors.forEach((v) => {
    const country = v.location.country || "Unknown";
    const code = v.location.countryCode || "UN";
    if (!countriesMap.has(country)) {
      countriesMap.set(country, { code, count: 0 });
    }
    countriesMap.get(country)!.count++;
  });

  const totalCountries = Array.from(countriesMap.values()).reduce(
    (a, b) => a + b.count,
    0,
  );
  const topCountries: CountryStat[] = Array.from(countriesMap.entries())
    .map(([country, data]) => ({
      country,
      code: data.code,
      visitors: data.count,
      percentage:
        totalCountries > 0
          ? Math.round((data.count / totalCountries) * 1000) / 10
          : 0,
    }))
    .sort((a, b) => b.visitors - a.visitors)
    .slice(0, 6);

  // 6. Device Breakdown
  const devicesMap = new Map<string, number>();
  visitors.forEach((v) => {
    const dev = v.device.type || "desktop";
    const formattedDev = dev.charAt(0).toUpperCase() + dev.slice(1);
    devicesMap.set(formattedDev, (devicesMap.get(formattedDev) || 0) + 1);
  });

  const totalDevices = Array.from(devicesMap.values()).reduce(
    (a, b) => a + b,
    0,
  );
  const deviceBreakdown: DeviceStat[] = Array.from(devicesMap.entries())
    .map(([device, count]) => ({
      device,
      percentage:
        totalDevices > 0 ? Math.round((count / totalDevices) * 100) : 0,
    }))
    .sort((a, b) => b.percentage - a.percentage);

  // 7. Hourly Distribution (24h)
  const hourlyDistribution = Array.from({ length: 24 }, (_, i) => ({
    date: `${String(i).padStart(2, "0")}:00`,
    visitors: 0,
    pageViews: 0,
    sessions: 0,
  }));

  const today = todayStart();
  const todayRecords = visitors.filter((v) => v.timestamp >= today);

  todayRecords.forEach((v) => {
    const hour = new Date(v.timestamp).getHours();
    if (hour >= 0 && hour < 24) {
      hourlyDistribution[hour].pageViews++;
    }
  });

  const hourlyVisitorsMap = Array.from({ length: 24 }, () => new Set<string>());
  const hourlySessionsMap = Array.from({ length: 24 }, () => new Set<string>());

  todayRecords.forEach((v) => {
    const hour = new Date(v.timestamp).getHours();
    if (hour >= 0 && hour < 24) {
      hourlyVisitorsMap[hour].add(v.visitorId);
      hourlySessionsMap[hour].add(`${v.visitorId}_${v.sessionNumber}`);
    }
  });

  for (let i = 0; i < 24; i++) {
    hourlyDistribution[i].visitors = hourlyVisitorsMap[i].size;
    hourlyDistribution[i].sessions = hourlySessionsMap[i].size;
  }

  return {
    overviewStats: {
      totalVisitors: new Set(visitors.map((v) => v.visitorId)).size,
      totalPageViews: visitors.length,
      avgSessionDuration,
      bounceRate: overallBounceRate,
      liveVisitors,
      visitorsChange,
      pageViewsChange,
      sessionChange: 0,
      bounceChange: 0,
    },
    dailyTraffic,
    topPages,
    trafficSources,
    topCountries,
    deviceBreakdown,
    hourlyDistribution,
  };
}

function modeOf(arr: string[]): string {
  if (arr.length === 0) return "—";
  const freq: Record<string, number> = {};
  arr.forEach((x) => {
    if (x) freq[x] = (freq[x] || 0) + 1;
  });
  let max = 0;
  let result = "—";
  for (const [k, c] of Object.entries(freq)) {
    if (c > max) {
      max = c;
      result = k;
    }
  }
  return result;
}

export function computeVisitorStats(visitors: VisitorRecord[]): VisitorStats {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();

  const todayVisitors = visitors.filter((v) => v.timestamp >= todayStr);
  const uniqueIds = new Set(visitors.map((v) => v.visitorId));

  return {
    totalAll: visitors.length,
    totalToday: todayVisitors.length,
    newToday: todayVisitors.filter((v) => v.type === "new").length,
    returningToday: todayVisitors.filter((v) => v.type === "returning").length,
    uniqueVisitors: uniqueIds.size,
    topBrowser: modeOf(visitors.map((v) => v.browser.name)),
    topOS: modeOf(visitors.map((v) => v.device.os)),
    topCountry: modeOf(visitors.map((v) => v.location.country)),
    topPage: modeOf(visitors.map((v) => v.page.path)),
  };
}
