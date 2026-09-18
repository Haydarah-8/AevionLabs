import type { Topic } from "@/data/topics/types";

export const SERVICE_TOPICS: Topic[] = [
  {
    slug: "company-sites",
    name: "Company sites",
    kind: "service",
    kicker: "Presence",
    headline: "A site that still looks like the same company on the tenth page.",
    lede: "Positioning, structure, and a Next.js site on a repository you own. Your team publishes. We are not in the loop for a copy change.",
    about:
      "A company site is the first thing a buyer can judge. We settle who it is for and what they must do, then we build pages as a system so a new lander does not look like a cousin of the brand.",
    how: "You see a working prototype first. The remaining budget unlocks after you have used it. Domain, hosting, and CMS stay in your name.",
    uses: [
      "Positioning and information architecture before visual design.",
      "Next.js templates with a CMS your team can use.",
      "Conversion paths that are events, not a hope.",
    ],
    examples: [
      {
        title: "A brochure that became a system",
        body: "The first five templates covered the next twenty pages. Marketing stopped asking for a rebuild every quarter.",
      },
      {
        title: "Paid landers that matched the product",
        body: "Campaign URLs used the same type and the same form. The brand did not fork for ads.",
      },
      {
        title: "A handover the team used on week one",
        body: "They published a page without us. That was the test.",
      },
    ],
    related: ["strategy-ux", "web-development", "next-js", "performance"],
  },
  {
    slug: "saas",
    name: "SaaS products",
    kind: "service",
    kicker: "Product",
    headline: "The product your customers log into, built after you have clicked it.",
    lede: "Auth, billing, dashboards, and the flows that decide whether people stay. We prototype the thing you can refuse, then we build the real one.",
    about:
      "A deck is not a product. We start with the journeys that make money: sign-up, first value, upgrade, cancel. The interface is designed for the empty day as well as the full one.",
    how: "A clickable prototype on the real stack when we can. Then accounts, Stripe, and the tables you own. The rest of the budget waits until you have used it.",
    uses: [
      "Clickable prototypes of the core loops.",
      "Auth, organisations, and billing on keys you hold.",
      "Dashboards with empty states, errors, and a first-run that has a job.",
    ],
    examples: [
      {
        title: "A plan page you signed off by using",
        body: "Upgrade, fail, and cancel were in the prototype. Webhooks came after.",
      },
      {
        title: "A first-run that was not a blank app",
        body: "After sign-in, the product asked for one task. Retention started there.",
      },
      {
        title: "A schema that survived the first real tenant",
        body: "Postgres was in the prototype. We did not fake the data layer.",
      },
    ],
    related: ["clerk", "stripe", "supabase", "internal-tools"],
  },
  {
    slug: "ecommerce",
    name: "Ecommerce",
    kind: "service",
    kicker: "Retail",
    headline: "Stores that make the next purchase obvious.",
    lede: "Catalogue, checkout, and the pages paid traffic lands on. Shopify or a custom stack, designed around conversion rather than a theme you cannot trust.",
    about:
      "A theme that fights the brand is expensive. We design the product page, the lander, and the pay step as one system, then we keep the catalogue in a back office your team can run.",
    how: "You click a product page and a checkout path first. Then we build the storefront on a repository you own, with a speed budget that holds when the campaign spends.",
    uses: [
      "Headless or disciplined Shopify storefronts.",
      "Paid landing pages that match the product.",
      "Checkout and post-purchase that still look like the brand.",
    ],
    examples: [
      {
        title: "A campaign that did not melt the page",
        body: "Images and scripts were budgeted before the ads went on.",
      },
      {
        title: "A catalogue the team still owns",
        body: "They change a product without a developer. The storefront stays fast.",
      },
      {
        title: "A prototype of add to cart",
        body: "You used the real layout. Then we built the rest.",
      },
    ],
    related: ["shopify", "stripe", "company-sites", "performance"],
  },
  {
    slug: "internal-tools",
    name: "Tools for teams",
    kind: "service",
    kicker: "Operations",
    headline: "Software that replaces the spreadsheet and the inbox chain.",
    lede: "Ops dashboards, client portals, and company tools built around how the work actually moves. If the team will not open it, we have not finished.",
    about:
      "Internal software fails when it is a prettier copy of the sheet. We watch the work, then we design the few screens that remove the chase. Access and roles are part of the same brief.",
    how: "A prototype on the real workflow. Then auth, the database you own, and a handover so a new hire can run it. Domain and hosting stay in your name.",
    uses: [
      "Workflows that used to live in email.",
      "Client portals on the identity you already have.",
      "Roles, audit, and a handover that does not lock you in.",
    ],
    examples: [
      {
        title: "A queue that retired a shared inbox",
        body: "Jobs had a state. Nobody asked who had the file.",
      },
      {
        title: "A portal clients actually opened",
        body: "The first screen had the document they came for. The rest waited.",
      },
      {
        title: "A tool the next admin could extend",
        body: "The schema and the repo were theirs. We were optional.",
      },
    ],
    related: ["saas", "auth0", "postgresql", "web-development"],
  },
  {
    slug: "design-systems",
    name: "Design systems",
    kind: "service",
    kicker: "Structure",
    headline: "Tokens, components, and docs that are faster than a blank file.",
    lede: "A system is only useful if people use it. We ship components with states, accessibility notes, and live examples in the same place as the site.",
    about:
      "When a team ships more than one surface, buttons quietly multiply. We start with tokens, then components, then documentation written beside both. The test is adoption.",
    how: "Figma and code stay in lockstep. You click the live library. The remaining budget unlocks after the system is faster than starting again.",
    uses: [
      "Tokens for type, colour, and space.",
      "Components with states and accessibility notes.",
      "A live example next to the guideline, not a PDF.",
    ],
    examples: [
      {
        title: "A tenth page that did not invent a button",
        body: "The library already had it. The brand did not fork.",
      },
      {
        title: "A SaaS and a marketing site on one scale",
        body: "Paid traffic landed on the same type as the product.",
      },
      {
        title: "A handover designers still open",
        body: "The docs were the components. Nobody maintained a second file.",
      },
    ],
    related: ["figma", "react", "visual-design", "web-development"],
  },
  {
    slug: "care",
    name: "Care after launch",
    kind: "service",
    kicker: "Aftercare",
    headline: "Changes, features, and a handover that does not lock you in.",
    lede: "Keep us on for content and new work, or take the code and run it. Domain, hosting, and CMS stay in your name. Nothing is rented back to you.",
    about:
      "Launch is the start. A site that cannot change will quietly rot. We offer retainers for the work that keeps it current, and we write the runbook for the day you do not need us.",
    how: "A board you can see. Small changes in a cycle. Feature work scoped like any other brief. You can leave with the repo at any point.",
    uses: [
      "Content and landing pages after launch.",
      "Feature work on a product you already use.",
      "Handover, training, and a runbook with no lock-in.",
    ],
    examples: [
      {
        title: "A retainer that matched the board",
        body: "Each change was visible. The invoice was not a surprise.",
      },
      {
        title: "A team that published without us",
        body: "Training was a morning. The CMS did the rest.",
      },
      {
        title: "A clean exit",
        body: "They kept the repo, the domain, and the keys. We wished them well.",
      },
    ],
    related: ["company-sites", "saas", "github", "web-development"],
  },
  {
    slug: "strategy-ux",
    name: "Strategy & UX",
    kind: "service",
    kicker: "Foundation",
    headline: "Who it is for, what they must do, and how we will know it worked.",
    lede: "The expensive mistakes happen before anyone opens a design tool. We settle structure, journeys, and success metrics first so the build is execution.",
    about:
      "Most sites fail because the wrong problem was solved quickly. We start with the people, the jobs, and the numbers that matter after launch. Visual design waits until that map holds.",
    how: "Interviews, information architecture, flows, and a conversion map you can refuse. Then a prototype. The rest of the budget unlocks after you have used it.",
    uses: [
      "Discovery that names the actual user, not a persona poster.",
      "Information architecture and user flows.",
      "Success metrics agreed before colour is discussed.",
    ],
    examples: [
      {
        title: "A rebuild that started with the journeys",
        body: "We killed two pages that nobody needed. The new IA was shorter and clearer.",
      },
      {
        title: "A SaaS loop drawn before the UI",
        body: "Sign-up to first value was a map. Screens came after.",
      },
      {
        title: "Metrics that matched the form",
        body: "We named the events in the prototype. Analytics did not have to guess later.",
      },
    ],
    related: ["company-sites", "saas", "visual-design", "google-analytics"],
  },
  {
    slug: "visual-design",
    name: "Visual design",
    kind: "service",
    kicker: "Interface",
    headline: "Pages, type, and a layout system that still holds on page ten.",
    lede: "We design in reusable parts rather than one-off mockups. Colour, type, and spacing are documented so new pages belong to the same site.",
    about:
      "The interface is the first thing a brand communicates. We design templates and a small set of blocks, then we paint the journeys you already approved.",
    how: "Figma as the system file. A clickable prototype or a Next.js preview. Engineering builds from the same tokens, not from a guess.",
    uses: [
      "Interface design for sites, SaaS, and tools.",
      "Typography and layout systems.",
      "Brand in the product, not only on the home page.",
    ],
    examples: [
      {
        title: "A lander that used the product type",
        body: "Ads did not invent a second brand. The block was already in the file.",
      },
      {
        title: "A dashboard that still looked like the company",
        body: "The marketing site and the app shared the scale.",
      },
      {
        title: "A handoff without a treasure hunt",
        body: "States were in the file. Developers did not invent hover from memory.",
      },
    ],
    related: ["figma", "design-systems", "strategy-ux", "web-development"],
  },
  {
    slug: "web-development",
    name: "Web development",
    kind: "service",
    kicker: "Engineering",
    headline: "The same team writes the design and the code.",
    lede: "Next.js products on a repository you own: company sites, SaaS, ecommerce, and tools, with a CMS your team can publish from.",
    about:
      "Nothing is lost in a handoff because there is not one. We ship production code, not a prototype that needs rebuilding by a stranger.",
    how: "App Router, typed content, integrations, and accessible markup in the same engagement. You click a preview. Then we go live on your domain.",
    uses: [
      "Next.js and React on a repo in your organisation.",
      "SaaS, ecommerce, and internal tools.",
      "Headless CMS and the analytics that match the journeys.",
    ],
    examples: [
      {
        title: "A site that launched on the preview you already used",
        body: "Production was not a surprise. It was the same app.",
      },
      {
        title: "A CMS the marketing team kept",
        body: "They published on week one. We were not a bottleneck.",
      },
      {
        title: "Integrations that lived in the repo",
        body: "Forms, billing, and mail were code you can read, not a zap.",
      },
    ],
    related: ["next-js", "typescript", "company-sites", "saas"],
  },
  {
    slug: "performance",
    name: "Performance & accessibility",
    kind: "service",
    kicker: "Momentum",
    headline: "Speed and clarity treated as part of the build.",
    lede: "Core Web Vitals and WCAG are not a later audit. We budget them in the original timeline so the site arrives before the visitor leaves.",
    about:
      "A page that slows down quietly costs traffic you never see. We measure the journeys that make money, then we keep images, scripts, and contrast inside a budget you can hold.",
    how: "Budgets in the brief. Traces on the real device. Fixes in the same pull request as the feature. You leave with notes on how to keep it that way.",
    uses: [
      "Core Web Vitals on the pages that convert.",
      "WCAG checks inside the original timeline.",
      "Analytics and load budgets that survive a campaign.",
    ],
    examples: [
      {
        title: "A lander that held on a cheap Android",
        body: "We cut the weight until the form was ready. Paid traffic stopped bouncing.",
      },
      {
        title: "A store that stayed usable with a keyboard",
        body: "Checkout was a real form. Contrast was a requirement, not a polish pass.",
      },
      {
        title: "A handover with a budget",
        body: "The next campaign has a number to beat. They do not have to guess.",
      },
    ],
    related: ["company-sites", "ecommerce", "chrome", "web-development"],
  },
];
