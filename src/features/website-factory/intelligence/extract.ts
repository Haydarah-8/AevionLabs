import { SCRAPE_LIMITS, assertPublicHttpUrl } from "./ssrf";
import type { IntelligenceImage, IntelligenceResult } from "./types";

export type {
  ImportedItem,
  IntelligenceImage,
  IntelligencePage,
  IntelligenceResult,
} from "./types";

type ProgressFn = (
  step: string,
  meta?: { pages?: number; assets?: number },
) => void;

type DomDocument = {
  title: string;
  body: { textContent: string | null } | null;
  querySelector: (selector: string) => ElementLike | null;
  querySelectorAll: (selector: string) => ElementLike[];
};

type ElementLike = {
  textContent: string | null;
  getAttribute: (name: string) => string | null;
};

const UA =
  "AevionWebsiteFactory/1.1 (+https://theaevionlabs.com; Readability+linkedom; respect robots.txt)";

async function loadParser() {
  const [{ parseHTML }, { Readability }] = await Promise.all([
    import("linkedom"),
    import("@mozilla/readability"),
  ]);
  return { parseHTML, Readability };
}

function classifyPage(url: string, title: string) {
  const hay = `${url} ${title}`.toLowerCase();
  if (/contact|get-in-touch|enquiry/.test(hay)) return "contact";
  if (/about|our-story|who-we-are/.test(hay)) return "about";
  if (/service|what-we-do|offer/.test(hay)) return "services";
  if (/team|people|staff/.test(hay)) return "team";
  if (/review|testimonial/.test(hay)) return "reviews";
  if (/project|gallery|work|portfolio/.test(hay)) return "projects";
  if (/faq|questions/.test(hay)) return "faq";
  if (/blog|news|insight/.test(hay)) return "blog";
  return "home";
}

function pagePriority(url: string) {
  const type = classifyPage(url, "");
  const rank: Record<string, number> = {
    home: 0,
    contact: 1,
    about: 2,
    services: 3,
    projects: 4,
    reviews: 5,
    team: 6,
    faq: 7,
    blog: 8,
  };
  return rank[type] ?? 9;
}

function classifyImage(url: string, alt: string, context: string) {
  const hay = `${url} ${alt} ${context}`.toLowerCase();
  if (/favicon|apple-touch/.test(hay)) return "favicon" as const;
  if (/logo/.test(hay)) return "logo" as const;
  if (/hero|banner|cover|og[-_]?image/.test(hay)) return "hero" as const;
  if (/team|staff|people|portrait/.test(hay)) return "team" as const;
  if (/service|roof|repair|install/.test(hay)) return "service" as const;
  return "gallery" as const;
}

function textOf(el: ElementLike | null | undefined) {
  return (el?.textContent || "").replace(/\s+/g, " ").trim();
}

function abs(base: URL, href: string) {
  try {
    return new URL(href, base).toString();
  } catch {
    return "";
  }
}

function withBaseHref(html: string, baseUrl: string) {
  const base = `<base href="${baseUrl.replace(/"/g, "&quot;")}">`;
  if (/<head[\s>]/i.test(html)) {
    return html.replace(/<head([^>]*)>/i, `<head$1>${base}`);
  }
  return `<!DOCTYPE html><html><head>${base}</head><body>${html}</body></html>`;
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchText(url: string, attempts = 3) {
  let lastError: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetch(url, {
        headers: {
          "user-agent": UA,
          accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "accept-language": "en-GB,en;q=0.9",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(SCRAPE_LIMITS.timeoutMs),
      });
      if (!res.ok) throw new Error(`${url} returned ${res.status}`);
      const type = res.headers.get("content-type") || "";
      if (type && !/html|xml|text\//i.test(type)) {
        throw new Error("That URL is not an HTML page");
      }
      const buf = await res.arrayBuffer();
      if (buf.byteLength > SCRAPE_LIMITS.maxBytes) {
        throw new Error("Page is larger than the import limit");
      }
      return new TextDecoder("utf-8", { fatal: false }).decode(buf);
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) await sleep(350 * (i + 1));
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Fetch failed");
}

async function robotsAllows(origin: string, pathName: string) {
  try {
    const body = await fetchText(`${origin}/robots.txt`, 2);
    const lines = body.split(/\r?\n/);
    let applies = false;
    const disallows: string[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (/^user-agent:\s*\*/i.test(trimmed)) applies = true;
      else if (/^user-agent:/i.test(trimmed)) applies = false;
      else if (applies && /^disallow:/i.test(trimmed)) {
        disallows.push(trimmed.slice(trimmed.indexOf(":") + 1).trim());
      }
    }
    return !disallows.some(
      (rule) => rule && (rule === "/" || pathName.startsWith(rule)),
    );
  } catch {
    return true;
  }
}

async function discoverFromSitemap(origin: string) {
  const urls: string[] = [];
  for (const pathName of [
    "/sitemap.xml",
    "/sitemap_index.xml",
    "/wp-sitemap.xml",
  ]) {
    try {
      const xml = await fetchText(`${origin}${pathName}`, 2);
      const matches = xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi);
      for (const match of matches) {
        const loc = match[1]?.trim();
        if (loc?.startsWith("http")) urls.push(loc);
      }
      if (urls.length) break;
    } catch {
      /* try next */
    }
  }
  return [...new Set(urls)]
    .sort((a, b) => pagePriority(a) - pagePriority(b))
    .slice(0, SCRAPE_LIMITS.maxPages);
}

