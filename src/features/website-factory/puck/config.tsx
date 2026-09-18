import type { ReactNode } from "react";
import type { Config } from "@puckeditor/core";
import * as Blocks from "../components/blocks";
import { defaultStyles, styleObjectField, text } from "./style-fields";
import { withBoxStyles, StyleShell } from "./wrap";

const textarea = { type: "textarea" as const };
const styles = styleObjectField;

const Hero = withBoxStyles(Blocks.Hero as never);
const SplitHero = withBoxStyles(Blocks.SplitHero as never);
const VideoHero = withBoxStyles(Blocks.VideoHero as never);
const MinimalHero = withBoxStyles(Blocks.MinimalHero as never);
const MobileNavbar = withBoxStyles(Blocks.MobileNavbar as never);
const ImageText = withBoxStyles(Blocks.ImageText as never);
const FeatureGrid = withBoxStyles(Blocks.FeatureGrid as never);
const ServiceCard = withBoxStyles(Blocks.ServiceCard as never);
const Projects = withBoxStyles(Blocks.Projects as never);
const ProjectCard = withBoxStyles(Blocks.ProjectCard as never);
const TeamMember = withBoxStyles(Blocks.TeamMember as never);
const Certifications = withBoxStyles(Blocks.Certifications as never);
const Awards = withBoxStyles(Blocks.Awards as never);
const BookingCTA = withBoxStyles(Blocks.BookingCTA as never);
const QuoteForm = withBoxStyles(Blocks.QuoteForm as never);
const Newsletter = withBoxStyles(Blocks.Newsletter as never);
const ContactForm = withBoxStyles(Blocks.ContactForm as never);
const FooterColumns = withBoxStyles(Blocks.FooterColumns as never);
const PageHero = withBoxStyles(Blocks.PageHero as never);
const Services = withBoxStyles(Blocks.Services as never);
const AboutSection = withBoxStyles(Blocks.AboutSection as never);
const Gallery = withBoxStyles(Blocks.Gallery as never);
const Testimonials = withBoxStyles(Blocks.Testimonials as never);
const Process = withBoxStyles(Blocks.Process as never);
const TeamSection = withBoxStyles(Blocks.TeamSection as never);
const FAQ = withBoxStyles(Blocks.FAQ as never);
const CTA = withBoxStyles(Blocks.CTA as never);
const ContactSection = withBoxStyles(Blocks.ContactSection as never);
const Pricing = withBoxStyles(Blocks.Pricing as never);
const BeforeAfter = withBoxStyles(Blocks.BeforeAfter as never);
const LogoCloud = withBoxStyles(Blocks.LogoCloud as never);
const MapEmbed = withBoxStyles(Blocks.MapEmbed as never);
const SocialLinks = withBoxStyles(Blocks.SocialLinks as never);
const Breadcrumbs = withBoxStyles(Blocks.Breadcrumbs as never);
const BlogGrid = withBoxStyles(Blocks.BlogGrid as never);

