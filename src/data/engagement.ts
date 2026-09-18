export const PROCESS_STEPS = [
  {
    title: "Brief and conversion map",
    body: "Who it is for, what they must do, and which numbers matter after launch. Settled before anyone opens a design file, whether this is a site, a store, a SaaS product, or a tool for the team.",
  },
  {
    title: "Prototype or design system",
    body: "You see a working prototype or the interface system in the browser. This is the value first. The rest of the budget stays locked until you have seen it.",
  },
  {
    title: "Budget unlocks for the build",
    body: "Only after you approve the system do we unlock the remaining spend. You are not buying a full build on a slide deck.",
  },
  {
    title: "Next.js build on a repo you own",
    body: "The same team writes the production code. The product lives on your repository, with a CMS your team can publish from.",
  },
  {
    title: "Launch, analytics, optional care",
    body: "Tracking, accessibility, and a clean handover are part of the build. Keep us on for changes, or run it yourselves. Domain, hosting, and CMS stay in your name.",
  },
];

export const AGENCY_VALUES = [
  {
    title: "You talk to the people building it",
    body: "No account managers, no brief passed down a chain until the intent is gone. The people who scope the work are the people who design it and write the code.",
  },
  {
    title: "You see the system before the spend",
    body: "A working prototype or design system comes first. The rest of the budget stays locked until you have seen it in the browser. That is how the risk comes out of the engagement.",
  },
  {
    title: "You own everything",
    body: "Code sits on your repository, content in a CMS you control, domain and hosting in your name. Keep us on because the work is good, not because leaving would be painful.",
  },
  {
    title: "Honest if we are not the fit",
    body: "We will say if the budget is not enough, or if another team would serve you better. You get a clear next step either way, not a pitch that wastes a week.",
  },
];

export const SERVICE_FAQS = [
  {
    question: "What does a website cost?",
    answer:
      "Every project is quoted as a fixed price after we have seen the brief. There is no hourly billing and no surprise invoice. Tell us the budget you have and we will say what is achievable inside it, or say if it is not enough. That holds for company sites, SaaS, ecommerce, and internal tools.",
  },
  {
    question: "When do we pay for the full build?",
    answer:
      "After you have seen a working prototype or design system. That first piece is the value. The rest of the budget unlocks only when you approve it. You are not funding a full build on a deck of slides.",
  },
  {
    question: "Do we actually own it?",
    answer:
      "Yes. The code lives on your repository, the content in a CMS on your account, the domain and hosting in your name. Nothing is rented back to you, and nothing is held to keep you here.",
  },
  {
    question: "How long does it take?",
    answer:
      "A typical marketing site runs four to eight weeks from first call to launch. A SaaS product or internal tool takes longer because the product itself is the work. Waiting on copy, access, and decisions is usually the bottleneck, so we agree that schedule up front.",
  },
  {
    question: "What happens after launch?",
    answer:
      "You get a walkthrough of how to edit everything yourselves. Keep us on a retainer for changes if it is useful. If it is not, the product runs without us.",
  },
  {
    question: "Do you only build marketing sites?",
    answer:
      "No. We build company websites, SaaS products, ecommerce stores, internal tools for teams, and the design systems that keep them consistent. If it is a product people use in a browser, we can ship it.",
  },
];

export function parseTitledItems(
  items: string[] | undefined,
  fallback: { title: string; body: string }[],
) {
  if (!items?.length) return fallback;
  return items.map((item, index) => {
    const [title, ...rest] = item.split("\n");
    return {
      title: title.trim(),
      body: rest.join(" ").trim() || fallback[index]?.body || "",
    };
  });
}
