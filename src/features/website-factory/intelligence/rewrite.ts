import type { Business } from "../types";

function tighten(value: string) {
  return value
    .replace(/\s+/g, " ")
    .replace(/\b(very|really|just|simply|amazing|best-in-class)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function rewriteBusinessCopy(business: Business): Business {
  return {
    ...business,
    tagline: tighten(business.tagline),
    description: tighten(business.description),
    prospectLabel: tighten(business.prospectLabel),
    services: business.services.map((item) => ({
      ...item,
      description: tighten(item.description),
    })),
    reviews: business.reviews.map((item) => ({
      ...item,
      quote: tighten(item.quote),
    })),
  };
}
