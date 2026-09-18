export type ProductStance = {
  willDo: string[];
  refuse: string[];
};

function stance(willDo: string[], refuse: string[]): ProductStance {
  return { willDo, refuse };
}

const PRODUCT_STANCES: Record<string, ProductStance> = {
  google: stance(
    [
      "Pick the one or two Google APIs that remove friction: sign-in, a map, a measurement plan.",
      "Keep the rest of the product on a repository you own, not inside a Google skin.",
      "Put the Cloud project, the Analytics property, and the keys in your organisation.",
    ],
    [
      "Wrapping the whole site in Google chrome because the brand already uses Gmail.",
      "Turning on every API in the catalogue so the architecture diagram looks busy.",
      "A studio-owned Google property as the live one.",
    ],
  ),
  "google-cloud": stance(
    [
      "Host on the Google Cloud account you already pay for, with the smallest set of services that match the brief.",
      "Give you preview, staging, and production you can promote without a call.",
      "Hand over IAM, env, and a runbook that names every line on the invoice.",
    ],
    [
      "A rewrite onto Google Cloud because a slide said multi-cloud.",
      "Services on the bill that nobody in the room can explain.",
      "A studio project sitting between you and production.",
    ],
  ),
  "google-maps": stance(
    [
      "Build the locator as a journey: search, pin, list, and a map that matches the type.",
      "Budget the tile load so the offer is not waiting on a widget.",
      "Keep the key in your project, with a list that still works if the map is slow.",
    ],
    [
      "A default demo map dumped in a sidebar.",
      "A 4MB embed on a lander.",
      "A studio token on a live site.",
    ],
  ),
  gemini: stance(
    [
      "Put Gemini on a named step: draft, summarise, classify, not on the homepage as a chat toy.",
      "Keep prompts, limits, and logs in a project you own.",
      "Leave a fallback so the product still submits when the model is down.",
    ],
    [
      "A chat window because the brief mentioned AI.",
      "Answers with no source the user can open.",
      "A product that dies when Gemini is slow.",
    ],
  ),
  youtube: stance(
    [
      "Embed the film as a chapter on the page, with a layout that still reads if the player is blocked.",
      "Keep Core Web Vitals and cookies part of the build, not an afterthought.",
      "Put the channel and the CMS field in your name so marketing can swap a cut.",
    ],
    [
      "A raw share code that brings layout jumps and a stranger's recommended sidebar.",
      "Autoplay on a brochure site.",
      "Building a fake YouTube instead of using the one people already have.",
    ],
  ),
  openai: stance(
    [
      "Wire the API to a step that already exists in the work: a draft, a summary, a classification.",
      "Keep keys, prompts, and a spend cap in your project.",
      "Put a person in the loop so nothing goes out unreviewed.",
    ],
    [
      "A chatbot skin of ChatGPT on a company homepage.",
      "Sending customer data to a consumer account you do not control.",
      "A product that cannot save or send when OpenAI is down.",
    ],
  ),
  chrome: stance(
    [
      "Test and ship against the Chrome your users actually have, including the last couple of versions.",
      "Use DevTools and Lighthouse as part of sign-off, not as a slide after launch.",
      "Keep Safari and Firefox in the pass. Chrome gets the first honest look.",
    ],
    [
      "A site that only works in a designer's nightly.",
      "Shipping a 4MB lander and calling it done because it painted in Chrome once.",
      "Ignoring WebView and Chromium shells where a share of the audience actually lives.",
    ],
  ),
  firebase: stance(
    [
      "Use Firebase to get auth, a live collection, and a prototype people can click this week.",
      "Keep an export path so Firestore is not a trap if the product lasts.",
      "Put the Google Cloud project in your name from day one.",
    ],
    [
      "Treating Firestore as a database you will still want in five years without saying so.",
      "A prototype on fake data that has to be rebuilt to ship.",
      "A studio-owned Firebase instance as leverage.",
    ],
  ),
  microsoft: stance(
    [
      "Take the work login, the documents, or the Azure tenancy that already exists, and put a web interface on the job.",
      "Sign staff in with Entra when that is the account they already have.",
      "Leave Office and SharePoint alone unless the brief named them.",
    ],
    [
      "Rebuilding SharePoint as a personality project.",
      "A fourth password when the Microsoft login already exists.",
      "A product that ignores the room where the company already works.",
    ],
  ),
  azure: stance(
    [
      "Deploy on the subscription you already own, with environments you can promote.",
      "Use Entra at the door when staff already live there.",
      "Name every service on the invoice in the handover.",
    ],
    [
      "Opening twenty Azure products to make the diagram look busy.",
      "Hosting that only we can log into.",
      "A launch that is a different app from the preview you approved.",
    ],
  ),
  aws: stance(
    [
      "Use the smallest set that matches the brief: compute, storage, the database, the one extra the job named.",
      "Keep the account, the regions, and the keys in your name.",
      "Give you a rollback you can do without calling us.",
    ],
    [
      "A rewrite onto AWS because the industry default is Amazon.",
      "A catalogue of services nobody can explain on the bill.",
      "A studio account sitting between you and production.",
    ],
  ),
  "google-analytics": stance(
    [
      "Wire events to the journeys we designed: the form, the checkout, the signup. Not a dump of every click.",
      "Put the property in your Google account, with consent as part of the build.",
      "Say what the numbers cannot tell you, so marketing does not treat a sample as a census.",
    ],
    [
      "A default tag with no events, then a meeting about why nothing converts.",
      "Ignoring consent and calling it measurement.",
      "A studio-owned property as the live one.",
    ],
  ),
  apple: stance(
    [
      "Go native when the browser cannot do the job, and keep Sign in with Apple next to Google when the audience is on iPhone.",
      "Share the API and the accounts with the site. The app is a second door, not a second product.",
      "Put certificates, the listing, and the developer account in your name.",
    ],
    [
      "A native wrapper of a site that should have stayed a site.",
      "A second identity system for the phone.",
      "Keys that only exist on a studio Mac.",
    ],
  ),
  "app-store": stance(
    [
      "Treat screenshots, privacy copy, and review notes as part of the build, not a Friday scramble.",
      "Give you a TestFlight you can hold before we talk to review.",
      "Keep the listing and the certificates in your Apple Developer account.",
    ],
    [
      "An app that works on our machine and fails review.",
      "A store listing that looks like a different company from the site.",
      "Shipping a badge for the sake of a badge.",
    ],
  ),
  xcode: stance(
    [
      "Keep the Xcode project on a repository you own, with signing in your developer account.",
      "Give you a simulator and a TestFlight build you can refuse before the rest of the spend.",
      "Match names in the project to names in the web app so the product does not fork.",
    ],
    [
      "A studio Mac as the only place the app compiles.",
      "A second domain model that only exists in Swift.",
      "Handover by screenshot of a scheme that will not archive.",
    ],
  ),
  android: stance(
    [
      "Ship Android when the brief names a reason the browser cannot cover: camera, offline, push, a store listing.",
      "Share the API and the accounts with the site.",
      "Keep the Play listing, the signing, and the project in your name.",
    ],
    [
      "A native app when a web app would do.",
      "A second identity system for the phone.",
      "An iOS-only product that pretends half the audience can use the desktop site.",
    ],
  ),
  anthropic: stance(
    [
      "Put Claude on a named step, with prompts in the repo and a contract that matches how you already buy cloud.",
      "Use Bedrock or Vertex when procurement already lives there.",
      "Leave a fallback when the API is slow.",
    ],
    [
      "Swapping the homepage for a chat window because the brief mentioned AI.",
      "Answers with no source the user can open.",
      "A product that dies when Anthropic is down.",
    ],
  ),
  claude: stance(
    [
      "Call Claude from your interface, not from a tab to claude.ai.",
      "Keep the prompt, the model name, and the spend cap in your project.",
      "Review in the UI so a person still sends the thing.",
    ],
    [
      "A skin of the consumer chat as the product.",
      "Long documents pasted into a box with no record of what was sent.",
      "Assist with no off switch.",
    ],
  ),
  typescript: stance(
    [
      "Write the interface and the API in TypeScript so a rename is one change, not a hunt.",
      "Share types with the CMS model so a new block cannot publish broken.",
      "Hand over a repo a new hire can run without a call.",
    ],
    [
      "A rewrite into TypeScript because it looks modern.",
      "A type system that is any with extra steps.",
      "Types that only exist on a laptop we keep.",
    ],
  ),
  dotnet: stance(
    [
      "Keep the domain in .NET when that is the language the company already staffs.",
      "Put a web surface on it with a contract both rooms can read.",
      "Deploy on the Azure tenancy you already have, or say why not.",
    ],
    [
      "A rewrite off C# for fashion.",
      "A front end that pretends the API is not there.",
      "A handover without an OpenAPI spec or a shared type.",
    ],
  ),
  javascript: stance(
    [
      "Write the client carefully, type it when we can, and keep the bundle small enough for the job.",
      "Use the language the browser already speaks instead of a theatre of other runtimes.",
      "Measure the page on a mid phone, not only on a designer's laptop.",
    ],
    [
      "A novel of JavaScript to do a button's job.",
      "A framework for a page that should have been HTML.",
      "Shipping untyped production code on a product that has to last.",
    ],
  ),
  python: stance(
    [
      "Use Python for the service, the job, or the model that sits behind the site.",
      "Keep the pixels in TypeScript when that is the honest split.",
      "Put the code on a repository you own, with a run that matches production closely enough.",
    ],
    [
      "A Python rewrite of a healthy Node or .NET estate for taste.",
      "A notebook that never becomes a product, invoiced as if it had.",
      "A model in the interface with no fallback when the worker is down.",
    ],
  ),
  html5: stance(
    [
      "Write semantic pages: headings that match the outline, buttons that are buttons, forms a screen reader can finish.",
      "Keep the document honest even when React is generating it.",
      "Treat markup as the product search and accessibility actually read.",
    ],
    [
      "A canvas of divs called a site.",
      "A heading rank that exists for the look, not the outline.",
      "Shipping a page that only makes sense with the CSS turned on.",
    ],
  ),
  css: stance(
    [
      "Set a small system of type, space, and colour, then reuse it on a tenth page.",
      "Budget motion and images so a lander does not hide 4MB of decoration.",
      "Match the names in the CSS to the names in the Figma file.",
    ],
    [
      "A landfill of one-off classes nobody can edit.",
      "A brand that only lives in Figma.",
      "Contrast and measure treated as polish for later.",
    ],
  ),
  swift: stance(
    [
      "Write Swift when the brief needs the device, not a wrapper of the site.",
      "Share the API and the accounts with the web product.",
      "Keep the Xcode project and the signing in your developer account.",
    ],
    [
      "A native app when a web app would do.",
      "A second identity system for the phone.",
      "A domain model that only exists in Swift.",
    ],
  ),
  kotlin: stance(
    [
      "Write Kotlin when Android is in the brief, with Compose where it earns it.",
      "Share the API with the site so the phone is a second door.",
      "Keep Play signing and the project in your name.",
    ],
    [
      "An Android app as a port of iOS with no reason in the brief.",
      "A second domain model for the phone.",
      "Java-only new modules because the old ones were Java.",
    ],
  ),
  go: stance(
    [
      "Use Go for the service that has to be small, fast to deploy, and readable six months later.",
      "Keep the interface in the web stack the team already ships.",
      "Put the module on a repository you own, with a Dockerfile that runs everywhere.",
    ],
    [
      "Go for a page that should have been HTML.",
      "A rewrite of a healthy Node API for fashion.",
      "A service that only builds on a machine we keep.",
    ],
  ),
  react: stance(
    [
      "Build in React when the interface has states, not only pages.",
      "Keep the tree small. Fetch what the screen needs.",
      "Share components with the next page so the tenth one still belongs.",
    ],
    [
      "React for a brochure that should have been a document.",
      "Fetching the world to render a heading.",
      "A rewrite off React without a reason in the brief.",
    ],
  ),
  "next-js": stance(
    [
      "Ship the site or the product as a Next.js app on a repository you own.",
      "Give you a preview URL for every change, which is how sign-off works here.",
      "Put hosting, env, and DNS in your name. Next is how we ship, not how we keep you.",
    ],
    [
      "A starter theme dressed as a product.",
      "A rewrite off Next.js without a reason in the brief.",
      "A CMS that still needs us for a copy change.",
    ],
  ),
  "node-js": stance(
    [
      "Run Node where the product already does: the API, the build, the preview.",
      "Pin the version and keep the run in the repo.",
      "Put business-critical work in the language the keepers can staff.",
    ],
    [
      "Node for a ledger that should not live in a process because the UI is JavaScript.",
      "An unpinned runtime that drifts between laptop and production.",
      "A rewrite onto Node because hiring is easy, with no other reason.",
    ],
  ),
  tailwind: stance(
    [
      "Set tokens first, then utilities, so a tenth page is composition not a junk drawer.",
      "Keep the type scale and the space in one place the designer can read in a pull request.",
      "Ship a system, not a paste of arbitrary values from a lander.",
    ],
    [
      "A dump of magic numbers called a design system.",
      "Tailwind as a reason to skip type, contrast, and measure.",
      "A rewrite off a healthy CSS system for fashion.",
    ],
  ),
  "vue-js": stance(
    [
      "Build in Vue when that is the language the keepers already speak.",
      "Keep routing, data, and host as a real app, not a pile of widgets.",
      "Hand over a repo a Vue hire can open on Monday.",
    ],
    [
      "A rewrite of a healthy Vue app into React for taste.",
      "Vue as a splash of interactivity on a page that needed a system.",
      "A handover with no module map and no types.",
    ],
  ),
  nuxt: stance(
    [
      "Use Nuxt when Vue is the right UI and the site has to paint HTML first.",
      "Give you previews and a host you own.",
      "Keep content in a CMS the team can actually fill.",
    ],
    [
      "Nuxt as a personality when the rest of the company is React.",
      "A starter theme dressed as a product.",
      "A CMS that still needs us for a copy change.",
    ],
  ),
  svelte: stance(
    [
      "Use Svelte when the brief wants a small client and the team can keep it.",
      "Keep newsroom graphics and tight marketing from paying a React tax they did not ask for.",
      "Hand over a SvelteKit app on a repository you own.",
    ],
    [
      "Svelte as a personality when the rest of the company is React.",
      "A rewrite off a healthy React app for fashion.",
      "A bundle that is small in the slide and large in the network panel.",
    ],
  ),
  postgresql: stance(
    [
      "Name tables after the work. Migrations live in the repo. The instance is yours.",
      "Prototype against the real model, not a fake layer for a demo.",
      "Write policies, backups, and a restore you can actually run.",
    ],
    [
      "A black-box database you cannot export.",
      "A prototype on fake data that has to be rebuilt.",
      "A studio-owned instance of Postgres as leverage.",
    ],
  ),
  prisma: stance(
    [
      "Keep the schema file as the contract between the app and the database.",
      "Make a field change one pull request, UI and migration together.",
      "Put Studio behind your own database, not as the source of truth.",
    ],
    [
      "An ORM that hides the tables from the people who have to keep them.",
      "Migrations that only exist on a laptop we keep.",
      "Prisma as a reason not to think about backups and policies.",
    ],
  ),
  webflow: stance(
    [
      "Stay in Webflow when the brief is a site: brand, CMS, a campaign the team can publish.",
      "Keep the class system small enough that a marketer cannot invent a thirteenth heading.",
      "Write the path off Webflow before we decorate the template.",
    ],
    [
      "A custom product story Webflow cannot ship.",
      "A class landfill nobody can edit.",
      "Silence about the ceiling until you hit it.",
    ],
  ),
  framer: stance(
    [
      "Use Framer for the site that has to look expensive quickly, with motion as the point.",
      "Keep auth, billing, and app states for a real app.",
      "Leave a note on when to leave Framer, and what to take.",
    ],
    [
      "Faking a SaaS product inside Framer.",
      "A site nobody on the team can edit without us.",
      "Motion that costs Core Web Vitals and is called brand.",
    ],
  ),
  wordpress: stance(
    [
      "Discipline the theme and the plugin list. The account is yours.",
      "Keep WordPress as an editor when that is honest, with a modern front if the public site needs one.",
      "Say when it is time to stop adding plugins and start a real app.",
    ],
    [
      "A plugin for every problem until nobody can update it.",
      "A custom product story PHP templates cannot ship.",
      "A studio-owned WordPress as the live site.",
    ],
  ),
  squarespace: stance(
    [
      "Take the brief if it is a brochure, a menu, a small shop the owner can edit on a phone.",
      "Restyle the template so it looks like the company, not like Squarespace.",
      "Say no if the brief is a product Squarespace cannot carry.",
    ],
    [
      "A custom app story on a builder that cannot ship it.",
      "Silence about the ceiling until ads turn on and the site melts.",
      "A studio login as the only way to change a price.",
    ],
  ),
  wix: stance(
    [
      "Use Wix only when the brief is honest about the ceiling: a first site, an event, a local page.",
      "Keep the account in your name.",
      "Leave when the company needs a system.",
    ],
    [
      "Dressing a Wix site as a custom product.",
      "A builder maze nobody can edit.",
      "Pretending Velo is a substitute for a repository you own.",
    ],
  ),
  shopify: stance(
    [
      "Design the storefront as a system: product, cart, checkout, and the lander that paid traffic hits.",
      "Budget images and scripts for a spend day.",
      "Hand over the shop, the domain, and the payments account.",
    ],
    [
      "A theme you cannot trust when ads turn on.",
      "A checkout that looks like a third company.",
      "A store we still have to log into for a price change.",
    ],
  ),
  figma: stance(
    [
      "Set tokens before screens. Names in the file match names in the repo.",
      "Draw the ugly states: empty, error, loading, the tenth page.",
      "Hand over the file, not a private board.",
    ],
    [
      "A deck of pictures with no system.",
      "A file that cannot produce a tenth page.",
      "Handoff by screenshot in a chat.",
    ],
  ),
  notion: stance(
    [
      "Write into Notion when the team already lives there: specs, handbooks, calendars.",
      "Use the API only with a pipeline you can restore if a page is archived.",
      "Keep production data in a real database.",
    ],
    [
      "Pinning a live site to a Notion page someone can delete.",
      "Using Notion as the application database.",
      "A wiki nobody owns and a product that depends on it.",
    ],
  ),
  linear: stance(
    [
      "Work from Linear when the client already does: cycles, issues, the pull request on the same card.",
      "Keep the board in your workspace.",
      "Leave a Jira shop on Jira unless they asked to move.",
    ],
    [
      "Forcing a programme office onto Linear as a personality.",
      "A board we own as the source of truth.",
      "Tracking that is a screenshot of a sprint in a deck.",
    ],
  ),
  stripe: stance(
    [
      "Put pay in the path we designed. Failed card, 3-D Secure, and refund are part of the interface.",
      "Treat the webhook as the source of truth for paid, not the thank-you page.",
      "Keep the Stripe account and the keys in your name.",
    ],
    [
      "A checkout that looks like a third company.",
      "Trusting the client to say the payment worked.",
      "A studio-owned Stripe account on a live product.",
    ],
  ),
  vercel: stance(
    [
      "Connect a project you own. Every pull request gets a URL a founder can click.",
      "Promote the preview you approved. Production is that app, not a mysterious rebuild.",
      "Leave DNS, certificates, and secrets in your account.",
    ],
    [
      "Hosting that only we can log into.",
      "A launch that is a different app from the preview.",
      "A domain parked in a studio registrar.",
    ],
  ),
  netlify: stance(
    [
      "Use Netlify when the site already belongs there, with previews on every branch.",
      "Keep the project and the domain in your account.",
      "Put larger data somewhere else, on purpose.",
    ],
    [
      "Hosting that only we can log into.",
      "A launch that is a different build from the preview.",
      "A domain parked in a studio registrar.",
    ],
  ),
  cloudflare: stance(
    [
      "Put Cloudflare in front when the brief names performance or abuse.",
      "Keep the zone, the DNS, and the tokens in your name.",
      "Cache what should be cached. Leave the rest to the origin.",
    ],
    [
      "A studio-owned DNS record as the live one.",
      "Workers as theatre: deployed, unused, invoiced.",
      "A WAF that blocks the customer and nobody on the team can open.",
    ],
  ),
  supabase: stance(
    [
      "Keep the project in your org. Migrations in the repo. Policies you can read.",
      "Use Postgres as the source of truth, with auth and storage as the doors.",
      "Prototype on the real schema, not a fake layer for a demo.",
    ],
    [
      "A studio-owned instance as leverage.",
      "Treating Supabase as Firebase with no schema.",
      "A prototype on fake data that has to be rebuilt.",
    ],
  ),
  github: stance(
    [
      "Build on a repository you own. Actions documented. Reviews in the pull request.",
      "Keep the org, the packages, and the protection rules in your name.",
      "Ship from git, not from a zip on a studio machine.",
    ],
    [
      "The source of truth on a studio account.",
      "A repo nobody can run after handover.",
      "CI that only exists in a screenshot of a green tick.",
    ],
  ),
  docker: stance(
    [
      "Keep Dockerfiles in the repo so local, preview, and production start the same way.",
      "Make onboarding 'install Docker', not 'install our folklore'.",
      "Build the image in CI. Run that image.",
    ],
    [
      "A snowflake machine as the only place the build works.",
      "Compose files that only run on a laptop we keep.",
      "Containers as a slide, with a manual deploy on Friday.",
    ],
  ),
  clerk: stance(
    [
      "Use Clerk as the door: sign-in, orgs, MFA. The house is still your database.",
      "Map roles to actual screens, including invite, lockout, and first run.",
      "Keep the Clerk application in your name.",
    ],
    [
      "A fourth password when the work login already exists.",
      "Auth as a side project after the UI is painted.",
      "A studio-owned Clerk tenant.",
    ],
  ),
  auth0: stance(
    [
      "Centralise login when several apps and an enterprise connection are the brief.",
      "Design invite, first run, lockout, and recovery as journeys, not as a hosted box.",
      "Keep the tenant in your name.",
    ],
    [
      "Auth0 for a Google button on a lander that Clerk or the platform could have done.",
      "A fourth password when Entra already exists.",
      "A studio-owned tenant as the live identity.",
    ],
  ),
  mapbox: stance(
    [
      "Style the map to the brand. Search and filters live in the interface, not only on the tiles.",
      "Budget the load. Keep a list fallback.",
      "Put the token in your project.",
    ],
    [
      "A default demo map dumped in a sidebar.",
      "A 4MB widget on a lander.",
      "A studio token on a live site.",
    ],
  ),
  resend: stance(
    [
      "Send receipts, invites, and magic links from a domain you own, with templates in the repo.",
      "Treat DNS (SPF, DKIM, DMARC) as part of the build.",
      "Keep transactional mail in your Resend project.",
    ],
    [
      "Burying product mail in a studio account.",
      "A campaign newsletter pretending to be transactional.",
      "Templates that only exist in a dashboard nobody can export.",
    ],
  ),
};

export function productStanceFor(slug: string, name: string): ProductStance {
  return (
    PRODUCT_STANCES[slug] ?? {
      willDo: [
        `Put ${name} in the build when it earns its place, with the project in your name.`,
        `Show it working on a preview before the rest of the budget unlocks.`,
        `Hand over the account, the keys, and a repo you own.`,
      ],
      refuse: [
        `A rewrite onto ${name} because a diagram looked tidy.`,
        `A studio-owned ${name} project as the live one.`,
        `${name} as theatre: installed, unused, invoiced.`,
      ],
    }
  );
}
