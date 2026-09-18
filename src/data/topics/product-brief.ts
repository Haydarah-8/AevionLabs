import type { KnownUser } from "@/data/topics/types";

export type ProductBrief = {
  what: string[];
  usedFor: string[];
  knownUsers: KnownUser[];
};

function brief(
  what: string[],
  usedFor: string[],
  users: ReadonlyArray<readonly [string, string]>,
): ProductBrief {
  return {
    what,
    usedFor,
    knownUsers: users.map(([name, note]) => ({ name, note })),
  };
}

const PRODUCT_BRIEFS: Record<string, ProductBrief> = {
  google: brief(
    [
      "Google is the company behind Search, Gmail, Android, Maps, YouTube, Chrome, and the advertising system that still funds a large share of the open web. For a product team it is less one tool and more a set of defaults people already have: an account, a map, a browser, a way to find a page.",
      "Alphabet also sells the cloud, analytics, maps APIs, and AI models that sit behind those consumer products. The public face is a search box. The working face is a catalogue of APIs you can wire into a site or an app without asking the user to learn a new world.",
    ],
    [
      "Teams reach for Google when a user already lives there. Sign in with a Google account so a first visit is not another password. Embed a map people already know how to pinch. Tag journeys so marketing can see which pages convert.",
      "It is also the default stack for Android apps, YouTube embeds, Chrome testing, and Workspace mail. The useful move is to pick the one or two APIs that remove friction, then keep the rest of the product on a repository you own rather than wrapping the brand in Google chrome.",
    ],
    [
      [
        "YouTube",
        "Google's own video product, and the largest public video library on the web.",
      ],
      [
        "Android",
        "The mobile operating system licensed to Samsung, Pixel, and most of the world's phones.",
      ],
      [
        "The New York Times",
        "Runs a substantial part of its digital operation on Google Cloud.",
      ],
      [
        "Spotify",
        "Has used Google Cloud for back-end and data work at global scale.",
      ],
      [
        "Uber",
        "Launched its locator on Google Maps, the map people already trusted.",
      ],
    ],
  ),

  "google-cloud": brief(
    [
      "Google Cloud is Alphabet's public cloud: compute, Kubernetes, object storage, BigQuery, Cloud Run, and the Vertex AI layer that serves Gemini. It sits next to Amazon Web Services and Microsoft Azure as one of the three places a company can rent machines, databases, and managed services instead of owning a data centre.",
      "The pitch is not only servers. It is data tools that talk to the rest of Google, identity through Cloud IAM, and a global network Google already had to build for Search and YouTube. For a product team it is an account, a region, a bill, and a set of services you should be able to name.",
    ],
    [
      "Companies use Google Cloud to host applications, run containers, store files, query warehouses, and train or call models without standing up their own racks. Startups often land on Cloud Run or Firebase. Larger teams land on GKE, BigQuery, and a VPC they can explain to security.",
      "We put it in a build when the tenancy already exists, when BigQuery is the warehouse, or when Vertex is the model host. We do not move a healthy AWS or Azure estate onto Google Cloud because a slide said multi-cloud.",
    ],
    [
      [
        "Spotify",
        "A long-standing Google Cloud customer for serving and data infrastructure.",
      ],
      ["PayPal", "Runs substantial payment infrastructure on Google Cloud."],
      [
        "The New York Times",
        "Uses Google Cloud to publish and analyse at newspaper scale.",
      ],
      [
        "Target",
        "Has described Google Cloud as part of its retail technology stack.",
      ],
      [
        "Snap",
        "Uses Google Cloud to serve Snapchat to hundreds of millions of people.",
      ],
    ],
  ),

  "google-maps": brief(
    [
      "Google Maps is the mapping platform most people already know how to use. Under the consumer app sits a set of APIs: map tiles, geocoding, Places search, directions, distance matrix, and Street View. Those APIs are how a store locator, a delivery tracker, or a job map gets a map that does not look like a demo.",
      "It is not the only mapping stack. Mapbox, Apple Maps, and OpenStreetMap exist for a reason. Google Maps wins when the user already trusts the pins, the traffic, and the search box, and when the product can pay for the requests.",
    ],
    [
      "Product teams embed Google Maps to show where something is, how to get there, and what sits nearby. A clinic finder, a van on a route, a branch list with filters: the map is the interface for place, not a decorative tile in a footer.",
      "The work is the journey around the map. Search, filters, a list that still works when the tile set is slow, and a key that lives in your project so the invoice is yours. A default embed with no fallback is not a locator.",
    ],
    [
      [
        "Uber",
        "Used Google Maps to put cars and riders on a map people already understood.",
      ],
      [
        "Lyft",
        "Has used Google's mapping and location APIs in the passenger app.",
      ],
      [
        "Airbnb",
        "Showed listings on Google Maps so a stay could be judged by the street, not only the photos.",
      ],
      [
        "The Home Depot",
        "Uses store maps and location search so a shopper can find a branch.",
      ],
      [
        "FedEx",
        "Has used Google Maps Platform for tracking and routing surfaces.",
      ],
    ],
  ),

  gemini: brief(
    [
      "Gemini is Google's family of generative models: text, image, audio, and code, served through Gemini on the web, through Workspace, through Android, and through Vertex AI for companies that want a contract and a region. It is the model Google put behind Search's AI features and behind the assistant on Pixel.",
      "It is not a product on its own. It is a model you call, with prompts, limits, and a fallback when the API is slow. The useful question is which step in the work it should draft, classify, or summarise, not whether the homepage needs a chat widget.",
    ],
    [
      "Teams use Gemini to draft copy, summarise documents, classify tickets, extract fields from messy text, and assist inside tools people already open. Workspace users meet it in Gmail and Docs. Product teams meet it as an API with a key, a log, and a spend cap.",
      "We put it on a named step in the interface. The page still submits when the model is down. Prompts live in the repository. The Google Cloud project stays in your name.",
    ],
    [
      [
        "Google Search",
        "Gemini sits behind Google's own AI answers and the Gemini app.",
      ],
      [
        "Google Workspace",
        "Draft and summarise features in Gmail, Docs, and Sheets call Gemini.",
      ],
      [
        "Android",
        "Pixel and Android assistants use Gemini as the on-device and cloud model.",
      ],
      ["Samsung", "Has built Gemini into Galaxy phones as a Google partner."],
      [
        "Vertex AI customers",
        "Banks, retailers, and publishers call Gemini through Google Cloud rather than the consumer app.",
      ],
    ],
  ),

  youtube: brief(
    [
      "YouTube is Google's video platform: upload, host, recommend, advertise, and stream live. It is the place most people already go to watch a talk, a review, a tutorial, or a match. For a company it is a channel, an embed, and sometimes a full watch experience that still lives on youtube.com.",
      "It is also an API. The Data API, IFrame player, and analytics let a site list uploads, play a video without sending people into a stranger's recommended sidebar, and measure what was actually watched. The brand is the play button. The product is a library with a URL for every cut.",
    ],
    [
      "Brands use YouTube to publish films, product films, talks, and support clips that would crush a marketing site if they were self-hosted. A landing page embeds the official player. A newsroom lists a playlist. A campaign measures views without pretending the site is a streaming service.",
      "We embed with intent: the right video, no autoplay surprise, a layout that still reads if the player is blocked, and a channel the client owns. We do not build a fake YouTube on a brochure site.",
    ],
    [
      [
        "YouTube itself",
        "Google's own product, and the default public video library.",
      ],
      [
        "The White House",
        "Publishes briefings and addresses on an official YouTube channel.",
      ],
      [
        "NASA",
        "Streams launches and mission films to a public that already has the app.",
      ],
      ["VEVO", "The music industry's main licensed window on YouTube."],
      [
        "Premier League clubs",
        "Use YouTube as the public highlight and behind-the-scenes channel.",
      ],
    ],
  ),

  openai: brief(
    [
      "OpenAI is the lab behind ChatGPT, the GPT models, DALL·E, Whisper, and the API that let other products call those models with a key. It started as a research organisation and became the company that put a chat box in front of a large language model and made the rest of the industry follow.",
      "Microsoft is a major investor and ships OpenAI models through Azure. The consumer face is ChatGPT. The working face is an API, a project, usage logs, and a model name you can change when a better one ships.",
    ],
    [
      "Companies use OpenAI to draft, summarise, classify, transcribe, extract, and assist inside tools: a CMS, a support desk, a research inbox, a design critique. ChatGPT is how staff try the model. The API is how a product ships it without sending customers to chat.openai.com.",
      "We wire it to a step that already exists in the work. Keys in your project. A cap on spend. A review screen so a person still sends the thing. A product that dies when OpenAI is down is the wrong product.",
    ],
    [
      [
        "ChatGPT",
        "OpenAI's own consumer product, the front door most people know.",
      ],
      [
        "Microsoft Copilot",
        "Ships OpenAI models inside Windows, Office, and GitHub Copilot.",
      ],
      ["Stripe", "Has used OpenAI models in support and internal tools."],
      ["Shopify", "Built Sidekick and merchant assist on OpenAI's API."],
      [
        "Salesforce",
        "Has integrated OpenAI into Einstein and Agentforce features.",
      ],
    ],
  ),

  chrome: brief(
    [
      "Chrome is Google's web browser, built on the Blink engine. It is the browser most people on the planet open, and the one most product teams test first. Chrome also means DevTools, Lighthouse, the Web Store, ChromeOS, and the engine inside Android WebView and many Electron apps.",
      "When a site is slow, broken, or blocked in Chrome, it is broken for the majority of the audience. The browser is not a logo on a compatibility row. It is the runtime the interface actually runs in.",
    ],
    [
      "Teams use Chrome as the default test surface: layout, performance, service workers, payment sheets, and the DevTools that tell you why a page is 4MB. Extensions, enterprise policy, and ChromeOS matter for companies that issue machines.",
      "We design and ship for the real Chrome your users have, including the last couple of versions, not only the nightly on a designer's laptop. Safari and Firefox still get a pass. Chrome gets the first honest look.",
    ],
    [
      [
        "Google",
        "Ships Chrome as its own browser and as the engine inside many Google apps.",
      ],
      [
        "Microsoft Edge",
        "Is built on Chromium, the same open engine Chrome uses.",
      ],
      [
        "Brave",
        "A Chromium browser with a different default on ads and privacy.",
      ],
      [
        "Electron apps",
        "Slack, Visual Studio Code, and Figma's desktop shell run a Chrome-class engine.",
      ],
      [
        "Android",
        "WebView on most phones is a Chromium engine, so Chrome bugs show up inside apps too.",
      ],
    ],
  ),

  firebase: brief(
    [
      "Firebase is Google's application platform for teams that want auth, a realtime or document database, file storage, hosting, push, and crash reporting without standing up each of those services by hand. It began as an independent realtime database and became Google's default mobile and web back end for startups.",
      "The pieces people actually ship are Authentication, Cloud Firestore or Realtime Database, Cloud Functions, Hosting, Cloud Messaging, and Crashlytics. It is a Google Cloud project underneath. The console is friendlier than raw GCP. The lock-in is real if the data model never leaves Firestore.",
    ],
    [
      "Teams use Firebase to get a signed-in app in front of users quickly: a prototype, a field tool, a consumer app that needs push and a live collection. It is a strong fit when the product is a client talking to documents and files, and a weaker fit when the domain wants a relational schema you will still have in five years.",
      "We use it when the brief wants speed and Google already holds the identity. We keep an export path. We do not pretend Firestore is Postgres.",
    ],
    [
      [
        "The New York Times",
        "Has used Firebase for live and interactive news products.",
      ],
      [
        "Alibaba",
        "Has described Firebase as part of consumer app infrastructure.",
      ],
      [
        "Duolingo",
        "Used Firebase for messaging and mobile plumbing as the app scaled.",
      ],
      [
        "Lyft",
        "Has used Firebase Cloud Messaging in the rider and driver apps.",
      ],
      ["The Economist", "Has shipped reader apps on Firebase services."],
    ],
  ),

  microsoft: brief(
    [
      "Microsoft is the company behind Windows, Office, Azure, GitHub, LinkedIn, Xbox, and Teams. For a lot of organisations it is already the place work happens: the login, the documents, the mail, the machines. A product that ignores that room will be asked to SSO on week two.",
      "The public brand is productivity software. The working brand is identity (Entra ID), cloud (Azure), developer tools (GitHub, VS Code, TypeScript, .NET), and a distribution channel into every company that already paid for Microsoft 365.",
    ],
    [
      "Companies use Microsoft as the work account, the document system, the meeting grid, and often the cloud. Internal tools sign in with the Microsoft login people already have. Public sites still might, if the audience is staff or partners rather than consumers.",
      "We take the identity, the Office files, or the Azure tenancy that already exists, and we put a web interface on the job. We do not rebuild SharePoint as a personality project.",
    ],
    [
      [
        "LinkedIn",
        "A Microsoft company, and the default professional network.",
      ],
      [
        "GitHub",
        "Microsoft's developer platform, where most public software now lives.",
      ],
      [
        "Xbox",
        "Microsoft's games business, sitting next to Windows and Azure.",
      ],
      [
        "OpenAI",
        "Microsoft is a major investor and ships the models through Azure and Copilot.",
      ],
      [
        "Fortune 500 IT",
        "Windows, Office, and Entra ID remain the default work stack in a large share of large companies.",
      ],
    ],
  ),

  azure: brief(
    [
      "Azure is Microsoft's public cloud: virtual machines, App Service, Functions, AKS, storage, SQL, Cosmos DB, and Entra ID at the door. It is the cloud a Microsoft shop already knows how to buy, how to staff, and how to get through security review.",
      "It is also the host for Azure OpenAI, so a company that cannot send data to a consumer ChatGPT account can still call GPT models inside a region and a contract they already have. Azure is not a design tool. It is where the app, the identity, and the secrets live.",
    ],
    [
      "Teams use Azure to host APIs, static sites, containers, databases, and scheduled jobs, usually next to the Microsoft 365 tenant. SSO with Entra is the common reason it wins a brief even when another cloud would be cheaper on paper.",
      "We deploy there when the account already exists. Keys in your subscription. Environments you can promote. We do not open twenty Azure products to make the architecture diagram look busy.",
    ],
    [
      [
        "Adobe",
        "Has run large parts of Creative Cloud infrastructure on Azure.",
      ],
      ["BMW", "Uses Azure for connected-car and manufacturing workloads."],
      [
        "Starbucks",
        "Has described Azure as a core part of its retail and personalisation stack.",
      ],
      [
        "NHS",
        "UK health organisations run a large share of cloud workloads on Azure.",
      ],
      [
        "LinkedIn",
        "Microsoft's own network runs on Microsoft infrastructure, including Azure.",
      ],
    ],
  ),

  aws: brief(
    [
      "Amazon Web Services is the largest public cloud. EC2 machines, S3 files, Lambda functions, RDS databases, CloudFront at the edge, IAM for who can touch what. Amazon built it for its own retail operation, then rented the same shape to everyone else.",
      "For a product team AWS is an account, a region, a bill that can surprise you, and a catalogue so large the skill is saying no. Most serious internet products have at least one foot here, even if the marketing site sits on Vercel or Netlify in front.",
    ],
    [
      "Companies use AWS to host applications, store media, run queues and jobs, keep a relational database, and put a CDN in front of downloads. Startups often start on a few services and grow into a VPC. Enterprises often already have an organisation, SCPs, and a landing zone.",
      "We use the smallest set that matches the brief: compute, storage, the database, the one extra the job named. The account stays yours. We do not treat AWS as a personality.",
    ],
    [
      [
        "Netflix",
        "The canonical AWS customer, streaming at global scale on Amazon's cloud.",
      ],
      [
        "Airbnb",
        "Grew its marketplace on AWS rather than owning data centres.",
      ],
      [
        "NASA",
        "Has used AWS for public datasets, imagery, and mission support.",
      ],
      ["Twitch", "Amazon's own live video product, running on AWS."],
      [
        "Amazon.com",
        "The retail site and fulfilment network that AWS was built to serve.",
      ],
    ],
  ),

  "google-analytics": brief(
    [
      "Google Analytics is the measurement product most websites still install. The current generation is GA4: events rather than sessions-as-the-centre, with BigQuery export for teams that want the raw hits. It answers who came, from where, which pages they opened, and whether a named conversion fired.",
      "It is not the only way to count. Privacy rules, ad blockers, and consent banners mean a share of traffic never arrives. Analytics is a sample with a brand on it, not a census. Used honestly, it still tells you which journeys are dead.",
    ],
    [
      "Marketing and product teams use it to see landing pages, campaigns, funnels, and the events a designer named: form submit, checkout start, signup. A company site without events is a brochure you cannot argue about.",
      "We wire events to the journeys we designed, not a dump of every click. The property lives in your Google account. Consent is part of the build, not a plugin afterthought.",
    ],
    [
      [
        "The Guardian",
        "A publisher that has long measured the news site with Google Analytics.",
      ],
      [
        "Airbnb",
        "Has used Google's measurement stack alongside its own event pipeline.",
      ],
      [
        "The New York Times",
        "Measures reader journeys with Google Analytics as one of several tools.",
      ],
      [
        "Shopify merchants",
        "A large share of stores ship with Google Analytics connected out of the box.",
      ],
      [
        "Most of the web",
        "GA remains the default tag on company sites, for better and worse.",
      ],
    ],
  ),

  apple: brief(
    [
      "Apple is the company behind the iPhone, iPad, Mac, Watch, Vision, and the App Store those devices read from. It also makes iOS, macOS, Safari, iCloud, Apple Pay, and the silicon in the machines. For a product team Apple is a distribution channel, a design bar, and a set of rules you do not negotiate in a blog post.",
      "People who buy Apple hardware expect the interface to feel native, the payments to work with the wallet they already have, and the app to survive review. The brand is the fruit. The constraint is the store, the Human Interface habits, and Safari.",
    ],
    [
      "Companies ship iOS apps, Mac apps, Apple Pay, Sign in with Apple, and sometimes a Watch complication. Marketing sites still have to look correct in Safari. If the audience is on iPhone first, Apple is in the brief whether you like the company or not.",
      "We go native when the browser cannot do the job. We keep Sign in with Apple next to Google when the audience is on iPhone. We do not build a second product that only exists because the store listing wanted a badge.",
    ],
    [
      [
        "Apple itself",
        "iPhone, Mac, App Store, iCloud, and Apple Pay are Apple's own products.",
      ],
      ["Uber", "The rider app is a flagship iOS product on the App Store."],
      [
        "Instagram",
        "Meta's iOS app is how a large share of the audience actually posts.",
      ],
      [
        "Stripe",
        "Apple Pay on the web and in-app is a default checkout for iPhone users.",
      ],
      [
        "Banking apps",
        "HSBC, Chase, and Monzo treat iOS as a primary storefront, not a port.",
      ],
    ],
  ),

  "app-store": brief(
    [
      "The App Store is Apple's shop for iPhone, iPad, Mac, Watch, and Apple TV software. It is review, search, charts, in-app purchase, subscriptions, and the 15 or 30 percent that funds the shop. If you want software on an iPhone that did not come from a browser, this is the door.",
      "Listing copy, screenshots, privacy nutrition labels, age ratings, and review notes are part of the product. An app that works on a TestFlight build and fails review is not shipped. The store is a product surface, not a dump at the end of engineering.",
    ],
    [
      "Teams use the App Store to distribute iOS apps, sell subscriptions, run in-app purchases, and appear in search when someone types the job the app does. Product, legal, and design all touch the listing.",
      "We treat screenshots, privacy copy, and the review notes as part of the build. Certificates and the listing sit in your Apple Developer account. We do not ship a native wrapper of a site that should have stayed a site.",
    ],
    [
      [
        "Instagram",
        "One of the most downloaded apps on the store, and a default iPhone habit.",
      ],
      [
        "Uber",
        "Distributed to riders and drivers through the App Store, not a web bookmark.",
      ],
      [
        "TikTok",
        "A consumer app whose iOS presence is the product for a large share of users.",
      ],
      [
        "WhatsApp",
        "Meta's messenger reaches iPhone users through Apple's store and review.",
      ],
      ["Apple Arcade", "Apple's own subscription shelf inside the same store."],
    ],
  ),

  xcode: brief(
    [
      "Xcode is Apple's IDE: the editor, simulator, Interface Builder, SwiftUI previews, Instruments, signing, and the archive that becomes a TestFlight build. If you ship for iPhone, iPad, Mac, Watch, or Vision, you eventually open this app, even if the code is written elsewhere.",
      "It is not VS Code with a skin. It is the toolchain that talks to Apple's certificates, provisioning, and store. Swift, Objective-C, and the SDK live here. A team that cannot open the project on a Mac they own does not own the app.",
    ],
    [
      "Native teams use Xcode to write Swift, run simulators, capture performance, sign builds, and upload to App Store Connect. Designers use previews. Release managers use archives and TestFlight groups.",
      "We keep the Xcode project on a repository you own, with signing in your developer account. A studio Mac as the only place the app compiles is not a handover.",
    ],
    [
      [
        "Apple",
        "Ships Pages, Keynote, Safari, and the rest of its own apps from this toolchain.",
      ],
      [
        "Lyft",
        "The iOS rider and driver apps are Xcode projects in a Swift shop.",
      ],
      ["LinkedIn", "A large iOS codebase built and signed through Xcode."],
      [
        "Airbnb",
        "The iOS app is a native Swift project, not a web view with a badge.",
      ],
      ["Stripe", "iOS SDKs and sample apps are maintained as Xcode projects."],
    ],
  ),

  android: brief(
    [
      "Android is Google's mobile operating system, running on Pixel, Samsung, and most of the world's phones. Apps are written in Kotlin or Java, distributed through Play, and have to survive a scatter of screen sizes, OEMs, and OS versions that iOS does not have.",
      "It is also a platform: notifications, widgets, shares, biometric prompts, and Play Billing. A company that only ships iOS has decided half the audience can use the website. Sometimes that is honest. Sometimes it is a hole.",
    ],
    [
      "Teams ship Android apps when the job needs the camera, offline, push, or a store listing next to the iPhone one. Internal tools sometimes skip it and stay on the web. Consumer products usually cannot.",
      "We go native when the brief names a reason the browser cannot cover. We share the API and the accounts with the site. We do not build a second identity system for the phone.",
    ],
    [
      [
        "Samsung",
        "The largest Android OEM, shipping Galaxy phones on Google's OS.",
      ],
      ["Google Pixel", "Google's own hardware, the reference Android device."],
      ["WhatsApp", "A flagship Android app for messaging at planetary scale."],
      ["Uber", "Driver and rider Android apps are core to the marketplace."],
      [
        "Netflix",
        "The Android app is how a large share of subscribers actually watch.",
      ],
    ],
  ),

  anthropic: brief(
    [
      "Anthropic is the AI lab that trains Claude. It was founded by people who left OpenAI, with a public emphasis on safety, constitutional training, and models that refuse more aggressively than the competition. Amazon and Google are major investors. The product is the model, the API, and claude.ai.",
      "For a company, Anthropic is a vendor with a contract, usage limits, and a model family (Haiku, Sonnet, Opus) you pick against latency and cost. It is not a chatbot skin. It is a lab whose models you call from a product you still have to design.",
    ],
    [
      "Teams use Anthropic when they want Claude's writing, analysis, or computer-use features inside their own tools, or when procurement prefers Anthropic's terms to OpenAI's. Amazon Bedrock and Google Vertex both host Claude, so the model can sit in a cloud the company already bought.",
      "We put Claude on a named step, with prompts in the repo and a fallback when the API fails. We do not swap the homepage for a chat window because the brief mentioned AI.",
    ],
    [
      ["Amazon", "A major investor, and ships Claude through Amazon Bedrock."],
      ["Google Cloud", "Offers Claude on Vertex AI as well as Gemini."],
      [
        "Notion",
        "Has used Anthropic models in Notion AI alongside other vendors.",
      ],
      ["Quora", "Poe has offered Claude as a first-class model next to GPT."],
      [
        "Claude.ai",
        "Anthropic's own consumer product, the chat interface for the lab.",
      ],
    ],
  ),

  claude: brief(
    [
      "Claude is Anthropic's assistant and model family. People meet it as a chat site. Product teams meet it as an API that drafts, summarises, reasons over long documents, and, in newer versions, can operate a computer. The name is the product. The work is still your interface around the call.",
      "It is often chosen for long context, for a more cautious refusal style, and for teams that already buy Amazon or Google cloud and can take Claude through Bedrock or Vertex instead of a second vendor login.",
    ],
    [
      "Companies use Claude to analyse contracts, draft internal notes, support agents, extract structure from PDFs, and assist inside research or CMS tools. The consumer chat is how staff try it. The API is how it ships without sending customers to Anthropic's site.",
      "We keep the prompt, the model name, and the spend cap in your project. The product still works when Claude is slow. Assist is a step, not the product.",
    ],
    [
      ["Amazon Bedrock", "The way many enterprises call Claude inside AWS."],
      ["Slack", "Has offered Claude as an assistant inside paid workspaces."],
      ["Notion", "Claude is one of the models behind Notion AI features."],
      [
        "Cursor",
        "Uses Claude as a coding model option next to OpenAI and others.",
      ],
      [
        "The Economist",
        "Has experimented with Claude for research and editorial assist.",
      ],
    ],
  ),

  typescript: brief(
    [
      "TypeScript is Microsoft's typed language that compiles to JavaScript. It is JavaScript with a type system: interfaces, unions, generics, and an editor that can tell you a field is missing before a user does. Almost every serious web codebase we open now is TypeScript, even if the runtime is still the browser or Node.",
      "It does not replace JavaScript. It is JavaScript with a compile step and a contract. Teams adopt it so a tenth page does not invent a second shape for a user, and so a rename does not become an archaeology project.",
    ],
    [
      "Product teams use TypeScript for web apps, APIs, design systems, and scripts that have to last. React, Next.js, Node, and Vue all have first-class TypeScript paths. The types are the documentation a new hire can click.",
      "We write it when the product will be kept. We share types across the UI and the API when that saves meetings. We do not add a type circus that hides a simple page.",
    ],
    [
      [
        "Microsoft",
        "Created TypeScript and uses it across VS Code, Office on the web, and Azure tooling.",
      ],
      [
        "Google",
        "A large share of Angular and of Google's web properties are TypeScript.",
      ],
      [
        "Slack",
        "The desktop and web clients are a well-known TypeScript codebase.",
      ],
      [
        "Airbnb",
        "Publicly described migrating a huge JavaScript surface to TypeScript.",
      ],
      [
        "Shopify",
        "Hydrogen, Polaris, and a large share of new storefront work are TypeScript.",
      ],
    ],
  ),

  dotnet: brief(
    [
      ".NET is Microsoft's runtime and ecosystem for building applications, most often in C#. It covers web APIs (ASP.NET), desktop, games (Unity sits next to it), and cloud workers on Azure. A company that already staffs C# developers should not be forced onto a stack it cannot hire for.",
      "The modern shape is cross-platform: Linux, containers, OpenAPI at the edge. The old joke about Windows-only servers is stale. What remains true is that .NET shops have a way of naming domain objects, and the front end should respect that contract rather than pretend it is not there.",
    ],
    [
      "Teams use .NET for business APIs, internal tools, payment and ledger services, and anything that already lives next to SQL Server or Azure. Unity studios use C# for games. Public websites often sit in front as React or Next.js talking to a .NET API.",
      "We keep the domain in .NET when that is the language the company already thinks in, and we put a web surface on it with a contract both rooms can read. We do not rewrite a healthy C# estate for fashion.",
    ],
    [
      [
        "Stack Overflow",
        "A famous ASP.NET site, still a reference for high-traffic .NET on the web.",
      ],
      [
        "Microsoft",
        "Office 365, Azure portals, and GitHub's own services use .NET extensively.",
      ],
      [
        "Unity",
        "The dominant game engine's scripting language is C# on a .NET-class runtime.",
      ],
      [
        "JetBrains",
        "Rider, YouTrack, and a large share of their stack sit on .NET.",
      ],
      [
        "Stack Overflow for Teams",
        "The same ASP.NET lineage, sold as a product inside companies.",
      ],
    ],
  ),

  javascript: brief(
    [
      "JavaScript is the language the browser already speaks. Every button, every client-side form, every React tree becomes JavaScript before it runs. On the server, Node and Deno run the same language. It is not a framework. It is the runtime of the web.",
      "The language is messy, ubiquitous, and still the thing you cannot opt out of if you ship to a screen. TypeScript, React, Vue, and Svelte are opinions on top. JavaScript is what actually executes.",
    ],
    [
      "Teams use it for interactive sites, single-page apps, serverless functions, browser extensions, and desktop shells (Electron). If the product has a front end, JavaScript is in the bundle even when the source is TypeScript.",
      "We write it carefully, type it when we can, and we do not send a novel to do a button's job. Performance is a JavaScript problem as much as a design problem.",
    ],
    [
      [
        "Netflix",
        "The web app and a large share of TV UI work are JavaScript at runtime.",
      ],
      [
        "PayPal",
        "An early Node.js adopter, with JavaScript on the payment web stack.",
      ],
      [
        "Meta",
        "Facebook, Instagram on the web, and WhatsApp Web are JavaScript applications.",
      ],
      [
        "Google",
        "Gmail, Maps, and Docs are among the largest JavaScript applications ever shipped.",
      ],
      [
        "Wikipedia",
        "The site and its editors run a substantial JavaScript layer on every article.",
      ],
    ],
  ),

  python: brief(
    [
      "Python is a general-purpose language known for being readable, for a huge library ecosystem, and for sitting under a lot of data, science, and back-end work. Django and Flask built a generation of web products. Pandas, NumPy, and PyTorch built a generation of analysis and models.",
      "It is not the language of the browser. It is the language of APIs, jobs, notebooks, scraping, and training. Instagram famously ran on Django. A lot of the AI stack you call from a web app was trained and served with Python somewhere in the chain.",
    ],
    [
      "Teams use Python for APIs, data pipelines, machine learning, automation, and internal tools. It is a default in research, finance, and any brief that has a model or a warehouse next to the website.",
      "We use it when the job is a service, a job runner, or a notebook that has to become a product. The site in front can still be TypeScript. Python does not have to own the pixels.",
    ],
    [
      [
        "Instagram",
        "Built on Django, still one of the largest Python web applications.",
      ],
      [
        "Spotify",
        "Uses Python extensively in data, recommendations, and back-end services.",
      ],
      [
        "Dropbox",
        "A well-known Python shop for the sync engine and many services.",
      ],
      [
        "NASA",
        "Scientific computing and mission tools have a long Python lineage.",
      ],
      [
        "YouTube",
        "The early web stack was Python, and it still sits in parts of Google's video work.",
      ],
    ],
  ),

  html5: brief(
    [
      "HTML5 is the markup language of the web: the headings, buttons, forms, video, and structure a browser reads before it paints. It is not a brand you install. It is the document. Every site, including this one, is HTML by the time it reaches a person.",
      "The HTML5 era named a set of capabilities the old web lacked: native video and audio, semantic elements, canvas, offline storage, geolocation. Those are now just the platform. Saying HTML5 still matters because accessibility, outline, and forms live or die in the markup, not in the CSS.",
    ],
    [
      "Teams use HTML to structure pages so search, screen readers, and browsers can read them. A design system that forgets the document becomes a pile of divs. Forms, landmarks, and headings are HTML work even when React is generating them.",
      "We write semantic pages. Buttons are buttons. A heading rank matches the outline. We do not ship a canvas of divs and call it a site.",
    ],
    [
      [
        "The BBC",
        "A public-service site that treats HTML structure as a product requirement.",
      ],
      [
        "GOV.UK",
        "The UK government platform is famous for plain, correct HTML.",
      ],
      ["Wikipedia", "Articles are HTML documents first, skin second."],
      [
        "The New York Times",
        "Story templates are HTML, however fancy the client layer is.",
      ],
      [
        "Every site",
        "If it opens in a browser, it is HTML by the time it arrives.",
      ],
    ],
  ),

  css: brief(
    [
      "CSS is the language that tells a browser how HTML should look: type, colour, space, layout, motion. Flexbox, Grid, custom properties, and container queries are how modern interfaces are actually built. Frameworks like Tailwind compile to CSS. They do not replace it.",
      "When a page feels cheap or broken, it is often CSS: contrast, measure, stacking, the mobile layout that was never tried. Design systems are CSS with names. A brand that only lives in Figma is not a brand on the site.",
    ],
    [
      "Teams use CSS to ship a look that survives a tenth page: type scales, spacing, dark and light, print, and the reduced-motion case. Component libraries are CSS plus structure. Marketing sites and apps both live or die on it.",
      "We write a small system and reuse it. We do not leave a landfill of one-off classes. Performance is also CSS: we do not hide 4MB of animation behind a lander.",
    ],
    [
      [
        "Apple",
        "apple.com is a reference for what careful CSS can still do in Safari.",
      ],
      [
        "Stripe",
        "The marketing site and dashboard are a widely studied CSS and type system.",
      ],
      ["GOV.UK", "The Design System is CSS as public infrastructure."],
      [
        "The Guardian",
        "A long-running responsive newsfront, rebuilt more than once in CSS.",
      ],
      [
        "Figma",
        "The app UI in the browser is a CSS and canvas hybrid at serious scale.",
      ],
    ],
  ),

  swift: brief(
    [
      "Swift is Apple's language for iOS, macOS, watchOS, and visionOS. It replaced Objective-C as the default for new Apple work: safer memory, a modern syntax, and first-class SwiftUI. If you are writing a native Apple app in this decade, you are probably writing Swift.",
      "It is also appearing on the server (Vapor) and, experimentally, beyond Apple. The centre of gravity remains Xcode, the SDK, and the App Store. Swift is how the iPhone app is actually said.",
    ],
    [
      "Teams use Swift for iPhone and iPad apps, Mac utilities, widgets, and Watch companions. SwiftUI for new surfaces, UIKit where the OS still demands it. Shared business logic sometimes lives in Swift packages consumed by more than one app.",
      "We write Swift when the brief needs the device, not a wrapper. The API stays the same as the website. Sign-in stays the same. The language is native. The product is not a second company.",
    ],
    [
      [
        "Apple",
        "All of Apple's own new apps are Swift, from Music to Shortcuts.",
      ],
      ["Lyft", "A well-known Swift iOS codebase for riders and drivers."],
      ["LinkedIn", "The iOS app is a large Swift project."],
      [
        "Airbnb",
        "Rebuilt much of iOS in Swift rather than keeping a web view as the product.",
      ],
      ["Stripe", "iOS SDKs and example apps are Swift-first."],
    ],
  ),

  kotlin: brief(
    [
      "Kotlin is JetBrains' language, and Google's preferred language for Android. It runs on the JVM, so it also shows up in back ends (Ktor, Spring) and in multiplatform projects that share logic between Android and iOS. It is Java with the sharp edges filed down, and a type system people actually want to use.",
      "On Android it is the default for new modules. Coroutines, Jetpack Compose, and the Play toolchain assume you can read Kotlin. A team still writing only Java is not wrong, but they are swimming upstream.",
    ],
    [
      "Teams use Kotlin for Android apps first, then sometimes for shared mobile logic and for JVM services that want a modern language without leaving the Java ecosystem. Compose is the UI layer Google is pushing. Views remain in a lot of production apps.",
      "We write Kotlin when Android is in the brief. We share the API with the site. We do not invent a second domain model for the phone.",
    ],
    [
      [
        "Google",
        "Android Jetpack, Play, and a large share of Google's own apps are Kotlin.",
      ],
      ["Netflix", "The Android app is a flagship Kotlin codebase."],
      ["Pinterest", "An early public Kotlin adopter on Android."],
      ["Slack", "The Android client is Kotlin, next to a TypeScript desktop."],
      [
        "Gradle",
        "The build tool's own language story includes Kotlin DSL as a first-class path.",
      ],
    ],
  ),

  go: brief(
    [
      "Go is the language Google designed for networked services: simple, compiled, garbage-collected, with concurrency as a primitive (goroutines). It is the language of Docker, Kubernetes, and a large share of the cloud plumbing people never see.",
      "Teams pick it for APIs, CLIs, and workers that have to be small, fast to deploy, and easy to read six months later. It is not a UI language. It is a service language with an opinion about what should not be in the language.",
    ],
    [
      "Companies use Go for gateways, proxies, orchestration, and back ends that sit behind a TypeScript or mobile client. Cloudflare, Uber, and Twitch have all talked about Go in production. If the product is a container platform, Go is probably already in the repo.",
      "We use it for services that need to be boring and fast. The interface can still be Next.js. Go does not have to own the pixels.",
    ],
    [
      [
        "Docker",
        "The original engine and CLI are Go, which is why containers feel like Go culture.",
      ],
      [
        "Kubernetes",
        "Google's orchestrator, written in Go, now the default cluster API.",
      ],
      [
        "Uber",
        "Has published extensively on Go services at marketplace scale.",
      ],
      ["Cloudflare", "A large share of edge and control-plane work is Go."],
      [
        "Twitch",
        "Has used Go for chat, video plumbing, and high-throughput services.",
      ],
    ],
  ),

  react: brief(
    [
      "React is Meta's library for building user interfaces from components. It is the default way a large share of product teams describe a screen: state in, UI out, a tree of pieces you can reuse. Instagram, Facebook, WhatsApp Web, and a long list of dashboards are React applications.",
      "It is not a website by itself. You still need routing, data, and a build. Next.js, Remix, and Expo sit on top. React Native takes the same idea to phones. The centre is the component model, not the file extension.",
    ],
    [
      "Teams use React for web apps, design systems, and anything with enough interaction that a static template becomes a fight. Marketing sites use it when the CMS and the product share a system. Internal tools use it because hiring for React is easy.",
      "We build in React when the interface has states, not only pages. We keep the tree small. We do not fetch the world to render a heading.",
    ],
    [
      [
        "Meta",
        "Facebook, Instagram, and WhatsApp Web are the original React proving ground.",
      ],
      ["Netflix", "The web app is a well-known React surface."],
      [
        "Airbnb",
        "A long-time React shop for the booking product and internal tools.",
      ],
      ["Discord", "The desktop and web clients are React (and Electron)."],
      [
        "The New York Times",
        "Interactive desks and product surfaces ship a lot of React.",
      ],
    ],
  ),

  "next-js": brief(
    [
      "Next.js is Vercel's React framework for production websites: routing, server rendering, static generation, API routes, and a build that understands the server and the browser as one app. It is how a lot of serious marketing sites and a lot of SaaS products actually ship React.",
      "The App Router, Server Components, and a file-based map of the site are the current shape. You still write React. Next.js decides when HTML is made, how a URL maps to a page, and how a preview deploy gets a link. TikTok's web presence, Notion, and a long list of retailers have shipped on it.",
    ],
    [
      "Teams use Next.js when they want React without pretending a single-page app is a good first paint. Content sites, authenticated products, and hybrids that share a design system all land here. Vercel is the default host. The app can still run on Node elsewhere.",
      "We use it as the default for company sites and product UIs we intend to keep. Preview URLs for every change. The repository is yours. Next is how we ship, not how we keep you.",
    ],
    [
      ["TikTok", "The web app is a high-traffic Next.js product."],
      ["Notion", "Has used Next.js for marketing and product web surfaces."],
      ["Hulu", "A widely cited Next.js streaming site."],
      ["Nike", "Has shipped large commerce and campaign sites on Next.js."],
      [
        "OpenAI",
        "ChatGPT's web app and openai.com have been Next.js properties.",
      ],
    ],
  ),

  "node-js": brief(
    [
      "Node.js is the runtime that put JavaScript on the server. It is how Next.js builds, how a lot of APIs listen, how CLIs in the JavaScript world run. Netflix, PayPal, LinkedIn, and Uber all bet on it early for I/O-heavy services.",
      "It is not a language. It is the engine (V8) plus a library for files, network, and processes. npm is the package universe that grew around it. If your front end is TypeScript, Node is probably how it compiles and how the preview starts.",
    ],
    [
      "Teams use Node for APIs, server-rendered sites, build tooling, queues, and serverless functions. It is the default companion to a React or Vue UI because the team already speaks JavaScript.",
      "We run Node where the product already does. We keep the version pinned. We do not put business-critical ledgers in a process just because the UI is JavaScript.",
    ],
    [
      [
        "Netflix",
        "An early public Node.js adopter for the streaming web stack.",
      ],
      ["PayPal", "Rebuilt parts of the payment web experience on Node."],
      [
        "LinkedIn",
        "Moved mobile back ends to Node to handle a lot of connections cheaply.",
      ],
      ["Uber", "Has run large matching and dispatch services on Node."],
      ["NASA", "Has used Node in mission-support and public web tools."],
    ],
  ),

  tailwind: brief(
    [
      "Tailwind CSS is a utility CSS framework: small classes that map to CSS properties, composed in the markup instead of inventing a class name for every new layout. GitHub, Laravel's marketing, and a large share of new product UIs use it because the system is the classes, not a 400-line SCSS file nobody owns.",
      "It does not replace design. A bad type scale in Tailwind is still a bad type scale. What it replaces is the argument about where the CSS lives. Used with a small set of tokens, it stays a system. Used as a junk drawer, it becomes a junk drawer.",
    ],
    [
      "Teams use Tailwind to ship interfaces quickly with a consistent spacing and type scale, especially in React and Next.js apps. Designers who can read the classes can review a pull request without opening a second tool.",
      "We set tokens first, then utilities. We do not paste a landing-page dump of arbitrary values. The system has to survive a tenth page.",
    ],
    [
      ["GitHub", "Has used Tailwind on marketing and product surfaces."],
      [
        "Laravel",
        "The PHP framework's official sites and starter kits are Tailwind-first.",
      ],
      [
        "OpenAI",
        "Marketing and product web UI have shipped with Tailwind utilities.",
      ],
      [
        "Shopify",
        "Hydrogen templates and many Hydrogen storefronts start on Tailwind.",
      ],
      [
        "Vercel",
        "Templates and a large share of the Next.js example ecosystem are Tailwind.",
      ],
    ],
  ),

  "vue-js": brief(
    [
      "Vue.js is an open-source UI framework created by Evan You. It is the other mainstream component model next to React: templates or render functions, reactive state, a gentler learning curve for teams coming from HTML. Alibaba, Xiaomi, GitLab, and Nintendo have all shipped Vue at scale.",
      "Nuxt is the production framework around it, the way Next.js is around React. Vue is the library. The product still needs routing, data, and a host. In China and in a lot of Laravel shops, Vue is the default rather than the alternative.",
    ],
    [
      "Teams use Vue for dashboards, marketing sites, and apps where the markup should still look like markup. It is a strong fit when the team already writes Vue, or when the CMS and the front end want a template-first mental model.",
      "We build in Vue when that is the language the keepers already speak. We do not rewrite a healthy Vue app into React for taste.",
    ],
    [
      [
        "Alibaba",
        "One of the largest Vue deployments, across consumer and merchant surfaces.",
      ],
      ["Xiaomi", "A Vue shop for a large share of its web products."],
      ["GitLab", "The product UI has a long Vue history."],
      ["Nintendo", "Has used Vue on public web properties."],
      [
        "Adobe",
        "Portfolio and some creative web tools have shipped Vue interfaces.",
      ],
    ],
  ),

  nuxt: brief(
    [
      "Nuxt is the production framework for Vue: file-based routing, server rendering, static generation, and a module ecosystem. It is to Vue what Next.js is to React. If you want a Vue site that paints HTML first and still behaves like an app, Nuxt is the usual answer.",
      "It can host content sites, authenticated products, and hybrid storefronts. Nitro, the server engine, is how it runs on Node, serverless, or edge. The Vue team treats it as the recommended path for new full apps.",
    ],
    [
      "Teams use Nuxt when they are already in Vue and need SEO, previews, and a serious deployment story. Agencies that keep Laravel or headless WordPress in the back often put Nuxt in front.",
      "We use it when Vue is the right UI and the site has to ship as a real application, not a pile of widgets. The repo and the host stay yours.",
    ],
    [
      ["GitLab", "Nuxt and Vue sit in the wider GitLab front-end story."],
      ["Upwork", "Has used Nuxt on public marketing and product web surfaces."],
      ["BackMarket", "A large marketplace front end in the Nuxt ecosystem."],
      [
        "Le Monde",
        "A newsroom that has shipped Nuxt as part of its digital stack.",
      ],
      [
        "Vue's own sites",
        "vuejs.org and nuxt.com are Nuxt applications, which is the honest demo.",
      ],
    ],
  ),

  svelte: brief(
    [
      "Svelte is a compiler that turns components into tight JavaScript, instead of shipping a runtime that diffs a virtual DOM. You write something that looks like HTML, CSS, and script. The build emits something closer to vanilla. The New York Times, Apple Music on the web, and Spotify have all used it where they wanted less client weight.",
      "SvelteKit is the app framework: routing, server rendering, adapters for different hosts. Svelte is the component model. It is smaller than React in cultural weight, which is either a reason to pick it or a reason to pause if hiring is the constraint.",
    ],
    [
      "Teams use Svelte for highly interactive articles, marketing that has to stay light, and apps where bundle size is a named requirement. Newsrooms like it because a graphic should not cost a React tax.",
      "We use it when the brief wants a small client and the team can keep it. We do not pick it as a personality. If the rest of the company is React, we stay in React.",
    ],
    [
      [
        "The New York Times",
        "Interactive stories and graphics desks have shipped a lot of Svelte.",
      ],
      ["Apple", "Apple Music on the web has used Svelte in production."],
      ["Spotify", "Has used Svelte for parts of the web experience."],
      [
        "Cloudflare",
        "Has shipped Svelte and SvelteKit examples and internal tools.",
      ],
      ["IKEA", "Has used Svelte in parts of the retail web stack."],
    ],
  ),

  postgresql: brief(
    [
      "PostgreSQL is an open-source relational database: tables, transactions, JSON when you need it, GIS when you need it, and a reputation for being the serious default. Instagram, Reddit, Apple, Twitch, and Notion have all run large estates on it. If a product has a source of truth, it is often Postgres.",
      "It is not a spreadsheet. It is the record. ORMs like Prisma sit in front. Hosts like RDS, Cloud SQL, Neon, and Supabase rent it to you. The skill is the schema, the migrations, and the backups, not the logo on the console.",
    ],
    [
      "Teams use Postgres for accounts, orders, CMS content, anything that must not double-charge or vanish. Relational integrity is the point. Document stores win some realtime cases. Postgres wins the cases you will still have in five years.",
      "We name tables after the work. Migrations live in the repo. The instance is yours. We do not prototype on fake data that has to be rebuilt to ship.",
    ],
    [
      [
        "Instagram",
        "Moved onto Postgres early and kept it as the social graph grew.",
      ],
      ["Reddit", "A well-known PostgreSQL deployment at community scale."],
      [
        "Apple",
        "Has used Postgres inside a number of large internal and cloud services.",
      ],
      ["Twitch", "Relies on Postgres for core product data."],
      ["Notion", "The workspace product sits on a serious Postgres estate."],
    ],
  ),

  prisma: brief(
    [
      "Prisma is a TypeScript ORM and schema tool for talking to databases, most often PostgreSQL. You describe models in a schema file, generate a client, and migrate with a history that lives in git. It is how a lot of Next.js apps stop scattering raw SQL across route handlers.",
      "It is not the database. It is the contract between the app and the database. Used well, the types match the tables. Used as a hiding place, it becomes a second domain language nobody wanted.",
    ],
    [
      "Teams use Prisma to model users, billing, content, and relations in TypeScript apps. Next.js, Node APIs, and serverless functions all sit on the generated client. Studio is the GUI for a quick look. The source of truth is still the schema file.",
      "We keep migrations next to the UI. A field change is one pull request. We do not pretend the ORM makes backups or policies someone else's problem.",
    ],
    [
      [
        "Cal.com",
        "An open-source scheduling product built with Prisma and Next.js.",
      ],
      [
        "Trigger.dev",
        "A jobs platform in the Prisma and TypeScript generation.",
      ],
      ["Dub", "A link product in the same Next.js and Prisma stack."],
      [
        "Prisma itself",
        "The company's own cloud and docs sit on the tool they sell.",
      ],
      [
        "Next.js shops",
        "A large share of new TypeScript products start with Prisma as the data layer.",
      ],
    ],
  ),

  webflow: brief(
    [
      "Webflow is a visual site builder with a real CMS, hosting, and a class system that can look like a design system if you are strict. It is how a lot of brand and marketing sites ship without a custom repo. Designers can publish. Developers can still inject what the canvas cannot do.",
      "It has a ceiling. Accounts, billing, and strange product logic eventually want code. The honest use is a brochure, a content site, a campaign, with a written path off Webflow when the product outgrows it. Relume, Lattice's marketing, and a long list of Series A sites live here.",
    ],
    [
      "Teams use Webflow for marketing sites, blogs, and landing pages that marketing wants to edit without a pull request. Localization, CMS collections, and form handling are the usual jobs.",
      "We stay when the brief is a site. We plan the exit when the brief is a product. Classes stay few. The account is yours, not a studio login.",
    ],
    [
      ["Lattice", "A well-known B2B marketing site on Webflow."],
      [
        "Relume",
        "The Webflow system company, and a proof of what the platform can carry.",
      ],
      [
        "Dell",
        "Has used Webflow for campaign and product marketing microsites.",
      ],
      ["Maze", "A product-research company whose marketing sits on Webflow."],
      [
        "Pitch",
        "The presentation product's marketing site has been a Webflow property.",
      ],
    ],
  ),

  framer: brief(
    [
      "Framer is a design and publishing tool that starts as a canvas and ends as a hosted site. Motion, CMS, and React components in the same file are the pitch. A lot of startup homepages that feel 'designed' in 2025 were published from Framer rather than from a repo.",
      "It is closer to a high-end brochure than to an application platform. Auth, billing, and app states still want Next.js. Framer wins when the site is the campaign and the motion is the point.",
    ],
    [
      "Teams use Framer for homepages, launch sites, and brand stories that need animation without a front-end sprint. Designers publish. The CMS covers a blog or a changelog. Anything past that is a stretch.",
      "We use it for the site that has to look expensive quickly, with a note on when to leave. We do not fake a SaaS app inside Framer.",
    ],
    [
      ["Framer", "The company's own marketing is the flagship Framer site."],
      [
        "Linear",
        "Has used Framer for campaign and launch pages next to the product app.",
      ],
      ["Raycast", "Marketing surfaces have shipped from Framer."],
      ["Resend", "The email company's site has used Framer for brand pages."],
      [
        "Startup homepages",
        "A large share of recent seed and Series A marketing sites publish from Framer.",
      ],
    ],
  ),

  wordpress: brief(
    [
      "WordPress is the open-source CMS that still runs a huge share of the web: posts, pages, plugins, and a PHP core. TechCrunch, many newsrooms, universities, and a long tail of company blogs are WordPress. There is .org you host yourself and .com that Automattic hosts.",
      "It is a publishing system first. As a product platform it accumulates plugins until nobody can update it. Used as a CMS with a strict theme, or as a headless content API in front of Next.js, it still earns its keep. Used as an app framework, it usually does not.",
    ],
    [
      "Teams use WordPress when editors already know it, when a newsroom needs a desk tomorrow, or when a company blog should not wait on engineering. WooCommerce is the commerce fork. Headless WordPress is the compromise with a modern front end.",
      "We discipline the theme and the plugin list. The account is yours. We say when it is time to stop adding plugins and start a real app.",
    ],
    [
      ["TechCrunch", "A flagship WordPress news site in technology."],
      [
        "The White House",
        "Has run whitehouse.gov on WordPress in multiple administrations.",
      ],
      ["BBC America", "A broadcast brand on WordPress for its public site."],
      [
        "The New Yorker",
        "Has used WordPress in parts of the Condé Nast publishing stack.",
      ],
      [
        "Sony Music",
        "Artist and label sites have long been a WordPress estate.",
      ],
    ],
  ),

  squarespace: brief(
    [
      "Squarespace is a hosted website builder aimed at small businesses, restaurants, portfolios, and studios that want a designed template and a single bill. It is not trying to be AWS. It is trying to be the site a florist can edit on a phone.",
      "Commerce, booking, and email exist in the product. The ceiling is real: custom data models, complex auth, and performance under ad spend all get awkward. The honest use is a beautiful brochure with a shop that is not a marketplace.",
    ],
    [
      "Teams use Squarespace when they need a site this month, with photography, a menu, a few products, and a domain. Designers restyle templates. Developers rarely live here.",
      "We take the brief if it fits. We say no if it is a product story Squarespace cannot ship. The account stays in your name.",
    ],
    [
      [
        "Small restaurants",
        "A large share of independent restaurant sites are Squarespace templates.",
      ],
      [
        "Photographers and studios",
        "Portfolio commerce is a core Squarespace audience.",
      ],
      [
        "The Wing",
        "A well-known brand site that ran on Squarespace in its growth years.",
      ],
      [
        "Kickstarter creators",
        "Campaigns often land on a Squarespace site after the raise.",
      ],
      [
        "Local services",
        "Clinics, gyms, and consultants use it as the default professional site.",
      ],
    ],
  ),

  wix: brief(
    [
      "Wix is a hosted drag-and-drop website builder, with ADI (artificial design) as the on-ramp and a huge app market around it. It is built for people who will not open a repository. The result can look fine. It can also look like a builder.",
      "Velo is the developer layer if you outgrow the canvas. Most Wix sites never get there. For a company that wants a serious product, Wix is usually a holding page, not a destination.",
    ],
    [
      "Teams use Wix for a first site, an event page, or a small local business that will not hire an agency twice. App market widgets cover bookings, stores, and blogs at a basic level.",
      "We use it only when the brief is honest about the ceiling. We do not dress a Wix site as a custom product. If the company needs a system, we leave.",
    ],
    [
      [
        "Local retailers",
        "A large share of first company sites worldwide are Wix.",
      ],
      [
        "Event pages",
        "One-off launches and conferences still start on Wix because it is fast.",
      ],
      [
        "Coca-Cola",
        "Has used Wix for campaign microsites rather than as the global platform.",
      ],
      [
        "Wix themselves",
        "wix.com is the flagship, and a demonstration of the upper bound.",
      ],
      [
        "Franchisees",
        "Brands sometimes hand Wix to local owners as a constrained template.",
      ],
    ],
  ),

  shopify: brief(
    [
      "Shopify is the commerce platform for independent brands and an increasing number of large retailers: catalogue, cart, checkout, payments, and a liquid or Hydrogen storefront. Allbirds, Gymshark, SKIMS, and a long list of D2C companies grew up on it. The back office is the product merchandisers already know.",
      "It can be a theme on Shopify's host, or a custom storefront (Hydrogen, Next.js) talking to the Admin and Storefront APIs. Checkout is still Shopify's gravity. That is the point, and the lock-in.",
    ],
    [
      "Teams use Shopify to sell physical goods, subscriptions, and sometimes digital products, with apps for reviews, subscriptions, and wholesale. Paid traffic hits a lander that must share the cart. Performance on a spend day is part of the brief.",
      "We design the storefront as a system. The shop, the domain, and the payments account are yours. We do not leave a theme you cannot trust when ads turn on.",
    ],
    [
      ["Allbirds", "A flagship D2C brand that scaled on Shopify."],
      ["Gymshark", "A large apparel retailer on Shopify's stack."],
      ["SKIMS", "Kim Kardashian's brand, a high-volume Shopify store."],
      ["Kith", "A fashion retailer whose shop is a Shopify reference."],
      [
        "Heinz",
        "Has used Shopify for direct-to-consumer shops next to retail.",
      ],
    ],
  ),

  figma: brief(
    [
      "Figma is the browser-based design tool where most product interfaces are now drawn: frames, components, variables, prototypes, and a file more than one person can be in at once. Airbnb, Microsoft, Uber, GitHub, and Stripe all run design systems in Figma. Adobe bought it. The product is still Figma.",
      "It is not the website. It is the source of tokens, components, and the ugly states if the team is disciplined. Handoff that is a screenshot in chat is not Figma's fault. It is a process failure.",
    ],
    [
      "Designers use Figma for UI, brand, prototypes, and design systems. Engineers use Dev Mode and variables that should match the code. Writers comment in the file. The file is part of the handover, not a private board.",
      "We set tokens before screens. Names in the file match names in the repo. We do not deliver a deck of pictures with no system.",
    ],
    [
      [
        "Airbnb",
        "A design-system company whose public work helped make Figma the default.",
      ],
      ["Microsoft", "Uses Figma across product teams next to its own tools."],
      ["Uber", "Design systems and rider flows live in Figma."],
      ["GitHub", "Primer and product UI are Figma files as well as code."],
      [
        "Stripe",
        "A widely studied Figma system sitting next to a widely studied site.",
      ],
    ],
  ),

  notion: brief(
    [
      "Notion is a workspace for documents, wikis, databases, and light project tracking. Teams write specs, handbooks, and content calendars in it because a page and a table can live in the same place. Figma, OpenAI, and Pixar have all been public about using it internally.",
      "It is not a product CMS you should pin a production site to without a real pipeline. It is a working surface. Used as the source of marketing copy with an API in front, it can work. Used as the application database, it usually should not.",
    ],
    [
      "Companies use Notion for internal docs, hiring wikis, product specs, and editorial calendars. Some use the API to publish a changelog or a help centre. AI features sit on top of the same pages.",
      "We write into Notion when the team already lives there. We do not make production depend on a page someone can archive by accident, unless that is an explicit, backed-up pipeline.",
    ],
    [
      ["Figma", "A public Notion customer for internal docs and systems."],
      [
        "OpenAI",
        "Has used Notion as an internal workspace while building ChatGPT.",
      ],
      ["Pixar", "Reported as a Notion workplace for production coordination."],
      [
        "Headspace",
        "Has described Notion as part of its company operating system.",
      ],
      ["Mixpanel", "A well-known product team running on Notion wikis."],
    ],
  ),

  linear: brief(
    [
      "Linear is an issue tracker for product teams that want speed and a keyboard: issues, cycles, roadmaps, and a graph that does not feel like Jira. Runway, Ramp, Cursor, and a lot of other product-led companies run the board there. It is project tracking, not a CMS, not a wiki.",
      "The product is opinionated. Statuses, estimates, and git integrations assume a certain kind of team. That is why people switch to it, and why a programme-management office sometimes will not.",
    ],
    [
      "Engineering and product use Linear to plan cycles, triage bugs, and attach pull requests. Designers live in the same issues. The API and the Slack integration are how it sits next to the repo.",
      "We work from Linear when the client already does. We do not force a Jira shop onto Linear as a personality. The board is yours.",
    ],
    [
      [
        "Runway",
        "A public Linear customer in machine learning and film tools.",
      ],
      ["Ramp", "The finance product team has been a visible Linear shop."],
      ["Cursor", "The coding editor's team uses Linear in public view."],
      ["Perplexity", "Has been listed among Linear's product-led customers."],
      [
        "Linear itself",
        "The company runs on its own tracker, which is the honest demo.",
      ],
    ],
  ),

  stripe: brief(
    [
      "Stripe is the payments company: cards, wallets, subscriptions, invoicing, Connect for marketplaces, Billing, Tax, and a dashboard finance actually opens. Shopify, Amazon (in parts of the ecosystem), Google, Lyft, and Instacart have all used Stripe to take money without becoming a bank.",
      "Checkout, Elements, and the API are how a site takes a card. Radar is fraud. Atlas is incorporation. The brand is developer-first payments. The constraint is still PCI, webhooks, and the ugly states: failed card, 3-D Secure, refund.",
    ],
    [
      "Teams use Stripe to charge once, to bill monthly, to pay out connected accounts, and to show a customer portal. The payment form should look like the rest of the site. The webhook is the source of truth for 'paid', not the thank-you page.",
      "We put pay in the path we designed. Accounts and keys are yours. We do not hide a checkout that looks like a third company.",
    ],
    [
      ["Shopify", "Uses Stripe under a large share of independent checkouts."],
      [
        "Amazon",
        "Has used Stripe in parts of its payments and seller ecosystem.",
      ],
      [
        "Google",
        "Cloud and other Google products have offered Stripe as a processor.",
      ],
      ["Lyft", "Rider payments have run through Stripe as the company scaled."],
      ["Instacart", "Grocery checkout at scale on Stripe's stack."],
    ],
  ),

  vercel: brief(
    [
      "Vercel is the cloud that grew up around Next.js: git push, preview URL, production on a domain you own. It is front-end hosting, serverless functions, edge, and a dashboard that makes preview-as-sign-off a habit. ChatGPT's web app, nvidia.com, and The Washington Post have all shipped here.",
      "It is not a general cloud in the AWS sense. It is a place to host the interface and the small functions next to it. Databases, warehouses, and long workers usually live elsewhere. That split is the point.",
    ],
    [
      "Teams use Vercel so every pull request gets a URL a founder can click. Marketing and product share the same Next.js app. Environment variables and the domain sit in the project.",
      "We connect a project you own. DNS and secrets are not rented through us. Production is the preview you approved, promoted.",
    ],
    [
      ["OpenAI", "ChatGPT on the web has been served from Vercel."],
      ["NVIDIA", "nvidia.com is a widely cited Vercel customer."],
      [
        "The Washington Post",
        "Has used Next.js on Vercel for high-traffic news surfaces.",
      ],
      [
        "Twitch",
        "Has shipped web properties on Vercel next to the main product.",
      ],
      ["HashiCorp", "Marketing and docs properties have run on Vercel."],
    ],
  ),

  netlify: brief(
    [
      "Netlify is a git-based hosting platform for sites and functions: previews, a CDN, forms, identity (historically), and split testing. It helped invent the Jamstack workflow that Vercel later owned in the Next.js world. Google, Peloton, Citrix, and Twilio have all hosted properties here.",
      "It is a strong fit for static and hybrid sites, not for a general cloud. Build plugins, branch deploys, and a sane DNS story are the reasons teams stay.",
    ],
    [
      "Teams use Netlify for marketing sites, docs, and JAMstack apps with preview deploys. Functions cover forms and small APIs. Larger data still lives somewhere else.",
      "We use it when the site already belongs there, or when the stack is not Next-on-Vercel. The project and the domain stay in your account.",
    ],
    [
      [
        "Google",
        "Has used Netlify for selected public sites and campaign properties.",
      ],
      ["Peloton", "A well-known Netlify customer for web properties."],
      ["Citrix", "Enterprise marketing and product sites on Netlify."],
      ["Twilio", "Docs and marketing surfaces have run on Netlify."],
      ["Unilever", "Has used Netlify across brand sites in a large estate."],
    ],
  ),

  cloudflare: brief(
    [
      "Cloudflare is the edge company: DNS, CDN, DDoS, WAF, Workers, R2 storage, and a share of the web so large that when Cloudflare has a bad day, a lot of the internet has a bad day. Discord, Shopify, and Zendesk sit behind it. So do a huge number of sites that only wanted DNS and a certificate.",
      "Workers and Pages are how it became a compute platform, not only a shield. The product people feel is speed and protection. The product teams buy is the network plus a place to run small code close to the user.",
    ],
    [
      "Teams use Cloudflare to put a CDN and a firewall in front of a site, to host Workers, to store assets in R2, and to manage DNS. Bot fight, cache rules, and zero-trust access are the enterprise layer.",
      "We put it in front when the brief names performance or abuse. Tokens and the zone are yours. We do not leave a studio-owned DNS record as the live one.",
    ],
    [
      [
        "Discord",
        "Sits behind Cloudflare for a real-time product at consumer scale.",
      ],
      ["Shopify", "Uses Cloudflare as part of how stores stay up under load."],
      ["Zendesk", "A public Cloudflare customer for the support platform."],
      [
        "Garmin",
        "Has used Cloudflare to absorb attack traffic on consumer services.",
      ],
      [
        "A large share of the web",
        "Cloudflare is DNS and CDN for millions of domains, including this class of company site.",
      ],
    ],
  ),

  supabase: brief(
    [
      "Supabase is an open-source backend platform built around PostgreSQL: a hosted database, auth, file storage, realtime, edge functions, and a dashboard. It is the closest thing to 'Firebase, but Postgres' that a TypeScript team can actually like. Mozilla and a long list of startups use it as the data layer for a product.",
      "The source of truth is still Postgres. Row Level Security is the access model. The generated APIs are convenience. If you treat it only as a Firebase clone, you will miss the schema, which is the whole point.",
    ],
    [
      "Teams use Supabase to get auth, a database, and storage without standing up each piece. Next.js apps talk to it with a typed client. Realtime is there for lists that have to move. Vector features sit next to the same Postgres.",
      "We keep the project in your org. Migrations in the repo. Policies you can read. We do not keep a studio-owned instance as leverage.",
    ],
    [
      ["Mozilla", "A public Supabase customer for product and internal tools."],
      [
        "GitHub",
        "Has used Supabase in experimental and internal Next.js work.",
      ],
      ["PwC", "Has been listed among enterprise Supabase adopters."],
      [
        "Humata",
        "An AI product built on Supabase as the application database.",
      ],
      ["Chatbase", "A known AI customer using Supabase for multi-tenant data."],
    ],
  ),

  github: brief(
    [
      "GitHub is Microsoft's home for git: repositories, pull requests, Actions, Packages, Codespaces, and the social layer where open source actually lives. Kubernetes, Next.js, React, and Linux's mirrors sit here. So does almost every product team's private code.",
      "It is not only hosting. It is review, CI, issues (or the link to Linear), and the URL you put in a handover. If the repo is not yours, the product is not yours.",
    ],
    [
      "Teams use GitHub to store code, review changes, run checks, ship Actions, and publish packages. Auth to preview environments often starts with a GitHub user. Open source is the public face. Private repos are the work.",
      "We build on a repository you own. Actions are documented. We do not keep the source of truth on a studio account.",
    ],
    [
      [
        "Microsoft",
        "Owns GitHub and uses it across VS Code, TypeScript, and Azure samples.",
      ],
      [
        "Google",
        "A huge open-source presence, from Angular to Kubernetes-related work.",
      ],
      ["Vercel", "Next.js is developed in public on GitHub."],
      ["Meta", "React and React Native are GitHub projects."],
      [
        "Almost every engineering team",
        "If they write software in this decade, they have a GitHub org or a mirror.",
      ],
    ],
  ),

  docker: brief(
    [
      "Docker is the company and the tooling that made containers ordinary: an image, a file that says how to build it, a runtime that runs the same thing on a laptop and in the cloud. PayPal, Adobe, and The New York Times all moved estates onto containers. Kubernetes then orchestrated what Docker packaged.",
      "A Dockerfile is a recipe. Compose is how a developer runs the database next to the app. The registry is where images live. Docker Desktop is how most designers-turned-engineers first meet the idea. The concept is bigger than the company. The workflow still starts with Dockerfiles.",
    ],
    [
      "Teams use Docker so the app, the database, and the worker start the same way everywhere. CI builds an image. Production runs that image. Onboarding is 'install Docker', not 'install our folklore'.",
      "We keep Dockerfiles in the repo. Local and preview match closely enough. We do not invent a snowflake machine as the only place the build works.",
    ],
    [
      ["PayPal", "An early large Docker estate for payments services."],
      ["Adobe", "Has run Creative Cloud services in containers."],
      [
        "The New York Times",
        "Moved publishing infrastructure toward Docker and orchestration.",
      ],
      ["ADP", "An enterprise Docker customer for HR systems."],
      [
        "AT&T",
        "Has described Docker as part of a large-scale service platform.",
      ],
    ],
  ),

  clerk: brief(
    [
      "Clerk is an authentication product for modern web apps: sign-in, sign-up, organisations, sessions, and prebuilt components that already look like a product. Perplexity, Prisma, and Cal.com have used it so they did not have to rebuild passwords, magic links, and MFA for the tenth time.",
      "It is a vendor in the critical path. Users, sessions, and organisations live in Clerk until you also write them to your database. That is fine if you treat Clerk as the door and your Postgres as the house.",
    ],
    [
      "Teams use Clerk to get a complete account experience in Next.js quickly: Google and GitHub login, orgs for B2B, webhooks when a user changes. The UI components save weeks. The configuration lives in Clerk's dashboard and in your env.",
      "We map roles to actual screens. The Clerk application is yours. User records that the product needs beyond a profile also live in a database you own.",
    ],
    [
      [
        "Perplexity",
        "A well-known Clerk customer for consumer sign-in at search scale.",
      ],
      ["Prisma", "Uses Clerk on product surfaces next to its own data tools."],
      ["Cal.com", "Open-source scheduling with Clerk as an auth option."],
      ["Rapha", "A commerce brand that has used Clerk on member experiences."],
      [
        "Next.js apps",
        "Clerk is a default auth recommendation in a large share of new Next.js products.",
      ],
    ],
  ),

  auth0: brief(
    [
      "Auth0, now part of Okta, is an identity platform for applications that need more than a password form: social login, enterprise SSO, MFA, passwordless, and a rules engine. Autodesk, Mozilla, and Siemens use it when identity is a product requirement, not a weekend feature.",
      "It is older and broader than Clerk. That is a strength in enterprise (SAML, OIDC, a thousand connections) and a weight if all you needed was Google login on a Next.js lander. Universal Login is the hosted door. Your app still has to handle the session after the door.",
    ],
    [
      "Teams use Auth0 to centralise login across several apps, to connect Entra or Okta workforce identity, and to add MFA without inventing it. APIs get JWTs. The dashboard is where connections live.",
      "We design the journey: invite, first run, lockout, recovery. The tenant is yours. We do not add a fourth password when the work login already exists.",
    ],
    [
      ["Autodesk", "A long-standing Auth0 customer for product identity."],
      ["Mozilla", "Has used Auth0 in the wider Mozilla account story."],
      ["Siemens", "Enterprise identity through Auth0 and Okta."],
      [
        "The Home Depot",
        "Has been a public Okta/Auth0-class identity customer.",
      ],
      [
        "Experian",
        "Identity at credit-bureau scale on the Okta and Auth0 stack.",
      ],
    ],
  ),

  mapbox: brief(
    [
      "Mapbox is a mapping platform built on OpenStreetMap and a lot of Mapbox's own data: custom styles, vector tiles, navigation, search, and SDKs for web, iOS, and Android. The Weather Company, Snap, Facebook, and The New York Times have all used it when they wanted a map that did not look like Google's default, or when they wanted a different commercial relationship.",
      "Studio is where the style is designed. GL JS is how it lands on a site. The map can match the type and colour of the product instead of dropping a blue-pin widget in a sidebar.",
    ],
    [
      "Teams use Mapbox for locators, data maps, logistics, and any interface where the map is a designed surface. Isochrones, matrix, and matching cover the cases Google also covers, with a different look and contract.",
      "We style the map to the brand, budget the load, and keep a list fallback. The token is yours. A 4MB widget on a lander is a refuse.",
    ],
    [
      [
        "The Weather Company",
        "IBM's weather maps have used Mapbox as the tile and style layer.",
      ],
      [
        "Snap",
        "Snapchat's map features have been a flagship Mapbox deployment.",
      ],
      ["Meta", "Facebook has used Mapbox in location products."],
      [
        "The New York Times",
        "News graphics and locators have shipped on Mapbox.",
      ],
      [
        "The Financial Times",
        "Data maps and newsroom graphics on Mapbox styles.",
      ],
    ],
  ),

  resend: brief(
    [
      "Resend is a transactional email API built for developers who already live in Next.js: send a receipt, a magic link, an invite, with React as the template language. It is not a consumer mailbox. It is how the product writes to people without standing up Mailgun folklore.",
      "The dashboard shows deliveries. DNS (SPF, DKIM, DMARC) is still your domain's job. React Email is the companion for templates that look like the product instead of like 2008 HTML.",
    ],
    [
      "Teams use Resend for auth mail, invoices, notifications, and marketing that is still transactional in spirit. Next.js route handlers call it. Templates live in the repo.",
      "We send from a domain you own. We do not bury transactional mail in a studio account. If it is a campaign newsletter, we say so and pick a tool that is actually for that.",
    ],
    [
      [
        "Cal.com",
        "Sends booking mail through a modern transactional stack in the Resend generation.",
      ],
      ["Dub", "A link product using Resend for product email."],
      ["Loops", "Works alongside Resend in the same Next.js email ecosystem."],
      ["Bun", "Has used Resend in public examples and product mail."],
      [
        "Next.js teams",
        "Resend is a default recommendation in Vercel's email examples.",
      ],
    ],
  ),
};

export function productBriefFor(slug: string, name: string): ProductBrief {
  return (
    PRODUCT_BRIEFS[slug] ?? {
      what: [
        `${name} is a product we put in a build when the brief names it, not because it is fashionable.`,
      ],
      usedFor: [
        `Teams reach for ${name} when it already sits in the room, or when it is the honest tool for the job. We keep the account in your name.`,
      ],
      knownUsers: [],
    }
  );
}
