import { COMPANY_DETAIL } from "@/data/topics/company-detail";
import { productBriefFor } from "@/data/topics/product-brief";
import { productStanceFor } from "@/data/topics/product-stance";
import { TECHNOLOGY_DETAIL } from "@/data/topics/tech-detail";
import type {
  Topic,
  TopicDetail,
  TopicDetailSeed,
  TopicPoint,
} from "@/data/topics/types";

export type { TopicDetail, TopicDetailSeed } from "@/data/topics/types";

type GroupPack = {
  process: TopicPoint[];
  deliverables: string[];
  refuse: string[];
};

function named(name: string, pack: GroupPack): GroupPack {
  const swap = (text: string) => text.replaceAll("{name}", name);
  return {
    process: pack.process.map((item) => ({
      title: swap(item.title),
      body: swap(item.body),
    })),
    deliverables: pack.deliverables.map(swap),
    refuse: pack.refuse.map(swap),
  };
}

const CLOUD: GroupPack = {
  process: [
    {
      title: "Map what you already pay for",
      body: "We start with the account, the regions, and the bill you already have. {name} is only in the architecture if it earns its place.",
    },
    {
      title: "Prototype on the real shape",
      body: "The preview talks to the same kind of storage, jobs, and secrets you would use in production. You click the product, not a slide of a diagram.",
    },
    {
      title: "Smallest set of services",
      body: "Compute, storage, and the one extra that the brief named. We do not open a catalogue of {name} products to look busy.",
    },
    {
      title: "Environments you can promote",
      body: "Preview, staging, production. Keys in your project. A rollback you can do without calling us.",
    },
    {
      title: "Handover with the account",
      body: "IAM, env files, and a runbook in the repo. The {name} tenancy stays in your name.",
    },
  ],
  deliverables: [
    "Architecture notes that match the running app",
    "Environments and secrets in your {name} project",
    "Preview URLs for every change",
    "Jobs and storage with keys you hold",
    "A runbook for deploy, rollback, and rotation",
    "The application on a repository you own",
  ],
  refuse: [
    "A rewrite onto {name} because a diagram looked tidy",
    "Services you cannot explain on the invoice",
    "A studio account sitting between you and production",
  ],
};

const AI: GroupPack = {
  process: [
    {
      title: "Name the task, not the model",
      body: "We find the step that wastes time: a draft, a summary, a classification. {name} only sits on that step.",
    },
    {
      title: "Prototype the interface first",
      body: "You click the flow with a real assist. If the page does not work without the model, we have designed the wrong thing.",
    },
    {
      title: "Keys, prompts, and limits",
      body: "Your {name} project. Prompts you can edit. Logs you can read. A cap so a loop cannot spend the month.",
    },
    {
      title: "Fallback when the model is down",
      body: "The product still submits, still saves, still shows the last good draft. Assist is optional in the worst hour.",
    },
    {
      title: "Handover you can switch off",
      body: "A flag, a prompt file, and the API in the repo. You are not rented to a chatbot skin.",
    },
  ],
  deliverables: [
    "A flow where {name} is a step, not the product",
    "Prompts and limits in the repository",
    "Your keys and usage logs",
    "A fallback when the API fails",
    "Review in the UI so a person still sends the thing",
    "A prototype you can refuse before the rest of the spend",
  ],
  refuse: [
    "A chat window because the brief mentioned AI",
    "Answers with no source the user can open",
    "A product that dies when {name} is down",
  ],
};

const LANGUAGE: GroupPack = {
  process: [
    {
      title: "Write in the language the team can keep",
      body: "{name} is in the repo because someone after us has to change it. We do not pick it for fashion.",
    },
    {
      title: "Types and structure before polish",
      body: "The prototype already uses the shapes we would ship. You click the real model, not a mock of one.",
    },
    {
      title: "One way of doing the ordinary things",
      body: "Lint, test, and folder rules so a tenth page does not invent a second style.",
    },
    {
      title: "Build on a repository you own",
      body: "The {name} code is the product. Nothing important lives only in a studio machine.",
    },
    {
      title: "Handover a new hire can run",
      body: "One command, a README that is short, and types that explain the domain.",
    },
  ],
  deliverables: [
    "Production {name} on your repository",
    "Lint and test hooked to the pull request",
    "Shared types or schemas where they earn their keep",
    "A local run that matches production closely enough",
    "Notes on the few libraries we actually used",
    "A walkthrough so the next person is not guessing",
  ],
  refuse: [
    "A rewrite into {name} for taste",
    "A forest of libraries that hide the language",
    "Code that only runs on a laptop we keep",
  ],
};

