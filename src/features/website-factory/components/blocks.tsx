"use client";

import type { ComponentType, CSSProperties, ReactNode } from "react";
import { boxStyleToCss, type StyleBox } from "../puck/styles";

function Img({
  src,
  alt,
  style,
}: {
  src?: string;
  alt?: string;
  style?: CSSProperties;
}) {
  if (!src) return null;
  return <img src={src} alt={alt || ""} style={style} />;
}

function Btn({
  href,
  label,
  ghost,
  size,
  fullWidth,
  radius,
}: {
  href?: string;
  label?: string;
  ghost?: boolean;
  size?: string;
  fullWidth?: boolean;
  radius?: string;
}) {
  if (!href || !label) return null;
  const pad =
    size === "sm" ? "0.5rem 1rem" : size === "lg" ? "1rem 1.75rem" : undefined;
  return (
    <a
      className={`wf-btn${ghost ? " is-ghost" : ""}`}
      href={href}
      style={{
        padding: pad,
        width: fullWidth ? "100%" : undefined,
        borderRadius: radius || undefined,
      }}
    >
      {label}
    </a>
  );
}

function Styled({
  styles,
  className,
  as: Tag = "div",
  children,
}: {
  styles?: StyleBox | null;
  className?: string;
  as?: "div" | "section" | "header" | "nav" | "figure";
  children?: ReactNode;
}) {
  return (
    <Tag className={className} style={boxStyleToCss(styles)}>
      {children}
    </Tag>
  );
}

export function AnnouncementBar({ text }: { text?: string }) {
  if (!text) return null;
  return <div className="wf-announce">{text}</div>;
}