function extractBrandColors(doc: DomDocument, html: string) {
  const colors = new Set<string>();
  const theme =
    doc.querySelector('meta[name="theme-color"]')?.getAttribute("content") ||
    doc
      .querySelector('meta[name="msapplication-TileColor"]')
      ?.getAttribute("content") ||
    "";
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(theme.trim())) {
    colors.add(theme.trim().toLowerCase());
  }
  for (const match of html.matchAll(/#([0-9a-fA-F]{6})\b/g)) {
    const hex = `#${match[1].toLowerCase()}`;
    if (!/^#(fff|ffffff|000|000000|f5f5f5|eeeeee|ddd|cccccc)$/i.test(hex)) {
      colors.add(hex);
    }
    if (colors.size >= 6) break;
  }
  return [...colors].slice(0, 5);
}

function extractJsonLd(doc: DomDocument) {
  const blobs = [...doc.querySelectorAll('script[type="application/ld+json"]')]
    .map((node) => textOf(node))
    .filter(Boolean);
  const out: {
    name?: string;
    description?: string;
    telephone?: string;
    email?: string;
    address?: string;
    postcode?: string;
    logo?: string;
    image?: string;
    sameAs?: string[];
  } = {};

  for (const raw of blobs) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      const nodes = Array.isArray(parsed)
        ? parsed
        : parsed && typeof parsed === "object" && "@graph" in parsed
          ? ((parsed as { "@graph": unknown[] })["@graph"] ?? [])
          : [parsed];
      for (const node of nodes) {
        if (!node || typeof node !== "object") continue;
        const item = node as Record<string, unknown>;
        const type = String(item["@type"] || "");
        if (
          !/Organization|LocalBusiness|Store|Corporation|ProfessionalService/i.test(
            type,
          )
        ) {
          continue;
        }
        if (typeof item.name === "string" && !out.name) out.name = item.name;
        if (typeof item.description === "string" && !out.description) {
          out.description = item.description;
        }
        if (typeof item.telephone === "string" && !out.telephone) {
          out.telephone = item.telephone;
        }
        if (typeof item.email === "string" && !out.email)
          out.email = item.email;
        if (typeof item.logo === "string" && !out.logo) out.logo = item.logo;
        if (typeof item.image === "string" && !out.image)
          out.image = item.image;
        if (Array.isArray(item.sameAs)) {
          out.sameAs = item.sameAs.filter(
            (value): value is string => typeof value === "string",
          );
        }
        const address = item.address;
        if (address && typeof address === "object") {
          const addr = address as Record<string, unknown>;
          const parts = [
            addr.streetAddress,
            addr.addressLocality,
            addr.addressRegion,
            addr.postalCode,
          ]
            .filter((part) => typeof part === "string")
            .join(", ");
          if (parts && !out.address) out.address = parts;
          if (typeof addr.postalCode === "string" && !out.postcode) {
            out.postcode = addr.postalCode;
          }
        }
      }
    } catch {
      /* ignore bad JSON-LD */
    }
  }
  return out;
}

