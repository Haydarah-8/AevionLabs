export function parseHex(hex?: string) {
  const raw = (hex || "#111111").replace("#", "");
  if (raw.length < 6) {
    return { hex: "#111111", r: 17, g: 17, b: 17, luminance: 0.07 };
  }
  const r = parseInt(raw.slice(0, 2), 16);
  const g = parseInt(raw.slice(2, 4), 16);
  const b = parseInt(raw.slice(4, 6), 16);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return { hex: `#${raw}`, r, g, b, luminance };
}

/** Accent on white or stone. Near-black and near-white both become ink. */
export function topicPageAccent(hex?: string) {
  const { hex: value, luminance } = parseHex(hex);
  if (luminance < 0.18 || luminance > 0.82) return "#111111";
  return value;
}

/** Accent on the black hero. Dark marks lighten so the pip stays visible. */
export function topicHeroAccent(hex?: string) {
  const { hex: value, luminance } = parseHex(hex);
  if (luminance < 0.18) return "#e8e8e8";
  return value;
}