export function Navbar({
  logoUrl,
  name,
  links,
  ctaLabel,
  ctaHref,
  sticky,
  homeHref,
}: {
  logoUrl?: string;
  name?: string;
  links?: Array<{ label: string; href: string }>;
  ctaLabel?: string;
  ctaHref?: string;
  sticky?: boolean;
  homeHref?: string;
}) {
  return (
    <header className={`wf-nav${sticky === false ? "" : " is-sticky"}`}>
      <a className="wf-nav-brand" href={homeHref || "/"}>
        <Img src={logoUrl} alt="" />
        <span>{name}</span>
      </a>
      <nav className="wf-nav-links" aria-label="Main">
        {(links ?? []).map((link) => (
          <a key={`${link.href}-${link.label}`} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
      <Btn href={ctaHref} label={ctaLabel} />
    </header>
  );
}

export function Hero({
  eyebrow,
  heading,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  imageUrl,
  imageAlt,
}: {
  eyebrow?: string;
  heading?: string;
  description?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  imageUrl?: string;
  imageAlt?: string;
}) {
  return (
    <section className={`wf-hero${imageUrl ? " has-image" : ""}`}>
      <div>
        {eyebrow ? <p className="wf-kicker">{eyebrow}</p> : null}
        <h1 className="wf-h1">{heading}</h1>
        {description ? <p className="wf-lede">{description}</p> : null}
        <div className="wf-actions">
          <Btn href={primaryHref} label={primaryLabel} />
          <Btn href={secondaryHref} label={secondaryLabel} ghost />
        </div>
      </div>
      {imageUrl ? (
        <div className="wf-hero-media">
          <Img src={imageUrl} alt={imageAlt || ""} />
        </div>
      ) : null}
    </section>
  );
}

export function PageHero({
  heading,
  description,
}: {
  heading?: string;
  description?: string;
}) {
  return (
    <section className="wf-hero">
      <div>
        <h1 className="wf-h1">{heading}</h1>
        {description ? <p className="wf-lede">{description}</p> : null}
      </div>
    </section>
  );
}

export function TrustIndicators({ items }: { items?: string[] }) {
  const list = (items ?? []).filter(Boolean);
  if (!list.length) return null;
  return (
    <div className="wf-trust">
      {list.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </div>
  );
}

export function Services({
  heading,
  description,
  items,
  ctaLabel,
  ctaHref,
}: {
  heading?: string;
  description?: string;
  items?: Array<{ title: string; body?: string; imageUrl?: string }>;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <section className="wf-section">
      <div className="wf-wrap">
        <p className="wf-kicker">Services</p>
        <h2 className="wf-h2">{heading}</h2>
        {description ? <p className="wf-lede">{description}</p> : null}
        <div className="wf-grid cols-3" style={{ marginTop: "2rem" }}>
          {(items ?? []).map((item) => (
            <article className="wf-card" key={item.title}>
              {item.imageUrl ? (
                <div className="wf-media" style={{ marginBottom: "1rem" }}>
                  <Img src={item.imageUrl} alt="" />
                </div>
              ) : null}
              <h3>{item.title}</h3>
              {item.body ? <p className="wf-lede">{item.body}</p> : null}
            </article>
          ))}
        </div>
        <div className="wf-actions">
          <Btn href={ctaHref} label={ctaLabel} ghost />
        </div>
      </div>
    </section>
  );
}

export function AboutSection({
  heading,
  body,
  imageUrl,
}: {
  heading?: string;
  body?: string;
  imageUrl?: string;
}) {
  return (
    <section className="wf-section">
      <div className="wf-wrap wf-split wf-grid">
        <div>
          <p className="wf-kicker">About</p>
          <h2 className="wf-h2">{heading}</h2>
          {body
            ? body.split("\n").map((para) => (
                <p className="wf-lede" key={para.slice(0, 24)}>
                  {para}
                </p>
              ))
            : null}
        </div>
        {imageUrl ? (
          <div className="wf-media">
            <Img src={imageUrl} alt="" />
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function Gallery({
  heading,
  items,
}: {
  heading?: string;
  items?: Array<{ url: string; alt?: string }>;
}) {
  const photos = (items ?? []).filter((item) => item.url);
  if (!photos.length) return null;
  return (
    <section className="wf-section">
      <div className="wf-wrap">
        <p className="wf-kicker">Work</p>
        <h2 className="wf-h2">{heading || "Recent work"}</h2>
        <div className="wf-grid cols-3" style={{ marginTop: "2rem" }}>
          {photos.map((item) => (
            <div className="wf-media" key={item.url}>
              <Img src={item.url} alt={item.alt || ""} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Testimonials({
  heading,
  items,
}: {
  heading?: string;
  items?: Array<{ quote: string; name: string; rating?: number; source?: string }>;
}) {
  const list = items ?? [];
  if (!list.length) return null;
  return (
    <section className="wf-section">
      <div className="wf-wrap">
        <p className="wf-kicker">Reviews</p>
        <h2 className="wf-h2">{heading || "What clients say"}</h2>
        <div className="wf-grid cols-2" style={{ marginTop: "2rem" }}>
          {list.map((item) => (
            <blockquote className="wf-card" key={`${item.name}-${item.quote.slice(0, 12)}`}>
              <p className="wf-stars" aria-label={`${item.rating || 5} out of 5`}>
                {"★".repeat(item.rating || 5)}
              </p>
              <p className="wf-lede">“{item.quote}”</p>
              <p>
                {item.name}
                {item.source ? ` · ${item.source}` : ""}
              </p>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Process({
  heading,
  items,
}: {
  heading?: string;
  items?: Array<{ title: string; body?: string }>;
}) {
  return (
    <section className="wf-section">
      <div className="wf-wrap">
        <p className="wf-kicker">Process</p>
        <h2 className="wf-h2">{heading || "How we work"}</h2>
        <div className="wf-process" style={{ marginTop: "2rem" }}>
          {(items ?? []).map((item, index) => (
            <article key={item.title}>
              <p className="wf-kicker">0{index + 1}</p>
              <h3>{item.title}</h3>
              {item.body ? <p className="wf-lede">{item.body}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AreasServed({
  heading,
  items,
}: {
  heading?: string;
  items?: string[];
}) {
  const list = (items ?? []).filter(Boolean);
  if (!list.length) return null;
  return (
    <section className="wf-section">
      <div className="wf-wrap">
        <p className="wf-kicker">Areas</p>
        <h2 className="wf-h2">{heading || "Areas served"}</h2>
        <div className="wf-areas" style={{ marginTop: "1.25rem" }}>
          {list.map((item) => (
            <span className="wf-card" key={item}>
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TeamSection({
  heading,
  items,
}: {
  heading?: string;
  items?: Array<{ name: string; role?: string; photoUrl?: string; bio?: string }>;
}) {
  const list = items ?? [];
  if (!list.length) return null;
  return (
    <section className="wf-section">
      <div className="wf-wrap">
        <p className="wf-kicker">Team</p>
        <h2 className="wf-h2">{heading || "People"}</h2>
        <div className="wf-grid cols-3" style={{ marginTop: "2rem" }}>
          {list.map((item) => (
            <article className="wf-card" key={item.name}>
              {item.photoUrl ? (
                <div className="wf-media" style={{ marginBottom: "1rem" }}>
                  <Img src={item.photoUrl} alt="" />
                </div>
              ) : null}
              <h3>{item.name}</h3>
              {item.role ? <p className="wf-lede">{item.role}</p> : null}
              {item.bio ? <p className="wf-lede">{item.bio}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FAQ({
  heading,
  items,
}: {
  heading?: string;
  items?: Array<{ question: string; answer: string }>;
}) {
  const list = items ?? [];
  if (!list.length) return null;
  return (
    <section className="wf-section">
      <div className="wf-wrap">
        <p className="wf-kicker">FAQ</p>
        <h2 className="wf-h2">{heading || "Questions"}</h2>
        <div className="wf-faq" style={{ marginTop: "1.5rem" }}>
          {list.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p className="wf-lede">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CTA({
  heading,
  description,
  label,
  href,
}: {
  heading?: string;
  description?: string;
  label?: string;
  href?: string;
}) {
  return (
    <section className="wf-section">
      <div className="wf-wrap">
        <h2 className="wf-h2">{heading}</h2>
        {description ? <p className="wf-lede">{description}</p> : null}
        <div className="wf-actions">
          <Btn href={href} label={label} />
        </div>
      </div>
    </section>
  );
}

export function ContactSection({
  heading,
  phone,
  email,
  address,
  hours,
}: {
  heading?: string;
  phone?: string;
  email?: string;
  address?: string;
  hours?: string;
}) {
  return (
    <section className="wf-section">
      <div className="wf-wrap wf-contact-grid">
        <div>
          <p className="wf-kicker">Contact</p>
          <h2 className="wf-h2">{heading || "Get in touch"}</h2>
          {phone ? (
            <p className="wf-lede">
              <a href={`tel:${phone}`}>{phone}</a>
            </p>
          ) : null}
          {email ? (
            <p className="wf-lede">
              <a href={`mailto:${email}`}>{email}</a>
            </p>
          ) : null}
          {address ? <p className="wf-lede">{address}</p> : null}
          {hours ? <p className="wf-lede">{hours}</p> : null}
        </div>
        <form className="wf-card" method="post" action={`mailto:${email || ""}`}>
          <p className="wf-kicker">Write to us</p>
          <p className="wf-lede">
            This form opens your email app. No messages are stored on this site.
          </p>
          <div className="wf-actions">
            <Btn href={email ? `mailto:${email}` : undefined} label="Email us" />
          </div>
        </form>
      </div>
    </section>
  );
}

export function Footer({
  name,
  note,
  phone,
  email,
}: {
  name?: string;
  note?: string;
  phone?: string;
  email?: string;
}) {
  return (
    <footer className="wf-footer">
      <div className="wf-footer-top">
        <div>
          <strong>{name}</strong>
          {note ? <p className="wf-lede">{note}</p> : null}
        </div>
        <div>
          {phone ? <p>{phone}</p> : null}
          {email ? <p>{email}</p> : null}
        </div>
      </div>
      <small>© {new Date().getFullYear()} {name}</small>
    </footer>
  );
}

function SlotValue({ value }: { value?: ReactNode | ComponentType }) {
  if (!value) return null;
  if (typeof value === "function") {
    const Comp = value as ComponentType;
    return <Comp />;
  }
  return <>{value}</>;
}

export function Heading({
  text,
  as = "h2",
  align,
  size,
  color,
  weight,
  styles,
}: {
  text?: string;
  as?: "h1" | "h2" | "h3" | "h4" | string;
  align?: string;
  size?: string;
  color?: string;
  weight?: string;
  styles?: StyleBox;
}) {
  const Tag =
    as === "h1" ? "h1" : as === "h3" ? "h3" : as === "h4" ? "h4" : "h2";
  const className = as === "h1" ? "wf-h1" : "wf-h2";
  return (
    <Styled as="section" className="wf-block" styles={styles}>
      <div className="wf-wrap">
        <Tag
          className={className}
          style={{
            textAlign: (align as CSSProperties["textAlign"]) || undefined,
            fontSize: size || undefined,
            color: color || undefined,
            fontWeight: weight || undefined,
            maxWidth: align === "center" ? "none" : undefined,
            marginInline: align === "center" ? "auto" : undefined,
          }}
        >
          {text}
        </Tag>
      </div>
    </Styled>
  );
}

export function TextBlock({
  html,
  text,
  align,
  styles,
}: {
  html?: string;
  text?: string;
  align?: string;
  styles?: StyleBox;
}) {
  const body = html || text || "";
  if (!body) return null;
  return (
    <Styled as="section" className="wf-block" styles={styles}>
      <div
        className="wf-wrap"
        style={{ textAlign: (align as CSSProperties["textAlign"]) || undefined }}
      >
        {html ? (
          <div className="wf-rich" dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <p className="wf-lede">{text}</p>
        )}
      </div>
    </Styled>
  );
}

export function ImageBlock({
  url,
  alt,
  caption,
  width,
  height,
  objectFit,
  radius,
  styles,
}: {
  url?: string;
  alt?: string;
  caption?: string;
  width?: string;
  height?: string;
  objectFit?: string;
  radius?: string;
  styles?: StyleBox;
}) {
  if (!url) return null;
  return (
    <Styled as="section" className="wf-block" styles={styles}>
      <div className="wf-wrap">
        <figure className="wf-figure">
          <Img
            src={url}
            alt={alt}
            style={{
              width: width || "100%",
              height: height || "auto",
              objectFit: (objectFit as CSSProperties["objectFit"]) || "cover",
              borderRadius: radius || undefined,
              display: "block",
            }}
          />
          {caption ? <figcaption>{caption}</figcaption> : null}
        </figure>
      </div>
    </Styled>
  );
}

export function ButtonBlock({
  label,
  href,
  ghost,
  size,
  fullWidth,
  align,
  radius,
  styles,
}: {
  label?: string;
  href?: string;
  ghost?: string | boolean;
  size?: string;
  fullWidth?: string | boolean;
  align?: string;
  radius?: string;
  styles?: StyleBox;
}) {
  return (
    <Styled as="section" className="wf-block" styles={styles}>
      <div
        className="wf-wrap"
        style={{
          display: "flex",
          justifyContent:
            align === "center"
              ? "center"
              : align === "right"
                ? "flex-end"
                : "flex-start",
        }}
      >
        <Btn
          href={href}
          label={label}
          ghost={ghost === true || ghost === "yes"}
          size={size}
          fullWidth={fullWidth === true || fullWidth === "yes"}
          radius={radius}
        />
      </div>
    </Styled>
  );
}

export function Spacer({
  size = "m",
  height,
}: {
  size?: "s" | "m" | "l" | string;
  height?: string;
}) {
  const fallback = size === "s" ? "2rem" : size === "l" ? "6rem" : "3.5rem";
  return (
    <div
      className="wf-spacer"
      style={{ height: height || fallback }}
      aria-hidden
    />
  );
}

export function Divider({
  color,
  thickness,
  styles,
}: {
  color?: string;
  thickness?: string;
  styles?: StyleBox;
}) {
  return (
    <Styled className="wf-wrap" styles={styles}>
      <hr
        className="wf-divider"
        style={{
          borderColor: color || undefined,
          borderTopWidth: thickness || undefined,
        }}
      />
    </Styled>
  );
}

export function TwoColumn({
  left,
  right,
  gap,
  ratio,
  styles,
}: {
  left?: ReactNode | ComponentType;
  right?: ReactNode | ComponentType;
  gap?: string;
  ratio?: string;
  styles?: StyleBox;
}) {
  const template =
    ratio === "1-2" ? "1fr 2fr" : ratio === "2-1" ? "2fr 1fr" : "1fr 1fr";
  return (
    <Styled as="section" className="wf-block" styles={styles}>
      <div
        className="wf-wrap wf-two-col"
        style={{ gap: gap || undefined, gridTemplateColumns: template }}
      >
        <div>
          <SlotValue value={left} />
        </div>
        <div>
          <SlotValue value={right} />
        </div>
      </div>
    </Styled>
  );
}

export function SectionBlock({
  content,
  styles,
}: {
  content?: ReactNode | ComponentType;
  styles?: StyleBox;
}) {
  return (
    <Styled as="section" className="wf-section-frame" styles={styles}>
      <SlotValue value={content} />
    </Styled>
  );
}

export function ContainerBlock({
  content,
  maxWidth,
  styles,
}: {
  content?: ReactNode | ComponentType;
  maxWidth?: string;
  styles?: StyleBox;
}) {
  return (
    <Styled
      className="wf-container-frame"
      styles={{
        ...styles,
        maxWidth: styles?.maxWidth || maxWidth || "72.5rem",
        width: styles?.width || "100%",
        marginLeft: styles?.marginLeft || "auto",
        marginRight: styles?.marginRight || "auto",
      }}
    >
      <SlotValue value={content} />
    </Styled>
  );
}

export function FlexBlock({
  content,
  styles,
}: {
  content?: ReactNode | ComponentType;
  styles?: StyleBox;
}) {
  return (
    <Styled
      className="wf-flex-frame"
      styles={{
        direction: "row",
        gap: "1rem",
        align: "center",
        ...styles,
        display: "flex",
      }}
    >
      <SlotValue value={content} />
    </Styled>
  );
}

export function GridBlock({
  content,
  styles,
}: {
  content?: ReactNode | ComponentType;
  styles?: StyleBox;
}) {
  return (
    <Styled
      className="wf-grid-frame"
      styles={{
        gridCols: "3",
        gap: "1.25rem",
        ...styles,
        display: "grid",
      }}
    >
      <SlotValue value={content} />
    </Styled>
  );
}

export function Columns3({
  left,
  center,
  right,
  gap,
  styles,
}: {
  left?: ReactNode | ComponentType;
  center?: ReactNode | ComponentType;
  right?: ReactNode | ComponentType;
  gap?: string;
  styles?: StyleBox;
}) {
  return (
    <Styled as="section" className="wf-block" styles={styles}>
      <div className="wf-wrap wf-cols-3" style={{ gap: gap || "1.25rem" }}>
        <div>
          <SlotValue value={left} />
        </div>
        <div>
          <SlotValue value={center} />
        </div>
        <div>
          <SlotValue value={right} />
        </div>
      </div>
    </Styled>
  );
}

export function BoxBlock({
  content,
  styles,
}: {
  content?: ReactNode | ComponentType;
  styles?: StyleBox;
}) {
  return (
    <Styled className="wf-box-frame" styles={styles}>
      <SlotValue value={content} />
    </Styled>
  );
}

export function VideoBlock({
  url,
  poster,
  styles,
}: {
  url?: string;
  poster?: string;
  styles?: StyleBox;
}) {
  if (!url) return null;
  const isYoutube = /youtube\.com|youtu\.be/.test(url);
  const embed = url
    .replace("watch?v=", "embed/")
    .replace("youtu.be/", "youtube.com/embed/");
  return (
    <Styled as="section" className="wf-block" styles={styles}>
      <div className="wf-wrap">
        {isYoutube ? (
          <div className="wf-video">
            <iframe
              src={embed}
              title="Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <video className="wf-video-el" controls poster={poster} src={url} />
        )}
      </div>
    </Styled>
  );
}

export function IconList({
  heading,
  items,
  styles,
}: {
  heading?: string;
  items?: Array<{ title?: string; body?: string }>;
  styles?: StyleBox;
}) {
  if (!items?.length) return null;
  return (
    <Styled as="section" className="wf-block" styles={styles}>
      <div className="wf-wrap">
        {heading ? <h2 className="wf-h2">{heading}</h2> : null}
        <ul className="wf-icon-list">
          {items.map((item) => (
            <li key={item.title}>
              <strong>{item.title}</strong>
              <p className="wf-lede">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </Styled>
  );
}

export function Stats({
  heading,
  items,
  styles,
}: {
  heading?: string;
  items?: Array<{ label?: string; value?: string }>;
  styles?: StyleBox;
}) {
  if (!items?.length) return null;
  return (
    <Styled as="section" className="wf-block" styles={styles}>
      <div className="wf-wrap">
        {heading ? <h2 className="wf-h2">{heading}</h2> : null}
        <div className="wf-stats">
          {items.map((item) => (
            <div key={`${item.label}-${item.value}`}>
              <p className="wf-h1">{item.value}</p>
              <p className="wf-lede">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </Styled>
  );
}

export function Pricing({
  heading,
  items,
}: {
  heading?: string;
  items?: Array<{ name?: string; price?: string; body?: string }>;
}) {
  if (!items?.length) return null;
  return (
    <section className="wf-block">
      <div className="wf-wrap">
        {heading ? <h2 className="wf-h2">{heading}</h2> : null}
        <div className="wf-cards">
          {items.map((item) => (
            <article className="wf-card" key={item.name}>
              <h3>{item.name}</h3>
              {item.price ? <p className="wf-h2">{item.price}</p> : null}
              <p className="wf-lede">{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BeforeAfter({
  heading,
  beforeUrl,
  afterUrl,
}: {
  heading?: string;
  beforeUrl?: string;
  afterUrl?: string;
}) {
  if (!beforeUrl && !afterUrl) return null;
  return (
    <section className="wf-block">
      <div className="wf-wrap">
        {heading ? <h2 className="wf-h2">{heading}</h2> : null}
        <div className="wf-two-col">
          <figure className="wf-figure">
            <Img src={beforeUrl} alt="Before" />
            <figcaption>Before</figcaption>
          </figure>
          <figure className="wf-figure">
            <Img src={afterUrl} alt="After" />
            <figcaption>After</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

export function LogoCloud({
  heading,
  items,
}: {
  heading?: string;
  items?: Array<{ url?: string; alt?: string }>;
}) {
  if (!items?.length) return null;
  return (
    <section className="wf-block">
      <div className="wf-wrap">
        {heading ? <p className="wf-kicker">{heading}</p> : null}
        <div className="wf-logos">
          {items.map((item) => (
            <Img key={item.url} src={item.url} alt={item.alt} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function MapEmbed({ address }: { address?: string }) {
  if (!address) return null;
  const q = encodeURIComponent(address);
  return (
    <section className="wf-block">
      <div className="wf-wrap">
        <p className="wf-kicker">Location</p>
        <p className="wf-lede">{address}</p>
        <a className="wf-btn is-ghost" href={`https://www.openstreetmap.org/search?query=${q}`}>
          Open map
        </a>
      </div>
    </section>
  );
}

export function SocialLinks({
  items,
}: {
  items?: Array<{ label?: string; href?: string }>;
}) {
  if (!items?.length) return null;
  return (
    <nav className="wf-wrap wf-social" aria-label="Social">
      {items.map((item) => (
        <a key={item.href} href={item.href}>
          {item.label}
        </a>
      ))}
    </nav>
  );
}

export function Breadcrumbs({
  items,
}: {
  items?: Array<{ label?: string; href?: string }>;
}) {
  if (!items?.length) return null;
  return (
    <nav className="wf-wrap wf-crumbs" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <span key={`${item.href}-${item.label}`}>
          {index > 0 ? " / " : null}
          <a href={item.href}>{item.label}</a>
        </span>
      ))}
    </nav>
  );
}

export function BlogGrid({
  heading,
  items,
}: {
  heading?: string;
  items?: Array<{ title?: string; href?: string; excerpt?: string }>;
}) {
  if (!items?.length) return null;
  return (
    <section className="wf-block">
      <div className="wf-wrap">
        {heading ? <h2 className="wf-h2">{heading}</h2> : null}
        <div className="wf-cards">
          {items.map((item) => (
            <article className="wf-card" key={item.title}>
              <h3>{item.title}</h3>
              <p className="wf-lede">{item.excerpt}</p>
              {item.href ? <a href={item.href}>Read</a> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Split layout hero — text + media columns */
export function SplitHero(props: Parameters<typeof Hero>[0]) {
  return (
    <div className="wf-split-hero">
      <Hero {...props} />
    </div>
  );
}

/** Hero driven by an embedded video */
export function VideoHero({
  heading,
  description,
  videoUrl,
  primaryLabel,
  primaryHref,
}: {
  heading?: string;
  description?: string;
  videoUrl?: string;
  primaryLabel?: string;
  primaryHref?: string;
}) {
  return (
    <section className="wf-hero has-image">
      <div>
        <h1 className="wf-h1">{heading}</h1>
        {description ? <p className="wf-lede">{description}</p> : null}
        <div className="wf-actions">
          <Btn href={primaryHref} label={primaryLabel} />
        </div>
      </div>
      <div className="wf-hero-media">
        <VideoBlock url={videoUrl} />
      </div>
    </section>
  );
}

export function ContactForm({
  heading,
  email,
}: {
  heading?: string;
  email?: string;
}) {
  return (
    <section className="wf-section">
      <div className="wf-wrap">
        <h2 className="wf-h2">{heading || "Contact"}</h2>
        <form
          className="wf-card"
          method="post"
          action={email ? `mailto:${email}` : undefined}
        >
          <label className="wf-lede">
            Name
            <input name="name" className="wf-input" />
          </label>
          <label className="wf-lede">
            Message
            <textarea name="message" className="wf-input" rows={4} />
          </label>
          <div className="wf-actions">
            <Btn href={email ? `mailto:${email}` : undefined} label="Send" />
          </div>
        </form>
      </div>
    </section>
  );
}

export function FooterColumns({
  name,
  columns,
  note,
}: {
  name?: string;
  columns?: Array<{
    title?: string;
    links?: Array<{ label?: string; href?: string }>;
  }>;
  note?: string;
}) {
  return (
    <footer className="wf-footer">
      <div className="wf-wrap wf-grid cols-3">
        <div>
          <strong>{name}</strong>
          {note ? <p className="wf-lede">{note}</p> : null}
        </div>
        {(columns ?? []).map((column, index) => (
          <div key={`${column.title || "col"}-${index}`}>
            <p className="wf-kicker">{column.title}</p>
            <ul>
              {(column.links ?? []).map((link, linkIndex) => (
                <li key={`${link.href || link.label}-${linkIndex}`}>
                  <a href={link.href || "#"}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}

export function MobileNavbar({
  name,
  links,
  ctaLabel,
  ctaHref,
}: {
  name?: string;
  links?: Array<{ label?: string; href?: string }>;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <nav className="wf-nav wf-nav-mobile">
      <div className="wf-wrap wf-nav-inner">
        <strong>{name}</strong>
        <details>
          <summary>Menu</summary>
          <ul>
            {(links ?? []).map((link, index) => (
              <li key={`${link.href}-${index}`}>
                <a href={link.href || "#"}>{link.label}</a>
              </li>
            ))}
          </ul>
          <Btn href={ctaHref} label={ctaLabel} />
        </details>
      </div>
    </nav>
  );
}

export function MinimalHero({
  heading,
  description,
  primaryLabel,
  primaryHref,
}: {
  heading?: string;
  description?: string;
  primaryLabel?: string;
  primaryHref?: string;
}) {
  return (
    <section className="wf-hero wf-hero-minimal">
      <div className="wf-wrap">
        <h1 className="wf-h1">{heading}</h1>
        {description ? <p className="wf-lede">{description}</p> : null}
        <div className="wf-actions">
          <Btn href={primaryHref} label={primaryLabel} />
        </div>
      </div>
    </section>
  );
}

export function ImageText({
  heading,
  body,
  imageUrl,
  imageAlt,
  reverse,
}: {
  heading?: string;
  body?: string;
  imageUrl?: string;
  imageAlt?: string;
  reverse?: boolean;
}) {
  return (
    <section className="wf-section">
      <div
        className={`wf-wrap wf-split wf-grid${reverse ? " is-reverse" : ""}`}
      >
        <div>
          <h2 className="wf-h2">{heading}</h2>
          {body ? <p className="wf-lede">{body}</p> : null}
        </div>
        {imageUrl ? (
          <div className="wf-media">
            <Img src={imageUrl} alt={imageAlt} />
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function FeatureGrid({
  heading,
  items,
}: {
  heading?: string;
  items?: Array<{ title?: string; body?: string }>;
}) {
  return (
    <section className="wf-section">
      <div className="wf-wrap">
        {heading ? <h2 className="wf-h2">{heading}</h2> : null}
        <div className="wf-grid cols-3" style={{ marginTop: "1.5rem" }}>
          {(items ?? []).map((item, index) => (
            <article className="wf-card" key={`${item.title}-${index}`}>
              <h3>{item.title}</h3>
              {item.body ? <p className="wf-lede">{item.body}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ServiceCard({
  title,
  body,
  imageUrl,
  href,
}: {
  title?: string;
  body?: string;
  imageUrl?: string;
  href?: string;
}) {
  return (
    <article className="wf-card">
      {imageUrl ? (
        <div className="wf-media" style={{ marginBottom: "1rem" }}>
          <Img src={imageUrl} alt="" />
        </div>
      ) : null}
      <h3>{title}</h3>
      {body ? <p className="wf-lede">{body}</p> : null}
      {href ? <a href={href}>Learn more</a> : null}
    </article>
  );
}

export function Projects({
  heading,
  items,
}: {
  heading?: string;
  items?: Array<{ title?: string; body?: string; imageUrl?: string; href?: string }>;
}) {
  return (
    <section className="wf-section">
      <div className="wf-wrap">
        <p className="wf-kicker">Work</p>
        <h2 className="wf-h2">{heading || "Projects"}</h2>
        <div className="wf-grid cols-3" style={{ marginTop: "1.5rem" }}>
          {(items ?? []).map((item, index) => (
            <ProjectCard key={`${item.title}-${index}`} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProjectCard({
  title,
  body,
  imageUrl,
  href,
}: {
  title?: string;
  body?: string;
  imageUrl?: string;
  href?: string;
}) {
  return (
    <article className="wf-card">
      {imageUrl ? (
        <div className="wf-media" style={{ marginBottom: "1rem" }}>
          <Img src={imageUrl} alt="" />
        </div>
      ) : null}
      <h3>{title}</h3>
      {body ? <p className="wf-lede">{body}</p> : null}
      {href ? <a href={href}>View</a> : null}
    </article>
  );
}

export function TeamMember({
  name,
  role,
  photoUrl,
  bio,
}: {
  name?: string;
  role?: string;
  photoUrl?: string;
  bio?: string;
}) {
  return (
    <article className="wf-card">
      {photoUrl ? (
        <div className="wf-media" style={{ marginBottom: "1rem" }}>
          <Img src={photoUrl} alt={name} />
        </div>
      ) : null}
      <h3>{name}</h3>
      {role ? <p className="wf-kicker">{role}</p> : null}
      {bio ? <p className="wf-lede">{bio}</p> : null}
    </article>
  );
}

export function Certifications({
  heading,
  items,
}: {
  heading?: string;
  items?: Array<{ label?: string }>;
}) {
  if (!items?.length) return null;
  return (
    <section className="wf-section">
      <div className="wf-wrap">
        <h2 className="wf-h2">{heading || "Certifications"}</h2>
        <ul className="wf-icon-list">
          {items.map((item, index) => (
            <li key={`${item.label}-${index}`}>{item.label}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Awards({
  heading,
  items,
}: {
  heading?: string;
  items?: Array<{ label?: string }>;
}) {
  if (!items?.length) return null;
  return (
    <section className="wf-section">
      <div className="wf-wrap">
        <h2 className="wf-h2">{heading || "Awards"}</h2>
        <ul className="wf-icon-list">
          {items.map((item, index) => (
            <li key={`${item.label}-${index}`}>{item.label}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function BookingCTA({
  heading,
  body,
  label,
  href,
}: {
  heading?: string;
  body?: string;
  label?: string;
  href?: string;
}) {
  return (
    <section className="wf-section">
      <div className="wf-wrap wf-card">
        <h2 className="wf-h2">{heading || "Book a call"}</h2>
        {body ? <p className="wf-lede">{body}</p> : null}
        <div className="wf-actions">
          <Btn href={href} label={label || "Book now"} />
        </div>
      </div>
    </section>
  );
}

export function QuoteForm({
  heading,
  email,
}: {
  heading?: string;
  email?: string;
}) {
  return (
    <section className="wf-section">
      <div className="wf-wrap">
        <h2 className="wf-h2">{heading || "Request a quote"}</h2>
        <form
          className="wf-card"
          method="post"
          action={email ? `mailto:${email}` : undefined}
        >
          <label className="wf-lede">
            Name
            <input name="name" className="wf-input" />
          </label>
          <label className="wf-lede">
            Project details
            <textarea name="details" className="wf-input" rows={4} />
          </label>
          <div className="wf-actions">
            <Btn href={email ? `mailto:${email}` : undefined} label="Send quote request" />
          </div>
        </form>
      </div>
    </section>
  );
}

export function Newsletter({
  heading,
  body,
  label,
}: {
  heading?: string;
  body?: string;
  label?: string;
}) {
  return (
    <section className="wf-section">
      <div className="wf-wrap wf-card">
        <h2 className="wf-h2">{heading || "Stay updated"}</h2>
        {body ? <p className="wf-lede">{body}</p> : null}
        <form className="wf-actions" onSubmit={(e) => e.preventDefault()}>
          <input type="email" className="wf-input" placeholder="you@example.com" />
          <button type="submit" className="wf-btn">
            {label || "Subscribe"}
          </button>
        </form>
      </div>
    </section>
  );
}