function extractFromDom(
  url: URL,
  html: string,
  parseHTML: (source: string) => { document: DomDocument },
  Readability: new (doc: DomDocument) => {
    parse: () => {
      title?: string;
      textContent?: string;
      excerpt?: string;
    } | null;
  },
) {
  const prepared = withBaseHref(html, url.toString());
  const { document: doc } = parseHTML(prepared);
  const jsonLd = extractJsonLd(doc);

  let readableTitle = "";
  let readableText = "";
  let readableExcerpt = "";
  try {
    const { document: clone } = parseHTML(prepared);
    const article = new Readability(clone).parse();
    if (article) {
      readableTitle = article.title || "";
      readableText = (article.textContent || "").replace(/\s+/g, " ").trim();
      readableExcerpt = (article.excerpt || "").trim();
    }
  } catch {
    /* Readability is best-effort */
  }

  const title =
    readableTitle ||
    textOf(doc.querySelector("title")) ||
    textOf(doc.querySelector("h1")) ||
    jsonLd.name ||
    "";
  const metaDesc =
    doc.querySelector('meta[name="description"]')?.getAttribute("content") ||
    doc
      .querySelector('meta[property="og:description"]')
      ?.getAttribute("content") ||
    readableExcerpt ||
    jsonLd.description ||
    "";
  const h1 =
    textOf(doc.querySelector("h1")) || readableTitle || jsonLd.name || "";
  const paragraphs = [
    ...new Set(
      [
        ...[...doc.querySelectorAll("p")].map((node) => textOf(node)),
        ...readableText
          .split(/(?<=\.)\s+/)
          .map((part) => part.trim())
          .filter((part) => part.length > 40),
      ].filter((item) => item.length > 40),
    ),
  ].slice(0, 12);

  const lists = [...doc.querySelectorAll("h2, h3, li")]
    .map((node) => textOf(node))
    .filter((item) => item.length > 2 && item.length < 80)
    .slice(0, 24);

  const phoneMatch = doc.body?.textContent?.match(
    /(?:\+44|0)\s*\d{2,5}[\s-]?\d{3,4}[\s-]?\d{3,4}/,
  );
  const emailMatch = doc.body?.textContent?.match(
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  );
  const email =
    jsonLd.email ||
    doc.querySelector('a[href^="mailto:"]')?.getAttribute("href")?.replace(/^mailto:/i, "").split("?")[0] ||
    emailMatch?.[0] ||
    "";
  // Prefer mailto over body match — body often glues neighbouring text onto emails.

  const addressCandidate =
    jsonLd.address ||
    textOf(doc.querySelector("address")) ||
    [...doc.querySelectorAll("p, li, span")]
      .map((node) => textOf(node))
      .find(
        (item) =>
          /\b(road|street|lane|avenue|drive|manchester|uk)\b/i.test(item) &&
          item.length < 120,
      ) ||
    "";

  const postcodeMatch =
    `${addressCandidate} ${doc.body?.textContent || ""}`.match(
      /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/i,
    );

  const logo =
    jsonLd.logo ||
    doc.querySelector('img[alt*="logo" i]')?.getAttribute("src") ||
    doc.querySelector('img[src*="logo" i]')?.getAttribute("src") ||
    doc.querySelector('meta[property="og:logo"]')?.getAttribute("content") ||
    "";
  const ogImage =
    jsonLd.image ||
    doc.querySelector('meta[property="og:image"]')?.getAttribute("content") ||
    "";
  const favicon = abs(
    url,
    doc.querySelector('link[rel="icon"]')?.getAttribute("href") ||
      doc.querySelector('link[rel="shortcut icon"]')?.getAttribute("href") ||
      "/favicon.ico",
  );

  const images: IntelligenceImage[] = [...doc.querySelectorAll("img")]
    .map((img) => {
      const src = abs(
        url,
        img.getAttribute("src") || img.getAttribute("data-src") || "",
      );
      const alt = img.getAttribute("alt") || "";
      return {
        url: src,
        alt,
        kind: classifyImage(src, alt, title),
      };
    })
    .filter(
      (item) =>
        item.url.startsWith("http") &&
        !/1x1|pixel|spacer|tracking|data:image/i.test(item.url),
    )
    .slice(0, 20);

  if (ogImage) {
    images.unshift({
      url: abs(url, ogImage),
      alt: "Hero",
      kind: "hero",
    });
  }
  if (logo) {
    images.unshift({
      url: abs(url, logo),
      alt: "Logo",
      kind: "logo",
    });
  }

  const social: Record<string, string> = {};
  for (const a of doc.querySelectorAll("a[href]")) {
    const href = abs(url, a.getAttribute("href") || "");
    if (/facebook\.com/i.test(href)) social.facebook = href;
    if (/instagram\.com/i.test(href)) social.instagram = href;
    if (/linkedin\.com/i.test(href)) social.linkedin = href;
    if (/x\.com|twitter\.com/i.test(href)) social.x = href;
    if (/youtube\.com|youtu\.be/i.test(href)) social.youtube = href;
  }
  for (const href of jsonLd.sameAs || []) {
    if (/facebook\.com/i.test(href)) social.facebook = href;
    if (/instagram\.com/i.test(href)) social.instagram = href;
    if (/linkedin\.com/i.test(href)) social.linkedin = href;
    if (/x\.com|twitter\.com/i.test(href)) social.x = href;
    if (/youtube\.com|youtu\.be/i.test(href)) social.youtube = href;
  }

  const links = [...doc.querySelectorAll("a[href]")]
    .map((a) => abs(url, a.getAttribute("href") || ""))
    .filter((href) => {
      try {
        const next = new URL(href);
        return (
          next.origin === url.origin &&
          !/\.(pdf|jpe?g|png|zip|webp|gif|svg|mp4)$/i.test(next.pathname) &&
          !/#|mailto:|tel:|javascript:/i.test(href)
        );
      } catch {
        return false;
      }
    });

  const reviewBlocks = [
    ...doc.querySelectorAll(
      "blockquote, [class*='review' i], [class*='testimonial' i]",
    ),
  ]
    .map((node) => textOf(node))
    .filter((item) => item.length > 40)
    .slice(0, 6);

  return {
    title,
    metaDesc,
    h1,
    body: readableText.slice(0, 4000),
    paragraphs,
    lists,
    phone:
      jsonLd.telephone || phoneMatch?.[0]?.replace(/\s+/g, " ").trim() || "",
    email: email.replace(/\s+/g, "").slice(0, 120),
    address: addressCandidate,
    postcode: jsonLd.postcode || postcodeMatch?.[0]?.toUpperCase() || "",
    logo: logo ? abs(url, logo) : "",
    ogImage: ogImage ? abs(url, ogImage) : "",
    images,
    social,
    links: [...new Set(links)],
    favicon,
    reviews: reviewBlocks,
    brandColors: extractBrandColors(doc, html),
    jsonName: jsonLd.name || "",
  };
}

