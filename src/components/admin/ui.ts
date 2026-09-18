/**
 * Admin surface tokens: seamless, quiet, and coloured only where colour means
 * something. Matches the public site: white page, black ink, grey hairlines.
 *
 * Nothing is a card. Every surface is the page background itself — no fills,
 * no outlines — so the interface reads as one continuous sheet. Separation
 * comes from space, type scale and hairlines; emphasis comes from brightness
 * and a left rule, never from a panel.
 *
 * Colour is rationed to three jobs and used for nothing else:
 *
 *   ACCENT  — black on white, marking what is active or interactive.
 *   STATUS  — live, warning, failed. Always paired with a word or glyph so the
 *             meaning survives for a colour-blind reader.
 *   Lean    — the political spectrum (see Spectrum.tsx), the one place where
 *             hue itself is the data.
 *
 * Everything else stays on the grey ink ramp. A palette that colours
 * everything communicates nothing.
 */

/** Page background. Every surface matches it exactly. */
export const PAGE = "#ffffff";

/** Ink ramp, strongest to faintest. */
export const INK = {
  bright: "#111111",
  primary: "#111111",
  secondary: "#737373",
  muted: "#8a8a8a",
  faint: "#a3a3a3",
} as const;

/** Greyscale data ramp for magnitude marks, plus the track they sit on. */
export const MARK = {
  high: "#111111",
  mid: "#737373",
  low: "#c4c4c4",
  track: "rgba(17,17,17,0.08)",
} as const;

/**
 * Black on white — the same monochrome the public site uses.
 */
export const ACCENT = {
  base: "#111111",
  bright: "#000000",
  dim: "#525252",
  wash: "rgba(17,17,17,0.06)",
  line: "rgba(17,17,17,0.28)",
} as const;

/**
 * Status hues. Each is paired with a word or glyph at the call site — colour
 * is the second channel here, never the only one.
 */
export const STATUS = {
  live: "#4ea87a",
  warn: "#c9963f",
  fail: "#c85f5f",
  idle: "#8a8a8a",
} as const;

/** The only structural line in the design. */
export const HAIRLINE = "rgba(17,17,17,0.08)";

/** A region: pure background, separated by space alone. */
export const region = "bg-transparent";

/** Hairline divider between stacked entries. */
export const divide = "divide-y divide-black/10";

/**
 * These were set in small uppercase with wide letter-spacing, and are now
 * ordinary sentence-case sans.
 *
 * The change is made in the tokens rather than at each call site because they
 * are shared by the newsroom, the press desk and every dialog those two open —
 * dozens of places that should not be allowed to drift apart. Sizes are chosen
 * to match the plain surfaces in plain.tsx, so a reader moving between the
 * overview, the audit stream and the wire sees one product.
 */
export const label = "text-[0.8rem] text-[#737373]";

export const meta = "text-[0.82rem] text-[#8a8a8a]";

/**
 * Buttons are text, not chrome. Weight and brightness carry state; nothing
 * gets a filled background.
 */
export const btn =
  "text-[0.88rem] font-medium text-[#111] transition-colors hover:text-black disabled:cursor-not-allowed disabled:opacity-30";

export const btnQuiet =
  "text-[0.88rem] text-[#737373] transition-colors hover:text-black disabled:cursor-not-allowed disabled:opacity-30";

export const action =
  "text-[0.85rem] text-[#8a8a8a] transition-colors hover:text-black disabled:cursor-not-allowed disabled:opacity-30";

/** Search reads as a ruled line of text, not a box. */
export const field =
  "border-0 border-b border-black/15 bg-transparent px-0 py-2 text-base font-light text-[#111] placeholder:text-[#a3a3a3] focus:border-black/40 focus:outline-none";

/** A lens/filter switch: the selected one is filled, the rest are quiet. */
export const lens =
  "rounded-full px-3.5 py-1.5 text-[0.88rem] transition-colors";
export const lensOn = "bg-[#111] font-medium text-white";
export const lensOff =
  "text-[#737373] hover:bg-black/[0.04] hover:text-black";

/**
 * Severity. Colour carries urgency at a glance, and the glyph is kept as a
 * second channel so the ranking still reads without it.
 */
export const SEVERITY = {
  alert: { ink: STATUS.fail, glyph: "●" },
  warn: { ink: STATUS.warn, glyph: "◐" },
  info: { ink: "#737373", glyph: "○" },
  ok: { ink: STATUS.live, glyph: "●" },
  off: { ink: "#a3a3a3", glyph: "·" },
} as const;

export type Severity = keyof typeof SEVERITY;
