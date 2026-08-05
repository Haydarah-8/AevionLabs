import { cn } from "@/lib/utils";

export const BRAND = "AEVION LABS";

/**
 * The wordmark as live text with one span per character, so the loader can
 * stagger them the way it staggered the original's vector letterforms.
 */
export function WordmarkLetters({ className }: { className?: string }) {
  return (
    <span className={cn("wordmark", className)} aria-label={BRAND}>
      {BRAND.split("").map((ch, i) => (
        <span key={i} className="wordmark_letter" aria-hidden="true">
          {ch}
        </span>
      ))}
    </span>
  );
}

/**
 * Full-bleed wordmark. Uses SVG text with `textLength` so it stretches to fill
 * its box exactly like the outlined original did, at any width.
 */
export function WordmarkSvg({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 125 19"
      width="100%"
      role="img"
      aria-label={BRAND}
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        x="0"
        y="15.5"
        textLength="125"
        lengthAdjust="spacingAndGlyphs"
        fontWeight="500"
        fontSize="19"
        letterSpacing="-0.4"
        fill="currentColor"
        /* inline style, not a presentation attribute - SVG attributes don't
           resolve CSS custom properties */
        style={{ fontFamily: "var(--font-sans), Arial, sans-serif" }}
      >
        {BRAND}
      </text>
    </svg>
  );
}
