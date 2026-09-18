export const HERO_KICKER = "Manchester · sites, SaaS, tools";

export const HERO_SLIDES = [
  {
    headline: "See it working.\nThen fund it.",
    body: "A working prototype first. The rest of the budget stays locked.",
  },
  {
    headline: "Use it first.\nFund it second.",
    body: "You decide after you have used it, not after a presentation.",
  },
  {
    headline: "Judge it in the browser.\nThen fund the build.",
    body: "Wrong paths show up before anyone writes production code.",
  },
  {
    headline: "Keep the budget locked.\nUntil you have used it.",
    body: "The remaining spend waits until the product is in your hands.",
  },
  {
    headline: "Click through it.\nThen decide.",
    body: "The people who scope the work are the people who build it.",
  },
] as const;

export const HERO_HEADLINE = HERO_SLIDES[0].headline;
export const HERO_BODY = HERO_SLIDES[0].body;

export const HERO_CTA_LABEL = "Let's talk";
export const HERO_CTA_HREF = "#talk";
export const HERO_SECONDARY_LABEL = "What we build";
export const HERO_SECONDARY_HREF = "/services";

export const AGENCY_HEADING =
  "Every week without a working system costs you the same traffic twice.";

export const AGENCY_LEFT =
  "Paid ads land on a site nobody can update. A SaaS idea sits in a deck. The shop still runs on a theme you cannot trust. An internal tool is still a spreadsheet. The loss is quiet, and it compounds.";

export const AGENCY_RIGHT =
  "We plan, design, and ship the product you can put in front of customers or your team. Company websites, ecommerce, SaaS, and tools built for how you actually work. One studio in Manchester. You see it in the browser before the rest of the spend unlocks.";

export const AGENCY_NOTE =
  "You do not buy the full build until you have seen the system working.";

export const STUDIO_DISPLAY = "from vision to reality";

export const STUDIO_HEADING = "Good products are engineering, not decoration.";

export const STUDIO_LEFT =
  "Aevion Labs is a Manchester studio built on the belief that a site, a store, or a tool is never just a coat of paint. It is the first and most persistent thing a company communicates.";

export const STUDIO_RIGHT =
  "We work slowly and selectively. We settle the brief before anyone opens a design file, and we build systems that still hold after the project ends. You see the product in the browser before the rest of the spend unlocks.";

export const BAND_KICKER = "Prototype";

export const BAND_LINE = "See it working.";

export const BAND_BODY =
  "A clickable system first. The rest of the budget stays locked until you have used it.";

export const SERVICES_HEADING =
  "Company sites. SaaS. Ecommerce. Tools.\nOr the piece that is stalling.";

export const SERVICES_INTRO =
  "Take the whole product, or bring us in for strategy, design, or engineering. You see a working prototype before the rest of the budget unlocks.";

export const HOME_CTA_HEADING =
  "If it is stalling, send it. If it is not built yet, start here.";

export const TALK_HEADING = "Tell us what needs to ship.";

export const TALK_BODY =
  "A company site, a SaaS product, an ecommerce store, or a tool your team is still running in a spreadsheet. The first step is a working prototype. The full build waits until you have used it.";

export const PREFOOTER_HEADING = "Stop funding work you cannot see yet.";

export const PREFOOTER_BODY =
  "Tell us what has to launch, or what is stalling. You see a working prototype or design system before the rest of the budget unlocks.";

export const FOOTER_BLURB =
  "You see a working prototype before the rest of the budget unlocks. Company sites, SaaS, ecommerce, and tools for teams. One studio in";

export const MODAL_HEADING = "Tell us what needs to ship.";

export const MODAL_BODY =
  "A company site, a SaaS product, an ecommerce store, or a tool your team is still running in a spreadsheet. Send what you need, when you need it, and where you are starting from. You see a working prototype first. The rest of the budget stays locked until you have used it.";

export const MODAL_NOTE =
  "We read every enquiry ourselves and reply with honest next steps, even when we are not the right fit.";

export const ABOUT_LEAD_KICKER = "The studio";
export const ABOUT_LEAD_TITLE = "We exist so you stop buying a promise.";
export const ABOUT_LEAD_BODY =
  "Most tech projects fail at the handoff: strategy in one room, design in another, engineering somewhere else. We keep one team on the brief from first sketch to launch, and we do not unlock the rest of the budget until you have used a working prototype.";

export const SERVICES_LEAD_KICKER = "What we build";
export const SERVICES_LEAD_TITLE =
  "Name the product.\nWe will put it in the browser.";
export const SERVICES_LEAD_BODY =
  "Company sites, SaaS, ecommerce, internal tools, and the systems that keep them fast to change. Take the whole engagement, or bring us in for the piece that is stalling.";

export const INSIGHTS_LEAD_KICKER = "Insights";
export const INSIGHTS_LEAD_TITLE =
  "Notes on shipping products that have to earn their keep.";
