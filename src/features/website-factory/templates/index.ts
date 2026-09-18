import type { PuckData } from "../types";

export type TemplateSection = {
  type: string;
  defaults?: Record<string, unknown>;
};

export type TemplatePageDef = {
  slug: string;
  title: string;
  navLabel: string;
  showInNav: boolean;
  sections: TemplateSection[];
};

export type TemplateDefinition = {
  key: string;
  name: string;
  industry: string;
  pages: TemplatePageDef[];
  process: Array<{ title: string; body: string }>;
  faqs: Array<{ question: string; answer: string }>;
  heroEyebrow: string;
  servicesHeading: string;
};

function chrome(extra: TemplateSection[] = []): TemplateSection[] {
  return [
    { type: "AnnouncementBar" },
    { type: "Navbar" },
    ...extra,
    { type: "CTA" },
    { type: "Footer" },
  ];
}

const homeTrade: TemplateSection[] = chrome([
  { type: "Hero" },
  { type: "TrustIndicators" },
  { type: "Services" },
  { type: "AboutSection" },
  { type: "Gallery" },
  { type: "Testimonials" },
  { type: "Process" },
  { type: "AreasServed" },
  { type: "FAQ" },
]);

export const ROOFING: TemplateDefinition = {
  key: "roofing",
  name: "Roofing Premium",
  industry: "Roofing",
  heroEyebrow: "Roofing",
  servicesHeading: "Roof work you can inspect",
  pages: [
    { slug: "home", title: "Home", navLabel: "Home", showInNav: true, sections: homeTrade },
    {
      slug: "about",
      title: "About",
      navLabel: "About",
      showInNav: true,
      sections: chrome([{ type: "PageHero" }, { type: "AboutSection" }, { type: "TeamSection" }]),
    },
    {
      slug: "services",
      title: "Services",
      navLabel: "Services",
      showInNav: true,
      sections: chrome([{ type: "PageHero" }, { type: "Services" }]),
    },
    {
      slug: "projects",
      title: "Projects",
      navLabel: "Projects",
      showInNav: true,
      sections: chrome([{ type: "PageHero" }, { type: "Gallery" }, { type: "Testimonials" }]),
    },
    {
      slug: "contact",
      title: "Contact",
      navLabel: "Contact",
      showInNav: true,
      sections: chrome([{ type: "PageHero" }, { type: "ContactSection" }]),
    },
  ],
  process: [
    { title: "Survey", body: "We look at the roof, not a slideshow." },
    { title: "Quote", body: "A fixed scope, written down, before work starts." },
    { title: "Work", body: "The crew on site is the crew you were promised." },
    { title: "Handover", body: "You walk it. You keep the photos and the warranty." },
  ],
  faqs: [
    {
      question: "Do you work on existing roofs?",
      answer: "Yes. Repairs, replacements, and inspections.",
    },
    {
      question: "Are you insured?",
      answer: "Ask for the current certificates. A serious firm will send them.",
    },
    {
      question: "How soon can you start?",
      answer: "That depends on weather and the diary. We will give you a date, not a shrug.",
    },
  ],
};

