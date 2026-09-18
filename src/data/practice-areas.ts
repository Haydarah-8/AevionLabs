export type PracticeArea = {
  id: string;
  title: string;
  excerpt: string;
  heroImage: string;
  heroImageObjectPosition?: string;
  body: string[];
};

export const PRACTICE_AREA_GRADIENT_OVERLAY = "";

export const practiceAreas: PracticeArea[] = [
  {
    id: "strategy-ux",
    title: "Strategy & UX",
    excerpt:
      "Who the product is for, what they need to do, and how we will know it worked, settled before anyone opens a design file.",
    heroImage: "/images/hero-3.jpg",
    body: [
      "The expensive mistakes happen before anyone opens a design tool. We settle structure, journeys, and success metrics first so the build is execution rather than a series of late changes.",
    ],
  },
  {
    id: "visual-design",
    title: "Visual design",
    excerpt:
      "Pages, type, and a layout system that still looks like the same site when you add a tenth page.",
    heroImage: "/images/folio-hero.jpg",
    body: [
      "We design in reusable parts rather than one-off mockups. Colour, type, and spacing are documented so new pages belong to the same site instead of drifting.",
    ],
  },
  {
    id: "web-development",
    title: "Web development",
    excerpt:
      "Next.js products on a repository you own: company sites, SaaS, ecommerce, and internal tools, with a CMS your team can publish from.",
    heroImage: "/images/orbit-hero.jpg",
    body: [
      "The same team designs and writes the code, so nothing is lost in a handoff. You get a production site on your repository, not a prototype that needs rebuilding.",
    ],
  },
  {
    id: "design-systems",
    title: "Design systems",
    excerpt:
      "Tokens, components, and documentation that are faster to use than starting from scratch.",
    heroImage: "/images/baseplate-hero.jpg",
    body: [
      "A system is only useful if it is faster than starting from scratch. We ship components with states, accessibility notes, and live examples in the same place.",
    ],
  },
  {
    id: "performance",
    title: "Performance & accessibility",
    excerpt:
      "Core Web Vitals and WCAG treated as part of the build, not a later audit that arrives after launch.",
    heroImage: "/images/forge-hero.jpg",
    body: [
      "A site that slows down quietly costs traffic you never see. We measure what matters before launch and keep it in shape afterwards.",
    ],
  },
  {
    id: "care",
    title: "Care & retainers",
    excerpt:
      "Content, features, and a handover that does not lock you in. Domain, hosting, and CMS stay in your name.",
    heroImage: "/images/home-intro.jpg",
    body: [
      "Launch is the start. Keep us on for changes, or take the code and run it yourselves. Domain, hosting, and CMS stay in your name.",
    ],
  },
];
