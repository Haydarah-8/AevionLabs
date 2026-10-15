"use client";

import type { CSSProperties, ReactNode } from "react";

function Shell({
  children,
  className,
  style,
}: {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <section className={className || "wf-section"} style={style}>
      <div className="wf-wrap">{children}</div>
    </section>
  );
}

export function CountdownTimer({
  heading,
  targetDate,
  label,
}: {
  heading?: string;
  targetDate?: string;
  label?: string;
}) {
  return (
    <Shell>
      <h2 className="wf-h2">{heading || "Launching soon"}</h2>
      <p className="wf-lede">{label || targetDate || "Set a date"}</p>
      <div
        className="wf-grid"
        style={{ gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}
      >
        {["Days", "Hours", "Mins", "Secs"].map((unit) => (
          <div
            key={unit}
            className="wf-card"
            style={{ textAlign: "center", padding: 16 }}
          >
            <strong style={{ fontSize: "1.75rem" }}>00</strong>
            <div className="wf-muted">{unit}</div>
          </div>
        ))}
      </div>
    </Shell>
  );
}

export function Timeline({
  heading,
  items,
}: {
  heading?: string;
  items?: Array<{ year?: string; title?: string; body?: string }>;
}) {
  const rows = items?.length
    ? items
    : [{ year: "2024", title: "Started", body: "Add milestones" }];
  return (
    <Shell>
      <h2 className="wf-h2">{heading || "Timeline"}</h2>
      <ol
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "grid",
          gap: 16,
        }}
      >
        {rows.map((item, i) => (
          <li
            key={i}
            className="wf-card"
            style={{
              display: "grid",
              gridTemplateColumns: "5rem 1fr",
              gap: 16,
            }}
          >
            <strong>{item.year}</strong>
            <div>
              <h3 className="wf-h3">{item.title}</h3>
              {item.body ? <p className="wf-lede">{item.body}</p> : null}
            </div>
          </li>
        ))}
      </ol>
    </Shell>
  );
}

export function ComparisonTable({
  heading,
  columns,
  rows,
}: {
  heading?: string;
  columns?: Array<{ label?: string }>;
  rows?: Array<{ feature?: string; a?: string; b?: string; c?: string }>;
}) {
  const cols = columns?.length ? columns : [{ label: "Us" }, { label: "Them" }];
  const data = rows?.length ? rows : [{ feature: "Speed", a: "Yes", b: "No" }];
  return (
    <Shell>
      <h2 className="wf-h2">{heading || "Compare"}</h2>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: 10 }}>Feature</th>
              {cols.map((col, i) => (
                <th key={i} style={{ textAlign: "left", padding: 10 }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} style={{ borderTop: "1px solid #e5e5e5" }}>
                <td style={{ padding: 10 }}>{row.feature}</td>
                <td style={{ padding: 10 }}>{row.a}</td>
                <td style={{ padding: 10 }}>{row.b}</td>
                {cols.length > 2 ? (
                  <td style={{ padding: 10 }}>{row.c}</td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}

export function PricingToggle({
  heading,
  monthlyLabel,
  yearlyLabel,
  plans,
}: {
  heading?: string;
  monthlyLabel?: string;
  yearlyLabel?: string;
  plans?: Array<{
    name?: string;
    price?: string;
    body?: string;
    href?: string;
  }>;
}) {
  const items = plans?.length
    ? plans
    : [
        {
          name: "Starter",
          price: "£49/mo",
          body: "For small teams",
          href: "#",
        },
        {
          name: "Growth",
          price: "£129/mo",
          body: "For scaling brands",
          href: "#",
        },
      ];
  return (
    <Shell>
      <h2 className="wf-h2">{heading || "Pricing"}</h2>
      <p className="wf-muted">
        {monthlyLabel || "Monthly"} · {yearlyLabel || "Yearly (−20%)"}
      </p>
      <div
        className="wf-grid"
        style={{
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: 16,
        }}
      >
        {items.map((plan, i) => (
          <div key={i} className="wf-card" style={{ padding: 20 }}>
            <h3 className="wf-h3">{plan.name}</h3>
            <p style={{ fontSize: "1.75rem", margin: "8px 0" }}>{plan.price}</p>
            <p className="wf-lede">{plan.body}</p>
            {plan.href ? (
              <a className="wf-btn" href={plan.href}>
                Choose
              </a>
            ) : null}
          </div>
        ))}
      </div>
    </Shell>
  );
}

export function TestimonialSlider({
  heading,
  quotes,
}: {
  heading?: string;
  quotes?: Array<{ quote?: string; name?: string; role?: string }>;
}) {
  const items = quotes?.length
    ? quotes
    : [
        {
          quote: "They shipped a working prototype in a week.",
          name: "Alex",
          role: "Founder",
        },
      ];
  const current = items[0];
  return (
    <Shell>
      <h2 className="wf-h2">{heading || "What clients say"}</h2>
      <blockquote
        className="wf-card"
        style={{ padding: 24, fontSize: "1.25rem" }}
      >
        “{current.quote}”
        <footer className="wf-muted" style={{ marginTop: 12 }}>
          {current.name}
          {current.role ? ` · ${current.role}` : ""}
        </footer>
      </blockquote>
    </Shell>
  );
}

export function LogoWall({
  heading,
  logos,
}: {
  heading?: string;
  logos?: Array<{ name?: string; src?: string }>;
}) {
  const items = logos?.length
    ? logos
    : [{ name: "Acme" }, { name: "Globex" }, { name: "Initech" }];
  return (
    <Shell>
      <h2 className="wf-h2">{heading || "Trusted by"}</h2>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 24,
          alignItems: "center",
        }}
      >
        {items.map((logo, i) =>
          logo.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={logo.src}
              alt={logo.name || ""}
              style={{ height: 28, opacity: 0.7 }}
            />
          ) : (
            <span key={i} className="wf-muted" style={{ fontWeight: 600 }}>
              {logo.name}
            </span>
          ),
        )}
      </div>
    </Shell>
  );
}

export function MarqueeStrip({ text }: { text?: string }) {
  const value = text || "Design · Build · Launch · ";
  return (
    <div
      className="wf-announce"
      style={{
        overflow: "hidden",
        whiteSpace: "nowrap",
        letterSpacing: "0.08em",
      }}
    >
      {value.repeat(6)}
    </div>
  );
}

export function StickyCTA({
  text,
  label,
  href,
}: {
  text?: string;
  label?: string;
  href?: string;
}) {
  return (
    <div
      className="wf-card"
      style={{
        position: "sticky",
        bottom: 16,
        margin: "0 auto",
        maxWidth: 720,
        display: "flex",
        gap: 12,
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        zIndex: 5,
      }}
    >
      <span>{text || "Ready to start?"}</span>
      <a className="wf-btn" href={href || "#"}>
        {label || "Book a call"}
      </a>
    </div>
  );
}

export function FeatureChecklist({
  heading,
  items,
}: {
  heading?: string;
  items?: Array<{ label?: string; done?: boolean | string }>;
}) {
  const rows = items?.length
    ? items
    : [
        { label: "Prototype in days", done: true },
        { label: "CMS you can edit", done: true },
        { label: "Analytics wired", done: false },
      ];
  return (
    <Shell>
      <h2 className="wf-h2">{heading || "What's included"}</h2>
      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "grid",
          gap: 8,
        }}
      >
        {rows.map((item, i) => (
          <li
            key={i}
            style={{ display: "flex", gap: 10, alignItems: "center" }}
          >
            <span aria-hidden>
              {item.done === false || item.done === "no" ? "○" : "●"}
            </span>
            {item.label}
          </li>
        ))}
      </ul>
    </Shell>
  );
}