const FRAMEWORK: GroupPack = {
  process: [
    {
      title: "Routes and content model first",
      body: "Before we paint, we know the pages, the states, and what the CMS may change. {name} follows that map.",
    },
    {
      title: "A preview you can refuse",
      body: "The {name} app is on a URL. Sign-off happens in the browser. The rest of the budget waits.",
    },
    {
      title: "Components that survive a tenth page",
      body: "The design system is code. A new template is composition, not a one-off file.",
    },
    {
      title: "Integrations in the same repo",
      body: "Auth, mail, and payments are not a zap. They live next to the UI.",
    },
    {
      title: "Launch on a domain you own",
      body: "Hosting, env, and DNS in your name. {name} is how we ship, not how we keep you.",
    },
  ],
  deliverables: [
    "A {name} app on your repository",
    "Preview deploys for every change",
    "A CMS or content model your team can use",
    "Typed routes and shared UI",
    "Analytics events that match the journeys",
    "A handover of domain, env, and the board",
  ],
  refuse: [
    "A starter theme dressed as a product",
    "A rewrite off {name} without a reason in the brief",
    "A CMS that still needs us for a copy change",
  ],
};

const BUILDER: GroupPack = {
  process: [
    {
      title: "Say what {name} can carry",
      body: "If the brief is a brochure, we stay. If it is accounts and billing, we plan the exit before we decorate the template.",
    },
    {
      title: "A small class and type system",
      body: "We do not leave a maze. Tokens, a few components, and rules a marketer can follow.",
    },
    {
      title: "CMS collections with limits",
      body: "The team can publish. They cannot invent a thirteenth heading style by accident.",
    },
    {
      title: "Performance inside the platform",
      body: "Images, scripts, and the form are budgeted. A builder is not an excuse for a slow lander.",
    },
    {
      title: "A written path off {name}",
      body: "When the product outgrows it, the writing and the structure come with us. The lock-in does not.",
    },
  ],
  deliverables: [
    "A {name} site that looks like the company",
    "A short system of type, colour, and spacing",
    "CMS collections the team can actually fill",
    "Form and analytics wired to something you own",
    "A handover of the account, not a studio login",
    "Notes on when to leave {name} and what to take",
  ],
  refuse: [
    "A custom product story {name} cannot ship",
    "A class landfill nobody can edit",
    "Silence about the ceiling until you hit it",
  ],
};

const DATA: GroupPack = {
  process: [
    {
      title: "Schema in the language of the work",
      body: "Tables and types named after the jobs, not after the ORM. {name} holds the record. Spreadsheets do not.",
    },
    {
      title: "Prototype on the real model",
      body: "You click the product against the tables we would keep. We do not fake the data layer for a demo.",
    },
    {
      title: "Policies and backups you can see",
      body: "Who can read a row, how you restore a dump, where the keys live. All of that is in the handover.",
    },
    {
      title: "App and database in one repo story",
      body: "Migrations next to the UI. A change to a field is one pull request, not a folklore of columns.",
    },
    {
      title: "The instance is yours",
      body: "{name} runs in a project you control. We do not keep a copy as leverage.",
    },
  ],
  deliverables: [
    "A schema and migrations in the repository",
    "Roles or policies that match the product",
    "A seed for local and preview",
    "Backup and restore notes",
    "Typed access from the app",
    "Keys and the project in your name",
  ],
  refuse: [
    "A black-box database you cannot export",
    "A prototype on fake data that has to be rebuilt",
    "A studio-owned instance of {name}",
  ],
};

const AUTH: GroupPack = {
  process: [
    {
      title: "Identity as a journey",
      body: "Sign-in, invite, first-run, and the empty app. {name} is the door. The product still has a job after the door.",
    },
    {
      title: "Prototype with real accounts",
      body: "You create a user. You invite a teammate. You get locked out and recover. Then we build the rest.",
    },
    {
      title: "Roles that mean screens",
      body: "Claims map to the UI. Nobody sees an admin they should not, and the names match how the company talks.",
    },
    {
      title: "Your tenant, our interface",
      body: "The {name} application is yours. We design the pages around it, including the ugly states.",
    },
    {
      title: "Handover of the identity vendor",
      body: "You can add a connection or rotate a key without us in the middle.",
    },
  ],
  deliverables: [
    "Sign-in, invite, and recovery on {name}",
    "Roles mapped to actual screens",
    "A first-run that is not a blank dashboard",
    "Your {name} application and keys",
    "User records in a database you own when the product needs more than a profile",
    "A prototype of the account journeys",
  ],
  refuse: [
    "A fourth password when the work login already exists",
    "Auth as a side project after the UI is painted",
    "A studio-owned {name} tenant",
  ],
};

