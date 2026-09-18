import { describe, expect, it, vi } from "vitest";
import {
  readGrantedPosition,
  type GeoEnvironment,
} from "@/lib/visitors/precise";

/**
 * One promise was made about this feature: it never raises the browser's
 * location prompt. A prompt can only appear as a result of calling
 * `getCurrentPosition`, so the promise reduces to a fact that can be checked —
 * was that function called or not.
 *
 * Every test here asserts the call count. The returned value matters less than
 * the silence.
 */
function environment(state: string, coords?: [number, number, number]) {
  const getCurrentPosition = vi.fn(
    (
      success: (p: {
        coords: { latitude: number; longitude: number; accuracy: number };
      }) => void,
      failure: () => void,
      // Declared so the options argument is inspectable in the test below.
      _options?: object,
    ) => {
      if (!coords) return failure();
      success({
        coords: {
          latitude: coords[0],
          longitude: coords[1],
          accuracy: coords[2],
        },
      });
    },
  );
  const env: GeoEnvironment = {
    permissions: { query: vi.fn(async () => ({ state })) as never },
    geolocation: { getCurrentPosition },
  };
  return { env, getCurrentPosition };
}

describe("reading a position without asking", () => {
  it("never calls getCurrentPosition when the answer would be a prompt", async () => {
    // This is the whole feature. "prompt" is precisely the state in which the
    // browser would put a dialog in front of the reader.
    const { env, getCurrentPosition } = environment("prompt");
    await expect(readGrantedPosition(env)).resolves.toBeNull();
    expect(getCurrentPosition).not.toHaveBeenCalled();
  });

  it("never calls it when permission was refused", async () => {
    const { env, getCurrentPosition } = environment("denied");
    await expect(readGrantedPosition(env)).resolves.toBeNull();
    expect(getCurrentPosition).not.toHaveBeenCalled();
  });

  it("reads a position when permission already stands", async () => {
    // Blackburn, roughly, to 20 metres.
    const { env, getCurrentPosition } = environment("granted", [
      53.7486, -2.4861, 20.4,
    ]);
    await expect(readGrantedPosition(env)).resolves.toEqual({
      lat: 53.7486,
      lon: -2.4861,
      accuracyM: 20,
    });
    expect(getCurrentPosition).toHaveBeenCalledTimes(1);
  });

  it("asks for a cheap, cached, quickly-abandoned fix", async () => {
    const { env, getCurrentPosition } = environment("granted", [1, 2, 3]);
    await readGrantedPosition(env);
    const options = getCurrentPosition.mock.calls[0][2] as unknown as {
      enableHighAccuracy: boolean;
      timeout: number;
      maximumAge: number;
    };
    // High accuracy powers up the GPS and costs the visitor battery.
    expect(options.enableHighAccuracy).toBe(false);
    // The beacon must not wait on this.
    expect(options.timeout).toBeLessThanOrEqual(5000);
    expect(options.maximumAge).toBeGreaterThan(0);
  });

  it("returns nothing rather than hanging when the fix fails", async () => {
    const { env } = environment("granted");
    await expect(readGrantedPosition(env)).resolves.toBeNull();
  });

  it("stays silent in a browser with no Permissions API", async () => {
    // Without a way to read the standing answer there is no way to know
    // whether a call would prompt, so nothing is called.
    const getCurrentPosition = vi.fn();
    await expect(
      readGrantedPosition({ geolocation: { getCurrentPosition } }),
    ).resolves.toBeNull();
    expect(getCurrentPosition).not.toHaveBeenCalled();
  });

  it("stays silent when the permission query itself throws", async () => {
    const getCurrentPosition = vi.fn();
    await expect(
      readGrantedPosition({
        permissions: {
          query: vi.fn(async () => {
            throw new Error("unsupported descriptor");
          }) as never,
        },
        geolocation: { getCurrentPosition },
      }),
    ).resolves.toBeNull();
    expect(getCurrentPosition).not.toHaveBeenCalled();
  });

  it("does nothing at all in a browser with no geolocation", async () => {
    await expect(readGrantedPosition({})).resolves.toBeNull();
  });
});