export function StatCallout({
  value,
  label,
  body,
}: {
  value?: string;
  label?: string;
  body?: string;
}) {
  return (
    <Shell>
      <div className="wf-card" style={{ textAlign: "center", padding: 32 }}>
        <div
          style={{
            fontSize: "3rem",
            fontWeight: 600,
            letterSpacing: "-0.04em",
          }}
        >
          {value || "3×"}
        </div>
        <h3 className="wf-h3">{label || "Faster to first ship"}</h3>
        {body ? <p className="wf-lede">{body}</p> : null}
      </div>
    </Shell>
  );
}

export function QuoteBanner({
  quote,
  attribution,
}: {
  quote?: string;
  attribution?: string;
}) {
  return (
    <section
      className="wf-section"
      style={{ background: "#111", color: "#fff" }}
    >
      <div className="wf-wrap" style={{ textAlign: "center", maxWidth: 720 }}>
        <p style={{ fontSize: "clamp(1.4rem,3vw,2.2rem)", lineHeight: 1.3 }}>
          “{quote || "Ship the proof before you fund the polish."}”
        </p>
        {attribution ? (
          <p className="wf-muted" style={{ color: "rgba(255,255,255,0.6)" }}>
            {attribution}
          </p>
        ) : null}
      </div>
    </section>
  );
}

export function AccordionFAQ({
  heading,
  items,
}: {
  heading?: string;
  items?: Array<{ q?: string; a?: string }>;
}) {
  const rows = items?.length
    ? items
    : [
        {
          q: "How long does a prototype take?",
          a: "Usually days, not months.",
        },
        {
          q: "Can we edit after launch?",
          a: "Yes — Studio and CMS stay yours.",
        },
      ];
  return (
    <Shell>
      <h2 className="wf-h2">{heading || "FAQ"}</h2>
      <div style={{ display: "grid", gap: 8 }}>
        {rows.map((item, i) => (
          <details key={i} className="wf-card" style={{ padding: 14 }}>
            <summary style={{ cursor: "pointer", fontWeight: 600 }}>
              {item.q}
            </summary>
            <p className="wf-lede" style={{ marginTop: 8 }}>
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </Shell>
  );
}

export function TabbedContent({
  heading,
  tabs,
}: {
  heading?: string;
  tabs?: Array<{ label?: string; body?: string }>;
}) {
  const items = tabs?.length
    ? tabs
    : [
        { label: "Product", body: "Describe the product tab." },
        { label: "Process", body: "Describe the process tab." },
      ];
  return (
    <Shell>
      <h2 className="wf-h2">{heading || "Explore"}</h2>
      <div
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}
      >
        {items.map((tab, i) => (
          <span
            key={i}
            className="wf-btn is-ghost"
            style={{ padding: "0.4rem 0.9rem", opacity: i === 0 ? 1 : 0.55 }}
          >
            {tab.label}
          </span>
        ))}
      </div>
      <p className="wf-lede">{items[0]?.body}</p>
    </Shell>
  );
}

export function StepsHorizontal({
  heading,
  steps,
}: {
  heading?: string;
  steps?: Array<{ title?: string; body?: string }>;
}) {
  const items = steps?.length
    ? steps
    : [
        { title: "Brief", body: "Goals and constraints" },
        { title: "Prototype", body: "Clickable proof" },
        { title: "Ship", body: "Launch and iterate" },
      ];
  return (
    <Shell>
      <h2 className="wf-h2">{heading || "How it works"}</h2>
      <div
        className="wf-grid"
        style={{
          gridTemplateColumns: `repeat(${Math.min(items.length, 4)},1fr)`,
          gap: 16,
        }}
      >
        {items.map((step, i) => (
          <div key={i} className="wf-card" style={{ padding: 16 }}>
            <div className="wf-muted">0{i + 1}</div>
            <h3 className="wf-h3">{step.title}</h3>
            <p className="wf-lede">{step.body}</p>
          </div>
        ))}
      </div>
    </Shell>
  );
}

export function IconFeatureGrid({
  heading,
  items,
}: {
  heading?: string;
  items?: Array<{ icon?: string; title?: string; body?: string }>;
}) {
  const rows = items?.length
    ? items
    : [
        { icon: "◆", title: "Fast", body: "Prototype first" },
        { icon: "◇", title: "Clear", body: "No mystery stack" },
        { icon: "○", title: "Owned", body: "You keep the site" },
      ];
  return (
    <Shell>
      <h2 className="wf-h2">{heading || "Why us"}</h2>
      <div
        className="wf-grid"
        style={{
          gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
          gap: 16,
        }}
      >
        {rows.map((item, i) => (
          <div key={i} className="wf-card" style={{ padding: 16 }}>
            <div style={{ fontSize: "1.4rem" }}>{item.icon || "•"}</div>
            <h3 className="wf-h3">{item.title}</h3>
            <p className="wf-lede">{item.body}</p>
          </div>
        ))}
      </div>
    </Shell>
  );
}

export function MediaObject({
  imageUrl,
  heading,
  body,
  reverse,
}: {
  imageUrl?: string;
  heading?: string;
  body?: string;
  reverse?: boolean;
}) {
  return (
    <Shell>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 1fr",
          gap: 24,
          alignItems: "center",
          direction: reverse ? "rtl" : "ltr",
        }}
      >
        <div style={{ direction: "ltr" }}>
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt=""
              style={{ width: "100%", borderRadius: 8 }}
            />
          ) : (
            <div
              className="wf-card"
              style={{ minHeight: 220, background: "#f3f3f3" }}
            />
          )}
        </div>
        <div style={{ direction: "ltr" }}>
          <h2 className="wf-h2">{heading || "Media + copy"}</h2>
          <p className="wf-lede">
            {body || "Pair an image with a short explanation."}
          </p>
        </div>
      </div>
    </Shell>
  );
}

