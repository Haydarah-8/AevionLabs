import { hostnameFromUrl } from "../../../src/lib/news-intake/paywalls";
import {
  isAllowedAdminUrl,
  type NewsSourceRow,
} from "../../../src/lib/news/sources/registry";

const PRIVATE =
  /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.|\[::1\])/i;

export function assertSafeFetchUrl(
  url: string,
  sources: Array<Pick<NewsSourceRow, "domain" | "enabled">>,
) {
  const parsed = new URL(url);
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("blocked protocol");
  }
  const host = hostnameFromUrl(url);
  if (!host || PRIVATE.test(host) || PRIVATE.test(parsed.hostname)) {
    throw new Error("blocked host");
  }
  if (!isAllowedAdminUrl(url, sources) && !isDiscoveryHost(host)) {
    throw new Error(`blocked source host ${host}`);
  }
}

function isDiscoveryHost(host: string) {
  return (
    host === "news.google.com" ||
    host.endsWith(".news.google.com") ||
    host === "api.gdeltproject.org" ||
    host === "feeds.bbci.co.uk" ||
    host === "feeds.reuters.com" ||
    host === "feeds.apnews.com" ||
    host === "feeds.skynews.com" ||
    host === "rss.cnn.com" ||
    host === "feeds.npr.org" ||
    host.endsWith(".aljazeera.com") ||
    host === "abcnews.go.com"
  );
}
