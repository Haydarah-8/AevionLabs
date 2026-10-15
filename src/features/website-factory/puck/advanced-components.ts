import type { Config } from "@puckeditor/core";
import * as Advanced from "../components/blocks-advanced";
import { defaultStyles, styleObjectField, text } from "./style-fields";
import { withBoxStyles } from "./wrap";

const textarea = { type: "textarea" as const };
const styles = styleObjectField;
const arrayText = { type: "array" as const, arrayFields: { label: text } };

function wrap(Component: unknown) {
  return withBoxStyles(Component as never);
}

const item = {
  year: text,
  title: text,
  body: textarea,
  quote: textarea,
  name: text,
  role: text,
  label: text,
  href: text,
  src: text,
  alt: text,
  icon: text,
  price: text,
  feature: text,
  a: text,
  b: text,
  c: text,
  q: text,
  aText: textarea,
  photoUrl: text,
  bio: textarea,
  excerpt: textarea,
  date: text,
  meta: text,
  code: text,
  value: text,
  events: text,
  c1: text,
  c2: text,
  c3: text,
  cards: { type: "array" as const, arrayFields: { title: text } },
  links: { type: "array" as const, arrayFields: { label: text, href: text } },
};

/** ~68 advanced Studio blocks */
export const advancedComponents = {
  CountdownTimer: {
    label: "Countdown",
    fields: { heading: text, targetDate: text, label: text, styles },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.CountdownTimer),
  },
  Timeline: {
    fields: {
      heading: text,
      items: { type: "array", arrayFields: { year: text, title: text, body: textarea } },
      styles,
    },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.Timeline),
  },
  ComparisonTable: {
    label: "Comparison table",
    fields: {
      heading: text,
      columns: arrayText,
      rows: {
        type: "array",
        arrayFields: { feature: text, a: text, b: text, c: text },
      },
      styles,
    },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.ComparisonTable),
  },
  PricingToggle: {
    label: "Pricing plans",
    fields: {
      heading: text,
      monthlyLabel: text,
      yearlyLabel: text,
      plans: {
        type: "array",
        arrayFields: { name: text, price: text, body: textarea, href: text },
      },
      styles,
    },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.PricingToggle),
  },
  TestimonialSlider: {
    fields: {
      heading: text,
      quotes: {
        type: "array",
        arrayFields: { quote: textarea, name: text, role: text },
      },
      styles,
    },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.TestimonialSlider),
  },
  LogoWall: {
    fields: {
      heading: text,
      logos: { type: "array", arrayFields: { name: text, src: text } },
      styles,
    },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.LogoWall),
  },
  MarqueeStrip: {
    fields: { text, styles },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.MarqueeStrip),
  },
  StickyCTA: {
    fields: { text, label: text, href: text, styles },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.StickyCTA),
  },
  FeatureChecklist: {
    fields: {
      heading: text,
      items: {
        type: "array",
        arrayFields: {
          label: text,
          done: {
            type: "select",
            options: [
              { label: "Done", value: "yes" },
              { label: "Open", value: "no" },
            ],
          },
        },
      },
      styles,
    },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.FeatureChecklist),
  },
  StatCallout: {
    fields: { value: text, label: text, body: textarea, styles },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.StatCallout),
  },
  QuoteBanner: {
    fields: { quote: textarea, attribution: text, styles },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.QuoteBanner),
  },
  AccordionFAQ: {
    fields: {
      heading: text,
      items: { type: "array", arrayFields: { q: text, a: textarea } },
      styles,
    },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.AccordionFAQ),
  },
  TabbedContent: {
    fields: {
      heading: text,
      tabs: { type: "array", arrayFields: { label: text, body: textarea } },
      styles,
    },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.TabbedContent),
  },
  StepsHorizontal: {
    fields: {
      heading: text,
      steps: { type: "array", arrayFields: { title: text, body: textarea } },
      styles,
    },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.StepsHorizontal),
  },
  IconFeatureGrid: {
    fields: {
      heading: text,
      items: {
        type: "array",
        arrayFields: { icon: text, title: text, body: textarea },
      },
      styles,
    },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.IconFeatureGrid),
  },
  MediaObject: {
    fields: {
      imageUrl: text,
      heading: text,
      body: textarea,
      reverse: {
        type: "radio",
        options: [
          { label: "Image left", value: false },
          { label: "Image right", value: true },
        ],
      },
      styles,
    },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.MediaObject),
  },
  CardGrid: {
    fields: {
      heading: text,
      cards: {
        type: "array",
        arrayFields: { title: text, body: textarea, href: text, imageUrl: text },
      },
      styles,
    },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.CardGrid),
  },
  HeroWithForm: {
    fields: { heading: text, body: textarea, formHeading: text, styles },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.HeroWithForm),
  },
  SplitCTA: {
    fields: {
      leftTitle: text,
      leftBody: textarea,
      leftLabel: text,
      leftHref: text,
      rightTitle: text,
      rightBody: textarea,
      rightLabel: text,
      rightHref: text,
      styles,
    },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.SplitCTA),
  },
  BannerAlert: {
    fields: {
      text,
      tone: {
        type: "select",
        options: [
          { label: "Info", value: "info" },
          { label: "Warn", value: "warn" },
          { label: "OK", value: "ok" },
        ],
      },
      styles,
    },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.BannerAlert),
  },
  NumberedList: {
    fields: {
      heading: text,
      items: { type: "array", arrayFields: { title: text, body: textarea } },
      styles,
    },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.NumberedList),
  },
  AvatarStack: {
    fields: {
      heading: text,
      people: { type: "array", arrayFields: { name: text, photoUrl: text } },
      styles,
    },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.AvatarStack),
  },
  CodeSnippet: {
    fields: { heading: text, code: textarea, styles },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.CodeSnippet),
  },
  VideoEmbed: {
    fields: { heading: text, url: text, styles },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.VideoEmbed),
  },
  MapSection: {
    fields: { heading: text, address: text, styles },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.MapSection),
  },
  ContactSplit: {
    fields: { heading: text, body: textarea, email: text, phone: text, styles },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.ContactSplit),
  },
  FooterMega: {
    fields: {
      brand: text,
      note: textarea,
      columns: {
        type: "array",
        arrayFields: {
          title: text,
          links: { type: "array", arrayFields: { label: text, href: text } },
        },
      },
      styles,
    },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.FooterMega),
  },
  NavbarCentered: {
    fields: {
      name: text,
      links: { type: "array", arrayFields: { label: text, href: text } },
      ctaLabel: text,
      ctaHref: text,
      styles,
    },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.NavbarCentered),
  },
  HeroCentered: {
    fields: {
      kicker: text,
      heading: text,
      body: textarea,
      primaryLabel: text,
      primaryHref: text,
      secondaryLabel: text,
      secondaryHref: text,
      styles,
    },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.HeroCentered),
  },
  RichText: {
    fields: { html: textarea, styles },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.RichText),
  },
  SpacerXL: {
    fields: {
      size: {
        type: "select",
        options: [
          { label: "Small", value: "sm" },
          { label: "Medium", value: "md" },
          { label: "Large", value: "lg" },
        ],
      },
      styles,
    },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.SpacerXL),
  },
  DividerLabel: {
    fields: { label: text, styles },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.DividerLabel),
  },
  BadgeRow: {
    fields: { items: arrayText, styles },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.BadgeRow),
  },
  ProgressBars: {
    fields: {
      heading: text,
      items: { type: "array", arrayFields: { label: text, value: text } },
      styles,
    },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.ProgressBars),
  },
  TeamGrid: {
    fields: {
      heading: text,
      people: {
        type: "array",
        arrayFields: { name: text, role: text, photoUrl: text, bio: textarea },
      },
      styles,
    },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.TeamGrid),
  },
  GalleryMasonry: {
    fields: {
      heading: text,
      images: { type: "array", arrayFields: { src: text, alt: text } },
      styles,
    },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.GalleryMasonry),
  },
  BlogList: {
    fields: {
      heading: text,
      posts: {
        type: "array",
        arrayFields: { title: text, excerpt: textarea, href: text, date: text },
      },
      styles,
    },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.BlogList),
  },
  NewsletterInline: {
    fields: { heading: text, label: text, styles },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.NewsletterInline),
  },
  SocialProofBar: {
    fields: { text, count: text, styles },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.SocialProofBar),
  },
  EmptyStateBlock: {
    label: "Empty state",
    fields: { heading: text, body: textarea, label: text, href: text, styles },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.EmptyStateBlock),
  },
  CookieBanner: {
    fields: { text, acceptLabel: text, styles },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.CookieBanner),
  },
  SearchBar: {
    fields: { placeholder: text, styles },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.SearchBar),
  },
  BreadcrumbBar: {
    fields: {
      items: { type: "array", arrayFields: { label: text, href: text } },
      styles,
    },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.BreadcrumbBar),
  },
  SidebarLayout: {
    fields: { main: textarea, side: textarea, styles },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.SidebarLayout),
  },
  MetricRow: {
    fields: {
      items: { type: "array", arrayFields: { value: text, label: text } },
      styles,
    },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.MetricRow),
  },
  FeatureCompare: {
    fields: {
      heading: text,
      leftTitle: text,
      rightTitle: text,
      leftItems: arrayText,
      rightItems: arrayText,
      styles,
    },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.FeatureCompare),
  },
  AppStoreBadges: {
    fields: { heading: text, appleHref: text, googleHref: text, styles },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.AppStoreBadges),
  },
  ChatWidgetPreview: {
    label: "Chat widget",
    fields: { title: text, greeting: textarea, styles },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.ChatWidgetPreview),
  },
  TableBasic: {
    fields: {
      heading: text,
      headers: arrayText,
      rows: { type: "array", arrayFields: { c1: text, c2: text, c3: text } },
      styles,
    },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.TableBasic),
  },
  KanbanPreview: {
    fields: {
      heading: text,
      columns: {
        type: "array",
        arrayFields: {
          title: text,
          cards: { type: "array", arrayFields: { title: text } },
        },
      },
      styles,
    },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.KanbanPreview),
  },
  CalendarStrip: {
    fields: {
      heading: text,
      days: { type: "array", arrayFields: { label: text, events: text } },
      styles,
    },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.CalendarStrip),
  },
  FileDownloadList: {
    fields: {
      heading: text,
      files: {
        type: "array",
        arrayFields: { name: text, href: text, meta: text },
      },
      styles,
    },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.FileDownloadList),
  },
  LanguageSwitcher: {
    fields: {
      languages: { type: "array", arrayFields: { code: text, label: text } },
      styles,
    },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.LanguageSwitcher),
  },
  ThemeTogglePreview: {
    label: "Theme toggle",
    fields: { styles },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.ThemeTogglePreview),
  },
  NotificationToast: {
    fields: { title: text, body: textarea, styles },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.NotificationToast),
  },
  ModalPreview: {
    fields: { heading: text, body: textarea, label: text, styles },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.ModalPreview),
  },
  SkeletonLoader: {
    fields: { styles },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.SkeletonLoader),
  },
  ErrorState: {
    fields: { heading: text, body: textarea, label: text, styles },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.ErrorState),
  },
  SuccessState: {
    fields: { heading: text, body: textarea, styles },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.SuccessState),
  },
  OfflineBanner: {
    fields: { text, styles },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.OfflineBanner),
  },
  PasswordGate: {
    fields: { heading: text, body: textarea, styles },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.PasswordGate),
  },
  WaitlistForm: {
    fields: { heading: text, body: textarea, styles },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.WaitlistForm),
  },
  InvestorDeckCTA: {
    fields: { heading: text, body: textarea, label: text, href: text, styles },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.InvestorDeckCTA),
  },
  CaseStudyHero: {
    fields: {
      client: text,
      heading: text,
      body: textarea,
      imageUrl: text,
      styles,
    },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.CaseStudyHero),
  },
  ResultsStrip: {
    fields: {
      items: { type: "array", arrayFields: { value: text, label: text } },
      styles,
    },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.ResultsStrip),
  },
  QuoteWithAvatar: {
    fields: {
      quote: textarea,
      name: text,
      role: text,
      photoUrl: text,
      styles,
    },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.QuoteWithAvatar),
  },
  DualButtonRow: {
    fields: {
      primaryLabel: text,
      primaryHref: text,
      secondaryLabel: text,
      secondaryHref: text,
      styles,
    },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.DualButtonRow),
  },
  SectionHeader: {
    fields: { kicker: text, heading: text, body: textarea, styles },
    defaultProps: { styles: defaultStyles() },
    render: wrap(Advanced.SectionHeader),
  },
} as Config["components"];

export const advancedCategoryComponents = Object.keys(advancedComponents);

// silence unused helper noise in some tooling
void item;
