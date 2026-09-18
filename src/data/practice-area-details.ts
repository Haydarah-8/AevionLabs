export type PracticeAreaDetail = {
  id: string;
  title: string;
  heroImage: string;
  heroImageObjectPosition?: string;
  paragraphs: string[];
};

export const practiceAreaDetails: PracticeAreaDetail[] = [
  {
    id: "strategy-ux",
    title: "Strategy & UX",
    heroImage: "/images/hero-3.jpg",
    paragraphs: [
      "Most websites fail because the wrong problem was solved quickly. We start with who the site is for, what they need to do, and which numbers actually matter after launch.",
      "Work includes stakeholder interviews, information architecture, user flows, wireframes, and a conversion map agreed before visual design begins.",
    ],
  },
  {
    id: "visual-design",
    title: "Visual design",
    heroImage: "/images/folio-hero.jpg",
    paragraphs: [
      "The interface is the first thing a brand communicates. We design pages as a system: type, colour, spacing, and components that still look like they belong when you add a tenth page.",
      "Deliverables include key templates, a small set of reusable blocks, and a design file your developers, or ours, can build from without guesswork.",
    ],
  },
  {
    id: "web-development",
    title: "Web development",
    heroImage: "/images/orbit-hero.jpg",
    paragraphs: [
      "We write the code as well as the design. Marketing sites and product surfaces are built in Next.js and React, on a repository you own, with a CMS your team can publish from.",
      "Integrations, analytics, and accessible markup are part of the same engagement, not a second contract after the pictures are signed off.",
    ],
  },
  {
    id: "design-systems",
    title: "Design systems",
    heroImage: "/images/baseplate-hero.jpg",
    paragraphs: [
      "When a team is shipping more than one product, buttons quietly multiply. We build a shared library: tokens first, components second, documentation written alongside both.",
      "The test of a system is adoption. Whatever we ship has to be faster to use than rebuilding from scratch, or it will be ignored inside a month.",
    ],
  },
  {
    id: "performance",
    title: "Performance & accessibility",
    heroImage: "/images/forge-hero.jpg",
    paragraphs: [
      "Speed and clarity are not polish. They are how people reach the thing you are selling. We budget for Core Web Vitals, image strategy, and WCAG checks inside the original timeline.",
      "You leave with a site that arrives before the visitor loses interest, and with notes on how to keep it that way.",
    ],
  },
  {
    id: "care",
    title: "Care & retainers",
    heroImage: "/images/home-intro.jpg",
    paragraphs: [
      "After launch we can stay on for content, features, and the small changes that keep a site current. Retainers are optional.",
      "The site runs without us: code on your repository, content in your CMS, domain and hosting in your name. Nothing is rented back to you.",
    ],
  },
];
