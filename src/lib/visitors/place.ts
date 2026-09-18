/**
 * The town, rather than the neighbourhood it happens to sit in.
 *
 * IP geolocation returns whatever its database calls the place, and for the UK
 * that is often a district: eight real visitors came back as "Muswell Hill",
 * "City of London", "Goodmayes" and "Britwell" — none of which anybody would
 * name if asked which town somebody was in. The desk wants the town.
 *
 * What this does *not* do is improve the underlying fix. An address resolves
 * to how a network routes it; a mobile connection lands at the carrier's
 * gateway and a VPN reports its exit node, and no amount of tidying the name
 * changes that. This only makes sure that when the lookup does land in the
 * right place, the right place is named the way a person would name it.
 *
 * Two routes were measured and rejected before settling on postcodes:
 *
 * - ipwho.is as a cross-check: it answered "London" for every address on the
 *   visitor's ISP range, including ones in Walsall, Manchester and Glasgow. It
 *   is reporting the ISP's registered office, not the connection.
 * - postcodes.io outcode lookup: its `admin_district` is a local authority,
 *   which is the town in some places and not in others — Walsall and
 *   Manchester come back right, but Slough comes back "Buckinghamshire" and
 *   Staffordshire comes back "Shropshire". Counties are worse than districts.
 *
 * So the only rule applied is one that is exactly true.
 */

/**
 * Postcode areas where the Royal Mail post town is London, without exception.
 *
 * This is the whole London postal district and it is genuinely exhaustive —
 * every address in these areas is addressed "LONDON". Neighbouring areas that
 * people think of as London are deliberately absent: EN is Enfield and Barnet,
 * IG is Ilford, HA is Harrow, CR is Croydon, BR is Bromley, DA is Dartford,
 * KT is Kingston, SM is Sutton, TW is Twickenham and UB is Southall. Adding
 * any of them would be replacing a right answer with a wrong one.
 */
const LONDON_AREAS = new Set([
  "E",
  "EC",
  "N",
  "NW",
  "SE",
  "SW",
  "W",
  "WC",
]);

/** The letters at the front of an outward code: "EC4R" -> "EC", "N10" -> "N". */
export function postcodeArea(zip?: string | null): string {
  const match = String(zip ?? "")
    .trim()
    .toUpperCase()
    .match(/^([A-Z]{1,2})\d/);
  return match?.[1] ?? "";
}

/**
 * Administrative dressing that no one says out loud.
 *
 * "Blackburn with Darwen" and "Glasgow City" are council names; the towns are
 * Blackburn and Glasgow. "City of London" is handled by the postcode rule
 * above, but the same phrasing turns up without a postcode.
 */
function trimAdministrative(city: string): string {
  let out = city.trim();
  out = out.replace(/^City (?:of|and County of) /i, "");
  out = out.replace(/ (?:City|Borough|District|County)$/i, "");
  // "Blackburn with Darwen", "Bournemouth, Christchurch and Poole" — the first
  // name is the one the place is known by.
  out = out.replace(/ with .+$/i, "");
  out = out.replace(/,.*$/, "");
  return out.trim();
}

/**
 * The best available name for the town a visitor is in.
 *
 * Returns the city unchanged when there is no rule that applies, which is most
 * of the time and by design — a guess dressed as a correction is worse than
 * the provider's answer.
 */
export function townFromLocation(location: {
  city?: string | null;
  zip?: string | null;
  countryCode?: string | null;
}): string {
  const city = String(location.city ?? "").trim();
  if (!city) return "";

  const country = String(location.countryCode ?? "").toUpperCase();
  if (country === "GB" && LONDON_AREAS.has(postcodeArea(location.zip))) {
    return "London";
  }

  const trimmed = trimAdministrative(city);
  return trimmed || city;
}

/**
 * How a place should be worded, given what the address can actually support.
 *
 * Some connections carry a usable place and some do not, and the difference is
 * knowable from the address itself rather than guessed at. A fixed line is
 * pinned near the exchange it terminates at, which is usually the right town.
 * A mobile connection is not: it is a shared pool on the carrier's core
 * network, and the handset's position is nowhere in the packet. A visitor's
 * own address here resolves into VODAFONE-CORE-NETWORK-DEVELOPMENT, a block of
 * 16,384 addresses, which three providers placed in Walsall, London and London
 * while the phone was in Blackburn.
 *
 * The panel used to print "Walsall" flatly in both cases. That is the part
 * worth fixing: the town cannot be made right, but the claim can stop being
 * made. A datacentre and a VPN are the same story — the address is a real
 * place, just not the reader's.
 */
export type PlaceConfidence =
  | "device"
  | "place"
  | "gateway"
  | "relay"
  | "datacentre";

export function placeConfidence(location?: {
  mobile?: boolean;
  proxy?: boolean;
  hosting?: boolean;
  source?: string;
} | null): PlaceConfidence {
  /**
   * A position the browser gave up outranks everything the address implies.
   *
   * This test has to come first. A reader who granted location while on
   * Vodafone is still `mobile: true`, and without this the panel would carry
   * on saying "carrier gateway, not the handset" over coordinates that are
   * the handset, to within a few metres.
   */
  if (location?.source === "device") return "device";
  if (location?.hosting) return "datacentre";
  if (location?.proxy) return "relay";
  if (location?.mobile) return "gateway";
  return "place";
}

/** What the city actually denotes, in a few words, or "" when it is the city. */
export const PLACE_CAVEAT: Record<PlaceConfidence, string> = {
  device: "from the device",
  place: "",
  gateway: "carrier gateway, not the handset",
  relay: "VPN exit, not the reader",
  datacentre: "server location",
};

/**
 * The place as it should be written on screen.
 *
 * Keeps the town — it is still the most useful thing known — but refuses to
 * present it as the visitor's town when the connection cannot support that.
 */
export function describePlace(
  parts: Array<string | null | undefined>,
  confidence: PlaceConfidence,
): string {
  const place = parts.filter(Boolean).join(", ");
  if (!place) return "";
  const caveat = PLACE_CAVEAT[confidence];
  return caveat ? `${place} (${caveat})` : place;
}
