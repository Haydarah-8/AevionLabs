import {
  AGENCY_HEADING,
  AGENCY_LEFT,
  AGENCY_RIGHT,
  HERO_BODY,
  HERO_CTA_HREF,
  HERO_CTA_LABEL,
  HERO_HEADLINE,
  SERVICES_HEADING,
  SERVICES_INTRO,
} from "@/data/copy";

export type FieldKind =
  | "text"
  | "textarea"
  | "image"
  | "strings"
  | "cards"
  | "blocks";

export type SectionField = {
  key: string;
  label: string;
  kind: FieldKind;
  hint?: string;
};

export type SectionDef = {
  type: string;
  label: string;
  hint: string;
  fields: SectionField[];
  defaults: Record<string, unknown>;
};

const cardFields: SectionField[] = [
  { key: "title", label: "Title", kind: "textarea" },
  { key: "excerpt", label: "Excerpt", kind: "textarea" },
  { key: "image", label: "Image", kind: "image" },
  { key: "href", label: "Link", kind: "text" },
  { key: "id", label: "Anchor id", kind: "text" },
];

const blockFields: SectionField[] = [
  { key: "kicker", label: "Kicker", kind: "text" },
  { key: "heading", label: "Heading", kind: "text" },
  { key: "body", label: "Body (one paragraph per line)", kind: "textarea" },
  { key: "image", label: "Image", kind: "image" },
  { key: "id", label: "Anchor id", kind: "text" },
];