export function CardGrid({
  heading,
  cards,
}: {
  heading?: string;
  cards?: Array<{
    title?: string;
    body?: string;
    href?: string;
    imageUrl?: string;
  }>;
}) {
  const items = cards?.length
    ? cards
    : [
        { title: "Card one", body: "Short description" },
        { title: "Card two", body: "Short description" },
        { title: "Card three", body: "Short description" },
      ];
  return (
    <Shell>
      <h2 className="wf-h2">{heading || "Cards"}</h2>
      <div
        className="wf-grid"
        style={{
          gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
          gap: 16,
        }}
      >
        {items.map((card, i) => (
          <a
            key={i}
            href={card.href || "#"}
            className="wf-card"
            style={{
              display: "block",
              padding: 0,
              overflow: "hidden",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            {card.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={card.imageUrl}
                alt=""
                style={{ width: "100%", height: 140, objectFit: "cover" }}
              />
            ) : null}
            <div style={{ padding: 16 }}>
              <h3 className="wf-h3">{card.title}</h3>
              <p className="wf-lede">{card.body}</p>
            </div>
          </a>
        ))}
      </div>
    </Shell>
  );
}

export function HeroWithForm({
  heading,
  body,
  formHeading,
}: {
  heading?: string;
  body?: string;
  formHeading?: string;
}) {
  return (
    <section
      className="wf-section"
      style={{ background: "#0c0c0e", color: "#fff" }}
    >
      <div
        className="wf-wrap"
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 0.8fr",
          gap: 28,
          alignItems: "center",
        }}
      >
        <div>
          <h1 className="wf-h1">
            {heading || "Get a working site, not a deck"}
          </h1>
          <p className="wf-lede" style={{ color: "rgba(255,255,255,0.75)" }}>
            {body || "Tell us what needs to ship."}
          </p>
        </div>
        <form
          className="wf-card"
          style={{ padding: 20, color: "#111" }}
          onSubmit={(e) => e.preventDefault()}
        >
          <h3 className="wf-h3">{formHeading || "Request a prototype"}</h3>
          <input
            className="wf-input"
            placeholder="Name"
            style={{ width: "100%", marginBottom: 8 }}
          />
          <input
            className="wf-input"
            placeholder="Email"
            style={{ width: "100%", marginBottom: 8 }}
          />
          <textarea
            className="wf-input"
            placeholder="What are you building?"
            style={{ width: "100%", minHeight: 80 }}
          />
          <button type="submit" className="wf-btn" style={{ marginTop: 10 }}>
            Send
          </button>
        </form>
      </div>
    </section>
  );
}

export function SplitCTA({
  leftTitle,
  leftBody,
  leftLabel,
  leftHref,
  rightTitle,
  rightBody,
  rightLabel,
  rightHref,
}: {
  leftTitle?: string;
  leftBody?: string;
  leftLabel?: string;
  leftHref?: string;
  rightTitle?: string;
  rightBody?: string;
  rightLabel?: string;
  rightHref?: string;
}) {
  return (
    <Shell>
      <div
        className="wf-grid"
        style={{ gridTemplateColumns: "1fr 1fr", gap: 16 }}
      >
        <div className="wf-card" style={{ padding: 24 }}>
          <h3 className="wf-h3">{leftTitle || "Start a project"}</h3>
          <p className="wf-lede">{leftBody || "Book a scoping call."}</p>
          <a className="wf-btn" href={leftHref || "#"}>
            {leftLabel || "Talk to us"}
          </a>
        </div>
        <div className="wf-card" style={{ padding: 24 }}>
          <h3 className="wf-h3">{rightTitle || "See the work"}</h3>
          <p className="wf-lede">{rightBody || "Browse recent launches."}</p>
          <a className="wf-btn is-ghost" href={rightHref || "#"}>
            {rightLabel || "View work"}
          </a>
        </div>
      </div>
    </Shell>
  );
}

export function BannerAlert({ text, tone }: { text?: string; tone?: string }) {
  const bg =
    tone === "warn" ? "#fff4e5" : tone === "ok" ? "#e8f8ef" : "#eef3ff";
  return (
    <div
      style={{
        background: bg,
        padding: "12px 16px",
        textAlign: "center",
        fontSize: 14,
      }}
    >
      {text || "Announcement goes here"}
    </div>
  );
}

export function NumberedList({
  heading,
  items,
}: {
  heading?: string;
  items?: Array<{ title?: string; body?: string }>;
}) {
  const rows = items?.length
    ? items
    : [
        { title: "Discover", body: "Map the job to be done" },
        { title: "Design", body: "Structure before decoration" },
        { title: "Deliver", body: "Ship, measure, iterate" },
      ];
  return (
    <Shell>
      <h2 className="wf-h2">{heading || "Playbook"}</h2>
      <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 12 }}>
        {rows.map((item, i) => (
          <li key={i}>
            <strong>{item.title}</strong>
            <div className="wf-lede">{item.body}</div>
          </li>
        ))}
      </ol>
    </Shell>
  );
}

export function AvatarStack({
  heading,
  people,
}: {
  heading?: string;
  people?: Array<{ name?: string; photoUrl?: string }>;
}) {
  const items = people?.length
    ? people
    : [{ name: "A" }, { name: "B" }, { name: "C" }, { name: "D" }];
  return (
    <Shell>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex" }}>
          {items.map((person, i) => (
            <div
              key={i}
              title={person.name}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                marginLeft: i ? -10 : 0,
                border: "2px solid #fff",
                background: "#ddd",
                overflow: "hidden",
                display: "grid",
                placeItems: "center",
                fontWeight: 600,
              }}
            >
              {person.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={person.photoUrl}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                (person.name || "?").slice(0, 1)
              )}
            </div>
          ))}
        </div>
        <span className="wf-muted">{heading || "Join 2,400+ teams"}</span>
      </div>
    </Shell>
  );
}

