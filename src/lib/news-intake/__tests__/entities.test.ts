import { describe, expect, it } from "vitest";
import { decodeEntities, decodeXml, stripHtml } from "@/lib/news-intake/rss";

describe("decoding what feeds actually send", () => {
  it("decodes the zero-padded apostrophe WordPress emits", () => {
    expect(decodeEntities("Iran&#039;s Kharg")).toBe("Iran's Kharg");
  });

  it("decodes the curly apostrophe most outlets use", () => {
    expect(decodeEntities("CENTCOM&#8217;s new deployment")).toBe(
      "CENTCOM’s new deployment",
    );
  });

  it("decodes curly quotes around a word", () => {
    expect(decodeEntities("What Iceland&#8217;s &#8216;no&#8217; means")).toBe(
      "What Iceland’s ‘no’ means",
    );
  });

  it("decodes hex entities", () => {
    expect(decodeEntities("caf&#xe9; society")).toBe("café society");
  });

  it("decodes named entities", () => {
    expect(decodeEntities("Bread &amp; Butter &mdash; a &quot;study&quot;")).toBe(
      'Bread & Butter — a "study"',
    );
  });

  it("unwinds double encoding, which feeds do routinely", () => {
    expect(decodeEntities("Iran&amp;#039;s")).toBe("Iran's");
  });

  it("leaves an unknown entity alone rather than mangling it", () => {
    expect(decodeEntities("a &notarealentity; b")).toBe("a &notarealentity; b");
  });

  it("leaves an out-of-range code point alone", () => {
    expect(decodeEntities("&#99999999;")).toBe("&#99999999;");
  });

  it("leaves ordinary text untouched", () => {
    expect(decodeEntities("Plain headline, nothing to do")).toBe(
      "Plain headline, nothing to do",
    );
  });

  it("still strips tags and collapses whitespace", () => {
    expect(stripHtml("<p>Iran&#039;s   <b>oil</b> hub</p>")).toBe(
      "Iran's oil hub",
    );
  });

  it("drops script and style bodies", () => {
    expect(stripHtml("<script>evil()</script>Real &amp; true")).toBe(
      "Real & true",
    );
  });

  it("unwraps CDATA and decodes inside it", () => {
    expect(decodeXml("<![CDATA[Iran&#039;s Kharg]]>")).toBe("Iran's Kharg");
  });
});
