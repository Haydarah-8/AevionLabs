/* ── Mock analytics data for the admin traffic dashboard ── */

export type DailyTraffic = {
  date: string;
  visitors: number;
  pageViews: number;
  sessions: number;
};

export type PageStat = {
  path: string;
  title: string;
  views: number;
  avgTime: string;
  bounceRate: number;
};

export type SourceStat = {
  source: string;
  visitors: number;
  percentage: number;
};

export type CountryStat = {
  country: string;
  code: string;
  visitors: number;
  percentage: number;
};

export type DeviceStat = {
  device: string;
  percentage: number;
};

/* ── Seeded PRNG for deterministic data (avoids SSR/client hydration mismatch) ── */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/* ── 30-day traffic data ── */
const dailyRng = seededRandom(42);

function generateDailyData(): DailyTraffic[] {
  const data: DailyTraffic[] = [];
  const labels = [
    "02 Jun", "03 Jun", "04 Jun", "05 Jun", "06 Jun", "07 Jun", "08 Jun",
    "09 Jun", "10 Jun", "11 Jun", "12 Jun", "13 Jun", "14 Jun", "15 Jun",
    "16 Jun", "17 Jun", "18 Jun", "19 Jun", "20 Jun", "21 Jun", "22 Jun",
    "23 Jun", "24 Jun", "25 Jun", "26 Jun", "27 Jun", "28 Jun", "29 Jun",
    "30 Jun", "01 Jul",
  ];
  for (let i = 0; i < 30; i++) {
    const dayOfWeek = (i + 1) % 7; // Mon = 0
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
    const base = isWeekend ? 120 : 280;
    const variance = Math.floor(dailyRng() * 100) - 50;
    const trend = Math.floor((30 - (29 - i)) * 3.5);
    const visitors = Math.max(60, base + variance + trend);
    data.push({
      date: labels[i],
      visitors,
      pageViews: Math.floor(visitors * (2.1 + dailyRng() * 0.8)),
      sessions: Math.floor(visitors * (1.1 + dailyRng() * 0.3)),
    });
  }
  return data;
}

export const dailyTraffic = generateDailyData();

export const overviewStats = {
  totalVisitors: dailyTraffic.reduce((s, d) => s + d.visitors, 0),
  totalPageViews: dailyTraffic.reduce((s, d) => s + d.pageViews, 0),
  avgSessionDuration: "2m 34s",
  bounceRate: 41.2,
  liveVisitors: 14,
  visitorsChange: 18.4,
  pageViewsChange: 23.1,
  sessionChange: -2.1,
  bounceChange: -5.8,
};

export const topPages: PageStat[] = [
  { path: "/", title: "Home", views: 4820, avgTime: "1m 48s", bounceRate: 32.1 },
  { path: "/practice-areas", title: "Practice Areas", views: 2340, avgTime: "3m 12s", bounceRate: 28.5 },
  { path: "/about", title: "About", views: 1890, avgTime: "2m 05s", bounceRate: 35.7 },
  { path: "/news", title: "News & Insights", views: 1650, avgTime: "4m 22s", bounceRate: 22.3 },
  { path: "/practice-areas/defense-and-aerospace", title: "Defense & Aerospace", views: 980, avgTime: "3m 44s", bounceRate: 19.8 },
  { path: "/practice-areas/geopolitical-risk", title: "Geopolitical Risk", views: 870, avgTime: "3m 31s", bounceRate: 24.1 },
  { path: "/sitemap", title: "Sitemap", views: 210, avgTime: "0m 32s", bounceRate: 78.4 },
];

export const trafficSources: SourceStat[] = [
  { source: "Organic Search", visitors: 5120, percentage: 42.3 },
  { source: "Direct", visitors: 3280, percentage: 27.1 },
  { source: "LinkedIn", visitors: 1640, percentage: 13.5 },
  { source: "Referral", visitors: 1120, percentage: 9.3 },
  { source: "Twitter / X", visitors: 580, percentage: 4.8 },
  { source: "Other", visitors: 360, percentage: 3.0 },
];

export const topCountries: CountryStat[] = [
  { country: "United Kingdom", code: "GB", visitors: 4810, percentage: 39.7 },
  { country: "United States", code: "US", visitors: 3220, percentage: 26.6 },
  { country: "Germany", code: "DE", visitors: 940, percentage: 7.8 },
  { country: "France", code: "FR", visitors: 680, percentage: 5.6 },
  { country: "Canada", code: "CA", visitors: 520, percentage: 4.3 },
  { country: "Australia", code: "AU", visitors: 390, percentage: 3.2 },
];

export const deviceBreakdown: DeviceStat[] = [
  { device: "Desktop", percentage: 64 },
  { device: "Mobile", percentage: 29 },
  { device: "Tablet", percentage: 7 },
];

/* ── Hourly distribution (24h) — deterministic ── */
const hourlyRng = seededRandom(99);
export const hourlyDistribution = Array.from({ length: 24 }, (_, i) => {
  const hour = i;
  let base = 8;
  if (hour >= 9 && hour <= 11) base = 38;
  else if (hour >= 14 && hour <= 16) base = 32;
  else if (hour >= 7 && hour <= 18) base = 20;
  else if (hour >= 19 && hour <= 22) base = 14;
  const variance = Math.floor(hourlyRng() * 8) - 4;
  return { hour: `${String(hour).padStart(2, "0")}:00`, visitors: Math.max(2, base + variance) };
});
