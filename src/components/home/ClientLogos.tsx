"use client";

import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { DragMarquee } from "@/components/home/DragMarquee";
import { topicSlug, withHref } from "@/lib/topic-slug";
import type { SimpleIcon } from "simple-icons";
import {
  siAnthropic,
  siApple,
  siAppstore,
  siAuth0,
  siClaude,
  siClerk,
  siCloudflare,
  siCss,
  siDocker,
  siDotnet,
  siFigma,
  siFirebase,
  siFramer,
  siGithub,
  siGo,
  siGoogle,
  siGoogleanalytics,
  siGooglechrome,
  siGooglecloud,
  siGooglegemini,
  siGooglemaps,
  siHtml5,
  siJavascript,
  siKotlin,
  siLinear,
  siMapbox,
  siNetlify,
  siNextdotjs,
  siNodedotjs,
  siNotion,
  siNuxt,
  siPostgresql,
  siPrisma,
  siPython,
  siReact,
  siResend,
  siShopify,
  siSquarespace,
  siStripe,
  siSupabase,
  siSvelte,
  siSwift,
  siTailwindcss,
  siTypescript,
  siVercel,
  siVuedotjs,
  siWebflow,
  siWix,
  siWordpress,
  siXcode,
  siYoutube,
} from "simple-icons";
import {
  AndroidMark,
  AndroidMono,
  AppStoreMark,
  AwsMark,
  AwsMono,
  AzureMark,
  AzureMono,
  ChromeMark,
  CloudMark,
  FirebaseMark,
  FigmaMark,
  GeminiMark,
  GoogleMark,
  MapsMark,
  MicrosoftMark,
  MicrosoftMono,
  OpenAiMark,
  YouTubeMark,
  YouTubeMono,
} from "@/components/home/brand-marks";

export type HeroLogo = {
  name: string;
  color: string;
  svg: ReactNode;
  mark?: ReactNode;
  painted?: boolean;
  Paint?: () => ReactNode;
};

type Logo = HeroLogo;

function iconMark(icon: SimpleIcon) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path fill="currentColor" d={icon.path} />
    </svg>
  );
}

function fromIcon(icon: SimpleIcon): Logo {
  return {
    name: icon.title,
    color: `#${icon.hex}`,
    svg: iconMark(icon),
  };
}

function painted(
  name: string,
  color: string,
  Paint: () => ReactNode,
  mark: ReactNode,
): Logo {
  return { name, color, painted: true, svg: <Paint />, mark, Paint };
}

