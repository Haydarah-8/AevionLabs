/**
 * Every image on the site, in one place.
 *
 * Alt text lives here too, because it has to change whenever the picture does
 * (screen readers and search both use it, and stale alt text is worse than
 * none).
 *
 * TO SWAP AN IMAGE: drop the file into `public/images/` and change the filename
 * below. Nothing else needs touching - no component edits.
 */

type Img = { src: string; alt: string };

const img = (file: string, alt: string): Img => ({
  src: `/images/${file.replace(/\.avif$/i, ".jpg")}`,
  alt,
});

/* --- Home hero: clicking cycles these, so they read as one set --- */
export const HERO_IMAGES: Img[] = [
  img("hero-1.avif", "A monitor glowing in a darkened studio"),
  img(
    "hero-2.avif",
    "Macro view of a code editor, characters dissolved into bokeh",
  ),
  img("hero-3.avif", "Overhead view of wireframe sketches laid out on a desk"),
  img("hero-4.avif", "Hands resting on a mechanical keyboard under hard light"),
  img(
    "hero-5.avif",
    "A phone lying on a concrete surface, screen glowing faintly",
  ),
];

/* --- Standalone slots --- */
export const SITE_IMAGES = {
  homeIntro: img(
    "home-intro.avif",
    "A desk monitor and keyboard lit by a single lamp",
  ),
  homeAbout: img(
    "home-about.avif",
    "A blade of hard light falling across a studio wall",
  ),
  servicesHero: img(
    "services-hero.avif",
    "A glass rod standing lit in a dark room",
  ),
  servicesIntro: img(
    "services-intro.avif",
    "A smooth black sculptural form on a pale backdrop",
  ),
  aboutWide: img(
    "about-wide.avif",
    "An empty concrete hall with a grid of square openings",
  ),
  modal: img("modal.avif", "A machined steel dowel resting on folded paper"),
} satisfies Record<string, Img>;

/* --- Case studies ---
   `hero`  – case study header, work-page card and home slider thumbnail
   `one`…`four` – the four body images down the case study
   `bg`    – full-bleed backdrop behind the home slider (featured three only)

   Each project keeps to one material so the five read as distinct bodies of
   work: glass, modules, concrete, paper, devices. */
export type ProjectSlug = "prism" | "baseplate" | "forge" | "folio" | "orbit";

export const PROJECT_IMAGES = {
  prism: {
    hero: img(
      "prism-hero.avif",
      "Layered translucent panels receding into shadow",
    ),
    one: img("prism-1.avif", "Panes of glass casting overlapping shadows"),
    two: img("prism-2.avif", "A frosted glass panel lit from behind"),
    three: img("prism-3.avif", "Sheets of frosted acrylic stacked on concrete"),
    four: img("prism-4.avif", "A narrow slot cut through a concrete wall"),
    bg: img("prism-bg.avif", "An unlit neon tube mounted on a concrete wall"),
  },
  baseplate: {
    hero: img(
      "baseplate-hero.avif",
      "A grid of identical modules with one raised out of alignment",
    ),
    one: img("baseplate-1.avif", "A black cube resting on a concrete surface"),
    two: img(
      "baseplate-2.avif",
      "A glossy black organic form, half matte and half polished",
    ),
    three: img(
      "baseplate-3.avif",
      "An empty studio corner stacked with concrete blocks",
    ),
    four: img(
      "baseplate-4.avif",
      "A sculptural black form catching a single highlight",
    ),
    bg: img("baseplate-bg.avif", "A concrete block casting a hard shadow"),
  },
  forge: {
    hero: img("forge-hero.avif", "A bolt on concrete casting a long shadow"),
    one: img("forge-1.avif", "A steel rod lying across grey tile"),
    two: img("forge-2.avif", "An electrical cord coiled on a bare floor"),
    three: img("forge-3.avif", "Black card stock torn along a sharp edge"),
    four: img("forge-4.avif", "An empty studio interior with a single desk"),
    bg: img("forge-bg.avif", "A wide empty studio interior in low light"),
  },
  folio: {
    hero: img(
      "folio-hero.avif",
      "Printed page layouts pinned across a studio wall",
    ),
    one: img(
      "folio-1.avif",
      "Sheets of tracing paper overlapping on a light table",
    ),
    two: img("folio-2.avif", "A stack of paper viewed edge-on"),
    three: img("folio-3.avif", "Stacked raw paper sheets under raking light"),
    four: img("folio-4.avif", "Paper boards lit by a hard directional light"),
    bg: img("folio-bg.avif", "Printed layouts arranged across a wall"),
  },
  orbit: {
    hero: img(
      "orbit-hero.avif",
      "A phone and laptop side by side, screens glowing",
    ),
    one: img(
      "orbit-1.avif",
      "Close crop of a screen edge, interface shapes defocused",
    ),
    two: img("orbit-2.avif", "An open laptop on a desk in a darkened room"),
    three: img("orbit-3.avif", "A phone standing upright on a plinth"),
    four: img("orbit-4.avif", "A stylus resting on a black sketchbook"),
    bg: img("orbit-bg.avif", "A phone and laptop on a desk, lit from one side"),
  },
} satisfies Record<ProjectSlug, Record<string, Img>>;

/* --- Home image band ---
   The strip that scrubs sideways between About and the CTA. Order matters -
   neighbours should not share a material, or it reads as one long photograph. */
export const BAND_IMAGES: Img[] = [
  PROJECT_IMAGES.prism.hero,
  PROJECT_IMAGES.forge.two,
  PROJECT_IMAGES.orbit.hero,
  PROJECT_IMAGES.folio.one,
  PROJECT_IMAGES.baseplate.hero,
  PROJECT_IMAGES.prism.three,
  PROJECT_IMAGES.forge.hero,
  PROJECT_IMAGES.folio.three,
];
