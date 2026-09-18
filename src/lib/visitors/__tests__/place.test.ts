import { describe, expect, it } from "vitest";
import {
  describePlace,
  placeConfidence,
  postcodeArea,
  townFromLocation,
} from "@/lib/visitors/place";

const gb = (city: string, zip: string) =>
  townFromLocation({ city, zip, countryCode: "GB" });

/**
 * The rule is narrow on purpose, so the tests that matter are the ones proving
 * it does not reach past what is certainly true. Every case here is a real
 * outward code, and the "left alone" group is the important half: a wrong
 * correction is worse than the provider's own answer.
 */
describe("naming the town", () => {
  it("calls a London district London", () => {
    // The two that started this: both are districts, neither is a town.
    expect(gb("Muswell Hill", "N10")).toBe("London");
    expect(gb("City of London", "EC4R")).toBe("London");
  });

  it("covers the whole London postal district", () => {
    expect(gb("Poplar", "E14")).toBe("London");
    expect(gb("Camden Town", "NW1")).toBe("London");
    expect(gb("Peckham", "SE15")).toBe("London");
    expect(gb("Brixton", "SW2")).toBe("London");
    expect(gb("Ealing", "W5")).toBe("London");
    expect(gb("Holborn", "WC1V")).toBe("London");
  });

  it("leaves places that only sound like London alone", () => {
    // Every one of these is its own post town. Folding them into London would
    // replace a right answer with a wrong one.
    expect(gb("Enfield", "EN1")).toBe("Enfield");
    expect(gb("Ilford", "IG1")).toBe("Ilford");
    expect(gb("Harrow", "HA1")).toBe("Harrow");
    expect(gb("Croydon", "CR0")).toBe("Croydon");
    expect(gb("Bromley", "BR1")).toBe("Bromley");
    expect(gb("Kingston upon Thames", "KT1")).toBe("Kingston upon Thames");
    expect(gb("Twickenham", "TW1")).toBe("Twickenham");
  });

  it("does not mistake a two-letter area for a London one", () => {
    // WS, WF and NG all begin with a letter that is a London area on its own.
    expect(gb("Walsall", "WS1")).toBe("Walsall");
    expect(gb("Wakefield", "WF3")).toBe("Wakefield");
    expect(gb("Newark on Trent", "NG24")).toBe("Newark on Trent");
    expect(gb("Nottingham", "NG1")).toBe("Nottingham");
    expect(gb("Slough", "SL2")).toBe("Slough");
    expect(gb("Southend-on-Sea", "SS1")).toBe("Southend-on-Sea");
  });

  it("drops council dressing nobody says out loud", () => {
    expect(gb("Blackburn with Darwen", "BB1")).toBe("Blackburn");
    expect(gb("Glasgow City", "G5")).toBe("Glasgow");
    expect(gb("City of Westminster", "SW1A")).toBe("London");
    expect(townFromLocation({ city: "Bristol, City of", countryCode: "GB" })).toBe(
      "Bristol",
    );
  });

  it("leaves the rest of the world exactly as it found it", () => {
    // The postcode rule is a fact about the UK and nowhere else.
    expect(
      townFromLocation({ city: "Brooklyn", zip: "N10", countryCode: "US" }),
    ).toBe("Brooklyn");
    expect(
      townFromLocation({ city: "Neukölln", zip: "12043", countryCode: "DE" }),
    ).toBe("Neukölln");
  });

  it("survives a missing or malformed postcode", () => {
    expect(gb("Manchester", "")).toBe("Manchester");
    expect(townFromLocation({ city: "Leeds" })).toBe("Leeds");
    expect(gb("Cardiff", "not a postcode")).toBe("Cardiff");
    expect(townFromLocation({ city: "", zip: "N10", countryCode: "GB" })).toBe("");
  });

  it("reads the area off the front of an outward code", () => {
    expect(postcodeArea("EC4R")).toBe("EC");
    expect(postcodeArea("N10")).toBe("N");
    expect(postcodeArea("n10")).toBe("N");
    expect(postcodeArea(" SW1A 1AA ")).toBe("SW");
    expect(postcodeArea("12345")).toBe("");
    expect(postcodeArea(undefined)).toBe("");
  });
});

describe("how confidently a place may be stated", () => {
  it("says a fixed line's town plainly", () => {
    expect(placeConfidence({ mobile: false, proxy: false, hosting: false })).toBe(
      "place",
    );
    expect(describePlace(["Blackburn", "United Kingdom"], "place")).toBe(
      "Blackburn, United Kingdom",
    );
  });

  it("refuses to call a carrier gateway the visitor's town", () => {
    // The case that prompted this: a Vodafone handset in Blackburn, whose
    // address three providers placed in Walsall, London and London.
    expect(placeConfidence({ mobile: true })).toBe("gateway");
    expect(describePlace(["Walsall", "United Kingdom"], "gateway")).toBe(
      "Walsall, United Kingdom (carrier gateway, not the handset)",
    );
  });

  it("ranks a datacentre and a VPN above a gateway, in that order", () => {
    // Hosting is the strongest signal: a server is definitely not a reader.
    expect(placeConfidence({ hosting: true, proxy: true, mobile: true })).toBe(
      "datacentre",
    );
    expect(placeConfidence({ proxy: true, mobile: true })).toBe("relay");
  });

  it("says nothing at all when there is no place", () => {
    expect(describePlace([], "gateway")).toBe("");
    expect(describePlace([null, undefined, ""], "place")).toBe("");
  });

  it("treats an unknown connection as a plain place", () => {
    // ipwho.is carries no proxy or hosting flags, so those arrive undefined.
    // Undefined is not a reason to caveat a town that may be perfectly good.
    expect(placeConfidence({})).toBe("place");
    expect(placeConfidence(null)).toBe("place");
    expect(placeConfidence(undefined)).toBe("place");
  });
});

describe("a position the reader granted", () => {
  it("outranks what the address implies", () => {
    // The case this exists for: permission granted, but still on mobile data.
    // Without the device check first this reads "carrier gateway, not the
    // handset" over coordinates that are precisely the handset.
    expect(placeConfidence({ source: "device", mobile: true })).toBe("device");
    expect(placeConfidence({ source: "device", hosting: true })).toBe("device");
    expect(describePlace(["Blackburn", "United Kingdom"], "device")).toBe(
      "Blackburn, United Kingdom (from the device)",
    );
  });

  it("does not treat an IP lookup as a device fix", () => {
    expect(placeConfidence({ source: "ip-api", mobile: true })).toBe("gateway");
    expect(placeConfidence({ source: "vercel-edge" })).toBe("place");
  });
});
