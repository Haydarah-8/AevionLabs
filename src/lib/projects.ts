import { PROJECT_IMAGES } from "@/lib/images";

export type Project = {
  slug: string;
  client: string;
  overview: string;
  services: string[];
  year: string;
  heroImg: { src: string; alt: string };
  rows: {
    cpt: string;
    text: string;
    img?: { src: string; alt: string };
  }[];
  result: { cpt: string; text: string };
  next: { slug: string; name: string; desc: string; img: { src: string; alt: string } };
};

export const PROJECTS: Record<string, Project> = {
  prism: {
    slug: "prism",
    client: "Prism",
    overview:
      "Prism is an analytics product whose value only becomes obvious once you are inside it, which is what made the marketing site a hard problem. The work was a new site, and a design system the product team could build the app from as well.",
    services: ["Product & UX", "Design System", "Next.js Build"],
    year: "2026",
    heroImg: PROJECT_IMAGES.prism.hero,
    rows: [
      {
        cpt: "01 · INTRO",
        text: "The old site sold features. Nobody buys an analytics tool because of a feature list. They buy it because they believe it will make one specific decision easier.",
        img: PROJECT_IMAGES.prism.one,
      },
      {
        cpt: "02 · Challenge",
        text: "Two audiences, one page. Engineers wanted the data model and the API. The people signing the invoice wanted a reason to care. Neither would sit through the other's version.",
        img: PROJECT_IMAGES.prism.two,
      },
      {
        cpt: "03 · Solution",
        text: "One scrolling narrative that opens on the decision and works backwards into the mechanics, so both readers reach their answer without a tab switch or a second page to keep up to date.",
        img: PROJECT_IMAGES.prism.three,
      },
      {
        cpt: "03 · Solution",
        text: "Built as a component library first and a website second. Every block on the marketing site is the same code the product ships, so the two stopped drifting apart the week after launch.",
        img: PROJECT_IMAGES.prism.four,
      },
    ],
    result: {
      cpt: "04 · result",
      text: "One codebase, two surfaces. Marketing publishes without a developer, and the product inherited a design system it did not have before.",
    },
    next: {
      slug: "baseplate",
      name: "Baseplate",
      desc: "A component library for a team with four products and four different buttons.",
      img: PROJECT_IMAGES.baseplate.hero,
    },
  },
  baseplate: {
    slug: "baseplate",
    client: "Baseplate",
    overview:
      "Baseplate is a component library and documentation site for a team running four products with four different button styles. The work was one system, documented well enough that people actually reach for it.",
    services: ["Design System", "Component Library", "Documentation"],
    year: "2026",
    heroImg: PROJECT_IMAGES.baseplate.hero,
    rows: [
      {
        cpt: "01 · INTRO",
        text: "Every team had quietly rebuilt the same twelve components slightly differently. Nobody had done anything wrong. There was simply no shared place to put them.",
        img: PROJECT_IMAGES.baseplate.one,
      },
      {
        cpt: "02 · Challenge",
        text: "Design systems fail on adoption, not on design. Whatever we built had to be faster to use than rebuilding from scratch, or it would be ignored inside a month.",
        img: PROJECT_IMAGES.baseplate.two,
      },
      {
        cpt: "03 · Solution",
        text: "Tokens first, components second, documentation written alongside both, with live, editable examples, so a developer can see the prop they need instead of reading about it.",
        img: PROJECT_IMAGES.baseplate.three,
      },
      {
        cpt: "03 · Solution",
        text: "Every component ships with its states, its accessibility notes and its do-and-don't in the same view. Nothing lives in a separate spec that quietly goes stale.",
        img: PROJECT_IMAGES.baseplate.four,
      },
    ],
    result: {
      cpt: "04 · result",
      text: "Four versions of everything became one. New screens now start from the system instead of from an empty file.",
    },
    next: {
      slug: "forge",
      name: "Forge",
      desc: "Six thousand products, and a search that finally returns the right part.",
      img: PROJECT_IMAGES.forge.hero,
    },
  },
  forge: {
    slug: "forge",
    client: "Forge",
    overview:
      "Forge supplies fixings and fabricated parts to trade. Six thousand products, a search that did not work, and a catalogue that took two days and a developer to add a single line to.",
    services: ["Information Architecture", "Headless CMS", "Next.js Build"],
    year: "2026",
    heroImg: PROJECT_IMAGES.forge.hero,
    rows: [
      {
        cpt: "01 · INTRO",
        text: "Their customers knew exactly what they wanted and still could not find it. That is an information architecture problem long before it is a design one.",
        img: PROJECT_IMAGES.forge.one,
      },
      {
        cpt: "02 · Challenge",
        text: "Six thousand products, inconsistent naming, and a catalogue that had grown one supplier at a time for eleven years. It had to be restructured without breaking a single existing link.",
        img: PROJECT_IMAGES.forge.two,
      },
      {
        cpt: "03 · Solution",
        text: "A rebuilt taxonomy, faceted search filtering on the attributes trade buyers actually use, and specification sheets on the product page rather than behind an email.",
        img: PROJECT_IMAGES.forge.three,
      },
      {
        cpt: "03 · Solution",
        text: "Moved onto a headless CMS their own team runs. Adding a product line is a form now, not a support ticket and a wait.",
        img: PROJECT_IMAGES.forge.four,
      },
    ],
    result: {
      cpt: "04 · result",
      text: "A search that returns the part. Their team publishes the catalogue themselves, and every old URL still resolves.",
    },
    next: {
      slug: "folio",
      name: "Folio",
      desc: "An independent publication given layouts its editors can compose with.",
      img: PROJECT_IMAGES.folio.hero,
    },
  },
  folio: {
    slug: "folio",
    client: "Folio",
    overview:
      "Folio is an independent publication with a print sensibility and a website that had none. The redesign gave the editorial team a set of layouts to compose with, instead of one template everything was poured into.",
    services: ["Editorial Design", "Headless CMS", "Performance"],
    year: "2026",
    heroImg: PROJECT_IMAGES.folio.hero,
    rows: [
      {
        cpt: "01 · INTRO",
        text: "Long-form writing was being published into a layout designed for blog posts. The reading experience undercut the work before anyone finished the first paragraph.",
        img: PROJECT_IMAGES.folio.one,
      },
      {
        cpt: "02 · Challenge",
        text: "Editorial teams need range without needing a developer. Every layout we added had to be something an editor could choose, fill and publish on their own.",
        img: PROJECT_IMAGES.folio.two,
      },
      {
        cpt: "03 · Solution",
        text: "A small set of composable article layouts (full-bleed, two-column, pull-quote, gallery) arranged block by block in the CMS by whoever is writing.",
        img: PROJECT_IMAGES.folio.three,
      },
      {
        cpt: "03 · Solution",
        text: "Typography sized for reading rather than for screenshots, and images served at the size they are actually displayed. The heaviest article arrives in under a second.",
        img: PROJECT_IMAGES.folio.four,
      },
    ],
    result: {
      cpt: "04 · result",
      text: "A publication that reads like one. Editors ship pieces without asking anybody, and the archive loads faster than the old homepage did.",
    },
    next: {
      slug: "orbit",
      name: "Orbit",
      desc: "A storefront rebuilt for the phone, where nine in ten of its customers already were.",
      img: PROJECT_IMAGES.orbit.hero,
    },
  },
  orbit: {
    slug: "orbit",
    client: "Orbit",
    overview:
      "Orbit sells a small range of well-made objects, almost entirely to people on phones. The old store had been designed on a desktop and it showed from the first tap.",
    services: ["Mobile-First UX", "E-commerce Build", "Core Web Vitals"],
    year: "2026",
    heroImg: PROJECT_IMAGES.orbit.hero,
    rows: [
      {
        cpt: "01 · INTRO",
        text: "Nine in ten sessions were on a phone. Checkout ran to four steps, two of which asked for information the shop already had.",
        img: PROJECT_IMAGES.orbit.one,
      },
      {
        cpt: "02 · Challenge",
        text: "Speed and richness pull against each other on a product page. Every image that sells the object is also a reason the page arrives late.",
        img: PROJECT_IMAGES.orbit.two,
      },
      {
        cpt: "03 · Solution",
        text: "Designed for the phone first and widened from there, with checkout cut to two steps and nothing asked for twice.",
        img: PROJECT_IMAGES.orbit.three,
      },
      {
        cpt: "03 · Solution",
        text: "Images in modern formats at the exact size each breakpoint renders, and no third-party script allowed to block the first paint.",
        img: PROJECT_IMAGES.orbit.four,
      },
    ],
    result: {
      cpt: "04 · result",
      text: "A store that arrives before the visitor loses interest. Same catalogue, same photography, a fraction of the weight.",
    },
    next: {
      slug: "prism",
      name: "Prism",
      desc: "An analytics product with a site that explains the decision, not the feature list.",
      img: PROJECT_IMAGES.prism.hero,
    },
  },
};
