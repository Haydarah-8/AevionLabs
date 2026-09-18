"use client";

import { useEffect } from "react";

const SKIP = [/^\/admin/, /^\/login/];
const HERE = new Set(["/offline", "/timeout"]);

function blocked() {
  const path = window.location.pathname;
  return SKIP.some((rule) => rule.test(path));
}

function go(path: string) {
  if (blocked()) return;
  if (HERE.has(window.location.pathname)) return;
  if (window.location.pathname === path) return;
  window.location.assign(path);
}

export function ErrorNetWatch() {
  useEffect(() => {
    const onOffline = () => go("/offline");
    window.addEventListener("offline", onOffline);
    if (!navigator.onLine) go("/offline");

    if (
      process.env.NODE_ENV === "production" &&
      "serviceWorker" in navigator
    ) {
      navigator.serviceWorker.register("/error-sw.js").catch(() => {
        /* ignore */
      });
    }

    return () => window.removeEventListener("offline", onOffline);
  }, []);

  return null;
}
