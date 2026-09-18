import type { WebsiteTemplate } from "../types";
import { TEMPLATE_DEFS } from "./index";

function seed(
  id: string,
  slug: string,
  key: keyof typeof TEMPLATE_DEFS,
  description: string,
): WebsiteTemplate {
  const def = TEMPLATE_DEFS[key];
  return {
    id,
    slug,
    name: def.name,
    industry: def.industry,
    description,
    thumbnailUrl: "",
    version: 1,
    definitionKey: key,
    pagesCount: def.pages.length,
    configuration: {},
    duplicatedFrom: null,
    active: true,
  };
}

export const SEEDED_TEMPLATES: WebsiteTemplate[] = [
  seed(
    "11111111-1111-4111-8111-111111111111",
    "roofing-premium",
    "roofing",
    "Multi-page site for roofing and exterior trades. Home, about, services, projects, and contact.",
  ),
  seed(
    "22222222-2222-4222-8222-222222222222",
    "professional-services",
    "professional",
    "Calm, type-led layout for accountants, consultants, and practices.",
  ),
  seed(
    "33333333-3333-4333-8333-333333333333",
    "restaurant",
    "restaurant",
    "Menu, atmosphere, and booking-led site for restaurants and cafes.",
  ),
  seed(
    "44444444-4444-4444-8444-444444444444",
    "construction",
    "construction",
    "Programme-led site for builders and contractors.",
  ),
  seed(
    "55555555-5555-4555-8555-555555555555",
    "dental",
    "dental",
    "Calm practice site for dentists and clinics.",
  ),
  seed(
    "66666666-6666-4666-8666-666666666666",
    "landscaping",
    "landscaping",
    "Garden and grounds site with work you can photograph.",
  ),
  seed(
    "77777777-7777-4777-8777-777777777777",
    "salon-spa",
    "salon",
    "Booking-first salon and spa with treatments, team, and gallery.",
  ),
  seed(
    "88888888-8888-4888-8888-888888888888",
    "law-firm",
    "law",
    "Chambers-style site for solicitors and practice areas.",
  ),
  seed(
    "99999999-9999-4999-8999-999999999999",
    "fitness-studio",
    "fitness",
    "Classes, coaches, and membership for studios and gyms.",
  ),
  seed(
    "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    "electrician",
    "electrician",
    "Local trade site with services, areas, and quote form.",
  ),
];
