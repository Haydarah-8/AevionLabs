export type Solution = {
  id: string;
  title: string;
  tag: string;
  excerpt: string;
  body: string;
};

export const SOLUTIONS: Solution[] = [
  {
    id: "company-sites",
    title: "Company sites",
    tag: "Presence",
    excerpt:
      "Marketing sites that load fast, convert, and that your team can update without calling a developer.",
    body: "Positioning, structure, and a Next.js site on a repository you own. Built so a tenth page still looks like the same company, and so your team can publish without us.",
  },
  {
    id: "saas",
    title: "SaaS products",
    tag: "Product",
    excerpt:
      "Web apps your customers log into: billing, accounts, and the flows that decide whether they stay.",
    body: "We prototype the product you can click through, then build the real thing. Auth, billing, dashboards, and the interface your users will actually live in.",
  },
  {
    id: "ecommerce",
    title: "Ecommerce",
    tag: "Retail",
    excerpt:
      "Stores that make the next purchase obvious: catalogues, checkout, and the pages paid traffic lands on.",
    body: "Shopify or a custom stack, designed around conversion rather than a theme you cannot trust. Fast pages, clear product stories, and a checkout your team can run.",
  },
  {
    id: "internal-tools",
    title: "Tools for teams",
    tag: "Operations",
    excerpt:
      "Internal software that replaces the spreadsheet, the inbox chain, and the tool nobody quite owns.",
    body: "Ops dashboards, client portals, and company tools built around how the work actually moves. If the team will not open it, we have not finished.",
  },
  {
    id: "systems",
    title: "Design systems",
    tag: "Structure",
    excerpt:
      "Tokens, components, and documentation that are faster to use than starting from scratch.",
    body: "A system is only useful if it is faster than a blank file. We ship components with states, accessibility notes, and live examples in the same place.",
  },
  {
    id: "care",
    title: "Care after launch",
    tag: "Aftercare",
    excerpt:
      "Content, features, and a handover that does not lock you in. Domain, hosting, and CMS stay in your name.",
    body: "Keep us on for changes, or take the code and run it yourselves. Nothing is rented back to you, and nothing is held to keep you here.",
  },
];
