import { siteForLogo } from "@/data/logo-sites";
import { topicSlug } from "@/lib/topic-slug";
import type { Topic } from "@/data/topics/types";

function company(
  name: string,
  rest: Omit<Topic, "slug" | "name" | "kind" | "officialUrl"> & {
    slug?: string;
  },
): Topic {
  return {
    ...rest,
    name,
    slug: rest.slug ?? topicSlug(name),
    kind: "company",
    officialUrl: siteForLogo(name),
  };
}

export const COMPANY_TOPICS: Topic[] = [
  company("Google", {
    color: "#4285F4",
    kicker: "Platform",
    headline: "Search, accounts, and the defaults people already trust.",
    lede: "Google is often already in the room: a login, a map, a measurement plan. We use the pieces that help the product, and we leave the rest out.",
    about:
      "A company site or SaaS product should not become a Google shop. We pick the APIs that remove friction for your users, then keep the rest of the stack on a repository you own.",
    how: "Typical work is sign-in, maps, analytics events that match the journeys we designed, and search that does not dump people onto a dead page.",
    uses: [
      "Google sign-in when it is the right default, not the only option.",
      "Maps and places wired into store finders and delivery tools.",
      "Analytics events named after the journeys, not after page titles.",
    ],
    examples: [
      {
        title: "Accounts people already have",
        body: "A SaaS prototype that lets a team in with Google, then still works if they later add email or another provider.",
      },
      {
        title: "Measurement you can argue from",
        body: "Company sites where form starts, pricing views, and checkout steps are events, not a blob of pageviews.",
      },
      {
        title: "Search that lands on the right page",
        body: "Internal tools and help centres that use Google-quality search without giving up the interface.",
      },
    ],
    related: ["google-cloud", "google-maps", "google-analytics", "gemini"],
  }),
  company("Google Cloud", {
    color: "#4285F4",
    kicker: "Cloud",
    headline: "Infrastructure when the product has to live on Google.",
    lede: "Some teams already run on Google Cloud. We meet them there, or we keep the product portable so you are not paying rent on a decision you have not made yet.",
    about:
      "Cloud is a means. We use Google Cloud when it is already the house, or when a specific service is the cleanest way to ship. The application still sits in your repository.",
    how: "We design the app first, then place auth, storage, and jobs on Cloud Run, Cloud Storage, or the service that actually fits. No architecture theatre.",
    uses: [
      "Hosting and jobs for products that already live in a Google organisation.",
      "File storage and media that stay fast on the public site.",
      "Secrets and environments that your team can rotate without us.",
    ],
    examples: [
      {
        title: "A SaaS that already had a Google bill",
        body: "We kept the product on Cloud Run so finance did not have to open a second vendor, and so deploys stayed in one place.",
      },
      {
        title: "Uploads without a lock-in story",
        body: "Company tools that store documents on Cloud Storage with keys you hold, not a folder we keep.",
      },
      {
        title: "Preview before production",
        body: "Each change gets a URL you can click. The rest of the budget waits until that URL is the product you want.",
      },
    ],
    related: ["google", "firebase", "android", "aws"],
  }),
  company("Google Maps", {
    color: "#4285F4",
    kicker: "Location",
    headline: "Maps that stay part of the page, not a second product.",
    lede: "A store finder or a delivery map should load with the rest of the interface. We treat Maps as a component, with a budget, not as a widget dumped in a sidebar.",
    about:
      "Location work fails when the map is heavier than the page around it. We design the journey first: search, pin, directions, then the map that supports it.",
    how: "We use Mapbox or Google Maps depending on the brief. Either way the page owns the type, the filters, and the load budget.",
    uses: [
      "Store locators that filter by service, not just by pin.",
      "Delivery and coverage maps inside an operations tool.",
      "Places autocomplete that does not fight the rest of the form.",
    ],
    examples: [
      {
        title: "A multi-site company locator",
        body: "Hours, services, and directions on one page. The map is the last thing you notice, which is the point.",
      },
      {
        title: "Field teams without a second app",
        body: "An internal tool that plots jobs on a map the team already opens in the browser.",
      },
      {
        title: "Paid traffic that lands on a place",
        body: "Landing pages for a city or a store, with a map that does not delay the offer.",
      },
    ],
    related: ["mapbox", "google", "company-sites", "internal-tools"],
  }),
  company("Gemini", {
    color: "#8E75B2",
    kicker: "AI",
    headline: "A model in the product, not a chat bolted on the side.",
    lede: "Gemini is useful when it shortens a real task: a draft, a summary, a search across your own content. We wire it to that task and keep a human in the loop.",
    about:
      "We do not ship a chatbot because the brief mentioned AI. We find the step that wastes time, then use Gemini only there, with prompts and limits you can change.",
    how: "The model sits behind your API. Content, keys, and logs stay in your project. The interface is the product, not a Gemini skin.",
    uses: [
      "Drafting and summarising inside a CMS or an internal tool.",
      "Search across your own documents, with citations you can check.",
      "Assists on forms so a team spends less time rewriting the same note.",
    ],
    examples: [
      {
        title: "A help desk that writes the first reply",
        body: "Staff still send it. Gemini fills the blank so the queue moves, and the tone stays yours.",
      },
      {
        title: "Research that stays on your pages",
        body: "A company tool that answers from the CMS, not from the open web.",
      },
      {
        title: "A prototype you can refuse",
        body: "You click the flow before we spend the rest of the budget on model calls.",
      },
    ],
    related: ["openai", "claude", "google", "saas"],
  }),
  company("YouTube", {
    color: "#FF0000",
    kicker: "Media",
    headline: "Video that belongs on the page, not a tab people never open.",
    lede: "YouTube is how a lot of work gets explained. We embed it so the site still loads, the type still holds, and the video is a chapter, not the whole page.",
    about:
      "A marketing site should not become a YouTube channel with a header on top. We treat each film as content with a poster, a caption, and a reason to play.",
    how: "Lazy loads, privacy-aware embeds, and layouts that still work if the player is blocked. The rest of the page does not wait for YouTube.",
    uses: [
      "Product films on a company site that do not wreck Core Web Vitals.",
      "Course or explainer pages with a transcript next to the player.",
      "Case films that sit in a CMS your team can swap without a developer.",
    ],
    examples: [
      {
        title: "A launch film that does not stall the offer",
        body: "The headline and the form stay first. The film loads when someone chooses it.",
      },
      {
        title: "A library your team can publish",
        body: "Each video is a CMS entry: title, poster, chapter marks. No embed soup in the template.",
      },
      {
        title: "Training inside a tool",
        body: "An internal product that plays a short clip next to the step it explains.",
      },
    ],
    related: ["google", "company-sites", "performance"],
  }),
  company("OpenAI", {
    color: "#000000",
    kicker: "AI",
    headline: "Language models used as a tool, not as the product story.",
    lede: "OpenAI is one way to draft, classify, or retrieve. We put it behind a task your team already does, with logs and limits you can see.",
    about:
      "The product is still your site, your SaaS, or your tool. A model call is a step in a flow. If the flow does not work without it, we have designed the wrong thing.",
    how: "We prototype the interface first. Then we attach OpenAI where a first draft or a classification actually saves time, and we keep a fallback when the model is down.",
    uses: [
      "First drafts in a CMS or a support queue.",
      "Classification of tickets, leads, or content for routing.",
      "Retrieval over your own corpus, with sources the user can open.",
    ],
    examples: [
      {
        title: "A CMS that offers a draft, not a publish",
        body: "Editors keep the last word. The model fills the empty field so the page ships today.",
      },
      {
        title: "Lead routing without a new SaaS",
        body: "An internal tool that tags inbound notes and drops them in the right queue.",
      },
      {
        title: "A clickable AI flow before the spend",
        body: "You use the prototype. The remaining budget unlocks only if the assist is worth keeping.",
      },
    ],
    related: ["claude", "gemini", "saas", "internal-tools"],
  }),
  company("Chrome", {
    color: "#4285F4",
    kicker: "Browser",
    headline: "The browser most of your users will actually open.",
    lede: "We build for the web, then we check Chrome the way your customers use it: mid-range phones, a dirty cache, and a tab they already had open.",
    about:
      "Chrome is not a badge. It is the default surface. We test the journeys that make money, not a lab profile that never exists in the wild.",
    how: "Performance budgets, DevTools traces, and real-device checks sit in the same engagement as the design. Extensions and Chrome-only APIs stay optional.",
    uses: [
      "Core Web Vitals measured in Chrome, on the pages that convert.",
      "Progressive enhancement so a feature still works if an API is missing.",
      "Installable web apps only when the brief actually needs a home-screen icon.",
    ],
    examples: [
      {
        title: "A checkout that holds on a cheap Android",
        body: "We profiled it in Chrome, then cut the weight until the button was ready before the shopper was.",
      },
      {
        title: "A tool that feels installed",
        body: "An internal web app with a manifest, so the team opens it like software, not like a bookmark.",
      },
      {
        title: "No surprise on the next Chrome release",
        body: "We avoid APIs that vanish, and we keep a fallback when they do.",
      },
    ],
    related: ["android", "performance", "javascript", "next-js"],
  }),
  company("Firebase", {
    color: "#FFCA28",
    kicker: "Backend",
    headline: "A backend that can start fast, and still leave you a way out.",
    lede: "Firebase is useful for auth, messages, and an early data layer. We use it when speed matters, and we keep the door open to a database you fully own.",
    about:
      "A prototype can live on Firebase. A product that has to last should not hide its data in a place you cannot export. We draw that line in the brief.",
    how: "Auth and push are common. We keep business data in Postgres or a store you control whenever the product is more than a trial.",
    uses: [
      "Auth for a first SaaS prototype your team can click this week.",
      "Push and realtime only where the interface actually needs it.",
      "A path off Firebase so you are not rented to a console forever.",
    ],
    examples: [
      {
        title: "A trial that became a product",
        body: "We shipped auth on Firebase, then moved records to Postgres once the flows were proven.",
      },
      {
        title: "Alerts without a native app",
        body: "A field tool that pings the browser when a job changes.",
      },
      {
        title: "Keys in your project",
        body: "The Firebase project is yours. We do not keep a studio account in the middle.",
      },
    ],
    related: ["google-cloud", "supabase", "clerk", "saas"],
  }),
  company("Microsoft", {
    color: "#00A4EF",
    kicker: "Platform",
    headline: "The stack a lot of companies already pay for.",
    lede: "Microsoft is email, identity, and the office next door. We build web products that sit beside that world instead of asking a team to leave it.",
    about:
      "A new site should not ignore Entra ID, SharePoint, or the way a firm already signs in. We meet the existing tenancy, then keep the product on the web.",
    how: "SSO, Graph where it is useful, and Azure only when it is already the house. The interface stays ours, and the repository stays yours.",
    uses: [
      "Company sites and portals that sign in with the work account.",
      "Internal tools that read the calendar or the directory without a second login.",
      ".NET APIs next to a Next.js front end when that is the team you have.",
    ],
    examples: [
      {
        title: "A client portal on the work identity",
        body: "No new password. Staff and clients use the account they already have.",
      },
      {
        title: "A brochure site that still talks to the office",
        body: "Forms land in the mailbox and the CRM the team already opens.",
      },
      {
        title: "A hybrid build",
        body: "React on the surface, .NET underneath, one handover document.",
      },
    ],
    related: ["azure", "dotnet", "internal-tools", "company-sites"],
  }),
  company("Azure", {
    color: "#0078D4",
    kicker: "Cloud",
    headline: "Cloud that already lives in a Microsoft tenancy.",
    lede: "If the company is already on Azure, we deploy there. If it is not, we do not invent a reason to be. The product comes first.",
    about:
      "Azure is a place to run the thing. We use App Service, Static Web Apps, or Functions when they match the brief, and we keep secrets in a vault you control.",
    how: "The same Next.js or .NET app we would run anywhere. Pipelines you can read. Environments you can promote without a call to us.",
    uses: [
      "Hosting for products that must stay inside an existing Azure estate.",
      "Identity with Entra ID on a site or a tool.",
      "Jobs and queues for work that should not run in the request.",
    ],
    examples: [
      {
        title: "A public site on a private cloud",
        body: "Marketing on the edge, data in the subscription finance already owns.",
      },
      {
        title: "Preview URLs inside the tenancy",
        body: "Each change gets a link. Sign-off happens in the browser, not in a deck.",
      },
      {
        title: "A handover that does not need us",
        body: "Pipeline, environments, and runbooks in the repo. Domain in your name.",
      },
    ],
    related: ["microsoft", "dotnet", "github", "aws"],
  }),
  company("AWS", {
    color: "#FF9900",
    kicker: "Cloud",
    headline: "The default cloud when the product has to scale on its own terms.",
    lede: "AWS is a lot of services. We use a short list: compute, storage, email, and the bits the brief actually named. The rest stays closed.",
    about:
      "A website does not need a diagram of every AWS product. We pick the smallest set that ships, with IAM you can audit and bills you can read.",
    how: "S3, CloudFront, Lambda or a container, SES when email has to leave your domain. Infrastructure as files in the same repository as the app.",
    uses: [
      "Static and server-rendered sites that stay fast at the edge.",
      "Uploads and media with keys that belong to you.",
      "Background jobs for billing, import, and mail.",
    ],
    examples: [
      {
        title: "A storefront that does not wait on a theme host",
        body: "Catalogue on your stack, assets on S3, checkout you can change.",
      },
      {
        title: "A SaaS with a quiet bill",
        body: "We cut unused services before launch so the invoice matches the product.",
      },
      {
        title: "A prototype on the same cloud as production",
        body: "You click a preview that already talks to the real shape of the system.",
      },
    ],
    related: ["google-cloud", "azure", "docker", "saas"],
  }),
  company("Google Analytics", {
    color: "#E37400",
    kicker: "Measurement",
    headline: "Events that match the journey, not a fog of pageviews.",
    lede: "Analytics is only useful if a decision can come from it. We name events after what people do, and we keep marketing tags from owning the page.",
    about:
      "GA4 is a tool. The brief is which questions you will ask after launch. We implement those events, consent, and a way to see them before paid traffic starts.",
    how: "A small event map, agreed in the prototype. Then tagging that does not block render. Consent is part of the same work, not a plugin afterthought.",
    uses: [
      "Conversion events for forms, pricing, and checkout.",
      "Consent and tagging that still leave the page fast.",
      "A handover so your team can add an event without rewriting the site.",
    ],
    examples: [
      {
        title: "A site that finally knows why people leave",
        body: "We tracked the step before the form, not only the thank-you page.",
      },
      {
        title: "Paid landers with a clean story",
        body: "Each campaign URL maps to an event. Finance can see what the spend bought.",
      },
      {
        title: "A prototype with the events already named",
        body: "You approve the map before we wire production.",
      },
    ],
    related: ["google", "company-sites", "performance"],
  }),
  company("Apple", {
    color: "#000000",
    kicker: "Platform",
    headline: "The devices a lot of your customers will hold.",
    lede: "Apple is Safari, the App Store, and a set of expectations about polish. We build the web to hold up there, and we ship native only when the brief needs it.",
    about:
      "Most of our work is the web. When the product must live on iPhone as an app, we plan the store, the accounts, and the same design system as the site.",
    how: "Responsive interfaces first. Then Safari checks, safe areas, and payment or sign-in flows that feel native without copying a template.",
    uses: [
      "Sites and web apps that feel finished in Safari.",
      "App Store listings and companion apps when the product needs one.",
      "Design systems that share tokens between the site and iOS.",
    ],
    examples: [
      {
        title: "A company site that does not break on an iPhone notch",
        body: "Type, tap targets, and checkout checked on the device, not only in a frame.",
      },
      {
        title: "A companion app with one design file",
        body: "The web and iOS share the same tokens. The brand does not fork.",
      },
      {
        title: "Sign-in people already use",
        body: "Apple and Google as options, with email still available.",
      },
    ],
    related: ["app-store", "xcode", "swift", "android"],
  }),
  company("App Store", {
    color: "#0D96F6",
    kicker: "Distribution",
    headline: "A listing that matches the product, not a screenshot graveyard.",
    lede: "If we ship an iOS app, the store page is part of the work: copy, previews, and a privacy story that will pass review.",
    about:
      "The App Store is a gate. We plan review, accounts, and the first session before anyone opens Xcode for the tenth time.",
    how: "Web first when we can. Native when we must. The store listing is written with the same voice as the site, and the screenshots come from the real UI.",
    uses: [
      "Companion apps for a SaaS people already use in the browser.",
      "Listings, previews, and review notes as part of the handover.",
      "A shared design system so the app does not look like a second company.",
    ],
    examples: [
      {
        title: "A product that starts on the web",
        body: "The app is a later door, not the only door. Accounts work in both.",
      },
      {
        title: "Review without a surprise",
        body: "We write the privacy and sign-in story before submission week.",
      },
      {
        title: "Screens that match the live product",
        body: "Store images come from the build you already approved.",
      },
    ],
    related: ["apple", "android", "saas", "xcode"],
  }),
  company("Xcode", {
    color: "#147EFB",
    kicker: "Tooling",
    headline: "The studio we open when the product has to be native.",
    lede: "Xcode is for the cases the web cannot cover. We keep those cases few, and we keep the design system the same as the site.",
    about:
      "Most briefs do not need a native app. When they do, we work in Xcode with the same tokens, the same accounts, and a repository you own.",
    how: "Swift UI where it helps, shared API with the web, TestFlight as the prototype you can hold.",
    uses: [
      "Companion iOS apps for a product that already has a web home.",
      "TestFlight builds you can refuse before the store listing is written.",
      "Handover of certificates and the repo, not a studio account.",
    ],
    examples: [
      {
        title: "A field app that talks to the same API",
        body: "The website and the phone share one backend. Nothing is rewritten for the store.",
      },
      {
        title: "A TestFlight you can tap this week",
        body: "The remaining budget waits until the build is the one you want.",
      },
      {
        title: "One design file, two surfaces",
        body: "Figma tokens reach the iOS project so the brand does not fork.",
      },
    ],
    related: ["apple", "swift", "app-store", "figma"],
  }),
  company("Android", {
    color: "#3DDC84",
    kicker: "Platform",
    headline: "The phones most of the world actually uses.",
    lede: "Android is Chrome, cheap hardware, and a wide range of screens. We design the web for that range, and we ship a Play build only when the brief needs one.",
    about:
      "A site that only looks finished on an iPhone is not finished. We test mid-range Android as a default, then we add a native app if the work requires it.",
    how: "Responsive layouts, tap targets, and performance budgets first. Kotlin or a trusted wrapper only after the web product is something you can use.",
    uses: [
      "Company sites and SaaS that stay fast on mid-range Android.",
      "Installable web apps for teams that do not need a store listing.",
      "Companion apps when the product must live on the home screen.",
    ],
    examples: [
      {
        title: "A checkout that holds on a £150 phone",
        body: "We cut weight until the button was ready. The iPhone version stayed fast for free.",
      },
      {
        title: "A tool the team adds to the home screen",
        body: "No store review. The web app is the product.",
      },
      {
        title: "A later Play listing",
        body: "Same API, same accounts. The store is a second door.",
      },
    ],
    related: ["chrome", "kotlin", "apple", "performance"],
  }),
  company("Anthropic", {
    color: "#D4A27F",
    kicker: "AI",
    headline: "A careful model for work that has to stay accurate.",
    lede: "Anthropic is a fit when the draft has to be cautious: policy, support, or long documents. We use Claude as a step, with a person at the end of it.",
    about:
      "We pick a model for the task, not for the press release. Claude sits behind your API, on your keys, with prompts you can edit.",
    how: "The interface is yours. The model fills a field, a summary, or a retrieval answer. If it is down, the product still works.",
    uses: [
      "Long-document summaries inside an internal tool.",
      "Support drafts that stay inside a written tone of voice.",
      "Retrieval over your CMS with sources a person can open.",
    ],
    examples: [
      {
        title: "A policy assistant that cites the page",
        body: "Staff see the source. They do not paste an answer they cannot defend.",
      },
      {
        title: "A CMS that offers a careful rewrite",
        body: "Editors keep publish. Claude only fills the draft.",
      },
      {
        title: "A prototype with the model already in the flow",
        body: "You decide if the assist is worth the rest of the spend.",
      },
    ],
    related: ["claude", "openai", "gemini", "internal-tools"],
  }),
  company("Claude", {
    color: "#D4A27F",
    kicker: "AI",
    headline: "Claude as a coworker in the product, not a tab on the side.",
    lede: "We put Claude on the task a team already repeats: a first reply, a summary, a rewrite. The page around it stays the product.",
    about:
      "A chat window is rarely the brief. We embed Claude where a blank field costs time, then we keep review, logs, and a way to turn it off.",
    how: "Your keys, your prompts, your fallback. The rest of the stack is the same Next.js product we would ship without a model.",
    uses: [
      "Rewrites and summaries in a publishing workflow.",
      "First-pass answers in a client portal or a help desk.",
      "Structured extraction from notes into the fields the tool already has.",
    ],
    examples: [
      {
        title: "A portal that drafts the weekly update",
        body: "The client still reads a human. Claude writes the first version from the tickets.",
      },
      {
        title: "A research desk on your own files",
        body: "Answers come with links into the CMS, not into the open web.",
      },
      {
        title: "An assist you can switch off",
        body: "The product works on a bad API day. That is a requirement, not a hope.",
      },
    ],
    related: ["anthropic", "openai", "gemini", "saas"],
  }),
];