const HOST: GroupPack = {
  process: [
    {
      title: "Previews before production",
      body: "Every change gets a {name} URL you can click. That is how sign-off works here.",
    },
    {
      title: "Domain and env in your account",
      body: "We connect the project you own. DNS, certificates, and secrets are not rented through us.",
    },
    {
      title: "The same app you already used",
      body: "Production is the preview you approved, promoted. No mysterious rebuild on launch night.",
    },
    {
      title: "Logs and rollback you can reach",
      body: "The runbook says how to read a fail and how to go back. You should not need us for that.",
    },
    {
      title: "Handover of the project",
      body: "Seats, env, and the domain. {name} stays a host, not a lock.",
    },
  ],
  deliverables: [
    "A {name} project in your account",
    "Preview deploys on every pull request",
    "Production on a domain you own",
    "Env values documented",
    "A rollback note in the repo",
    "Access for your team, not a studio seat as the source of truth",
  ],
  refuse: [
    "Hosting that only we can log into",
    "A launch that is a different app from the preview",
    "A domain parked in a studio registrar",
  ],
};

const DESIGN: GroupPack = {
  process: [
    {
      title: "Tokens before screens",
      body: "Type, colour, and space in {name} first. Pages come from those parts, not the other way around.",
    },
    {
      title: "Flows you can click",
      body: "The prototype is the file or the live app. You refuse structure before we polish pixels.",
    },
    {
      title: "States, not only happy paths",
      body: "Empty, error, loading, and the tenth page. {name} holds them so engineering does not invent hover from memory.",
    },
    {
      title: "Handoff that matches the code",
      body: "Names in the file match names in the repo. The brand does not fork at the boundary.",
    },
    {
      title: "A system the next designer can open",
      body: "The {name} file is part of the handover, not a private board.",
    },
  ],
  deliverables: [
    "A {name} system file with tokens and components",
    "Key templates and the ugly states",
    "A prototype of the journeys",
    "Handoff notes engineering can follow",
    "Shared names with the codebase",
    "Access for your team",
  ],
  refuse: [
    "A deck of pictures with no system",
    "A file that cannot produce a tenth page",
    "Handoff by screenshot in a chat",
  ],
};

const NATIVE: GroupPack = {
  process: [
    {
      title: "Web first when we can",
      body: "{name} is for the cases the browser cannot cover. We say those cases in the brief, and we keep them few.",
    },
    {
      title: "A build you can hold",
      body: "TestFlight or an internal track is the prototype. You tap it. The remaining budget waits.",
    },
    {
      title: "Same accounts as the site",
      body: "The app is a second door, not a second product. {name} talks to the API the web already uses.",
    },
    {
      title: "Store listing from the real UI",
      body: "Screenshots, privacy copy, and review notes are part of the work, not a Friday scramble.",
    },
    {
      title: "Certificates and the repo",
      body: "The {name} project, the keys, and the listing sit in your accounts.",
    },
  ],
  deliverables: [
    "A {name} project on a repository you own",
    "A build you can install before store review",
    "Shared API and design tokens with the web",
    "Listing copy and privacy notes",
    "Certificates and accounts in your name",
    "A handover that does not need our machine",
  ],
  refuse: [
    "A native app when a web app would do",
    "A second identity system for the phone",
    "Keys that only exist on a studio laptop",
  ],
};