export const PROFESSIONAL: TemplateDefinition = {
  key: "professional",
  name: "Professional Services",
  industry: "Professional",
  heroEyebrow: "Practice",
  servicesHeading: "What we handle",
  pages: [
    {
      slug: "home",
      title: "Home",
      navLabel: "Home",
      showInNav: true,
      sections: chrome([
        { type: "Hero" },
        { type: "TrustIndicators" },
        { type: "Services" },
        { type: "AboutSection" },
        { type: "TeamSection" },
        { type: "Testimonials" },
        { type: "FAQ" },
      ]),
    },
    {
      slug: "about",
      title: "About",
      navLabel: "About",
      showInNav: true,
      sections: chrome([{ type: "PageHero" }, { type: "AboutSection" }, { type: "TeamSection" }]),
    },
    {
      slug: "services",
      title: "Services",
      navLabel: "Services",
      showInNav: true,
      sections: chrome([{ type: "PageHero" }, { type: "Services" }]),
    },
    {
      slug: "people",
      title: "People",
      navLabel: "People",
      showInNav: true,
      sections: chrome([{ type: "PageHero" }, { type: "TeamSection" }]),
    },
    {
      slug: "contact",
      title: "Contact",
      navLabel: "Contact",
      showInNav: true,
      sections: chrome([{ type: "PageHero" }, { type: "ContactSection" }]),
    },
  ],
  process: [
    { title: "Brief", body: "We start with the problem, not a retainer slide." },
    { title: "Plan", body: "A short written plan with owners and dates." },
    { title: "Work", body: "You see progress in the files, not in a status call." },
    { title: "Close", body: "Handover notes, next steps, and a named person." },
  ],
  faqs: [
    {
      question: "Who will I speak to?",
      answer: "A named person. Not a generic inbox if we can help it.",
    },
    {
      question: "How do you charge?",
      answer: "We will say so in writing before work starts.",
    },
  ],
};

export const RESTAURANT: TemplateDefinition = {
  key: "restaurant",
  name: "Restaurant",
  industry: "Hospitality",
  heroEyebrow: "Kitchen",
  servicesHeading: "On the menu",
  pages: [
    {
      slug: "home",
      title: "Home",
      navLabel: "Home",
      showInNav: true,
      sections: chrome([
        { type: "Hero" },
        { type: "AboutSection" },
        { type: "Services" },
        { type: "Gallery" },
        { type: "Testimonials" },
        { type: "FAQ" },
      ]),
    },
    {
      slug: "about",
      title: "About",
      navLabel: "About",
      showInNav: true,
      sections: chrome([{ type: "PageHero" }, { type: "AboutSection" }, { type: "TeamSection" }]),
    },
    {
      slug: "menu",
      title: "Menu",
      navLabel: "Menu",
      showInNav: true,
      sections: chrome([{ type: "PageHero" }, { type: "Services" }]),
    },
    {
      slug: "gallery",
      title: "Gallery",
      navLabel: "Gallery",
      showInNav: true,
      sections: chrome([{ type: "PageHero" }, { type: "Gallery" }]),
    },
    {
      slug: "contact",
      title: "Reservations",
      navLabel: "Reservations",
      showInNav: true,
      sections: chrome([{ type: "PageHero" }, { type: "ContactSection" }]),
    },
  ],
  process: [
    { title: "Book", body: "Call or email. We hold the table." },
    { title: "Arrive", body: "We sit you. No theatre at the door." },
    { title: "Eat", body: "The plate should match the menu." },
  ],
  faqs: [
    {
      question: "Do you take bookings?",
      answer: "Yes. Use the number or email on this site.",
    },
    {
      question: "Is there a set menu?",
      answer: "Ask when you book. It changes.",
    },
  ],
};