export const INSIGHTS_LEAD_BODY =
  "How we think about AI features, apps, code, and the decisions that decide whether a site, a SaaS tool, or an internal system actually gets used.";

export const BLOGS_LEAD_KICKER = INSIGHTS_LEAD_KICKER;
export const BLOGS_LEAD_TITLE = INSIGHTS_LEAD_TITLE;
export const BLOGS_LEAD_BODY = INSIGHTS_LEAD_BODY;

export const PROOF = [
  {
    n: "01",
    title: "Prototype first",
    body: "You use the system before the rest of the budget unlocks.",
  },
  {
    n: "02",
    title: "One team",
    body: "Strategy, design, and engineering stay in the same room.",
  },
  {
    n: "03",
    title: "You own it",
    body: "Code, CMS, domain, and hosting sit in your name.",
  },
];

export const WHO_ITS_FOR = [
  {
    title: "Company sites",
    body: "Marketing sites that convert, stay fast, and can be updated without a ticket every week.",
  },
  {
    title: "SaaS products",
    body: "Accounts, billing, dashboards, and the first version you can put in front of users.",
  },
  {
    title: "Ecommerce",
    body: "Catalogues, checkout, and landing pages that hold up when paid traffic lands.",
  },
  {
    title: "Internal tools",
    body: "The workflow still living in a spreadsheet, rebuilt as a product the team will actually use.",
  },
];

export const CAPABILITY_PRACTICES = [
  "Strategy",
  "UX",
  "Interface",
  "Design systems",
  "Care",
] as const;

export const CAPABILITY_PLATFORMS = [
  "Next.js",
  "SaaS",
  "Ecommerce",
  "AI features",
  "iOS",
  "Android",
  "Figma",
  "Analytics",
] as const;

export const CAPABILITY_LINE = [
  ...CAPABILITY_PRACTICES,
  ...CAPABILITY_PLATFORMS,
].join(" · ");

export const STACK_KICKER = "Platforms";

export const STACK_HEADING = "The stack the product runs on.";

export const STACK_BODY =
  "Next.js, Stripe, and the CMS your team already uses. You own the keys.";

export const TOOL_CARDS = [
  {
    name: "Next.js",
    color: "#000000",
    use: "The framework we ship production sites on.",
    how: "App Router products on a repository you own.",
  },
  {
    name: "React",
    color: "#61DAFB",
    use: "The interface layer for sites, SaaS, and tools.",
    how: "Components we can reuse, test, and hand over.",
  },
  {
    name: "TypeScript",
    color: "#3178C6",
    use: "Typed JavaScript so the product stays changeable.",
    how: "Shared types from the CMS through to the UI.",
  },
  {
    name: "Supabase",
    color: "#3FCF8E",
    use: "Auth, database, and storage without a lock-in host.",
    how: "Your project, your keys, a CMS your team can publish from.",
  },
  {
    name: "Vercel",
    color: "#000000",
    use: "Hosting and previews for Next.js products.",
    how: "Preview every change before it goes live.",
  },
  {
    name: "Figma",
    color: "#F24E1E",
    use: "The file we design the system in.",
    how: "Screens, tokens, and a handoff the build can follow.",
  },
  {
    name: "Stripe",
    color: "#635BFF",
    use: "Payments for SaaS and checkout.",
    how: "Billing and pay flows wired into the product, not a plugin.",
  },
  {
    name: "Shopify",
    color: "#96BF48",
    use: "Ecommerce catalogues and checkout.",
    how: "Headless storefronts that hold up when paid traffic lands.",
  },
  {
    name: "PostgreSQL",
    color: "#4169E1",
    use: "The database the product actually owns.",
    how: "Schema we design with you, on your instance.",
  },
  {
    name: "Tailwind",
    color: "#06B6D4",
    use: "The CSS system that keeps pages consistent.",
    how: "Tokens and utilities that match the design system.",
  },
  {
    name: "Clerk",
    color: "#6C47FF",
    use: "Accounts and session handling for SaaS.",
    how: "Sign-in that does not become a side project.",
  },
  {
    name: "Mapbox",
    color: "#000000",
    use: "Maps and location in the product.",
    how: "Store finders and maps that stay fast on the page.",
  },
] as const;

export const LEGACY_HERO_HEADLINE = "Design it once.\nBuild it to last.";

export const LEGACY_HERO_BODY =
  "Aevion Labs is a Manchester web agency for teams who want one partner from first sketch to launch. We make sites that convert, stay fast, and can be updated without calling us every week.";

export const PREV_HERO_HEADLINE = "See it working.\nThen decide to fund it.";

export const PREV_HERO_BODY =
  "Company sites, SaaS products, ecommerce, and internal tools for teams who are done paying for work they cannot judge. You get a working prototype first. The rest of the budget stays locked until you have used it.";

export function freshCopy(value: string | undefined, ...legacy: string[]) {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (legacy.some((item) => item.trim() === trimmed)) return undefined;
  return value;
}
