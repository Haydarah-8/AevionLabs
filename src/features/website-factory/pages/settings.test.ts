import { describe, expect, it } from "vitest";
import {
  createRedirect,
  listRedirects,
  matchRedirect,
  normalizeRedirectPath,
  NOT_FOUND_PAGE_SLUG,
  patchPageSeo,
  pathFromFactorySegments,
  readPageSeo,
  removeRedirect,
  resolveRedirectTarget,
  upsertRedirect,
} from "./settings";
import type { SiteConfig } from "../types";

const baseConfig: SiteConfig = {
  stickyHeader: true,
  announcement: "",
  navCta: { label: "", href: "" },
  footerNote: "",
};

describe("page settings / redirects", () => {
  it("normalizes paths and factory segments", () => {
    expect(normalizeRedirectPath("about")).toBe("/about");
    expect(normalizeRedirectPath("/about/")).toBe("/about");
    expect(pathFromFactorySegments(undefined)).toBe("/");
    expect(pathFromFactorySegments(["about"])).toBe("/about");
    expect(pathFromFactorySegments(["a", "b"])).toBe("/a/b");
  });

  it("upserts and matches redirects on siteConfig", () => {
    const created = createRedirect({
      from: "/old",
      to: "/about",
      permanent: true,
    });
    let config = upsertRedirect(baseConfig, created);
    expect(listRedirects(config)).toHaveLength(1);
    expect(matchRedirect(config, "/old")?.to).toBe("/about");
    expect(matchRedirect(config, "/missing")).toBeNull();
    config = removeRedirect(config, created.id);
    expect(listRedirects(config)).toHaveLength(0);
    expect(config.redirects).toBeUndefined();
  });

  it("resolves factory redirect targets", () => {
    expect(resolveRedirectTarget("acme", "/about", "live")).toBe(
      "/s/acme/about",
    );
    expect(resolveRedirectTarget("acme", "/", "preview")).toBe("/p/acme");
    expect(
      resolveRedirectTarget("acme", "https://example.com/x", "draft"),
    ).toBe("https://example.com/x");
  });

  it("reads and patches page SEO on root props", () => {
    let data = { root: { props: {} }, content: [] };
    data = patchPageSeo(data, {
      title: "Hello",
      description: "Desc",
      noIndex: true,
    });
    expect(readPageSeo(data).title).toBe("Hello");
    expect(readPageSeo(data).description).toBe("Desc");
    expect(readPageSeo(data).noIndex).toBe(true);
    data = patchPageSeo(data, { noIndex: false, description: "" });
    expect(data.root.props?.noIndex).toBeUndefined();
    expect(data.root.props?.description).toBeUndefined();
  });

  it("reserves 404 slug constant", () => {
    expect(NOT_FOUND_PAGE_SLUG).toBe("404");
  });
});
