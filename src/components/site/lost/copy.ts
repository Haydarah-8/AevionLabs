export const PAGES = {
  "not-found": {
    kicker: "404",
    title: "Page not found.",
    body: "The page you asked for is not here.",
    documentTitle: "404",
  },
  offline: {
    kicker: "Offline",
    title: "No internet.",
    body: "Check the connection, then try again.",
    documentTitle: "No internet",
  },
  timeout: {
    kicker: "Timeout",
    title: "This is taking too long.",
    body: "Reload the page, or go home.",
    documentTitle: "Taking too long",
  },
  error: {
    kicker: "Error",
    title: "Something went wrong.",
    body: "Reload, or go home.",
    documentTitle: "Error",
  },
} as const;

export type ErrorKind = keyof typeof PAGES;
