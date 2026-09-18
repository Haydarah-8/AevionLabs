import {
  BAND_IMAGES,
  HERO_IMAGES,
  PROJECT_IMAGES,
  SITE_IMAGES,
} from "@/lib/images";

type Img = { src: string; alt: string };

const POOL: Img[] = [
  ...HERO_IMAGES,
  SITE_IMAGES.homeIntro,
  SITE_IMAGES.homeAbout,
  SITE_IMAGES.servicesHero,
  SITE_IMAGES.servicesIntro,
  SITE_IMAGES.aboutWide,
  PROJECT_IMAGES.prism.hero,
  PROJECT_IMAGES.prism.one,
  PROJECT_IMAGES.prism.two,
  PROJECT_IMAGES.prism.three,
  PROJECT_IMAGES.prism.four,
  PROJECT_IMAGES.baseplate.hero,
  PROJECT_IMAGES.baseplate.one,
  PROJECT_IMAGES.baseplate.two,
  PROJECT_IMAGES.baseplate.three,
  PROJECT_IMAGES.forge.hero,
  PROJECT_IMAGES.forge.one,
  PROJECT_IMAGES.forge.two,
  PROJECT_IMAGES.forge.three,
  PROJECT_IMAGES.folio.hero,
  PROJECT_IMAGES.folio.one,
  PROJECT_IMAGES.folio.two,
  PROJECT_IMAGES.folio.three,
  PROJECT_IMAGES.orbit.hero,
  PROJECT_IMAGES.orbit.one,
  PROJECT_IMAGES.orbit.two,
  PROJECT_IMAGES.orbit.three,
  ...BAND_IMAGES,
];

function hashSlug(slug: string) {
  let n = 2166136261;
  for (let i = 0; i < slug.length; i += 1) {
    n ^= slug.charCodeAt(i);
    n = Math.imul(n, 16777619);
  }
  return n >>> 0;
}

export function imagesForTopic(slug: string) {
  const start = hashSlug(slug);
  const used = new Set<string>();
  const pick = (offset: number): Img => {
    for (let step = 0; step < POOL.length; step += 1) {
      const img = POOL[(start + offset + step * 11) % POOL.length];
      if (!used.has(img.src)) {
        used.add(img.src);
        return img;
      }
    }
    return POOL[offset % POOL.length];
  };

  return {
    hero: pick(0),
    intro: pick(3),
    band: pick(6),
    featured: pick(9),
    split: pick(14),
    examples: [pick(18), pick(22), pick(26), pick(30)] as const,
  };
}
