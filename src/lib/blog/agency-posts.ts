import { legacySectionsToBlocks, blocksToHtml } from "@/lib/blog/convert";
import type { ArticleSection, BlogPost } from "@/lib/blog/types";

function post(partial: {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  sub: string;
  date: string;
  publishedAt: string;
  featured?: boolean;
  sections: ArticleSection[];
}): BlogPost {
  const content = legacySectionsToBlocks(partial.sections);
  const now = new Date().toISOString();
  return {
    id: `insight-${partial.slug}`,
    slug: partial.slug,
    title: partial.title,
    excerpt: partial.excerpt,
    category: partial.category,
    sub: partial.sub,
    date: partial.date,
    publishedAt: partial.publishedAt,
    status: "published",
    featured: Boolean(partial.featured),
    seoTitle: partial.title,
    seoDescription: partial.excerpt,
    author: "Aevion Labs",
    content,
    html: blocksToHtml(content),
    createdAt: `${partial.publishedAt}T12:00:00.000Z`,
    updatedAt: now,
  };
}

export function getAgencyInsightPosts(): BlogPost[] {
  return [
    post({
      slug: "prototype-before-the-budget",
      title: "See it working before you fund the rest of it",
      excerpt:
        "Most product work fails at the handoff between a deck and a build. A working prototype is the cheapest way to find that out.",
      category: "Product",
      sub: "Delivery",
      date: "09.04.2026",
      publishedAt: "2026-09-04",
      featured: true,
      sections: [
        {
          type: "paragraph",
          text: "A slide deck can look finished and still hide the hard parts: the empty states, the permissions, the copy nobody wrote, the flow that only works if the user already knows the product. That is why we lock the rest of the budget until you have used a prototype in the browser.",
        },
        {
          type: "h2",
          text: "What the prototype is for",
        },
        {
          type: "paragraph",
          text: "It is not a mood board. It is the first version of the product you can click through: the screens, the language, and the path a customer or teammate has to take. If that path is wrong, you want to know before anyone writes production code.",
        },
        {
          type: "h2",
          text: "What happens after you approve it",
        },
        {
          type: "paragraph",
          text: "The remaining spend unlocks for a Next.js build on a repository you own. Same team. Same brief. The prototype is not thrown away. It becomes the spec.",
        },
      ],
    }),
    post({
      slug: "shipping-ai-without-a-science-project",
      title: "How to ship an AI feature without turning the product into a lab",
      excerpt:
        "The useful AI work is usually a narrow job: draft, classify, retrieve, summarise. Treat it like a product surface, not a research programme.",
      category: "AI",
      sub: "Product",
      date: "08.28.2026",
      publishedAt: "2026-08-28",
      sections: [
        {
          type: "paragraph",
          text: "Teams ask for AI and then get stuck choosing a model. The stall is usually elsewhere: nobody named the job, nobody decided what a good answer looks like, and nobody planned for the cases where the model is wrong.",
        },
        {
          type: "h2",
          text: "Start with the job",
        },
        {
          type: "paragraph",
          text: "Draft a reply. Tag an inbound ticket. Pull three related docs. Summarise a call. Those are product surfaces with inputs, outputs, and a fallback. A chatbot with no job is a demo.",
        },
        {
          type: "h2",
          text: "Keep a human in the loop until the error is cheap",
        },
        {
          type: "paragraph",
          text: "If a bad answer costs a customer or a legal review, the first version should suggest, not send. You can automate the last mile once you have seen the failure modes in production.",
        },
        {
          type: "list",
          style: "ul",
          items: [
            "Name the job in one sentence.",
            "Show the source the model used.",
            "Log the cases people reject.",
            "Ship a non-AI path so the product still works when the model is down.",
          ],
        },
      ],
    }),
    post({
      slug: "native-app-or-pwa",
      title: "Native app or PWA: how we choose",
      excerpt:
        "If the product has to live on a home screen, work offline, or use the camera hard, native still wins. If it is an account plus a few workflows, a well-built web app is usually enough.",
      category: "Apps",
      sub: "Engineering",
      date: "08.19.2026",
      publishedAt: "2026-08-19",
      sections: [
        {
          type: "paragraph",
          text: "App Store presence is not a strategy. It is a distribution choice with a cost: two codebases, review cycles, and a release train. We start from the jobs the product has to do on a phone, then pick the thinnest stack that can do them well.",
        },
        {
          type: "h2",
          text: "Choose native when the device is the product",
        },
        {
          type: "paragraph",
          text: "Camera pipelines, background location, push that has to be reliable, or a UI that has to feel like the OS. Those still belong in Swift and Kotlin, or a carefully scoped React Native shell.",
        },
        {
          type: "h2",
          text: "Choose the web when the account is the product",
        },
        {
          type: "paragraph",
          text: "Most internal tools and many SaaS products are forms, lists, and dashboards. A fast Next.js app with a good mobile layout ships sooner and stays easier to change. You can wrap it later if the store listing becomes the bottleneck.",
        },
      ],
    }),
    post({
      slug: "the-code-review-that-saves-a-rewrite",
      title: "The code review that saves a SaaS rewrite",
      excerpt:
        "Rewrites start when the next change is slower than starting over. A few review habits keep a codebase from getting there.",
      category: "Engineering",
      sub: "Code",
      date: "08.11.2026",
      publishedAt: "2026-08-11",
      sections: [
        {
          type: "paragraph",
          text: "A rewrite is rarely about taste. It is about a system that no longer has a place for the next feature. The review that prevents that is not style nitpicks. It is a check that the change still has a home.",
        },
        {
          type: "h2",
          text: "Ask where this lives in a year",
        },
        {
          type: "paragraph",
          text: "If the answer is a new folder, a copy of a component, or a flag that nobody will remove, the change is already expensive. Put it on the existing path, or name the new path and document it.",
        },
        {
          type: "h2",
          text: "Keep the domain language in the code",
        },
        {
          type: "paragraph",
          text: "When the product says invoice and the code says item2, the next engineer will invent a third word. Reviews should catch that early. Names are cheaper than migrations.",
        },
      ],
    }),
    post({
      slug: "why-the-spreadsheet-is-still-winning",
      title: "Why your internal tool is still a spreadsheet",
      excerpt:
        "Spreadsheets win because they are fast to change. An internal product only replaces one if it is faster for the actual job, not just nicer to look at.",
      category: "Product",
      sub: "Tools",
      date: "07.30.2026",
      publishedAt: "2026-07-30",
      sections: [
        {
          type: "paragraph",
          text: "Teams do not stay in Sheets because they love cells. They stay because a new column takes ten seconds and a ticket to engineering takes two weeks. If you want the spreadsheet gone, the replacement has to win on change, not on branding.",
        },
        {
          type: "h2",
          text: "Map the real workflow, not the org chart",
        },
        {
          type: "paragraph",
          text: "Watch someone do the job. The hidden tabs, the copy-paste into Slack, the person who is the actual approval. That is the product. A portal that ignores those steps will be ignored back.",
        },
        {
          type: "h2",
          text: "Ship the painful loop first",
        },
        {
          type: "paragraph",
          text: "One loop, end to end: create, review, export. Then add the rest. A half-built platform with every object modelled is still slower than a sheet.",
        },
      ],
    }),
    post({
      slug: "design-systems-after-launch",
      title: "What a design system actually buys you after launch",
      excerpt:
        "Tokens and components are not a brand exercise. They are how a product stays consistent when the fifth engineer ships the tenth page.",
      category: "Engineering",
      sub: "Systems",
      date: "07.16.2026",
      publishedAt: "2026-07-16",
      sections: [
        {
          type: "paragraph",
          text: "A design system earns its keep after launch, when the original designers are on the next job and someone still has to add a settings screen. If that screen takes a week of invention, you do not have a system. You have a first-version look.",
        },
        {
          type: "h2",
          text: "Document the states, not just the happy path",
        },
        {
          type: "paragraph",
          text: "Empty, loading, error, disabled, permission denied. Those are the screens that drift. If they live in the library, new work stays on-brand without a review theatre.",
        },
        {
          type: "h2",
          text: "Put the system in the repo the product uses",
        },
        {
          type: "paragraph",
          text: "A Figma file nobody opens is not a system. Tokens, components, and usage notes should sit next to the code, on a repository you own, so changing a button does not require a treasure hunt.",
        },
      ],
    }),
  ];
}