export const SECTION_DEFS: SectionDef[] = [
  {
    type: "hero",
    label: "Hero",
    hint: "Full-screen opening with background image",
    defaults: {
      headline: HERO_HEADLINE,
      body: HERO_BODY,
      ctaLabel: HERO_CTA_LABEL,
      ctaHref: HERO_CTA_HREF,
      image: "/images/hero-1.jpg",
    },
    fields: [
      { key: "headline", label: "Headline", kind: "textarea" },
      { key: "body", label: "Body", kind: "textarea" },
      { key: "ctaLabel", label: "Button label", kind: "text" },
      { key: "ctaHref", label: "Button link", kind: "text" },
      { key: "image", label: "Background image", kind: "image" },
    ],
  },
  {
    type: "page_hero",
    label: "Page title",
    hint: "Inner-page banner",
    defaults: {
      title: "Page",
      highlight: "",
      image: "/images/home-about.jpg",
    },
    fields: [
      { key: "title", label: "Title", kind: "text" },
      { key: "highlight", label: "Highlight", kind: "text" },
      { key: "kicker", label: "Kicker", kind: "text" },
      { key: "heading", label: "Heading", kind: "textarea" },
      { key: "body", label: "Body", kind: "textarea" },
      { key: "image", label: "Background image", kind: "image" },
    ],
  },
  {
    type: "intro",
    label: "Intro",
    hint: "Agency intro with heading, two columns, and three pillars",
    defaults: {
      kicker: "The agency",
      location: "Manchester",
      heading: AGENCY_HEADING,
      left: AGENCY_LEFT,
      right: AGENCY_RIGHT,
      items: [],
      ctaLabel: "About the agency",
      ctaHref: "/about",
    },
    fields: [
      { key: "kicker", label: "Kicker", kind: "text" },
      { key: "location", label: "Location", kind: "text" },
      { key: "heading", label: "Heading", kind: "textarea" },
      { key: "left", label: "Left column", kind: "textarea" },
      { key: "right", label: "Right column", kind: "textarea" },
      {
        key: "items",
        label: "Pillars (title, then a new line for the body)",
        kind: "strings",
      },
      { key: "ctaLabel", label: "Link label", kind: "text" },
      { key: "ctaHref", label: "Link", kind: "text" },
    ],
  },
  {
    type: "rich_text",
    label: "Text",
    hint: "Heading and body copy",
    defaults: { kicker: "", heading: "", body: "" },
    fields: [
      { key: "kicker", label: "Kicker", kind: "text" },
      { key: "heading", label: "Heading", kind: "textarea" },
      { key: "body", label: "Body", kind: "textarea" },
    ],
  },
  {
    type: "image",
    label: "Image",
    hint: "Full-width photograph",
    defaults: { src: "", alt: "", caption: "" },
    fields: [
      { key: "src", label: "Image", kind: "image" },
      { key: "alt", label: "Alt text", kind: "text" },
      { key: "caption", label: "Caption", kind: "text" },
    ],
  },
  {
    type: "image_text",
    label: "Image + text",
    hint: "Photograph beside copy",
    defaults: {
      kicker: "",
      heading: "",
      body: "",
      image: "",
      imageSide: "left",
      id: "",
    },
    fields: [
      { key: "kicker", label: "Kicker", kind: "text" },
      { key: "heading", label: "Heading", kind: "text" },
      { key: "body", label: "Body (one paragraph per line)", kind: "textarea" },
      { key: "image", label: "Image", kind: "image" },
      { key: "imageSide", label: "Image side (left or right)", kind: "text" },
      { key: "id", label: "Anchor id", kind: "text" },
    ],
  },
  {
    type: "cards",
    label: "Card grid",
    hint: "Services or feature cards",
    defaults: {
      kicker: "Services",
      heading: SERVICES_HEADING,
      intro: SERVICES_INTRO,
      items: [],
      ctaLabel: "All services",
      ctaHref: "/services",
    },
    fields: [
      { key: "kicker", label: "Kicker", kind: "text" },
      { key: "heading", label: "Heading", kind: "textarea" },
      { key: "intro", label: "Intro", kind: "textarea" },
      { key: "items", label: "Cards", kind: "cards" },
      { key: "ctaLabel", label: "Link label", kind: "text" },
      { key: "ctaHref", label: "Link", kind: "text" },
    ],
  },
  {
    type: "offerings",
    label: "Offerings",
    hint: "Bullet list with a side image",
    defaults: {
      kicker: "How we work",
      heading: "You do not buy the full build until you have seen the system.",
      body: "A working prototype or design system comes first. The remaining budget unlocks after you approve it. Then we build on a repository you own.",
      items: [],
      image: "/images/service-offerings-panel.png",
    },
    fields: [
      { key: "kicker", label: "Kicker", kind: "text" },
      { key: "heading", label: "Heading", kind: "textarea" },
      { key: "body", label: "Body", kind: "textarea" },
      {
        key: "items",
        label: "Steps (title, then a new line for the body)",
        kind: "strings",
      },
      { key: "image", label: "Image", kind: "image" },
    ],
  },
  {
    type: "values",
    label: "Values",
    hint: "Accordion of commitments",
    defaults: {
      kicker: "How we work",
      heading: "Four commitments before anyone writes a line of code.",
      items: [],
    },
    fields: [
      { key: "kicker", label: "Kicker", kind: "text" },
      { key: "heading", label: "Heading", kind: "textarea" },
      {
        key: "items",
        label: "Values (title, then a new line for the body)",
        kind: "strings",
      },
    ],
  },
  {
    type: "prototype",
    label: "Value first",
    hint: "Prototype-before-spend band",
    defaults: {
      kicker: "Value first",
      heading: "A working prototype before the rest of the budget unlocks.",
      body: "Companies should not take the risk of a full build on a deck of slides. You see the system in the browser first.",
    },
    fields: [
      { key: "kicker", label: "Kicker", kind: "text" },
      { key: "heading", label: "Heading", kind: "textarea" },
      { key: "body", label: "Body", kind: "textarea" },
    ],
  },
  {
    type: "faq",
    label: "FAQ",
    hint: "Question and answer accordion",
    defaults: {
      kicker: "Questions",
      heading: "What companies usually ask before they start.",
      items: [],
    },
    fields: [
      { key: "kicker", label: "Kicker", kind: "text" },
      { key: "heading", label: "Heading", kind: "textarea" },
      {
        key: "items",
        label: "Questions (question, then a new line for the answer)",
        kind: "strings",
      },
    ],
  },
  {
    type: "cta",
    label: "Call to action",
    hint: "Dark band with a button",
    defaults: {
      heading: "",
      ctaLabel: "Get in touch",
      ctaHref: "/about",
    },
    fields: [
      { key: "heading", label: "Heading", kind: "textarea" },
      { key: "ctaLabel", label: "Button label", kind: "text" },
      { key: "ctaHref", label: "Button link", kind: "text" },
    ],
  },
  {
    type: "marquee",
    label: "Scrolling logos",
    hint: "Horizontal ticker of tools and languages",
    defaults: { kicker: "The stack", items: [] },
    fields: [
      { key: "kicker", label: "Kicker", kind: "text" },
      { key: "items", label: "Names", kind: "strings" },
    ],
  },
  {
    type: "insights",
    label: "Blog preview",
    hint: "Latest published posts",
    defaults: {
      kicker: "Insights",
      heading: "From the desk",
      ctaLabel: "All insights →",
      ctaHref: "/news",
    },
    fields: [
      { key: "kicker", label: "Kicker", kind: "text" },
      { key: "heading", label: "Heading", kind: "text" },
      { key: "ctaLabel", label: "Link label", kind: "text" },
      { key: "ctaHref", label: "Link", kind: "text" },
    ],
  },
  {
    type: "blog_list",
    label: "Blog listing",
    hint: "Full list of published posts",
    defaults: {
      empty: "No articles have been published yet.",
    },
    fields: [{ key: "empty", label: "Empty message", kind: "textarea" }],
  },
  {
    type: "projects",
    label: "Project grid",
    hint: "Published work from the Work tab",
    defaults: {},
    fields: [],
  },
  {
    type: "html",
    label: "Custom HTML",
    hint: "Advanced: paste markup for a one-off section",
    defaults: { html: "" },
    fields: [{ key: "html", label: "HTML", kind: "textarea" }],
  },
];

export const CARD_ITEM_FIELDS = cardFields;
export const BLOCK_ITEM_FIELDS = blockFields;

export function defFor(type: string): SectionDef | undefined {
  return SECTION_DEFS.find((d) => d.type === type);
}

export function defaultData(type: string): Record<string, unknown> {
  return { ...(defFor(type)?.defaults ?? {}) };
}
