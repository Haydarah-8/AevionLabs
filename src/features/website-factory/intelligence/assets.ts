import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { IntelligenceResult } from "./types";
import { SCRAPE_LIMITS, assertPublicHttpUrl } from "./ssrf";

const UA = "AevionWebsiteFactory/1.0 (+asset-import)";

function extFrom(url: string, contentType: string) {
  const fromUrl = path.extname(new URL(url).pathname).toLowerCase();
  if (fromUrl && fromUrl.length <= 5) return fromUrl;
  if (contentType.includes("png")) return ".png";
  if (contentType.includes("webp")) return ".webp";
  if (contentType.includes("gif")) return ".gif";
  if (contentType.includes("svg")) return ".svg";
  if (contentType.includes("ico")) return ".ico";
  return ".jpg";
}

function safeName(input: string) {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "asset"
  );
}

async function mapPool<T>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<void>,
) {
  let index = 0;
  async function run() {
    while (index < items.length) {
      const current = index;
      index += 1;
      await worker(items[current]);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length || 1) }, () =>
      run(),
    ),
  );
}

export async function downloadAndOrganiseAssets(
  projectId: string,
  result: IntelligenceResult,
): Promise<IntelligenceResult> {
  const root = path.join(process.cwd(), "public", "factory-assets", projectId);
  await mkdir(root, { recursive: true });

  const selected = result.images.filter((image) => image.include).slice(0, 16);
  const nextImages = [...result.images];
  let logoUrl = result.logoUrl;
  let faviconUrl = result.faviconUrl;
  let heroUrl = result.heroUrl;

  await mapPool(selected, 4, async (image) => {
    const i = selected.indexOf(image);
    try {
      if (image.url.startsWith("/factory-assets/")) return;
      assertPublicHttpUrl(image.url);
      const res = await fetch(image.url, {
        headers: { "user-agent": UA },
        redirect: "follow",
        signal: AbortSignal.timeout(SCRAPE_LIMITS.timeoutMs),
      });
      if (!res.ok) return;
      const type = res.headers.get("content-type") || "";
      if (
        !/^image\//i.test(type) &&
        !/\.(jpe?g|png|webp|gif|svg|ico)(\?|$)/i.test(image.url)
      ) {
        return;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.byteLength > 4_000_000) return;
      const folder = image.kind || "gallery";
      await mkdir(path.join(root, folder), { recursive: true });
      const file = `${safeName(image.alt || image.kind)}-${i}${extFrom(image.url, type)}`;
      const disk = path.join(root, folder, file);
      await writeFile(disk, buf);
      const publicUrl = `/factory-assets/${projectId}/${folder}/${file}`;
      const index = nextImages.findIndex((item) => item.url === image.url);
      if (index >= 0) {
        nextImages[index] = { ...nextImages[index], url: publicUrl };
      }
      if (image.kind === "logo" || image.url === result.logoUrl)
        logoUrl = publicUrl;
      if (image.kind === "favicon" || image.url === result.faviconUrl) {
        faviconUrl = publicUrl;
      }
      if (image.kind === "hero" || image.url === result.heroUrl)
        heroUrl = publicUrl;
    } catch {
      /* keep remote URL if download fails */
    }
  });

  return {
    ...result,
    logoUrl: logoUrl || result.logoUrl,
    faviconUrl: faviconUrl || result.faviconUrl,
    heroUrl: heroUrl || result.heroUrl,
    images: nextImages,
  };
}

export type OrganisedAsset = {
  url: string;
  alt: string;
  kind: string;
  include: boolean;
};

export function listOrganisedFromResult(
  result: IntelligenceResult | null,
): OrganisedAsset[] {
  if (!result) return [];
  return result.images.map((image) => ({
    url: image.url,
    alt: image.alt,
    kind: image.kind,
    include: image.include,
  }));
}