export function CodeSnippet({
  heading,
  code,
}: {
  heading?: string;
  code?: string;
}) {
  return (
    <Shell>
      <h2 className="wf-h2">{heading || "Snippet"}</h2>
      <pre
        className="wf-card"
        style={{
          padding: 16,
          overflow: "auto",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 13,
          background: "#111",
          color: "#e8e8e8",
        }}
      >
        {code || `npm create aevion@latest`}
      </pre>
    </Shell>
  );
}

export function VideoEmbed({
  heading,
  url,
}: {
  heading?: string;
  url?: string;
}) {
  return (
    <Shell>
      {heading ? <h2 className="wf-h2">{heading}</h2> : null}
      <div
        className="wf-card"
        style={{ aspectRatio: "16/9", overflow: "hidden", padding: 0 }}
      >
        {url ? (
          <iframe
            src={url}
            title={heading || "Video"}
            style={{ width: "100%", height: "100%", border: 0 }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div
            style={{
              display: "grid",
              placeItems: "center",
              height: "100%",
              color: "#888",
            }}
          >
            Paste a video embed URL
          </div>
        )}
      </div>
    </Shell>
  );
}

export function MapSection({
  heading,
  address,
}: {
  heading?: string;
  address?: string;
}) {
  const q = encodeURIComponent(address || "Manchester, UK");
  return (
    <Shell>
      {heading ? <h2 className="wf-h2">{heading}</h2> : null}
      <iframe
        title="Map"
        src={`https://www.google.com/maps?q=${q}&output=embed`}
        style={{ width: "100%", height: 320, border: 0, borderRadius: 8 }}
        loading="lazy"
      />
    </Shell>
  );
}

export function ContactSplit({
  heading,
  body,
  email,
  phone,
}: {
  heading?: string;
  body?: string;
  email?: string;
  phone?: string;
}) {
  return (
    <Shell>
      <div
        className="wf-grid"
        style={{ gridTemplateColumns: "1fr 1fr", gap: 24 }}
      >
        <div>
          <h2 className="wf-h2">{heading || "Contact"}</h2>
          <p className="wf-lede">
            {body || "We reply within one business day."}
          </p>
          {email ? (
            <p>
              <a href={`mailto:${email}`}>{email}</a>
            </p>
          ) : null}
          {phone ? <p>{phone}</p> : null}
        </div>
        <form
          className="wf-card"
          style={{ padding: 16 }}
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            className="wf-input"
            placeholder="Name"
            style={{ width: "100%", marginBottom: 8 }}
          />
          <input
            className="wf-input"
            placeholder="Email"
            style={{ width: "100%", marginBottom: 8 }}
          />
          <textarea
            className="wf-input"
            placeholder="Message"
            style={{ width: "100%", minHeight: 100 }}
          />
          <button className="wf-btn" type="submit" style={{ marginTop: 10 }}>
            Send message
          </button>
        </form>
      </div>
    </Shell>
  );
}

export function FooterMega({
  brand,
  columns,
  note,
}: {
  brand?: string;
  columns?: Array<{
    title?: string;
    links?: Array<{ label?: string; href?: string }>;
  }>;
  note?: string;
}) {
  const cols = columns?.length
    ? columns
    : [
        {
          title: "Studio",
          links: [
            { label: "Work", href: "#" },
            { label: "Services", href: "#" },
          ],
        },
        {
          title: "Company",
          links: [
            { label: "About", href: "#" },
            { label: "Contact", href: "#" },
          ],
        },
      ];
  return (
    <footer
      className="wf-section"
      style={{ background: "#0c0c0e", color: "#fff" }}
    >
      <div className="wf-wrap">
        <div
          className="wf-grid"
          style={{
            gridTemplateColumns: "1.2fr repeat(auto-fit,minmax(140px,1fr))",
            gap: 24,
          }}
        >
          <div>
            <strong style={{ fontSize: "1.1rem" }}>
              {brand || "Aevion Labs"}
            </strong>
            <p className="wf-lede" style={{ color: "rgba(255,255,255,0.55)" }}>
              {note || "Sites, SaaS, and tools that ship."}
            </p>
          </div>
          {cols.map((col, i) => (
            <div key={i}>
              <div
                className="wf-muted"
                style={{ color: "rgba(255,255,255,0.45)", marginBottom: 8 }}
              >
                {col.title}
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                {(col.links || []).map((link, j) => (
                  <a
                    key={j}
                    href={link.href || "#"}
                    style={{ color: "#fff", textDecoration: "none" }}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}

export function NavbarCentered({
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
  const items = links?.length
    ? links
    : [
        { label: "Work", href: "#" },
        { label: "About", href: "#" },
      ];
  return (
    <header
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
        gap: 16,
        padding: "14px 20px",
        borderBottom: "1px solid #eee",
      }}
    >
      <strong>{name || "Brand"}</strong>
      <nav style={{ display: "flex", gap: 16 }}>
        {items.map((link, i) => (
          <a
            key={i}
            href={link.href || "#"}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            {link.label}
          </a>
        ))}
      </nav>
      <div style={{ justifySelf: "end" }}>
        {ctaLabel ? (
          <a className="wf-btn" href={ctaHref || "#"}>
            {ctaLabel}
          </a>
        ) : null}
      </div>
    </header>
  );
}

export function HeroCentered({
  kicker,
  heading,
  body,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: {
  kicker?: string;
  heading?: string;
  body?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}) {
  return (
    <section
      className="wf-section"
      style={{ textAlign: "center", padding: "5rem 1.25rem" }}
    >
      <div className="wf-wrap" style={{ maxWidth: 720 }}>
        {kicker ? (
          <p
            className="wf-muted"
            style={{ letterSpacing: "0.16em", textTransform: "uppercase" }}
          >
            {kicker}
          </p>
        ) : null}
        <h1 className="wf-h1">{heading || "Build the proof first"}</h1>
        <p className="wf-lede">
          {body || "A working prototype before the full budget."}
        </p>
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {primaryLabel ? (
            <a className="wf-btn" href={primaryHref || "#"}>
              {primaryLabel}
            </a>
          ) : null}
          {secondaryLabel ? (
            <a className="wf-btn is-ghost" href={secondaryHref || "#"}>
              {secondaryLabel}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function RichText({ html }: { html?: string }) {
  return (
    <Shell>
      <div
        className="wf-prose"
        dangerouslySetInnerHTML={{
          __html: html || "<p>Add rich text content here.</p>",
        }}
      />
    </Shell>
  );
}

export function SpacerXL({ size }: { size?: string }) {
  const h = size === "sm" ? 32 : size === "lg" ? 120 : 72;
  return <div aria-hidden style={{ height: h }} />;
}

export function DividerLabel({ label }: { label?: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "16px 0",
      }}
    >
      <div style={{ flex: 1, height: 1, background: "#e5e5e5" }} />
      <span
        className="wf-muted"
        style={{
          fontSize: 12,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        {label || "Section"}
      </span>
      <div style={{ flex: 1, height: 1, background: "#e5e5e5" }} />
    </div>
  );
}

export function BadgeRow({ items }: { items?: Array<{ label?: string }> }) {
  const rows = items?.length
    ? items
    : [{ label: "New" }, { label: "Fast" }, { label: "Owned" }];
  return (
    <div
      style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "8px 0" }}
    >
      {rows.map((item, i) => (
        <span
          key={i}
          style={{
            border: "1px solid #ddd",
            borderRadius: 999,
            padding: "4px 10px",
            fontSize: 12,
            letterSpacing: "0.04em",
          }}
        >
          {item.label}
        </span>
      ))}
    </div>
  );
}

export function ProgressBars({
  heading,
  items,
}: {
  heading?: string;
  items?: Array<{ label?: string; value?: number | string }>;
}) {
  const rows = items?.length
    ? items
    : [
        { label: "Design", value: 90 },
        { label: "Engineering", value: 80 },
        { label: "Content", value: 70 },
      ];
  return (
    <Shell>
      <h2 className="wf-h2">{heading || "Skills"}</h2>
      <div style={{ display: "grid", gap: 12 }}>
        {rows.map((item, i) => {
          const value = Number(item.value ?? 0);
          return (
            <div key={i}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <span>{item.label}</span>
                <span className="wf-muted">{value}%</span>
              </div>
              <div style={{ height: 8, background: "#eee", borderRadius: 999 }}>
                <div
                  style={{
                    width: `${Math.max(0, Math.min(100, value))}%`,
                    height: "100%",
                    background: "#111",
                    borderRadius: 999,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Shell>
  );
}

export function TeamGrid({
  heading,
  people,
}: {
  heading?: string;
  people?: Array<{
    name?: string;
    role?: string;
    photoUrl?: string;
    bio?: string;
  }>;
}) {
  const items = people?.length
    ? people
    : [
        { name: "Jordan Lee", role: "Design", bio: "Systems and type" },
        {
          name: "Sam Rivera",
          role: "Engineering",
          bio: "Product and performance",
        },
      ];
  return (
    <Shell>
      <h2 className="wf-h2">{heading || "Team"}</h2>
      <div
        className="wf-grid"
        style={{
          gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
          gap: 16,
        }}
      >
        {items.map((person, i) => (
          <div key={i} className="wf-card" style={{ padding: 16 }}>
            {person.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={person.photoUrl}
                alt=""
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  objectFit: "cover",
                  borderRadius: 8,
                  marginBottom: 10,
                }}
              />
            ) : (
              <div
                style={{
                  aspectRatio: "1",
                  background: "#f0f0f0",
                  borderRadius: 8,
                  marginBottom: 10,
                }}
              />
            )}
            <h3 className="wf-h3">{person.name}</h3>
            <div className="wf-muted">{person.role}</div>
            {person.bio ? <p className="wf-lede">{person.bio}</p> : null}
          </div>
        ))}
      </div>
    </Shell>
  );
}

export function GalleryMasonry({
  heading,
  images,
}: {
  heading?: string;
  images?: Array<{ src?: string; alt?: string }>;
}) {
  const items = images?.length
    ? images
    : [{ src: "" }, { src: "" }, { src: "" }, { src: "" }];
  return (
    <Shell>
      {heading ? <h2 className="wf-h2">{heading}</h2> : null}
      <div
        style={{
          columns: 3,
          columnGap: 12,
        }}
      >
        {items.map((image, i) => (
          <div key={i} style={{ breakInside: "avoid", marginBottom: 12 }}>
            {image.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image.src}
                alt={image.alt || ""}
                style={{ width: "100%", borderRadius: 8 }}
              />
            ) : (
              <div
                className="wf-card"
                style={{ height: 120 + (i % 3) * 40, background: "#f2f2f2" }}
              />
            )}
          </div>
        ))}
      </div>
    </Shell>
  );
}

export function BlogList({
  heading,
  posts,
}: {
  heading?: string;
  posts?: Array<{
    title?: string;
    excerpt?: string;
    href?: string;
    date?: string;
  }>;
}) {
  const items = posts?.length
    ? posts
    : [
        {
          title: "Prototype before pitch",
          excerpt: "Why clickable beats slides.",
          date: "Sep 2026",
          href: "#",
        },
        {
          title: "Own your stack",
          excerpt: "No rented website.",
          date: "Aug 2026",
          href: "#",
        },
      ];
  return (
    <Shell>
      <h2 className="wf-h2">{heading || "Insights"}</h2>
      <div style={{ display: "grid", gap: 12 }}>
        {items.map((post, i) => (
          <a
            key={i}
            href={post.href || "#"}
            className="wf-card"
            style={{
              display: "block",
              padding: 16,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div className="wf-muted">{post.date}</div>
            <h3 className="wf-h3">{post.title}</h3>
            <p className="wf-lede">{post.excerpt}</p>
          </a>
        ))}
      </div>
    </Shell>
  );
}

export function NewsletterInline({
  heading,
  label,
}: {
  heading?: string;
  label?: string;
}) {
  return (
    <Shell>
      <form
        className="wf-card"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          alignItems: "center",
          padding: 16,
        }}
        onSubmit={(e) => e.preventDefault()}
      >
        <strong style={{ flex: "1 1 180px" }}>
          {heading || "Get launch notes"}
        </strong>
        <input
          className="wf-input"
          type="email"
          placeholder="you@company.com"
          style={{ flex: "1 1 200px" }}
        />
        <button className="wf-btn" type="submit">
          {label || "Subscribe"}
        </button>
      </form>
    </Shell>
  );
}

export function SocialProofBar({
  text,
  count,
}: {
  text?: string;
  count?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: 10,
        alignItems: "center",
        padding: "10px 16px",
        borderTop: "1px solid #eee",
        borderBottom: "1px solid #eee",
        fontSize: 14,
      }}
    >
      <strong>{count || "120+"}</strong>
      <span className="wf-muted">{text || "prototypes shipped this year"}</span>
    </div>
  );
}

export function EmptyStateBlock({
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
    <Shell>
      <div className="wf-card" style={{ textAlign: "center", padding: 40 }}>
        <h2 className="wf-h2">{heading || "Nothing here yet"}</h2>
        <p className="wf-lede">{body || "Add your first project or page."}</p>
        {label ? (
          <a className="wf-btn" href={href || "#"}>
            {label}
          </a>
        ) : null}
      </div>
    </Shell>
  );
}

export function CookieBanner({
  text,
  acceptLabel,
}: {
  text?: string;
  acceptLabel?: string;
}) {
  return (
    <div
      className="wf-card"
      style={{
        display: "flex",
        gap: 12,
        alignItems: "center",
        justifyContent: "space-between",
        padding: 14,
        maxWidth: 720,
        margin: "16px auto",
      }}
    >
      <span style={{ fontSize: 14 }}>
        {text || "We use cookies to improve the site."}
      </span>
      <button type="button" className="wf-btn">
        {acceptLabel || "Accept"}
      </button>
    </div>
  );
}

export function SearchBar({ placeholder }: { placeholder?: string }) {
  return (
    <div style={{ padding: "12px 0" }}>
      <input
        className="wf-input"
        type="search"
        placeholder={placeholder || "Search…"}
        style={{ width: "100%", maxWidth: 480 }}
      />
    </div>
  );
}

export function BreadcrumbBar({
  items,
}: {
  items?: Array<{ label?: string; href?: string }>;
}) {
  const crumbs = items?.length
    ? items
    : [
        { label: "Home", href: "/" },
        { label: "Services", href: "/services" },
        { label: "Current" },
      ];
  return (
    <nav aria-label="Breadcrumb" style={{ padding: "10px 0", fontSize: 13 }}>
      {crumbs.map((item, i) => (
        <span key={i}>
          {i > 0 ? <span className="wf-muted"> / </span> : null}
          {item.href ? (
            <a href={item.href}>{item.label}</a>
          ) : (
            <span>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function SidebarLayout({
  main,
  side,
}: {
  main?: string;
  side?: string;
}) {
  return (
    <Shell>
      <div
        className="wf-grid"
        style={{ gridTemplateColumns: "2fr 1fr", gap: 20 }}
      >
        <div className="wf-card" style={{ padding: 20 }}>
          <div
            dangerouslySetInnerHTML={{
              __html: main || "<p>Main column content</p>",
            }}
          />
        </div>
        <aside className="wf-card" style={{ padding: 20 }}>
          <div dangerouslySetInnerHTML={{ __html: side || "<p>Sidebar</p>" }} />
        </aside>
      </div>
    </Shell>
  );
}

export function MetricRow({
  items,
}: {
  items?: Array<{ value?: string; label?: string }>;
}) {
  const rows = items?.length
    ? items
    : [
        { value: "48h", label: "To first prototype" },
        { value: "92%", label: "Client retention" },
        { value: "30+", label: "Shipped products" },
      ];
  return (
    <Shell>
      <div
        className="wf-grid"
        style={{ gridTemplateColumns: `repeat(${rows.length},1fr)`, gap: 12 }}
      >
        {rows.map((item, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2rem", fontWeight: 600 }}>
              {item.value}
            </div>
            <div className="wf-muted">{item.label}</div>
          </div>
        ))}
      </div>
    </Shell>
  );
}

export function FeatureCompare({
  heading,
  leftTitle,
  rightTitle,
  leftItems,
  rightItems,
}: {
  heading?: string;
  leftTitle?: string;
  rightTitle?: string;
  leftItems?: Array<{ label?: string }>;
  rightItems?: Array<{ label?: string }>;
}) {
  const left = leftItems?.length
    ? leftItems
    : [{ label: "Guesswork decks" }, { label: "Slow handoffs" }];
  const right = rightItems?.length
    ? rightItems
    : [{ label: "Working prototype" }, { label: "One Studio" }];
  return (
    <Shell>
      <h2 className="wf-h2">{heading || "Before / after"}</h2>
      <div
        className="wf-grid"
        style={{ gridTemplateColumns: "1fr 1fr", gap: 16 }}
      >
        <div className="wf-card" style={{ padding: 16, opacity: 0.75 }}>
          <h3 className="wf-h3">{leftTitle || "Before"}</h3>
          <ul>
            {left.map((item, i) => (
              <li key={i}>{item.label}</li>
            ))}
          </ul>
        </div>
        <div className="wf-card" style={{ padding: 16 }}>
          <h3 className="wf-h3">{rightTitle || "With Aevion"}</h3>
          <ul>
            {right.map((item, i) => (
              <li key={i}>{item.label}</li>
            ))}
          </ul>
        </div>
      </div>
    </Shell>
  );
}

export function AppStoreBadges({
  heading,
  appleHref,
  googleHref,
}: {
  heading?: string;
  appleHref?: string;
  googleHref?: string;
}) {
  return (
    <Shell>
      {heading ? <h2 className="wf-h2">{heading}</h2> : null}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a className="wf-btn" href={appleHref || "#"}>
          App Store
        </a>
        <a className="wf-btn is-ghost" href={googleHref || "#"}>
          Google Play
        </a>
      </div>
    </Shell>
  );
}

export function ChatWidgetPreview({
  title,
  greeting,
}: {
  title?: string;
  greeting?: string;
}) {
  return (
    <div
      className="wf-card"
      style={{
        width: 280,
        marginLeft: "auto",
        padding: 12,
        boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
      }}
    >
      <strong>{title || "Chat"}</strong>
      <p className="wf-lede" style={{ marginTop: 8 }}>
        {greeting || "Hi — how can we help?"}
      </p>
      <input
        className="wf-input"
        placeholder="Type a message…"
        style={{ width: "100%" }}
      />
    </div>
  );
}

export function TableBasic({
  heading,
  headers,
  rows,
}: {
  heading?: string;
  headers?: Array<{ label?: string }>;
  rows?: Array<{ c1?: string; c2?: string; c3?: string }>;
}) {
  const head = headers?.length
    ? headers
    : [{ label: "Name" }, { label: "Role" }, { label: "Status" }];
  const data = rows?.length
    ? rows
    : [
        { c1: "Alex", c2: "Design", c3: "Active" },
        { c1: "Sam", c2: "Eng", c3: "Active" },
      ];
  return (
    <Shell>
      {heading ? <h2 className="wf-h2">{heading}</h2> : null}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {head.map((h, i) => (
              <th
                key={i}
                style={{
                  textAlign: "left",
                  padding: 10,
                  borderBottom: "1px solid #e5e5e5",
                }}
              >
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <td style={{ padding: 10, borderBottom: "1px solid #f0f0f0" }}>
                {row.c1}
              </td>
              <td style={{ padding: 10, borderBottom: "1px solid #f0f0f0" }}>
                {row.c2}
              </td>
              <td style={{ padding: 10, borderBottom: "1px solid #f0f0f0" }}>
                {row.c3}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Shell>
  );
}

export function KanbanPreview({
  heading,
  columns,
}: {
  heading?: string;
  columns?: Array<{ title?: string; cards?: Array<{ title?: string }> }>;
}) {
  const cols = columns?.length
    ? columns
    : [
        { title: "Todo", cards: [{ title: "Brief" }, { title: "Wireframes" }] },
        { title: "Doing", cards: [{ title: "Prototype" }] },
        { title: "Done", cards: [{ title: "Launch" }] },
      ];
  return (
    <Shell>
      <h2 className="wf-h2">{heading || "Pipeline"}</h2>
      <div
        className="wf-grid"
        style={{ gridTemplateColumns: `repeat(${cols.length},1fr)`, gap: 12 }}
      >
        {cols.map((col, i) => (
          <div
            key={i}
            className="wf-card"
            style={{ padding: 12, background: "#f7f7f7" }}
          >
            <strong>{col.title}</strong>
            <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
              {(col.cards || []).map((card, j) => (
                <div
                  key={j}
                  className="wf-card"
                  style={{ padding: 10, background: "#fff" }}
                >
                  {card.title}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Shell>
  );
}

export function CalendarStrip({
  heading,
  days,
}: {
  heading?: string;
  days?: Array<{ label?: string; events?: string }>;
}) {
  const items = days?.length
    ? days
    : [
        { label: "Mon", events: "Kickoff" },
        { label: "Tue", events: "Design" },
        { label: "Wed", events: "Build" },
        { label: "Thu", events: "Review" },
        { label: "Fri", events: "Ship" },
      ];
  return (
    <Shell>
      <h2 className="wf-h2">{heading || "This week"}</h2>
      <div
        className="wf-grid"
        style={{ gridTemplateColumns: `repeat(${items.length},1fr)`, gap: 8 }}
      >
        {items.map((day, i) => (
          <div
            key={i}
            className="wf-card"
            style={{ padding: 12, textAlign: "center" }}
          >
            <div className="wf-muted">{day.label}</div>
            <strong>{day.events}</strong>
          </div>
        ))}
      </div>
    </Shell>
  );
}

export function FileDownloadList({
  heading,
  files,
}: {
  heading?: string;
  files?: Array<{ name?: string; href?: string; meta?: string }>;
}) {
  const items = files?.length
    ? files
    : [
        { name: "Brand guidelines.pdf", meta: "2.1 MB", href: "#" },
        { name: "Press kit.zip", meta: "8.4 MB", href: "#" },
      ];
  return (
    <Shell>
      <h2 className="wf-h2">{heading || "Downloads"}</h2>
      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "grid",
          gap: 8,
        }}
      >
        {items.map((file, i) => (
          <li key={i}>
            <a
              href={file.href || "#"}
              className="wf-card"
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: 12,
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <span>{file.name}</span>
              <span className="wf-muted">{file.meta}</span>
            </a>
          </li>
        ))}
      </ul>
    </Shell>
  );
}

export function LanguageSwitcher({
  languages,
}: {
  languages?: Array<{ code?: string; label?: string }>;
}) {
  const items = languages?.length
    ? languages
    : [
        { code: "en", label: "EN" },
        { code: "fr", label: "FR" },
        { code: "de", label: "DE" },
      ];
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {items.map((lang, i) => (
        <button
          key={i}
          type="button"
          className="wf-btn is-ghost"
          style={{ padding: "0.35rem 0.7rem" }}
        >
          {lang.label || lang.code}
        </button>
      ))}
    </div>
  );
}

export function ThemeTogglePreview() {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <span className="wf-muted">Appearance</span>
      <button
        type="button"
        className="wf-btn is-ghost"
        style={{ padding: "0.35rem 0.7rem" }}
      >
        Light
      </button>
      <button
        type="button"
        className="wf-btn"
        style={{ padding: "0.35rem 0.7rem" }}
      >
        Dark
      </button>
    </div>
  );
}

export function NotificationToast({
  title,
  body,
}: {
  title?: string;
  body?: string;
}) {
  return (
    <div
      className="wf-card"
      style={{
        maxWidth: 320,
        padding: 14,
        boxShadow: "0 12px 32px rgba(0,0,0,0.14)",
      }}
    >
      <strong>{title || "Update saved"}</strong>
      <p className="wf-lede" style={{ margin: "6px 0 0" }}>
        {body || "Your draft is up to date."}
      </p>
    </div>
  );
}

export function ModalPreview({
  heading,
  body,
  label,
}: {
  heading?: string;
  body?: string;
  label?: string;
}) {
  return (
    <div
      style={{
        background: "rgba(0,0,0,0.45)",
        padding: 32,
        display: "grid",
        placeItems: "center",
      }}
    >
      <div
        className="wf-card"
        style={{ maxWidth: 420, padding: 24, width: "100%" }}
      >
        <h3 className="wf-h3">{heading || "Confirm"}</h3>
        <p className="wf-lede">
          {body || "Are you sure you want to continue?"}
        </p>
        <button type="button" className="wf-btn">
          {label || "Continue"}
        </button>
      </div>
    </div>
  );
}

export function SkeletonLoader() {
  return (
    <div style={{ display: "grid", gap: 10, padding: 16 }}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            height: 14,
            borderRadius: 6,
            background: "linear-gradient(90deg,#eee,#f7f7f7,#eee)",
            width: `${100 - i * 12}%`,
          }}
        />
      ))}
    </div>
  );
}

export function ErrorState({
  heading,
  body,
  label,
}: {
  heading?: string;
  body?: string;
  label?: string;
}) {
  return (
    <Shell>
      <div className="wf-card" style={{ textAlign: "center", padding: 36 }}>
        <h2 className="wf-h2">{heading || "Something went wrong"}</h2>
        <p className="wf-lede">{body || "Try again in a moment."}</p>
        <button type="button" className="wf-btn">
          {label || "Retry"}
        </button>
      </div>
    </Shell>
  );
}

export function SuccessState({
  heading,
  body,
}: {
  heading?: string;
  body?: string;
}) {
  return (
    <Shell>
      <div className="wf-card" style={{ textAlign: "center", padding: 36 }}>
        <div style={{ fontSize: "2rem", marginBottom: 8 }}>✓</div>
        <h2 className="wf-h2">{heading || "You're all set"}</h2>
        <p className="wf-lede">{body || "We'll be in touch shortly."}</p>
      </div>
    </Shell>
  );
}

export function OfflineBanner({ text }: { text?: string }) {
  return (
    <div
      style={{
        background: "#111",
        color: "#fff",
        textAlign: "center",
        padding: "10px 14px",
        fontSize: 13,
      }}
    >
      {text || "You're offline — changes will sync when you're back."}
    </div>
  );
}

export function PasswordGate({
  heading,
  body,
}: {
  heading?: string;
  body?: string;
}) {
  return (
    <Shell>
      <form
        className="wf-card"
        style={{ maxWidth: 360, margin: "0 auto", padding: 24 }}
        onSubmit={(e) => e.preventDefault()}
      >
        <h2 className="wf-h2">{heading || "Private page"}</h2>
        <p className="wf-lede">{body || "Enter the password to continue."}</p>
        <input
          className="wf-input"
          type="password"
          placeholder="Password"
          style={{ width: "100%" }}
        />
        <button
          className="wf-btn"
          type="submit"
          style={{ marginTop: 10, width: "100%" }}
        >
          Unlock
        </button>
      </form>
    </Shell>
  );
}

export function WaitlistForm({
  heading,
  body,
}: {
  heading?: string;
  body?: string;
}) {
  return (
    <Shell>
      <div
        className="wf-card"
        style={{
          maxWidth: 480,
          margin: "0 auto",
          padding: 24,
          textAlign: "center",
        }}
      >
        <h2 className="wf-h2">{heading || "Join the waitlist"}</h2>
        <p className="wf-lede">
          {body || "Be first when we open the next cohort."}
        </p>
        <form
          style={{ display: "flex", gap: 8, marginTop: 12 }}
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            className="wf-input"
            type="email"
            placeholder="Email"
            style={{ flex: 1 }}
          />
          <button className="wf-btn" type="submit">
            Join
          </button>
        </form>
      </div>
    </Shell>
  );
}

export function InvestorDeckCTA({
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
    <Shell>
      <div
        className="wf-card"
        style={{
          padding: 28,
          display: "flex",
          gap: 16,
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 className="wf-h2">{heading || "Need the deck?"}</h2>
          <p className="wf-lede">
            {body || "Or better — get a clickable prototype."}
          </p>
        </div>
        <a className="wf-btn" href={href || "#"}>
          {label || "Request access"}
        </a>
      </div>
    </Shell>
  );
}

export function CaseStudyHero({
  client,
  heading,
  body,
  imageUrl,
}: {
  client?: string;
  heading?: string;
  body?: string;
  imageUrl?: string;
}) {
  return (
    <section className="wf-section">
      <div className="wf-wrap">
        <p className="wf-muted">{client || "Case study"}</p>
        <h1 className="wf-h1">
          {heading || "From brief to live in two weeks"}
        </h1>
        <p className="wf-lede">
          {body || "A product site that proved the offer before full build."}
        </p>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            style={{ width: "100%", marginTop: 24, borderRadius: 8 }}
          />
        ) : (
          <div
            className="wf-card"
            style={{ marginTop: 24, minHeight: 280, background: "#f2f2f2" }}
          />
        )}
      </div>
    </section>
  );
}

export function ResultsStrip({
  items,
}: {
  items?: Array<{ value?: string; label?: string }>;
}) {
  const rows = items?.length
    ? items
    : [
        { value: "+38%", label: "Conversion" },
        { value: "2w", label: "Time to ship" },
        { value: "4.9★", label: "Client score" },
      ];
  return (
    <div style={{ background: "#111", color: "#fff", padding: "28px 16px" }}>
      <div
        className="wf-wrap"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${rows.length},1fr)`,
          gap: 16,
          textAlign: "center",
        }}
      >
        {rows.map((item, i) => (
          <div key={i}>
            <div style={{ fontSize: "2rem", fontWeight: 600 }}>
              {item.value}
            </div>
            <div style={{ opacity: 0.65 }}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function QuoteWithAvatar({
  quote,
  name,
  role,
  photoUrl,
}: {
  quote?: string;
  name?: string;
  role?: string;
  photoUrl?: string;
}) {
  return (
    <Shell>
      <div className="wf-card" style={{ padding: 24 }}>
        <p style={{ fontSize: "1.25rem", marginBottom: 16 }}>
          “{quote || "The prototype changed the funding conversation."}”
        </p>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "#ddd",
              overflow: "hidden",
            }}
          >
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoUrl}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : null}
          </div>
          <div>
            <strong>{name || "Client"}</strong>
            <div className="wf-muted">{role || "Founder"}</div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

export function DualButtonRow({
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: {
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}) {
  return (
    <div
      style={{ display: "flex", gap: 10, flexWrap: "wrap", padding: "8px 0" }}
    >
      <a className="wf-btn" href={primaryHref || "#"}>
        {primaryLabel || "Primary"}
      </a>
      <a className="wf-btn is-ghost" href={secondaryHref || "#"}>
        {secondaryLabel || "Secondary"}
      </a>
    </div>
  );
}

export function SectionHeader({
  kicker,
  heading,
  body,
}: {
  kicker?: string;
  heading?: string;
  body?: string;
}) {
  return (
    <div style={{ maxWidth: 640, padding: "8px 0 16px" }}>
      {kicker ? (
        <p
          className="wf-muted"
          style={{
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontSize: 12,
          }}
        >
          {kicker}
        </p>
      ) : null}
      <h2 className="wf-h2">{heading || "Section title"}</h2>
      {body ? <p className="wf-lede">{body}</p> : null}
    </div>
  );
}
