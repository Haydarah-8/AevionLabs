import type { TopicDetailSeed } from "@/data/topics/types";

function seed(
  group: string,
  introHeading: string,
  problem: string,
  aside: string,
  note: string,
  fit: [string, string][],
  faqs: [string, string][],
  extraCases: [string, string][] = [],
): TopicDetailSeed {
  return {
    group,
    introHeading,
    problem,
    aside,
    note,
    fit: fit.map(([title, body]) => ({ title, body })),
    faqs: faqs.map(([question, answer]) => ({ question, answer })),
    extraCases: extraCases.map(([title, body]) => ({ title, body })),
  };
}

export const TECHNOLOGY_DETAIL: Record<string, TopicDetailSeed> = {
  typescript: seed(
    "language",
    "Typed JavaScript so the next person can change the product.",
    "A handover is only useful if a new developer can change a flow without guessing. Untyped JavaScript turns a company site or a SaaS into folklore inside a year. We write TypeScript as the default, with types that travel from the CMS through the API to the page. The prototype already uses the shapes we would ship. You click the real model, not a bag of any.",
    "Shared types for content, responses, and UI props. If a CMS block cannot be published in a broken shape, that failure happens in review, not on the live page. Lint and types sit on the pull request. The README stays short because the types explain the domain.",
    "If the types and the product disagree, the types are wrong, or the product is. We fix that in the same pull request.",
    [
      [
        "CMS blocks that cannot ship broken",
        "Fields are known at build time. A missing heading fails in review, not in front of a customer.",
      ],
      [
        "SaaS with one source of truth",
        "Plan names, states, and roles live in one file. The UI cannot invent a fourth plan.",
      ],
      [
        "Handovers that do not need a tour",
        "A new hire reads the types. We do not leave a folklore document in Notion as the real spec.",
      ],
      [
        "Server and client in the same language",
        "App Router products share types across the boundary so a rename is one change.",
      ],
      [
        "APIs you can evolve",
        "OpenAPI or shared types at the edge when a .NET or other back end is in the room.",
      ],
    ],
    [
      [
        "Do you ever write plain JavaScript?",
        "Only for a tiny page that will not grow. Production products are TypeScript. The brief can say otherwise. We will push back if the product has to last.",
      ],
      [
        "Will this slow us down?",
        "It slows the first week and speeds every week after. The prototype still ships on a URL you can refuse.",
      ],
      [
        "Can a designer work in this repo?",
        "Content and copy live in the CMS. Types protect the shapes. Designers do not have to read generics to publish a page.",
      ],
      [
        "What about any?",
        "We treat a stray any as a review fail unless the boundary is truly unknown, and then we wrap it.",
      ],
    ],
  ),
  dotnet: seed(
    "language",
    "A back end when the team already thinks in C#.",
    "A Microsoft shop should not be forced onto a stack it cannot hire for. We put a Next.js or React surface on .NET when that is the language the company already staffs. One product, two rooms that can still talk. The domain stays where your engineers are strong. The interface still meets the same bar as any other Aevion Labs site.",
    "OpenAPI or shared types at the boundary. Auth with the existing identity. Deploy on Azure or wherever the tenancy already lives. We do not rewrite a working domain layer for fashion, and we do not hide a messy API behind a pretty screen and call it done.",
    "The contract between front and back is part of the handover, not a meeting that evaporates.",
    [
      [
        "Portals on an existing API",
        "We do not rewrite the domain. We give it an interface people will open.",
      ],
      [
        "SSO with the work account",
        "Entra ID at the edge. No second password for staff.",
      ],
      [
        "Public sites that talk to C#",
        "Marketing on the web, operations on .NET, one company.",
      ],
      [
        "Hybrid teams",
        "We design and ship the front. Your engineers keep the domain. The spec is in the repo.",
      ],
      [
        "Azure as the house",
        "When the subscription already exists, we deploy there. Previews still happen on a URL.",
      ],
    ],
    [
      [
        "Will you replace our .NET team?",
        "No. We meet them. If the brief is only an API, we can stop at the contract. If you have no front-end staff, we will own the interface.",
      ],
      [
        "Blazor instead of React?",
        "Only if the team will actually maintain it. Most of our interfaces are React or Next.js because that is the product surface we know how to handover.",
      ],
      [
        "How do types cross the boundary?",
        "OpenAPI, generated clients, or shared contracts. A rename should fail a build, not a Friday demo.",
      ],
      [
        "Can we keep Azure DevOps?",
        "Yes. We will not force GitHub for taste. Previews and a repo you own still stand.",
      ],
    ],
  ),
  javascript: seed(
    "language",
    "The language the browser already speaks, written on purpose.",
    "Everything that reaches a screen is JavaScript at the end. We write it carefully, type it when we can, and we do not send a novel to do a button's job. A company site that waits on a bundle to print a paragraph has failed the first second. A dashboard can be an application. A lander should still be a document.",
    "TypeScript on top for products that last. Progressive enhancement where it matters. Third-party tags load when they are needed. We test the journeys that make money, not a lab profile.",
    "If the offer is not in the HTML, the script is in the way.",
    [
      [
        "Landers that do not wait on a bundle",
        "The promise is in the document. Script adds extras.",
      ],
      [
        "Dashboards that feel like software",
        "JavaScript is the product. First paint is still honest.",
      ],
      [
        "Tags that do not own the page",
        "Marketing scripts load late. The form does not wait.",
      ],
      [
        "Interfaces a keyboard can finish",
        "Real buttons, real forms. We do not restyle a div and hope.",
      ],
      [
        "A tenth page that stays readable",
        "Source that a person can open. No generated soup as a lifestyle.",
      ],
    ],
    [
      [
        "Is everything a React app?",
        "No. Marketing pages can be lighter. Product surfaces use React or Next.js when the interface has to move. The brief decides.",
      ],
      [
        "Do you still support no-JS?",
        "Forms and core content should work if a script is late. We do not pretend a SaaS dashboard works with JavaScript off.",
      ],
      [
        "What about jQuery estates?",
        "We can wrap, replace, or leave a widget. A rewrite for taste is a waste.",
      ],
      [
        "How do you keep bundles small?",
        "Budgets in the brief. Review fails when a lander ships a dashboard's worth of code.",
      ],
    ],
  ),
  python: seed(
    "language",
    "Scripts, models, and the jobs a page should not do.",
    "Python is for the work that happens off the request: imports, reports, a model, a one-off that became weekly. We do not build marketing sites in Django for the sake of it. We use Python where it is the right tool, then we give the result to a Next.js product your team can publish from.",
    "Jobs, notebooks, and small services with clear inputs. When a script proves it is weekly, it becomes a button in the tool. The public interface stays the site we designed. The repo holds the script so you can run it without us.",
    "If it is going to run every Monday, it should not live in someone's downloads folder.",
    [
      [
        "Reports that used to live in email",
        "Python builds the file. The tool shows it. Finance stops chasing a CSV.",
      ],
      [
        "Catalogue imports you can rerun",
        "The script is in the repo. Your team can run it.",
      ],
      [
        "Model calls behind a product",
        "You click the interface. Python is a step, not the demo.",
      ],
      [
        "Cleanup that became a button",
        "A one-off migration that earned a place in the tool.",
      ],
      [
        "Spreadsheets that wanted to be software",
        "The job stays the job. The store is Postgres. Python moves the data.",
      ],
    ],
    [
      [
        "Will the public site be Python?",
        "Almost never. The public site is Next.js. Python sits beside it for jobs and data.",
      ],
      [
        "Notebooks in production?",
        "Notebooks are for exploration. Production is a script or a service with logs.",
      ],
      [
        "Can our data team keep Python?",
        "Yes. That is the point. We meet them at files and jobs, not at a rewrite of their language.",
      ],
      [
        "How do we run it?",
        "One command in the README, or a button in the tool. Docker when the stack is more than a script.",
      ],
    ],
  ),
  html5: seed(
    "language",
    "The document first. The framework second.",
    "If the HTML is wrong, no amount of React will save the page. A company site is still a document. We start with structure, landmarks, and forms a keyboard can finish. Headings match the story so a crawler and a screen reader do not have to guess. Media has real captions, not a div that looks like a player.",
    "Semantic templates in Next.js. Forms that work before the script. CMS blocks that output honest HTML. Accessibility is in the original timeline, not a later audit that arrives after launch.",
    "A button should be a button. A form should submit without a ceremony.",
    [
      [
        "Forms on a bad connection",
        "Submit is a real form. Script only makes it nicer.",
      ],
      [
        "Pages Google can outline",
        "Headings match the story. The crawler does not have to invent one.",
      ],
      [
        "Design systems that start with elements",
        "We do not restyle a div and hope. The component is the element plus states.",
      ],
      [
        "CMS output you can read",
        "View source should not be a joke. Blocks print real structure.",
      ],
      [
        "Media with a caption",
        "Films and images have text beside them. The page still works if the player is late.",
      ],
    ],
    [
      [
        "Does Next.js get in the way of HTML?",
        "Only if we let it. Server components can print documents. We treat extra wrappers as a smell.",
      ],
      [
        "WCAG in the brief?",
        "Yes. Contrast, labels, and keyboard paths are part of the build, not a sticker at the end.",
      ],
      [
        "What about SEO?",
        "Honest HTML is the start. Metadata, canonicals, and the event map sit on top. We do not hide the story in a canvas.",
      ],
      [
        "Can marketers paste HTML?",
        "The CMS should not need that. Blocks are the system. Paste is how soup starts.",
      ],
    ],
  ),
  css: seed(
    "language",
    "Layout as a system, not a pile of exceptions.",
    "CSS is how a tenth page still looks like the same company. Visual design that cannot be expressed in CSS is decoration. We write tokens, spacing, and type first, then we let Tailwind or custom CSS follow that file. Mystery values hiding in a component are a review fail.",
    "Tokens in one place. Responsive layouts that do not need a tenth breakpoint name. Dark or campaign themes that change tokens, not templates. The Figma file and the CSS agree on names so nobody is translating 17px by eye.",
    "If a rebrand needs a rebuild, the system was not a system.",
    [
      [
        "Sites that survive a rebrand",
        "Change tokens. Keep templates. The tenth page still belongs.",
      ],
      [
        "Landers on a narrow phone",
        "Type and spacing do the work. We do not hide columns with hacks.",
      ],
      [
        "Product and marketing on one scale",
        "Paid traffic does not land on a cousin of the brand.",
      ],
      [
        "Themes without new templates",
        "A campaign swaps tokens. The blocks stay.",
      ],
      [
        "Handover a designer can still read",
        "The tokens match the Figma file.",
      ],
    ],
    [
      [
        "Tailwind or plain CSS?",
        "Tailwind when it applies the tokens we named. Plain CSS when a few files are clearer. The tokens are the point.",
      ],
      [
        "Will you use CSS-in-JS?",
        "Only if the product already does and the team will keep it. We prefer tokens that compile to something you can see.",
      ],
      [
        "How do you stop drift?",
        "A small scale. Review fails on magic numbers. The design system is the CSS.",
      ],
      [
        "What about animation?",
        "Motion is designed, budgeted, and optional when the user asks to reduce it.",
      ],
    ],
  ),
  swift: seed(
    "native",
    "Native iOS when the web is not enough.",
    "Swift is for the product that has to live on an iPhone as software. Most work never needs it. When it does, we write the smallest native surface that shares accounts with the web, then we hand over the Xcode project. SwiftUI where it helps. TestFlight is the prototype you can hold.",
    "Tokens from the same Figma file as the site. The same API. No second identity. Certificates in your account. If a well-made web app would do, we will say so before anyone creates a target.",
    "The phone should not invent a second company.",
    [
      [
        "Companion apps",
        "Web and phone share the session story. No second identity.",
      ],
      [
        "Field tools",
        "Camera or offline when the browser will not do. Same jobs API as the office.",
      ],
      ["TestFlight first", "You tap the product. Store copy waits."],
      [
        "Shared design tokens",
        "Colour and type survive the hop from the site.",
      ],
      ["Handover of signing", "Your account, your Mac, your repo."],
    ],
    [
      [
        "SwiftUI only?",
        "Where it helps. We will not rewrite working UIKit for taste.",
      ],
      [
        "Do we still get a website?",
        "Usually yes. Native is a door. The system behind it is the product.",
      ],
      [
        "Who owns the developer programme?",
        "You do. We will not ship from a studio team unless the brief is a prototype that will be thrown away.",
      ],
      [
        "What about Mac?",
        "If the brief names it. We do not ship a stretched iPhone layout and call it desktop.",
      ],
    ],
  ),
  kotlin: seed(
    "native",
    "Android in the language the platform expects.",
    "Kotlin is for a Play build that has to last. A lot of Android work can stay on the web. When it cannot, we write Kotlin against the same backend, with a handover that includes the keystore. The smallest native surface. Shared tokens. A Play listing written from the real UI.",
    "Web first. Play later. Accounts already work. Dispatchers can stay in the browser while the field uses the phone. The Play Console is yours.",
    "A wrapper is fine until it is not. We will say when Kotlin is the honest path.",
    [
      [
        "Web-first products with a later listing",
        "Accounts exist. The app is a second door.",
      ],
      [
        "Field builds on the same jobs API",
        "The office tool and the phone do not invent two truths.",
      ],
      [
        "Hardware the browser will not give us",
        "Camera, sensors, offline. Still your backend.",
      ],
      ["Keys you hold", "Play account and keystore are yours."],
      [
        "Listings from the real UI",
        "Screenshots match the build you approved.",
      ],
    ],
    [
      [
        "Compose or views?",
        "Compose where it helps. We will not rewrite a working app for a blog post.",
      ],
      [
        "Can we skip iOS?",
        "Yes, if the audience is Android. The web should still work for everyone else.",
      ],
      [
        "Who owns Play?",
        "You do. Production does not ship from a studio developer account.",
      ],
      [
        "What about Flutter?",
        "Only if the team will maintain it. We prefer Kotlin when Android is the real target and the web already exists.",
      ],
    ],
  ),
  go: seed(
    "language",
    "Small services for work the page should not wait on.",
    "Go is for jobs, gateways, and the quiet services that sit beside a Next.js app. We do not rewrite a site in Go. We put Go on the boundary: a webhook, a worker, a tiny API that has to stay up while the front end changes. One binary, clear logs, deploy next to the app.",
    "When a script has become a product, Go is a fit. The interface stays on the web stack your team can publish from. The service is boring on purpose.",
    "If it has to start fast and stay boring, it probably does not belong in the request.",
    [
      [
        "Stripe webhooks off the page",
        "Go handles the event. The dashboard only shows the result.",
      ],
      [
        "Imports that used to crash a cron",
        "One service, one log, a button in the tool to rerun.",
      ],
      [
        "Gateways in front of an old system",
        "The new site never speaks the old protocol. Go does.",
      ],
      [
        "Workers for mail and billing",
        "Failures are logs and retries, not a spinner in the browser.",
      ],
      [
        "A thin API over Postgres",
        "When the product needs a small, fast boundary.",
      ],
    ],
    [
      [
        "Why not Node for the worker?",
        "Node is fine for many jobs. Go when we want a small binary, simple deploy, and a service that should outlive a framework fashion.",
      ],
      ["Will the site be Go?", "No. The site is Next.js. Go sits beside it."],
      [
        "How do we run it?",
        "Docker or a single binary. The README is short. Logs are the interface for ops.",
      ],
      [
        "Can our team keep it?",
        "Yes. That is the test. If they cannot run it on day one, we have not finished the handover.",
      ],
    ],
  ),
  react: seed(
    "framework",
    "The interface layer for sites, SaaS, and tools.",
    "React is how we build surfaces you can reuse, test, and hand over. A page is a composition, not a one-off file. The same component can live on a marketing page and in a dashboard. The design system is code, not a picture of a button. Empty states, errors, and the first day are designed in, not left as a blank card.",
    "Server Components where they help, client only where the interface must move. Types on every prop that matters. A tenth page is a CMS choosing order, not a new invention. The preview is the product you can refuse.",
    "If a new view starts in a blank file, the system was not a system.",
    [
      [
        "Company sites with rearranging blocks",
        "The library already had the block. The CMS only chose the order.",
      ],
      [
        "Dashboards with honest empty states",
        "We design the first day, not only the day the charts are full.",
      ],
      [
        "Design systems that ship as components",
        "The site uses the same buttons the docs describe.",
      ],
      [
        "SaaS with states designed in",
        "Loading, error, permission denied. Not a surprise on launch week.",
      ],
      [
        "Handovers the next team can extend",
        "Names, types, and examples. A new screen has a place to start.",
      ],
    ],
    [
      [
        "React or Vue?",
        "React by default. Vue when that is already the house. We will not rewrite for taste.",
      ],
      [
        "Client components everywhere?",
        "No. We keep JavaScript off the lander when the lander is a document. Product surfaces get what they need.",
      ],
      [
        "Do we get Storybook?",
        "When the system is the product. Live examples next to the guideline. A PDF of buttons is not a system.",
      ],
      [
        "Can marketers edit React?",
        "They edit the CMS. React is the delivery. That split is the point.",
      ],
    ],
  ),
  "next-js": seed(
    "framework",
    "The framework we ship production sites on.",
    "Next.js is how a company site, a SaaS, or a tool lives on a repository you own. We do not rent you a theme. We build an App Router product with routes, metadata, and a content model that still makes sense a year later. You see a preview URL before the rest of the budget unlocks. Production is that app, promoted, on a domain in your name.",
    "Server rendering where it helps, static where it can be, a CMS that publishes into the same repo. Auth, billing, and mail are code next to the UI, not a zap. The same team writes the design and the routes, so nothing is lost in a handoff.",
    "If you cannot clone the repo and run the site, you do not own the work.",
    [
      [
        "Marketing sites the team can publish from",
        "Pages, posts, and landers are CMS entries. We are not in the loop for a copy change.",
      ],
      [
        "SaaS that started as a prototype",
        "The same app grew accounts and billing. Nothing was thrown away.",
      ],
      [
        "Internal tools that deploy like a site",
        "Software in the browser. Previews on every change.",
      ],
      [
        "Metadata and SEO as part of the route",
        "Canonicals, titles, and structured data live with the page, not in a plugin folklore.",
      ],
      [
        "A preview for every change",
        "You click the URL. Sign-off happens in the browser.",
      ],
    ],
    [
      [
        "Why not WordPress?",
        "WordPress can stay as an editor. The public site is Next.js when speed, ownership, and a tenth page as a system matter. We will keep WordPress if that is the honest constraint.",
      ],
      [
        "App Router or Pages?",
        "App Router for new work. We will not rewrite a working Pages app for a blog post.",
      ],
      [
        "Where does it host?",
        "Vercel often, Azure or others when the estate requires it. The app is portable. The host is a decision.",
      ],
      [
        "Do we own the Next.js app?",
        "Yes. Your git organisation. Your env. Your domain. We leave a runbook.",
      ],
    ],
    [
      [
        "A brochure that became the product",
        "The marketing site and the logged-in app shared the design system. Paid traffic landed on the same type as the dashboard.",
      ],
    ],
  ),
  "node-js": seed(
    "framework",
    "The runtime the product already shares with the page.",
    "A Next.js product is a Node product. We treat the server like part of the design: timeouts, logs, and jobs that do not belong in the request. One version, clear scripts, no mystery globals. A new hire should install and run the site in one command.",
    "Typed APIs, scheduled work, and scripts in the same repo as the UI. Integrations that used to live in a Zap nobody owned become route handlers you can read. The CMS and the app speak one runtime.",
    "If it only runs on a laptop we keep, it is not a handover.",
    [
      [
        "Forms that write to three systems",
        "Node fans the event out. The page only says thank you.",
      ],
      [
        "Nightly jobs with a log you can read",
        "Failure is an email, not a silence.",
      ],
      [
        "Prototypes on the production runtime",
        "No rewrite between the demo and launch.",
      ],
      [
        "Tooling a new hire can run",
        "Clone, install, click. The README is short.",
      ],
      [
        "Webhooks in the repo",
        "Billing and mail are code, not a personal zap.",
      ],
    ],
    [
      [
        "Node on the server forever?",
        "For this stack, yes. Workers can be Node or Go. The site stays Node because Next.js is the product surface.",
      ],
      [
        "What version?",
        "Current LTS, pinned. We do not leave engines floating.",
      ],
      [
        "Serverless or a long process?",
        "Whatever the host expects. The code should not care more than it has to.",
      ],
      [
        "Can we use Express?",
        "If an existing service is Express, we meet it. New products use Next.js routes unless there is a reason not to.",
      ],
    ],
  ),
  tailwind: seed(
    "framework",
    "The CSS system that keeps pages consistent.",
    "Tailwind is not a look. It is a way to apply the tokens we already named in Figma. If the config is wrong, the site will drift. We treat that file as part of the brand. A small set of sizes, type, and colour. Components use those names. One-off values are a smell we fix in review.",
    "Marketing sites and product UI on the same scale. Dark or campaign themes that swap tokens, not templates. A CMS block cannot go off-brand because the utilities only expose the system. The handover matches the Figma file so nobody is guessing 17px.",
    "If a lander does not look like the product, the config failed, or the brief did.",
    [
      [
        "Landers that match the product",
        "Same type, same buttons. Paid traffic does not meet a cousin.",
      ],
      ["CMS blocks that stay on-brand", "A new page cannot invent a colour."],
      [
        "Design systems that compile",
        "Tokens become the classes the app already uses.",
      ],
      ["Campaign themes", "Swap tokens. Keep templates."],
      [
        "Handover a designer can use",
        "The config is the scale. It matches the file.",
      ],
    ],
    [
      [
        "Is Tailwind the design?",
        "No. The design is tokens and layout. Tailwind delivers them. We will write CSS if a few files are clearer.",
      ],
      [
        "Utility soup?",
        "Review fails on magic numbers and one-off stacks. Components wrap the ordinary things.",
      ],
      [
        "Can we use a UI kit?",
        "We would rather use your system. A kit that fights the brand is another cousin.",
      ],
      [
        "What about dark mode?",
        "When the brief names it. Tokens, not a second set of templates.",
      ],
    ],
  ),
  "vue-js": seed(
    "framework",
    "A Vue surface when that is already the house.",
    "We build in React by default. When a team already lives in Vue, we meet them there, or we wrap the new work so it can sit beside the old. A rewrite for taste is a waste. If Vue is what the staff can change, we design and ship in Vue, with the same CMS and handover rules as any other product.",
    "Nuxt when the product wants a framework. Plain Vue when a widget has to live inside an existing page. Types and a design system either way. If they want Next.js later, the design system survives the hop.",
    "We will not lecture a Vue team into a rewrite they cannot staff.",
    [
      [
        "Campaign pages on an existing Vue app",
        "We shipped the lander in the stack they had.",
      ],
      [
        "Nuxt brochures the team can edit",
        "Same prototype-first rule. The repo is still theirs.",
      ],
      [
        "Widgets inside someone else's page",
        "An island. The rest of the estate is not our problem.",
      ],
      [
        "A planned move to Next.js",
        "Tokens and IA come with us. The lock-in does not.",
      ],
      [
        "Handover their engineers can run",
        "Vue they already know. No surprise stack on a Friday.",
      ],
    ],
    [
      [
        "Will you insist on React?",
        "Not if Vue is the house. We will say if a new product would be cheaper in Next.js, and we will not force it.",
      ],
      [
        "Vue 2 estates?",
        "We can wrap or plan an upgrade. A surprise rewrite is how products stall.",
      ],
      [
        "Do we still get previews?",
        "Yes. Sign-off in the browser is not optional.",
      ],
      [
        "Can you staff Vue long term?",
        "For the build, yes. For a retainer, we will be honest if React is where this studio is strongest, and we will leave the repo in a state their team can keep.",
      ],
    ],
  ),
  nuxt: seed(
    "framework",
    "Vue's production framework, used the same way we use Next.",
    "The rules do not change with the logo. You own the repo. You see a preview. The rest of the budget waits until that preview is the product. Nuxt is for teams who want a Vue app with routes, metadata, and a CMS. We treat it as a product, not a starter theme.",
    "Content model first, then pages, then integrations. Hosting on the platform you already pay for. A handover with a content model so a tenth page does not need us.",
    "If they wanted Next.js, we would say so. If they wanted Nuxt, we will ship Nuxt properly.",
    [
      [
        "Company sites on a Vue team",
        "Staff stay productive. The product is still prototype-first.",
      ],
      [
        "SaaS next to an existing Nuxt app",
        "We do not force a second framework for a dashboard.",
      ],
      [
        "CMS without a developer in the loop",
        "Publish is a job the team can do.",
      ],
      ["Preview URLs for every change", "The same ritual as our Next.js work."],
      [
        "Metadata done properly",
        "Titles, canonicals, and structure live with the route.",
      ],
    ],
    [
      [
        "Nuxt or Next?",
        "Next is our default. Nuxt when the team is Vue. We will not run both in one product without a reason.",
      ],
      [
        "Who hosts?",
        "Wherever the domain already lives, if it can. Previews matter more than the host logo.",
      ],
      [
        "Can we migrate later?",
        "Yes. The content model and the design system are the portable parts.",
      ],
      [
        "Do you retain Nuxt apps?",
        "We can. We will be honest if the team should take the repo and we stay on design and strategy.",
      ],
    ],
  ),
  svelte: seed(
    "framework",
    "A lighter surface when the page should stay small.",
    "Svelte is a fit for a marketing surface or a widget that should not drag a large runtime. We will not pick it to be fashionable. We pick it when the page has to stay thin, or when a team already writes it. SvelteKit for a full site. A compiled island when the rest of the estate is something else. Same design tokens either way.",
    "Campaign pages with a hard weight budget. Embedded calculators. A small site a small team can keep. Tokens, content, and a preview. Small does not mean sloppy.",
    "If the offer has to be on screen before the ad finishes, the runtime is part of the brief.",
    [
      [
        "Landers under a hard budget",
        "Svelte compiles away. The offer is on screen.",
      ],
      [
        "Widgets in someone else's CMS",
        "An island. The host page is not our rewrite.",
      ],
      [
        "Tiny repos with a real handover",
        "Tokens, content, preview. No excuse for a mess.",
      ],
      [
        "Motion that stays cheap",
        "When the brief is a page that moves, not a product that lasts a decade in React.",
      ],
      [
        "A later hop into Next.js",
        "If the site grows accounts, we take the tokens and the writing with us.",
      ],
    ],
    [
      [
        "Why not just Next.js?",
        "Next is the default for products. Svelte when weight is the brief or the team already lives there.",
      ],
      [
        "Can it do SaaS?",
        "It can. We usually would not start a long SaaS there unless the team is Svelte-native.",
      ],
      [
        "Who maintains it?",
        "The repo is yours. We will be honest if our retainer strength is React, and we will leave the site keepable.",
      ],
      ["SvelteKit hosting?", "Wherever previews work. The app is the product."],
    ],
  ),
  postgresql: seed(
    "data",
    "The database the product actually owns.",
    "A SaaS or a tool without a real database is a demo. Postgres is where the records live. We design the schema with you, on an instance in your name, so a spreadsheet does not become the system of record again. Portable, inspectable, not rented as a black box. Row-level rules when more than one tenant is in the same table.",
    "Schema in the repo. Migrations you can read. Supabase or a host you choose. The prototype uses the tables we would keep. You click the product against real shapes. A dump you can restore is part of the handover. We do not keep a copy as leverage.",
    "If nobody can restore it, you do not own it.",
    [
      [
        "Tools that retire three sheets",
        "The schema matches the work. Nobody exports to Excel to feel safe.",
      ],
      [
        "SaaS with honest tenants",
        "Row policies in the database, not only in the UI.",
      ],
      [
        "Content that should not be invented twice",
        "CMS and product data in one story, or a clear boundary.",
      ],
      [
        "Handovers with a restore path",
        "The dump is yours. The runbook says how.",
      ],
      [
        "Analytics that can join",
        "Events and records that a person can query without a vendor lock.",
      ],
    ],
    [
      [
        "Supabase or plain Postgres?",
        "Supabase when auth and storage help. Plain Postgres when you already have an instance. The schema is the point.",
      ],
      [
        "Will you use an ORM?",
        "Prisma when typed queries help. SQL when it is clearer. Migrations always live in the repo.",
      ],
      [
        "Who hosts the database?",
        "You do. We will not keep production data in a studio project.",
      ],
      [
        "What about Mongo?",
        "Only if the brief is truly document-shaped and the team already runs it. Most products we ship want Postgres.",
      ],
    ],
  ),
  prisma: seed(
    "data",
    "A schema in the repo, not a folklore of columns.",
    "Prisma is how the TypeScript app and the database stay in the same conversation. The model is a file you can review. We use it when the team wants typed queries and migrations that live next to the UI. The database is still Postgres you own. Models named for the product language, not for the ORM.",
    "Migrations in pull requests. A seed for the prototype you can click. A second engineer should not need a tour. A billing table cannot drift because the type and the column change together.",
    "If the schema file and the product disagree, we fix that before launch, not in a war room.",
    [
      [
        "Typed queries on SaaS and tools",
        "Every query should fail in review if the shape moved.",
      ],
      ["Prototypes on the real model", "We do not fake the data layer."],
      [
        "Handovers where the schema is the map",
        "The file explains the domain.",
      ],
      ["One pull request per field change", "UI and database move together."],
      ["Seeds that match the demo", "The clickable product is the product."],
    ],
    [
      [
        "Do we have to use Prisma?",
        "No. It is a fit for TypeScript products on Postgres. Raw SQL is welcome when it is clearer.",
      ],
      [
        "Vendor lock?",
        "Prisma is in the repo. Postgres is the record. You can leave the ORM. You should not have to leave the data.",
      ],
      [
        "What about Prisma Studio?",
        "Fine locally. Production data stays behind the product and the policies.",
      ],
      [
        "Can non-engineers see the model?",
        "We write the names in the language of the work. A product owner should recognise the nouns.",
      ],
    ],
  ),
  webflow: seed(
    "builder",
    "A builder when the team has to publish without a deploy.",
    "We prefer a repository you own. If the team will not open one, Webflow can still be a disciplined site: type, CMS, and a handover that is not a maze of classes. We use it when that is the honest constraint, and we are clear about what it cannot be. Accounts, billing, and a real tool are a different job. We write the exit before the maze starts.",
    "A small system of classes. CMS collections with limits. Production rules. If the product outgrows it, we plan the move to Next.js while the writing is still clean.",
    "A builder is allowed. A lie about what it can carry is not.",
    [
      [
        "Brochure sites a brand team will own",
        "They publish without calling us. The class system is short.",
      ],
      [
        "Landers that are not a class landfill",
        "Tokens first. One-off classes fail review.",
      ],
      [
        "A planned exit",
        "When they needed accounts, we moved the content. The brand survived.",
      ],
      [
        "CMS collections with a ceiling",
        "The team can fill them. They cannot invent a thirteenth heading.",
      ],
      [
        "Forms into a system you own",
        "Submissions hit the CRM. Webflow is the door.",
      ],
    ],
    [
      [
        "Should we start in Webflow or Next.js?",
        "Next.js if the product will grow. Webflow if the team will never open a repo and the brief is a site. We will say which one you are buying.",
      ],
      [
        "Can Webflow do SaaS?",
        "Not the way we mean SaaS. We will not pretend.",
      ],
      [
        "Who owns the Webflow account?",
        "You do. A studio workspace is not production.",
      ],
      [
        "How bad is the export later?",
        "Better if the CMS and the writing are clean. That is why we keep the system small now.",
      ],
    ],
  ),
  framer: seed(
    "builder",
    "Motion and marketing when the brief is a page, not a product.",
    "A Framer page can be a prototype you can click this week. A year of pages is a different job. We say which one you are buying. Framer is useful for a campaign that has to move. We use it for that, then we take the system into code when the site has to last.",
    "Design in Framer when motion is the brief. Rebuild in Next.js when you need a CMS, accounts, or a repo. The tokens come with us. You click the motion. We do not present a video of a website and call it a prototype.",
    "A launch page in days is allowed. Calling it the company platform is not.",
    [
      [
        "Launch pages in days",
        "Film and form live. The product site stays on Next.js.",
      ],
      ["Prototypes that are the design", "You click the motion on a URL."],
      [
        "A hop into code without a redraw",
        "Tokens and layout survive. The campaign becomes a template.",
      ],
      [
        "Motion that marketing can still edit",
        "Until they cannot, at which point we say so and move.",
      ],
      [
        "Campaigns beside a real product",
        "Framer for the moment. The repo for the years.",
      ],
    ],
    [
      [
        "Is Framer the CMS?",
        "For a campaign, maybe. For a company system, no. We will not leave you there by accident.",
      ],
      [
        "Can we keep Framer after the rebuild?",
        "For special pages, yes. The main site should not depend on it if you need ownership.",
      ],
      ["Who owns the project?", "You do."],
      [
        "Does this replace Figma?",
        "Sometimes for motion. Systems still want a file engineering can follow.",
      ],
    ],
  ),
  wordpress: seed(
    "builder",
    "A CMS people already know, on a front end you can still own.",
    "WordPress is often already there. A theme you cannot trust is not a CMS. We either rebuild the front and keep WordPress as headless, or we tidy the theme if that is the honest brief. Editors who already live in wp-admin can stay. Visitors can still get a fast Next.js page. When the product has outgrown it, we migrate the writing and drop the lock-in.",
    "Headless by default when the public site has to be fast. Classic only when the team will not leave the admin they know. Plugins are a budget. We cut the ones that fight the brand and the ones that slow the form.",
    "Familiar is allowed. Slow and unsafe is not.",
    [
      [
        "A fast front, a familiar editor",
        "Staff publish in WordPress. Visitors get Next.js.",
      ],
      [
        "Themes that stop fighting the brand",
        "Templates as a system. Plugins cut.",
      ],
      [
        "A planned move to a repo you own",
        "Content comes with us. The lock-in does not.",
      ],
      [
        "Forms that land in a CRM",
        "Not in a personal inbox and a plugin database.",
      ],
      [
        "Editorial sites that still have to convert",
        "Posts as a system, landers as a system, not two cousins.",
      ],
    ],
    [
      [
        "Headless or classic?",
        "Headless when the public site has to be fast and owned. Classic when the brief is tidy-the-theme and leave. We will not mix those stories.",
      ],
      [
        "WooCommerce?",
        "If the store is the product, we often prefer Shopify or a custom stack. We will say if Woo is a trap for the brief.",
      ],
      [
        "Who hosts WordPress?",
        "You do. We will not keep production on a studio host.",
      ],
      [
        "Can we keep the URL structure?",
        "Usually yes. Redirects are part of the build when we move.",
      ],
    ],
  ),
  squarespace: seed(
    "builder",
    "A hosted site when the brief is small and the team is smaller.",
    "Squarespace can be the right first site. We say so when it is, and we say when it will stall: custom checkout, real tools, a tenth language. We are not here to shame a builder. We are here to stop you paying for a rebuild you could have planned. If Squarespace is enough, we keep it tidy. Type and photography do the work. The default kit is not the brand.",
    "A short design system inside the product. Clear limits in the brief. A path to Next.js written down before you hit the wall. When they needed more, the copy and the structure came across.",
    "A first site should not pretend to be a product platform.",
    [
      ["First company sites", "Finished this month. Honest about the ceiling."],
      [
        "Holding pages that still look like the brand",
        "Type and colour, not the default kit.",
      ],
      ["Rebuilds that keep the writing", "When the builder starts saying no."],
      ["Campaigns that will not become the system", "A page, not a platform."],
      ["Handover of the account", "You log in. We do not."],
    ],
    [
      [
        "Should we skip Squarespace and go to Next.js?",
        "If you already know you need accounts, a CMS you control, or a tenth language, yes. If you need a real site this month and a small team, Squarespace can be honest.",
      ],
      [
        "Can it do ecommerce?",
        "For a simple catalogue, sometimes. For a store you have to own under spend, we will say when it is not enough.",
      ],
      [
        "Who owns the site?",
        "Your Squarespace account. A studio login is not production.",
      ],
      [
        "What do we take when we leave?",
        "Writing, structure, photography, the domain. We plan that on day one.",
      ],
    ],
  ),
  wix: seed(
    "builder",
    "Another hosted start. The same honest limits.",
    "Wix is a first site for some teams. We will make it look like the company, and we will tell you which product ideas it will not carry. The problem is not Wix. The problem is buying a custom product story on a platform that cannot ship it. We keep those two jobs apart. Tighten the kit. Write the pages. Document the exit.",
    "If the next brief is a tool or a store you have to own, we plan Next.js or Shopify. A no that saves a rebuild is part of the work. The writing survives the hop. The lock-in does not.",
    "We will not decorate a ceiling and call it a sky.",
    [
      [
        "Brochures that stop looking like a template",
        "Type, space, photography. The platform stays in the background.",
      ],
      [
        "A no that saved a rebuild",
        "They wanted accounts. We said Wix would not carry it, and we scoped the real product.",
      ],
      ["Later Next.js with the same voice", "The writing survived."],
      [
        "Event pages that will not become the company system",
        "A moment, not a platform.",
      ],
      ["Handover of the account", "Yours."],
    ],
    [
      [
        "Is Wix ever the right long-term home?",
        "Rarely for the products we like to ship. It can be the right first home. We will write the date you should leave.",
      ],
      [
        "Can we do a store?",
        "Simple, maybe. Under paid traffic, we will push for Shopify or a stack you own.",
      ],
      ["Who owns it?", "You do."],
      [
        "Will you retain a Wix site?",
        "For content, sometimes. For a product, we would rather move.",
      ],
    ],
  ),
  shopify: seed(
    "commerce",
    "Ecommerce catalogues and checkout you can actually run.",
    "Shopify is a fit when the store is the product. A theme you cannot trust is expensive. We either build a Hydrogen or Next.js storefront, or we discipline a theme so paid traffic lands on something fast. Catalogue and checkout first. Then the pages ads hit. Performance is part of the build, not a later audit.",
    "You click a product page and a checkout path first. Then we build. The back office stays somewhere a merchandiser can work. The storefront is ours. Keys and the shop are yours. A prototype of add to cart happens before the rest of the spend.",
    "If the campaign spends and the page melts, we were not finished.",
    [
      [
        "Headless storefronts you own",
        "Catalogue in Shopify. Storefront on a repository you own.",
      ],
      [
        "Paid landers that match the product",
        "Same type, same cart. Not a cousin theme.",
      ],
      [
        "Checkout that still looks like the brand",
        "Pay is a step in the layout, not a bounce into a different company.",
      ],
      ["A catalogue the team can edit", "Price and copy without a developer."],
      ["Speed budgets before ads", "Images and scripts named in the brief."],
    ],
    [
      [
        "Hydrogen, Next.js, or a theme?",
        "Headless when you need the front owned. A disciplined theme when the brief is smaller. We will not sell headless as a fashion.",
      ],
      [
        "Stripe as well?",
        "Shopify Payments or Stripe depending on the shop. The pay path is designed either way.",
      ],
      ["Who owns the store?", "You do. We are not the merchant of record."],
      [
        "Can we start with a theme and go headless later?",
        "Yes, if the catalogue and the writing are clean. We plan that so you do not pay twice for the same mess.",
      ],
    ],
  ),
  figma: seed(
    "design",
    "The file we design the system in.",
    "Figma is not a deck of pictures. It is tokens, screens, and a handoff the build can follow. If the file cannot produce a tenth page, it is not a system. We set type, colour, and components first, then we paint the journeys. Discovery, then wireframes, then UI. The prototype you click is either Figma or the real Next.js preview. The rest of the budget waits.",
    "Tokens compile into CSS and Tailwind. States are in the file so engineering does not guess hover from memory. The file is part of the handover, not a private board. A new template is already a component. We only write the copy.",
    "If the code and the file disagree on a name, the system forked. We treat that as a defect.",
    [
      [
        "Files that survive page ten",
        "The new template was already a component.",
      ],
      [
        "Prototypes you can refuse",
        "You click the flows. Visual design waits until the structure holds.",
      ],
      [
        "Tokens that reach production",
        "CSS variables match the file. The brand does not fork in code.",
      ],
      [
        "Handoff with states",
        "Empty, error, hover, disabled. Not a treasure hunt.",
      ],
      [
        "Product and marketing in one scale",
        "Paid traffic lands on the same type as the app.",
      ],
    ],
    [
      [
        "Do we have to buy Figma seats?",
        "You should own the file. We will not keep the only source of truth in a studio team.",
      ],
      [
        "Dev Mode?",
        "When it helps the handoff. Names still have to match the repo.",
      ],
      [
        "What if we already have a messy file?",
        "We start a system file. We do not decorate the mess and call it a library.",
      ],
      [
        "Is Figma the prototype?",
        "For structure, often. For a product people log into, we prefer a Next.js preview as soon as it exists.",
      ],
    ],
  ),
  notion: seed(
    "design",
    "The brief and the notes, not the product.",
    "A Notion page is a good workshop. It is a poor long-term website. We say which one you are buying, and we do not leave you with a public Notion theme as a brand. Workshops and IA can live in Notion if that helps. Production content lives in a CMS with types. Optional sync when the team will not leave Notion yet.",
    "The brief should not live in email. Notion can hold the IA. The site is still Next.js. When docs outgrow Notion, we move the pages into a typed CMS. Search and type improve on day one. The Notion file remains part of the repo story, not a secret.",
    "If the public site is a Notion export, we have not designed a site.",
    [
      [
        "Discovery the whole team can comment on",
        "IA in Notion. Product on the web.",
      ],
      [
        "Temporary publish while we build",
        "A holding docs surface. Dated. Honest.",
      ],
      [
        "A later CMS that keeps the writing",
        "Drop the lock-in. Keep the words.",
      ],
      [
        "Handover with decisions still visible",
        "The Notion file is part of the story.",
      ],
      [
        "Internal wikis that stay internal",
        "We will not brand a wiki as the company site.",
      ],
    ],
    [
      [
        "Can you make our Notion look like the brand?",
        "A little. It will still be Notion. For a real site, we build a real site.",
      ],
      [
        "Will you sync Notion to Next.js?",
        "When the team will not leave yet. Types still exist. Notion is the editor, not the design system.",
      ],
      ["Who owns the workspace?", "You do."],
      [
        "Is Notion the CMS?",
        "Only as a bridge. A typed CMS is the destination for anything public and lasting.",
      ],
    ],
  ),
  linear: seed(
    "design",
    "The board we use so the build stays visible.",
    "You should be able to see what is in flight. Linear is how we keep a project from becoming a folklore of Slack threads. Issues, cycles, and a changelog you can read. We run the work in Linear, or in the tracker you already pay for, with the same rule: the prototype is the source of truth.",
    "A short backlog from the brief. Cycles that match the prototype and the build. You are on the workspace. After launch, bugs and copy changes are issues, not emails. A retainer matches the board. A launch leftover list is visible. Nothing important lives only in someone's head.",
    "If the invoice and the board disagree, the board is behind, or the invoice is. We fix that.",
    [
      [
        "Builds you can watch without asking",
        "The board is shared. Status is not a meeting.",
      ],
      [
        "Retainers that do not hide in email",
        "Each change is an issue. The invoice matches.",
      ],
      [
        "Launches with leftover work you can see",
        "No surprise list a month later.",
      ],
      [
        "Bugs next to the preview URL",
        "The issue links the thing you can click.",
      ],
      ["Handover of the workspace", "Open issues come with the repo."],
    ],
    [
      [
        "We use Jira.",
        "We will use Jira. Linear is a preference, not a religion. Visibility is the requirement.",
      ],
      [
        "Do we have to join Linear?",
        "You should see the work. A weekly PDF is not the same thing.",
      ],
      [
        "Who owns the workspace?",
        "You do, or a shared workspace you can take.",
      ],
      [
        "How does this relate to GitHub?",
        "Issues can live in Linear. Code lives in GitHub. Previews link both.",
      ],
    ],
  ),
  stripe: seed(
    "commerce",
    "Payments for SaaS and checkout, wired into the product.",
    "Money is a journey. Stripe is billing and pay flows as part of the interface, not a plugin on the side. We prototype the upgrade, the receipt, the failed-card path, and cancel before we write a webhook. The rest of the budget waits until that path is something you would use. Checkout or Billing against your Stripe account. Customer portal when the brief needs self-serve.",
    "Webhooks in the repo. The Stripe account is yours. We do not sit in the middle of the money. Plans you can explain. Receipts that look like the brand. Failed payments that do not look like a third product.",
    "If you would not click pay on the prototype, we should not be writing the webhook yet.",
    [
      [
        "SaaS subscriptions you can explain",
        "You clicked upgrade, fail, and cancel on the prototype. Webhooks came after.",
      ],
      [
        "One-off checkout on a site",
        "Pay is a step in the layout, not a redirect into a different brand.",
      ],
      [
        "Failed cards and receipts",
        "Designed, not leftover from a vendor email.",
      ],
      ["Keys you hold", "The Stripe account is yours."],
      [
        "Portals for self-serve billing",
        "When the brief says customers should manage plans without a ticket.",
      ],
    ],
    [
      [
        "Stripe or Shopify Payments?",
        "Stripe for SaaS and custom checkout. Shopify when the store is the product. We will not run two money stories without a reason.",
      ],
      [
        "Who is the merchant of record?",
        "You are, unless the brief is a different model. We are not.",
      ],
      [
        "Is PCI our problem?",
        "Stripe takes the card. We still design the page, the copy, and the failure states.",
      ],
      [
        "Can we start without billing?",
        "The prototype can fake the plan page. Production money waits until you have used that page.",
      ],
    ],
  ),
  vercel: seed(
    "host",
    "Hosting and previews for Next.js products.",
    "The point is the preview, not the logo. Vercel is how every change gets a URL you can click. Sign-off happens in the browser. Production is the same app you already used. We connect your account, your domain, and your repo. Nothing is rented back through a studio login. Env values in the project you control. Rollback is a click. The runbook says so.",
    "Company sites and SaaS on the App Router. Edge and server rendering without a second ops team. A stakeholder who has never opened git can still refuse a URL. DNS was yours. The certificate followed.",
    "If production is a different app from the preview, we have failed the launch.",
    [
      [
        "Sign-off on a URL",
        "No deck. They used the preview. Then we shipped that.",
      ],
      [
        "Domains that never sat in our account",
        "DNS yours. Certificate follows.",
      ],
      ["Rollback without us", "Previous deploy is a click."],
      [
        "Preview on every pull request",
        "The board links the thing you can click.",
      ],
      [
        "Env you can rotate",
        "Secrets in your project. A new hire does not need a chat log.",
      ],
    ],
    [
      [
        "Must we use Vercel?",
        "It is the default for Next.js previews. Azure, Netlify, or others when the estate requires it. Previews are the requirement.",
      ],
      ["Who owns the Vercel team?", "You do. We are a member, then we leave."],
      [
        "What about spend?",
        "We keep the project quiet. Preview spam and unused projects are a review item.",
      ],
      [
        "Can we self-host?",
        "Yes, if you accept the preview story you will actually get. We will not pretend a VPS is the same ritual.",
      ],
    ],
  ),
  netlify: seed(
    "host",
    "Previews and hosting when that is already the house.",
    "We do not move hosts for a logo. If Netlify is where the domain and the forms already live, we deploy there and we keep the repo yours. Preview URLs, env in your project, functions only when the page needs them. A handover that includes the account, not a studio seat. A later move to Vercel if the product becomes a Next.js app that wants it.",
    "Marketing sites with a preview on every change. Forms that no longer email a personal inbox. Brand teams who comment on a link. Finance does not have to open a new vendor if the old one still serves.",
    "The host is furniture. The preview is the ritual.",
    [
      [
        "Brochures that keep the old host",
        "We redesigned the site. The vendor stayed.",
      ],
      ["Forms into a CRM", "Netlify is the door, not the database."],
      ["Previews the brand team can open", "Comments happen on the page."],
      [
        "Light functions next to a static front",
        "Only when the page needs them.",
      ],
      [
        "A later hop to Vercel",
        "If the app outgrows the house. Planned, not forced.",
      ],
    ],
    [
      [
        "Netlify or Vercel?",
        "Wherever the domain and the team already are, if previews work. New Next.js products often land on Vercel. We will not move you for a sticker.",
      ],
      ["Who owns the site on Netlify?", "You do."],
      [
        "Identity and large apps?",
        "If the product is becoming a SaaS, we will say when another host is kinder.",
      ],
      [
        "Forms?",
        "Fine as a door. The record should still land in a system you own.",
      ],
    ],
  ),
  cloudflare: seed(
    "host",
    "DNS, cache, and the door in front of the product.",
    "Cloudflare is often how the domain is already run. We use it for DNS, cache, and the boring security that should not be a plugin. The site still lives in your repo. Cloudflare sits in front: names, certificates, and a cache we can purge. We do not hide the origin as a trick. Workers only when an edge step is cheaper than a server.",
    "A launch that does not wait on DNS folklore. A campaign that does not melt origin. A form that stays on your origin. The zone is yours. We write the records in the handover.",
    "The door should be boring. The product should be interesting.",
    [
      [
        "Domains and certificates you control",
        "The zone is yours. Records are in the handover.",
      ],
      ["Cache for a spend day", "Origin survives. The CMS can still publish."],
      [
        "Light edge logic",
        "When a worker is cheaper than a server. Not as a second app.",
      ],
      ["Forms on your origin", "Cloudflare is the door."],
      [
        "Preview and production names",
        "Honest hostnames. No folklore in a spreadsheet.",
      ],
    ],
    [
      [
        "Do we have to use Cloudflare?",
        "Only if it is already the door, or if cache and DNS are the brief. We will not add it for a logo.",
      ],
      [
        "Workers instead of a backend?",
        "Rarely. Workers for small edge steps. The product stays in the repo as an app.",
      ],
      ["Who owns the zone?", "You do. We will not hold DNS as leverage."],
      [
        "What about orange-cloud surprises?",
        "Cache rules match the CMS. We document what is cached and how to purge.",
      ],
    ],
  ),
  supabase: seed(
    "data",
    "Auth, database, and storage without a lock-in host.",
    "A product should not hide its records. Supabase is Postgres you can see, plus auth and storage. We use it so the prototype is already on the real data layer, and so you keep the keys. We design the schema, the policies, and the CMS your team can publish from, on a project in your name. Types generated into the Next.js app.",
    "Postgres first. Auth when the product needs accounts. Storage for the files that belong to a row. You click the product. The tables are already the ones we would keep. A tenth page does not need a developer. Keys you can rotate. We leave.",
    "If you cannot open the table, you do not own the product.",
    [
      [
        "Prototypes on the real schema",
        "The clickable product is the product.",
      ],
      [
        "A CMS on tables you can query",
        "Publish without us. Postgres underneath.",
      ],
      [
        "SaaS tenants with policies",
        "Row rules in the database, not only in the UI.",
      ],
      ["Storage that belongs to a row", "Uploads in your project."],
      ["Keys you can rotate", "The project is yours."],
    ],
    [
      [
        "Supabase or Firebase?",
        "Supabase when you want Postgres you can export. Firebase when a trial needs auth this week and you accept the exit plan.",
      ],
      [
        "Do we have to use their auth?",
        "No. Clerk or Auth0 can sit in front. The records still want Postgres.",
      ],
      [
        "Who owns the project?",
        "You do. We will not keep production in a studio org.",
      ],
      [
        "Self-host?",
        "If the brief requires it. Hosted Supabase is fine when you still hold the keys and a dump.",
      ],
    ],
  ),
  github: seed(
    "host",
    "The repository is the product you take home.",
    "If you cannot clone the repo, you do not own the work. GitHub is where the site lives. Pull requests, previews, and a history you can audit. We do not keep the real copy on a studio machine. We open the project in your organisation, with the actions and the environments named. Reviews on the pull request. Preview URLs from the host you chose. Issues in GitHub or Linear, not in a private Slack.",
    "One repo for the app. A client who merged the first copy change. A history that explained a bug. Org, not a freelance account. Access is a seat, not a favour. The handover is a transfer of the repo, not a ZIP.",
    "A zip file is not a product. A repository is.",
    [
      [
        "Every site and product we ship",
        "The source of truth is git in your org.",
      ],
      [
        "Actions for checks and deploys",
        "You can read them. They run without us.",
      ],
      [
        "A first copy change merged by the client",
        "They opened a pull request. The preview proved it.",
      ],
      [
        "History that explains a bug",
        "The commit is there. Nobody has to remember a Friday call.",
      ],
      ["Handover as a transfer", "Seats and the board, not a zip."],
    ],
    [
      [
        "We use GitLab.",
        "We will use GitLab. GitHub is a default, not a religion. A repo you own is the requirement.",
      ],
      ["Can we keep it private?", "Yes. Private in your org. That is normal."],
      [
        "Do you force GitHub Flow?",
        "Short pull requests, previews, reviews. We will not invent a ceremony the team cannot keep.",
      ],
      [
        "What about design files?",
        "Figma is the system file. The repo holds the code. Links both ways.",
      ],
    ],
  ),
  docker: seed(
    "data",
    "The same app on a laptop and on the server.",
    "Docker is how we stop the phrase it works on my machine. We use it when the product has more than a static host, and we keep the file in the repo. A compose file is part of the handover. Your team should be able to run the stack without a call. Production can be the same image or a host that already understands the app. A small set of services: the app, the database, the worker. No zoo. Docs that start with one command.",
    "A new hire who ran the product on day one. A worker that used to be a mystery cron. A host change that did not become a rewrite. The container is the contract.",
    "If compose needs a meeting, it is not a handover yet.",
    [
      ["SaaS that needs Postgres beside the app", "Clone, compose, click."],
      [
        "Local prototypes that match production",
        "The demo is not a different shape.",
      ],
      ["Deploys onto a VPS you already pay for", "The image is the contract."],
      [
        "Workers that used to be folklore",
        "The same image locally and on the server.",
      ],
      ["A README that is four lines", "The test of the file."],
    ],
    [
      [
        "Do brochure sites need Docker?",
        "No. Docker when there is a database, a worker, or a host that expects an image.",
      ],
      [
        "Kubernetes?",
        "Only if you already run it. We will not invent a cluster for a marketing site.",
      ],
      [
        "Who maintains the images?",
        "The repo does. Pins, not latest. You can build without us.",
      ],
      [
        "Windows?",
        "The team can use the same compose. We will not require a studio Mac to run the product.",
      ],
    ],
  ),
  clerk: seed(
    "auth",
    "Accounts and session handling for SaaS.",
    "Auth is easy to underestimate. Clerk is sign-in that does not become a side project. We use it when the product needs users this month, and we keep the rest of the data in a database you own. Your Clerk application. Our interface around it. User records mirrored into Postgres when the product needs more than a profile. A first-run that does not dump people in a blank app.",
    "Organisations, invites, and the ugly states. Keys you hold. A later move to another provider if the brief changes. The prototype already has real accounts. You create a user, invite a teammate, recover a lockout. Then we build the rest.",
    "Login is a door. After the door, the product still has a job.",
    [
      [
        "First-runs that have a task",
        "After Clerk, the product asks for one thing. Retention starts there.",
      ],
      [
        "Invites that match the company",
        "Organisations in Clerk, data in Postgres. One language in the UI.",
      ],
      [
        "Keys you hold",
        "The Clerk app is yours. We are not the identity vendor.",
      ],
      [
        "Prototypes with real accounts",
        "You click the journeys before the rest of the spend.",
      ],
      [
        "A path off Clerk",
        "If the brief changes. The UI should not care which vendor sits behind the door.",
      ],
    ],
    [
      [
        "Clerk or Auth0?",
        "Clerk when we want hosted UI and Next.js helpers this month. Auth0 when SSO and an existing tenancy are the brief.",
      ],
      [
        "Clerk or Supabase Auth?",
        "Supabase when the rest of the data is already there and simple. Clerk when organisations and hosted components save time.",
      ],
      [
        "Who owns the users?",
        "You do. Export and the application sit in your project.",
      ],
      [
        "Can we skip social logins?",
        "Yes. Email is enough if that is the audience. We will not add Google for a sticker.",
      ],
    ],
  ),
  auth0: seed(
    "auth",
    "Enterprise identity when the directory is already elsewhere.",
    "We do not pick Auth0 for a two-user prototype. We pick it when the identity story is bigger than a form: SAML, social, and a team that already pays for it. Your tenant. Our Next.js app. Roles that map to the product, not to a dump of claims. A portal that used the work login. A SaaS that had to offer both Google and SAML. One box. The rest of the app did not care which connection won.",
    "SSO for a client portal or an internal tool. Handover of the tenant, not a studio application. Claims mapped to screens. Nobody saw an admin they should not.",
    "A fourth password is a product failure when the work login already exists.",
    [
      [
        "Work login on a portal",
        "Staff do not get a fourth password. Auth0 talks to the directory.",
      ],
      [
        "Google and SAML in one box",
        "The app does not care which connection won.",
      ],
      ["Roles that mean screens", "Claims map to the UI."],
      ["Tenants you own", "Handover of the Auth0 tenant, not a studio app."],
      [
        "Internal tools beside Entra",
        "When Microsoft is the directory and Auth0 is already the broker.",
      ],
    ],
    [
      [
        "Is Auth0 overkill?",
        "For a two-user trial, yes. Use Clerk or Supabase. For SSO and an enterprise directory, Auth0 is often already in the building.",
      ],
      [
        "Can we use Entra only?",
        "Yes, if that is the tenancy. Auth0 is for when you need a broker or you already have it.",
      ],
      ["Who owns the tenant?", "You do."],
      [
        "Will the UI look like Auth0?",
        "The hosted lock can be skinned. We still design the first-run after the door.",
      ],
    ],
  ),
  mapbox: seed(
    "maps",
    "Maps and location in the product, on a style you can own.",
    "A map is a component. We design the search, the pin, and the empty state, then we pick Mapbox or Google Maps for the engine. Mapbox is for store finders and maps that have to look like the rest of the site. We style them, we budget them, and we keep the page in charge. Custom style when the brand needs it. Vector tiles with a load budget. Fallbacks when a key is missing.",
    "A locator that used the same greys as the site. A jobs board where the list leads and the map follows. A lander that still passed its weight budget because the map waited for a click. Tokens in your project. Usage is your bill.",
    "If the map looks like a default demo, we have not designed it yet.",
    [
      [
        "Locators that look like the brand",
        "The map uses the same greys. It does not look like a tutorial.",
      ],
      ["Operations maps", "Dispatchers filter in the list. The map follows."],
      ["Landers with a budget", "The map waits. The offer does not."],
      ["Coverage stories", "Honest shapes, not a 3D globe."],
      ["CMS-editable places", "A new site does not need a developer."],
    ],
    [
      [
        "Mapbox or Google Maps?",
        "Mapbox when style is the brief. Google when Places and hours matter. You will see the choice in the prototype if it is open.",
      ],
      [
        "Will it be slow?",
        "Not if we load it on purpose and keep the style lean. A 4MB widget is a defect.",
      ],
      [
        "Who pays for tiles?",
        "You do, on your token. We budget usage in the notes.",
      ],
      [
        "Offline?",
        "Only if the brief is a field app. The web map is a component, not a GIS suite.",
      ],
    ],
  ),
  resend: seed(
    "host",
    "Transactional mail that looks like the product.",
    "Email is an interface. Resend is how we send the messages the product owes people: the receipt, the invite, the reset. The template is designed, not leftover from a vendor. We write the subject, the body, and the one button, in the same type as the site, from a domain you authenticate. Your domain, your Resend project. Templates in the repo. Events that the product can show as a log.",
    "A receipt that still looked like the brand. An invite that opened the right first-run. DNS you can see. SPF and DKIM in the handover. Deliverability is not a mystery.",
    "If people wonder who emailed them, the template failed, or the domain did.",
    [
      [
        "Receipts that match the site",
        "Type and colour. People know who sent it.",
      ],
      [
        "Invites that land on the first-run we designed",
        "Not on a generic dashboard.",
      ],
      [
        "Form confirmations that do not look like spam",
        "Designed, authenticated, logged.",
      ],
      ["DNS you can see", "SPF and DKIM in the handover."],
      ["Logs in the product", "Staff can see if the invite went."],
    ],
    [
      [
        "Resend or the host's mail?",
        "Resend when the mail is part of the product. A host form email is a door, not a brand.",
      ],
      [
        "Who owns the domain auth?",
        "You do. We will not send production mail from a studio domain.",
      ],
      [
        "Marketing blasts?",
        "That is a different tool. Resend here is transactional. We will not mix those lists by accident.",
      ],
      [
        "Can we design in React email?",
        "Yes. Templates live in the repo next to the app.",
      ],
    ],
  ),
};
