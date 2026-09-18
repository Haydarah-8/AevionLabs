const PAYWALL_HOSTS = [
  "wsj.com",
  "ft.com",
  "nytimes.com",
  "economist.com",
  "bloomberg.com",
  "washingtonpost.com",
  "barrons.com",
  "theatlantic.com",
  "newyorker.com",
  "wired.com",
  "foreignaffairs.com",
  "seekingalpha.com",
  "thetimes.com",
  "thetimes.co.uk",
  "telegraph.co.uk",
  "latimes.com",
  "bostonglobe.com",
  "fortune.com",
  "businessinsider.com",
  "politico.com",
  "spectator.co.uk",
];

export function hostnameFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return "";
  }
}

export function isPaywalledUrl(url: string): boolean {
  const host = hostnameFromUrl(url);
  if (!host) return true;
  return PAYWALL_HOSTS.some(
    (blocked) => host === blocked || host.endsWith(`.${blocked}`),
  );
}

export function isUnresolvedGoogleNewsUrl(url: string): boolean {
  const host = hostnameFromUrl(url);
  return host === "news.google.com" || host.endsWith(".news.google.com");
}

export function shouldExcludeFromFeed(url: string): boolean {
  return isPaywalledUrl(url) || isUnresolvedGoogleNewsUrl(url);
}
