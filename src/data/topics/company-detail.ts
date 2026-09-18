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

export const COMPANY_DETAIL: Record<string, TopicDetailSeed> = {
  google: seed(
    "platform",
    "The defaults people already have, used with a short list.",
    "Most briefs already contain Google in some form: a work account, a map, a tag manager property nobody fully trusts. The mistake is to treat that as a mandate to wire every Google product into the site. We treat it as a set of doors. Sign-in, maps, measurement, sometimes search. Each door has to earn a place in the journey you approved in the prototype.",
    "We start from the conversion map, not from a partner checklist. If a visitor already has a Google account, we can offer it. If the business lives on the high street, we can put maps on the locator. If paid traffic is part of the plan, we name events after the steps that make money. The rest of the product stays on a repository you own, with a CMS your team can publish from.",
    "Google should feel like furniture in the product, not like the landlord.",
    [
      [
        "Sign-in people do not have to invent",
        "A SaaS or a portal can offer Google next to email. We design the first-run after the door, so a successful login is not a blank app. Other providers can still join later without a rebuild.",
      ],
      [
        "Maps that belong to the page",
        "Store finders, coverage, and delivery tools use Places and Maps as a component. Search and filters live in the interface. The map follows. Load is budgeted so the offer is not waiting on tiles.",
      ],
      [
        "Measurement you can argue from",
        "GA4 events are named after journeys: form start, pricing view, checkout step. Consent is part of the same work. Marketing tags do not own the render.",
      ],
      [
        "Search that lands on a real URL",
        "Help centres and internal tools can use a Google-quality search box without giving up the layout. Results are pages you can share, not a trapped overlay.",
      ],
      [
        "Workspace beside the product",
        "Forms can land in a mailbox and a CRM the team already opens. We do not ask a firm to leave Google Workspace to get a modern site.",
      ],
    ],
    [
      [
        "Do we have to put Google sign-in on everything?",
        "No. We offer it when visitors already live there, and we keep email or another provider so you are not rented to one identity. The prototype includes the first-run either way.",
      ],
      [
        "Will the site become a Google shop?",
        "Not if we do the brief properly. We pick the APIs that remove friction. Analytics, maps, and accounts are enough for most company sites. The application still sits in your repository.",
      ],
      [
        "Who owns the Analytics property?",
        "You do. We implement the event map, then we leave the property in your organisation. A studio login is not the live source of truth.",
      ],
      [
        "Can we add Gemini or Maps later?",
        "Yes. The journeys are designed so a later API is a step, not a rewrite. You will see that step in a preview before the rest of the spend unlocks.",
      ],
    ],
    [
      [
        "A pricing page that finally explained itself",
        "We tracked who opened the comparison, who started the form, and who left at the company-size field. The next design pass changed that field. Paid traffic stopped paying for a guess.",
      ],
    ],
  ),
  "google-cloud": seed(
    "cloud",
    "Infrastructure when Google is already the house.",
    "Cloud decisions get made in a slide and regretted in a bill. We only put a product on Google Cloud when the organisation already lives there, or when a specific service is the cleanest way to ship the thing you clicked in the prototype. The application remains an app on a repository you own. Cloud Run, Cloud Storage, and secrets are how it runs, not a second product.",
    "We design the journeys first. Then we place hosting, files, and jobs on the smallest set of Google Cloud services that will carry them. Finance should be able to read the invoice. Your team should be able to rotate a key without us. Preview URLs still exist, even inside a Google organisation, so sign-off stays in the browser.",
    "If Google Cloud is not already the house, we will say so, and we will not invent a reason to move.",
    [
      [
        "Products that already have a Google bill",
        "When the company is on Google Cloud, we keep the new site or SaaS in that estate so nobody opens a second vendor for the sake of a logo. Deploys stay in one place.",
      ],
      [
        "Files that still belong to you",
        "Uploads, media, and exports sit in Cloud Storage with keys you hold. A company tool should not hide documents in a folder we keep.",
      ],
      [
        "Jobs off the request",
        "Imports, mail, and slow work run as jobs. The page does not wait. Logs are in the project you can open.",
      ],
      [
        "Secrets you can rotate",
        "Environments are named. Values live in the project. A new hire can ship without copying keys out of a chat.",
      ],
      [
        "A way out",
        "The app is portable enough that a later host is a decision, not a hostage situation. We will not wire you to twelve Google products to look thorough.",
      ],
    ],
    [
      [
        "Should every Next.js site live on Google Cloud?",
        "No. Many of our sites ship on Vercel or similar because the preview workflow is simpler. We use Google Cloud when it is already the estate, or when the brief names a service that belongs there.",
      ],
      [
        "Do we own the project?",
        "Yes. The Google Cloud project is yours. We work inside it, then we leave seats and a runbook. Domain and DNS stay in your name too.",
      ],
      [
        "How do previews work?",
        "Each change still gets a URL. You click the product. The rest of the budget waits until that URL is the one you want in production.",
      ],
      [
        "What if we also use Firebase?",
        "Firebase can cover auth or an early data layer. Business records still want a database you can export. We draw that line in the brief.",
      ],
    ],
  ),
  "google-maps": seed(
    "maps",
    "A map that stays a component, not a second website.",
    "Location work fails when the map is heavier than the page around it, or when the only way to find a store is to wrestle a default Google widget. We design the journey first: query, results, pin, directions, opening hours. Google Maps is the engine under that journey. The type, the filters, and the empty state stay ours.",
    "Sometimes Mapbox is the better engine for a custom style. Sometimes Google Maps is already in the contract and the Places API is what the team needs. We choose in the brief, then we budget tiles, script, and a fallback list so a blocked key does not kill the page. The locator is a page your CMS can still edit.",
    "If the map is the first thing you notice, we have not finished the interface.",
    [
      [
        "Multi-site locators",
        "Hours, services, and directions on one page. Filters do the thinking. The map only follows the list, including on a phone.",
      ],
      [
        "Operations maps",
        "Field tools and dispatch boards plot jobs without asking people to open a second app. The same accounts as the rest of the product.",
      ],
      [
        "Places in a form",
        "Autocomplete that does not fight the layout or the label. Address, not a dump of fields the user already typed.",
      ],
      [
        "Paid landers for a place",
        "A city or a store page with a map that waits its turn. The offer and the form render first.",
      ],
      [
        "Coverage without theatre",
        "A service-area story told with a simple shape and honest copy, not a 3D globe.",
      ],
    ],
    [
      [
        "Google Maps or Mapbox?",
        "Google when Places, hours, or an existing contract matter. Mapbox when the map has to look like the rest of the brand. You will see both options in the prototype if the brief is genuinely open.",
      ],
      [
        "Will it wreck Core Web Vitals?",
        "Not if we load it on purpose. The map can wait for a click or for the locator section. Landers are budgeted. We treat a heavy default embed as a defect.",
      ],
      [
        "Can the team edit locations?",
        "Yes. Places are CMS entries: name, hours, services, coordinates. A new site should not need a developer.",
      ],
      [
        "What if Google blocks the key?",
        "A list and a link to directions still work. The page does not become a grey hole.",
      ],
    ],
    [
      [
        "A retailer whose ads landed on a city",
        "Each city URL had stock, hours, and a map that did not delay the button. The national home page stopped being the only door.",
      ],
    ],
  ),
  gemini: seed(
    "ai",
    "A model on a task, not a chat bolted to the header.",
    "Gemini is useful when it shortens a job the team already repeats: a draft in the CMS, a summary of a long record, a search across your own pages. It is a waste when it becomes a novelty chatbot that nobody trusts and everybody has to moderate. We wire Gemini behind your API, with prompts you can edit, and we keep a person at the end of the flow.",
    "The interface is the product. Gemini fills a field or a panel. If Google Cloud is already the house, we can keep the call in that estate. If it is not, we still use your keys. The prototype includes the assist and the off switch. The rest of the budget waits until you have used both.",
    "If the flow does not work when Gemini is down, we have designed the wrong product.",
    [
      [
        "Drafts in a publishing workflow",
        "Editors get a first pass at a title, a summary, or a rewrite. Publish stays a human action. Tone lives in a prompt file, not in folklore.",
      ],
      [
        "Search over your own corpus",
        "Answers come with links into the CMS. Staff can open the source. We do not let a model invent policy from the open web.",
      ],
      [
        "Form assists",
        "A tool that offers a cleaner note from messy input, then lets the person edit it. The saved record is theirs.",
      ],
      [
        "Queue helpers",
        "A help desk that writes the first reply from the ticket and the knowledge base. Staff still send it.",
      ],
      [
        "Classification",
        "Leads or documents tagged for the right queue. The names match how the company already talks.",
      ],
    ],
    [
      [
        "Is this just a Gemini wrapper?",
        "No. The product is the site or the tool. Gemini is a step. You could turn the step off and the rest would still save, still publish, still show the last good draft.",
      ],
      [
        "Whose keys?",
        "Yours. Usage and logs sit in your Google project. We do not run production calls through a studio account.",
      ],
      [
        "How do we keep it accurate?",
        "Retrieval from your own pages, citations, and a review step. We do not ship an unsupervised answer on a policy or a price.",
      ],
      [
        "Can we swap the model later?",
        "Yes, if the brief wants Claude or OpenAI instead. The interface does not care which vendor fills the field.",
      ],
    ],
  ),
  youtube: seed(
    "platform",
    "Film as a chapter on the page, not the whole page.",
    "YouTube is how a lot of work gets explained, and it is also how a lot of sites get slow. A marketing page should not become a channel with a header glued on top. We treat each film as content: a poster, a caption, a reason to press play, and a layout that still holds if the player is blocked or late. The rest of the page, the form, and the type do not wait.",
    "Lazy loads, privacy-aware embeds, and CMS entries so your team can swap a film without a developer. Product films, course pages, and internal explainers all use the same pattern. If the brief is really a channel strategy, we will say that is a different job from a company site.",
    "The headline and the action stay first. The film loads when someone chooses it.",
    [
      [
        "Launch films that do not stall the offer",
        "The hero can show a poster and a play control. The form and the promise are in the HTML. YouTube arrives when it is wanted.",
      ],
      [
        "Libraries a team can publish",
        "Each video is a CMS row: title, poster, chapter marks, transcript. No embed soup pasted into a template.",
      ],
      [
        "Training next to the step",
        "Internal tools can play a short clip beside the task it explains. People do not have to hunt a playlist.",
      ],
      [
        "Course and explainer pages",
        "Transcript and outline beside the player so the page is still useful on a bad connection or with the sound off.",
      ],
      [
        "Case films in a system",
        "Work pages share a block. A new film is content, not a rebuild.",
      ],
    ],
    [
      [
        "Why not just paste the YouTube share code?",
        "Because it brings cookies, layout jumps, and a player that fights your type. We wrap it so Core Web Vitals and privacy stay part of the build.",
      ],
      [
        "Can marketing change the video?",
        "Yes. The CMS holds the id, the poster, and the caption. A developer is not in the loop for a swap.",
      ],
      [
        "What if someone blocks YouTube?",
        "The poster, the caption, and a link remain. The rest of the page never depended on the iframe.",
      ],
      [
        "Do you build YouTube channels?",
        "We build the site the films live on. Channel strategy is only in scope if the brief says so.",
      ],
    ],
    [
      [
        "A manufacturer whose product film was burying the spec",
        "We moved play below the request form. Enquiries went up. The film still got watched by the people who wanted it.",
      ],
    ],
  ),
  openai: seed(
    "ai",
    "Language models used as a tool inside the product.",
    "OpenAI is one way to draft, classify, or retrieve. It is not a product story on its own. We put it behind a task your team already does, with logs, limits, and a fallback. The page around it is still a Next.js product on a repository you own. If the flow cannot survive an API outage, we have not finished.",
    "We prototype the interface first, then attach OpenAI where a first draft actually saves time. Content, keys, and prompts stay in your project. Review stays in the UI. You can refuse the assist in the preview before we spend the rest of the budget on model calls.",
    "A model call is a step in a journey. It is not the journey.",
    [
      [
        "CMS drafts that do not auto-publish",
        "The model fills the empty field. Editors keep the last word. The tone prompt is a file in the repo.",
      ],
      [
        "Routing and classification",
        "Tickets, leads, or content tagged for the right queue. Names match the company, not a generic taxonomy.",
      ],
      [
        "Retrieval with sources",
        "Answers over your own corpus, with links a person can open. We do not ship a confident paragraph with nowhere to check.",
      ],
      [
        "Structured extraction",
        "Notes become the fields the tool already has. The saved record is structured, not a blob of generated prose.",
      ],
      [
        "Internal copilots with an off switch",
        "Staff can hide the panel. The rest of the tool still works on a bad API day.",
      ],
    ],
    [
      [
        "Do we have to brand the product as AI?",
        "Usually no. The buyer came for a site, a SaaS, or a tool. OpenAI is how a step gets faster. We will not put a sparkle on every button.",
      ],
      [
        "Who pays the usage?",
        "You do, on your OpenAI project. Limits are in code so a loop cannot burn the month.",
      ],
      [
        "Can we use Claude or Gemini instead?",
        "Yes. The interface fills a field. The vendor is a configuration, decided in the brief.",
      ],
      [
        "How do you handle secrets?",
        "Keys in your environment. The app never needs a studio token in production.",
      ],
    ],
  ),
  chrome: seed(
    "platform",
    "The browser most of your customers will actually open.",
    "Chrome is not a badge on a slide. It is the default surface for a lot of the people who will pay you. We build for the web, then we check Chrome the way those people use it: a mid-range phone, a dirty cache, three tabs already open, a flaky network. Features that only exist in a lab profile are not features.",
    "Performance budgets, traces, and real-device checks sit in the same engagement as the design. Progressive enhancement keeps a form alive if a script is late. Installable web apps are only in scope when the brief actually needs a home-screen icon. We do not ship Chrome-only APIs as the only path.",
    "If it only works on a fresh desktop profile, it is not done.",
    [
      [
        "Journeys that make money",
        "We profile checkout, signup, and the form in Chrome, on the pages that convert, not on a blog nobody paid to reach.",
      ],
      [
        "Honest first paint",
        "The offer is in the HTML. Script adds extras. A late bundle does not hide the button.",
      ],
      [
        "Installable tools when they earn it",
        "An internal web app can feel like software with a manifest. Store listings stay a later door.",
      ],
      [
        "No surprise on the next release",
        "We avoid APIs that vanish, and we keep a fallback when they do.",
      ],
      [
        "Android in the same pass",
        "Cheap Androids running Chrome are a default test, not a nice-to-have.",
      ],
    ],
    [
      [
        "Do you only test Chrome?",
        "No. Chrome is the volume browser. We still check Safari and Firefox on the journeys that matter. The point is the customer, not a vendor score.",
      ],
      [
        "Will you chase every Chrome experiment?",
        "No. We use stable platform features. Experiments are optional enhancements, never the only way to pay or to submit.",
      ],
      [
        "What about extensions?",
        "We do not build the product around an extension. If the brief needs one, it is a separate, honest scope.",
      ],
      [
        "How do Core Web Vitals fit?",
        "They are a budget in the original timeline, measured in Chrome on the converting pages, not a later audit.",
      ],
    ],
  ),
  firebase: seed(
    "data",
    "A backend that can start fast, with a door you can walk out of.",
    "Firebase is useful for auth, messages, and an early data layer when a prototype has to be clickable this week. It becomes a problem when business records hide in a place you cannot export, and the product is still there a year later. We use Firebase when speed matters, and we keep the door open to Postgres or another store you fully own.",
    "Auth and push are the common wins. We keep domain data in a database you can dump whenever the product is more than a trial. The Firebase project is yours. Preview still happens on a URL. The rest of the budget waits until the accounts and the first-run are something you would keep.",
    "A prototype may live on Firebase. A product that has to last should not hide its records.",
    [
      [
        "Auth for an early SaaS",
        "Teams can sign in this week. Email and Google can sit beside each other. The first-run is still designed.",
      ],
      [
        "Push and realtime where the UI needs it",
        "A field tool can ping when a job changes. We do not sprinkle realtime on every list because it is there.",
      ],
      [
        "A path off Firestore",
        "When the brief is a real product, records move to Postgres with a schema you can read. Firebase does not have to be forever.",
      ],
      [
        "Keys in your project",
        "The Firebase project is yours from day one. We do not keep a studio project in the middle.",
      ],
      [
        "File storage with an exit",
        "Uploads can start on Firebase Storage and later sit beside the rest of your files. The UI does not care.",
      ],
    ],
    [
      [
        "Is Firebase the whole backend?",
        "Only for a trial, and only if you agree. Lasting products get a database you can export. We will say which one you are buying.",
      ],
      [
        "Can we start on Firebase and move?",
        "Yes. That is a common path: auth stays, records move, the interface barely changes. We plan the move in the brief so it is not a surprise.",
      ],
      [
        "What about cost?",
        "Realtime and chatty listeners get expensive. We design reads on purpose and we keep an eye on the bill in your project.",
      ],
      [
        "Do we need Google Cloud as well?",
        "Sometimes. Firebase can sit in a Google Cloud organisation you already have. We will not open a second estate without a reason.",
      ],
    ],
  ),
  microsoft: seed(
    "platform",
    "The stack a lot of companies already pay for, met rather than replaced.",
    "Microsoft is email, identity, and the office next door. A new site that ignores Entra ID, the mailbox, or the way a firm already signs in will be fought by the people who have to live with it. We build web products that sit beside that world. The interface stays ours. The repository stays yours. The work account stays the work account.",
    "SSO, Graph where it is useful, Azure only when it is already the house. A hybrid is allowed: React or Next.js on the surface, .NET underneath, if that is the team you can hire. We will not force a Microsoft shop onto a stack it cannot staff, and we will not wrap a SharePoint site and call it a product.",
    "You should not need a fourth password to reach your own portal.",
    [
      [
        "Portals on the work identity",
        "Staff and clients use the account they already have. Roles map to screens. No new folklore of passwords.",
      ],
      [
        "Brochure sites that still talk to the office",
        "Forms land in the mailbox and the CRM the team opens every morning. The public site is fast. The office is not abandoned.",
      ],
      [
        "Hybrid builds",
        "A Next.js or React front with a .NET API when that is the domain team. One handover, one contract between them.",
      ],
      [
        "Internal tools beside 365",
        "Calendars, directories, and files when Graph is the honest source. The tool still looks like your product, not like an admin centre.",
      ],
      [
        "Azure when it is already paid for",
        "We deploy into the tenancy finance already knows. We do not invent a second cloud for a logo.",
      ],
    ],
    [
      [
        "Will you rebuild us in SharePoint?",
        "No. SharePoint can remain where documents live. The product people use in a browser is a proper web app on a repository you own.",
      ],
      [
        "Can we keep .NET?",
        "Yes. We will meet a C# team at an API contract. The interface can still be the same quality as any other Aevion Labs site.",
      ],
      [
        "What about licensing?",
        "We work inside the tenancy you already pay for. We are not a Microsoft reseller, and we will not upsell you a SKU to justify the build.",
      ],
      [
        "Is SSO in the prototype?",
        "If identity is the brief, yes. You sign in with the work account on the preview. The rest of the budget waits until that feels like the product.",
      ],
    ],
  ),
  azure: seed(
    "cloud",
    "Cloud that already lives in a Microsoft tenancy.",
    "If the company is already on Azure, we deploy there. If it is not, we do not invent a reason to be. Azure is a place to run the thing: App Service, Static Web Apps, Functions, a vault for secrets. The product is still the site or the tool you clicked. The diagram stays short enough to read on one page.",
    "The same Next.js or .NET app we would run anywhere. Pipelines you can read. Environments you can promote without a call. Identity with Entra ID when the portal should use the work login. Preview URLs still exist, even when they have to live inside the tenancy.",
    "A public site can sit on a private cloud without making the marketing team learn the portal.",
    [
      [
        "Hosting inside an existing estate",
        "Marketing on the edge or on App Service, data in the subscription finance already owns. One bill, one security review.",
      ],
      [
        "Identity with Entra ID",
        "A portal or a tool that signs in with the work account. Roles mean screens.",
      ],
      [
        "Jobs and queues",
        "Work that should not run in the request: imports, mail, billing events. Logs in the subscription you can open.",
      ],
      [
        "Pipelines in the repo",
        "Promote preview to production with a history. A new hire can read the YAML.",
      ],
      [
        "A handover that does not need us",
        "Runbooks, environments, and the domain in your name. We are optional after launch.",
      ],
    ],
    [
      [
        "Should we move off Vercel onto Azure?",
        "Only if the tenancy, the compliance, or the team requires it. Previews matter more than the logo. We will say if Azure is a worse day-to-day for a marketing site.",
      ],
      [
        "Do you write Bicep or Terraform?",
        "When the estate expects it. For a small site we keep the footprint small. Infrastructure as files in the same repository as the app.",
      ],
      [
        "Who owns the subscription?",
        "You do. We work in a resource group you control. Nothing production sits in a studio subscription.",
      ],
      [
        "Can .NET and Next.js share it?",
        "Yes. That is a common split: interface on the web, domain on .NET, both in Azure, one handover.",
      ],
    ],
  ),
  aws: seed(
    "cloud",
    "The default cloud when the product has to scale on its own terms.",
    "AWS is a lot of services. A website does not need a poster of all of them. We use a short list: compute, storage, email, and the bits the brief actually named. IAM you can audit. Bills you can read. The application stays on a repository you own, with previews you can refuse before production is a click.",
    "S3 and CloudFront for the fast public surface. A container or a function for the server. SES when mail has to leave your domain. Infrastructure as files in the same repo as the app. We cut unused services before launch so the invoice matches the product you approved.",
    "If a service cannot be explained in a sentence, it is probably not in the build.",
    [
      [
        "Sites that stay fast at the edge",
        "Static and server-rendered pages close to the visitor. Images and assets on storage you control.",
      ],
      [
        "Uploads and media",
        "Keys that belong to you. The CMS points at your bucket, not at a studio folder.",
      ],
      [
        "Background jobs",
        "Billing, import, and mail off the request. Failures are logs, not silence.",
      ],
      [
        "A quiet bill",
        "We turn off the unused catalogue items before launch. Architecture theatre is treated as a defect.",
      ],
      [
        "The same cloud from prototype to production",
        "You click a preview that already talks to the real shape of the system. Launch is a promotion, not a rewrite.",
      ],
    ],
    [
      [
        "Do we need AWS for a brochure site?",
        "Usually no. Many company sites are happier on a simpler host with good previews. AWS earns its keep when you need the control, the regions, or the rest of an estate that is already there.",
      ],
      [
        "Will you use every managed service?",
        "No. Smallest set that ships. If we add a queue or a function, you will see why in the notes.",
      ],
      [
        "Who owns the account?",
        "You do. Root, billing, and IAM stay with you. We work as a role, then we leave the runbook.",
      ],
      [
        "Can we stay portable?",
        "Yes. The app is the product. AWS is how it runs. A later host is a decision, not a hostage situation.",
      ],
    ],
  ),
  "google-analytics": seed(
    "platform",
    "Events that match the journey, not a fog of pageviews.",
    "Analytics is only useful if a decision can come from it. A default GA4 install that fires on every pageview and nothing else is how teams end up arguing about bounce rate while the form is broken. We name events after what people do, we implement consent in the same engagement, and we keep marketing tags from owning the render.",
    "The event map is agreed in the prototype: form start, pricing view, checkout step, the thing you said mattered. Then tagging that does not block first paint. You see the events on a preview before paid traffic starts. The property lives in your organisation.",
    "If you cannot name the question you will ask next month, we should not be tagging yet.",
    [
      [
        "Conversion events",
        "Forms, pricing, checkout, and the step before they leave. Thank-you pages are not the only story.",
      ],
      [
        "Consent without a second product",
        "The banner, the defaults, and the tags are part of the page design. We do not drop a plugin that fights the layout.",
      ],
      [
        "Paid landers with a clean story",
        "Campaign URLs map to events. Finance can see what the spend bought.",
      ],
      [
        "A handover the team can extend",
        "Adding an event is documented. You should not need us to name a new step.",
      ],
      [
        "Speed still in the budget",
        "Tags load when they are needed. The form does not wait on a vendor.",
      ],
    ],
    [
      [
        "GA4 or something else?",
        "GA4 is what most marketing teams already have. If you need a different tool, we will wire the same event names. The map matters more than the logo.",
      ],
      [
        "Will you implement every recommended event?",
        "No. We implement the ones in the brief. A soup of enhanced measurements is how you lose the plot.",
      ],
      [
        "Who owns the property?",
        "You do. We are a user, then we leave. A studio property is not how production runs.",
      ],
      [
        "Is this part of the prototype?",
        "The names are. You approve the map before we put it on production traffic.",
      ],
    ],
    [
      [
        "A site that finally knew why people left",
        "We tracked the field before submit, not only the success page. The next design pass was obvious. Spend went to the pages that could finish.",
      ],
    ],
  ),
  apple: seed(
    "native",
    "The devices a lot of your customers will hold, designed for on purpose.",
    "Apple is Safari, the App Store, and a set of expectations about polish. Most of our work is still the web. A site that only looks finished on an Android Chrome window is not finished, and a site that only looks finished on an iPhone is not finished either. We build the web to hold up in Safari, with safe areas, tap targets, and payment or sign-in flows that feel native without copying a template. We ship a native app only when the brief needs one.",
    "Responsive interfaces first. Then Safari checks on the journeys that make money. When the product must live on iPhone as software, we plan the store, the accounts, and the same design system as the site. Tokens come from the same Figma file. The repository is yours, including the Xcode project.",
    "Polish is a requirement. A second brand on iOS is a defect.",
    [
      [
        "Sites that hold in Safari",
        "Type, tap targets, checkout, and the notch. Checked on a device, not only in a frame.",
      ],
      [
        "Companion apps with one system",
        "Web and iOS share tokens and accounts. The brand does not fork at the store listing.",
      ],
      [
        "Sign-in people already use",
        "Apple and Google as options, with email still available. No dead ends.",
      ],
      [
        "App Store as a later door",
        "The product can start on the web. The listing comes when the brief says it must.",
      ],
      [
        "Payments that feel like the rest of the page",
        "Apple Pay where it helps, still inside a checkout you designed.",
      ],
    ],
    [
      [
        "Do we need a native app?",
        "Only if the brief cannot be met on the web. We will say no if a well-made site or a home-screen web app would do. Native is extra cost and extra review.",
      ],
      [
        "Will the iOS app look like a different company?",
        "No. Tokens and type come from the same file as the site. That is a requirement, not a hope.",
      ],
      [
        "Who owns the developer account?",
        "You do. Certificates, listings, and the repo sit in your organisation.",
      ],
      [
        "What about iPad and Mac?",
        "If the brief names them, we design for them. We do not pretend a stretched iPhone layout is a desktop product.",
      ],
    ],
  ),
  "app-store": seed(
    "native",
    "A listing that matches the product, not a screenshot graveyard.",
    "If we ship an iOS app, the store page is part of the work. Copy, previews, privacy, and a first session that will pass review. The App Store is a gate with rules. We plan those rules before anyone opens Xcode for the tenth time, and we take the screenshots from the UI you already approved, not from a fantasy marketing file.",
    "Web first when we can. Native when we must. The listing is written in the same voice as the site. Accounts work in both places. TestFlight is the prototype you can hold. The remaining budget waits until that build is the one you want on the store.",
    "Review week should not be the first time we talk about privacy copy.",
    [
      [
        "Companion apps",
        "A SaaS people already use in the browser gets a second door, not a second identity.",
      ],
      [
        "Listings as a deliverable",
        "Name, subtitle, previews, and review notes in the handover. You can submit without us typing into App Store Connect from memory.",
      ],
      [
        "Screens from the live product",
        "Store images come from the build you signed off. No separate art that the app then fails to match.",
      ],
      [
        "Privacy and sign-in stories",
        "Written before submission. If a login will fail review, we find out in the prototype.",
      ],
      [
        "A product that starts on the web",
        "The app can wait. The accounts should not have to.",
      ],
    ],
    [
      [
        "Do you guarantee approval?",
        "No one honest does. We design for the guidelines, we write the privacy story, and we use TestFlight so surprises are fewer. Apple still decides.",
      ],
      [
        "Who owns App Store Connect?",
        "You do. We work in your account. A studio listing is not how a real product ships.",
      ],
      [
        "Can Android come later?",
        "Yes. Same API, same accounts. The store is a door. The product is the system behind it.",
      ],
      [
        "Is the listing in the prototype phase?",
        "The first session and the permission story are. Screenshots wait until the UI is the UI.",
      ],
    ],
  ),
  xcode: seed(
    "native",
    "The studio we open when the product has to be native.",
    "Xcode is for the cases the web cannot cover. Most briefs never need it. When they do, we work in Xcode with the same tokens, the same accounts, and a repository you own. SwiftUI where it helps. A shared API with the site. TestFlight as the prototype you can hold before anyone writes store copy.",
    "We keep native surface area small. The phone should not invent a second truth. Dispatchers can stay on the web while the field uses the app. Certificates, profiles, and the project leave with you. We do not keep the only signing identity on a studio Mac.",
    "If we can ship it as a well-made web app, we will say so before anyone creates a project.",
    [
      [
        "Companion iOS apps",
        "A product that already has a web home. The app is another door onto the same backend.",
      ],
      [
        "Field tools",
        "Camera, offline, or hardware the browser will not give us. Still the same jobs API as the office.",
      ],
      [
        "TestFlight before the listing",
        "You tap the product this week. The remaining budget waits.",
      ],
      [
        "Tokens that survive the hop",
        "Colour and type come from the same Figma file as the site. The brand does not fork.",
      ],
      [
        "Handover of signing",
        "Certificates and the repo. Your Mac, your account, your store.",
      ],
    ],
    [
      [
        "Can you work in our Xcode project?",
        "Yes, if it is in your git org. We will not accept a zip as the source of truth.",
      ],
      [
        "SwiftUI or UIKit?",
        "SwiftUI where it helps. We will not rewrite a working UIKit app for taste.",
      ],
      [
        "What about CI?",
        "Builds you can run without us. Signing in your account. The pipeline is in the repo.",
      ],
      [
        "Do we still get a web product?",
        "Usually yes. Native is extra, not a replacement, unless the brief is only an app.",
      ],
    ],
  ),
  android: seed(
    "native",
    "The phones most of the world actually uses.",
    "Android is Chrome, cheap hardware, and a wide range of screens. A site that only looks finished on an iPhone is not finished. We design the web for that range as a default, then we add a Play build only when the brief needs a home-screen app that the browser cannot be. Mid-range Android is a test device, not an afterthought.",
    "Responsive layouts, tap targets, and performance budgets first. An installable web app if the team just needs an icon. Kotlin or a trusted wrapper only after the web product is something you can use. Same API, same accounts. The Play listing is a later door.",
    "If the checkout fails on a £150 phone, it is not a launch.",
    [
      [
        "Sites that stay fast on mid-range hardware",
        "We cut weight until the button is ready. The iPhone version stays fast for free.",
      ],
      [
        "Home-screen web apps",
        "Many internal tools never need Play review. The web app is the product.",
      ],
      [
        "Companion Play listings",
        "Same backend as the site. A second door when the brief requires it.",
      ],
      [
        "Chrome as the real browser",
        "We test the journeys in Chrome on Android, with a dirty cache, because that is the volume path.",
      ],
      [
        "A later native layer",
        "Kotlin when the wrapper is not honest. Keys and the Play account are yours.",
      ],
    ],
    [
      [
        "Do we need a Play app?",
        "Only if the brief says the product must live on the home screen as software. A well-made site is the default. We will not invent a store listing to look complete.",
      ],
      [
        "What devices do you test?",
        "A mid-range Android and a current iPhone on the money journeys. More devices if the audience is named in the brief.",
      ],
      [
        "Who owns the Play Console?",
        "You do. We will not ship production from a studio developer account.",
      ],
      [
        "Can iOS wait?",
        "Yes. Web first, then the store that the audience actually uses. Accounts should already work.",
      ],
    ],
  ),
  anthropic: seed(
    "ai",
    "A careful model for work that has to stay accurate.",
    "Anthropic is a fit when the draft has to be cautious: policy, support, long documents, anything a person will have to defend. We use Claude as a step, with a human at the end of it. Keys, prompts, and logs sit in your project. The rest of the stack is the same Next.js product we would ship without a model.",
    "We pick a model for the task, not for the press release. Claude sits behind your API. If it is down, the product still works. Retrieval is over your CMS, with sources a person can open. You click the assist in the prototype and you can switch it off before the rest of the spend unlocks.",
    "Careful does not mean slow. It means the answer has a source.",
    [
      [
        "Policy and support drafts",
        "First replies that stay inside a written tone. Staff still send them. Sources sit next to the text.",
      ],
      [
        "Long-document summaries",
        "Internal tools that compress a pack into something a person can check, with links back into the file.",
      ],
      [
        "CMS rewrites",
        "A careful pass on a page. Publish remains a human action.",
      ],
      [
        "Research desks on your own files",
        "Answers from the corpus you own, not from the open web pretending to be you.",
      ],
      [
        "Extraction into real fields",
        "Notes become structured data the tool already stores. Not a generated essay in a comment box.",
      ],
    ],
    [
      [
        "Why Anthropic instead of OpenAI?",
        "When the brief is caution, citations, and long context. We will not pick a vendor because of a headline. You will see the task, then the model.",
      ],
      [
        "Can we still use Gemini?",
        "Yes, if the estate is Google and the task fits. The UI does not care which vendor fills the field.",
      ],
      [
        "How do you stop it making things up?",
        "Retrieval, citations, review, and no unsupervised publish on anything that looks like advice.",
      ],
      [
        "Whose contract?",
        "Yours. We do not resell Anthropic. Production keys are in your project.",
      ],
    ],
  ),
  claude: seed(
    "ai",
    "Claude as a coworker in the product, not a tab on the side.",
    "A chat window is rarely the brief. We embed Claude where a blank field costs time: a weekly update, a rewrite, a summary, a first-pass answer in a portal. The page around it stays the product. Review, logs, and an off switch are requirements. Your keys. Your prompts. Your fallback.",
    "We prototype the flow with Claude already in it, then we keep the rest of the Next.js app ordinary. If Anthropic is the vendor, Claude is the name on the step. Staff should be able to hide the panel and still finish the job on a bad API day.",
    "The saved record is always a person's. Claude only fills the draft.",
    [
      [
        "Weekly updates from the work",
        "A portal that drafts the note from tickets. The client still reads a human.",
      ],
      [
        "Publishing rewrites",
        "Editors get a careful pass. Publish is still a click they own.",
      ],
      [
        "Help that cites the page",
        "First-pass answers with links into the CMS. Nobody pastes an undefendable paragraph.",
      ],
      ["Extraction", "Messy notes become the fields the tool already has."],
      [
        "An assist you can hide",
        "The product works without the panel. That is in the prototype, not in a promise.",
      ],
    ],
    [
      [
        "Is Claude the product?",
        "No. The product is the site, the SaaS, or the tool. Claude is a coworker on a step.",
      ],
      [
        "What happens when Anthropic is down?",
        "Submit, save, and the last good draft still work. We treat a hard dependency as a defect.",
      ],
      [
        "Can marketing change the tone?",
        "Yes. Prompts are files. A tone change should not need a rebuild of the app.",
      ],
      [
        "Do we need a chat UI?",
        "Only if the brief is actually a conversation. Most work is a field, a panel, or a button that fills a draft.",
      ],
    ],
  ),
};
