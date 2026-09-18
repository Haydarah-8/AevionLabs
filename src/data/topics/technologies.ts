import { siteForLogo } from "@/data/logo-sites";
import { topicSlug } from "@/lib/topic-slug";
import type { Topic } from "@/data/topics/types";

function tech(
  name: string,
  rest: Omit<Topic, "slug" | "name" | "kind" | "officialUrl"> & {
    slug?: string;
  },
): Topic {
  return {
    ...rest,
    name,
    slug: rest.slug ?? topicSlug(name),
    kind: "technology",
    officialUrl: siteForLogo(name),
  };
}

export const TECHNOLOGY_TOPICS: Topic[] = [
  tech("TypeScript", {
    color: "#3178C6",
    kicker: "Language",
    headline: "Typed JavaScript so the product stays changeable.",
    lede: "TypeScript is how we keep a site or a SaaS from rotting the first time a new person opens the repo. Types travel from the CMS to the page.",
    about:
      "A handover is only useful if the next developer can change a flow without guessing. We write TypeScript as the default, with types shared across the app.",
    how: "Shared types for content, API responses, and UI props. The CMS is not a bag of any. The interface is not a bag of strings.",
    uses: [
      "App Router products where content shapes are known at build time.",
      "SaaS dashboards that reuse the same types on the server and the client.",
      "Handovers where the types are the documentation.",
    ],
    examples: [
      {
        title: "A CMS that cannot publish a broken block",
        body: "If the field is missing, the type fails in review, not on the live page.",
      },
      {
        title: "A billing flow with one source of truth",
        body: "Plan names and states live in one file. The UI cannot invent a fourth plan.",
      },
      {
        title: "A repo a new hire can open",
        body: "The types explain the product. We do not leave a folklore README.",
      },
    ],
    related: ["javascript", "next-js", "react", "web-development"],
  }),
  tech(
    ".NET",
    {
      color: "#512BD4",
      slug: "dotnet",
      kicker: "Language",
      headline: "A back end when the team already thinks in C#.",
      lede: "We put a Next.js or React surface on .NET when that is the language the company already staffs. One product, two rooms that can still talk.",
      about:
        "A Microsoft shop should not be forced onto a stack it cannot hire for. We keep the API in .NET and the interface on the web, with a contract both sides can read.",
      how: "OpenAPI or shared types at the boundary. Auth with the existing identity. Deploy on Azure or wherever the tenancy already lives.",
      uses: [
        "Company tools that must sit next to existing C# services.",
        "Public sites that talk to a .NET API you already own.",
        "Hybrid teams: we design the front, your engineers keep the domain.",
      ],
      examples: [
        {
          title: "A portal on an existing API",
          body: "We did not rewrite the domain. We gave it an interface people will open.",
        },
        {
          title: "SSO with the work account",
          body: "Entra ID at the edge. No second password for staff.",
        },
        {
          title: "A handover with a contract",
          body: "The API spec is in the repo. Front and back can change without a meeting.",
        },
      ],
      related: ["microsoft", "azure", "typescript", "internal-tools"],
    },
  ),
  tech("JavaScript", {
    color: "#F7DF1E",
    kicker: "Language",
    headline: "The language the browser already speaks.",
    lede: "Everything we ship to a screen is JavaScript at the end. We write it carefully, type it when we can, and we do not send a novel to do a button's job.",
    about:
      "JavaScript is not a flavour. It is the runtime. We keep bundles small, we avoid libraries that exist to hide the platform, and we test the journeys that make money.",
    how: "TypeScript on top. Progressive enhancement where it matters. The page still explains itself if a script is late.",
    uses: [
      "Interactive product surfaces that stay readable in the source.",
      "Marketing pages that do not need a framework to print a paragraph.",
      "Tools and dashboards where the browser is the application.",
    ],
    examples: [
      {
        title: "A landing page that does not wait on a bundle",
        body: "The offer is in the HTML. Script adds the extras.",
      },
      {
        title: "A dashboard that feels like software",
        body: "JavaScript is the product. We still keep the first paint honest.",
      },
      {
        title: "A third-party script that no longer owns the page",
        body: "Tags load when they are needed. The form does not wait.",
      },
    ],
    related: ["typescript", "html5", "css", "performance"],
  }),
  tech("Python", {
    color: "#3776AB",
    kicker: "Language",
    headline: "Scripts, models, and the jobs a page should not do.",
    lede: "Python is for the work that happens off the request: imports, reports, a model, a one-off migration. The site stays on the web stack.",
    about:
      "We do not build marketing sites in Django for the sake of it. We use Python where it is the right tool, then we give the result to a Next.js product your team can publish from.",
    how: "Jobs, notebooks, and small services with clear inputs. The public interface is still the site or the tool we designed.",
    uses: [
      "Imports and reports that used to live in a spreadsheet.",
      "Model calls and data cleanup behind an internal tool.",
      "One-off scripts that become a button once they prove they are weekly.",
    ],
    examples: [
      {
        title: "A weekly report that no longer lives in email",
        body: "Python builds the file. The tool shows it. Finance stops chasing a CSV.",
      },
      {
        title: "A catalogue import you can rerun",
        body: "The script is in the repo. Your team can run it without us.",
      },
      {
        title: "A prototype that hid the model",
        body: "You clicked the product. Python was a step, not the demo.",
      },
    ],
    related: ["postgresql", "internal-tools", "openai", "saas"],
  }),
  tech("HTML5", {
    color: "#E34F26",
    kicker: "Language",
    headline: "The document first. The framework second.",
    lede: "If the HTML is wrong, no amount of React will save the page. We start with structure, landmarks, and forms a keyboard can finish.",
    about:
      "A company site is still a document. We write headings, labels, and links as if a screen reader and a crawler will both visit, because they will.",
    how: "Semantic templates in Next.js. Forms that work before the script. Media with real captions, not a div that looks like a player.",
    uses: [
      "Marketing pages that stay readable with JavaScript off.",
      "Accessible forms on SaaS and tools.",
      "CMS blocks that output honest HTML, not a soup of wrappers.",
    ],
    examples: [
      {
        title: "A form that works on a bad connection",
        body: "Submit is a real form. Script only makes it nicer.",
      },
      {
        title: "A page Google can still outline",
        body: "Headings match the story. The crawler does not have to guess.",
      },
      {
        title: "A design system that starts with a button element",
        body: "We do not restyle a div and hope.",
      },
    ],
    related: ["css", "javascript", "performance", "web-development"],
  }),
  tech("CSS", {
    color: "#663399",
    kicker: "Language",
    headline: "Layout as a system, not a pile of exceptions.",
    lede: "CSS is how a tenth page still looks like the same company. We write tokens, spacing, and type first, then we let Tailwind or custom CSS follow that file.",
    about:
      "Visual design that cannot be expressed in CSS is decoration. We design in the browser's terms: type scale, grid, colour that meets contrast.",
    how: "Tokens in one place. Tailwind or plain CSS as the delivery. No mystery values hiding in a component.",
    uses: [
      "Design systems that ship as CSS variables the app already uses.",
      "Responsive layouts that do not need a tenth breakpoint name.",
      "Dark or branded themes that change tokens, not templates.",
    ],
    examples: [
      {
        title: "A site that survived a rebrand",
        body: "We changed tokens. The templates stayed. The tenth page still belonged.",
      },
      {
        title: "A landing page that held on a narrow phone",
        body: "Type and spacing were the system. We did not hide columns with hacks.",
      },
      {
        title: "A handover a designer can still read",
        body: "The tokens match the Figma file. Nobody is translating by eye.",
      },
    ],
    related: ["tailwind", "figma", "html5", "design-systems"],
  }),
  tech("Swift", {
    color: "#F05138",
    kicker: "Language",
    headline: "Native iOS when the web is not enough.",
    lede: "Swift is for the product that has to live on an iPhone as software. We keep that surface on the same API and the same design tokens as the site.",
    about:
      "Most work never needs Swift. When it does, we write the smallest native surface that shares accounts with the web, then we hand over the Xcode project.",
    how: "SwiftUI where it helps, a shared backend, TestFlight as the prototype you can hold.",
    uses: [
      "Companion apps for a SaaS people already use in the browser.",
      "Field tools that need the camera or the offline store.",
      "A design system that reaches iOS without a second brand.",
    ],
    examples: [
      {
        title: "An app that signs into the same account",
        body: "No second identity. The web and the phone share the session story.",
      },
      {
        title: "A TestFlight before the store copy",
        body: "You tap the product. The remaining budget waits.",
      },
      {
        title: "Tokens that survived the hop",
        body: "Colour and type came from the same Figma file as the site.",
      },
    ],
    related: ["xcode", "apple", "kotlin", "saas"],
  }),
  tech("Kotlin", {
    color: "#7F52FF",
    kicker: "Language",
    headline: "Android in the language the platform expects.",
    lede: "Kotlin is for a Play build that has to last. We use it when a wrapper is not honest, and we still share the API with the web.",
    about:
      "A lot of Android work can stay on the web. When it cannot, we write Kotlin against the same backend, with a handover that includes the keystore.",
    how: "The smallest native surface. Shared design tokens. A Play listing written from the real UI.",
    uses: [
      "Companion Android apps for a product that already has a site.",
      "Field tools that need hardware the browser will not give us.",
      "A later Play door after the web product is already in use.",
    ],
    examples: [
      {
        title: "A web-first product with a later Play listing",
        body: "Accounts already existed. The app was a second door, not a rewrite.",
      },
      {
        title: "A field build that talks to the same jobs API",
        body: "Dispatchers still use the browser. The phone does not invent a second truth.",
      },
      {
        title: "Keys you hold",
        body: "The Play account and the keystore are yours.",
      },
    ],
    related: ["android", "swift", "saas", "firebase"],
  }),
  tech("Go", {
    color: "#00ADD8",
    kicker: "Language",
    headline: "Small services for work the page should not wait on.",
    lede: "Go is for jobs, gateways, and the quiet services that sit beside a Next.js app. We use it when a script has become a product.",
    about:
      "We do not rewrite a site in Go. We put Go on the boundary: a webhook, a worker, a tiny API that has to stay up while the front end changes.",
    how: "One binary, clear logs, deploy next to the app. The interface stays on the web stack your team can publish from.",
    uses: [
      "Webhooks and workers for billing or import.",
      "A thin API in front of a database you own.",
      "Services that have to start fast and stay boring.",
    ],
    examples: [
      {
        title: "A Stripe webhook that never lived in the page",
        body: "Go handled the event. The dashboard only showed the result.",
      },
      {
        title: "An import that used to crash a cron tab",
        body: "One service, one log, a button in the tool to rerun it.",
      },
      {
        title: "A gateway in front of an old system",
        body: "The new site never spoke the old protocol. Go did.",
      },
    ],
    related: ["docker", "postgresql", "stripe", "saas"],
  }),
  tech("React", {
    color: "#61DAFB",
    kicker: "Interface",
    headline: "The interface layer for sites, SaaS, and tools.",
    lede: "React is how we build surfaces you can reuse, test, and hand over. A page is a composition, not a one-off file.",
    about:
      "We use React because the same component can live on a marketing page and in a dashboard. The design system is code, not a picture of a button.",
    how: "Server Components where they help, client only where the interface must move. Types on every prop that matters.",
    uses: [
      "Company sites with blocks a CMS can rearrange.",
      "SaaS and tools with states, empty views, and errors designed in.",
      "Design systems that ship as the same components the site uses.",
    ],
    examples: [
      {
        title: "A tenth page that still looked like the first",
        body: "The block was already in the library. The CMS only chose the order.",
      },
      {
        title: "A dashboard with honest empty states",
        body: "We designed the first day, not only the day the charts are full.",
      },
      {
        title: "A handover the next team can extend",
        body: "Components have names. A new view does not start in a blank file.",
      },
    ],
    related: ["next-js", "typescript", "figma", "design-systems"],
  }),
  tech("Next.js", {
    color: "#000000",
    kicker: "Framework",
    headline: "The framework we ship production sites on.",
    lede: "Next.js is how a company site, a SaaS, or a tool lives on a repository you own. App Router, a CMS your team can use, and previews you can refuse.",
    about:
      "We do not rent you a theme. We build an App Router product with routes, metadata, and a content model that still makes sense a year later.",
    how: "Server rendering where it helps, static where it can be, a CMS that publishes into the same repo. You see a preview URL before the rest of the budget unlocks.",
    uses: [
      "Company sites with a CMS and a tenth page that still belongs.",
      "SaaS products with auth, billing, and app routes in one repo.",
      "Internal tools that feel like software and deploy like a site.",
    ],
    examples: [
      {
        title: "A marketing site the team can publish from",
        body: "Pages, posts, and landers are CMS entries. We are not in the loop for a copy change.",
      },
      {
        title: "A SaaS that started as a prototype",
        body: "The same Next.js app grew accounts and billing. Nothing was thrown away.",
      },
      {
        title: "A preview for every change",
        body: "You click the URL. Sign-off happens in the browser.",
      },
    ],
    related: ["react", "vercel", "typescript", "web-development"],
  }),
  tech("Node.js", {
    color: "#5FA04E",
    kicker: "Runtime",
    headline: "The runtime the product already shares with the page.",
    lede: "Node is how the same language runs on the server and in the tool chain. We keep it boring: one version, clear scripts, no mystery globals.",
    about:
      "A Next.js product is a Node product. We treat the server like part of the design: timeouts, logs, and jobs that do not belong in the request.",
    how: "Typed APIs, scheduled work, and scripts in the same repo as the UI. The CMS and the app speak one runtime.",
    uses: [
      "Route handlers and jobs beside a Next.js app.",
      "Integrations that used to live in a Zap nobody owned.",
      "Tooling so a new hire can install and run the site in one command.",
    ],
    examples: [
      {
        title: "A form that writes to three systems",
        body: "Node fans the event out. The page only says thank you.",
      },
      {
        title: "A nightly job with a log you can read",
        body: "The script is in the repo. Failure is an email, not a silence.",
      },
      {
        title: "A prototype on the same runtime as production",
        body: "No rewrite between the demo and the launch.",
      },
    ],
    related: ["next-js", "typescript", "docker", "saas"],
  }),
  tech("Tailwind CSS", {
    color: "#06B6D4",
    slug: "tailwind",
    kicker: "CSS",
    headline: "The CSS system that keeps pages consistent.",
    lede: "Tailwind is how tokens reach the page without a second language. We configure it to match the design system, then we stop inventing spacing.",
    about:
      "Tailwind is not a look. It is a way to apply the tokens we already named in Figma. If the config is wrong, the site will drift. We treat that file as part of the brand.",
    how: "A small set of sizes, type, and colour. Components use those names. One-off values are a smell we fix in review.",
    uses: [
      "Marketing sites and product UI on the same scale.",
      "Design systems that compile to the classes the app already uses.",
      "Dark or campaign themes that swap tokens, not templates.",
    ],
    examples: [
      {
        title: "A landing page that matched the product",
        body: "Same type, same buttons. Paid traffic did not land on a cousin of the brand.",
      },
      {
        title: "A CMS block that could not go off-brand",
        body: "The utilities only expose the tokens. A new page cannot invent a colour.",
      },
      {
        title: "A handover the next designer can still use",
        body: "The config matches the Figma file. Nobody is guessing 17px.",
      },
    ],
    related: ["css", "figma", "next-js", "design-systems"],
  }),
  tech("Vue.js", {
    color: "#4FC08D",
    kicker: "Interface",
    headline: "A Vue surface when that is already the house.",
    lede: "We build in React by default. When a team already lives in Vue, we meet them there, or we wrap the new work so it can sit beside the old.",
    about:
      "A rewrite for taste is a waste. If Vue is what the staff can change, we design and ship in Vue, with the same CMS and handover rules as any other product.",
    how: "Nuxt when the product wants a framework. Plain Vue when a widget has to live inside an existing page. Types and a design system either way.",
    uses: [
      "New sections on a Vue estate you are not ready to leave.",
      "A Nuxt site with a CMS your team can publish from.",
      "A later move to Next.js, planned, not forced.",
    ],
    examples: [
      {
        title: "A campaign page on an existing Vue app",
        body: "We did not ask for a rewrite. We shipped the lander in the stack they had.",
      },
      {
        title: "A Nuxt brochure the team can edit",
        body: "Same prototype-first rule. The repo is still theirs.",
      },
      {
        title: "A bridge, not a lecture",
        body: "If they want Next.js later, the design system survives the hop.",
      },
    ],
    related: ["nuxt", "react", "next-js", "company-sites"],
  }),
  tech("Nuxt", {
    color: "#00DC82",
    kicker: "Framework",
    headline: "Vue's production framework, used the same way we use Next.",
    lede: "Nuxt is for teams who want a Vue app with routes, metadata, and a CMS. We treat it as a product, not a starter theme.",
    about:
      "The rules do not change with the logo. You own the repo. You see a preview. The rest of the budget waits until that preview is the product.",
    how: "Content model first, then pages, then the integrations. Hosting on the platform you already pay for.",
    uses: [
      "Company sites on a Vue team.",
      "SaaS surfaces that have to live next to an existing Nuxt app.",
      "A CMS that publishes without a developer in the loop.",
    ],
    examples: [
      {
        title: "A site that kept the Vue staff productive",
        body: "We did not force React. We shipped the product they can maintain.",
      },
      {
        title: "Preview URLs for every change",
        body: "Sign-off in the browser. Same ritual as our Next.js work.",
      },
      {
        title: "A handover with a content model",
        body: "The CMS is documented. A tenth page does not need us.",
      },
    ],
    related: ["vue-js", "next-js", "company-sites"],
  }),
  tech("Svelte", {
    color: "#FF3E00",
    kicker: "Interface",
    headline: "A lighter surface when the page should stay small.",
    lede: "Svelte is a fit for a marketing surface or a widget that should not drag a large runtime. We use it when the brief is small and the load budget is not.",
    about:
      "We will not pick Svelte to be fashionable. We pick it when the page has to stay thin, or when a team already writes it.",
    how: "SvelteKit for a full site. A compiled island when the rest of the estate is something else. Same design tokens either way.",
    uses: [
      "Campaign pages with a hard weight budget.",
      "Embedded widgets inside a larger product.",
      "A small site a small team can keep.",
    ],
    examples: [
      {
        title: "A lander that stayed under the budget",
        body: "Svelte compiled away. The offer was on screen before the ad finished.",
      },
      {
        title: "A calculator inside someone else's CMS",
        body: "The island was ours. The rest of the page was not our problem.",
      },
      {
        title: "A tiny repo with a real handover",
        body: "Tokens, content, and a preview. Small does not mean sloppy.",
      },
    ],
    related: ["javascript", "performance", "company-sites"],
  }),
  tech("PostgreSQL", {
    color: "#4169E1",
    kicker: "Data",
    headline: "The database the product actually owns.",
    lede: "Postgres is where the records live. We design the schema with you, on an instance in your name, so a spreadsheet does not become the system of record again.",
    about:
      "A SaaS or a tool without a real database is a demo. We use Postgres because it is portable, inspectable, and not rented as a black box.",
    how: "Schema in the repo. Migrations you can read. Supabase or a host you choose. Row-level rules when more than one tenant is in the same table.",
    uses: [
      "SaaS products with accounts, billing, and tenant data.",
      "Internal tools that replace a shared spreadsheet.",
      "Content and product data that a CMS should not invent twice.",
    ],
    examples: [
      {
        title: "A tool that retired three sheets",
        body: "The schema matched the work. Nobody exported to Excel to feel safe.",
      },
      {
        title: "A SaaS with honest tenants",
        body: "Row policies in the database, not only in the UI.",
      },
      {
        title: "A handover with a dump you can restore",
        body: "The data is yours. We do not keep a copy as leverage.",
      },
    ],
    related: ["supabase", "prisma", "saas", "internal-tools"],
  }),
  tech("Prisma", {
    color: "#2D3748",
    kicker: "Data",
    headline: "A schema in the repo, not a folklore of columns.",
    lede: "Prisma is how the TypeScript app and the database stay in the same conversation. The model is a file you can review.",
    about:
      "We use Prisma when the team wants typed queries and migrations that live next to the UI. The database is still Postgres you own.",
    how: "Models for the product language, not for the ORM. Migrations in pull requests. A seed for the prototype you can click.",
    uses: [
      "SaaS and tools where every query should be typed.",
      "Prototypes that already use the real schema.",
      "Handovers where the schema file is the map.",
    ],
    examples: [
      {
        title: "A billing table that could not drift",
        body: "The type and the column changed in one pull request.",
      },
      {
        title: "A prototype on the real model",
        body: "We did not fake the data layer. You clicked the product you would keep.",
      },
      {
        title: "A second engineer who did not need a tour",
        body: "The schema explained the domain.",
      },
    ],
    related: ["postgresql", "typescript", "supabase", "saas"],
  }),
  tech("Webflow", {
    color: "#146EF5",
    kicker: "Builder",
    headline: "A builder when the team has to publish without a deploy.",
    lede: "Webflow is a fit for a marketing site a brand team will edit every week. We use it when that is the honest constraint, and we are clear about what it cannot be.",
    about:
      "We prefer a repository you own. If the team will not open one, Webflow can still be a disciplined site: type, CMS, and a handover that is not a maze of classes.",
    how: "A small system of classes, a CMS model, and production rules. If the product outgrows it, we plan the move to Next.js before the maze starts.",
    uses: [
      "Campaign and brochure sites a marketing team will own.",
      "CMS collections that stay inside a type system we set.",
      "A bridge to a later Next.js build when the product needs more.",
    ],
    examples: [
      {
        title: "A brand site the team actually updates",
        body: "We left a short class system. They publish without calling us.",
      },
      {
        title: "A lander that did not become a class landfill",
        body: "Tokens first. One-off classes were a review fail.",
      },
      {
        title: "A planned exit",
        body: "When they needed accounts, we moved the content to Next.js. The brand survived.",
      },
    ],
    related: ["framer", "wordpress", "company-sites", "next-js"],
  }),
  tech("Framer", {
    color: "#000000",
    kicker: "Builder",
    headline: "Motion and marketing when the brief is a page, not a product.",
    lede: "Framer is useful for a campaign that has to move. We use it for that, then we take the system into code when the site has to last.",
    about:
      "A Framer page can be a prototype you can click this week. A year of pages is a different job. We say which one you are buying.",
    how: "Design in Framer when motion is the brief. Rebuild in Next.js when you need a CMS, accounts, or a repo. The tokens come with us.",
    uses: [
      "Launch and campaign pages with real motion.",
      "Clickable prototypes that are already on a URL.",
      "A later production build that keeps the same type and rhythm.",
    ],
    examples: [
      {
        title: "A launch page in days, not a quarter",
        body: "Framer got the film and the form live. The product site stayed on Next.js.",
      },
      {
        title: "A prototype that was the design",
        body: "You clicked the motion. We did not present a video of a website.",
      },
      {
        title: "A hop into code without a redraw",
        body: "Tokens and layout survived. The campaign became a template.",
      },
    ],
    related: ["figma", "webflow", "company-sites", "next-js"],
  }),
  tech("WordPress", {
    color: "#21759B",
    kicker: "CMS",
    headline: "A CMS people already know, on a front end you can still own.",
    lede: "WordPress is often already there. We can keep it as the editor and put a Next.js site in front, or we can tidy the theme if that is the honest brief.",
    about:
      "A theme you cannot trust is not a CMS. We either rebuild the front and keep WordPress as headless, or we leave you with a theme a developer can still change.",
    how: "Headless by default when the public site has to be fast. Classic only when the team will not leave the admin they know.",
    uses: [
      "Company sites with editors who already live in WordPress.",
      "Headless WordPress behind Next.js.",
      "A migration off WordPress when the product has outgrown it.",
    ],
    examples: [
      {
        title: "A fast front, a familiar editor",
        body: "Staff still publish in WordPress. Visitors get a Next.js page.",
      },
      {
        title: "A theme that stopped fighting the brand",
        body: "We cut plugins, then we designed the templates as a system.",
      },
      {
        title: "A planned move to a repo you own",
        body: "Content came with us. The lock-in did not.",
      },
    ],
    related: ["next-js", "company-sites", "webflow", "shopify"],
  }),
  tech("Squarespace", {
    color: "#000000",
    kicker: "Builder",
    headline: "A hosted site when the brief is small and the team is smaller.",
    lede: "Squarespace can be the right first site. We say so when it is, and we say when it will stall: custom checkout, real tools, a tenth language.",
    about:
      "We are not here to shame a builder. We are here to stop you paying for a rebuild you could have planned. If Squarespace is enough, we keep it tidy.",
    how: "A short design system inside the product. Clear limits in the brief. A path to Next.js written down before you hit the wall.",
    uses: [
      "First company sites for a small team.",
      "A holding page that still looks like the brand.",
      "A later rebuild when the builder starts saying no.",
    ],
    examples: [
      {
        title: "A first site that did not pretend to be a product",
        body: "We used Squarespace on purpose. The next phase was written in the handover.",
      },
      {
        title: "Type and colour that still looked like them",
        body: "We did not accept the default kit as the brand.",
      },
      {
        title: "A rebuild that kept the writing",
        body: "When they needed more, the copy and the structure came across.",
      },
    ],
    related: ["wix", "webflow", "company-sites", "next-js"],
  }),
  tech("Wix", {
    color: "#0C6EFC",
    kicker: "Builder",
    headline: "Another hosted start. The same honest limits.",
    lede: "Wix is a first site for some teams. We will make it look like the company, and we will tell you which product ideas it will not carry.",
    about:
      "The problem is not Wix. The problem is buying a custom product story on a platform that cannot ship it. We keep those two jobs apart.",
    how: "Tighten the kit. Write the pages. Document the exit. If the next brief is a tool or a store you have to own, we plan Next.js or Shopify.",
    uses: [
      "Small brochure sites that need to look finished this month.",
      "Event or campaign pages that will not become the company system.",
      "A migration when the team is ready to own a repository.",
    ],
    examples: [
      {
        title: "A brochure that stopped looking like a template",
        body: "Type, space, and photography did the work. The platform stayed in the background.",
      },
      {
        title: "A no that saved a rebuild",
        body: "They wanted accounts. We said Wix would not carry it, and we scoped the real product.",
      },
      {
        title: "A later Next.js site with the same voice",
        body: "The writing survived. The lock-in did not.",
      },
    ],
    related: ["squarespace", "webflow", "company-sites"],
  }),
  tech("Shopify", {
    color: "#96BF48",
    kicker: "Commerce",
    headline: "Ecommerce catalogues and checkout you can actually run.",
    lede: "Shopify is a fit when the store is the product. We design the front, the landers, and the checkout story, and we keep the catalogue in a place your team can run.",
    about:
      "A theme you cannot trust is expensive. We either build a Hydrogen or Next.js storefront, or we discipline a theme so paid traffic lands on something fast.",
    how: "Catalogue and checkout first. Then the pages ads hit. Performance is part of the build, not a later audit.",
    uses: [
      "Headless storefronts on a repository you own.",
      "Paid landing pages that match the product, not a cousin theme.",
      "Checkout and post-purchase flows that do not fight the brand.",
    ],
    examples: [
      {
        title: "A store that held when the campaign spent",
        body: "We budgeted the images and the scripts before the ads went on.",
      },
      {
        title: "A catalogue the team can still edit",
        body: "Shopify remains the back office. The storefront is ours.",
      },
      {
        title: "A prototype of the product page",
        body: "You clicked add to cart on the real layout before we built the rest.",
      },
    ],
    related: ["ecommerce", "stripe", "next-js", "performance"],
  }),
  tech("Figma", {
    color: "#F24E1E",
    kicker: "Design",
    headline: "The file we design the system in.",
    lede: "Figma is not a deck of pictures. It is tokens, screens, and a handoff the build can follow. We design in reusable parts.",
    about:
      "If the file cannot produce a tenth page, it is not a system. We set type, colour, and components first, then we paint the journeys.",
    how: "Discovery, then wireframes, then UI. The prototype you click is either Figma or the real Next.js preview. The rest of the budget waits.",
    uses: [
      "Interface systems for sites, SaaS, and tools.",
      "Tokens that compile into CSS and Tailwind.",
      "Handoff notes so engineering does not guess a state.",
    ],
    examples: [
      {
        title: "A file that survived the tenth page",
        body: "The new template was already a component. We only wrote the copy.",
      },
      {
        title: "A prototype you could refuse",
        body: "You clicked the flows. Visual design waited until the structure held.",
      },
      {
        title: "Tokens that reached production",
        body: "The CSS variables matched the file. The brand did not fork in code.",
      },
    ],
    related: ["design-systems", "visual-design", "react", "tailwind"],
  }),
  tech("Notion", {
    color: "#000000",
    kicker: "Ops",
    headline: "The brief and the notes, not the product.",
    lede: "Notion is where a lot of teams already write. We can publish from it, or we can keep it as the brief and put the real site on a CMS that is built for the web.",
    about:
      "A Notion page is a good workshop. It is a poor long-term website. We say which one you are buying, and we do not leave you with a public Notion theme as a brand.",
    how: "Workshops and IA in Notion if that helps. Production content in a CMS with types. Optional sync when the team will not leave Notion yet.",
    uses: [
      "Discovery and IA that the whole team can comment on.",
      "A temporary publish from Notion while the real site is built.",
      "A later CMS that keeps the writing and drops the lock-in.",
    ],
    examples: [
      {
        title: "A brief that did not live in email",
        body: "Notion held the IA. The site was still Next.js.",
      },
      {
        title: "A docs site that outgrew Notion",
        body: "We moved the pages into a typed CMS. Search and type improved on day one.",
      },
      {
        title: "A handover with the decisions still visible",
        body: "The Notion file is part of the repo story, not a secret.",
      },
    ],
    related: ["linear", "company-sites", "internal-tools"],
  }),
  tech("Linear", {
    color: "#5E6AD2",
    kicker: "Ops",
    headline: "The board we use so the build stays visible.",
    lede: "Linear is how we keep a project from becoming a folklore of Slack threads. Issues, cycles, and a changelog you can read.",
    about:
      "You should be able to see what is in flight. We run the work in Linear, or in the tracker you already pay for, with the same rule: the prototype is the source of truth.",
    how: "A short backlog from the brief. Cycles that match the prototype and the build. You are on the workspace.",
    uses: [
      "Product work with a visible cycle.",
      "Bugs and copy changes after launch.",
      "A handover that includes the open issues, not a surprise list.",
    ],
    examples: [
      {
        title: "A build you could watch without asking",
        body: "The board was shared. Status was not a meeting.",
      },
      {
        title: "A retainer that did not hide in email",
        body: "Each change was an issue. The invoice matched the board.",
      },
      {
        title: "A launch with a leftover list you could see",
        body: "Nothing important was only in someone's head.",
      },
    ],
    related: ["github", "notion", "care"],
  }),
  tech("Stripe", {
    color: "#635BFF",
    kicker: "Payments",
    headline: "Payments for SaaS and checkout, wired into the product.",
    lede: "Stripe is billing and pay flows as part of the interface, not a plugin on the side. We design the plan picker, the invoice, and the failed-card path.",
    about:
      "Money is a journey. We prototype the upgrade, the receipt, and the cancel before we write a webhook. The rest of the budget waits until that path is something you would use.",
    how: "Checkout or Billing against your Stripe account. Webhooks in the repo. Customer portal when the brief needs self-serve.",
    uses: [
      "SaaS subscriptions with plans you can explain.",
      "One-off checkout on a site or a storefront.",
      "Failed payments and receipts that do not look like a third product.",
    ],
    examples: [
      {
        title: "A plan page that told the truth",
        body: "You clicked upgrade on the prototype. The live webhook came after.",
      },
      {
        title: "A store that did not bounce at pay",
        body: "Stripe was a step in the layout, not a redirect into a different brand.",
      },
      {
        title: "Keys you hold",
        body: "The Stripe account is yours. We do not sit in the middle of the money.",
      },
    ],
    related: ["saas", "ecommerce", "clerk", "next-js"],
  }),
  tech("Vercel", {
    color: "#000000",
    kicker: "Hosting",
    headline: "Hosting and previews for Next.js products.",
    lede: "Vercel is how every change gets a URL you can click. We use it so sign-off happens in the browser, and so production is the same app you already used.",
    about:
      "The point is the preview, not the logo. We connect your account, your domain, and your repo. Nothing is rented back through a studio login.",
    how: "Preview deploys on every pull request. Production on the domain you own. Env values in the project you control.",
    uses: [
      "Company sites and SaaS on the App Router.",
      "A URL for every proposed change.",
      "Edge and server rendering without a second ops team.",
    ],
    examples: [
      {
        title: "A stakeholder who signed off on a URL",
        body: "No deck. They used the preview. Then we shipped that.",
      },
      {
        title: "A domain that never sat in our account",
        body: "DNS was yours. The certificate followed.",
      },
      {
        title: "A rollback you could do without us",
        body: "The previous deploy is a click. The runbook says so.",
      },
    ],
    related: ["next-js", "github", "netlify", "web-development"],
  }),
  tech("Netlify", {
    color: "#00C7B7",
    kicker: "Hosting",
    headline: "Previews and hosting when that is already the house.",
    lede: "Netlify is a fit for a static or hybrid site a team already runs there. We meet the account you have, with the same preview-first rule.",
    about:
      "We do not move hosts for a logo. If Netlify is where the domain and the forms already live, we deploy there and we keep the repo yours.",
    how: "Preview URLs, env in your project, functions only when the page needs them. A handover that includes the account, not a studio seat.",
    uses: [
      "Marketing sites with a preview on every change.",
      "Forms and light functions next to a static front.",
      "A later move to Vercel if the product becomes a Next.js app that wants it.",
    ],
    examples: [
      {
        title: "A brochure that kept its old host",
        body: "We redesigned the site. Finance did not have to open a new vendor.",
      },
      {
        title: "A form that no longer emailed a personal inbox",
        body: "The submission hit the CRM. Netlify was only the door.",
      },
      {
        title: "Previews the brand team could open",
        body: "Each change had a link. Comments happened on the page.",
      },
    ],
    related: ["vercel", "github", "company-sites"],
  }),
  tech("Cloudflare", {
    color: "#F38020",
    kicker: "Edge",
    headline: "DNS, cache, and the door in front of the product.",
    lede: "Cloudflare is often how the domain is already run. We use it for DNS, cache, and the boring security that should not be a plugin.",
    about:
      "The site still lives in your repo. Cloudflare sits in front: names, certificates, and a cache we can purge. We do not hide the origin as a trick.",
    how: "DNS in your account. Cache rules that match the CMS. Workers only when an edge step is cheaper than a server.",
    uses: [
      "Domains and certificates you control.",
      "Cache for a site that has to stay fast on a campaign day.",
      "Light edge logic that does not need a full server.",
    ],
    examples: [
      {
        title: "A launch that did not wait on DNS folklore",
        body: "The zone was yours. We wrote the records in the handover.",
      },
      {
        title: "A campaign that did not melt origin",
        body: "Cache did the work. The CMS could still publish.",
      },
      {
        title: "A form that stayed on your origin",
        body: "Cloudflare was the door, not a second app.",
      },
    ],
    related: ["vercel", "aws", "performance", "company-sites"],
  }),
  tech("Supabase", {
    color: "#3FCF8E",
    kicker: "Backend",
    headline: "Auth, database, and storage without a lock-in host.",
    lede: "Supabase is Postgres you can see, plus auth and storage. We use it so the prototype is already on the real data layer, and so you keep the keys.",
    about:
      "A product should not hide its records. We design the schema, the policies, and the CMS your team can publish from, on a project in your name.",
    how: "Postgres first. Auth when the product needs accounts. Storage for the files that belong to a row. Types generated into the Next.js app.",
    uses: [
      "SaaS and tools with accounts and tenant data.",
      "A CMS on top of tables you can query.",
      "Storage for uploads that still belong to your project.",
    ],
    examples: [
      {
        title: "A prototype on the real schema",
        body: "You clicked the product. The tables were already the ones we would keep.",
      },
      {
        title: "A team that can publish without us",
        body: "The CMS writes to Postgres. A tenth page does not need a developer.",
      },
      {
        title: "Keys you can rotate",
        body: "The project is yours. We leave.",
      },
    ],
    related: ["postgresql", "clerk", "next-js", "saas"],
  }),
  tech("GitHub", {
    color: "#181717",
    kicker: "Source",
    headline: "The repository is the product you take home.",
    lede: "GitHub is where the site lives. Pull requests, previews, and a history you can audit. We do not keep the real copy on a studio machine.",
    about:
      "If you cannot clone the repo, you do not own the work. We open the project in your organisation, with the actions and the environments named.",
    how: "One repo for the app. Reviews on the pull request. Preview URLs from the host you chose. Issues in GitHub or Linear, not in a private Slack.",
    uses: [
      "Every site and product we ship.",
      "Actions for checks and deploys you can read.",
      "A handover that is a transfer of the repo, not a ZIP.",
    ],
    examples: [
      {
        title: "A client who merged the first copy change",
        body: "They opened a pull request. The preview proved it. We were optional.",
      },
      {
        title: "A history that explained a bug",
        body: "The commit was there. Nobody had to remember a Friday call.",
      },
      {
        title: "Org, not a freelance account",
        body: "The code sat in their GitHub. Access was a seat, not a favour.",
      },
    ],
    related: ["vercel", "linear", "web-development", "care"],
  }),
  tech("Docker", {
    color: "#2496ED",
    kicker: "Runtime",
    headline: "The same app on a laptop and on the server.",
    lede: "Docker is how we stop the phrase it works on my machine. We use it when the product has more than a static host, and we keep the file in the repo.",
    about:
      "A compose file is part of the handover. Your team should be able to run the stack without a call. Production can be the same image or a host that already understands the app.",
    how: "A small set of services: the app, the database, the worker. No zoo. Docs that start with one command.",
    uses: [
      "SaaS and tools that need Postgres beside the app.",
      "A local prototype that matches production.",
      "A deploy onto a VPS or a cloud you already pay for.",
    ],
    examples: [
      {
        title: "A new hire who ran the product on day one",
        body: "Clone, compose, click. The README was four lines.",
      },
      {
        title: "A worker that used to be a mystery cron",
        body: "The same image ran locally and on the server.",
      },
      {
        title: "A host change that did not become a rewrite",
        body: "The container was the contract.",
      },
    ],
    related: ["postgresql", "node-js", "aws", "saas"],
  }),
  tech("Clerk", {
    color: "#6C47FF",
    kicker: "Auth",
    headline: "Accounts and session handling for SaaS.",
    lede: "Clerk is sign-in that does not become a side project. We use it when the product needs users this month, and we keep the rest of the data in a database you own.",
    about:
      "Auth is easy to underestimate. We pick Clerk when the hosted UI and the Next.js helpers save time, and we still design the empty states and the first-run.",
    how: "Your Clerk application. Our interface around it. User records mirrored into Postgres when the product needs more than a profile.",
    uses: [
      "SaaS sign-in, organisations, and invites.",
      "A prototype that already has real accounts.",
      "A later move to another provider if the brief changes.",
    ],
    examples: [
      {
        title: "A first-run that did not dump people in a blank app",
        body: "After Clerk, the product had a job to do. We designed that page.",
      },
      {
        title: "Invites that matched the company",
        body: "Organisations in Clerk, data in Postgres. The UI spoke one language.",
      },
      {
        title: "Keys you hold",
        body: "The Clerk app is yours. We are not the identity vendor.",
      },
    ],
    related: ["auth0", "supabase", "saas", "stripe"],
  }),
  tech("Auth0", {
    color: "#EB5424",
    kicker: "Auth",
    headline: "Enterprise identity when the directory is already elsewhere.",
    lede: "Auth0 is a fit when the company already has a tenancy, or when SSO is the brief. We put it behind the same interface we would build with any other provider.",
    about:
      "We do not pick Auth0 for a two-user prototype. We pick it when the identity story is bigger than a form: SAML, social, and a team that already pays for it.",
    how: "Your tenant. Our Next.js app. Roles that map to the product, not to a dump of claims.",
    uses: [
      "SSO for a client portal or an internal tool.",
      "Social and enterprise connections on one login box.",
      "A handover of the tenant, not a studio application.",
    ],
    examples: [
      {
        title: "A portal that used the work login",
        body: "Staff did not get a fourth password. Auth0 talked to the directory.",
      },
      {
        title: "A SaaS that had to offer both Google and SAML",
        body: "One box. The rest of the app did not care which connection won.",
      },
      {
        title: "Roles that meant something in the UI",
        body: "We mapped claims to the screens. Nobody saw an admin they should not.",
      },
    ],
    related: ["clerk", "microsoft", "saas", "internal-tools"],
  }),
  tech("Mapbox", {
    color: "#000000",
    kicker: "Location",
    headline: "Maps and location in the product, on a style you can own.",
    lede: "Mapbox is for store finders and maps that have to look like the rest of the site. We style them, we budget them, and we keep the page in charge.",
    about:
      "A map is a component. We design the search, the pin, and the empty state, then we pick Mapbox or Google Maps for the engine. The type stays ours.",
    how: "A custom style when the brand needs it. Vector tiles with a load budget. Fallbacks when a key is missing.",
    uses: [
      "Store locators that filter by more than distance.",
      "Operations maps inside a tool.",
      "Marketing pages that show coverage without a 4MB widget.",
    ],
    examples: [
      {
        title: "A locator that looked like the brand",
        body: "The map used the same greys as the site. It did not look like a default demo.",
      },
      {
        title: "A jobs board on a map",
        body: "Dispatchers filtered in the list. The map only followed.",
      },
      {
        title: "A lander that still passed its weight budget",
        body: "The map waited for a click. The offer did not.",
      },
    ],
    related: ["google-maps", "company-sites", "internal-tools"],
  }),
  tech("Resend", {
    color: "#000000",
    kicker: "Email",
    headline: "Transactional mail that looks like the product.",
    lede: "Resend is how we send the messages the product owes people: the receipt, the invite, the reset. The template is designed, not leftover from a vendor.",
    about:
      "Email is an interface. We write the subject, the body, and the one button, in the same type as the site, from a domain you authenticate.",
    how: "Your domain, your Resend project. Templates in the repo. Events that the product can show as a log.",
    uses: [
      "Invites, receipts, and password resets for SaaS.",
      "Form confirmations that do not look like spam.",
      "A handover of DNS and the audience, not a studio sender.",
    ],
    examples: [
      {
        title: "A receipt that still looked like the brand",
        body: "Type and colour matched the site. People did not wonder who had emailed them.",
      },
      {
        title: "An invite that opened the right first-run",
        body: "The link landed on the page we designed, not on a generic dashboard.",
      },
      {
        title: "DNS you can see",
        body: "SPF and DKIM in the handover. Deliverability is not a mystery.",
      },
    ],
    related: ["stripe", "clerk", "saas", "company-sites"],
  }),
];