export const factoryConfig = {
  root: {
    fields: {
      title: { type: "text", label: "Document title" },
    },
    render: ({ children }: { children?: ReactNode }) => (
      <div className="factory-root">{children}</div>
    ),
  },
  categories: {
    chrome: {
      title: "Chrome",
      components: [
        "AnnouncementBar",
        "Navbar",
        "MobileNavbar",
        "Footer",
        "FooterColumns",
      ],
    },
    structure: {
      title: "Structure",
      components: [
        "Section",
        "Container",
        "Flex",
        "Grid",
        "Box",
        "TwoColumn",
        "Columns3",
        "Spacer",
        "Divider",
      ],
    },
    basic: {
      title: "Basic",
      components: [
        "Heading",
        "TextBlock",
        "ImageBlock",
        "ButtonBlock",
        "VideoBlock",
        "IconList",
        "ImageText",
        "FeatureGrid",
      ],
    },
    sections: {
      title: "Sections",
      components: [
        "Hero",
        "SplitHero",
        "VideoHero",
        "MinimalHero",
        "PageHero",
        "TrustIndicators",
        "Services",
        "ServiceCard",
        "AboutSection",
        "Gallery",
        "Projects",
        "ProjectCard",
        "Testimonials",
        "Process",
        "AreasServed",
        "TeamSection",
        "TeamMember",
        "Certifications",
        "Awards",
        "ContactForm",
        "QuoteForm",
        "Newsletter",
        "FAQ",
        "CTA",
        "BookingCTA",
        "ContactSection",
        "Stats",
        "Pricing",
        "BeforeAfter",
        "LogoCloud",
        "MapEmbed",
        "SocialLinks",
        "Breadcrumbs",
        "BlogGrid",
      ],
    },
  },
  components: {
    AnnouncementBar: {
      label: "Announcement",
      fields: { text },
      render: Blocks.AnnouncementBar,
    },
    Navbar: {
      fields: {
        name: text,
        logoUrl: { type: "text", label: "Logo URL" },
        homeHref: text,
        sticky: {
          type: "radio",
          options: [
            { label: "Sticky", value: "yes" },
            { label: "Static", value: "no" },
          ],
        },
        ctaLabel: text,
        ctaHref: text,
        links: {
          type: "array",
          arrayFields: { label: text, href: text },
        },
      },
      render: ({
        sticky,
        ...rest
      }: {
        sticky?: string | boolean;
        logoUrl?: string;
        name?: string;
        links?: Array<{ label: string; href: string }>;
        ctaLabel?: string;
        ctaHref?: string;
        homeHref?: string;
      }) => (
        <Blocks.Navbar {...rest} sticky={sticky !== "no" && sticky !== false} />
      ),
    },
    Hero: {
      fields: {
        eyebrow: text,
        heading: textarea,
        description: textarea,
        primaryLabel: text,
        primaryHref: text,
        secondaryLabel: text,
        secondaryHref: text,
        imageUrl: { type: "text", label: "Image URL" },
        imageAlt: text,
        styles,
      },
      defaultProps: { styles: defaultStyles() },
      render: Hero,
    },
    PageHero: {
      fields: { heading: textarea, description: textarea, styles },
      defaultProps: { styles: defaultStyles() },
      render: PageHero,
    },
    TrustIndicators: {
      fields: {
        items: { type: "array", arrayFields: { label: text } },
        styles,
      },
      defaultProps: { styles: defaultStyles() },
      render: ({
        items,
        styles: box,
      }: {
        items?: Array<{ label?: string }>;
        styles?: import("./styles").StyleBox;
      }) => (
        <StyleShell styles={box}>
          <Blocks.TrustIndicators
            items={(items ?? []).map((item) => item.label || "")}
          />
        </StyleShell>
      ),
    },
    Services: {
      fields: {
        heading: text,
        description: textarea,
        ctaLabel: text,
        ctaHref: text,
        items: {
          type: "array",
          arrayFields: { title: text, body: textarea, imageUrl: text },
        },
        styles,
      },
      defaultProps: { styles: defaultStyles() },
      render: Services,
    },
    AboutSection: {
      fields: { heading: text, body: textarea, imageUrl: text, styles },
      defaultProps: { styles: defaultStyles() },
      render: AboutSection,
    },
    Gallery: {
      fields: {
        heading: text,
        items: { type: "array", arrayFields: { url: text, alt: text } },
        styles,
      },
      defaultProps: { styles: defaultStyles() },
      render: Gallery,
    },
    Testimonials: {
      fields: {
        heading: text,
        items: {
          type: "array",
          arrayFields: {
            quote: textarea,
            name: text,
            rating: { type: "number", min: 1, max: 5 },
            source: text,
          },
        },
        styles,
      },
      defaultProps: { styles: defaultStyles() },
      render: Testimonials,
    },
    Process: {
      fields: {
        heading: text,
        items: { type: "array", arrayFields: { title: text, body: textarea } },
        styles,
      },
      defaultProps: { styles: defaultStyles() },
      render: Process,
    },
    AreasServed: {
      fields: {
        heading: text,
        items: { type: "array", arrayFields: { label: text } },
        styles,
      },
      defaultProps: { styles: defaultStyles() },
      render: ({
        heading,
        items,
        styles: box,
      }: {
        heading?: string;
        items?: Array<{ label?: string }>;
        styles?: import("./styles").StyleBox;
      }) => (
        <StyleShell styles={box}>
          <Blocks.AreasServed
            heading={heading}
            items={(items ?? []).map((item) => item.label || "")}
          />
        </StyleShell>
      ),
    },
    TeamSection: {
      fields: {
        heading: text,
        items: {
          type: "array",
          arrayFields: {
            name: text,
            role: text,
            photoUrl: text,
            bio: textarea,
          },
        },
        styles,
      },
      defaultProps: { styles: defaultStyles() },
      render: TeamSection,
    },
    FAQ: {
      fields: {
        heading: text,
        items: {
          type: "array",
          arrayFields: { question: text, answer: textarea },
        },
        styles,
      },
      defaultProps: { styles: defaultStyles() },
      render: FAQ,
    },
    CTA: {
      fields: {
        heading: text,
        description: textarea,
        label: text,
        href: text,
        styles,
      },
      defaultProps: { styles: defaultStyles() },
      render: CTA,
    },
    ContactSection: {
      fields: {
        heading: text,
        phone: text,
        email: text,
        address: textarea,
        hours: textarea,
        styles,
      },
      defaultProps: { styles: defaultStyles() },
      render: ContactSection,
    },
    Footer: {
      fields: { name: text, note: textarea, phone: text, email: text },
      render: Blocks.Footer,
    },
    Heading: {
      label: "Heading",
      fields: {
        text: textarea,
        as: {
          type: "select",
          options: [
            { label: "H1", value: "h1" },
            { label: "H2", value: "h2" },
            { label: "H3", value: "h3" },
            { label: "H4", value: "h4" },
          ],
        },
        align: {
          type: "radio",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
        size: { type: "text", label: "Font size (e.g. 2.5rem)" },
        color: { type: "text", label: "Colour" },
        weight: {
          type: "select",
          options: [
            { label: "Light", value: "300" },
            { label: "Regular", value: "400" },
            { label: "Medium", value: "500" },
            { label: "Semi", value: "600" },
            { label: "Bold", value: "700" },
          ],
        },
        styles,
      },
      defaultProps: {
        text: "Heading",
        as: "h2",
        align: "left",
        styles: defaultStyles(),
      },
      render: Blocks.Heading,
    },
    TextBlock: {
      label: "Text",
      fields: {
        html: { type: "richtext", label: "Copy" },
        align: {
          type: "radio",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
        styles,
      },
      defaultProps: {
        html: "<p>Write the copy.</p>",
        align: "left",
        styles: defaultStyles(),
      },
      render: Blocks.TextBlock,
    },
    ImageBlock: {
      label: "Image",
      fields: {
        url: { type: "text", label: "Image URL" },
        alt: text,
        caption: text,
        width: { type: "text", label: "Width (e.g. 100% or 480px)" },
        height: { type: "text", label: "Height (e.g. 320px or auto)" },
        objectFit: {
          type: "select",
          options: [
            { label: "Cover", value: "cover" },
            { label: "Contain", value: "contain" },
            { label: "Fill", value: "fill" },
            { label: "None", value: "none" },
          ],
        },
        radius: { type: "text", label: "Radius" },
        styles,
      },
      defaultProps: {
        width: "100%",
        height: "auto",
        objectFit: "cover",
        styles: defaultStyles(),
      },
      render: Blocks.ImageBlock,
    },
    ButtonBlock: {
      label: "Button",
      fields: {
        label: text,
        href: text,
        ghost: {
          type: "radio",
          options: [
            { label: "Solid", value: "no" },
            { label: "Ghost", value: "yes" },
          ],
        },
        size: {
          type: "select",
          options: [
            { label: "Small", value: "sm" },
            { label: "Medium", value: "md" },
            { label: "Large", value: "lg" },
          ],
        },
        fullWidth: {
          type: "radio",
          options: [
            { label: "Hug", value: "no" },
            { label: "Full width", value: "yes" },
          ],
        },
        align: {
          type: "radio",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
        radius: { type: "text", label: "Radius" },
        styles,
      },
      defaultProps: {
        label: "Contact",
        href: "/contact",
        ghost: "no",
        size: "md",
        fullWidth: "no",
        align: "left",
        styles: defaultStyles(),
      },
      render: Blocks.ButtonBlock,
    },
    VideoBlock: {
      label: "Video",
      fields: {
        url: { type: "text", label: "YouTube or MP4 URL" },
        poster: { type: "text", label: "Poster image" },
        styles,
      },
      defaultProps: { styles: defaultStyles() },
      render: Blocks.VideoBlock,
    },
    IconList: {
      label: "Icon list",
      fields: {
        heading: text,
        items: {
          type: "array",
          arrayFields: { title: text, body: textarea },
        },
        styles,
      },
      defaultProps: {
        heading: "Highlights",
        items: [{ title: "Point one", body: "Details" }],
        styles: defaultStyles(),
      },
      render: Blocks.IconList,
    },
    Section: {
      label: "Section",
      fields: {
        content: { type: "slot" },
        styles,
      },
      defaultProps: {
        styles: {
          ...defaultStyles(),
          paddingTop: "64",
          paddingBottom: "64",
          paddingLeft: "0",
          paddingRight: "0",
        },
      },
      render: Blocks.SectionBlock,
    },
    Container: {
      label: "Container",
      fields: {
        content: { type: "slot" },
        maxWidth: { type: "text", label: "Max width" },
        styles,
      },
      defaultProps: {
        maxWidth: "72.5rem",
        styles: {
          ...defaultStyles(),
          paddingLeft: "24",
          paddingRight: "24",
        },
      },
      render: Blocks.ContainerBlock,
    },
    Flex: {
      label: "Flex",
      fields: {
        content: { type: "slot" },
        styles,
      },
      defaultProps: {
        styles: {
          ...defaultStyles(),
          display: "flex",
          direction: "row",
          gap: "16",
          align: "center",
          justify: "flex-start",
          wrap: "wrap",
        },
      },
      render: Blocks.FlexBlock,
    },
    Grid: {
      label: "Grid",
      fields: {
        content: { type: "slot" },
        styles,
      },
      defaultProps: {
        styles: {
          ...defaultStyles(),
          display: "grid",
          gridCols: "3",
          gap: "20",
        },
      },
      render: Blocks.GridBlock,
    },
    Box: {
      label: "Box",
      fields: {
        content: { type: "slot" },
        styles,
      },
      defaultProps: {
        styles: {
          ...defaultStyles(),
          paddingTop: "24",
          paddingRight: "24",
          paddingBottom: "24",
          paddingLeft: "24",
          background: "#f7f7f7",
          radius: "8",
        },
      },
      render: Blocks.BoxBlock,
    },
    TwoColumn: {
      label: "Two columns",
      fields: {
        left: { type: "slot" },
        right: { type: "slot" },
        gap: { type: "text", label: "Gap" },
        ratio: {
          type: "select",
          options: [
            { label: "1 : 1", value: "1-1" },
            { label: "1 : 2", value: "1-2" },
            { label: "2 : 1", value: "2-1" },
          ],
        },
        styles,
      },
      defaultProps: {
        gap: "2rem",
        ratio: "1-1",
        styles: defaultStyles(),
      },
      render: Blocks.TwoColumn,
    },
    Columns3: {
      label: "Three columns",
      fields: {
        left: { type: "slot" },
        center: { type: "slot" },
        right: { type: "slot" },
        gap: { type: "text", label: "Gap" },
        styles,
      },
      defaultProps: { gap: "1.25rem", styles: defaultStyles() },
      render: Blocks.Columns3,
    },
    Spacer: {
      fields: {
        size: {
          type: "select",
          options: [
            { label: "Small", value: "s" },
            { label: "Medium", value: "m" },
            { label: "Large", value: "l" },
          ],
        },
        height: { type: "text", label: "Custom height (px / rem)" },
      },
      defaultProps: { size: "m", height: "" },
      render: Blocks.Spacer,
    },
    Divider: {
      fields: {
        color: { type: "text", label: "Colour" },
        thickness: { type: "text", label: "Thickness" },
        styles,
      },
      defaultProps: { styles: defaultStyles() },
      render: Blocks.Divider,
    },
    Stats: {
      fields: {
        heading: text,
        items: { type: "array", arrayFields: { label: text, value: text } },
        styles,
      },
      defaultProps: { styles: defaultStyles() },
      render: Blocks.Stats,
    },
    Pricing: {
      fields: {
        heading: text,
        items: {
          type: "array",
          arrayFields: { name: text, price: text, body: textarea },
        },
        styles,
      },
      defaultProps: { styles: defaultStyles() },
      render: Pricing,
    },
    BeforeAfter: {
      fields: {
        heading: text,
        beforeUrl: text,
        afterUrl: text,
        styles,
      },
      defaultProps: { styles: defaultStyles() },
      render: BeforeAfter,
    },
    LogoCloud: {
      fields: {
        heading: text,
        items: { type: "array", arrayFields: { url: text, alt: text } },
        styles,
      },
      defaultProps: { styles: defaultStyles() },
      render: LogoCloud,
    },
    MapEmbed: {
      fields: { address: textarea, styles },
      defaultProps: { styles: defaultStyles() },
      render: MapEmbed,
    },
    SocialLinks: {
      fields: {
        items: { type: "array", arrayFields: { label: text, href: text } },
        styles,
      },
      defaultProps: { styles: defaultStyles() },
      render: SocialLinks,
    },
    Breadcrumbs: {
      fields: {
        items: { type: "array", arrayFields: { label: text, href: text } },
        styles,
      },
      defaultProps: { styles: defaultStyles() },
      render: Breadcrumbs,
    },
    BlogGrid: {
      fields: {
        heading: text,
        items: {
          type: "array",
          arrayFields: { title: text, href: text, excerpt: textarea },
        },
        styles,
      },
      defaultProps: { styles: defaultStyles() },
      render: BlogGrid,
    },
    SplitHero: {
      fields: {
        eyebrow: text,
        heading: text,
        description: textarea,
        primaryLabel: text,
        primaryHref: text,
        secondaryLabel: text,
        secondaryHref: text,
        imageUrl: text,
        imageAlt: text,
        styles,
      },
      defaultProps: { styles: defaultStyles() },
      render: SplitHero,
    },
    VideoHero: {
      fields: {
        heading: text,
        description: textarea,
        videoUrl: text,
        primaryLabel: text,
        primaryHref: text,
        styles,
      },
      defaultProps: { styles: defaultStyles() },
      render: VideoHero,
    },
    ContactForm: {
      fields: {
        heading: text,
        email: text,
        styles,
      },
      defaultProps: { styles: defaultStyles() },
      render: ContactForm,
    },
    FooterColumns: {
      fields: {
        name: text,
        note: textarea,
        columns: {
          type: "array",
          arrayFields: {
            title: text,
            links: {
              type: "array",
              arrayFields: { label: text, href: text },
            },
          },
        },
        styles,
      },
      defaultProps: { styles: defaultStyles() },
      render: FooterColumns,
    },
    MobileNavbar: {
      fields: {
        name: text,
        links: {
          type: "array",
          arrayFields: { label: text, href: text },
        },
        ctaLabel: text,
        ctaHref: text,
        styles,
      },
      defaultProps: { styles: defaultStyles() },
      render: MobileNavbar,
    },
    MinimalHero: {
      fields: {
        heading: text,
        description: textarea,
        primaryLabel: text,
        primaryHref: text,
        styles,
      },
      defaultProps: { styles: defaultStyles() },
      render: MinimalHero,
    },
    ImageText: {
      fields: {
        heading: text,
        body: textarea,
        imageUrl: text,
        imageAlt: text,
        reverse: { type: "radio", options: [
          { label: "Image right", value: false },
          { label: "Image left", value: true },
        ]},
        styles,
      },
      defaultProps: { reverse: false, styles: defaultStyles() },
      render: ImageText,
    },
    FeatureGrid: {
      fields: {
        heading: text,
        items: {
          type: "array",
          arrayFields: { title: text, body: textarea },
        },
        styles,
      },
      defaultProps: { styles: defaultStyles() },
      render: FeatureGrid,
    },
    ServiceCard: {
      fields: {
        title: text,
        body: textarea,
        imageUrl: text,
        href: text,
        styles,
      },
      defaultProps: { styles: defaultStyles() },
      render: ServiceCard,
    },
    Projects: {
      fields: {
        heading: text,
        items: {
          type: "array",
          arrayFields: {
            title: text,
            body: textarea,
            imageUrl: text,
            href: text,
          },
        },
        styles,
      },
      defaultProps: { styles: defaultStyles() },
      render: Projects,
    },
    ProjectCard: {
      fields: {
        title: text,
        body: textarea,
        imageUrl: text,
        href: text,
        styles,
      },
      defaultProps: { styles: defaultStyles() },
      render: ProjectCard,
    },
    TeamMember: {
      fields: {
        name: text,
        role: text,
        photoUrl: text,
        bio: textarea,
        styles,
      },
      defaultProps: { styles: defaultStyles() },
      render: TeamMember,
    },
    Certifications: {
      fields: {
        heading: text,
        items: { type: "array", arrayFields: { label: text } },
        styles,
      },
      defaultProps: { styles: defaultStyles() },
      render: Certifications,
    },
    Awards: {
      fields: {
        heading: text,
        items: { type: "array", arrayFields: { label: text } },
        styles,
      },
      defaultProps: { styles: defaultStyles() },
      render: Awards,
    },
    BookingCTA: {
      fields: {
        heading: text,
        body: textarea,
        label: text,
        href: text,
        styles,
      },
      defaultProps: { styles: defaultStyles() },
      render: BookingCTA,
    },
    QuoteForm: {
      fields: {
        heading: text,
        email: text,
        styles,
      },
      defaultProps: { styles: defaultStyles() },
      render: QuoteForm,
    },
    Newsletter: {
      fields: {
        heading: text,
        body: textarea,
        label: text,
        styles,
      },
      defaultProps: { styles: defaultStyles() },
      render: Newsletter,
    },
  },
} as Config;
