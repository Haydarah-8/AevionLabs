import { describe, expect, it } from "vitest";
import { assertPublicHttpUrl } from "./ssrf";

describe("assertPublicHttpUrl", () => {
  it("accepts a public https site", () => {
    expect(assertPublicHttpUrl("https://example.com/about").hostname).toBe(
      "example.com",
    );
  });

  it("rejects localhost and private hosts", () => {
    expect(() => assertPublicHttpUrl("http://127.0.0.1")).toThrow(
      /cannot be fetched/i,
    );
    expect(() => assertPublicHttpUrl("http://localhost")).toThrow(
      /cannot be fetched/i,
    );
    expect(() => assertPublicHttpUrl("http://192.168.1.4")).toThrow(
      /cannot be fetched/i,
    );
    expect(() => assertPublicHttpUrl("http://10.0.0.8/admin")).toThrow(
      /cannot be fetched/i,
    );
    expect(() =>
      assertPublicHttpUrl("http://169.254.169.254/latest/meta-data"),
    ).toThrow(/cannot be fetched/i);
  });

  it("rejects credentials and odd ports", () => {
    expect(() => assertPublicHttpUrl("https://user:pass@example.com")).toThrow(
      /credentials/i,
    );
    expect(() => assertPublicHttpUrl("https://example.com:8443")).toThrow(
      /port/i,
    );
  });
});