export function hoverColor(hex: string) {
  const h = hex.replace("#", "");
  if (h.length < 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance < 0.18 ? "#e8e8e8" : hex;
}

export const LOGOS: Logo[] = [
  painted("Google", "#4285F4", GoogleMark, iconMark(siGoogle)),
  painted("Google Cloud", "#4285F4", CloudMark, iconMark(siGooglecloud)),
  painted("Google Maps", "#4285F4", MapsMark, iconMark(siGooglemaps)),
  painted("Gemini", "#8E75B2", GeminiMark, iconMark(siGooglegemini)),
  painted("YouTube", "#FF0000", YouTubeMark, <YouTubeMono />),
  {
    name: "OpenAI",
    color: "#000000",
    svg: <OpenAiMark />,
    mark: <OpenAiMark />,
  },
  painted("Chrome", "#4285F4", ChromeMark, iconMark(siGooglechrome)),
  painted("Firebase", "#FFCA28", FirebaseMark, iconMark(siFirebase)),
  painted("Microsoft", "#00A4EF", MicrosoftMark, <MicrosoftMono />),
  painted("Azure", "#0078D4", AzureMark, <AzureMono />),
  painted("AWS", "#FF9900", AwsMark, <AwsMono />),
  fromIcon(siGoogleanalytics),
  fromIcon(siApple),
  painted("App Store", "#0D96F6", AppStoreMark, iconMark(siAppstore)),
  fromIcon(siXcode),
  painted("Android", "#3DDC84", AndroidMark, <AndroidMono />),
  fromIcon(siAnthropic),
  fromIcon(siClaude),
  fromIcon(siTypescript),
  fromIcon(siDotnet),
  fromIcon(siJavascript),
  fromIcon(siPython),
  fromIcon(siHtml5),
  fromIcon(siCss),
  fromIcon(siSwift),
  fromIcon(siKotlin),
  fromIcon(siGo),
  fromIcon(siReact),
  fromIcon(siNextdotjs),
  fromIcon(siNodedotjs),
  fromIcon(siTailwindcss),
  fromIcon(siVuedotjs),
  fromIcon(siNuxt),
  fromIcon(siSvelte),
  fromIcon(siPostgresql),
  fromIcon(siPrisma),
  fromIcon(siWebflow),
  fromIcon(siFramer),
  fromIcon(siWordpress),
  fromIcon(siSquarespace),
  fromIcon(siWix),
  fromIcon(siShopify),
  painted("Figma", "#F24E1E", FigmaMark, iconMark(siFigma)),
  fromIcon(siNotion),
  fromIcon(siLinear),
  fromIcon(siStripe),
  fromIcon(siVercel),
  fromIcon(siNetlify),
  fromIcon(siCloudflare),
  fromIcon(siSupabase),
  fromIcon(siGithub),
  fromIcon(siDocker),
  fromIcon(siClerk),
  fromIcon(siAuth0),
  fromIcon(siMapbox),
  fromIcon(siResend),
];

const LOOP = [...LOGOS, ...LOGOS];

export function logoForTopic(slug: string) {
  return LOGOS.find((logo) => topicSlug(logo.name) === slug) ?? null;
}

export function TopicBrandMark({ slug }: { slug: string }) {
  const logo = logoForTopic(slug);
  if (!logo) return null;

  return (
    <div
      className="topic-hero-logo"
      style={{ color: logo.color }}
      role="img"
      aria-label={`${logo.name} logo`}
    >
      {logo.Paint ? <logo.Paint /> : logo.svg}
    </div>
  );
}

export function logoFlatMark(logo: Logo) {
  if (logo.name === "YouTube" || logo.name === "Android") {
    return logo.mark;
  }
  if (logo.Paint) return <logo.Paint />;
  return logo.mark ?? logo.svg;
}

export function LogoMarquee({ tone = "light" }: { tone?: "light" | "hero" }) {
  const hero = tone === "hero";

  return (
    <DragMarquee
      className={`client-logos-marquee is-drag${hero ? " is-hero" : ""}`}
      trackClassName="client-logos-marquee-track"
      speed={hero ? 30 : 38}
    >
      {LOOP.map((logo, i) => {
        const mark = (
          <>
            <span className="sr-only">{logo.name}</span>
            {hero && logo.Paint ? (
              <>
                <span className="client-logo-paint" aria-hidden>
                  <logo.Paint />
                </span>
                <span className="client-logo-flat">{logoFlatMark(logo)}</span>
              </>
            ) : hero ? (
              (logo.mark ?? logo.svg)
            ) : (
              logo.svg
            )}
          </>
        );

        const style = {
          color: hero ? undefined : logo.color,
          "--logo-color": hero ? hoverColor(logo.color) : logo.color,
        } as CSSProperties;

        return (
          <Link
            key={`${logo.name}-${i}`}
            href={withHref(logo.name)}
            className={`client-logo${logo.painted ? " is-painted" : ""}`}
            style={style}
            title={logo.name}
            draggable={false}
          >
            {mark}
          </Link>
        );
      })}
    </DragMarquee>
  );
}

export function ClientLogos({
  kicker = "Tools we work with",
}: {
  kicker?: string;
  names?: string[];
}) {
  return (
    <section className="overflow-hidden border-y border-black/10 bg-white py-[var(--section-y)]">
      <div className="mx-auto mb-12 max-w-[var(--section-max)] px-[var(--section-x)] sm:mb-16">
        <p className="site-kicker mb-3 text-center">{kicker}</p>
        <p className="mx-auto max-w-[34rem] text-center text-[1.05rem] font-light leading-[1.7] text-[#525252]">
          The platforms, languages, and products we ship on, from Google and
          OpenAI through to the CMS your team already uses.
        </p>
      </div>
      <LogoMarquee />
    </section>
  );
}
