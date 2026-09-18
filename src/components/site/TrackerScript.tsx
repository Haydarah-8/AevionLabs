"use client";

import { useEffect } from "react";
import { readGrantedPosition } from "@/lib/visitors/precise";

/**
 * Invisible tracking beacon — included in the (site) layout.
 *
 * On location: this never asks. `readGrantedPosition` reads a position only
 * from a visitor who has already granted it for this site, so no dialog is
 * ever raised by anything here. See lib/visitors/precise.
 * Collects device, browser, network, and performance data and POSTs to /api/track.
 * Never throws or blocks rendering; errors are silently swallowed.
 */
export function TrackerScript() {
  useEffect(() => {
    // Only run once per page load, only in the browser
    if (typeof window === "undefined") return;

    /* ── Visitor ID (persisted in localStorage) ── */
    let visitorId = "";
    let sessionNumber = 1;

    try {
      visitorId = localStorage.getItem("ewg_vid") || "";
      if (!visitorId) {
        visitorId = crypto.randomUUID?.() || fallbackUUID();
        localStorage.setItem("ewg_vid", visitorId);
      }
      const sn = parseInt(localStorage.getItem("ewg_sn") || "0", 10);
      sessionNumber = sn + 1;
      localStorage.setItem("ewg_sn", String(sessionNumber));
    } catch {
      // Private browsing or disabled storage
      visitorId = fallbackUUID();
    }

    /* ── Wait for full page load for performance metrics ── */
    async function collect() {
      try {
        const precise = await readGrantedPosition(navigator);
        const nav = navigator as NavigatorWithExtras;
        const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
        const perf = getPerformanceMetrics();

        const payload = {
          visitorId,
          sessionNumber,
          page: {
            url: window.location.href,
            path: window.location.pathname,
            title: document.title,
            referrer: document.referrer,
            hash: window.location.hash,
            queryString: window.location.search,
          },
          browser: {
            userAgent: navigator.userAgent,
            language: navigator.language,
            languages: Array.from(navigator.languages || [navigator.language]),
            cookiesEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack === "1",
            online: navigator.onLine,
            pdfViewerEnabled: !!(nav as { pdfViewerEnabled?: boolean }).pdfViewerEnabled,
          },
          device: {
            platform: nav.platform || nav.userAgentData?.platform || "",
            vendor: navigator.vendor || "",
            screenWidth: screen.width,
            screenHeight: screen.height,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            pixelRatio: window.devicePixelRatio || 1,
            colorDepth: screen.colorDepth,
            touchPoints: navigator.maxTouchPoints || 0,
            hardwareConcurrency: navigator.hardwareConcurrency || 0,
            deviceMemory: (nav as { deviceMemory?: number }).deviceMemory ?? null,
            orientation: screen.orientation?.type || "unknown",
          },
          network: {
            effectiveType: conn?.effectiveType || "",
            downlink: conn?.downlink ?? null,
            rtt: conn?.rtt ?? null,
            saveData: conn?.saveData ?? false,
          },
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
          timezoneOffset: new Date().getTimezoneOffset(),
          locale: Intl.DateTimeFormat().resolvedOptions().locale || navigator.language,
          performance: perf,
          // Present only for readers who had already granted permission.
          // Its absence is the normal case and means nothing was asked.
          precise,
        };

        const send = (body: object) => {
          const json = JSON.stringify(body);
          fetch("/api/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: json,
            keepalive: true,
          }).catch(() => {
            if (typeof navigator.sendBeacon === "function") {
              navigator.sendBeacon(
                "/api/track",
                new Blob([json], { type: "application/json" }),
              );
            }
          });
        };

        send(payload);
      } catch {
        // Tracking should never break the site
      }
    }

    // Delay collection slightly so performance entries populate
    if (document.readyState === "complete") {
      setTimeout(() => void collect(), 200);
    } else {
      window.addEventListener(
        "load",
        () => setTimeout(() => void collect(), 200),
        { once: true },
      );
    }
  }, []);

  return null; // Renders nothing
}

/* ── Performance metrics ── */
function getPerformanceMetrics() {
  try {
    const entries = performance.getEntriesByType("navigation");
    const nav = entries[0] as PerformanceNavigationTiming | undefined;
    if (!nav) return nullPerf();

    const fp = performance
      .getEntriesByType("paint")
      .find((e) => e.name === "first-contentful-paint");

    return {
      pageLoadTime: Math.round(nav.loadEventEnd - nav.startTime) || null,
      domContentLoaded: Math.round(nav.domContentLoadedEventEnd - nav.startTime) || null,
      firstPaint: fp ? Math.round(fp.startTime) : null,
      dnsLookup: Math.round(nav.domainLookupEnd - nav.domainLookupStart) || null,
      tcpConnection: Math.round(nav.connectEnd - nav.connectStart) || null,
      serverResponse: Math.round(nav.responseStart - nav.requestStart) || null,
      domInteractive: Math.round(nav.domInteractive - nav.startTime) || null,
    };
  } catch {
    return nullPerf();
  }
}

function nullPerf() {
  return {
    pageLoadTime: null,
    domContentLoaded: null,
    firstPaint: null,
    dnsLookup: null,
    tcpConnection: null,
    serverResponse: null,
    domInteractive: null,
  };
}

function fallbackUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/* ── Navigator type extensions for connection API ── */
type NetworkInformation = {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
};

type NavigatorWithExtras = Navigator & {
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
  platform?: string;
  userAgentData?: { platform?: string };
  deviceMemory?: number;
  pdfViewerEnabled?: boolean;
};