const GROUPS: Record<string, GroupPack> = {
  cloud: CLOUD,
  ai: AI,
  language: LANGUAGE,
  framework: FRAMEWORK,
  builder: BUILDER,
  data: DATA,
  auth: AUTH,
  host: HOST,
  design: DESIGN,
  native: NATIVE,
  maps: {
    process: [
      {
        title: "Journey first, map second",
        body: "Search, pin, filter, directions. {name} supports that path. It is not the page.",
      },
      {
        title: "Style and budget",
        body: "The map uses the type and colour of the site, with a load budget so the offer is not waiting.",
      },
      {
        title: "Prototype the locator",
        body: "You click a store or a job on the real layout. Then we wire production keys.",
      },
      {
        title: "Fallback when a key is missing",
        body: "A list still works. The page does not die into a grey box.",
      },
      {
        title: "Keys you hold",
        body: "The {name} token lives in your project. Usage is your bill.",
      },
    ],
    deliverables: [
      "A map component that matches the brand",
      "Search and filters in the interface, not only on the map",
      "A load budget and a lazy load",
      "Your {name} token",
      "A fallback list or message",
      "CMS fields for places your team can edit",
    ],
    refuse: [
      "A default demo map dumped in a sidebar",
      "A 4MB widget on a lander",
      "A studio token on a live site",
    ],
  },
  commerce: {
    process: [
      {
        title: "Product page and pay path first",
        body: "You add to cart on the real layout. {name} is in that path, not a plugin afterthought.",
      },
      {
        title: "Catalogue the team can run",
        body: "The back office stays somewhere a merchandiser can work. The storefront is ours.",
      },
      {
        title: "Landers that match the product",
        body: "Paid traffic hits the same type and the same cart. {name} does not become a cousin brand.",
      },
      {
        title: "Speed before the campaign",
        body: "Images and scripts are budgeted. A store that melts on spend is not finished.",
      },
      {
        title: "Handover of the shop",
        body: "The {name} store, the domain, and the payments account are yours.",
      },
    ],
    deliverables: [
      "A storefront on a repository you own, or a disciplined {name} theme",
      "Product, cart, and checkout as one system",
      "Campaign landers",
      "Performance notes for a spend day",
      "Analytics on the money steps",
      "Accounts and catalogue in your name",
    ],
    refuse: [
      "A theme you cannot trust when ads turn on",
      "A checkout that looks like a third company",
      "A store we still have to log into for a price change",
    ],
  },
  platform: {
    process: [
      {
        title: "Use the piece that is already in the room",
        body: "{name} is often already paid for. We take the API that removes friction and leave the rest.",
      },
      {
        title: "Prototype the journey",
        body: "Sign-in, a map, a tag, a video. You click it in the product. Then we wire production.",
      },
      {
        title: "Keep the repo yours",
        body: "The site is not a {name} skin. The application lives on a repository you own.",
      },
      {
        title: "Measure the thing you named",
        body: "Events and logs match the brief. We do not dump every {name} default onto the page.",
      },
      {
        title: "Handover of the consoles",
        body: "Projects, keys, and properties in your organisation.",
      },
    ],
    deliverables: [
      "The {name} pieces that actually serve the brief",
      "A prototype of those journeys",
      "Keys and properties in your name",
      "Events or logs you can argue from",
      "The rest of the product on your repository",
      "Notes on what we deliberately did not use",
    ],
    refuse: [
      "Making the product a {name} shop",
      "Every API because it exists",
      "A studio-owned property as the live one",
    ],
  },
};

function pointsFromUses(topic: Topic): TopicPoint[] {
  return topic.uses.map((use, index) => ({
    title: use.split(/[.:,]/)[0]?.trim() || `Use ${index + 1}`,
    body: use,
  }));
}

export function detailSeedFor(topic: Topic) {
  return COMPANY_DETAIL[topic.slug] ?? TECHNOLOGY_DETAIL[topic.slug];
}

export function enrichTopic(
  topic: Topic,
  seed: TopicDetailSeed | undefined = detailSeedFor(topic),
): TopicDetail {
  const groupName =
    seed?.group ?? (topic.kind === "technology" ? "framework" : "platform");
  const pack = named(topic.name, GROUPS[groupName] ?? GROUPS.platform);
  const fit = seed?.fit?.length ? seed.fit : pointsFromUses(topic);
  const cases = [...(seed?.extraCases ?? []), ...topic.examples].filter(
    (item, index, list) =>
      list.findIndex((entry) => entry.title === item.title) === index,
  );
  const brief = productBriefFor(topic.slug, topic.name);
  const stance = productStanceFor(topic.slug, topic.name);

  return {
    introHeading: seed?.introHeading ?? `How we use ${topic.name} in a build.`,
    problem: seed?.problem ?? topic.about,
    what: brief.what,
    usedFor: brief.usedFor,
    knownUsers: brief.knownUsers,
    willDo: stance.willDo,
    aside: seed?.aside ?? topic.how,
    note:
      seed?.note ??
      `You own the ${topic.name} project. We do not sit in the middle.`,
    fit,
    process: pack.process,
    deliverables: pack.deliverables,
    refuse: stance.refuse,
    faqs: seed?.faqs?.length
      ? seed.faqs
      : [
          {
            question: `Do we have to use ${topic.name}?`,
            answer: `Only if it earns its place in the brief. ${topic.about}`,
          },
          {
            question: `Will we be locked into ${topic.name}?`,
            answer:
              "The application lives on a repository you own. Keys and accounts stay in your name. Keep the tool because it helps, not because leaving would be painful.",
          },
          {
            question: "When do we see it working?",
            answer: topic.how,
          },
        ],
    cases: cases.slice(0, 5),
  };
}
