import { describe, expect, it } from "vitest";
import {
  ExtractFailure,
  failureKind,
  isRetryable,
  kindForStatus,
} from "@/lib/news-intake/failure";

/**
 * The point of classifying failures is that only one kind costs a second
 * fetch. These tests pin the classification rather than the plumbing: get the
 * kinds wrong and the retry queue either misses recoverable pages or spends
 * every run re-reading dead links.
 */
describe("failure classification", () => {
  it("treats timeouts and server errors as worth another go", () => {
    for (const status of [429, 500, 502, 503, 504]) {
      expect(kindForStatus(status), `status ${status}`).toBe("transient");
      expect(isRetryable(kindForStatus(status))).toBe(true);
    }
  });

  it("never retries a page the publisher refuses or has deleted", () => {
    expect(kindForStatus(403)).toBe("blocked");
    expect(kindForStatus(401)).toBe("blocked");
    expect(kindForStatus(451)).toBe("blocked");
    expect(kindForStatus(404)).toBe("gone");
    expect(kindForStatus(410)).toBe("gone");
    for (const status of [401, 403, 404, 410, 451]) {
      expect(isRetryable(kindForStatus(status)), `status ${status}`).toBe(
        false,
      );
    }
  });

  it("does not retry an error it cannot explain", () => {
    // A parser blowing up is our bug, not the publisher's bad minute.
    expect(failureKind(new TypeError("cannot read property of undefined"))).toBe(
      "unreadable",
    );
    expect(failureKind("something threw a string")).toBe("unreadable");
    expect(isRetryable(failureKind(new Error("boom")))).toBe(false);
  });

  it("carries the kind and status through the thrown error", () => {
    const err = new ExtractFailure("Publisher returned 503.", "transient", 503);
    expect(failureKind(err)).toBe("transient");
    expect(err.status).toBe(503);
    expect(err.message).toContain("503");
  });

  it("keeps an unclassified status conservative", () => {
    // 418, 400, 405 — odd answers, but not ones a retry fixes.
    for (const status of [400, 405, 418]) {
      expect(isRetryable(kindForStatus(status)), `status ${status}`).toBe(
        false,
      );
    }
  });
});