export async function analyseWebsite(
  rawUrl: string,
  onProgress: ProgressFn = () => undefined,
) {
  const started = Date.now();
  const deadline = started + SCRAPE_LIMITS.jobDeadlineMs;
  const start = assertPublicHttpUrl(rawUrl);

  onProgress("Loading parser", { pages: 0, assets: 0 });
  const { parseHTML, Readability } = await loadParser();

  onProgress("Checking robots.txt", { pages: 0, assets: 0 });
  const allowed = await robotsAllows(start.origin, start.pathname || "/");
  if (!allowed) {
    throw new Error("robots.txt disallows this path. Import was stopped.");
  }

  onProgress("Discovering pages", { pages: 0, assets: 0 });
  const sitemapUrls = await discoverFromSitemap(start.origin);
  const seed = [
    start.toString(),
    ...sitemapUrls.filter((item) => item !== start.toString()),
  ];
  const seen = new Set<string>();
  const queue: string[] = [];
  for (const url of seed) {
    if (!seen.has(url)) {
      seen.add(url);
      queue.push(url);
    }
  }

  const pages: IntelligenceResult["pages"] = [];
  const images: IntelligenceResult["images"] = [];
  const services: IntelligenceResult["services"] = [];
  const reviews: IntelligenceResult["reviews"] = [];
  const social: Record<string, string> = {};
  const brandColors = new Set<string>();
  const provenance: IntelligenceResult["provenance"] = [];
  let name = start.hostname.replace(/^www\./, "");
  let tagline = "";
  let description = "";
  let phone = "";
  let email = "";
  let address = "";
  let postcode = "";
  let logoUrl = "";
  let faviconUrl = "";
  let heroUrl = "";
  let failures = 0;

  async function processUrl(current: string) {
    if (Date.now() > deadline) return;
    let parsed: URL;
    try {
      parsed = assertPublicHttpUrl(current);
    } catch {
      return;
    }
    if (parsed.origin !== start.origin) return;
    const pathOk = await robotsAllows(parsed.origin, parsed.pathname || "/");
    if (!pathOk) return;

    try {
      const html = await fetchText(parsed.toString());
      const extracted = extractFromDom(
        parsed,
        html,
        parseHTML as never,
        Readability as never,
      );
      const type = classifyPage(parsed.toString(), extracted.title);
      pages.push({
        url: parsed.toString(),
        title: extracted.title || parsed.pathname,
        type,
        heading: extracted.h1,
        excerpt: extracted.metaDesc || extracted.paragraphs[0] || "",
        body: extracted.body || extracted.paragraphs.slice(0, 3).join(" "),
        include: true,
      });
      provenance.push({
        sourceUrl: start.toString(),
        sourcePage: parsed.toString(),
        importedAt: new Date().toISOString(),
        contentType: type,
      });

      if (
        extracted.jsonName &&
        (!name || name === start.hostname.replace(/^www\./, ""))
      ) {
        name = extracted.jsonName;
      }
      if (!tagline) tagline = extracted.h1 || extracted.title;
      if (!description) {
        description =
          extracted.metaDesc ||
          extracted.paragraphs[0] ||
          extracted.body.slice(0, 400);
      }
      if (!phone) phone = extracted.phone;
      if (!email) email = extracted.email;
      if (!address) address = extracted.address;
      if (!postcode) postcode = extracted.postcode;
      if (!logoUrl) logoUrl = extracted.logo;
      if (!faviconUrl) faviconUrl = extracted.favicon;
      if (!heroUrl) heroUrl = extracted.ogImage;
      Object.assign(social, extracted.social);
      for (const color of extracted.brandColors) brandColors.add(color);

      for (const image of extracted.images) {
        if (!images.some((item) => item.url === image.url)) {
          images.push({
            ...image,
            include:
              image.kind === "logo" ||
              image.kind === "hero" ||
              image.kind === "favicon" ||
              Boolean(image.alt),
          });
        }
      }

      if (type === "home" || type === "services") {
        for (const heading of extracted.lists.slice(0, 8)) {
          if (
            !/cookie|menu|home|contact|about|login|privacy/i.test(heading) &&
            !services.some((item) => item.name === heading)
          ) {
            services.push({
              name: heading,
              description: extracted.paragraphs[0] || "",
              imageUrl: "",
              include: true,
            });
          }
        }
      }

      for (const quote of extracted.reviews) {
        if (!reviews.some((item) => item.quote === quote)) {
          reviews.push({
            customerName: "Customer",
            quote: quote.slice(0, 500),
            rating: 5,
            source: parsed.hostname,
            include: true,
          });
        }
      }

      if (pages.length < SCRAPE_LIMITS.maxPages) {
        for (const link of extracted.links) {
          if (
            !seen.has(link) &&
            queue.length + pages.length < SCRAPE_LIMITS.maxPages * 2
          ) {
            seen.add(link);
            queue.push(link);
          }
        }
      }
    } catch {
      failures += 1;
    }
  }

  // Homepage first (stable identity), then priority pages one-by-one / small batches.
  // Keep mutations single-threaded to avoid race conditions on shared collectors.
  const homepage = queue.shift();
  if (homepage) {
    onProgress("Extracting homepage", { pages: 0, assets: 0 });
    await processUrl(homepage);
  }

  while (
    queue.length &&
    pages.length < SCRAPE_LIMITS.maxPages &&
    Date.now() < deadline
  ) {
    const next = queue
      .sort((a, b) => pagePriority(a) - pagePriority(b))
      .splice(0, Math.min(SCRAPE_LIMITS.concurrency, queue.length));
    onProgress(
      `Extracting ${pages.length + 1}/${SCRAPE_LIMITS.maxPages} pages`,
      {
        pages: pages.length,
        assets: images.length,
      },
    );
    // Process batch sequentially for stable shared-state updates.
    for (const url of next) {
      if (pages.length >= SCRAPE_LIMITS.maxPages || Date.now() > deadline)
        break;
      await processUrl(url);
    }
  }

  if (!pages.length) {
    throw new Error(
      failures
        ? "Could not reach that site. Check the URL is public and try again."
        : "Could not extract any pages from that URL.",
    );
  }

  onProgress("Building content model", {
    pages: pages.length,
    assets: images.length,
  });

  const hostName = start.hostname.replace(/^www\./, "").split(".")[0];
  if (!name || name === start.hostname.replace(/^www\./, "")) {
    name =
      tagline.split(/[-|·•]/)[0]?.trim() ||
      hostName.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
  if (!logoUrl)
    logoUrl = images.find((item) => item.kind === "logo")?.url || "";
  if (!heroUrl) {
    heroUrl =
      images.find((item) => item.kind === "hero")?.url || images[0]?.url || "";
  }

  return {
    sourceUrl: start.toString(),
    name: name.slice(0, 160),
    tagline: tagline.slice(0, 200),
    description: description.slice(0, 4000),
    phone,
    email,
    address,
    postcode,
    logoUrl,
    faviconUrl,
    heroUrl,
    social,
    brandColors: [...brandColors].slice(0, 5),
    services: services.slice(0, 10),
    reviews: reviews.slice(0, 8),
    pages,
    images: images.slice(0, 32),
    provenance,
    robotsAllowed: true as boolean,
    engine: "readability+linkedom+jsonld",
  } satisfies IntelligenceResult;
}
