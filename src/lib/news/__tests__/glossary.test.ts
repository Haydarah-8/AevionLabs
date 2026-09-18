import { describe, expect, it } from "vitest";
import {
  GLOSSARY,
  glossaryEntry,
  glossaryReferences,
} from "@/lib/news/glossary";

describe("glossary", () => {
  it("has no duplicate ids", () => {
    const ids = GLOSSARY.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("resolves every seeAlso reference", () => {
    // A dangling reference renders a link to nothing, which is worse than no
    // link at all — the reader presses it and the modal stays put.
    const missing = glossaryReferences().filter((id) => !glossaryEntry(id));
    expect(missing).toEqual([]);
  });

  it("never points an entry at itself", () => {
    const selfRefs = GLOSSARY.filter((entry) =>
      (entry.seeAlso ?? []).includes(entry.id),
    ).map((entry) => entry.id);
    expect(selfRefs).toEqual([]);
  });

  it("gives every entry a method and a caveat", () => {
    // The caveat is the point of the exercise. An entry that explains how a
    // number is made without saying where it misleads is half an answer.
    const thin = GLOSSARY.filter(
      (entry) =>
        entry.short.trim().length < 10 ||
        entry.method.trim().length < 30 ||
        entry.caveat.trim().length < 30,
    ).map((entry) => entry.id);
    expect(thin).toEqual([]);
  });

  it("returns undefined for an unknown id rather than throwing", () => {
    expect(glossaryEntry("no-such-term")).toBeUndefined();
  });

  it("covers the measures the interface actually renders", () => {
    // These ids are referenced by Newsroom and Press. A missing entry makes
    // the label silently un-pressable, which is easy to ship and hard to spot.
    const required = [
      "article",
      "story",
      "outlet",
      "lean",
      "spread",
      "balance",
      "unrated",
      "state-controlled",
      "topic",
      "domain",
      "reach",
      "contested",
      "framing",
      "loaded-share",
      "omission",
      "exclusivity",
      "cadence",
      "co-coverage",
      "publishing-clock",
      "waffle",
      "undrafted",
      "similarity",
      "spectrum-bar",
      "domain-confidence",
      "one-sided",
      "feed-health",
    ];
    const missing = required.filter((id) => !glossaryEntry(id));
    expect(missing).toEqual([]);
  });
});