export const TEMPLATE_DEFS: Record<string, TemplateDefinition> = {
  roofing: ROOFING,
  professional: PROFESSIONAL,
  restaurant: RESTAURANT,
  construction: {
    key: "construction",
    name: "Construction",
    industry: "Construction",
    heroEyebrow: "Build",
    servicesHeading: "What we build",
    pages: [
      {
        slug: "home",
        title: "Home",
        navLabel: "Home",
        showInNav: true,
        sections: chrome([
          { type: "Hero" },
          { type: "TrustIndicators" },
          { type: "Stats" },
          { type: "Services" },
          { type: "AboutSection" },
          { type: "Gallery" },
          { type: "Process" },
          { type: "Testimonials" },
          { type: "FAQ" },
        ]),
      },
      {
        slug: "about",
        title: "About",
        navLabel: "About",
        showInNav: true,
        sections: chrome([{ type: "PageHero" }, { type: "AboutSection" }, { type: "TeamSection" }]),
      },
      {
        slug: "services",
        title: "Services",
        navLabel: "Services",
        showInNav: true,
        sections: chrome([{ type: "PageHero" }, { type: "Services" }, { type: "Pricing" }]),
      },
      {
        slug: "projects",
        title: "Projects",
        navLabel: "Projects",
        showInNav: true,
        sections: chrome([{ type: "PageHero" }, { type: "Gallery" }, { type: "BeforeAfter" }]),
      },
      {
        slug: "contact",
        title: "Contact",
        navLabel: "Contact",
        showInNav: true,
        sections: chrome([{ type: "PageHero" }, { type: "ContactSection" }, { type: "MapEmbed" }]),
      },
    ],
    process: [
      { title: "Brief", body: "We write the scope before anyone lifts a tool." },
      { title: "Programme", body: "Dates, access, and who is on site." },
      { title: "Build", body: "The crew named in the quote." },
      { title: "Handover", body: "Snag list, certificates, photographs." },
    ],
    faqs: [
      { question: "Do you take domestic work?", answer: "Yes, if it fits the diary and the skill." },
      { question: "Are you insured?", answer: "Ask for the current certificates." },
    ],
  },
  dental: {
    key: "dental",
    name: "Dental",
    industry: "Dental",
    heroEyebrow: "Practice",
    servicesHeading: "Care we offer",
    pages: [
      {
        slug: "home",
        title: "Home",
        navLabel: "Home",
        showInNav: true,
        sections: chrome([
          { type: "Hero" },
          { type: "TrustIndicators" },
          { type: "Services" },
          { type: "AboutSection" },
          { type: "TeamSection" },
          { type: "Testimonials" },
          { type: "FAQ" },
        ]),
      },
      {
        slug: "about",
        title: "About",
        navLabel: "The practice",
        showInNav: true,
        sections: chrome([{ type: "PageHero" }, { type: "AboutSection" }, { type: "TeamSection" }]),
      },
      {
        slug: "treatments",
        title: "Treatments",
        navLabel: "Treatments",
        showInNav: true,
        sections: chrome([{ type: "PageHero" }, { type: "Services" }, { type: "Pricing" }]),
      },
      {
        slug: "team",
        title: "Team",
        navLabel: "Team",
        showInNav: true,
        sections: chrome([{ type: "PageHero" }, { type: "TeamSection" }]),
      },
      {
        slug: "contact",
        title: "Appointments",
        navLabel: "Appointments",
        showInNav: true,
        sections: chrome([{ type: "PageHero" }, { type: "ContactSection" }, { type: "MapEmbed" }]),
      },
    ],
    process: [
      { title: "Book", body: "Call or email. A named person answers." },
      { title: "Exam", body: "We look, we explain, we write it down." },
      { title: "Treat", body: "You know the cost before we start." },
    ],
    faqs: [
      { question: "Do you take new patients?", answer: "Ask. The diary is the constraint, not a slogan." },
      { question: "Are you private or NHS?", answer: "We will say so on the contact page, in writing." },
    ],
  },
  landscaping: {
    key: "landscaping",
    name: "Landscaping",
    industry: "Landscaping",
    heroEyebrow: "Grounds",
    servicesHeading: "Outdoor work",
    pages: [
      {
        slug: "home",
        title: "Home",
        navLabel: "Home",
        showInNav: true,
        sections: chrome([
          { type: "Hero" },
          { type: "TrustIndicators" },
          { type: "Gallery" },
          { type: "Services" },
          { type: "AboutSection" },
          { type: "Process" },
          { type: "Testimonials" },
          { type: "FAQ" },
        ]),
      },
      {
        slug: "about",
        title: "About",
        navLabel: "About",
        showInNav: true,
        sections: chrome([{ type: "PageHero" }, { type: "AboutSection" }]),
      },
      {
        slug: "services",
        title: "Services",
        navLabel: "Services",
        showInNav: true,
        sections: chrome([{ type: "PageHero" }, { type: "Services" }]),
      },
      {
        slug: "gallery",
        title: "Gardens",
        navLabel: "Gardens",
        showInNav: true,
        sections: chrome([{ type: "PageHero" }, { type: "Gallery" }, { type: "BeforeAfter" }]),
      },
      {
        slug: "contact",
        title: "Contact",
        navLabel: "Contact",
        showInNav: true,
        sections: chrome([{ type: "PageHero" }, { type: "ContactSection" }, { type: "AreasServed" }]),
      },
    ],
    process: [
      { title: "Visit", body: "We walk the ground, not a mood board." },
      { title: "Plan", body: "A written layout and a price." },
      { title: "Make", body: "Planting, hard landscape, drainage as quoted." },
    ],
    faqs: [
      { question: "Do you maintain after install?", answer: "If we offer it, it will be on the quote." },
      { question: "Do you work in winter?", answer: "Some jobs wait for the season. We will say which." },
    ],
  },
  salon: {
    key: "salon",
    name: "Salon & Spa",
    industry: "Beauty",
    heroEyebrow: "Salon",
    servicesHeading: "Treatments",
    pages: [
      {
        slug: "home",
        title: "Home",
        navLabel: "Home",
        showInNav: true,
        sections: chrome([
          { type: "MinimalHero" },
          { type: "TrustIndicators" },
          { type: "FeatureGrid" },
          { type: "Services" },
          { type: "TeamSection" },
          { type: "Gallery" },
          { type: "Testimonials" },
          { type: "BookingCTA" },
          { type: "FAQ" },
        ]),
      },
      {
        slug: "services",
        title: "Services",
        navLabel: "Services",
        showInNav: true,
        sections: chrome([{ type: "PageHero" }, { type: "Services" }, { type: "Pricing" }]),
      },
      {
        slug: "team",
        title: "Team",
        navLabel: "Team",
        showInNav: true,
        sections: chrome([{ type: "PageHero" }, { type: "TeamSection" }]),
      },
      {
        slug: "gallery",
        title: "Work",
        navLabel: "Work",
        showInNav: true,
        sections: chrome([{ type: "PageHero" }, { type: "Gallery" }]),
      },
      {
        slug: "book",
        title: "Book",
        navLabel: "Book",
        showInNav: true,
        sections: chrome([{ type: "PageHero" }, { type: "BookingCTA" }, { type: "ContactSection" }]),
      },
    ],
    process: [
      { title: "Book", body: "Pick a chair and a time." },
      { title: "Consult", body: "We listen before we cut or colour." },
      { title: "Finish", body: "You leave with care notes, not a surprise." },
    ],
    faqs: [
      { question: "Do you take walk-ins?", answer: "When the diary allows. Booking is safer." },
      { question: "How far ahead should I book?", answer: "Colour and bridal work usually need more notice." },
    ],
  },
  law: {
    key: "law",
    name: "Law Firm",
    industry: "Legal",
    heroEyebrow: "Chambers",
    servicesHeading: "Practice areas",
    pages: [
      {
        slug: "home",
        title: "Home",
        navLabel: "Home",
        showInNav: true,
        sections: chrome([
          { type: "Hero" },
          { type: "TrustIndicators" },
          { type: "Services" },
          { type: "AboutSection" },
          { type: "TeamSection" },
          { type: "Testimonials" },
          { type: "FAQ" },
        ]),
      },
      {
        slug: "about",
        title: "About",
        navLabel: "About",
        showInNav: true,
        sections: chrome([{ type: "PageHero" }, { type: "AboutSection" }, { type: "Certifications" }]),
      },
      {
        slug: "practice",
        title: "Practice areas",
        navLabel: "Practice",
        showInNav: true,
        sections: chrome([{ type: "PageHero" }, { type: "Services" }, { type: "FeatureGrid" }]),
      },
      {
        slug: "people",
        title: "People",
        navLabel: "People",
        showInNav: true,
        sections: chrome([{ type: "PageHero" }, { type: "TeamSection" }]),
      },
      {
        slug: "contact",
        title: "Contact",
        navLabel: "Contact",
        showInNav: true,
        sections: chrome([{ type: "PageHero" }, { type: "ContactSection" }, { type: "QuoteForm" }]),
      },
    ],
    process: [
      { title: "Instruct", body: "A clear brief and conflicts check." },
      { title: "Advise", body: "Written advice with options, not jargon." },
      { title: "Act", body: "You know who is doing the work." },
    ],
    faqs: [
      { question: "Do you offer fixed fees?", answer: "Where the work allows it, we will say so in writing." },
      { question: "Which courts do you cover?", answer: "Listed on the practice pages — ask if unsure." },
    ],
  },
  fitness: {
    key: "fitness",
    name: "Fitness Studio",
    industry: "Fitness",
    heroEyebrow: "Studio",
    servicesHeading: "Classes & coaching",
    pages: [
      {
        slug: "home",
        title: "Home",
        navLabel: "Home",
        showInNav: true,
        sections: chrome([
          { type: "VideoHero" },
          { type: "Stats" },
          { type: "Services" },
          { type: "FeatureGrid" },
          { type: "TeamSection" },
          { type: "Testimonials" },
          { type: "Pricing" },
          { type: "Newsletter" },
        ]),
      },
      {
        slug: "classes",
        title: "Classes",
        navLabel: "Classes",
        showInNav: true,
        sections: chrome([{ type: "PageHero" }, { type: "Services" }, { type: "Pricing" }]),
      },
      {
        slug: "coaches",
        title: "Coaches",
        navLabel: "Coaches",
        showInNav: true,
        sections: chrome([{ type: "PageHero" }, { type: "TeamSection" }]),
      },
      {
        slug: "join",
        title: "Join",
        navLabel: "Join",
        showInNav: true,
        sections: chrome([{ type: "PageHero" }, { type: "Pricing" }, { type: "BookingCTA" }, { type: "ContactSection" }]),
      },
    ],
    process: [
      { title: "Trial", body: "One session. No pressure." },
      { title: "Plan", body: "A programme that fits your week." },
      { title: "Train", body: "Coaches who know your name." },
    ],
    faqs: [
      { question: "Do you need experience?", answer: "No. We scale the work to you." },
      { question: "What should I bring?", answer: "Water, kit, and trainers. We will say if anything else." },
    ],
  },
  electrician: {
    key: "electrician",
    name: "Electrician",
    industry: "Trades",
    heroEyebrow: "Electrical",
    servicesHeading: "Electrical work",
    pages: [
      {
        slug: "home",
        title: "Home",
        navLabel: "Home",
        showInNav: true,
        sections: chrome([
          { type: "Hero" },
          { type: "TrustIndicators" },
          { type: "Services" },
          { type: "Process" },
          { type: "AreasServed" },
          { type: "Testimonials" },
          { type: "FAQ" },
        ]),
      },
      {
        slug: "services",
        title: "Services",
        navLabel: "Services",
        showInNav: true,
        sections: chrome([{ type: "PageHero" }, { type: "Services" }, { type: "Pricing" }]),
      },
      {
        slug: "areas",
        title: "Areas",
        navLabel: "Areas",
        showInNav: true,
        sections: chrome([{ type: "PageHero" }, { type: "AreasServed" }, { type: "MapEmbed" }]),
      },
      {
        slug: "contact",
        title: "Contact",
        navLabel: "Contact",
        showInNav: true,
        sections: chrome([{ type: "PageHero" }, { type: "ContactSection" }, { type: "QuoteForm" }]),
      },
    ],
    process: [
      { title: "Call", body: "Describe the fault. We say if we can help." },
      { title: "Visit", body: "A fixed call-out, written down." },
      { title: "Fix", body: "Certificates where the job needs them." },
    ],
    faqs: [
      { question: "Are you Part P registered?", answer: "Ask for the current registration — we will send it." },
      { question: "Do you do emergency call-outs?", answer: "When we can. The phone line will say so." },
    ],
  },
};

export function getTemplateDefinition(key: string): TemplateDefinition {
  const def = TEMPLATE_DEFS[key];
  if (!def) throw new Error(`Unknown template: ${key}`);
  return def;
}

export function emptyPageData(): PuckData {
  return { root: { props: {} }, content: [] };
}
