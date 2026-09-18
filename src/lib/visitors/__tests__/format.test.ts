import { describe, expect, it } from "vitest";
import { formatDuration } from "@/lib/visitors/format";

describe("durations a person can read", () => {
  it("says so when there is nothing to report", () => {
    expect(formatDuration(0)).toBe("Under a minute");
  });

  it("keeps minutes for a visit", () => {
    expect(formatDuration(1)).toBe("1 min");
    expect(formatDuration(59)).toBe("59 min");
  });

  it("switches to hours past the hour", () => {
    expect(formatDuration(60)).toBe("1h");
    expect(formatDuration(85)).toBe("1h 25m");
    expect(formatDuration(157)).toBe("2h 37m");
  });

  it("switches to days past two of them", () => {
    expect(formatDuration(48 * 60)).toBe("2 days");
    expect(formatDuration(60 * 60)).toBe("2d 12h");
  });

  /**
   * The rounded remainder can land on a full unit.
   *
   * 5754 minutes is 3 days, 23 hours and 54 minutes; rounding the hours gave
   * 24 and the panel read "3d 24h" against real traffic.
   */
  it("carries a rounded 24 hours into the day", () => {
    expect(formatDuration(5754)).toBe("4 days");
  });

  it("carries a rounded 60 minutes into the hour", () => {
    expect(formatDuration(119.7)).toBe("2h");
  });

  it("never leaves a remainder that should have carried", () => {
    // "24h 2m" is fine on its own — that is 1442 minutes, still inside the
    // hours band. What must never appear is a remainder equal to a whole unit
    // of the one beside it: "3d 24h" or "1h 60m".
    for (let minutes = 0; minutes < 200_000; minutes += 7) {
      const text = formatDuration(minutes);
      expect(text).not.toMatch(/\d+d 24h/);
      expect(text).not.toMatch(/\d+h 60m/);
    }
  });
});
