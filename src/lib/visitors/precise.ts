/**
 * A position from the browser, without ever asking for one.
 *
 * The Geolocation API cannot be made quiet. Calling `getCurrentPosition`
 * without a standing permission shows the browser's prompt, and that is the
 * browser's decision, not something a flag or an option can turn off. Any
 * claim to read location silently from a fresh visitor is false.
 *
 * What is possible is to never ask. The Permissions API reports the standing
 * answer without triggering anything, so this reads it first and calls
 * `getCurrentPosition` only when the answer is already "granted" — at which
 * point there is nothing left to prompt for. A visitor on "prompt" or "denied"
 * is untouched: no dialog, no delay, and the beacon carries the IP-derived
 * place exactly as before.
 *
 * This lives in its own module rather than inside the tracker component
 * because the guarantee is worth testing, and a function buried in a `useEffect`
 * cannot be.
 */

export type PrecisePosition = {
  lat: number;
  lon: number;
  accuracyM: number;
};

/** The two browser pieces this needs, narrowed so a test can supply them. */
export type GeoEnvironment = {
  permissions?: {
    // `PermissionName` is a narrow string union in lib.dom, so the descriptor
    // is typed loosely here and the call site casts. A test can then pass a
    // plain object without reproducing the whole DOM type.
    query: (descriptor: never) => Promise<{ state: string }>;
  };
  geolocation?: {
    getCurrentPosition: (
      success: (position: {
        coords: { latitude: number; longitude: number; accuracy: number };
      }) => void,
      failure: () => void,
      options?: object,
    ) => void;
  };
};

/**
 * A stale fix is fine; a slow one is not.
 *
 * The beacon must not wait on this, so it accepts a reading up to ten minutes
 * old and gives up after four seconds. High accuracy is off deliberately: it
 * powers up the GPS, which costs the visitor battery for precision nobody here
 * needs.
 */
const OPTIONS = {
  enableHighAccuracy: false,
  timeout: 4000,
  maximumAge: 600_000,
};

export async function readGrantedPosition(
  env: GeoEnvironment,
): Promise<PrecisePosition | null> {
  try {
    if (!env.geolocation || !env.permissions) return null;

    const status = await env.permissions.query({
      name: "geolocation",
    } as never);
    // The whole contract is this line. "prompt" is the state that would raise
    // a dialog, and it is refused alongside "denied".
    if (status.state !== "granted") return null;

    return await new Promise<PrecisePosition | null>((resolve) => {
      env.geolocation!.getCurrentPosition(
        (position) =>
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            accuracyM: Math.round(position.coords.accuracy),
          }),
        () => resolve(null),
        OPTIONS,
      );
    });
  } catch {
    // A browser without the Permissions API, or one that refuses the query,
    // gets the same answer as a refusal: nothing, and no prompt.
    return null;
  }
}
